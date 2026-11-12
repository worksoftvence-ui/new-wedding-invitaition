(function(){
'use strict';
const C=window.WEDDING||{};
const $=id=>document.getElementById(id);
const $$=s=>document.querySelectorAll(s);

/* ---------- fill text from the details block ---------- */
$$('[data-t]').forEach(e=>{const v=C[e.dataset.t];if(v)e.textContent=v});

/* ---------- date & time (always shown in Bangladesh time) ---------- */
const d=new Date(C.date);
const F=o=>new Intl.DateTimeFormat('en-GB',Object.assign({timeZone:'Asia/Dhaka'},o)).format(d);
const dow=F({weekday:'long'}),dayN=F({day:'numeric'}),monN=F({month:'long'}),yr=F({year:'numeric'});
const tm=F({hour:'numeric',minute:'2-digit',hour12:true}).toUpperCase().replace(/\s/g,' ');
const setAll=(cls,v)=>$$('.'+cls).forEach(e=>e.textContent=v);
setAll('js-dow',dow);setAll('js-day',dayN);setAll('js-mon',monN);setAll('js-yr',yr);setAll('js-time',tm);
setAll('js-fulldate',`${dow}, ${dayN} ${monN} ${yr}`);
document.title=`${C.groomNick} & ${C.brideNick} · ${dayN} ${monN} ${yr}`;

/* ---------- links ---------- */
$$('.js-map').forEach(a=>a.href=C.map);
const digits=(C.contactPhone||'').replace(/\D/g,'');
$$('.js-call').forEach(a=>a.href='tel:'+C.contactPhone);
$$('.js-wa').forEach(a=>a.href='https://wa.me/'+digits+'?text='+encodeURIComponent(`Hello, I need help regarding the wedding of ${C.groomNick} & ${C.brideNick}.`));

/* ---------- little message bubble ---------- */
const toast=$('toast');let tt;
function say(m){toast.textContent=m;toast.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('show'),2600)}

/* ---------- December calendar picture ---------- */
(function(){
  const mIdx=+F({month:'numeric'})-1,y=+yr,today=+dayN;
  $('calHead').textContent=`${monN} ${yr}`;
  const first=new Date(Date.UTC(y,mIdx,1)).getUTCDay();
  const count=new Date(Date.UTC(y,mIdx+1,0)).getUTCDate();
  let h=['Su','Mo','Tu','We','Th','Fr','Sa'].map(w=>`<span class="wd">${w}</span>`).join('');
  for(let i=0;i<first;i++)h+='<span></span>';
  for(let n=1;n<=count;n++)h+=`<span${n===today?' class="hl" aria-label="Wedding day"':''}>${n}</span>`;
  $('calGrid').innerHTML=h;
})();

/* ---------- countdown ---------- */
const cdBox=$('cd');
const tick=()=>{
  const s=Math.max(0,Math.floor((d-Date.now())/1000));
  if(s===0&&d-Date.now()<=0){cdBox.innerHTML='<p class="lead">The big day has arrived. Thank you for being with us.</p>';clearInterval(timer);return}
  $('cdD').textContent=Math.floor(s/86400);$('cdH').textContent=Math.floor(s%86400/3600);
  $('cdM').textContent=Math.floor(s%3600/60);$('cdS').textContent=s%60;
};
const timer=setInterval(tick,1000);tick();

/* ---------- add to calendar ---------- */
const z=n=>String(n).padStart(2,'0');
const stamp=t=>{const x=new Date(t);return x.getUTCFullYear()+z(x.getUTCMonth()+1)+z(x.getUTCDate())+'T'+z(x.getUTCHours())+z(x.getUTCMinutes())+z(x.getUTCSeconds())+'Z'};
const end=new Date(+d+4*3600e3);
const title=`Wedding of ${C.groomNick} & ${C.brideNick}`;
const where=`${C.venue}, ${C.floor}, ${C.address}`;
const note=`${C.groomFull} & ${C.brideFull}. Contact: ${C.contactName} ${C.contactDisplay}. Map: ${C.map}`;
const esc=t=>String(t).replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');
$('icsBtn').addEventListener('click',()=>{
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Invitation//EN','BEGIN:VEVENT',
    'UID:'+stamp(d)+'@wedding-invitation','DTSTAMP:'+stamp(Date.now()),'DTSTART:'+stamp(d),'DTEND:'+stamp(end),
    'SUMMARY:'+esc(title),'LOCATION:'+esc(where),'DESCRIPTION:'+esc(note),
    'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:Wedding tomorrow','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));
  a.download='wedding-invitation.ics';document.body.appendChild(a);a.click();a.remove();
  say('Calendar file ready. Open it to save the date.');
});
$('gcalBtn').href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(title)+
  '&dates='+stamp(d)+'/'+stamp(end)+'&location='+encodeURIComponent(where)+'&details='+encodeURIComponent(note);

/* ---------- copy address / share ---------- */
function copy(text,msg){
  const done=()=>say(msg);
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done,fallback)}else fallback();
  function fallback(){const t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();
    try{document.execCommand('copy');done()}catch(e){say('Please copy it by hand.')}t.remove()}
}
$('copyBtn').addEventListener('click',()=>copy(where,'Address copied'));
$('shareBtn').addEventListener('click',()=>{
  const data={title,text:`You are invited to the wedding of ${C.groomNick} & ${C.brideNick} on ${dayN} ${monN} ${yr}.`,url:location.href};
  if(navigator.share)navigator.share(data).catch(()=>{});else copy(location.href,'Invitation link copied');
});

/* ---------- bigger text button (for elders) ---------- */
const sizes=[112.5,128,145],names=['Text size','Bigger','Biggest'];let si=0;
$('sizeBtn').addEventListener('click',()=>{si=(si+1)%sizes.length;document.documentElement.style.fontSize=sizes[si]+'%';$('sizeLbl').textContent=names[si]});

/* ---------- rosette graphic (built in code, no images) ---------- */
$$('.rosette').forEach(el=>{
  let s='<svg viewBox="-60 -60 120 120" width="100%" height="100%" aria-hidden="true">';
  for(let i=0;i<12;i++)s+=`<ellipse cx="0" cy="-33" rx="9" ry="23" transform="rotate(${i*30})" fill="#ecc9cf" fill-opacity=".55" stroke="#9c7a2c" stroke-width="1"/>`;
  for(let i=0;i<12;i++)s+=`<ellipse cx="0" cy="-22" rx="7" ry="15" transform="rotate(${i*30+15})" fill="#6b1d2e" fill-opacity=".85" stroke="#d3b672" stroke-width=".8"/>`;
  for(let i=0;i<24;i++){const a=i*Math.PI/12;s+=`<circle cx="${(Math.cos(a)*55).toFixed(1)}" cy="${(Math.sin(a)*55).toFixed(1)}" r="1.6" fill="#9c7a2c"/>`}
  s+='<circle r="9" fill="#d3b672" stroke="#9c7a2c" stroke-width="1"/><circle r="3.5" fill="#6b1d2e"/></svg>';
  el.innerHTML=s;
});

/* ---------- open the envelope ---------- */
$('openBtn').addEventListener('click',()=>{
  document.body.classList.add('open');
  setTimeout(()=>{
    document.body.classList.remove('locked');
    document.querySelectorAll('#hero [data-r]').forEach((e,i)=>setTimeout(()=>e.classList.add('in'),i*260));
  },1700);
},{once:true});

/* ---------- fade in on scroll ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting&&!e.target.closest('#hero')){e.target.classList.add('in');io.unobserve(e.target)}
}),{threshold:.2});
$$('[data-r]').forEach(e=>io.observe(e));

/* ---------- falling petals (WebGL, light theme) ---------- */
const THREE=window.THREE;
if(!THREE)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const canvas=$('gl');
let r;
try{r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true})}catch(err){return}
r.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xfbf6ee,6,22);
const cam=new THREE.PerspectiveCamera(55,1,.1,50);cam.position.z=8;
const shape=new THREE.Shape();
shape.moveTo(0,0);shape.bezierCurveTo(.5,.25,.55,.95,0,1.2);shape.bezierCurveTo(-.55,.95,-.5,.25,0,0);
const geo=new THREE.ShapeGeometry(shape,10);geo.translate(0,-.6,0);geo.scale(.55,.55,.55);
const mat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,transparent:true,opacity:.6,fog:true});
const N=matchMedia('(max-width:700px)').matches?45:90;
const mesh=new THREE.InstancedMesh(geo,mat,N);scene.add(mesh);
const pal=['#6b1d2e','#a4475c','#d98a9a','#ecc3c9','#d3b672'].map(c=>new THREE.Color(c));
const P=[];
for(let i=0;i<N;i++){
  P.push({x:(Math.random()-.5)*22,y:(Math.random()-.5)*26,z:-8+Math.random()*13,
    s:.5+Math.random()*.9,rx:Math.random()*6,ry:Math.random()*6,rz:Math.random()*6,
    vx:(Math.random()-.5)*.2,vy:-.1-Math.random()*.25,vr:.3+Math.random()*.8,ph:Math.random()*6});
  mesh.setColorAt(i,pal[i%pal.length]);
}
const o=new THREE.Object3D();let mx=0,my=0,scroll=0,sm=0;
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
addEventListener('scroll',()=>{scroll=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)},{passive:true});
function size(){const w=innerWidth,h=innerHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
addEventListener('resize',size);size();
const clock=new THREE.Clock();
function frame(){
  const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
  sm+=(scroll-sm)*.05;
  cam.position.x+=(mx*1.2-cam.position.x)*.03;
  cam.position.y+=(-my*.8-sm*9-cam.position.y)*.05;
  cam.position.z=8-sm*3;cam.lookAt(0,cam.position.y*.9,0);
  for(let i=0;i<N;i++){const p=P[i];
    if(!reduce){p.y+=p.vy*dt*3;p.x+=(p.vx+Math.sin(t*.6+p.ph)*.12)*dt*3;p.rx+=p.vr*dt;p.ry+=p.vr*.7*dt;p.rz+=p.vr*.4*dt;
      if(p.y<cam.position.y-13)p.y=cam.position.y+13;if(p.y>cam.position.y+14)p.y=cam.position.y-12}
    o.position.set(p.x,p.y,p.z);o.rotation.set(p.rx,p.ry,p.rz);o.scale.setScalar(p.s);o.updateMatrix();mesh.setMatrixAt(i,o.matrix)}
  mesh.instanceMatrix.needsUpdate=true;
  r.render(scene,cam);requestAnimationFrame(frame)
}
frame();
})();