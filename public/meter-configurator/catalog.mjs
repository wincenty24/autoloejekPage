// Flows in m³/h, pressure in bar, length in mm. Null means unverified.
const apator = {
  manufacturer: 'Apator',
  map: 16,
  temperature: [0.1, 30],
  preferredUse: 0.60,
  preferredMinimumUse: 0.45,
  selectionDocumentation: 'https://www.apator.com/sites/default/files/js-dn-15-40-instrukcja-obslugi.pdf#page=9',
  kv: null,
  pressureCurve: null,
  maxPressureLoss: 0.63,
  price: null,
  pulse: { model: 'NK (IP65)', litres: 10, signal: 'reed', retrofit: false },
  documentation: 'https://www.apator.com/sites/default/files/js-nk-karta-katalogowa.pdf',
};

const apatorOneLitre = { ...apator.pulse, litres: 1, madeToOrder: true };

const bmeters = {
  ...apator,
  manufacturer: 'B-Meters',
  preferredUse: null,
  preferredMinimumUse: null,
  selectionDocumentation: null,
  model: 'GSD8-R',
  temperature: [0.1, 50],
  maxPressureLoss: null,
  pulse: { model: 'REED', litres: 1, signal: 'reed', retrofit: false },
  documentation: 'https://bmeters.pl/wp-content/uploads/2025/05/GSD8-R_karta_produktowa_A4_13_07_2026.pdf',
};

const gsd5 = {
  ...bmeters,
  model: 'GSD5-R',
  pulse: { ...bmeters.pulse, litres: 10 },
  documentation: 'https://bmeters.pl/wp-content/uploads/2025/05/GSD5-R_karta_produktowa_A4_13_07_2026.pdf',
};

const bmetersArchive = 'https://www.aqua.net.pl/system/default/content/public/katalog_produktow-915dbefec0f77ffb6c3a07e3948a14f0.pdf';
const bmetersPulseCatalogue = 'https://www.bmeters.com/wp-content/uploads/2022/02/Catalogo_v22.1_10_10_22.pdf';
const bmetersReed = {
  ...bmeters,
  availabilityUnverified: true,
  pulse: { ...bmeters.pulse, madeToOrder: true },
};

const cprPulseMeters = [[0.1, 50], [30, 90]].flatMap(temperature => [
  { ...bmetersReed, temperature, dn: 15, q3: 2.5, q4: 3.12, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...bmetersReed, temperature, dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 130 },
].map(meter => ({
  ...meter, model: 'CPR-RP-R', ratios: [100, 100], documentation: bmetersPulseCatalogue,
})));

const multiJetSizes = [
  { dn: 15, q3: 2.5, q4: 3.12, connection: '½″', thread: 'G ¾″', length: 165 },
  { dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 190 },
  { dn: 25, q3: 6.3, q4: 7.85, connection: '1″', thread: 'G 1¼″', length: 260 },
  { dn: 32, q3: 10, q4: 12.5, connection: '1¼″', thread: 'G 1½″', length: 260 },
  { dn: 40, q3: 16, q4: 20, connection: '1½″', thread: 'G 2″', length: 300 },
  { dn: 50, q3: 25, q4: 31.25, connection: '2″', thread: 'G 2½″', length: 300 },
];
const bmetersMultiJet = [
  { model: 'GMDM-R', ratios: [100], temperature: [0.1, 30], sizes: multiJetSizes },
  { model: 'GMDX-R', ratios: [50], temperature: [30, 90], sizes: multiJetSizes },
  // The old catalogue gives conflicting Q4 values for GMB-RP-R DN50.
  { model: 'GMB-RP-R', ratios: [100, 40], temperature: [0.1, 30], sizes: multiJetSizes.slice(0, -1) },
].flatMap(({ sizes, ...series }) => sizes.map(size => ({
  ...bmetersReed, ...series, ...size, documentation: bmetersArchive,
})));

const masterVersions = [
  { name: 'Master+', ratios: [100, 50], documentation: 'https://api.apator.com/uploads/oferta/woda-i-cieplo/wodomierze/master-plus/js-master-plus-karta-katalogowa.pdf' },
  { name: 'Master C+', ratios: [160, 63], documentation: 'https://api.apator.com/uploads/oferta/woda-i-cieplo/wodomierze/master-c-plus/js-master-c-plus-catalogue.pdf' },
  { name: 'Master D+', ratios: [200, 63], documentation: 'https://www.apator.com/sites/default/files/js-master-d-plus-karta-katalogowa.pdf' },
];

const masterSizes = [
  { model: 'JS 6,3-NK', dn: 25, q3: 6.3, q4: 7.875, connection: '1″', thread: 'G 1¼″', length: 260 },
  { model: 'JS 10-NK', dn: 32, q3: 10, q4: 12.5, connection: '1¼″', thread: 'G 1½″', length: 260 },
  { model: 'JS 16-NK', dn: 40, q3: 16, q4: 20, connection: '1½″', thread: 'G 2″', length: 300 },
];

const masterMeters = masterVersions.flatMap(({ name, ratios, documentation }) => {
  const alternativeSizes = name === 'Master+'
    ? [{ ...masterSizes[0], model: 'JS 6,3/165-NK', length: 165 }]
    : [{ ...masterSizes[1], model: 'JS 10-G1¼-NK', dn: 25, connection: '1″', thread: 'G 1¼″' }];
  return [...masterSizes, ...alternativeSizes].map(size => ({
    ...apator, ...size, ratios, documentation, temperature: [0.1, 50],
    model: (name === 'Master D+' ? size.model.replace('-NK', '-06-NK') : size.model) + ' ' + name,
    pulse: { ...apator.pulse, litres: size.dn === 40 ? 100 : 10 },
  }));
});

// List only verified REED variants with at least one pulse per litre
// or a whole number of litres per pulse.
const zennerMeters = [
  { ...multiJetSizes[0], q4: 3.13, ratios: [80] },
  { ...multiJetSizes[1], ratios: [80, 40] },
  { ...multiJetSizes[2], q4: 7.88, ratios: [80, 40] },
  { ...multiJetSizes[2], q3: 10, q4: 12.5, ratios: [80, 40] },
  { ...multiJetSizes[3], ratios: [80, 40] },
].flatMap(size => [1, 10].map(litres => ({
  ...size,
  manufacturer: 'ZENNER',
  model: 'MTKDI-N',
  temperature: [0.1, 50],
  map: 16,
  maxPressureLoss: 0.63,
  pulse: { model: 'REED', litres, signal: 'reed', retrofit: false },
  documentation: 'https://santehnika.ee/wp-content/uploads/2024/06/MTKD-N_MTKD-M_tooteinfo-11.pdf',
})));

export const meters = [
  ...zennerMeters,
  { ...bmeters, dn: 15, q3: 1.6, q4: 2, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...bmeters, dn: 15, q3: 2.5, q4: 3.12, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...bmeters, dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 130 },
  { ...gsd5, dn: 15, q3: 2.5, q4: 3.12, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...gsd5, dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 130 },
  ...cprPulseMeters,
  ...bmetersMultiJet,
  { ...apator, pulse: apatorOneLitre, model: 'JS 1,6-NK', dn: 15, q3: 1.6, q4: 2, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, pulse: apatorOneLitre, model: 'JS 2,5-NK', dn: 15, q3: 2.5, q4: 3.125, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, pulse: apatorOneLitre, model: 'JS 4-NK', dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 130 },
  { ...apator, pulse: apatorOneLitre, model: 'JS 2,5-G1-NK', dn: 20, q3: 2.5, q4: 3.125, connection: '¾″', thread: 'G 1″', length: 130 },
  ...masterMeters,
  ...masterMeters.filter(meter => meter.model.endsWith(' Master+') && meter.length !== 165).map(meter => ({
    ...meter, model: meter.model.replace('JS ', 'JS130 ').replace('6,3-NK', '6,3/165-NK'), ratios: [80, 40], temperature: [30, 130],
  })),
  { ...bmeters, temperature: [30, 90], dn: 15, q3: 1.6, q4: 2, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...bmeters, temperature: [30, 90], dn: 15, q3: 2.5, q4: 3.12, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...bmeters, temperature: [30, 90], dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 130 },
  { ...gsd5, temperature: [30, 90], dn: 15, q3: 2.5, q4: 3.12, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...gsd5, temperature: [30, 90], dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 130 },
  { ...apator, temperature: [30, 90], ratios: [80, 40], model: 'JS90 1,6-NK', dn: 15, q3: 1.6, q4: 2, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, temperature: [30, 90], ratios: [80, 40], model: 'JS90 1,6-03-NK', dn: 15, q3: 1.6, q4: 2, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, ratios: [80, 40], model: 'JS 1,6-03-NK', dn: 15, q3: 1.6, q4: 2, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, temperature: [30, 90], ratios: [80, 40], model: 'JS90 2,5-NK', dn: 15, q3: 2.5, q4: 3.125, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, temperature: [30, 90], ratios: [80, 40], model: 'JS90 2,5-03-NK', dn: 15, q3: 2.5, q4: 3.125, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, ratios: [80, 40], model: 'JS 2,5-03-NK', dn: 15, q3: 2.5, q4: 3.125, connection: '½″', thread: 'G ¾″', length: 110 },
  { ...apator, temperature: [30, 90], ratios: [80, 40], model: 'JS90 4-NK', dn: 20, q3: 4, q4: 5, connection: '¾″', thread: 'G 1″', length: 130 },
  { ...apator, temperature: [30, 90], ratios: [80, 40], model: 'JS90 2,5-G1-NK', dn: 20, q3: 2.5, q4: 3.125, connection: '¾″', thread: 'G 1″', length: 130 },
].flatMap(meter => meter.pulse === apatorOneLitre ? [{ ...meter, pulse: apator.pulse }, meter] : [meter])
  .map(({ ratios = [100, 50], ...meter }) => ({
    ...meter,
    ranges: ratios.map((r, index) => ({
      position: index === 0 ? 'horizontal-up' : 'vertical-or-side',
      r, q1: meter.q3 / r, q2: meter.q3 / r * 1.6,
    })),
  }));

export const retrofitReferences = [
  {
    manufacturer: 'B-Meters', models: ['GSD8-I'],
    pulse: { model: 'GSD REED', litres: null, signal: 'reed', retrofit: true },
    documentation: 'https://www.bmeters.com/wp-content/uploads/2021/05/GSD8-I_v21.1-1.pdf',
  },
  {
    manufacturer: 'B-Meters', models: ['GMDM-I', 'GMB-I', 'GMB-RP-I', 'CPR-M3-I'],
    pulse: { model: 'IWM-PL3', signal: 'open-collector', retrofit: true },
    documentation: 'https://www.bmeters.com/en/products/iwm-pl3/',
  },
  {
    manufacturer: 'B-Meters', models: ['WDE-K50', 'TAN-X5-I'],
    pulse: { model: 'IWM-PL4', signal: 'open-collector', retrofit: true },
    documentation: 'https://www.bmeters.com/en/products/iwm-pl4/',
  },
  {
    manufacturer: 'B-Meters', models: ['WDE-K40', 'WDE', 'TAN-X5'],
    pulse: { model: 'REED', signal: 'reed', retrofit: true },
    documentation: 'https://www.bmeters.com/wp-content/uploads/2022/02/Catalogo_v22.1_10_10_22.pdf',
  },
  {
    manufacturer: 'B-Meters', models: ['CPR-RP-R', 'GMB-RP-R', 'GMDM-R', 'GMDX-R', 'WDE-R', 'WDE-K40-R', 'TAN-X5-R'],
    pulse: { model: 'REED', signal: 'reed', retrofit: false },
    documentation: 'https://www.bmeters.com/wp-content/uploads/2021/06/BMETERS_catalogue_v21.3.pdf',
  },
  {
    manufacturer: 'B-Meters', models: ['CMC-R', 'WDC-R'],
    pulse: { model: 'Pulse emitter', signal: 'variant', retrofit: false },
    documentation: 'https://www.bmeters.com/en/product-category/mechanical-meters/',
  },
  {
    manufacturer: 'Apator', models: ['JS Smart+', 'JS Smart C+', 'JS Smart D+', 'JS Master+', 'JS Master C+', 'JS Master D+', 'JS Impero', 'MWN Nubis', 'MWN 130 Nubis', 'MK', 'WI', 'MH'],
    pulse: { model: 'IN-PULSE (Ti)', signal: 'open-drain', retrofit: true },
    documentation: 'https://api.apator.com/uploads/oferta/woda-i-cieplo/systemy/radiowy/in-pulse/in-pulse-instrukcja.pdf',
  },
  {
    manufacturer: 'Apator', models: ['MWN-NKOP', 'MWN Nubis-NKOP', 'MWN130-NKOP', 'MWN130 Nubis-NKOP', 'MK-NKOP', 'JS Impero-NKOP', 'MP-NKOP', 'MP130-NKOP'],
    pulse: { model: 'NK / NO', signal: 'variant', retrofit: true },
    documentation: 'https://www.apator.com/sites/default/files/wodomerze-przemyslowe-montaz-nadajnikow-t50.pdf',
  },
  {
    manufacturer: 'Apator', models: ['WI-03-NKP', 'WI-04-NKP', 'MWN-NKP', 'MK-NKP', 'JS Impero-NKP', 'MP-NKP'],
    pulse: { model: 'NK', signal: 'reed', retrofit: true },
    documentation: 'https://www.apator.com/sites/default/files/mwn-instrukcja-montazu-nadajnikow-t50.pdf',
  },
  {
    manufacturer: 'Apator', models: ['WM-NKP', 'WM-NK'],
    pulse: { model: 'NK', signal: 'variant', retrofit: true },
    documentation: 'https://www.apator.com/produkty-i-uslugi/woda-i-cieplo/archiwum/wodomierze/wm-nkp-nk',
  },
  {
    manufacturer: 'Apator', models: ['WS-NKP', 'WS-NK'],
    pulse: { model: 'NK', signal: 'variant', retrofit: true },
    documentation: 'https://www.apator.com/produkty-i-uslugi/woda-i-cieplo/archiwum/wodomierze/ws-nkp-nk',
  },
  {
    manufacturer: 'Apator', models: ['MP-01', 'MP130-01'],
    pulse: { model: 'NK / NO', signal: 'variant', retrofit: true },
    documentation: 'https://www.apator.com/sites/default/files/mp-mp130-instrukcja-obslugi.pdf',
  },
  {
    manufacturer: 'Apator', models: ['JS-NK', 'JS90-NK'],
    pulse: { model: 'NK', signal: 'reed', retrofit: false },
    documentation: apator.documentation,
  },
  {
    manufacturer: 'Apator', models: ['MWN/JS-NKP', 'MWN/JS-S', 'MWN/JS-S-NKP'],
    pulse: { model: 'NK / NKP', signal: 'variant', retrofit: true },
    documentation: 'https://www.apator.com/produkty-i-uslugi/woda-i-cieplo/opomiarowanie-wody/wodomierze-specjalnego-przeznaczenia/mwn-js-s-nkp-dn-50-150',
  },
];

export const nominalFlows = [
  [15, '½″', 1.6], [15, '½″', 2.5], [20, '¾″', 4], [25, '1″', 6.3],
  [32, '1¼″', 10], [40, '1½″', 16], [50, '2″', 25],
];

// Watertech's R80 reference range. Retail variants can have different ratings.
export const andromedaReferences = [
  [15, '½″', 0.0313, 0.050, 2.5, 3.125],
  [20, '¾″', 0.050, 0.080, 4, 5],
  [25, '1″', 0.0788, 0.126, 6.3, 7.875],
  [32, '1¼″', 0.125, 0.200, 10, 12.5],
  [40, '1½″', 0.200, 0.320, 16, 20],
  [50, '2″', 0.3125, 0.500, 25, 31.25],
].map(([dn, connection, q1, q2, q3, q4]) => ({
  manufacturer: 'Watertech',
  model: 'Andromeda R80',
  dn, connection, q3, q4,
  ranges: [{ position: 'horizontal-up', r: 80, q1, q2 }],
  temperatureClasses: ['T50', 'T90'],
  pulse: { model: 'REED', litres: 1, signal: 'reed' },
  documentation: 'https://wtmeters.it/wp-content/uploads/2023/12/ANDROMEDA.pdf#page=2',
}));

const sensus420References = ['420', '420PC'].flatMap(model => [
  [15, '½″', 2.5, 3.125, 16, 25],
  [20, '¾″', 4, 5, 25, 40],
  [25, '1″', 6.3, 7.875, 39, 63],
  [32, '1¼″', 10, 12.5, 63, 100],
  [40, '1½″', 16, 20, 100, 160],
].map(([dn, connection, q3, q4, q1, q2]) => ({
  manufacturer: 'Sensus',
  model: `${model} R160`,
  dn, connection, q3, q4,
  ranges: [{ position: 'horizontal-up', r: 160, q1: q1 / 1000, q2: q2 / 1000 }],
  temperatureClasses: ['T50'],
  pulse: { model: 'HRI-A4 D1', litres: 1, retrofit: true },
  documentation: 'https://prod.xylem.com/siteassets/brand/sensus/resources/data-sheets/420-420pc-data-sheet.pdf',
})));

const altairReferences = [
  [25, '1″', 6.3, 7.875, 8],
  [25, '1″', 10, 12.5, 14.2],
  [32, '1¼″', 6.3, 7.875, 8],
  [32, '1¼″', 10, 12.5, 14.2],
  [40, '1½″', 16, 20, 20.1],
].map(([dn, connection, q3, q4, kv]) => ({
  manufacturer: 'Diehl',
  model: 'ALTAIR V4 R160',
  dn, connection, q3, q4, kv,
  ranges: [{ position: 'horizontal-up', r: 160, q1: q3 / 160, q2: q3 / 160 * 1.6 }],
  temperature: [0.1, 50],
  pulse: { model: 'IZAR PULSE i', litres: 1, signal: 'open-collector', retrofit: true },
  documentation: 'https://www.diehl.com/cms/files/ALTAIR-V4-DN25-32-40-37.pdf?download=1',
}));

const aquadisReferences = [
  { dn: 15, connection: '½″' },
  { dn: 20, connection: '¾″' },
].map(size => ({
  ...size,
  manufacturer: 'Itron',
  model: 'Aquadis+',
  q3: 2.5,
  ranges: [],
  pulse: { model: 'Cyble Sensor K1', litres: 1, signal: 'open-collector', retrofit: true },
  documentation: 'https://pl.itron.com/products/aquadis-dn15-dn20',
}));

export const modularMeterReferences = [...sensus420References, ...altairReferences, ...aquadisReferences];
