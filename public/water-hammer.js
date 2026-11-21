const get = id => document.getElementById(id)
const ctx = get('diagram').getContext('2d')
ctx.scale(2, 2)
const fullTurn = 360
const dialOffset = -90
const waveDuration = 4.2
const needleSpeed = 140
const flowRampDuration = 2
const minReverseTravel = 15
const maxReverseTravel = 30
const pulseDuration = .14
const sensorHighlightAngle = 20
const waterSpeed = 67
const pipe = new Path2D('M16 141H108Q126 141 126 159V207Q126 226 145 226H244Q263 226 263 207V161Q263 141 283 141H434')
const points = [[16,141],[108,141]]
for (const [a,b,c] of [
  [[108,141],[126,141],[126,159]], [[126,207],[126,226],[145,226]],
  [[244,226],[263,226],[263,207]], [[263,161],[263,141],[283,141]]
]) {
  points.push(a)
  for (let i = 1; i <= 12; i++) {
    const t = i/12
    points.push(a.map((v,k) => (1-t)**2*v+2*t*(1-t)*b[k]+t*t*c[k]))
  }
}
points.push([434,141])
const segments = []
let length = 0
for (let i = 1; i < points.length; i++) {
  const [x,y] = points[i-1]
  const dx = points[i][0]-x, dy = points[i][1]-y
  const size = Math.hypot(dx,dy)
  if (size > 0) {
    segments.push({x,y,dx,dy,size,from:length})
    length += size
  }
}
const valveDistance = length - 76
const meterDistance = segments.find(s => s.x === 145).from + 47
const clamp = x => Math.max(0, Math.min(1,x))
const mix = (a,b,t) => a+(b-a)*clamp(t)
const ease = t => clamp(t)**2*(3-2*clamp(t))
function position(distance) {
  const s = segments.find(s => distance <= s.from+s.size) || segments.at(-1)
  const f = clamp((distance-s.from)/s.size)
  return [s.x+s.dx*f,s.y+s.dy*f,Math.atan2(s.dy,s.dx)]
}
function gradient(y,h,colors) {
  const g = ctx.createLinearGradient(0,y,0,y+h)
  colors.forEach((color,i) => g.addColorStop(i/(colors.length-1),color))
  return g
}
const brass = ['#664016','#f9ce77','#bb8238','#79501f','#432916']
const steel = ['#354858','#e6edf0','#8799a4','#475862','#26323a']
const black = ['#081517','#526366','#27363b','#0d171c','#050c10']
const green = ['#0d2520','#529773','#246045','#123b2d','#071e19']
const blue = ['#175076','#64c8ee','#278bb6','#135575']
function box(x,y,w,h,r,fill,outline) {
  ctx.beginPath()
  ctx.roundRect(x,y,w,h,r)
  ctx.fillStyle = Array.isArray(fill) ? gradient(y,h,fill) : fill
  ctx.fill()
  if (outline) {
    ctx.strokeStyle = outline
    ctx.lineWidth = 1
    ctx.stroke()
  }
}
function line(points,color,width) {
  ctx.beginPath()
  points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y))
  ctx.strokeStyle=color
  ctx.lineWidth=width
  ctx.stroke()
}
function disk(x,y,r,fill) {
  ctx.beginPath()
  ctx.arc(x,y,r,0,Math.PI*2)
  ctx.fillStyle=Array.isArray(fill) ? gradient(y-r,2*r,fill) : fill
  ctx.fill()
}
function fitting(x,y,angle,colors,w=24,h=35) {
  ctx.save()
  ctx.translate(x,y)
  ctx.rotate(angle)
  box(-w/2,-h/2,w,h,4,colors,'#070f16')
  for(let i=-w/2+4;i<w/2-2;i+=4) {
    line([[i,-h/2+2],[i,h/2-2]],'#07191b77',1.4)
    line([[i+1,-h/2+3],[i+1,h/2-3]],'#ffffff21',.8)
  }
  ctx.restore()
}
function label(text,x,y,color=getComputedStyle(get('diagram')).color) {
  ctx.fillStyle=color
  ctx.font='700 12px system-ui'
  ctx.textAlign='center'
  ctx.fillText(text,x,y)
}
function flowArrow(distance,lane,direction,color,size) {
  const [x,y,angle] = position(distance)
  ctx.save()
  ctx.translate(x,y)
  ctx.rotate(angle)
  ctx.translate(0,lane)
  ctx.scale(direction,1)
  line([[-size,0],[size,0]],color,1.65)
  line([[size-4,-3],[size,0],[size-4,3]],color,1.65)
  ctx.restore()
}
function draw(t, state) {
  const {closed, wave, backward, shift, outletShift, angle, count, lastPulse} = state
  const gate = Number(closed)
  const forward = !closed
  const reverse = wave
  const pulse = 1-clamp((t-lastPulse)/pulseDuration)
  ctx.clearRect(0,0,450,360)
  ctx.lineCap='round'
  ctx.lineJoin='round'
  for(let x=16;x<450;x+=14) for(let y=22;y<340;y+=14) {
    ctx.fillStyle='#7895aa34'
    ctx.fillRect(x,y,1,1)
  }

  // Cable from the meter to the pulse display.
  const cable = new Path2D('M200 183C233 175 211 92 229 74S295 72 313 50L343 17')
  ctx.lineWidth=2
  ctx.setLineDash([4,5])
  ctx.strokeStyle=pulse ? '#c77816' : '#627d91'
  ctx.lineDashOffset=-(1-pulse)*34
  ctx.stroke(cable)
  ctx.setLineDash([])
  label(get("wh-copy-0").textContent,263,61,pulse ? '#b96a13' : undefined)

  ctx.save()
  ctx.shadowColor='#000a'
  ctx.shadowBlur=12
  ctx.shadowOffsetY=7
  ctx.lineWidth=34
  ctx.strokeStyle='#081119'
  ctx.stroke(pipe)
  ctx.restore()
  ctx.lineWidth=30
  ctx.strokeStyle='#3d505a'
  ctx.stroke(pipe)
  ctx.lineWidth=27
  ctx.strokeStyle='#18282f'
  ctx.stroke(pipe)
  box(13,126,66,30,6,blue,'#16475c')
  box(394,126,43,30,6,blue,'#16475c')

  box(113,101,26,51,5,black,'#0b141b')
  fitting(126,105,Math.PI/2,green,20,32)
  fitting(126,92,Math.PI/2,black,10,30)
  fitting(77,141,0,green)
  fitting(101,141,0,black,19,32)
  fitting(126,186,Math.PI/2,green,18,34)
  fitting(150,226,0,green,19,36)
  fitting(238,226,0,green,17,36)
  fitting(263,182,Math.PI/2,black,17,35)
  fitting(299,141,0,green,19,35)
  fitting(401,141,0,green,21,35)

  // Brass bodies, threaded unions and the solenoid coil.
  box(160,209,65,34,10,brass,'#302314')
  fitting(166,226,0,brass,15,33)
  fitting(220,226,0,brass,15,33)
  box(328,120,65,40,11,brass,'#302314')
  fitting(330,141,0,brass,13,34)
  fitting(386,141,0,brass,13,34)
  box(338,108,41,20,6,brass,'#382915')
  box(339,73,39,41,5,black,'#080e13')
  box(343,77,30,31,3,['#37434b','#151e25','#101820'])
  box(377,80,14,23,3,steel,'#192328')
  fitting(384,78,Math.PI/2,black,9,14)
  box(353,65,11,10,3,steel)
  disk(368,86,2.6,gate > .5 ? '#ffb35e' : '#68e1b9')

  // The transparent cutaway follows the connected pipe centreline.
  ctx.save()
  ctx.lineCap='butt'
  ctx.lineWidth=16
  ctx.strokeStyle='#073347'
  ctx.stroke(pipe)
  ctx.lineWidth=13
  ctx.strokeStyle=gate > .5 ? '#17627c' : '#187c9e'
  ctx.stroke(pipe)
  ctx.lineWidth=1
  ctx.strokeStyle='#91e9ff45'
  ctx.stroke(pipe)
  ctx.restore()
  for(let i=0;i<31;i++) {
    const upstream = i < 26
    const span = upstream ? valveDistance-7 : length-valveDistance-7
    const offset = upstream ? 0 : valveDistance+7
    const movement = upstream ? shift : outletShift
    const d = offset+((i*19+movement)%span+span)%span
    const [x,y,a] = position(d)
    const lane = i%3*4-4
    disk(x-Math.sin(a)*lane,y+Math.cos(a)*lane,1.1,i%2 ? '#86eaff' : '#50c9ec')
  }
  if (forward || reverse) {
    for(let d=29+((shift%48)+48)%48;d<length-12;d+=48) {
      if ((!reverse || d < valveDistance-12) && Math.abs(d-meterDistance)>30 && Math.abs(d-valveDistance)>15) {
        flowArrow(d,0,reverse ? -1 : 1,'#b9f7ff',8)
      }
    }
  }

  // The dial is viewed from the front so its small changes in direction are visible.
  disk(194,207,34,'#06111c')
  disk(193,203,33,['#96c3f9','#1c5cb3','#123673','#10274a'])
  disk(193,199,29,steel)
  disk(193,199,25,['#fbfdfd','#dce6ea','#abbfc9'])
  for(let i=0;i<24;i++) {
    const a=i*Math.PI/12
    const r=i%6===0 ? 18 : 20
    line([[193+Math.cos(a)*r,199+Math.sin(a)*r],[193+Math.cos(a)*22,199+Math.sin(a)*22]],'#596e79',1)
  }
  box(180,187,26,8,2,'#334856')
  ctx.font='6px monospace'
  ctx.textAlign='center'
  ctx.fillStyle='#e7f4f9'
  ctx.fillText('00000',193,193)
  const markerSpacing=fullTurn/markersPerTurn
  const highlightAngle=Math.min(sensorHighlightAngle,markerSpacing*.4)
  const closestMarker=Math.round(angle/markerSpacing)
  const nearSensor=(forward || reverse) && Math.abs(angle-closestMarker*markerSpacing)<=highlightAngle
  for(let i=0;i<markersPerTurn;i++) {
    const mark=(i*markerSpacing+dialOffset)*Math.PI/180
    const active=pulse>0 && i===state.lastMarker
    const nearby=nearSensor && i===markerOnDial(closestMarker)
    const radius=active ? 4 : nearby ? 3.5 : 2.6
    const color=active ? '#fff0b5' : nearby ? '#ffdc75' : '#f5b74e'
    disk(193+26*Math.cos(mark),199+26*Math.sin(mark),radius,color)
  }
  const needle=(angle+dialOffset)*Math.PI/180
  line([[193,199],[193+16*Math.cos(needle),199+16*Math.sin(needle)]],'#bd3f32',2.4)
  disk(193,199,2.5,'#82392f')

  if(wave) {
    const head=mix(valveDistance,meterDistance-92,backward)
    for(let i=0;i<5;i++) {
      const [x,y,a]=position(Math.min(valveDistance,head+i*7))
      ctx.save()
      ctx.translate(x,y)
      ctx.rotate(a)
      ctx.shadowBlur=12
      ctx.shadowColor='#ff8a3d'
      ctx.globalAlpha=(1-i*.16)*(1-.65*ease((backward-.83)/.17))
      ctx.beginPath()
      ctx.moveTo(3,-10)
      ctx.quadraticCurveTo(-8,0,3,10)
      ctx.strokeStyle='#ffc369'
      ctx.lineWidth=i===0 ? 3 : 1.5
      ctx.stroke()
      ctx.restore()
    }
    if(reverse) flowArrow(head,-20,-1,'#ffc369',12)
  }
  box(354,119+gate*14,8,16,3,gate > .5 ? ['#ffe0a5','#d27e32','#8f471b'] : steel,'#402e21')
  label(get("wh-copy-1").textContent,45,174)
  label(get("wh-copy-2").textContent,419,174)
  line([[193,248],[193,263]],'#648296',1)
  label(get("wh-copy-3").textContent,193,281)
  line([[358,165],[358,181]],'#648296',1)
  label(get("wh-copy-4").textContent,358,198)
  label(gate > .5 ? get("wh-copy-5").textContent : get("wh-copy-6").textContent,358,217,gate > .5 ? '#ad661b' : '#228666')

  const title = wave ? get("wh-copy-7").textContent : closed ? get("wh-copy-8").textContent : get("wh-copy-9").textContent
  const description = settingsError || (count >= target
    ? wave ? get("wh-copy-10").textContent : get("wh-copy-11").textContent
    : wave ? get("wh-copy-12").textContent
    : closed ? get("wh-copy-13").textContent
    : pulse ? get("wh-copy-14").textContent
    : get("wh-copy-15").textContent)
  if (get('title').textContent !== title) get('title').textContent = title
  const descriptionNode=get('description')
  const status=get('status')
  const startBlocked=closed && (Boolean(settingsError) || wave || count>=target)
  if(descriptionNode.textContent!==description) descriptionNode.textContent=description
  status.classList.toggle('start-blocked',startBlocked)
  const displayCount=String(count).padStart(2,'0')
  if(get('count').textContent!==displayCount) get('count').textContent=displayCount
  const indicated=volumeFormat.format(count*litersPerPulse)+' l'
  const net=volumeFormat.format((angle-resetAngle)/fullTurn*markersPerTurn*litersPerPulse)+' l'
  if(get('indicated').textContent!==indicated) get('indicated').textContent=indicated
  if(get('net').textContent!==net) get('net').textContent=net
  get('counter').classList.toggle('active',pulse>0)
  get('progress').style.transform='scaleX('+backward+')'
}

const state = {
  closed:true, wave:false, backward:0, shift:0, outletShift:0,
  angle:0, count:0, lastPulse:-Infinity
}
let time=0
let previous
let reverseAngle=0
let flowElapsed=0
const targetField=get('target')
let target=1
let settingsError=''
let speed=Number(get('speed').value)
let frame=null
let resetAngle=state.angle
let litersPerPulse=1
let markersPerTurn=1
const locale=document.documentElement.lang || 'pl'
const volumeChoices=new Intl.ListFormat(locale,{type:'disjunction'})
const volumeFormat=new Intl.NumberFormat(document.documentElement.lang,{maximumSignificantDigits:4})
const calibrationUnit=get('calibration-unit')
const calibrationValue=get('calibration-value')
const pulseDensity=get('pulse-density')
const calibration=get('calibration')
const resetButton=get('reset')

function markerOnDial(index) {
  return (index%markersPerTurn+markersPerTurn)%markersPerTurn
}
function pulseIndex(angle) {
  const estimated=Math.round(angle*markersPerTurn/fullTurn)
  return angle < estimated*fullTurn/markersPerTurn ? estimated-1 : estimated
}

function displayCalibration() {
  const perLiter=calibrationUnit.value==='per-liter'
  get('density-setting').hidden=!perLiter
  get('volume-setting').hidden=perLiter
  pulseDensity.value=markersPerTurn
  calibrationValue.value=perLiter ? 1 : litersPerPulse
}

function updateTarget() {
  const targetLiters=targetField.valueAsNumber
  const perLiter=calibrationUnit.value==='per-liter'
  const pulses=perLiter ? targetLiters*markersPerTurn : targetLiters/litersPerPulse
  settingsError=''
  if(!Number.isSafeInteger(targetLiters) || targetLiters<1) settingsError=get("wh-TargetInteger").textContent
  else if(!perLiter && targetLiters%litersPerPulse!==0) {
    const lower=targetLiters-targetLiters%litersPerPulse
    const upper=lower+litersPerPulse
    const volumes=[lower,upper].filter(value=>value>0 && Number.isSafeInteger(value))
      .map(value=>value.toLocaleString(locale)+' l')
    settingsError=get("wh-TargetMultiple").textContent.replace('{volumes}',volumeChoices.format(volumes))
  } else if(!Number.isSafeInteger(pulses)) settingsError=get("wh-TargetTooLarge").textContent
  target=settingsError ? Infinity : pulses
  targetField.setAttribute('aria-invalid',String(Boolean(settingsError)))
  get('target-pulses').textContent=Number.isFinite(target)
    ? target.toLocaleString(document.documentElement.lang || 'pl') : '—'
}

function render() {
  draw(time,state)
  get('start').disabled = !state.closed || state.wave || state.count >= target || !Number.isFinite(target)
  targetField.disabled = !state.closed || state.wave
  calibrationUnit.disabled = targetField.disabled || state.count>0
  calibrationValue.disabled = calibrationUnit.disabled
  pulseDensity.disabled = calibrationUnit.disabled
  calibration.tabIndex = calibrationUnit.disabled ? 0 : -1
  if(!calibrationUnit.disabled) resetButton.classList.remove('reset-highlight')
  get('stop').disabled = state.closed
  resetButton.disabled = state.wave
}
// Convert elapsed time during startup to equivalent time at full flow.
function fullFlowTime(elapsed) {
  const rampTime=Math.min(elapsed,flowRampDuration)
  return rampTime*rampTime/(2*flowRampDuration)+Math.max(0,elapsed-flowRampDuration)
}
function tick(now) {
  frame=null
  const dt=previous===undefined ? 0 : Math.max(0,now-previous)*speed/1000
  previous=now
  time+=dt
  if(state.wave) {
    const progress=clamp(state.backward+dt/waveDuration)
    const step=progress-state.backward
    state.shift-=81*step
    state.angle-=reverseAngle*step
    state.backward=progress
    state.wave=progress<1-1e-9
  } else if(!state.closed) {
    const previousIndex=pulseIndex(state.angle)
    const endAngle=(previousIndex+target-state.count)*fullTurn/markersPerTurn
    const previousFlowTime=fullFlowTime(flowElapsed)
    flowElapsed+=dt
    const flowTime=fullFlowTime(flowElapsed)-previousFlowTime
    const nextAngle=Math.min(endAngle,state.angle+needleSpeed*flowTime)
    const movement=(nextAngle-state.angle)/needleSpeed*waterSpeed
    state.angle=nextAngle
    state.shift+=movement
    state.outletShift+=movement
    const lastIndex=pulseIndex(nextAngle)
    const crossings=lastIndex-previousIndex
    if(crossings>0) {
      state.count+=crossings
      state.lastMarker=markerOnDial(lastIndex)
      state.lastPulse=time
    }
    if(state.count>=target) stop()
  }
  render()
  if(!state.closed || state.wave) frame=requestAnimationFrame(tick)
}
function start() {
  if(!state.closed || state.wave || state.count>=target || !Number.isFinite(target)) return
  state.closed=false
  flowElapsed=0
  state.backward=0
  previous=undefined
  render()
  frame=requestAnimationFrame(tick)
}
function stop() {
  if(state.closed) return
  state.closed=true
  state.wave=true
  reverseAngle=minReverseTravel+Math.floor(Math.random()*(maxReverseTravel-minReverseTravel+1))
  render()
}
function reset() {
  if(state.wave) return
  if(frame!==null) cancelAnimationFrame(frame)
  frame=null
  state.closed=true
  state.wave=false
  state.backward=0
  state.count=0
  resetButton.classList.remove('reset-highlight')
  resetAngle=state.angle
  state.lastPulse=-Infinity
  render()
}
targetField.addEventListener('input',()=>{
  updateTarget()
  render()
})
get('speed').addEventListener('input',()=>{
  speed=Number(get('speed').value)
  get('speed-value').textContent=speed.toLocaleString(document.documentElement.lang)+'×'
})
calibrationUnit.addEventListener('change',()=>{
  markersPerTurn=1
  litersPerPulse=1
  displayCalibration()
  updateTarget()
  render()
})
pulseDensity.addEventListener('change',()=>{
  markersPerTurn=Number(pulseDensity.value)
  litersPerPulse=1/markersPerTurn
  updateTarget()
  render()
})
calibrationValue.addEventListener('change',()=>{
  litersPerPulse=Number(calibrationValue.value)
  updateTarget()
  render()
})
function highlightReset() {
  if(calibrationUnit.disabled) resetButton.classList.add('reset-highlight')
}
calibration.addEventListener('click',highlightReset)
calibration.addEventListener('focus',highlightReset)
resetButton.addEventListener('click',reset)
get('start').addEventListener('click',start)
get('stop').addEventListener('click',stop)
displayCalibration()
updateTarget()
render()
