import os
import logging
import socket
import subprocess
import time
import asyncio
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

NODE_ROOT = Path('/app/backend')


def _node_port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def _ensure_node_backend() -> None:
    target = os.environ.get('NODE_API_URL', 'http://127.0.0.1:4000')
    port = int(target.rsplit(':', 1)[-1])
    if _node_port_open('127.0.0.1', port):
        return
    log_file = open('/var/log/nirikshan-node.log', 'ab')
    subprocess.Popen(
        ['node', 'dist/server.js'],
        cwd=str(NODE_ROOT),
        stdout=log_file,
        stderr=subprocess.STDOUT,
        env={**os.environ, 'NODE_ENV': 'production', 'PORT': str(port)},
        start_new_session=True,
    )
    for _ in range(30):
        if _node_port_open('127.0.0.1', port):
            return
        time.sleep(0.5)


_ensure_node_backend()

app = FastAPI()

_http_client: httpx.AsyncClient | None = None


async def _get_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=30.0)
    return _http_client


@app.on_event('shutdown')
async def _shutdown_client():
    global _http_client
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()


@app.api_route('/api/{path:path}', methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])
async def node_api_proxy(path: str, request: Request):
    target = f"{os.environ.get('NODE_API_URL')}/api/{path}"
    body = await request.body()

    headers = {
        k: v for k, v in request.headers.items()
        if k.lower() in {'authorization', 'content-type', 'accept'}
    }

    xff = request.headers.get('x-forwarded-for')
    client_ip = request.client.host if request.client else None
    if client_ip and client_ip not in ('127.0.0.1', '::1'):
        headers['x-forwarded-for'] = client_ip
    elif xff:
        headers['x-forwarded-for'] = xff.split(',')[0].strip()

    try:
        client = await _get_client()
        upstream = await client.request(
            request.method,
            target,
            params=dict(request.query_params),
            content=body,
            headers=headers,
        )
        response_headers = {
            'content-type': upstream.headers.get('content-type', 'application/json'),
        }
        return Response(content=upstream.content, status_code=upstream.status_code, headers=response_headers)
    except httpx.RequestError:
        return Response(
            content='{"error":"Node API unavailable"}',
            status_code=503,
            media_type='application/json',
        )


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '').split(',') if os.environ.get('CORS_ORIGINS') else [],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
