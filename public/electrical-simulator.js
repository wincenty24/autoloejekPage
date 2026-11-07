const polish = document.documentElement.lang === 'pl';
const polishText = {
  "Supply male plug": "Wtyczka zasilająca",
  "Contactor output socket": "Gniazdo wyjściowe stycznika",
  "Motor male plug": "Wtyczka pompy",
  "{count}-pole motor contactor": "Stycznik/przekaźnik {count}-biegunowy",
  "Single-phase motor pump": "Pompa jednofazowa",
  "Pump with {count} AC lines": "Pompa · {count} przewody fazowe",
  "Three-phase motor pump": "Pompa trójfazowa",
  "Main rotary isolator": "Rozłącznik główny",
  "Miniature circuit breaker (MCB)": "Wyłącznik nadprądowy (MCB)",
  "Relay 1 connects VOUT to A1 and GND to A2. Use the Relay 1 button to apply the selected VIN to the coil.": "Zacisk VOUT przekaźnika 1 łączy się z A1, a GND z A2. Przycisk przekaźnika 1 podaje na cewkę wybrane napięcie VIN.",
  "Centrifugal pump driven by an electric motor. The terminal box shows the winding connections and chassis PE.": "Pompa odśrodkowa z silnikiem elektrycznym. Puszka zaciskowa pokazuje zaciski uzwojeń i zacisk ochronny PE obudowy.",
  "Switches the selected supply conductors together.": "Załącza i rozłącza wszystkie wybrane przewody zasilające jednocześnie.",
  "Residual-current trip. Reset returns the device to Off.": "Wyłącza obwód po wykryciu prądu różnicowego. Reset ustawia aparat w położeniu wyłączonym.",
  "Residual-current, overload and short-circuit trips. Reset returns the device to Off.": "Wyłącza obwód przy prądzie różnicowym, przeciążeniu lub zwarciu. Reset ustawia aparat w położeniu wyłączonym.",
  "Overload and short-circuit trips. Reset returns the device to Off.": "Wyłącza obwód przy przeciążeniu lub zwarciu. Reset ustawia aparat w położeniu wyłączonym.",
  "XIAO SAMD21 module with USB-C and 14 side pads": "Moduł XIAO SAMD21 z USB-C i 14 polami lutowniczymi",
  "{ref} {voltage} buck regulator module": "Moduł przetwornicy obniżającej {ref} {voltage}",
  "Autolejek board with five green terminal blocks": "Płytka Autolejek z pięcioma zielonymi złączami",
  "Autolejek PCB": "Płytka Autolejek",
  "WATER-METER": "WODOMIERZ",
  "SENSOR": "CZUJNIK",
  "ON": "WŁ.",
  "OFF": "WYŁ.",
  "TRIP": "ZADZ.",
  "Residual + overcurrent": "Różnicowy i nadprądowy",
  "Residual current": "Prąd różnicowy",
  "MALE": "WTYCZKA",
  "FEMALE": "GNIAZDO",
  "L3 unused": "L3 wolny",
  "N unused": "N wolny",
  "CONTACTOR": "STYCZNIK/PRZEKAŹNIK",
  "INLET": "WLOT",
  "OUTLET": "WYLOT",
  "RUNNING": "PRACA",
  "STOPPED": "STOP",
  "IN": "WE",
  "OUT": "WY",
  "device illustration": "rysunek aparatu",
  "Bypass": "Obejście",
  "Unplugged": "Rozłączono",
  "Through": "Przewodzi",
  "Closed": "Zamknięty",
  "Open": "Otwarty",
  "L1 (live)": "L1 (fazowy)",
  "N (neutral)": "N (neutralny)",
  "PE (protective earth)": "PE (ochronny)",
  "Faded, dashed lines show where the supply path is interrupted.": "Przygaszone, przerywane linie oznaczają brak ciągłości zasilania.",
  "Plug and socket mated": "Wtyczka połączona z gniazdem",
  "Motor plug disconnected": "Wtyczka pompy odłączona",
  "RELAY1": "Przekaźnik 1",
  "Start pulses · 1 Hz": "Uruchom impulsy · 1 Hz",
  "Stop pulses": "Zatrzymaj impulsy",
  "Pulses: {count}": "Impulsy: {count}",
  "5 V fuse": "Bezpiecznik 5 V",
  "5 V output available": "Wyjście 5 V aktywne",
  "5 V output interrupted": "Brak zasilania na wyjściu 5 V",
  "Example with a powered 5 V pulse module: 5V, SIG and GND. Check the actual meter’s pinout.": "Przykład z modułem impulsowym zasilanym 5 V: 5V, SIG i GND. Sprawdź oznaczenia przewodów swojego wodomierza.",
  "Active pulse sensor: 5V, SIG and GND.": "Aktywny czujnik impulsowy: 5V, SIG i GND.",
  "Passive reed contact: connect SIG and GND. Leave 5V unused.": "Kontaktron pasywny podłącz do SIG i GND. Zacisk 5V pozostaw wolny.",
  "Relay 1 fuse": "Bezpiecznik przekaźnika 1",
  "Fuse intact": "Bezpiecznik sprawny",
  "Fuse blown": "Bezpiecznik przepalony",
  "Simulate blown fuse": "Symuluj przepalenie bezpiecznika",
  "Replace fuse": "Wymień bezpiecznik",
  "Turn Relay 1 on": "Włącz przekaźnik 1",
  "Turn Relay 1 off": "Wyłącz przekaźnik 1",
  "Valve energized": "Elektrozawór zasilony",
  "Valve de-energized": "Elektrozawór bez zasilania",
  "PCB RELAY1 output": "Wyjście przekaźnika 1 na płytce",
  "RELAY1 ON · {voltage} V DC": "Przekaźnik 1 · {voltage} V DC",
  "RELAY1 OFF · Turn on": "Przekaźnik 1 · WYŁ.",
  "Motor power and Autolejek PCB control wiring": "Zasilanie pompy i połączenia sterujące płytki Autolejek",
  "Test device": "Sprawdź działanie",
  "Simulate residual current": "Symuluj prąd różnicowy",
  "Simulate overload": "Symuluj przeciążenie",
  "Simulate short circuit": "Symuluj zwarcie",
  "Reset": "Resetuj",
  "Reset {device}": "Resetuj: {device}",
  "On": "Włączony",
  "Off": "Wyłączony",
  "Released": "Cewka bez zasilania",
  "Energized": "Cewka zasilona",
  "Running": "Pracuje",
  "Stopped": "Zatrzymana",
  "Tripped": "Zadziałanie",
  "test": "test",
  "residual current": "prąd różnicowy",
  "overload": "przeciążenie",
  "short circuit": "zwarcie",
  "Pump running": "Pompa pracuje",
  "Pump stopped": "Pompa zatrzymana",
  "Connected": "Połączony",
  "Interrupted": "Przerwany",
  "Power path from supply to motor": "Droga zasilania od wtyczki do silnika",
  "Supply": "Zasilanie",
  "PE runs through the plug and socket to the motor chassis.": "PE biegnie przez wtyczkę i gniazdo do obudowy silnika.",
  "Supply PE ends at the socket. Motor PE ends at the disconnected plug.": "PE zasilania kończy się w gnieździe. PE silnika kończy się w odłączonej wtyczce.",
  "{count} POLE · NO": "{count} BIEGUN · NO",
  "{count} POLES · NO": "{count} BIEGUNY · NO"
};

function t(message, parameters = {}) {
  const text = polish && Object.hasOwn(polishText, message) ? polishText[message] : message;
  return text.replace(/\{(\w+)\}/g, (_, key) => parameters[key]);
}

function stateLabel(state) {
  if (state.startsWith('tripped: ')) return t('Tripped') + ': ' + t(state.slice(9));
  return t(state[0].toUpperCase() + state.slice(1));
}

const simulator = document.querySelector("[data-electrical-simulator]");
const pcbVoltage = simulator.querySelector('#pcb-voltage');

function updateVinLabels() {
  simulator.querySelectorAll('[data-pcb-vin]').forEach(label => {
    label.textContent = ' · '+pcbVoltage.value+' V DC';
  });
}
const lines = ['L1','L2','L3'];
const variants = [1,2,3];
const paths = labels => labels.map(label => ({label, from: label + '_in', to: label + '_out'}));
const supplyLines = count => count === 1 ? ['L1','N'] : lines.slice(0,count);
const models = [
  ...variants.flatMap(count => [
    ['supply-plug',t('Supply male plug'),'male'],
    ['motor-socket',t('Contactor output socket'),'female'],
    ['motor-plug',t('Motor male plug'),'male']
  ].map(([role,label,connector]) => ({
    id:role+'-'+count, label, family:'connector', role, connector,
    paths:paths(supplyLines(count)), initial:'on'
  }))),
  ...variants.map(count => ({
    id: 'relay-' + count, family: 'relay', label: t('{count}-pole motor contactor',{count}),
    coil: { terminals: ['A1','A2'] },
    powerContacts: lines.slice(0,count).map((line,index) => [(2*index+1)+'/'+line,(2*index+2)+'/T'+(index+1)]),
    initial: 'released'
  })),
  ...variants.map(count => ({
    id: 'motor-' + count, family: 'motor', label: count === 1 ? t('Single-phase motor pump') : count === 3 ? t('Three-phase motor pump') : t('Pump with {count} AC lines',{count}),
    supply: supplyLines(count),
    terminals: count < 3 ? ['U1','U2'] : ['U','V','W'],
    protectiveEarth: 'PE', initial: 'stopped'
  })),
  ...variants.map(count => ({
    id:'switch-' + count, family:'switch', label:t('Main rotary isolator'), paths:paths(supplyLines(count)), initial:'off'
  })),
  ...['rccb','rcbo','mcb'].flatMap(family => variants.map(count => ({
    id: family + '-' + count,
    family,
    label: family === 'mcb' ? t('Miniature circuit breaker (MCB)') : family.toUpperCase(),
    paths:paths(family === 'mcb' ? lines.slice(0,count) : supplyLines(count)),
    trips: [
      ...(family === 'mcb' ? [] : ['residual current']),
      ...(family === 'rccb' ? [] : ['overload','short circuit'])
    ],
    initial:'off'
  })))
];
function closedConnections(model, state) {
  if (model.family === 'relay') {
    return state === 'energized' ? model.powerContacts : [];
  }
  return state === 'on' && model.paths ? model.paths.map(path => [path.from,path.to]) : [];
}
function nextState(model, state, event) {
  if (model.family === 'relay' && event === 'toggle') return state === 'released' ? 'energized' : 'released';
  if (state.startsWith('tripped:')) return event === 'reset' ? 'off' : state;
  if (event === 'toggle' && model.paths) return state === 'on' ? 'off' : 'on';
  if (state === 'on' && event === 'test' && model.trips?.includes('residual current')) return 'tripped: test';
  if (state === 'on' && model.trips?.includes(event)) return 'tripped: ' + event;
  return state;
}
const details = {
  relay:t('Relay 1 connects VOUT to A1 and GND to A2. Use the Relay 1 button to apply the selected VIN to the coil.'),
  motor:t('Centrifugal pump driven by an electric motor. The terminal box shows the winding connections and chassis PE.'),
  switch:t('Switches the selected supply conductors together.'),
  rccb:t('Residual-current trip. Reset returns the device to Off.'),
  rcbo:t('Residual-current, overload and short-circuit trips. Reset returns the device to Off.'),
  mcb:t('Overload and short-circuit trips. Reset returns the device to Off.')
};
const ac = '#c8d9ec', active = '#82e4bc', inactive = '#8da1b8';
const dot = (x,y,color=ac) => '<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="'+color+'"/>';
const line = (x1,y1,x2,y2,color=ac) => '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="2"/>';
const label = (x,y,value,style='') => '<text x="'+x+'" y="'+y+'" text-anchor="middle"'+
  (style ? ' class="'+style+'"' : '')+'>'+value+'</text>';
function clickHint(x,y) {
  return '<g class="click-hint" transform="translate('+x+' '+y+')" aria-hidden="true">'+
    '<circle cx="12" cy="12" r="11"/>'+
    '<path d="M9 12V6a1.5 1.5 0 0 1 3 0v4h3.5a2 2 0 0 1 2 2v2.5l-1.5 4h-5l-4-4a1.5 1.5 0 0 1 2-2.2l1 1"/></g>';
}
simulator.querySelector('[data-click-hint-icon]').innerHTML =
  '<svg viewBox="0 0 24 24" aria-hidden="true">'+clickHint(0,0)+'</svg>';
const terminalLabel = (x,y,value) => '<text x="'+(x+8)+'" y="'+y+'" text-anchor="start" class="device-terminal-label">'+value+'</text>';
function screw(x,y,color) {
  return '<circle cx="'+x+'" cy="'+y+'" r="8" fill="#465460" stroke="'+color+'" stroke-width="2"/>' +
    line(x-4,y-4,x+4,y+4,'#d7e1e8');
}
const pcbConnectors = [
  {id:'power', pins:['VIN','GND'], x:7, y:437, vertical:true},
  {id:'relay-1', name:t('RELAY1'), pins:['GND','VOUT'], x:76, y:633, pitch:45},
  {id:'relay-2', name:'RELAY2', pins:['COM','NC','NO'], x:194, y:633, pitch:46},
  {id:'water-meter', name:t('WATER-METER'), pins:['GND','SIG','5V'], x:356, y:633, pitch:46},
  {id:'sensor', name:t('SENSOR'), pins:['GND','SENSOR','5V'], x:517, y:633, pitch:46}
];

function pcbArtwork() {
  const rect = (x,y,w,h,fill,stroke='#7199b9',radius=2) =>
    '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+radius+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  const silkscreen = (x,y,value) => '<text class="pcb-header" x="'+x+'" y="'+y+'">'+value+'</text>';
  let marks = rect(1,1,718,738,'#062b64','#739cc1',4);
  for (const [x,y] of [[26,28],[695,28],[26,709],[695,709]]) {
    marks += '<circle cx="'+x+'" cy="'+y+'" r="21" fill="#123963" stroke="#ebf4fa" stroke-width="2"/>' +
      '<circle cx="'+x+'" cy="'+y+'" r="13" fill="#111923" stroke="#8da8b9"/>';
  }
  marks += '<g aria-label="'+t('XIAO SAMD21 module with USB-C and 14 side pads')+'">' +
    rect(65,69,141,161,'#171f26','#e7eef3',11) +
    rect(108,64,55,44,'#aebbc4','#edf4fa',5) +
    rect(112,65,47,10,'#31404a','#d9e4ec',4) +
    rect(119,67,33,4,'#82929d','#82929d',2) +
    line(111,101,160,101,'#6c7f8d') +
    rect(109,124,52,52,'#303a44','#6e818d',3) +
    dot(116,131,'#8a9aa5') +
    rect(128,186,16,20,'#414f59','#758892',2);
  for (let i=0;i<7;i++) {
    const y=87+i*20;
    for (const [padX,holeX] of [[65,68],[186,203]]) {
      marks += rect(padX,y-5,20,10,'#d6ad56','#f3ce7d',3) +
        '<circle cx="'+holeX+'" cy="'+y+'" r="3.5" fill="#171f26" stroke="#f3ce7d"/>';
    }
  }
  for (const [x,y] of [[100,115],[168,115],[101,190],[165,192],[106,208],[157,208]]) {
    marks += rect(x,y,8,5,'#e6ce87','#eaf0ef',1);
  }
  marks += rect(121,113,6,4,'#e5c74a','#eadc91',1) +
    rect(141,113,6,4,'#86c2b0','#c0e9dc',1) + '</g>';
  for (const [x,y,w,h] of [[14,249,132,181],[489,240,180,133]]) {
    marks += rect(x,y,w,h,'#a8afb5','#ecf3f8',1) +
      line(x+2,y+2,x+w-2,y+2,'#dae4eb');
  }
  for (const [x,y,ref,voltage] of [[447,81,'U3','3.3 V'],[568,81,'U4','5 V']]) {
    marks += '<g aria-label="'+t('{ref} {voltage} buck regulator module',{ref,voltage})+'">'+
      rect(x,y,105,87,'#a72f36','#eb9397',5) +
      rect(x+12,y+13,40,39,'#75818a','#b4c1c6',4) +
      rect(x+17,y+18,30,28,'#59656f','#8d9ba4',3) +
      rect(x+65,y+20,18,25,'#242c33','#8c9aa2',2);
    for (const [dx,dy] of [[61,12],[86,13],[58,50],[78,50],[90,38]]) {
      marks += rect(x+dx,y+dy,8,5,'#e0cb8d','#efdfac',1);
    }
    for (let i=0;i<4;i++) {
      const padX=x+19+i*22;
      marks += '<circle cx="'+padX+'" cy="'+(y+71)+'" r="5.5" fill="#e2b755" stroke="#f6d890"/>' +
        '<circle cx="'+padX+'" cy="'+(y+71)+'" r="2.5" fill="#502125"/>';
    }
    marks += '</g>';
  }
  for (const [x,y,w,h] of [[247,272,32,81],[387,273,57,83]]) {
    marks += rect(x,y,w,h,'#303943','#85929b',2) + dot(x+7,y+7,'#697781');
    for (let i=0;i<8;i++) {
      marks += rect(x-12,y+7+i*9,12,4,'#d6ad56','#f4cf76',1) + rect(x+w,y+7+i*9,12,4,'#d6ad56','#f4cf76',1);
    }
  }
  for (const [x,y] of [[292,22],[417,22],[301,186],[375,188],[412,187],
    [451,223],[164,271],[299,319],[125,572],[666,584]]) {
    marks += rect(x,y,24,27,'#dfc56e','#eff3f6',1) + rect(x+5,y+5,14,17,'#4d555c','#747f87',1);
  }
  for (const [x,y] of [[343,27],[474,27],[162,239],[316,290]]) {
    marks += rect(x,y,33,15,'#e9eef0','#ffffff',2) + rect(x+8,y+3,17,9,'#e8cd4e','#f4e194',1);
  }
  for (const [x,y] of [[252,191],[277,189],[343,191],[206,271],[371,241],[429,236],[26,537],[604,600],[625,600]]) {
    marks += rect(x,y,10,19,'#dfb75a','#eaeff3',1) + rect(x+1,y+5,8,9,'#eee5c6','#eee5c6',1);
  }
  const fuse = (x,y,vertical=false) => {
    let holder = rect(0,0,180,64,'#e8edf0','#f7fafc',1) + rect(11,8,158,48,'#b9c4cb','#87969e',2);
    holder += rect(4,13,48,38,'#798791','#edf4f9',3) + rect(127,13,48,38,'#798791','#edf4f9',3) +
      rect(18,18,143,28,'#f5f6f4','#9da7ab',5) +
      rect(18,18,39,28,'#bac4cb','#71818a',2) + rect(123,18,38,28,'#bac4cb','#71818a',2) +
      '<circle cx="90" cy="32" r="12" fill="#0864b5" stroke="#e7f4fb"/>';
    return '<g transform="translate('+x+' '+y+')'+(vertical?' rotate(90)':'')+'">'+holder+'</g>';
  };
  marks += fuse(253,380,true) + fuse(282,374) + fuse(499,393) + fuse(491,485);
  for (const [x,y,count] of [[286,91,4],[273,497,8]]) {
    marks += rect(x,y,count*20+18,44,'#edf1f3','#ffffff',1) +
      rect(x+6,y+7,count*20+6,29,'#cfd9df','#8599a9',1);
    for (let i=0;i<count;i++) marks += rect(x+13+i*20,y+20,5,5,'#374c5d','#e5eef3',0);
  }
  marks += '<circle cx="36" cy="610" r="30" fill="#737c81" stroke="#ecf3f7" stroke-width="3"/>' +
    '<path d="M7 622h58" stroke="#ecf3f7" stroke-width="3"/>';
  for (const connector of pcbConnectors) {
    const {x,y,pins,vertical}=connector;
    const pitch=connector.pitch || 41;
    const width=vertical ? 70 : pitch*pins.length;
    const height=vertical ? pitch*pins.length : 67;
    marks += '<g aria-label="'+(connector.name ? connector.name+': ' : '')+pins.map(pin => t(pin)).join(', ')+'">';
    if (connector.name) marks += silkscreen(x,y-6,connector.name);
    marks += rect(x,y,width,height,'#4cebc7','#d9fff6',2) + rect(x+2,y+2,width-4,9,'#158369','#84f9dd',1);
    pins.forEach((pin,index) => {
      const pinX=vertical ? x+35 : x+pitch*(index+.5);
      const pinY=vertical ? y+pitch*(index+.5) : y+36;
      if (index) {
        if (vertical) marks += line(x+2,y+pitch*index,x+width-2,y+pitch*index,'#2aaa8f');
        else marks += line(x+pitch*index,y+2,x+pitch*index,y+12,'#095744');
      }
      if (vertical) marks += '<circle cx="'+pinX+'" cy="'+pinY+'" r="12" fill="#e2e1d4" stroke="#9aab9c"/>';
      else marks += '<circle cx="'+pinX+'" cy="'+pinY+'" r="9" fill="#24967d" stroke="#aaffea"/>' +
        rect(pinX-3,pinY-3,6,6,'#203b43','#edf6f4',0);
      marks += '<text class="pcb-pin"'+(pin === 'VIN' ? ' style="fill:#ff707d"' : '')+
        ' x="'+(vertical ? x+width+7 : pinX)+
        '" y="'+(vertical ? pinY+4 : y+86)+'" text-anchor="'+(vertical ? 'start' : 'middle')+'">'+
        t(pin)+(pin === 'VIN' ? '<tspan data-pcb-vin></tspan>' : '')+'</text>';
    });
    marks += '</g>';
  }
  return marks;
}

const pcbArtworkMarkup = '<g class="pcb-artwork">'+pcbArtwork()+'</g>';
const valveSimulator = simulator.hasAttribute('data-valve-simulator');
const meterSimulator = simulator.hasAttribute('data-meter-simulator');
const fuseControl = valveSimulator ?
  '<g data-fuse-control class="module-toggle valve-fuse-control" role="button" tabindex="0">'+
  '<rect class="module-hit" x="184" y="375" width="74" height="190" rx="7"/>'+
  '<path class="valve-fuse-break" d="M216 440l14 20-15 20 14 20" fill="none" stroke="#a83b20" stroke-width="6" stroke-linecap="round"/>'+
  '<g transform="translate(221 529) scale(1.5)">'+clickHint(0,0)+'</g></g>' : meterSimulator ?
  '<g data-fuse-control class="module-toggle valve-fuse-control" role="button" tabindex="0">'+
  '<rect class="module-hit" x="486" y="480" width="190" height="74" rx="7"/>'+
  '<path class="valve-fuse-break" d="M546 519l22-13 20 15 23-13" fill="none" stroke="#a83b20" stroke-width="6" stroke-linecap="round"/>'+
  '<g transform="translate(640 522) scale(1.5)">'+clickHint(0,0)+'</g>'+
  label(581,571,t('5 V fuse'))+'</g>' : '';
simulator.querySelector('#pcb-diagram').innerHTML = valveSimulator || meterSimulator
  ? pcbArtworkMarkup+fuseControl
  : '<svg viewBox="0 0 720 740" role="img" aria-label="'+
    t('Autolejek board with five green terminal blocks')+'">'+pcbArtworkMarkup+'</svg>';

function configureMeterSimulator() {
  const selector = simulator.querySelector('#electric-meter-type');
  const wireCount = simulator.querySelector('#electric-meter-wires');
  const fuse = simulator.querySelector('[data-fuse-control]');
  const button = simulator.querySelector('#meter-fuse');
  const status = simulator.querySelector('#meter-fuse-status');
  const fuseExplanation = simulator.querySelector('#meter-fuse-explanation');
  const wires = simulator.querySelector('[data-meter-wires]');
  const hint = simulator.querySelector('#meter-wiring-hint');
  const pulseButton = simulator.querySelector('#meter-pulse-toggle');
  const pulseCount = simulator.querySelector('#meter-pulse-count');
  const connector = pcbConnectors.find(item => item.id === 'water-meter');
  const images = simulator.querySelectorAll('[data-electric-meter]');
  let blown = false;
  let pulseTimer;
  let flashTimer;
  let count = 0;

  function updatePulseControl() {
    pulseButton.disabled = blown;
    pulseButton.textContent = t(pulseTimer === undefined ? 'Start pulses · 1 Hz' : 'Stop pulses');
    pulseCount.textContent = t('Pulses: {count}',{count});
  }
  function clearFlash() {
    wires.classList.remove('meter-pulse-active');
  }
  function emitPulse() {
    count++;
    wires.classList.add('meter-pulse-active');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(clearFlash,180);
    updatePulseControl();
  }
  function stopPulses() {
    clearInterval(pulseTimer);
    clearTimeout(flashTimer);
    pulseTimer = undefined;
    clearFlash();
  }
  pulseButton.addEventListener('click',() => {
    if (pulseTimer !== undefined) {
      stopPulses();
      updatePulseControl();
    } else if (!blown) {
      pulseTimer = setInterval(emitPulse,1000);
      emitPulse();
    }
  });

  function render() {
    if (blown) stopPulses();
    updatePulseControl();
    const active = wireCount.value === '3';
    const options = Array.from(selector.options);
    for (const option of options) {
      const compatible = option.dataset.wireCounts.split(' ').includes(wireCount.value);
      option.hidden = !compatible;
      option.disabled = !compatible;
    }
    if (!options.some(option => option.value === selector.value && !option.disabled)) {
      selector.value = options.find(option => !option.disabled).value;
    }
    const selectedModel = selector.value;
    const poweredMultiJet = active && selectedModel === 'multi-jet';
    for (const image of images) {
      const model = image.dataset.electricMeter;
      image.toggleAttribute('hidden',model !== selectedModel && !(poweredMultiJet && model === 'multi-jet-powered'));
    }
    hint.textContent = t(poweredMultiJet ? 'Example with a powered 5 V pulse module: 5V, SIG and GND. Check the actual meter’s pinout.' :
      active ? 'Active pulse sensor: 5V, SIG and GND.' :
      'Passive reed contact: connect SIG and GND. Leave 5V unused.');
    const action = t(blown ? 'Replace fuse' : 'Simulate blown fuse');
    fuse.dataset.blown = String(blown);
    fuse.setAttribute('aria-label',t('5 V fuse')+' — '+action);
    button.textContent = action;
    status.textContent = t(blown ? '5 V output interrupted' : '5 V output available');
    status.dataset.state = blown ? 'tripped' : 'on';
    fuseExplanation.hidden = !blown;
    wires.dataset.energized = String(!blown);
    wires.innerHTML = ['GND','SIG','5V'].slice(0,active ? 3 : 2).map((pin,index) => {
      const x = connector.x+connector.pitch*(index+.5);
      const side = x+(index === 0 ? -22 : 24);
      const end = active ? 474+index*6 : 322+index*40;
      const endY = active ? 861 : 836;
      const color = ['#67b9ff','#ffd369','#ff6479'][index];
      const lane = active ? 798-index*20 : 758+index*20;
      const name = active ? terminalLabel(side,lane-7,pin) : terminalLabel(end,830,pin);
      return '<g class="valve-lead" data-valve-lead="'+pin+'">'+
        '<path d="M'+x+' '+(connector.y+36)+'V698H'+side+'V'+lane+'H'+end+'V'+endY+'" stroke="'+color+'"/>'+
        dot(x,connector.y+36,color)+name+'</g>';
    }).join('');
  }

  function toggleFuse() {
    blown = !blown;
    render();
  }
  bindFuseControls(fuse,button,toggleFuse);
  selector.addEventListener('change',render);
  wireCount.addEventListener('change',render);
  render();
}

function bindFuseControls(model,button,toggle) {
  model.addEventListener('click',toggle);
  model.addEventListener('keydown',event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!event.repeat) toggle();
  });
  button.addEventListener('click',toggle);
}

function valveWiring() {
  const relay1 = pcbConnectors.find(connector => connector.id === 'relay-1');
  return relay1.pins.map((pin,index) => {
    const positive = pin === 'VOUT';
    const x = relay1.x+relay1.pitch*(index+.5);
    const side = positive ? x+26 : x-24;
    const lane = positive ? 775 : 805;
    const valveX = positive ? 454 : 442;
    const color = positive ? '#ff6479' : '#b8a8d7';
    return '<g class="valve-lead" data-valve-lead="'+pin+'" aria-label="'+pin+'">'+
      '<path d="M'+x+' '+(relay1.y+36)+'V697H'+side+'V'+lane+'H'+valveX+'V848" stroke="'+color+'"/>'+
      dot(x,relay1.y+36,color)+'</g>';
  }).join('');
}

function configureValveSimulator() {
  const fuseModel = simulator.querySelector('[data-fuse-control]');
  const fuseButton = simulator.querySelector('#relay-fuse');
  const relayButton = simulator.querySelector('#valve-relay');
  const relayLabel = relayButton.querySelector('[data-relay-label]');
  relayButton.querySelector('[data-relay-icon]').innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true">'+clickHint(0,0)+'</svg>';
  const fuseStatus = simulator.querySelector('#relay-fuse-status');
  const valveStatus = simulator.querySelector('#valve-status');
  const wires = simulator.querySelector('[data-valve-wires]');
  wires.innerHTML = valveWiring();
  let blown = false;
  let relayOn = false;

  function render() {
    const fuseAction = t(blown ? 'Replace fuse' : 'Simulate blown fuse');
    fuseModel.dataset.blown = String(blown);
    fuseModel.setAttribute('aria-label',t('Relay 1 fuse')+' — '+fuseAction);
    fuseButton.textContent = fuseAction;
    fuseStatus.textContent = t(blown ? 'Fuse blown' : 'Fuse intact');
    fuseStatus.dataset.state = blown ? 'tripped' : 'on';
    relayButton.disabled = blown;
    relayButton.setAttribute('aria-pressed',String(relayOn));
    relayButton.setAttribute('aria-label',t(relayOn ? 'Turn Relay 1 off' : 'Turn Relay 1 on'));
    relayLabel.textContent = relayOn ? t('RELAY1 ON · {voltage} V DC',{voltage:pcbVoltage.value}) : t('RELAY1 OFF · Turn on');
    valveStatus.textContent = t(relayOn ? 'Valve energized' : 'Valve de-energized');
    valveStatus.dataset.state = relayOn ? 'energized' : 'off';
    wires.dataset.energized = String(relayOn);
  }
  function toggleFuse() {
    blown = !blown;
    relayOn = false;
    render();
  }
  bindFuseControls(fuseModel,fuseButton,toggleFuse);
  relayButton.addEventListener('click',() => {
    if (blown) return;
    relayOn = !relayOn;
    render();
  });
  pcbVoltage.addEventListener('change',() => {
    updateVinLabels();
    render();
  });
  updateVinLabels();
  render();
}

function contactorTerminalX(model,index) {
  return 160 + (index-model.powerContacts.length/2)*49;
}
function deviceTerminalX(model,index) {
  const poles = model.paths.length;
  if (model.family === 'mcb') return 157 + (index-(poles-1)/2)*57;
  if (model.family === 'rccb' || model.family === 'rcbo') return 157 + (index-(poles-1)/2)*53;
  return poles === 1 ? 157 : 82 + index*(150/(poles-1));
}
function mcbFace(model,state) {
  const poles = model.paths.length;
  const left = deviceTerminalX(model,0)-28.5;
  const width = poles*57;
  const on = state === 'on';
  const tripped = state.startsWith('tripped:');
  const handleY = on ? 103 : tripped ? 115 : 128;
  let marks = '<rect x="'+(left-8)+'" y="104" width="'+(width+16)+'" height="48" rx="3" fill="#718491"/>' +
    '<rect x="'+left+'" y="29" width="'+width+'" height="187" rx="6" fill="#e2e7e8" stroke="#8296a0"/>' +
    '<path d="M'+left+' 75h'+width+'v93H'+left+'z" fill="#b8c6cd"/>';
  model.paths.forEach((_,index) => {
    const x = deviceTerminalX(model,index);
    if (index) marks += line(x-28.5,31,x-28.5,213,'#8296a0');
    for (const y of [58,187]) {
      marks += '<rect x="'+(x-14)+'" y="'+(y-12)+'" width="28" height="24" rx="4" fill="#899da7"/>';
    }
    marks += '<rect x="'+(x-20)+'" y="98" width="40" height="53" rx="4" fill="#384753"/>' +
      '<rect x="'+(x-15)+'" y="'+handleY+'" width="30" height="18" rx="3" fill="#202b33" stroke="#607987"/>' +
      label(x,handleY+13,on ? 'I' : tripped ? '–' : '0');
  });
  if (poles > 1) {
    marks += '<rect x="'+(left+19)+'" y="'+(handleY+15)+'" width="'+(width-38)+'" height="6" rx="2" fill="#26323c"/>';
  }
  marks += '<rect x="'+(left+5)+'" y="77" width="'+(width-10)+'" height="17" rx="3" fill="#263441"/>' +
    label(157,89,'MCB · '+poles+'P') +
    '<rect x="133" y="151" width="48" height="16" rx="3" fill="#263441"/>' +
    label(157,163,on ? t('ON') : tripped ? t('TRIP') : t('OFF'));
  return marks;
}
function residualFace(model,state) {
  const poles = model.paths.length;
  const rcbo = model.family === 'rcbo';
  const left = deviceTerminalX(model,0)-29;
  const width = (poles-1)*53+58;
  const right = left+width;
  const on = state === 'on';
  const tripped = state.startsWith('tripped:');
  const leverY = on ? 108 : tripped ? 121 : 135;
  let marks = '<rect x="'+(left-7)+'" y="102" width="'+(width+14)+'" height="51" rx="4" fill="#718491"/>' +
    '<rect x="'+left+'" y="29" width="'+width+'" height="187" rx="6" fill="#e2e7e8" stroke="#8296a0"/>' +
    '<path d="M'+left+' 77h'+width+'v93H'+left+'z" fill="#b8c6cd"/>';
  model.paths.forEach((_,index) => {
    const x = deviceTerminalX(model,index);
    for (const y of [58,187]) {
      marks += '<rect x="'+(x-13)+'" y="'+(y-11)+'" width="26" height="22" rx="4" fill="#899da7"/>';
    }
    if (index) {
      marks += line(x-26.5,31,x-26.5,74,'#8296a0') + line(x-26.5,172,x-26.5,213,'#8296a0');
    }
  });
  const leverX = left+9;
  const leverWidth = width-62;
  marks += '<rect x="'+leverX+'" y="102" width="'+leverWidth+'" height="55" rx="4" fill="#384753"/>' +
    '<rect x="'+(leverX+4)+'" y="'+leverY+'" width="'+(leverWidth-8)+'" height="17" rx="3" fill="'+(rcbo ? '#202b33' : '#2a5e87')+'"/>' +
    label(leverX+leverWidth/2,leverY+12,on ? 'I' : tripped ? '–' : '0') +
    '<rect x="'+(right-48)+'" y="104" width="39" height="20" rx="4" fill="#e4c856" stroke="#8d7432"/>' +
    '<text x="'+(right-28.5)+'" y="118" text-anchor="middle" style="fill:#17212b">TEST</text>' +
    '<rect x="'+(right-48)+'" y="131" width="39" height="19" rx="3" fill="#263441"/>' +
    label(right-28.5,144,tripped ? t('TRIP') : on ? t('ON') : t('OFF')) +
    '<rect x="'+(left+6)+'" y="79" width="'+(width-12)+'" height="16" rx="3" fill="#263441"/>' +
    label(157,91,model.family.toUpperCase()+' · IΔn') +
    '<text x="157" y="165" text-anchor="middle" style="fill:#233440">'+(rcbo ? t('Residual + overcurrent') : t('Residual current'))+'</text>';
  return marks;
}
function connectorFace(model) {
  const male = model.connector === 'male';
  let marks = '<rect x="58" y="30" width="199" height="112" rx="7" fill="#253744" stroke="#8295a2"/>';
  const phaseCount = model.paths.filter(path => path.label !== 'N').length;
  const hasNeutral = model.paths.some(path => path.label === 'N');
  if (phaseCount === 1) {
    if (male) {
      marks += '<rect x="158" y="72" width="24" height="29" rx="6" fill="#2c5592" stroke="#6799d7"/>' +
        '<path d="M108 68h53l13 9v22l-13 8h-53z" fill="#244c85" stroke="#6799d7"/>' +
        '<rect x="109" y="73" width="13" height="29" rx="4" fill="#1b365d"/>';
      for (const x of [138,144,150,156,162]) marks += line(x,77,x,99,'#4677b5');
      marks += '<ellipse cx="107" cy="87" rx="12" ry="20" fill="#d6dad3" stroke="#6799d7"/>' +
        '<circle cx="108" cy="78" r="3" fill="#111923" stroke="#526875"/>';
      for (const y of [86,96]) {
        marks += '<path d="M105 '+y+'H84" stroke="#667a88" stroke-width="6" stroke-linecap="round"/>' +
          '<path d="M105 '+(y-1)+'H84" stroke="#e1edf4" stroke-width="2" stroke-linecap="round"/>';
      }
    } else {
      marks += '<rect x="96" y="54" width="76" height="66" rx="7" fill="#244c85" stroke="#6799d7"/>' +
        '<ellipse cx="134" cy="49" rx="32" ry="15" fill="#2c5592" stroke="#6799d7"/>' +
        '<ellipse cx="134" cy="49" rx="25" ry="10" fill="#1a3561" stroke="#4677b5"/>' +
        line(121,60,147,60,'#9bb7da') +
        '<circle cx="134" cy="87" r="25" fill="#1b365d" stroke="#6799d7"/>' +
        '<circle cx="134" cy="87" r="20" fill="#142b4d" stroke="#4677b5"/>' +
        dot(124,91,'#111923') + dot(144,91,'#111923') +
        '<circle cx="134" cy="76" r="4" fill="#c8d9ec" stroke="#718491"/>';
    }
    marks += label(210,76,male ? t('MALE') : t('FEMALE')) + label(210,95,'2P+E') +
      label(251,115,'PE');
  } else {
    if (male) {
      marks += '<rect x="117" y="34" width="34" height="25" rx="4" fill="#8599a5" stroke="#acbac4"/>' +
        '<rect x="104" y="46" width="60" height="74" rx="9" fill="#a52f21" stroke="#ed6348"/>';
      for (const y of [40,45]) marks += line(122,y,146,y,'#526875');
    } else {
      marks += '<rect x="95" y="49" width="78" height="71" rx="6" fill="#a52f21" stroke="#ed6348"/>' +
        '<rect x="110" y="35" width="48" height="18" rx="4" fill="#c43e2a" stroke="#ed6348"/>' +
        line(116,51,152,51,'#702119') + dot(102,57,ac) + dot(166,112,ac);
    }
    marks += '<circle cx="134" cy="83" r="29" fill="#c43e2a" stroke="#ed6348" stroke-width="2"/>' +
      '<circle cx="134" cy="83" r="24" fill="#702119" stroke="#ed6348"/>';
    const twoLines = phaseCount === 2;
    const contacts = twoLines ? [[134,70,3.5],[121,83,3.5],[147,83,3.5],[134,98,4.5]]
      : [[126,72,3.5],[142,72,3.5],[120,86,3.5],[148,86,3.5],[134,98,4.5]];
    for (const [x,y,r] of contacts) {
      marks += '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(male ? '#c8d9ec' : '#111923')+
        '" stroke="'+(male ? '#8599a5' : '#ed6348')+'"/>';
    }
    marks += '<rect x="177" y="57" width="65" height="47" rx="4" fill="#192935"/>' +
      label(209,74,male ? t('MALE') : t('FEMALE')) + label(209,94,hasNeutral ? 'N' : twoLines ? t('L3 unused') : t('N unused')) +
      label(251,115,'PE');
  }
  model.paths.forEach(({label:conductor},index) => {
    const x = deviceTerminalX(model,index);
    if (model.role !== 'supply-plug') marks += screw(x,30,conductorColors[conductor]);
    marks += screw(x,142,conductorColors[conductor]);
  });
  return marks + screw(259,83,conductorColors.PE);
}
function diagram(model,state) {
  let marks = '', height = 0;
  if (model.connector) {
    marks = connectorFace(model);
    height = 156;
  } else if (model.powerContacts) {
    const energized = state === 'energized';
    const poles = model.powerContacts.length;
    const first = contactorTerminalX(model,0);
    const last = contactorTerminalX(model,poles);
    const faceLeft = first-23;
    const faceWidth = last-first+46;
    const upper = [...model.powerContacts.map(pair => pair[0]),'A1'];
    const lower = [...model.powerContacts.map(pair => pair[1]),'A2'];
    marks = '<defs><linearGradient id="housing-'+poles+'" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#464d53"/><stop offset="1" stop-color="#24292e"/></linearGradient></defs>' +
      '<rect x="'+(faceLeft+5)+'" y="18" width="'+(faceWidth-10)+'" height="40" rx="4" fill="#373f45"/>' +
      '<rect x="'+(faceLeft-10)+'" y="40" width="'+(faceWidth+10)+'" height="193" rx="8" fill="#22282d" stroke="#64717b"/>' +
      '<rect x="'+faceLeft+'" y="44" width="'+faceWidth+'" height="182" rx="6" fill="url(#housing-'+poles+')"/>' +
      line(faceLeft,101,faceLeft+faceWidth,101,'#171c21') +
      line(faceLeft,170,faceLeft+faceWidth,170,'#171c21') +
      '<text x="'+((first+last)/2)+'" y="121" text-anchor="middle"'+
        (polish ? ' textLength="87" lengthAdjust="spacingAndGlyphs"' : '')+'>'+t('CONTACTOR')+'</text>' + label(first+27,145,t(poles === 1 ? '{count} POLE · NO' : '{count} POLES · NO',{count:poles})) + label(first+27,161,model.coil.nominalVoltageDC+' V DC') +
      dot(last+5,155,energized ? active : '#497087');
    for (let i = 0; i < upper.length; i++) {
      const x = contactorTerminalX(model,i);
      const color = i < poles ? (energized ? active : ac) : inactive;
      for (const y of [78,198]) {
        marks += '<rect x="'+(x-17)+'" y="'+(y-14)+'" width="34" height="28" rx="3" fill="#20262b"/>' +
          '<circle cx="'+x+'" cy="'+y+'" r="9" fill="#7f8a91" stroke="'+color+'"/>' +
          line(x-4,y-4,x+4,y+4,'#333c43') + line(x-4,y+4,x+4,y-4,'#333c43');
      }
      marks += terminalLabel(x,60,upper[i]) + terminalLabel(x,219,lower[i]);
    }
    height = 242;
  } else if (model.supply) {
    const running = state === 'running';
    const terminals = [...model.terminals,model.protectiveEarth];
    marks = '<path d="M62 188h207l13 11v9H50v-9z" fill="#354b58" stroke="#8295a2"/>' +
      '<path d="M85 173h39v16H85zM180 173h60v16h-60z" fill="#354b58" stroke="#8295a2"/>' +
      '<rect x="132" y="99" width="133" height="80" rx="22" fill="#3f626e" stroke="#8aa9b4"/>' +
      '<path d="M242 102q20 3 23 24v28q-3 20-23 23z" fill="#263e4b" stroke="#8aa9b4"/>' +
      '<rect x="110" y="120" width="45" height="37" rx="6" fill="#54717d" stroke="#8aa9b4"/>' +
      '<path d="M87 113V79h22v37" fill="#397b91" stroke="#a4c3cf"/>' +
      '<ellipse cx="98" cy="79" rx="14" ry="7" fill="#253744" stroke="#a4c3cf"/><ellipse cx="98" cy="79" rx="9" ry="3" fill="#111923"/>' +
      '<path d="M78 114q20-20 44-5q19 12 18 33q-1 35-31 41q-32 6-44-20q-11-25 13-49z" fill="#397b91" stroke="#a4c3cf"/>' +
      '<circle cx="98" cy="145" r="26" fill="#35677b" stroke="#a4c3cf"/>' +
      '<path d="M97 134H48v22h49z" fill="#447d91" stroke="#a4c3cf"/>' +
      '<ellipse cx="48" cy="145" rx="7" ry="14" fill="#253744" stroke="#a4c3cf"/>' +
      '<ellipse cx="48" cy="145" rx="3" ry="9" fill="#111923"/>' +
      '<rect x="112" y="35" width="118" height="49" rx="6" fill="#253744" stroke="#8295a2"/>' +
      '<path d="M152 85h35v14h-35z" fill="#354b58" stroke="#8295a2"/>' +
      label(48,172,t('INLET'),'diagram-canvas-label') + label(57,94,t('OUTLET'),'diagram-canvas-label');
    for (const y of [111,119,155,163,171]) marks += line(158,y,237,y,'#203a46');
    terminals.forEach((terminal,index) => {
      const x = 127 + index * (88/(terminals.length-1));
      marks += terminalLabel(x,53,terminal) + screw(x,68,terminal === 'PE' ? '#9adba6' : ac);
    });
    marks += '<rect x="160" y="124" width="74" height="25" rx="4" fill="#192935"/>' +
      label(197,141,running ? t('RUNNING') : t('STOPPED')) + dot(250,137,running ? active : inactive);
    if (running) {
      const jet = 'M98 76C98 26 47 24 32 58Q26 72 23 86';
      marks += '<path class="pump-flow" d="M12 145H40"/>' +
        '<path d="M35 140l5 5-5 5" fill="none" stroke="#83c8ff" stroke-width="2"/>' +
        '<path class="pump-jet" d="'+jet+'"/>' +
        '<path class="pump-droplets" d="'+jet+'"/>';
    }
    height = 220;
  } else {
    const on = state === 'on';
    if (model.family === 'switch') {
      marks = '<rect x="58" y="29" width="199" height="187" rx="8" fill="#596b79" stroke="#8696a1"/>' +
        '<rect x="79" y="76" width="157" height="94" rx="8" fill="#b99824"/>' +
        '<rect x="79" y="73" width="157" height="94" rx="8" fill="#f3ce42" stroke="#ffeb84"/>' +
        '<circle cx="157" cy="120" r="39" fill="#a52f21" stroke="#ed6348" stroke-width="4"/>' +
        '<circle cx="157" cy="120" r="31" fill="#702119" stroke="#c6432e"/>' +
        '<g transform="rotate('+(on ? -43 : 43)+' 157 120)">' +
        '<rect x="145" y="91" width="24" height="58" rx="6" fill="#c43e2a" stroke="#f56a4b"/>' +
        '<path d="M151 99h12" stroke="#ffe6d2" stroke-width="3" stroke-linecap="round"/></g>' +
        '<rect x="87" y="84" width="22" height="18" rx="3" fill="#29323b"/>' +
        '<rect x="205" y="84" width="22" height="18" rx="3" fill="#29323b"/>' +
        label(98,97,'I') + label(216,97,'0') +
        '<rect x="188" y="143" width="42" height="18" rx="3" fill="#29323b"/>' +
        label(209,156,on ? t('ON') : t('OFF'));
    } else if (model.family === 'mcb') {
      marks = mcbFace(model,state);
    } else {
      marks = residualFace(model,state);
    }
    model.paths.forEach((path,index) => {
      const x = deviceTerminalX(model,index);
      marks += screw(x,58,on ? active : inactive) + screw(x,187,on ? active : inactive);
      marks += terminalLabel(x,16,path.label + ' ' + t('IN')) + terminalLabel(x,232,path.label + ' ' + t('OUT'));
    });
    height = 242;
  }
  return '<svg viewBox="0 0 320 '+height+'" role="img" aria-label="'+model.label+' '+t('device illustration')+', '+stateLabel(state)+'">'+marks+'</svg>';
}
const motorLines = simulator.querySelector('#motor-lines');
const residualProtection = simulator.querySelector('#residual-protection');
const useMcb = simulator.querySelector('#use-mcb');
const circuit = simulator.querySelector('#circuit');
const catalog = simulator.querySelector('#catalog');
const wiring = simulator.querySelector('#wiring');
const motorStatus = simulator.querySelector('#motor-status');

function circuitModels(count, residual, includeMcb) {
  const sequence = ['supply-plug', 'switch',
    ...(includeMcb ? ['mcb'] : []), ...(residual === 'none' ? [] : [residual]), 'relay',
    'motor-socket', 'motor-plug', 'motor'];
  return sequence.map(family => {
    const model = models.find(item => item.id === family + '-' + count);
    if (model.coil) return {...model,coil:{...model.coil,nominalVoltageDC:Number(pcbVoltage.value)}};
    if (count > 1 && residual !== 'none' && ['supply-plug',residual,'motor-socket'].includes(family)) {
      return {...model,paths:[...model.paths,...paths(['N'])]};
    }
    return model;
  });
}

function traceCircuit(stages) {
  const motor = stages.at(-1).model;
  return stages[0].model.paths.map(({label:conductor}) => {
    const terminal = motor.terminals[motor.supply.indexOf(conductor)];
    let continuous = true;
    const segments = stages.slice(0,-1).map(({model,state}) => {
      if (!terminal && model.role === 'motor-plug') return {status:'—', className:''};
      const path = model.paths?.find(item => item.label === conductor);
      const pair = model.powerContacts?.[lines.indexOf(conductor)];
      const terminals = path ? [path.from,path.to] : pair;
      const disconnected = state === 'unplugged';
      if (disconnected) continuous = false;
      const upstream = continuous;
      if (!terminals) return {status:t('Bypass'), className:continuous ? 'live' : '', upstream, continuous};
      const closed = closedConnections(model,state).some(([from,to]) => from === terminals[0] && to === terminals[1]);
      continuous = continuous && closed;
      return {
        status:disconnected ? t('Unplugged') : closed ? (continuous ? t('Through') : t('Closed')) : t('Open'),
        className:closed ? (continuous ? 'live' : '') : 'open',
        terminals, closed, upstream, continuous, disconnected
      };
    });
    return {conductor, terminal, segments, continuous};
  });
}

const conductorColors = {L1:'#ffad66', L2:'#f28bb8', L3:'#c3a5ff', N:'#83c8ff', PE:'#e0db73'};

function wireLegend(routes) {
  const conductors = [...routes.map(route => route.conductor),'PE'];
  const names = {L1:routes.length === 2 && conductors.includes('N') ? t('L1 (live)') : 'L1', N:t('N (neutral)'), PE:t('PE (protective earth)')};
  return '<p class="wire-legend">'+conductors.map(conductor =>
    '<span><i aria-hidden="true" style="--wire-color:'+conductorColors[conductor]+'"></i>'+
    (names[conductor] || conductor)+'</span>'
  ).join('')+'<span>'+t('Faded, dashed lines show where the supply path is interrupted.')+'</span></p>';
}

function wiringDiagram(stages,routes) {
  const width = 380;
  const pcbColumn = 326;
  const scale = 0.82;
  const left = 44;
  const positions = [];
  let y = 22;
  for (const {model} of stages) {
    positions.push(y);
    y += model.connector ? 162 : 238;
  }
  const modelY = index => positions[index];
  const motorIndex = stages.length-1;
  const plugConnected = stages.at(-2).state === 'on';
  const height = modelY(motorIndex)+190;
  const point = (index,x,y) => [left+x*scale,modelY(index)+y*scale];
  const wire = (points,color,continuous=true,strokeWidth=2.4) => '<polyline points="'+points.map(([x,y]) => x+','+y).join(' ')+
    '" fill="none" stroke="'+color+'" stroke-width="'+strokeWidth+'" stroke-linejoin="round"'+
    (continuous ? '' : ' stroke-opacity="0.5" stroke-dasharray="5 4"')+'/>';
  const devices = stages.map(({model,state},index) => {
    const face = diagram(model,state);
    const inner = face.slice(face.indexOf('>')+1,face.lastIndexOf('</svg>'));
    const matingLabel = model.role === 'motor-socket'
      ? label(width/2,modelY(index)+140,plugConnected ? t('Plug and socket mated') : t('Motor plug disconnected')) : '';
    const canToggle = ['switch','mcb','rccb','rcbo'].includes(model.family);
    const tripped = state.startsWith('tripped:');
    const moduleLabel = tripped ? t('Reset {device}',{device:model.label}) : model.label;
    const on = state === 'on' || state === 'energized';
    const action = canToggle ? ' class="module-toggle" role="button" tabindex="0" data-stage="'+index+
      '" aria-label="'+moduleLabel+'"'+(tripped ? '' : ' aria-pressed="'+on+'"') : '';
    const hitArea = canToggle ? '<rect class="module-hit" x="36" y="24" width="252" height="202" rx="10"/>' : '';
    return '<g data-device-face'+(model.coil ? ' data-contactor' : '')+action+' transform="translate('+left+' '+modelY(index)+') scale('+scale+')">'+inner+(canToggle ? clickHint(266,29) : '')+hitArea+'</g>'+matingLabel;
  }).join('');

  let cables = '';
  let endpoints = '';
  const motor = stages[motorIndex].model;
  const motorPin = index => point(motorIndex,127 + index*(88/motor.terminals.length),68);

  function connect(from,to,color,continuous,lane) {
    return wire([from,[from[0],lane],[to[0],lane],to],color,continuous);
  }

  routes.forEach(({conductor,terminal,segments,continuous},index) => {
    const color = conductorColors[conductor];
    const bypassX = width-33;
    let source;
    let bypassing = false;
    segments.forEach((segment,stageIndex) => {
      const model = stages[stageIndex].model;
      if (!terminal && model.role === 'motor-plug') return;
      const lane = modelY(stageIndex)-7+index*11;
      if (!segment.terminals) {
        if (!bypassing) {
          const bypassLane = modelY(stageIndex)-32;
          const bypass = [bypassX,bypassLane];
          cables += connect(source,bypass,color,segment.upstream,bypassLane);
          source = bypass;
          bypassing = true;
        }
        return;
      }
      const pole = model.paths?.findIndex(path => path.label === conductor) ?? lines.indexOf(conductor);
      const x = model.powerContacts ? contactorTerminalX(model,pole)
        : deviceTerminalX(model,pole);
      const input = point(stageIndex,x,model.connector ? 30 : model.powerContacts ? 78 : 58);
      const output = point(stageIndex,x,model.connector ? 142 : model.powerContacts ? 198 : 187);
      if (model.role !== 'supply-plug') {
        if (model.role !== 'motor-plug') cables += connect(source,input,color,segment.upstream,lane);
        endpoints += dot(...input,color);
      }
      endpoints += dot(...output,color);
      source = output;
      bypassing = false;
    });
    if (!terminal) return;
    const pin = motorPin(index);
    cables += connect(source,pin,color,continuous,modelY(motorIndex)-7+index*11);
    endpoints += dot(...pin,color);
  });

  const earth = motorPin(motor.terminals.length);
  const earthSource = [width-13,43];
  const earthColor = conductorColors.PE;
  const supply = stages.findIndex(({model}) => model.role === 'supply-plug');
  const socket = stages.findIndex(({model}) => model.role === 'motor-socket');
  const plug = stages.findIndex(({model}) => model.role === 'motor-plug');
  endpoints += dot(...earth,earthColor);
  if (socket === -1) {
    cables += connect(earthSource,earth,earthColor,true,modelY(motorIndex)+28);
  } else {
    const earthPin = index => point(index,259,83);
    const supplyEarth = earthPin(supply);
    const socketEarth = earthPin(socket);
    const plugEarth = earthPin(plug);
    cables += wire([supplyEarth,[earthSource[0],supplyEarth[1]],[earthSource[0],socketEarth[1]],socketEarth],earthColor) +
      wire([plugEarth,[earthSource[0],plugEarth[1]],[earthSource[0],modelY(motorIndex)+28],
        [earth[0],modelY(motorIndex)+28],earth],earthColor);
    endpoints += dot(...supplyEarth,earthColor) + dot(...socketEarth,earthColor) + dot(...plugEarth,earthColor);
  }
  const connectorLabels = stages.map(({model},index) => {
    if (!model.connector) return '';
    const [x,y] = point(index,157,48);
    const title = '<rect x="'+(x-76)+'" y="'+(y-12)+'" width="152" height="16" rx="4" fill="#192935"/>' +
      label(x,y,model.label,'diagram-dark-label');
    const pins = model.paths.map(({label:conductor},pin) => {
      const [pinX,pinY] = point(index,deviceTerminalX(model,pin),model.role === 'supply-plug' ? 148 : 23);
      return '<text x="'+(pinX+9)+'" y="'+pinY+'" class="connector-pin-label">'+conductor+'</text>';
    }).join('');
    return title+pins;
  }).join('');
  const relayIndex = stages.findIndex(({model}) => model.family === 'relay');
  const relay = stages[relayIndex];
  const relay1 = pcbConnectors.find(connector => connector.id === 'relay-1');
  const boardX = 14;
  const boardY = modelY(relayIndex)-126;
  const boardScale = 0.40;
  const coilX = contactorTerminalX(relay.model,relay.model.powerContacts.length);
  const coilLive = relay.state === 'energized';
  const board = '<g transform="translate('+boardX+' '+boardY+') scale('+boardScale+')">'+pcbArtworkMarkup+'</g>' +
    label(boardX+62,boardY-13,t('Autolejek PCB')) +
    '<g class="module-toggle" role="button" tabindex="0" data-stage="'+relayIndex+
    '" aria-label="'+t('PCB RELAY1 output')+'" aria-pressed="'+coilLive+'">'+
    '<rect x="'+(boardX+130)+'" y="'+(boardY-32)+'" width="156" height="28" rx="6" fill="'+
    (coilLive ? 'var(--pump-relay-on)' : 'var(--pump-relay-off)')+'" stroke="#7896af"/>'+
    clickHint(boardX+133,boardY-30)+label(boardX+220,boardY-14,coilLive ? t('RELAY1 ON · {voltage} V DC',{voltage:relay.model.coil.nominalVoltageDC}) : t('RELAY1 OFF · Turn on'),'diagram-dark-label')+
    '<rect class="module-hit" x="'+(boardX+130)+'" y="'+(boardY-32)+'" width="156" height="28" rx="6"/></g>';
  const dcWires = ['VOUT','GND'].map(pin => {
    const positive = pin === 'VOUT';
    const pinIndex = relay1.pins.indexOf(pin);
    const from = [boardX+(relay1.x+relay1.pitch*(pinIndex+.5))*boardScale,boardY+(relay1.y+36)*boardScale];
    const [localX,localY] = point(relayIndex,coilX,positive ? 78 : 198);
    const to = [pcbColumn+localX,localY];
    const color = positive ? '#ff6479' : '#b8a8d7';
    const lane = boardY+740*boardScale+(positive ? 15 : 29);
    const coilLane = modelY(relayIndex)+(positive ? 30 : 192);
    const side = pcbColumn+left+(positive ? -17 : -6);
    const points = [from,[from[0],lane],[side,lane],[side,coilLane],[to[0],coilLane],to];
    return '<g data-dc-lead="'+pin+'">'+wire(points,'var(--sim-background)',true,6)+
      wire(points,color,!positive||coilLive)+dot(...from,color)+dot(...to,color)+'</g>';
  }).join('');
  return '<svg viewBox="0 0 '+(width+pcbColumn)+' '+height+'" role="group" aria-label="'+t('Motor power and Autolejek PCB control wiring')+'">'+
    board+'<g transform="translate('+pcbColumn+' 0)">'+devices+'<g pointer-events="none">'+
    cables+endpoints+connectorLabels+'</g></g><g pointer-events="none">'+dcWires+'</g></svg>';
}

function deviceCard(stage, update) {
  const {model} = stage;
  const card = document.createElement('article');
  card.innerHTML = '<h3>'+model.label+'</h3><p>'+details[model.family]+'</p><output></output><div class="controls"></div>';
  const actions = card.querySelector('.controls');
  function button(caption,event) {
    const control = document.createElement('button');
    control.type = 'button';
    control.textContent = caption;
    control.addEventListener('click', () => {
      stage.state = nextState(model,stage.state,event);
      update();
    });
    actions.append(control);
    return control;
  }
  const test = model.trips?.includes('residual current') ? button(t('Test device'),'test') : null;
  const faults = (model.trips || []).map(fault => button(t('Simulate '+fault),fault));
  const reset = model.trips ? button(t('Reset'),'reset') : null;
  return {card, render(hasSupply) {
    const {state} = stage;
    const status = card.querySelector('output');
    status.textContent = stateLabel(state);
    status.dataset.state = state.startsWith('tripped:') ? 'tripped' : state;
    const tripped = state.startsWith('tripped:');
    if (test) test.disabled = !hasSupply || state !== 'on';
    faults.forEach(control => { control.disabled = state !== 'on'; });
    if (reset) reset.disabled = !tripped;
  }};
}

function configureCircuit() {
  const count = Number(motorLines.value);
  circuit.hidden = !count;
  simulator.querySelector('#pcb-preview').hidden = Boolean(count);
  if (!count) {
    updateVinLabels();
    return;
  }
  const stages = circuitModels(count,residualProtection.value,useMcb.value === 'on')
    .map(model => ({model,state:model.initial}));
  const motor = stages.at(-1);
  const cards = stages.flatMap((stage,index) => stage.model.connector ? [] : [{...deviceCard(stage,update),index}]);
  const group = document.createElement('section');
  group.append(...cards.map(({card}) => card));
  catalog.replaceChildren(group);

  function update() {
    const focusedStage = wiring.contains(document.activeElement) ? document.activeElement.dataset?.stage : undefined;
    const routes = traceCircuit(stages);
    motor.state = routes.every(route => !route.terminal || route.continuous) ? 'running' : 'stopped';
    motorStatus.textContent = motor.state === 'running' ? t('Pump running') : t('Pump stopped');
    motorStatus.dataset.state = motor.state;
    const headers = stages.map(({model}) => '<th scope="col">'+model.label+'</th>').join('');
    const rows = routes.map(({conductor,terminal,segments,continuous}) => '<tr><th scope="row">'+conductor+'</th>'+
      segments.map(({status,className}) => '<td class="'+className+'">'+status+'</td>').join('')+
      (terminal ? '<td class="'+(continuous ? 'live' : '')+'">'+terminal+' · '+(continuous ? t('Connected') : t('Interrupted'))+'</td>' : '<td>—</td>')+'</tr>').join('');
    wiring.innerHTML = wiringDiagram(stages,routes) + wireLegend(routes) + '<table><caption>'+t('Power path from supply to motor')+'</caption><thead><tr><th scope="col">'+t('Supply')+'</th>'+
      headers+'</tr></thead><tbody>'+rows+'<tr><th scope="row">PE</th><td class="earth" colspan="'+
      stages.length+'">'+(stages.at(-2).state === 'on' ? t('PE runs through the plug and socket to the motor chassis.') : t('Supply PE ends at the socket. Motor PE ends at the disconnected plug.'))+'</td></tr></tbody></table>';
    updateVinLabels();
    wiring.querySelectorAll('[data-stage]').forEach(control => {
      function toggleModule() {
        const stage = stages[Number(control.dataset.stage)];
        const event = stage.state.startsWith('tripped:') ? 'reset' : 'toggle';
        stage.state = nextState(stage.model,stage.state,event);
        update();
      }
      control.addEventListener('click',toggleModule);
      control.addEventListener('keydown',event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        if (!event.repeat) toggleModule();
      });
    });
    if (focusedStage !== undefined) wiring.querySelector('[data-stage="'+focusedStage+'"]')?.focus({preventScroll:true});
    cards.forEach(({render,index}) => render(routes.every(route => route.segments[index]?.upstream)));
  }
  update();
}
if (meterSimulator) {
  configureMeterSimulator();
} else if (valveSimulator) {
  configureValveSimulator();
} else {
  for (const control of [motorLines,residualProtection,useMcb,pcbVoltage]) control.addEventListener('change',configureCircuit);
  configureCircuit();
}
