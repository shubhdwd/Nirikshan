import { Router } from 'express';
import { z } from 'zod';
import { admin } from './supabase.js';
import { requireAuth, requireRole } from './auth.js';
import { sanitizeError } from './sanitize-error.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('admin'));

// Helper to validate and parse time windows
const querySchema = z.object({
  window_days: z.coerce.number().int().positive().default(90),
  comparison_window_days: z.coerce.number().int().positive().default(90),
  cell_size: z.coerce.number().positive().default(0.05), // ~5.5km
});

/**
 * FEATURE 5: BASELINE-NORMALIZED VULNERABILITY DETECTION
 */
router.get('/vulnerability-baseline', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { window_days, comparison_window_days, cell_size } = input.data;

  // Calculate current period observations
  const currentStart = new Date();
  currentStart.setDate(currentStart.getDate() - window_days);

  // Calculate historical baseline period observations
  const historyStart = new Date(currentStart);
  historyStart.setDate(historyStart.getDate() - comparison_window_days);

  const { data: cases, error } = await admin
    .from('cases')
    .select('latitude,longitude,created_at')
    .gte('created_at', historyStart.toISOString());
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const areas = new Map<string, { current: number; historical: number }>();

  for (const c of cases ?? []) {
    const latIdx = Math.floor(c.latitude / cell_size);
    const lonIdx = Math.floor(c.longitude / cell_size);
    const key = `${latIdx},${lonIdx}`;
    
    if (!areas.has(key)) areas.set(key, { current: 0, historical: 0 });
    const stats = areas.get(key)!;
    
    if (new Date(c.created_at) >= currentStart) {
      stats.current++;
    } else {
      stats.historical++;
    }
  }

  const results = Array.from(areas.entries()).map(([key, stats]) => {
    const [latIdx, lonIdx] = key.split(',').map(Number);
    // Baseline is historical count normalized to the current window size
    const normalizedBaseline = (stats.historical / comparison_window_days) * window_days;
    // Avoid division by zero
    const safeBaseline = Math.max(normalizedBaseline, 1);
    const deviation = stats.current - normalizedBaseline;
    const indicator = deviation > 0 ? deviation / safeBaseline : 0;
    
    return {
      area_center_latitude: (latIdx + 0.5) * cell_size,
      area_center_longitude: (lonIdx + 0.5) * cell_size,
      historical_baseline: normalizedBaseline,
      current_observation_count: stats.current,
      deviation,
      normalized_indicator: indicator,
      time_window_days: window_days
    };
  });

  res.json(results);
});

/**
 * FEATURE 6: SPATIO-TEMPORAL PATTERN DETECTION
 */
router.get('/spatiotemporal-patterns', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { window_days, cell_size } = input.data;

  const start = new Date();
  start.setDate(start.getDate() - window_days);

  const { data, error } = await admin
    .from('cases')
    .select('latitude,longitude,created_at,case_assistance(assistance_type)')
    .gte('created_at', start.toISOString());
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const patterns = new Map<string, { count: number; types: Map<string, number>; hours: Map<number, number> }>();

  for (const c of data ?? []) {
    const latIdx = Math.floor(c.latitude / cell_size);
    const lonIdx = Math.floor(c.longitude / cell_size);
    const key = `${latIdx},${lonIdx}`;
    
    if (!patterns.has(key)) {
      patterns.set(key, { count: 0, types: new Map(), hours: new Map() });
    }
    const p = patterns.get(key)!;
    p.count++;
    
    const hour = new Date(c.created_at).getHours();
    p.hours.set(hour, (p.hours.get(hour) || 0) + 1);
    
    for (const assist of c.case_assistance) {
      p.types.set(assist.assistance_type, (p.types.get(assist.assistance_type) || 0) + 1);
    }
  }

  const results = Array.from(patterns.entries())
    .filter(([_, p]) => p.count >= 3) // Only return areas with recurring activity (>= 3)
    .map(([key, p]) => {
      const [latIdx, lonIdx] = key.split(',').map(Number);
      
      let dominantHour = -1;
      let maxHourCount = 0;
      for (const [hour, count] of p.hours.entries()) {
        if (count > maxHourCount) { maxHourCount = count; dominantHour = hour; }
      }
      
      let dominantType = '';
      let maxTypeCount = 0;
      for (const [type, count] of p.types.entries()) {
        if (count > maxTypeCount) { maxTypeCount = count; dominantType = type; }
      }
      
      return {
        area_center_latitude: (latIdx + 0.5) * cell_size,
        area_center_longitude: (lonIdx + 0.5) * cell_size,
        total_recurrence: p.count,
        recurring_concern_type: dominantType,
        recurring_time_window_hour: dominantHour,
        pattern_detected: true
      };
    });

  res.json(results);
});

/**
 * FEATURE 7: INDEPENDENT CORROBORATION ENGINE
 */
router.get('/corroboration', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { window_days, cell_size } = input.data;

  const start = new Date();
  start.setDate(start.getDate() - window_days);

  const { data, error } = await admin
    .from('cases')
    .select('latitude,longitude,reported_by')
    .gte('created_at', start.toISOString());
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const areas = new Map<string, { reporters: Set<string>; total_observations: number }>();

  for (const c of data ?? []) {
    const latIdx = Math.floor(c.latitude / cell_size);
    const lonIdx = Math.floor(c.longitude / cell_size);
    const key = `${latIdx},${lonIdx}`;
    
    if (!areas.has(key)) areas.set(key, { reporters: new Set(), total_observations: 0 });
    const stats = areas.get(key)!;
    
    stats.total_observations++;
    stats.reporters.add(c.reported_by);
  }

  const results = Array.from(areas.entries()).map(([key, stats]) => {
    const [latIdx, lonIdx] = key.split(',').map(Number);
    const uniqueReporters = stats.reporters.size;
    const repeated = stats.total_observations - uniqueReporters;
    // Confidence is higher when many independent reporters submit
    const confidence = uniqueReporters >= 3 ? 'HIGH' : uniqueReporters === 2 ? 'MEDIUM' : 'LOW';
    
    return {
      area_center_latitude: (latIdx + 0.5) * cell_size,
      area_center_longitude: (lonIdx + 0.5) * cell_size,
      total_observations: stats.total_observations,
      unique_reporters: uniqueReporters,
      repeated_reports_from_same: repeated,
      independent_corroboration_count: uniqueReporters,
      corroboration_indicator: confidence
    };
  });

  res.json(results);
});

/**
 * FEATURE 8: VULNERABILITY & CONFIDENCE MAPPING
 */
router.get('/vulnerability-map', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { window_days, cell_size } = input.data;

  const start = new Date();
  start.setDate(start.getDate() - window_days);

  const { data, error } = await admin
    .from('cases')
    .select('latitude,longitude,reported_by,status,case_evidence(id)')
    .gte('created_at', start.toISOString());
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const areas = new Map<string, { reporters: Set<string>; total: number; evidence: number; verified: number }>();

  for (const c of data ?? []) {
    const latIdx = Math.floor(c.latitude / cell_size);
    const lonIdx = Math.floor(c.longitude / cell_size);
    const key = `${latIdx},${lonIdx}`;
    
    if (!areas.has(key)) areas.set(key, { reporters: new Set(), total: 0, evidence: 0, verified: 0 });
    const stats = areas.get(key)!;
    
    stats.total++;
    stats.reporters.add(c.reported_by);
    if (c.case_evidence && c.case_evidence.length > 0) stats.evidence++;
    if (['VERIFIED', 'ORG_PENDING', 'INTERVENTION', 'FOLLOW_UP', 'CLOSED'].includes(c.status)) stats.verified++;
  }

  const results = Array.from(areas.entries()).map(([key, stats]) => {
    const [latIdx, lonIdx] = key.split(',').map(Number);
    
    // Vulnerability indicator based on total observation volume
    let vuln = 'LOW';
    if (stats.total >= 10) vuln = 'HIGH';
    else if (stats.total >= 4) vuln = 'MEDIUM';
    
    // Confidence indicator based on independent reporters + evidence + verified status
    let conf = 'LOW';
    const score = stats.reporters.size + (stats.evidence * 2) + (stats.verified * 3);
    if (score >= 10) conf = 'HIGH';
    else if (score >= 5) conf = 'MEDIUM';
    
    return {
      area_center_latitude: (latIdx + 0.5) * cell_size,
      area_center_longitude: (lonIdx + 0.5) * cell_size,
      vulnerability_indicator: vuln,
      evidence_confidence: conf,
      observation_count: stats.total,
      time_window_days: window_days
    };
  });

  res.json(results);
});

/**
 * FEATURE 9: OBSERVATION BLIND-SPOT DETECTION
 */
router.get('/blind-spots', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { window_days, cell_size } = input.data;

  // Find all areas that historically had activity but are now silent, or have extremely low density
  const currentStart = new Date();
  currentStart.setDate(currentStart.getDate() - window_days);

  // We look back longer to find known areas
  const historyStart = new Date(currentStart);
  historyStart.setDate(historyStart.getDate() - (window_days * 3));

  const { data, error } = await admin
    .from('cases')
    .select('latitude,longitude,created_at')
    .gte('created_at', historyStart.toISOString());
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const areas = new Map<string, { current: number; historical: number }>();

  for (const c of data ?? []) {
    const latIdx = Math.floor(c.latitude / cell_size);
    const lonIdx = Math.floor(c.longitude / cell_size);
    const key = `${latIdx},${lonIdx}`;
    
    if (!areas.has(key)) areas.set(key, { current: 0, historical: 0 });
    const stats = areas.get(key)!;
    
    if (new Date(c.created_at) >= currentStart) {
      stats.current++;
    } else {
      stats.historical++;
    }
  }

  const results = Array.from(areas.entries())
    .filter(([_, stats]) => stats.historical > 5 && stats.current < 2) // High historical activity, sudden drop
    .map(([key, stats]) => {
      const [latIdx, lonIdx] = key.split(',').map(Number);
      return {
        area_center_latitude: (latIdx + 0.5) * cell_size,
        area_center_longitude: (lonIdx + 0.5) * cell_size,
        status: 'INSUFFICIENT EVIDENCE',
        historical_reporting_coverage: stats.historical,
        recent_observation_coverage: stats.current,
        note: 'Significant drop in reporting density compared to historical baseline. May indicate a blind spot.'
      };
    });

  res.json(results);
});

/**
 * FEATURE 10: RESPONSE TIME ANALYSIS
 */
router.get('/response-times', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { window_days } = input.data;

  const start = new Date();
  start.setDate(start.getDate() - window_days);

  const { data, error } = await admin
    .from('cases')
    .select('id,created_at,case_assignments(assistance_type,offered_at,responded_at),case_status_history(status,created_at)')
    .gte('created_at', start.toISOString());
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  let pcrnAcceptTotalMs = 0;
  let pcrnAcceptCount = 0;
  
  let pcrnVerifyTotalMs = 0;
  let pcrnVerifyCount = 0;

  let orgAcceptTotalMs = 0;
  let orgAcceptCount = 0;

  for (const c of data ?? []) {
    const createdTime = new Date(c.created_at).getTime();
    
    for (const a of c.case_assignments) {
      if (a.responded_at) {
        const diff = new Date(a.responded_at).getTime() - new Date(a.offered_at).getTime();
        if (a.assistance_type === 'PCRN') {
          pcrnAcceptTotalMs += diff;
          pcrnAcceptCount++;
        } else {
          orgAcceptTotalMs += diff;
          orgAcceptCount++;
        }
      }
    }

    const verifyEvent = c.case_status_history.find((h: any) => h.status === 'VERIFIED' || h.status === 'NOT_VERIFIED');
    if (verifyEvent) {
      // Time from creation to verification
      pcrnVerifyTotalMs += (new Date(verifyEvent.created_at).getTime() - createdTime);
      pcrnVerifyCount++;
    }
  }

  res.json({
    avg_pcrn_acceptance_time_minutes: pcrnAcceptCount ? Math.round((pcrnAcceptTotalMs / pcrnAcceptCount) / 60000) : null,
    avg_org_acceptance_time_minutes: orgAcceptCount ? Math.round((orgAcceptTotalMs / orgAcceptCount) / 60000) : null,
    avg_verification_response_time_minutes: pcrnVerifyCount ? Math.round((pcrnVerifyTotalMs / pcrnVerifyCount) / 60000) : null,
    sample_size: data?.length ?? 0
  });
});

/**
 * FEATURE 11: INTERVENTION EFFECTIVENESS ANALYSIS
 */
router.get('/intervention-effectiveness', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { cell_size } = input.data;

  // We find cases that had interventions recently and compare the areas
  const { data: interventions, error: intErr } = await admin
    .from('case_interventions')
    .select('case_id,created_at,cases(latitude,longitude)')
    .limit(500);
  
  if (intErr) return res.status(400).json({ error: sanitizeError(intErr) });

  const results = [];
  
  // We'll analyze a sample of up to 10 recent interventions
  for (const inv of interventions.slice(0, 10)) {
    if (!inv.cases) continue;
    const c = Array.isArray(inv.cases) ? inv.cases[0] : inv.cases;
    if (!c) continue;
    const lat = (c as any).latitude;
    const lon = (c as any).longitude;
    const invTime = new Date(inv.created_at);
    
    // Look 30 days before and 30 days after
    const beforeStart = new Date(invTime); beforeStart.setDate(beforeStart.getDate() - 30);
    const afterEnd = new Date(invTime); afterEnd.setDate(afterEnd.getDate() + 30);
    
    // Find cases in the same cell
    const latMin = Math.floor(lat / cell_size) * cell_size;
    const latMax = latMin + cell_size;
    const lonMin = Math.floor(lon / cell_size) * cell_size;
    const lonMax = lonMin + cell_size;
    
    const { data: beforeAfter } = await admin
      .from('cases')
      .select('created_at')
      .gte('latitude', latMin).lt('latitude', latMax)
      .gte('longitude', lonMin).lt('longitude', lonMax)
      .gte('created_at', beforeStart.toISOString())
      .lt('created_at', afterEnd.toISOString());
      
    let beforeCount = 0;
    let afterCount = 0;
    
    for (const c of beforeAfter ?? []) {
      if (new Date(c.created_at) < invTime) beforeCount++;
      else afterCount++;
    }
    
    let change = 'no significant change';
    if (afterCount < beforeCount - 2) change = 'decreased';
    else if (afterCount > beforeCount + 2) change = 'increased';
    
    results.push({
      intervention_case_id: inv.case_id,
      intervention_time: inv.created_at,
      area_center_latitude: latMin + (cell_size / 2),
      area_center_longitude: lonMin + (cell_size / 2),
      observations_before: beforeCount,
      observations_after: afterCount,
      associated_change: change
    });
  }

  res.json(results);
});

/**
 * FEATURE 12: INTERVENTION DISPLACEMENT ANALYSIS
 */
router.get('/intervention-displacement', async (req, res) => {
  const input = querySchema.safeParse(req.query);
  if (!input.success) return res.status(400).json({ error: 'Invalid parameters' });
  const { cell_size } = input.data;

  // Same concept as 11, but we look at adjacent cells
  const { data: interventions, error: intErr } = await admin
    .from('case_interventions')
    .select('case_id,created_at,cases(latitude,longitude)')
    .limit(500);
  
  if (intErr) return res.status(400).json({ error: sanitizeError(intErr) });

  const results = [];
  
  for (const inv of interventions.slice(0, 5)) { // Limit to 5 for performance
    if (!inv.cases) continue;
    const c = Array.isArray(inv.cases) ? inv.cases[0] : inv.cases;
    if (!c) continue;
    const latIdx = Math.floor((c as any).latitude / cell_size);
    const lonIdx = Math.floor((c as any).longitude / cell_size);
    const invTime = new Date(inv.created_at);
    
    const beforeStart = new Date(invTime); beforeStart.setDate(beforeStart.getDate() - 30);
    const afterEnd = new Date(invTime); afterEnd.setDate(afterEnd.getDate() + 30);
    
    // Get all cases in a 3x3 grid around the intervention
    const latMin = (latIdx - 1) * cell_size;
    const latMax = (latIdx + 2) * cell_size;
    const lonMin = (lonIdx - 1) * cell_size;
    const lonMax = (lonIdx + 2) * cell_size;
    
    const { data: areaCases } = await admin
      .from('cases')
      .select('latitude,longitude,created_at')
      .gte('latitude', latMin).lt('latitude', latMax)
      .gte('longitude', lonMin).lt('longitude', lonMax)
      .gte('created_at', beforeStart.toISOString())
      .lt('created_at', afterEnd.toISOString());
      
    let targetBefore = 0, targetAfter = 0;
    let adjacentBefore = 0, adjacentAfter = 0;
    
    for (const c of areaCases ?? []) {
      const isTarget = Math.floor(c.latitude / cell_size) === latIdx && Math.floor(c.longitude / cell_size) === lonIdx;
      const isBefore = new Date(c.created_at) < invTime;
      
      if (isTarget) {
        if (isBefore) targetBefore++; else targetAfter++;
      } else {
        if (isBefore) adjacentBefore++; else adjacentAfter++;
      }
    }
    
    // Displacement logic: Target goes down, but adjacent goes up
    let possibleDisplacement = false;
    if (targetAfter < targetBefore && adjacentAfter > adjacentBefore) {
      possibleDisplacement = true;
    }
    
    results.push({
      intervention_case_id: inv.case_id,
      intervention_area_change: targetAfter - targetBefore,
      nearby_area_change: adjacentAfter - adjacentBefore,
      possible_displacement_indicator: possibleDisplacement,
      note: 'Analysis of intervention area vs surrounding 3x3 grid cells.'
    });
  }

  res.json(results);
});

export default router;
