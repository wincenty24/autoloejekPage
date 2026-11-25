import { meters, retrofitReferences } from './catalog.mjs';

export const defaultPreferredUse = 0.7;
export const toLitresPerMinute = flow => flow * 1000 / 60;
export const toCubicMetresPerHour = flow => flow * 60 / 1000;

export function number(value) {
  const text = String(value ?? '').trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function measuredFlow(row) {
  if (row.mode === 'direct') return number(row.flow);
  if (row.mode !== 'bucket') return null;
  const volume = number(row.volume);
  const seconds = number(row.seconds);
  if (volume === null || seconds === null) return null;
  const flow = volume * 60 / seconds;
  return Number.isFinite(flow) && flow > 0 ? flow : null;
}

export function flowSummary(rows) {
  const flows = rows.map(measuredFlow);
  if (!flows.length || flows.includes(null)) return null;
  return {
    min: Math.min(...flows),
    max: Math.max(...flows),
    mean: flows.reduce((sum, flow) => sum + flow / flows.length, 0),
  };
}

const normalize = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9+]/g, '');

export function existingMeter({ manufacturer, model, condition, sized, existingQ3, reedConfirmed, hasPulse }) {
  if (condition === 'no' || sized === 'no') return { status: 'replace' };
  if (hasPulse === 'yes') return { status: 'installed' };
  const sameManufacturer = item => normalize(item.manufacturer) === normalize(manufacturer)
    || (item.manufacturer === 'Apator' && normalize(manufacturer) === 'apatorpowogaz');
  const exactModel = candidate => normalize(candidate) === normalize(model);
  const matching = meters.filter(item => sameManufacturer(item) && exactModel(item.model));
  const meter = number(existingQ3) === null
    ? (matching.length === 1 ? matching[0] : null)
    : matching.find(item => item.q3 === number(existingQ3));
  const reference = retrofitReferences.find(item => sameManufacturer(item) && item.models.some(exactModel));
  if (hasPulse !== 'no' || condition !== 'yes' || sized !== 'yes') return { status: 'verify', meter, reference };
  if (reference?.pulse.retrofit && hasDocumentedReedPulse(reference.pulse) && reedConfirmed === 'yes') return { status: 'retrofit', meter: reference };
  if (meter?.pulse === false) return { status: 'replace' };
  if (meter?.pulse.retrofit && hasDocumentedReedPulse(meter.pulse) && !meter.pulse.madeToOrder) {
    return { status: 'retrofit', meter };
  }
  return { status: 'verify', meter, reference };
}

export function hasDocumentedReedPulse(pulse) {
  return pulse?.signal === 'reed' && Number.isFinite(pulse.litres) && pulse.litres > 0
    && (Number.isInteger(pulse.litres) || Number.isInteger(1 / pulse.litres));
}

export function pressureLoss(flow, components) {
  const losses = components.map(component => {
    if (component.pressureCurve) {
      const points = component.pressureCurve;
      const index = points.findIndex(([rate]) => rate >= flow);
      if (index < 0) return null;
      const [upper, loss] = points[index];
      if (upper === flow) return loss;
      if (index === 0) return null;
      const [lower, base] = points[index - 1];
      return base + (loss - base) * (flow - lower) / (upper - lower);
    }
    return component.kv > 0 ? (flow / component.kv) ** 2 : null;
  });
  return {
    meter: losses[0] ?? null,
    total: losses.length && losses.every(loss => Number.isFinite(loss))
      ? losses.reduce((sum, loss) => sum + loss, 0) : null,
  };
}

export function evaluateMeter(meter, { max, min, position, pressure, temperature }) {
  const q3 = toLitresPerMinute(meter.q3);
  const usage = max / q3;
  const preferred = meter.preferredUse ?? defaultPreferredUse;
  const range = meter.ranges.find(range => range.position === position)
    ?? (position ? null : meter.ranges.reduce((worst, range) => !worst || range.q1 > worst.q1 ? range : worst, null));
  const q1 = range && toLitresPerMinute(range.q1);
  const q2 = range && toLitresPerMinute(range.q2);
  const lowerRange = !range || min == null ? 'unknown' : min < q1 ? 'belowQ1' : min < q2 ? 'belowQ2' : 'aboveQ2';
  const conditions = (!position || !!range)
    && (pressure == null || meter.map == null || pressure <= meter.map)
    && (temperature == null || (meter.temperature != null
      && temperature >= meter.temperature[0] && temperature <= meter.temperature[1]));
  const status = max > q3 || lowerRange === 'belowQ1' || !conditions
    ? 'rejected' : max <= q3 * preferred ? 'preferred' : 'acceptable';
  return { meter, q3, q1, q2, usage, preferred, lowerRange, status, reserve: q3 - max };
}

export function selectMeters(input, catalog = meters) {
  const rank = { preferred: 0, acceptable: 1 };
  return catalog.map(meter => evaluateMeter(meter, input))
    .filter(result => result.status !== 'rejected')
    .sort((a, b) => rank[a.status] - rank[b.status]
      || Number(a.lowerRange === 'belowQ2') - Number(b.lowerRange === 'belowQ2')
      || a.q3 - b.q3);
}

export function nextStep(step, answers) {
  switch (step) {
    case 'start': return answers.hasMeter === 'yes' ? 'existing' : 'source';
    case 'existing': return existingMeter(answers).status === 'replace' ? 'source' : 'existingResult';
    case 'existingResult': return 'source';
    case 'source': return answers.source === 'pump' ? 'pump' : 'measure';
    case 'pump': return 'measure';
    case 'measure': return 'target';
    case 'target': return 'installation';
    case 'installation': return 'result';
    default: return null;
  }
}
