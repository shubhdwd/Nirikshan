import React, { useState, useEffect, useCallback, useRef } from "react";
import { LocateFixed, Loader2, AlertCircle, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// Fix default Leaflet marker assets when bundled with webpack/craco
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER = { lat: 19.076, lng: 72.8777 }; // Mumbai default
const DEFAULT_ZOOM = 13;

function createCustomPin(color = "#008080") {
    return L.divIcon({
        className: "custom-map-pin",
        html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
}

export default function LocationMap({
    onLocationChange,
    height = "h-64",
    showLabel = true,
    className = "",
    markers = [],
    zoom = DEFAULT_ZOOM,
    latitude = null,
    longitude = null,
    interactive = true,
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const zoneMarkersRef = useRef([]);

    const [position, setPosition] = useState(
        latitude && longitude ? { lat: latitude, lng: longitude } : null
    );
    const [status, setStatus] = useState("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const initialLat = latitude || position?.lat || DEFAULT_CENTER.lat;
        const initialLng = longitude || position?.lng || DEFAULT_CENTER.lng;

        const map = L.map(mapContainerRef.current, {
            center: [initialLat, initialLng],
            zoom: zoom,
            zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle Map Click to Pin Location
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !interactive) return;

        const handleMapClick = (e) => {
            const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
            setPosition(newPos);
            setStatus("success");
            if (onLocationChange) {
                onLocationChange({
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                });
            }
        };

        map.on("click", handleMapClick);
        return () => {
            map.off("click", handleMapClick);
        };
    }, [interactive, onLocationChange]);

    // Sync Active User Pin
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const activePos = latitude && longitude ? { lat: latitude, lng: longitude } : position;

        if (activePos) {
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng([activePos.lat, activePos.lng]);
            } else {
                userMarkerRef.current = L.marker([activePos.lat, activePos.lng], {
                    icon: createCustomPin("#e11d48"),
                    draggable: interactive,
                }).addTo(map);

                if (interactive) {
                    userMarkerRef.current.on("dragend", (event) => {
                        const marker = event.target;
                        const pos = marker.getLatLng();
                        setPosition({ lat: pos.lat, lng: pos.lng });
                        setStatus("success");
                        if (onLocationChange) {
                            onLocationChange({ latitude: pos.lat, longitude: pos.lng });
                        }
                    });
                }
            }
        }
    }, [position, latitude, longitude, interactive, onLocationChange]);

    // Handle incoming external markers (e.g. for Analysis.jsx)
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear previous markers
        zoneMarkersRef.current.forEach((m) => map.removeLayer(m));
        zoneMarkersRef.current = [];

        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds([]);
            markers.forEach((m) => {
                if (Array.isArray(m.position) && m.position.length === 2) {
                    const marker = L.marker(m.position, {
                        icon: createCustomPin("#0284c7"),
                    }).addTo(map);

                    if (m.label) {
                        marker.bindPopup(`<div style="font-size:12px; font-weight:600;">${m.label}</div>`);
                    }
                    zoneMarkersRef.current.push(marker);
                    bounds.extend(m.position);
                }
            });

            if (bounds.isValid() && !position) {
                map.fitBounds(bounds, { padding: [30, 30] });
            }
        }
    }, [markers, position]);

    // Geolocation trigger
    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setStatus("error");
            setErrorMsg("Geolocation not supported");
            return;
        }
        setStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(coords);
                setStatus("success");

                const map = mapInstanceRef.current;
                if (map) {
                    map.flyTo([coords.lat, coords.lng], 15, { animate: true });
                }

                if (onLocationChange) {
                    onLocationChange({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                    });
                }
            },
            (err) => {
                setStatus("error");
                setErrorMsg(
                    err.code === 1
                        ? "Location permission denied"
                        : err.code === 2
                          ? "Location unavailable"
                          : "Location request timed out"
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    }, [onLocationChange]);

    // Initial load try geolocation if no position set
    useEffect(() => {
        if (!latitude && !longitude && !position) {
            requestLocation();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const linkUrl = `https://www.openstreetmap.org/?mlat=${position?.lat || DEFAULT_CENTER.lat}&mlon=${position?.lng || DEFAULT_CENTER.lng}#map=${zoom}/${position?.lat || DEFAULT_CENTER.lat}/${position?.lng || DEFAULT_CENTER.lng}`;

    return (
        <div className={cn("rounded-xl border border-border overflow-hidden relative shadow-sm", className)}>
            <div className={cn("relative w-full z-0", height)}>
                <div ref={mapContainerRef} className="h-full w-full bg-accent/20" />

                {/* Top overlay hint for interactive map */}
                {interactive && (
                    <div className="absolute top-2 left-2 z-[400] pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-card/90 backdrop-blur border border-border text-foreground shadow-sm">
                            <MapPin className="h-3 w-3 text-primary" /> Click on map to place pin
                        </span>
                    </div>
                )}

                {/* Bottom Overlay controls */}
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between z-[400] pointer-events-none">
                    {showLabel && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-card/95 backdrop-blur border border-border text-muted pointer-events-auto shadow-sm">
                            {status === "success" && "Location selected"}
                            {status === "loading" && (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                    Detecting location...
                                </>
                            )}
                            {status === "error" && (
                                <>
                                    <AlertCircle className="h-3 w-3 text-emergency" />
                                    {errorMsg}
                                </>
                            )}
                            {status === "idle" && "Map Ready"}
                        </span>
                    )}
                    <div className="flex items-center gap-2">
                        <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pointer-events-auto inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-card/95 backdrop-blur border border-border text-muted hover:bg-accent hover:text-foreground transition-colors shadow-sm"
                        >
                            Open in Maps
                        </a>
                        {interactive && (
                            <button
                                type="button"
                                onClick={requestLocation}
                                disabled={status === "loading"}
                                className="pointer-events-auto inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-full bg-card/95 backdrop-blur border border-border text-muted hover:bg-accent hover:text-foreground transition-colors shadow-sm disabled:opacity-50"
                            >
                                {status === "loading" ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <LocateFixed className="h-3 w-3 text-primary" />
                                )}
                                {position ? "Recenter" : "Locate me"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
