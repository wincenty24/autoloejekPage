import assert from 'node:assert/strict';
import test from 'node:test';
import { andromedaReferences, meters, modularMeterReferences } from '../public/meter-configurator/catalog.mjs';
import { evaluateMeter, flowSummary, hasDocumentedReedPulse, nextStep, selectMeters, toLitresPerMinute } from '../public/meter-configurator/selection.mjs';

test('compares the highest measured flow to Q3 and keeps Q4 out of continuous sizing', () => {
  const readings = flowSummary([
    { mode: 'bucket', volume: '20', seconds: '27' },
    { mode: 'direct', flow: '32,5' },
  ]);
  assert.equal(readings.max, 1200 / 27);
  assert.equal(readings.min, 32.5);

  const meter = meters.find(item => item.q3 === 4);
  const q3 = toLitresPerMinute(meter.q3);
  const preferredLimit = q3 * (meter.preferredUse ?? 0.7);
  assert.equal(evaluateMeter(meter, { max: preferredLimit }).status, 'preferred');
  assert.equal(evaluateMeter(meter, { max: q3 }).status, 'acceptable');
  assert.equal(evaluateMeter(meter, { max: q3 + 1 }).status, 'rejected');
});

test('keeps catalogue reference models out of automated recommendations', () => {
  const references = new Set([...andromedaReferences, ...modularMeterReferences]);
  const results = selectMeters({ max: 32, min: 20 });
  assert.ok(results.length > 0);
  assert.ok(results.every(({ meter }) => !references.has(meter)));
  assert.ok(meters.every(meter => hasDocumentedReedPulse(meter.pulse)));
});

test('checks pulse weight in both units and routes faulty meters to replacement', () => {
  for (const litres of [0.25, 0.5, 1, 10]) {
    assert.equal(hasDocumentedReedPulse({ signal: 'reed', litres }), true);
  }
  for (const litres of [0, 0.4, 2.5, Infinity]) {
    assert.equal(hasDocumentedReedPulse({ signal: 'reed', litres }), false);
  }
  assert.equal(nextStep('existing', { condition: 'no', hasPulse: 'yes' }), 'source');
  assert.equal(nextStep('existing', { condition: 'yes', sized: 'yes', hasPulse: 'no' }), 'existingResult');
});
