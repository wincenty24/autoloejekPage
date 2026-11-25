import { meters, nominalFlows } from './catalog.mjs';
import {
  hasDocumentedReedPulse, defaultPreferredUse, existingMeter, flowSummary, measuredFlow, nextStep, number,
  pressureLoss, selectMeters, toCubicMetresPerHour, toLitresPerMinute,
} from './selection.mjs';

const root = document.querySelector('[data-meter-configurator]');
const lang = document.documentElement.lang;
const t = (pl, en) => lang === 'pl' ? pl : en;
const format = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format;
const unknown = t('Nie wiem', 'I don’t know');
const unverified = t('Do potwierdzenia', 'To be confirmed');
const yesNo = [['yes', t('Tak', 'Yes')], ['no', t('Nie', 'No')]];
const yesNoUnknown = [['', unknown], ...yesNo];
const measurements = () => ({ mode: '', flow: '', volume: '', seconds: '' });
const initial = () => ({ rows: [measurements()] });
let answers = initial();
let history = ['start'];
const savedMeters = new Set();

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);
const option = (value, label, selected) =>
  `<option value="${escape(value)}"${value === selected ? ' selected' : ''}>${escape(label)}</option>`;
const select = (name, label, options) =>
  `<label>${label}<select name="${name}">${options.map(([value, text]) => option(value, text, answers[name] ?? '')).join('')}</select></label>`;
const field = (name, label, { numeric = false, required = false, value = answers[name] } = {}) =>
  `<label>${label}<input name="${name}" value="${escape(value)}"${numeric ? ' inputmode="decimal" data-positive' : ''}${required ? ' required' : ''}></label>`;
const choices = (name, options) => `<div class="mc-choices" role="group" aria-labelledby="mc-question">${options.map(([value, label]) =>
  `<label><input type="radio" name="${name}" value="${value}" required ${answers[name] === value ? 'checked' : ''}>${label}</label>`,
).join('')}</div>`;
const button = (action, label) => `<button type="button" data-action="${action}">${label}</button>`;
const contact = () => `<a href="contact.html">${t('Skontaktuj się z Autolejkiem', 'Contact Autolejek')}</a>`;
const notes = (pl, en) => `<p class="mc-note">${t(pl, en)}</p>`;
const headings = {
  start: t('Czy masz już wodomierz zamontowany w instalacji?', 'Do you already have a water meter installed?'),
  existing: t('Jaki wodomierz masz w instalacji?', 'Which water meter is installed?'),
  existingResult: t('Czy możesz zachować obecny wodomierz?', 'Can you keep your existing meter?'),
  source: t('Z jakiego źródła pobierasz wodę?', 'What is your water source?'),
  pump: t('Jakie parametry ma pompa?', 'What are your pump specifications?'),
  measure: t('Jaki przepływ zmierzono w miejscu montażu?', 'What flow did you measure at the installation point?'),
  target: t('Czy chcesz zachować określony minimalny przepływ?', 'Do you need to maintain a minimum flow?'),
  installation: t('Jak wygląda istniejąca instalacja?', 'What are your existing installation details?'),
  result: t('Wynik doboru wodomierza', 'Water meter selection result'),
};

function existingMeterEmail() {
  return `<fieldset class="mc-email" data-meter-email data-copy-panel hidden>
    <legend>${t('Dane do maila', 'Email draft')}</legend>
    <label>${t('Tekst do skopiowania', 'Text to copy')}
      <textarea rows="7" readonly data-copy-text></textarea>
    </label>
    <div class="mc-actions">
      ${button('copy-meter-email', t('Kopiuj tekst', 'Copy text'))}
      <span role="status" data-copy-status></span>
    </div>
  </fieldset>`;
}

function updateExistingMeterEmail() {
  const panel = root.querySelector('[data-meter-email]');
  if (!panel) return;
  const manufacturer = answers.manufacturer?.trim();
  const model = answers.model?.trim();
  panel.hidden = answers.hasPulse !== 'no' || !manufacturer || !model;
  if (panel.hidden) return;

  const q3 = number(answers.existingQ3);
  const text = [
    t('Dzień dobry, mam zamontowany wodomierz bez nadajnika impulsowego. Proszę o sprawdzenie, czy można dokupić do niego nadajnik zgodny ze sterownikiem Autolejek.',
      'Hello, my installed water meter has no pulse transmitter. Could you check whether I can buy a transmitter that works with this meter and the Autolejek controller?'),
    '',
    `${t('Producent', 'Manufacturer')}: ${manufacturer}`,
    `${t('Model / typ / wariant', 'Model / type / variant')}: ${model}`,
    ...(q3 === null ? [] : [`Q3: ${format(q3)} m³/h`]),
  ].join('\n');
  const field = panel.querySelector('[data-copy-text]');
  if (field.value !== text) {
    field.value = text;
    panel.querySelector('[data-copy-status]').textContent = '';
  }
}

async function copyText(control) {
  const panel = control.closest('[data-copy-panel]');
  const field = panel.querySelector('[data-copy-text]');
  const status = panel.querySelector('[data-copy-status]');
  const text = field.value;
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    if (!field.isConnected || field.value !== text) return;
    field.focus();
    field.select();
    try {
      copied = document.execCommand('copy');
    } catch {
      // The selected text remains available for manual copying.
    }
    if (copied) control.focus();
  }
  if (field.value === text) {
    status.textContent = copied
      ? t('Skopiowano.', 'Copied.')
      : t('Tekst zaznaczony. Użyj polecenia Kopiuj w przeglądarce.', 'Text selected. Use your browser’s Copy command.');
  }
}

function shutoffLink() {
  return `<p><a href="build-it-yourself.html#shutoff-components">${t('Zobacz, jak dobrać odcięcie wody', 'See how to choose a water shutoff device')}</a></p>`;
}

function existingResult() {
  const { status, meter, reference } = existingMeter(answers);
  if (status === 'installed') {
    return notes(
      'Sprawdź w dokumentacji zgodność sygnału posiadanego nadajnika ze sterownikiem Autolejek. Jeśli nadajnik jest zgodny, możesz go wykorzystać bez kupowania kolejnego.',
      'Check the installed transmitter’s signal against the Autolejek controller documentation. If it is compatible, you can reuse it without purchasing another transmitter.',
    ) + `<p><a href="#meter-connection">${t('Podłączenie do sterownika', 'Controller wiring')}</a></p>` + shutoffLink();
  }
  if (status === 'retrofit') {
    return `<p>${t('Zachowaj sprawny wodomierz i dobierz nakładkę', 'Keep the working meter and purchase the pulse attachment')} <strong>${meter.pulse.model}</strong>. ${pulseDetails(meter)}</p>
      <p><a href="#meter-connection">${t('Podłączenie do sterownika', 'Controller wiring')}</a></p>
      ${existingMeterEmail()}
      ${shutoffLink()}`;
  }
  return notes('Potwierdź dokładny wariant wodomierza, stan i dostępność kompatybilnego nadajnika z Autolejkiem.',
    'Confirm the exact meter variant, its condition and compatible transmitter availability with Autolejek.')
    + (reference ? `<p>${t('Opcja katalogowa do weryfikacji', 'Catalogue option to verify')} · <strong>${reference.pulse.model}</strong></p>` : '')
    + ((meter ?? reference) ? `<p><a href="${(meter ?? reference).documentation}">${t('Dokumentacja wariantów producenta', 'Manufacturer variant documentation')}</a></p>` : '')
    + contact() + existingMeterEmail();
}

function measure() {
  const repeatWithoutMeter = answers.hasMeter === 'yes'
    && (answers.condition === 'no' || answers.sized === 'no');
  const removalNote = repeatWithoutMeter ? notes(
    'Uszkodzony, niedrożny lub niewłaściwie dobrany wodomierz może ograniczać przepływ. Zamknij dopływ wody i spuść ciśnienie przed demontażem. Jeśli wodomierz jest zaplombowany lub należy do dostawcy wody, zleć demontaż dostawcy. Następnie zmierz przepływ ponownie w miejscu montażu, bez starego wodomierza, i wpisz tutaj nowy wynik.',
    'A faulty, obstructed or incorrectly sized meter can restrict flow. Shut off the water supply and relieve pressure before removal. If the meter is sealed or belongs to the water supplier, arrange removal through the supplier. Then measure the flow again at the installation point with the old meter removed and enter the new reading here.',
  ) : '';
  return removalNote + `<details open><summary>${t('Jak prawidłowo zmierzyć przepływ wody?', 'How to measure water flow')}</summary>
    <ul>
      <li>${t('Mierz w miejscu planowanego montażu, bez dodatkowych węży.', 'Measure at the installation point without adding hoses.')}</li>
      <li>${t('Otwórz całkowicie zawór i ogranicz równoczesny pobór wody przez innych użytkowników.', 'Open the supply valve fully and measure when other users are drawing little water.')}</li>
      ${answers.source === 'tap' ? `<li>${t('Mierz wcześnie rano lub późnym wieczorem, poza lokalnym szczytem. Wynik pomaga oszacować maksymalną wydajność, która może się zmieniać w ciągu dnia.', 'Measure early in the morning or late in the evening, outside local peak hours. This estimates maximum available flow, which can vary throughout the day.')}</li>` : ''}
      <li>${t('W miarę możliwości powtórz pomiar kilka razy.', 'Repeat the measurement several times if possible.')}</li>
    </ul></details>
    ${answers.rows.map((row, index) => `<fieldset data-row="${index}">
      <legend>${t('Pomiar', 'Measurement')} ${index + 1}</legend>
      <label>${t('Sposób pomiaru', 'Measurement method')}<select name="mode" required>
        ${option('', t('Wybierz sposób pomiaru', 'Choose a measurement method'), row.mode)}
        ${option('direct', t('Podaj l/min', 'Enter L/min'), row.mode)}
        ${option('bucket', t('Oblicz z napełniania zbiornika', 'Calculate from fill time'), row.mode)}
      </select></label>
      ${row.mode === 'direct'
        ? field('flow', t('Przepływ [l/min]', 'Flow [L/min]'), { numeric: true, required: true, value: row.flow })
        : row.mode === 'bucket' ? `<div class="mc-grid">
            ${field('volume', t('Pojemność [l]', 'Volume [L]'), { numeric: true, required: true, value: row.volume })}
            ${field('seconds', t('Czas [s]', 'Time [s]'), { numeric: true, required: true, value: row.seconds })}
          </div><small>${t('Pojemność × 60 / czas, np. 20 l w 27 s = 44,44 l/min.', 'Volume × 60 / time, e.g. 20 L in 27 s = 44.44 L/min.')}</small>
          <output data-row-flow></output>` : ''}
      ${answers.rows.length > 1 ? button('remove', t('Usuń pomiar', 'Remove measurement')) : ''}
    </fieldset>`).join('')}
    ${button('add', t('Dodaj pomiar', 'Add measurement'))}
    <output data-flow-summary aria-live="polite"></output>`;
}

function installation() {
  const sizes = [['', t('Obojętne', 'Any size')], ...[...new Set(nominalFlows.map(([, size]) => size))].map(size => [size, size]), ['other', t('Inna', 'Other')]];
  return `<p>${t('Wybierz „Obojętne”, jeśli rozmiar przyłącza nie ma znaczenia. Pola tekstowe możesz zostawić puste.', 'Choose “Any size” if connection size does not matter. You can leave text fields blank.')}</p>
    <div class="mc-grid">
      ${select('connection', t('Średnica przyłącza', 'Supply connection size'), sizes)}
      ${select('outlet', t('Średnica kranu lub wyjścia pompy', 'Tap or pump outlet size'), sizes)}
      ${select('threadType', t('Rodzaj przyłącza', 'Connection type'), [
        ['', unknown], ['bsp', t('Gwint G (BSPP)', 'G thread (BSPP)')], ['other', t('Inne, np. gwint R lub szybkozłącze', 'Other, e.g. R thread or quick connector')],
      ])}
    </div>
    <details ${answers.advanced ? 'open' : ''} data-advanced><summary>${t('Parametry zaawansowane', 'Advanced specifications')}</summary>
      <div class="mc-grid">
        ${field('length', t('Długość przewodów [m]', 'Pipe length [m]'), { numeric: true })}
        ${field('staticPressure', t('Ciśnienie statyczne [bar]', 'Static pressure [bar]'), { numeric: true })}
        ${field('dynamicPressure', t('Ciśnienie dynamiczne [bar]', 'Dynamic pressure [bar]'), { numeric: true })}
        ${field('pumpCurve', t('Charakterystyka pompy (dane lub link)', 'Pump curve (data or link)'))}
        ${field('elevation', t('Różnica wysokości [m]', 'Elevation difference [m]'))}
        ${field('restrictions', t('Zawory, filtry i inne ograniczenia', 'Valves, filters and other restrictions'))}
        ${field('lowestFlow', t('Najniższy przewidywany przepływ roboczy [l/min]', 'Lowest expected operating flow [L/min]'), { numeric: true })}
        ${select('position', t('Pozycja montażowa', 'Mounting position'), [
          ['', unknown], ['horizontal-up', t('Poziomo, liczydłem do góry', 'Horizontal, dial facing up')],
          ['vertical-or-side', t('Pionowo, przepływ w górę, lub poziomo z liczydłem w bok', 'Vertical with upward flow, or horizontal with the dial facing sideways')],
          ['other', t('Inna pozycja', 'Other position')],
        ])}
        ${field('valveKv', t('Kv elektrozaworu [m³/h]', 'Solenoid valve Kv [m³/h]'), { numeric: true })}
      </div>
    </details>`;
}

function pulseWeight({ litres }) {
  return litres <= 1
    ? `${format(1 / litres)} ${t('imp./l', 'pulses/L')}`
    : `${format(litres)} ${t('l/imp.', 'L/pulse')}`;
}

function pulseDetails(meter) {
  const { litres, madeToOrder } = meter.pulse;
  const order = madeToOrder ? t('na zamówienie', 'made to order') : t('wariant katalogowy', 'catalogue variant');
  const check = litres > 1
    ? t(' Potwierdź obsługę tej wagi impulsu w oprogramowaniu sterownika.',
      ' Confirm that the controller firmware supports this pulse weight.')
    : '';
  return `${t('Styk bezpotencjałowy', 'Dry contact')} (SIG ↔ GND) · ${pulseWeight(meter.pulse)} (${order}).${check}`;
}

function requestedConnectionSize() {
  return answers.connection || answers.outlet;
}

function mechanical(meter) {
  const size = requestedConnectionSize();
  if (!size || size === 'other' || answers.threadType !== 'bsp') {
    return t('Dobierz śrubunki i redukcje po potwierdzeniu rozmiaru oraz rodzaju gwintu instalacji.',
      'Confirm the installation’s thread size and type before selecting unions and reducers.');
  }
  if (size === meter.connection) {
    return t(`Śrubunki z gwintu korpusu ${meter.thread} na przyłącze ${size}. Sprawdź stronę i rodzaj gwintu.`,
      `Unions from the meter body thread ${meter.thread} to the ${size} connection. Check thread type and gender.`);
  }
  return t(`Śrubunki do korpusu ${meter.thread} oraz przejście między przyłączami ${size} i ${meter.connection}. Sprawdź miejsce na redukcje.`,
    `Unions for the ${meter.thread} body and adapters between the ${size} and ${meter.connection} connections. Check space for reducers.`);
}

function flowRangeChart({ meter, q1, q2, q3, preferred }, flow) {
  const q4 = toLitresPerMinute(meter.q4);
  if (!(q1 > 0 && q1 < q2 && q2 < q3 && q3 < q4)) return '';

  // Widen the short Q1–Q2 interval so it stays visible on small screens.
  const position = value => value <= q2
    ? 16 * Math.max(0, value - q1) / (q2 - q1)
    : value <= q3 ? 16 + 65 * (value - q2) / (q3 - q2)
      : 81 + 19 * Math.min(1, (value - q3) / (q4 - q3));
  const minimum = meter.preferredMinimumUse;
  const preferredEnd = q3 * preferred;
  const preferredStart = minimum == null ? q1 : q3 * minimum;
  const preferredLabel = minimum == null
    ? t(`Roboczy próg Autolejka: do ${format(preferredEnd)} l/min (${format(preferred * 100)}% Q3).`,
      `Autolejek’s sizing threshold: up to ${format(preferredEnd)} L/min (${format(preferred * 100)}% of Q3).`)
    : t(`Zalecenie producenta dla maksymalnego przepływu: ${format(preferredStart)}–${format(preferredEnd)} l/min (${format(minimum * 100)}–${format(preferred * 100)}% Q3).`,
      `Manufacturer’s sizing range for peak flow: ${format(preferredStart)}–${format(preferredEnd)} L/min (${format(minimum * 100)}–${format(preferred * 100)}% of Q3).`);
  const fit = flow > preferredEnd
    ? t('powyżej preferowanego zakresu, w granicach Q3', 'above the preferred range and within Q3')
    : minimum != null && flow < preferredStart
      ? t('poniżej zalecanego zakresu dla maksimum instalacji', 'below the recommended range for peak system flow')
      : t('w preferowanym zakresie doboru', 'within the preferred sizing range');

  const label = (index, value) =>
    `<div><dt>Q${index}</dt><dd>${format(value)} <small>l/min</small></dd></div>`;

  return `<figure class="mc-flow-range">
    <figcaption><strong>${t('Dopasowanie do Twojego przepływu', 'Fit for your flow')}</strong>
      <p><strong>${format(flow)} l/min</strong> · ${fit}.</p>
    </figcaption>
    <dl class="mc-flow-values mc-flow-values--top">
      ${label(1, q1)}${label(4, q4)}
    </dl>
    <div class="mc-flow-scale" aria-hidden="true">
      <div class="mc-flow-track"></div>
      <span class="mc-flow-band" style="--start:${position(preferredStart)}%;--end:${100 - position(preferredEnd)}%"></span>
      <span class="mc-flow-marker" style="--at:${position(flow)}%"></span>
    </div>
    <dl class="mc-flow-values mc-flow-values--bottom">
      ${label(2, q2)}${label(3, q3)}
    </dl>
    <ul class="mc-flow-legend">
      <li class="mc-flow-low">${t('Q1–Q2 · dolny zakres pomiarowy', 'Q1–Q2 · lower measuring range')}</li>
      <li class="mc-flow-normal">${t('Q2–Q3 · praca ciągła', 'Q2–Q3 · continuous operation')}</li>
      <li class="mc-flow-overload">${t('Q3–Q4 · krótkotrwałe przeciążenie', 'Q3–Q4 · short-term overload')}</li>
    </ul>
    <p class="mc-flow-caption">${t('Kropka oznacza Twój przepływ, a linia pokazuje zakres doboru. Skala poglądowa, nieliniowa.', 'The dot marks your flow and the line shows the sizing range. Illustrative, non-linear scale.')}</p>
    <p>${preferredLabel}${meter.selectionDocumentation ? ` <a href="${meter.selectionDocumentation}">${t('Instrukcja doboru', 'Sizing guide')}</a>` : ''}</p>
  </figure>`;
}

function shoppingTools() {
  return `<section class="mc-result mc-shopping" aria-labelledby="mc-saved-heading">
    <h4 id="mc-saved-heading">${t('Wodomierze do sprawdzenia w sklepach', 'Water meters to look up in shops')}</h4>
    <p>${t('Użyj „+”, aby zapisać interesujący Cię model, i „−”, aby go usunąć. Możesz szukać tych modeli w dowolnym sklepie. Dostępność zależy od regionu, więc warto zapisać kilka pasujących wariantów.',
      'Use “+” to save a model and “−” to remove it. Look up these models at any shop. Availability varies by region, so consider saving several suitable variants.')}</p>
    <div data-saved-meters aria-live="polite"></div>
  </section>
  <fieldset id="mc-ai-prompt" class="mc-email" data-ai-prompt data-copy-panel>
    <legend>${t('Prompt do wyszukania wodomierza z AI', 'AI prompt for finding a water meter')}</legend>
    <label>${t('Skopiuj tekst do wybranego asystenta AI', 'Copy the text to your preferred AI assistant')}
      <textarea rows="10" readonly data-copy-text></textarea>
    </label>
    <div class="mc-actions">
      ${button('copy-prompt', t('Kopiuj prompt', 'Copy prompt'))}
      <span role="status" data-copy-status></span>
    </div>
  </fieldset>`;
}

function shoppingName(meter) {
  return `${meter.manufacturer} ${meter.model} · DN${meter.dn} · Q3 ${format(meter.q3)} m³/h · ${pulseWeight(meter.pulse)}`;
}

function updateShoppingTools() {
  const list = root.querySelector('[data-saved-meters]');
  if (!list) return;

  const names = Array.from(savedMeters, index => shoppingName(meters[index]));
  list.innerHTML = names.length
    ? `<ul>${names.map(name => `<li>${escape(name)}</li>`).join('')}</ul>`
    : `<p>${t('Lista jest jeszcze pusta.', 'Your list is empty.')}</p>`;

  root.querySelectorAll('[data-action="toggle-meter"]').forEach(control => {
    const saved = savedMeters.has(Number(control.dataset.meter));
    control.textContent = saved ? '−' : '+';
    control.setAttribute('aria-pressed', String(saved));
  });

  const flow = flowSummary(answers.rows);
  const position = {
    'horizontal-up': t('poziomo, liczydłem do góry', 'horizontal, dial up'),
    'vertical-or-side': t('pionowo z przepływem w górę lub poziomo z liczydłem w bok', 'vertical with upward flow or horizontal with the dial sideways'),
    other: t('inna, dopytaj o szczegóły', 'other, ask for details'),
  }[answers.position];
  const parameters = [
    [t('Maksymalny zmierzony przepływ', 'Maximum measured flow'), flow.max, 'l/min'],
    [t('Najniższy przewidywany lub zmierzony przepływ', 'Lowest expected or measured flow'), number(answers.lowestFlow) ?? flow.min, 'l/min'],
    [t('Minimalny oczekiwany przepływ po montażu', 'Minimum target flow after installation'), answers.wantsMinimum === 'yes' ? number(answers.minimum) : null, 'l/min'],
    [t('Średnica przyłącza', 'Supply connection size'), answers.connection === 'other' ? t('inna, dopytaj o rozmiar', 'other, ask for the size') : answers.connection || t('obojętna', 'any size')],
    [t('Średnica wyjścia', 'Outlet size'), answers.outlet === 'other' ? t('inna, dopytaj o rozmiar', 'other, ask for the size') : answers.outlet || t('obojętna', 'any size')],
    [t('Rodzaj przyłącza', 'Connection type'), { bsp: 'G (BSPP)', other: t('inne, dopytaj o szczegóły', 'other, ask for details') }[answers.threadType]],
    [t('Pozycja montażowa', 'Mounting position'), position],
    [t('Ciśnienie statyczne', 'Static pressure'), number(answers.staticPressure), 'bar'],
    [t('Ciśnienie dynamiczne', 'Dynamic pressure'), number(answers.dynamicPressure), 'bar'],
  ];
  const panel = root.querySelector('[data-ai-prompt]');
  panel.querySelector('[data-copy-text]').value = [
    t('Pomóż mi znaleźć dostępny w sprzedaży wodomierz do sterownika Autolejek. Najpierw zapytaj o kraj lub region zakupu i temperaturę wody, jeśli ich nie podano.',
      'Help me find a water meter available to buy for the Autolejek controller. First ask for the purchase country or region and water temperature if missing.'),
    '',
    ...parameters.filter(([, value]) => value != null).map(([label, value, unit]) =>
      `${label}: ${unit ? `${format(value)} ${unit}` : value}`),
    ...(names.length ? ['', t('Zacznij od tych modeli i podaj dostępne zamienniki:', 'Start with these models and suggest available alternatives:'), ...names.map(name => `- ${name}`)] : []),
    '',
    t('Sprawdź Q1 i Q2 przy dolnym przepływie oraz Q3 przy maksymalnym. Preferuj maksymalny przepływ do 70% Q3, chyba że producent modelu zaleca inaczej. Szukaj pasywnego REED z całkowitą liczbą litrów na impuls lub całkowitą liczbą impulsów na litr. Podaj dokładny wariant, DN, Q3, zakres temperatur, gwinty, nadajnik i informację, czy jest w zestawie. Podaj link do karty producenta i oferty sklepu. Oznacz dane, których nie udało się potwierdzić. Nie gwarantuj przepływu po montażu bez danych o stratach instalacji.',
      'Check Q1 and Q2 against the minimum flow and Q3 against the maximum flow. Prefer maximum flow at or below 70% of Q3 unless the manufacturer recommends otherwise. Look for passive REED output with a whole number of litres per pulse or pulses per litre. Report the exact variant, DN, Q3, temperature range, threads, and whether the transmitter is included. Link the manufacturer datasheet and retailer listing. Mark unverified data. Do not guarantee post-installation flow without system loss data.'),
  ].join('\n');
  panel.querySelector('[data-copy-status]').textContent = '';
}

function result() {
  const flow = flowSummary(answers.rows);
  const target = answers.wantsMinimum === 'yes' ? number(answers.minimum) : null;
  const choices = selectMeters({
    max: flow.max,
    min: number(answers.lowestFlow) ?? flow.min,
    position: answers.position,
    pressure: Math.max(number(answers.staticPressure) ?? 0, number(answers.dynamicPressure) ?? 0) || null,
  });
  const overview = `<p>${t('Maksymalny zmierzony przepływ', 'Highest measured flow')} <strong>${format(flow.max)} l/min</strong>.</p>
    <p><a href="hydraulic-visualization.html#installation-diagram" target="_blank" rel="noopener">${t('Zobacz schemat instalacji (nowa karta)', 'View installation diagram (new tab)')}</a></p>
    <p>${t('Gotowy prompt do AI znajdziesz na dole wyników.', 'The AI prompt is at the bottom of the results.')}
      <a href="#mc-ai-prompt">${t('Przejdź do promptu', 'Go to the prompt')}</a>
    </p>
    ${notes('Sprawdź, czy temperatura cieczy mieści się w zakresie podanym przy modelu. W większości typowych instalacji wystarczy wodomierz do zimnej wody, jeśli jego zakres obejmuje temperaturę cieczy.',
      'Check that the liquid temperature is within the range shown for the model. A cold-water meter is sufficient for most typical installations if its range covers the liquid temperature.')}`;
  const goal = target === null ? '' : target > flow.max
    ? notes('Oczekiwany przepływ jest wyższy od zmierzonego. Może być konieczna modyfikacja instalacji.',
      'Your target exceeds the measured flow. You may need to modify the installation.')
    : `<p>${t('Minimalny oczekiwany przepływ', 'Minimum target flow')} ${format(target)} l/min.
      ${t('Akceptowalny spadek wydajności', 'Acceptable flow reduction')} ${format((1 - target / flow.max) * 100)}%.</p>`;
  const caveat = notes('Wynik jest orientacyjny. Przepływ po montażu zależy od źródła wody i łącznych strat na wodomierzu, elektrozaworze, redukcjach, śrubunkach i przewodach. Potwierdź go pomiarem po montażu.',
    'This is a preliminary result. Flow after installation depends on the supply and combined losses across the meter, solenoid valve, reducers, unions and piping. Verify it with a measurement after installation.');
  const targetAssessment = target === null ? '' : notes(
    'Zachowanie oczekiwanego przepływu wymaga weryfikacji hydraulicznej całej instalacji.',
    'Maintaining the target flow requires a hydraulic assessment of the complete installation.',
  );
  if (choices.length === 0) return overview + goal + notes('Dostępna baza nie zawiera odpowiedniego wodomierza dla tych danych. Dobór uwzględnia Q3, dolny zakres pomiarowy, warunki montażu i kompatybilność impulsów.',
    'The current catalogue has no suitable meter for these inputs. Selection considers Q3, the low-flow measurement range, installation conditions and pulse compatibility.')
    + targetAssessment + caveat + contact() + orientationTable() + shoppingTools();

  const best = [];
  const other = [];
  const connectionSize = requestedConnectionSize();
  for (const choice of choices) {
    const minimum = choice.meter.preferredMinimumUse ?? 0;
    const bestFit = choice.status === 'preferred' && choice.lowerRange === 'aboveQ2'
      && flow.max >= choice.q3 * minimum
      && (!connectionSize || choice.meter.connection === connectionSize);
    (bestFit ? best : other).push(choice);
  }
  const results = resultList(best, 'best', flow.max, target, true)
    + resultList(other, 'other', flow.max, target, best.length === 0);
  return overview + goal + results + targetAssessment + caveat + contact() + orientationTable() + shoppingTools();
}

function resultList(choices, group, maxFlow, target, openFirst) {
  const isBest = group === 'best';
  const heading = isBest ? t('Najlepiej dopasowane', 'Best matches') : t('Pozostałe pasujące', 'Other matches');
  const empty = isBest
    ? t('Żaden wariant nie spełnia wszystkich preferowanych kryteriów doboru.', 'No variant meets all preferred sizing criteria.')
    : t('Brak dodatkowych pasujących wariantów.', 'No additional matching variants.');
  return `<section class="mc-result-group mc-result-group--${group}" aria-labelledby="mc-${group}-heading">
    <h4 id="mc-${group}-heading">${heading}</h4>
    ${choices.length ? `<ul class="mc-result-list">${choices.map((choice, index) =>
      `<li>${meterResult(choice, maxFlow, target, openFirst && index === 0)}</li>`).join('')}</ul>`
      : `<p class="mc-result-empty">${empty}</p>`}
  </section>`;
}

function meterResult(choice, maxFlow, target, open) {
  const { meter, q3, usage, reserve, lowerRange } = choice;
  const rate = toCubicMetresPerHour(target ?? maxFlow);
  const loss = pressureLoss(rate, [meter, { kv: number(answers.valveKv) }]);
  const valve = number(answers.valveKv);
  const valveLoss = valve && pressureLoss(rate, [{ kv: valve }]).meter;
  return `<details class="mc-result-option"${open ? ' open' : ''}>
    <summary>
      <span class="mc-result-name">
        ${escape(meter.manufacturer)} ${escape(meter.model)} · DN${meter.dn}
        <small>Q3 ${format(q3)} l/min · ${t('Woda', 'Water')} ${meter.temperature.map(format).join('–')} °C · ${pulseWeight(meter.pulse)}</small>
      </span>
      <span class="mc-result-usage">${format(usage * 100)}% Q3</span>
    </summary>
    <div class="mc-result">
      ${flowRangeChart(choice, maxFlow)}
      <dl>
        <div><dt>Q3</dt><dd>${format(meter.q3)} m³/h · ${format(q3)} l/min</dd></div>
        <div><dt>${t('Wykorzystanie Q3', 'Q3 utilisation')}</dt><dd>${format(usage * 100)}%</dd></div>
        <div><dt>${t('Zapas do Q3', 'Headroom to Q3')}</dt><dd>${format(reserve)} l/min</dd></div>
        <div><dt>${t('Zakres temperatury wody', 'Water temperature range')}</dt><dd>${meter.temperature.map(format).join('–')} °C</dd></div>
        <div><dt>${t('Przyłącze / gwint korpusu', 'Connection / body thread')}</dt><dd>${meter.connection} / ${meter.thread}</dd></div>
        <div><dt>${t('Długość zabudowy', 'Installation length')}</dt><dd>${meter.length} mm</dd></div>
      </dl>
      <p>${lowerRange === 'belowQ2'
        ? t('Przepływ minimalny jest poniżej Q2, w zakresie o niższej dokładności.', 'The minimum flow is below Q2, in the lower accuracy range.')
        : t('Sprawdzony dolny przepływ mieści się w zakresie od Q2.', 'The checked low flow is within the range starting at Q2.')}
        ${answers.position ? '' : t('Użyto ostrożniejszych progów Q1 i Q2. Potwierdź pozycję montażową.', 'Conservative Q1 and Q2 thresholds were used. Confirm mounting position.')}
        ${answers.lowestFlow ? '' : t('Użyto najniższego pomiaru. Sprawdź również ewentualne mniejsze przepływy robocze.', 'The lowest measurement was used. Also check any lower flows expected in operation.')}</p>
      ${meter.availabilityUnverified ? notes(
        'Wariant z wcześniejszego katalogu. Potwierdź dostępność i wybierz standardowy nadajnik REED o podanej wadze impulsu.',
        'Variant from an earlier catalogue. Confirm availability and select the standard REED transmitter with the stated pulse weight.',
      ) : ''}
      <p><strong>${meter.pulse.model}</strong> · ${pulseDetails(meter)}</p>
      <p>${mechanical(meter)}</p>
      <p>${t('Strata wodomierza dla analizowanego przepływu', 'Meter pressure loss at the assessed flow')} ·
        ${loss.meter === null ? unverified : `${format(loss.meter)} bar`}.
        ${meter.maxPressureLoss == null ? '' : t(`Maksymalna katalogowa strata wodomierza wynosi ${format(meter.maxPressureLoss)} bar.`,
          `The catalogue lists a maximum meter pressure loss of ${format(meter.maxPressureLoss)} bar.`)}
        ${loss.total == null ? '' : t(`Łączna strata wodomierza i elektrozaworu: ${format(loss.total)} bar.`,
          `Combined meter and valve loss: ${format(loss.total)} bar.`)}
        ${valveLoss == null ? '' : t(`Szacowana strata samego elektrozaworu przy ${format(target ?? maxFlow)} l/min wynosi ${format(valveLoss)} bar.`,
          `Estimated pressure loss across the valve alone at ${format(target ?? maxFlow)} L/min is ${format(valveLoss)} bar.`)}</p>
      <a href="${meter.documentation}">${t('Karta katalogowa producenta', 'Manufacturer datasheet')}</a>
      <button type="button" class="mc-save-meter" data-action="toggle-meter" data-meter="${meters.indexOf(meter)}" aria-pressed="false" aria-label="${escape(t('Zapisz wodomierz', 'Save water meter') + ' · ' + shoppingName(meter))}">+</button>
      ${shutoffLink()}
    </div>
  </details>`;
}

function orientationTable() {
  return `<details><summary>${t('Orientacyjna tabela DN i Q3', 'Indicative DN and Q3 table')}</summary>
    <p>${t('Wodomierze o tym samym DN mogą mieć różne Q3. Weryfikuj dane w karcie konkretnego modelu.',
      'Meters with the same DN can have different Q3 ratings. Check the exact model’s datasheet.')}</p>
    <div class="table-scroll" tabindex="0"><table><thead><tr><th scope="col">DN</th>
      <th scope="col">${t('Przyłącze', 'Connection')}</th><th scope="col">Q3 [m³/h]</th>
      <th scope="col">Q3 [l/min]</th><th scope="col">70% Q3 [l/min]</th></tr></thead><tbody>
      ${nominalFlows.map(([dn, size, q3]) => `<tr><td>DN${dn}</td><td>${size}</td><td>${format(q3)}</td>
      <td>${format(toLitresPerMinute(q3))}</td><td>${format(toLitresPerMinute(q3) * defaultPreferredUse)}</td></tr>`).join('')}
    </tbody></table></div>
    <p>${t('Q1 to minimalny przepływ pomiarowy. Q2 rozdziela zakresy dokładności. Q3 określa dopuszczalny przepływ ciągły, a Q4 dotyczy krótkotrwałego przeciążenia. R = Q3 / Q1.',
      'Q1 is the minimum measurable flow. Q2 separates accuracy ranges. Q3 is the continuous flow rating, and Q4 applies to short-term overload. R = Q3 / Q1.')}</p>
    </details>`;
}

const steps = {
  start: () => choices('hasMeter', yesNo),
  existing: () => `<div class="mc-grid">
    ${field('manufacturer', t('Producent', 'Manufacturer'), { required: true })}
    ${field('model', t('Dokładny model i wariant', 'Exact model and variant'), { required: true })}
    ${select('hasPulse', t('Czy wodomierz ma już nakładkę lub nadajnik impulsowy?', 'Does the meter already have a pulse attachment or transmitter?'), [
      ['', t('Wybierz odpowiedź', 'Choose an answer')], ...yesNo, ['unknown', unknown],
    ])}
    ${select('condition', t('Czy wodomierz działa prawidłowo?', 'Does the meter work correctly?'), [
      ['', unknown], yesNo[0], ['no', t('Nie lub podejrzewam usterkę', 'No, or I suspect a fault')],
    ])}
    ${select('sized', t('Czy wodomierz jest dobrany do instalacji?', 'Is the meter suitable for the installation?'), yesNoUnknown)}
    ${field('existingQ3', t('Q3 z tarczy [m³/h] (jeśli znasz)', 'Q3 on the dial [m³/h] (if known)'), { numeric: true })}
    </div>
    <div data-retrofit-confirmation hidden>${select('reedConfirmed',
      t('Czy producent potwierdził, że do tego egzemplarza pasuje pasywny nadajnik REED z dokumentacji?', 'Has the manufacturer confirmed this unit accepts the documented passive REED transmitter?'),
      yesNoUnknown)}</div>
    ${existingMeterEmail()}`,
  existingResult,
  source: () => choices('source', [
    ['tap', t('Kran z publicznej sieci wodociągowej', 'Tap supplied by the public water network')],
    ['pump', t('Pompa, np. głębinowa lub powierzchniowa', 'Pump, e.g. submersible or surface')],
    ['other', t('Inne źródło wody', 'Other water source')],
  ]),
  pump: () => `<div class="mc-grid">
    ${field('pumpModel', t('Producent i model (opcjonalnie)', 'Manufacturer and model (optional)'))}
    ${field('pumpFlow', t('Przepływ z tabliczki [l/min] (opcjonalnie)', 'Rated flow [L/min] (optional)'), { numeric: true })}
    ${field('pumpHead', t('Ciśnienie [bar] lub wysokość podnoszenia [m] (opcjonalnie)', 'Pressure [bar] or head [m] (optional)'))}
    </div>` + notes('Parametry podane na tabliczce znamionowej pompy mają charakter pomocniczy. Rzeczywisty przepływ zależy od charakterystyki pompy, wysokości podnoszenia, długości i średnicy przewodów oraz pozostałych oporów hydraulicznych instalacji.',
      'Pump nameplate specifications are a reference. Actual flow depends on the pump curve, elevation, pipe length and diameter, and other hydraulic losses.'),
  measure,
  target: () => `${choices('wantsMinimum', yesNo)}${answers.wantsMinimum === 'yes'
    ? field('minimum', t('Minimalny akceptowalny przepływ [l/min]', 'Minimum acceptable flow [L/min]'), { numeric: true, required: true }) : ''}
    <output data-target-feedback aria-live="polite"></output>`,
  installation,
  result,
};

function updateOutputs() {
  updateExistingMeterEmail();
  updateShoppingTools();
  const retrofit = root.querySelector('[data-retrofit-confirmation]');
  if (retrofit) {
    const assessment = existingMeter(answers);
    const documentedRetrofit = assessment.reference?.pulse.retrofit && hasDocumentedReedPulse(assessment.reference.pulse);
    retrofit.hidden = answers.hasPulse !== 'no' || (assessment.status !== 'retrofit' && !documentedRetrofit);
  }
  const summary = root.querySelector('[data-flow-summary]');
  if (summary) {
    const stats = flowSummary(answers.rows);
    summary.textContent = stats ? t(
      `Średnia ${format(stats.mean)} l/min · Maksimum ${format(stats.max)} l/min`,
      `Average ${format(stats.mean)} L/min · Maximum ${format(stats.max)} L/min`,
    ) : '';
    root.querySelectorAll('[data-row-flow]').forEach(output => {
      const flow = measuredFlow(answers.rows[output.closest('[data-row]').dataset.row]);
      output.textContent = flow === null ? '' : `≈ ${format(flow)} l/min`;
    });
  }
  const feedback = root.querySelector('[data-target-feedback]');
  if (feedback) {
    const minimum = answers.wantsMinimum === 'yes' ? number(answers.minimum) : null;
    const max = flowSummary(answers.rows).max;
    feedback.textContent = minimum === null ? '' : minimum > max
      ? t('Oczekiwany przepływ jest wyższy od zmierzonego. Może być konieczna modyfikacja instalacji.',
        'Your target is above the measured flow. You may need to modify the installation.')
      : t(`Akceptowalny spadek wydajności ${format((1 - minimum / max) * 100)}%.`,
        `Acceptable flow reduction ${format((1 - minimum / max) * 100)}%.`);
  }
}

function render(focus = false) {
  const step = history.at(-1);
  root.innerHTML = `<form novalidate>
    <h3 id="mc-question" tabindex="-1">${headings[step]}</h3>
    ${steps[step]()}
    <div class="mc-actions">
      ${history.length > 1 ? button('back', t('Wstecz', 'Back')) : ''}
      ${step === 'result' ? '' : `<button type="submit" class="mc-primary">${step === 'existingResult'
        ? t('Przejdź do doboru nowego wodomierza', 'Choose a new meter')
        : step === 'installation' ? t('Pokaż wynik', 'Show result') : t('Dalej', 'Continue')}</button>`}
      ${history.length > 1 ? button('reset', t('Zacznij od nowa', 'Start over')) : ''}
    </div>
  </form>`;
  updateOutputs();
  if (focus) root.querySelector('#mc-question').focus();
}

root.addEventListener('input', event => {
  const input = event.target;
  if (!input.name) return;
  const row = input.closest('[data-row]');
  const state = row ? answers.rows[row.dataset.row] : answers;
  state[input.name] = input.value;
  input.setCustomValidity('');
  if (input.name === 'mode' || input.name === 'wantsMinimum') {
    const index = row?.dataset.row;
    render();
    if (index != null) root.querySelector(`[data-row="${index}"] select`).focus();
    else root.querySelector('input[name="wantsMinimum"]:checked').focus();
  } else updateOutputs();
});

root.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  form.querySelectorAll('[data-positive]').forEach(input => {
    const invalid = input.value.trim() !== '' && number(input.value) === null;
    input.setCustomValidity(invalid ? t('Wpisz liczbę większą od zera.', 'Enter a number greater than zero.') : '');
  });
  form.querySelectorAll('input[required]:not([type="radio"])').forEach(input => {
    if (!input.value.trim()) input.setCustomValidity(t('Uzupełnij to pole.', 'Complete this field.'));
  });
  const lowest = form.elements.namedItem('lowestFlow');
  if (lowest && number(lowest.value) > flowSummary(answers.rows).max) {
    lowest.setCustomValidity(t('Minimalny przepływ roboczy nie może przekraczać użytego maksimum.', 'The lowest operating flow cannot exceed the maximum used for sizing.'));
  }
  const invalid = form.querySelector('input:invalid, select:invalid');
  const hidden = invalid?.closest('details:not([open])');
  if (hidden) hidden.open = true;
  if (!form.reportValidity()) return;
  const step = history.at(-1);
  if (step === 'measure' && !flowSummary(answers.rows)) {
    const input = form.querySelector('[data-positive]');
    input.setCustomValidity(t('Sprawdź wartości pomiaru.', 'Check your measurement values.'));
    input.reportValidity();
    input.setCustomValidity('');
    return;
  }
  if (step === 'installation') answers.advanced = form.querySelector('[data-advanced]').open;
  const next = nextStep(step, answers);
  if (next) {
    history.push(next);
    render(true);
  }
});

root.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  switch (control?.dataset.action) {
    case 'toggle-meter': {
      const index = Number(control.dataset.meter);
      if (savedMeters.has(index)) savedMeters.delete(index);
      else savedMeters.add(index);
      updateShoppingTools();
      break;
    }
    case 'copy-prompt':
    case 'copy-meter-email':
      void copyText(control);
      break;
    case 'back':
      if (history.at(-1) === 'installation') answers.advanced = root.querySelector('[data-advanced]').open;
      history.pop();
      render(true);
      break;
    case 'reset':
      savedMeters.clear();
      answers = initial();
      history = ['start'];
      render(true);
      break;
    case 'add':
      answers.rows.push(measurements());
      render();
      root.querySelector('[data-row]:last-of-type select').focus();
      break;
    case 'remove': {
      const index = Number(control.closest('[data-row]').dataset.row);
      answers.rows.splice(index, 1);
      render();
      root.querySelector(`[data-row="${Math.min(index, answers.rows.length - 1)}"] select`).focus();
      break;
    }
  }
});

render();
