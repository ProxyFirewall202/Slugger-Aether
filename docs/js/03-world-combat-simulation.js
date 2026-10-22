/* Slugger NEO v0.5.3 — World data, player/equipment stats, enemy AI, wave simulation, combat, hazards, and snapshots.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
const stars=Array.from({length:70},()=>({x:R(0,W),y:R(0,H),s:R(.6,1.8)}));
const rk=id=>1+.2*((S.inv[id]||{}).r||0),eqI=t=>IT[S.eq[t]]||null,setN=s=>'wsac'.split('').filter(t=>eqI(t)&&eqI(t).set===s).length,nearest=(x,y,r)=>{let b=null,bd=r*r;for(const e of E){const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;b=e}}return b};
function calc(){const id=IT[S.eq.w]?S.eq.w:'blaster',w=IT[id],a=eqI('a'),c=S.eq.c,fi=setN('fire'),ic=setN('ice'),so=setN('solar'),vo=setN('vortex'),vd=setN('void'),ae=setN('aether');
return{w,dmg:w.d*rk(id)*(1+.1*(S.wl[id]||0))*(c==='rotc'?1.25:1)*(so>=2?1.1:1),cd:w.r*Math.max(.3,1-.12*S.up.oc),mhp:(100+20*S.up.hp+(a?a.hp*rk(S.eq.a):0))*(ae>=2?1.1:1),dr:Math.min(.75,(a?a.dr*rk(S.eq.a):0)+(ic>=2?.15:0)),spd:vo>=2?1.1:1,mag:c==='magn'?200:80,fi:fi>=2,ic:ic>=3,fireAura:fi>=3,so:so===3,vo:vo===3||vd>=3,vd:vd>=2,ad:ae===4,tk:c==='rotc'?1.25:1}}
function burst(x,y,c,n,s){const sh=c===EC.ice?2:(c===EC.fire||c===EC.solar)?1:0;for(let i=0;i<n&&PT.length<500;i++){const a=Math.random()*6.283,v=(.2+Math.random()*.8)*s;PT.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.3+Math.random()*.4,c,sh,a})}}
function swap(el){if(mode!=='play'||!S.att.includes(el)||P.at===el)return;P.at=el;SFX.swap();burst(P.x,P.y,EC[el],18,220)}
function cyc(d){const l=EL6.filter(x=>S.att.includes(x)),i=l.indexOf(P.at);swap(l[(i+d+l.length)%l.length])}
let TL=[],HZ=[],MS=[],BM=[],SHK=0,HS=0;
const BC={neutral:'#9be564',fire:'#ff6a2a',ice:'#7fd8ff',solar:'#ffd23a',vortex:'#b055ff',void:'#ff4d9d'},AC2={neutral:'#ffe14d',fire:'#ffd23a',ice:'#ffffff',solar:'#ff8a00',vortex:'#00ccff',void:'#ffffff'},HC={fire:'#ff5a1f',ice:'#00ccff',void:'#aa00ff',aether:'#ff0055',acid:'#7dff3c',web:'#e8f0ff',rift:'#aa00ff'},BG={neutral:['#1d6b3a','#0c7a6a'],fire:['#6a1a1a','#a04a10'],ice:['#143a8a','#2a9ab8'],solar:['#6a4a10','#8a2a6a'],vortex:['#2b1a7a','#4a0a7e'],void:['#4a0a4a','#0a0a3a']};
const EN30=`Toxic Aphid|20|125|11|swarm|o:la2A
Beetle Tank|55|55|15|tank|d:Plk2A
Thrip Stinger|18|110|10|thrip|w:Wz2A
Fire Flea|16|150|10|flea|o:lpF2A
Lava Snail|50|50|14|snail|e:zPv2
Cinder Spitter|36|45|13|spitter|t:vkF2A
Glacier Mite|30|90|12|mite|w:CCl2A
Ice Weaver|34|80|13|weaver|o:lCa3
Hail Mortar|60|40|16|mortar|d:kCP2
Inferno Hornet|28|150|12|hornet|e:WFz2A
Magma Crab|70|50|16|crab|e:mPl2A
Ember Drone|14|140|9|drone|o:Fy1
Frost Reaper|900|55|44|reaper|g:rChA2
Icicle Sentinel|60|35|15|sentinel|w:Cy1
Chill Parasite|16|190|9|parasite|e:zl1A
Helio Wasp|26|100|11|wasp|e:Wzq2
Sun Beetle|48|55|15|sunb|d:nP2A
Ray Hopper|20|120|10|hopper|o:ln3
Void Leech|36|85|13|leech|e:zT1A
Singularity Orbiter|40|60|13|orbiter|o:yp1
Phase Phantom|30|90|12|phantom|g:a3
Plasma Mantis|45|85|13|mantis|w:bh2A
Corona Colossus|110|40|20|colossus|o:nPk1A
Solar Flare Pulse|14|130|10|flare|o:nF1
Aether Behemoth|120|40|20|behemoth|g:Thv3A
Dimensional Stalker|42|100|12|stalker|w:aq2A
Warp Weaver|40|70|14|warper|o:yT3
Aether Divine Sentinel|80|65|16|dsent|s:r2A
Aetherial Turret|90|30|16|turret|t:kvn1
Prismatic Core|100|35|18|core|o:yC1
Aether Monarch|2600|55|50|monarch|s:rnhy3A`.split('\n').map(s=>{const[n,hp,spd,r,ai,sp]=s.split('|');return{n,hp:+hp,spd:+spd,r:+r,ai,sp}});
const SHD={1:['b',1.5],10:['i',1],16:['r',1.3]},DKH={6:'shard',23:'split'},elOf=i=>i>29?'void':WV[i/3|0][1];
function esvg(i,f){const n=EN30[i],[sh,ft]=n.sp.split(':'),el=elOf(i),c=BC[el],a=AC2[el],k=f?1:-1;
const B={o:`<circle cx='32' cy='36' r='16'/>`,e:`<ellipse cx='32' cy='36' rx='21' ry='13'/>`,d:`<path d='M10 46Q10 16 32 16Q54 16 54 46Z'/>`,w:`<path d='M32 12L52 36L32 58L12 36Z'/>`,s:`<path d='M32 6L38 24L58 20L45 36L58 52L38 48L32 64L26 48L6 52L19 36L6 20L26 24Z'/>`,g:`<path d='M13 56V32Q13 12 32 12Q51 12 51 32V56L42 49L32 56L22 49Z'/>`,t:`<rect x='9' y='20' width='46' height='32' rx='10'/>`}[sh];
const F={l:`<path d='M16 40L${6+k*2} ${48+k*2}M20 46L${12+k*2} 56M48 40L${58-k*2} ${48+k*2}M44 46L${52-k*2} 56' fill='none'/>`,W:`<ellipse cx='14' cy='${22+k*3}' rx='13' ry='6' fill='${a}' fill-opacity='.8'/><ellipse cx='50' cy='${22+k*3}' rx='13' ry='6' fill='${a}' fill-opacity='.8'/>`,T:`<path d='M22 50Q${18+k*4} 58 22 63M32 52Q${36-k*4} 60 32 64M42 50Q${46+k*4} 58 42 63' fill='none' stroke-width='4'/>`,a:`<path d='M26 20Q${20+k*3} 6 ${14+k*3} 8M38 20Q${44-k*3} 6 ${50-k*3} 8' fill='none'/>`,h:`<path d='M20 22L13 6L27 17M44 22L51 6L37 17' fill='${a}'/>`,z:`<path d='M46 44Q61 40 57 53Q52 59 46 55' fill='none' stroke-width='4'/>`,n:`<path d='M32 4V13M32 59V50M5 36H14M59 36H50M13 17L20 23M51 17L44 23M13 55L20 49M51 55L44 49' fill='none' stroke='${a}' stroke-width='4'/>`,y:`<ellipse cx='32' cy='36' rx='28' ry='9' fill='none' stroke='${a}' stroke-width='3'/>`,k:`<rect x='28' y='3' width='8' height='17' rx='3' fill='#6b6490'/>`,p:`<path d='M32 8L36 19H28ZM51 22L47 31L42 24ZM13 22L17 31L22 24Z' fill='${a}'/>`,P:`<path d='M32 18V54M22 22Q17 38 20 52M42 22Q47 38 44 52' fill='none'/>`,C:`<path d='M22 18L27 3L32 18ZM33 16L40 1L44 18Z' fill='${a}'/>`,F:`<path d='M20 20Q${18+k*3} 6 27 2Q25 10 32 8Q31 14 37 3Q42 12 44 20Z' fill='${a}'/>`,r:`<path d='M21 19L23 8L28 14L32 5L36 14L41 8L43 19Z' fill='#ffcc00'/>`,v:`<circle cx='23' cy='42' r='3' fill='${a}'/><circle cx='32' cy='46' r='3' fill='${a}'/><circle cx='41' cy='42' r='3' fill='${a}'/>`,m:`<path d='M18 30Q5 33 7 47Q14 40 21 38M46 30Q59 33 57 47Q50 40 43 38' fill='${a}'/>`,q:`<rect x='19' y='26' width='26' height='9' rx='4' fill='#0a0814'/>`,b:`<path d='M14 34L1 22L9 40M50 34L63 22L55 40' fill='${a}'/>`};
const bk='lWTahznyk',pt=w=>[...ft].filter(x=>F[x]&&(bk.includes(x)===w)).map(x=>F[x]).join(''),ne=+(ft.match(/\d/)||['2'])[0];
const ey={1:[[32,30,7]],2:[[25,30,5],[39,30,5]],3:[[24,31,4],[32,26,4],[40,31,4]]}[ne].map(([x,y,r])=>`<circle cx='${x}' cy='${y}' r='${r}' fill='#fff'/><circle cx='${x+1}' cy='${y+1}' r='${r*.45}' fill='#0a0814' stroke='none'/>`).join('')+(ft.includes('A')?`<path d='M19 23L29 28M45 23L35 28' fill='none' stroke-width='3'/>`:'');
return sv(64,64,`<g ${O}>${pt(true)}<g fill='${c}'>${B}</g>${pt(false)}${ey}</g>`)}
function slSvg(n){const k=n[0],i=+n[1],rp=k==='i'?[0,-1.5,0,1.5][i]:k==='s'?i*.8:0,w=k==='i'?[0,2,0,-2][i]:0,sx=k==='h'?1.2:k==='f'?(i?.9:.84):1,sy=k==='h'?.8:k==='f'?(i?1.06:1.12):1,er=k==='h'?6.4:k==='f'?4.2:5.2,ai=k==='f'?-3:k==='h'?2:0,ao=k==='f'?1.5:k==='h'?-2:0,gl=k==='s'?2+i*1.6:0;let ey='';
for(const s of[-1,1])ey+=`<circle cx='12' cy='${s*5.5}' r='${er}' fill='#fff'/><path d='M${17.8+ai} ${s*2.5}L${17.8+ao} ${s*8.5}' fill='none' stroke-linecap='round'/><path d='M15 ${s*8}Q${22+w} ${s*15} ${27+w} ${s*13}' fill='none'/><circle cx='${27+w}' cy='${s*13}' r='3.2' fill='#fff'/>`;
return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-32 -24 64 48' width='64' height='48'><defs><linearGradient id='g' x1='0' y1='-1' x2='0' y2='1'><stop offset='0' stop-color='#7dffb8'/><stop offset='.5' stop-color='#00ff88'/><stop offset='1' stop-color='#00b866'/></linearGradient></defs><g transform='scale(${sx} ${sy})' stroke='#0a0814' stroke-width='3' stroke-linejoin='round'><path d='M-21 0C-21 -15 -6 -15 8 -12C19 -10 23 -4 23 0C23 8 16 13 6 13C-8 ${14+rp} -21 13 -21 0Z' fill='url(#g)'/>${gl?`<circle cx='-22' cy='0' r='${gl}' fill='#7dff3c'/>`:''}<ellipse cx='-4' cy='-8' rx='9' ry='3' fill='#fff' fill-opacity='.4' stroke='none'/>${ey}</g></svg>`}
for(let i=0;i<=30;i++)for(let f=0;f<2;f++){const bg=i===12||i===30?128:64;spr('e'+i+'_'+f,esvg(i,f),bg,bg)}
['i0','i1','i2','i3','h0','h1','f0','f1','s0','s1','s2'].forEach(n=>spr('sl'+n,slSvg(n),64,48));
Object.assign(SFX,{roar:()=>{osc('sawtooth',110,40,1.1,.22);osc('sawtooth',118,44,1.1,.18);nz('lowpass',900,80,1,.35);SFX.boom()},fz:()=>{osc('sawtooth',200,900,.6,.12);nz('bandpass',500,4000,.6,.18)},tp:()=>{nz('bandpass',3000,400,.18,.14);osc('sine',900,200,.15,.1)},warn:()=>{nz('bandpass',1500,2500,.1,.1);osc('sine',150,220,.14,.12)}});
const go=(e,t,vx,vy)=>{e.x+=vx*e.fm*t;e.y+=vy*e.fm*t},cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ch=(e,t,dx,dy,d,k)=>go(e,t,dx/d*e.spd*(k==null?1:k),dy/d*e.spd*(k==null?1:k));
const eb=(e,a,sp,d,r)=>EB.push({uid:++bulletUidCounter,x:e.x,y:e.y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,el:e.el,l:5,d,r}),tl=(x1,y1,x2,y2,t,c)=>TL.push({x1,y1,x2,y2,t,c:c||'#ff3a3a'}),pool=(x,y,r,ty,t,w)=>{if(x>-20&&x<W+20&&y>-20&&y<H+20)HZ.push({x,y,r,ty,t,w:w||0,m:w||0})};
function mort(e,tx,ty,pty,r,w){tx=cl(tx,30,W-30);ty=cl(ty,30,H-30);MS.push({x0:e.x,y0:e.y,x1:tx,y1:ty,t:0,T:w,c:HC[pty]});pool(tx,ty,r,pty,5,w)}
const bossAI=(e,t,dx,dy,d)=>{const p2=e.hp<e.mh*.5,w=G.w;
if(p2&&!e.p2){e.p2=1;e.inv=1.8;e.tr2=1.8;SHK=24;HS=5;SFX.roar();burst(e.x,e.y,EC[e.el],70,420);burst(e.x,e.y,'#fff',30,300)}
if(e.tr2>0){e.tr2-=t;return}
if(e.s===2){go(e,t,Math.cos(e.a)*720,Math.sin(e.a)*720);e.t-=t;if(e.t<=0){e.s=0;e.dm=1}return}
if(e.s===1){e.t-=t;if(e.t<=0){e.s=2;e.t=.5;e.dm=2}return}
ch(e,t,dx,dy,d,p2?1.5:1);e.cd-=t;e.st-=t;
if(!p2&&e.st<=0){e.st=10;const pl=w===5?[13,14]:[27,28,29];for(let i=0;i<3;i++)spawn(pl[RI(0,pl.length-1)],e.x+R(-40,40),e.y+R(-40,40))}
if(e.cd<=0){if(!p2){e.cd=1.5;e.ph+=.37;const n=10+w;for(let i=0;i<n;i++)eb(e,e.ph+i*6.283/n,190,8+w,6)}
else{e.at=((e.at||0)+1)%4;if(e.at===0){e.cd=3.4;for(let i=0;i<2;i++)BM.push({x:e.x,y:e.y,a:e.ph+i*3.14,w:.9,t:1.8,wd:16,c:EC[e.el],rot:i?.8:-.8,e})}
else if(e.at===1){e.cd=2.6;for(let i=0;i<5;i++)mort(e,SIM.x+R(-130,130),SIM.y+R(-130,130),w===5?'ice':'void',46,.75+i*.1)}
else if(e.at===2){e.cd=3;e.s=1;e.t=.7;e.a=Math.atan2(dy,dx);tl(e.x,e.y,e.x+Math.cos(e.a)*800,e.y+Math.sin(e.a)*800,.7);SFX.warn()}
else{e.cd=1.6;e.ph+=.3;for(let i=0;i<14;i++)eb(e,e.ph+i*.4488,200,8+w,6)}}}};
const AI={
swarm:(e,t,dx,dy,d)=>{const w=Math.sin(T*9+e.o)*.9;go(e,t,(dx/d-dy/d*w)*e.spd,(dy/d+dx/d*w)*e.spd)},
tank:(e,t,dx,dy,d)=>{ch(e,t,dx,dy,d);e.cd-=t;if(e.cd<=0&&d<420){e.cd=3;eb(e,e.fa,170,8+G.w,7)}},
thrip:(e,t,dx,dy,d)=>{if(e.s===1){e.t-=t;if(e.t<=0){e.s=2;e.t=.32;e.dm=2}}else if(e.s===2){go(e,t,Math.cos(e.a)*560,Math.sin(e.a)*560);e.t-=t;if(e.t<=0){e.s=0;e.cd=2;e.dm=1}}else{const a=Math.atan2(dy,dx)+1.2,k=(d-210)*.8;go(e,t,Math.cos(a)*e.spd+dx/d*k,Math.sin(a)*e.spd+dy/d*k);e.cd-=t;if(e.cd<=0){e.s=1;e.t=.65;e.a=Math.atan2(dy,dx);tl(e.x,e.y,e.x+Math.cos(e.a)*600,e.y+Math.sin(e.a)*600,.65);SFX.warn()}}},
flea:(e,t,dx,dy,d)=>{e.t=(e.t||0)-t;if(e.s===1){go(e,t,e.jx,e.jy);if(e.t<=0){e.s=0;e.t=.7;pool(e.x,e.y,24,'fire',2.5);burst(e.x,e.y,EC.fire,10,160)}}else if(e.t<=0){e.s=1;e.t=.4;const a=Math.atan2(dy,dx),m=Math.min(d,300)/.4;e.jx=Math.cos(a)*m;e.jy=Math.sin(a)*m}},
snail:(e,t,dx,dy,d)=>{ch(e,t,dx,dy,d);e.cd-=t;if(e.cd<=0){e.cd=.9;pool(e.x,e.y,20,'fire',4)}},
spitter:(e,t,dx,dy,d)=>{if(d>300)ch(e,t,dx,dy,d);e.cd-=t;if(e.cd<=0){e.cd=2.4;e.ph+=.4;for(let i=0;i<8;i++)eb(e,e.ph+i*.785,150,8+G.w,7)}},
mite:(e,t,dx,dy,d)=>ch(e,t,dx,dy,d),
weaver:(e,t,dx,dy,d)=>{const m=d>340?1:d<240?-1:0;go(e,t,dx/d*e.spd*m-dy/d*e.spd*.5,dy/d*e.spd*m+dx/d*e.spd*.5);e.cd-=t;if(e.cd<=0){e.cd=.55;pool(e.x,e.y,18,'web',5)}},
mortar:(e,t,dx,dy,d)=>{ch(e,t,dx,dy,d,d>380?1:d<300?-1:0);e.cd-=t;if(e.cd<=0){e.cd=3.2;mort(e,SIM.x,SIM.y,'ice',46,.95)}},
hornet:(e,t,dx,dy,d)=>{if(e.tx==null||Math.hypot(e.tx-e.x,e.ty-e.y)<30){e.tx=cl(SIM.x*2-e.x+R(-60,60),20,W-20);e.ty=cl(SIM.y*2-e.y+R(-60,60),20,H-20)}const a=Math.atan2(e.ty-e.y,e.tx-e.x);go(e,t,Math.cos(a)*e.spd*2.2,Math.sin(a)*e.spd*2.2);e.cd-=t;if(e.cd<=0&&d<320){e.cd=.4;eb(e,Math.atan2(dy,dx),260,7+G.w,5)}},
crab:(e,t,dx,dy,d)=>{const s=Math.sin(T+e.o)*.5;go(e,t,(dx/d-dy/d*s)*e.spd,(dy/d+dx/d*s)*e.spd)},
drone:(e,t,dx,dy,d)=>{if(e.s===1){go(e,t,dx/d*430,dy/d*430);if(d<e.r+SIM.r+8){e.hp=0;for(let i=0;i<8;i++)eb(e,i*.785,200,7+G.w,5);burst(e.x,e.y,EC.fire,20,220)}return}e.t=(e.t||0)+t;e.oa=(e.oa||R(0,6))+t*2.2;go(e,t,(SIM.x+Math.cos(e.oa)*170-e.x)*4,(SIM.y+Math.sin(e.oa)*170-e.y)*4);if(e.t>3.2){e.s=1;SFX.warn()}},
reaper:bossAI,monarch:bossAI,
sentinel:(e,t,dx,dy,d)=>{if(d>380)ch(e,t,dx,dy,d);e.cd-=t;e.ph+=t*.9;if(e.cd<=0){e.cd=.2;eb(e,e.ph,210,6+G.w,6);eb(e,e.ph+3.14,210,6+G.w,6)}},
parasite:(e,t,dx,dy,d)=>{if(e.lt){e.oa+=t*2.4;e.x=SIM.x+Math.cos(e.oa)*19;e.y=SIM.y+Math.sin(e.oa)*19;if(!DBG.god&&!e._targetGuest){P.hp-=5*t*(1-ST.dr);if(P.hp<=0)hurtPlayerDeath()}return}ch(e,t,dx,dy,d);if(d<e.r+SIM.r+2){e.lt=1;e.oa=Math.atan2(-dy,-dx)}},
wasp:(e,t,dx,dy,d)=>{const m=d>420?1:d<320?-1:0;go(e,t,dx/d*e.spd*m-dy/d*e.spd*.4,dy/d*e.spd*m+dx/d*e.spd*.4);if(e.s===1){e.t-=t;if(e.t<=0){e.s=0;e.cd=3;eb(e,e.a,720,12+G.w*2,5)}return}e.cd-=t;if(e.cd<=0){e.s=1;e.t=.8;e.a=Math.atan2(dy,dx);tl(e.x,e.y,e.x+Math.cos(e.a)*900,e.y+Math.sin(e.a)*900,.8,'#ffd23a');SFX.warn()}},
sunb:(e,t,dx,dy,d)=>{const a=Math.atan2(dy,dx)+1.57,k=(d-170)*.45;go(e,t,Math.cos(a)*e.spd*.8+dx/d*k,Math.sin(a)*e.spd*.8+dy/d*k)},
hopper:(e,t,dx,dy,d)=>{e.cd-=t;if(e.cd<=0){e.cd=2.2;burst(e.x,e.y,EC.solar,12,160);const a=R(0,6.28),r=R(200,320);e.x=cl(SIM.x+Math.cos(a)*r,30,W-30);e.y=cl(SIM.y+Math.sin(a)*r,30,H-30);burst(e.x,e.y,EC.solar,12,160);SFX.tp();e.sb=3;e.sc=.25}if(e.sb>0){e.sc-=t;if(e.sc<=0){e.sc=.18;e.sb--;eb(e,Math.atan2(SIM.y-e.y,SIM.x-e.x),300,7+G.w,5)}}ch(e,t,dx,dy,d,.3)},
leech:(e,t,dx,dy,d)=>{ch(e,t,dx,dy,d);if(d<320&&!e._targetGuest){const f=(1-d/320)*1100*t;P.vx-=dx/d*f;P.vy-=dy/d*f}},
orbiter:(e,t,dx,dy,d)=>{e.bk=e.bk||[0,0,0];const a=Math.atan2(dy,dx)+1.57,wl=e.x>80&&e.x<W-80&&e.y>80&&e.y<H-80,m=d>280?1:d<220&&wl?-1:0;go(e,t,dx/d*e.spd*m+Math.cos(a)*e.spd*.6,dy/d*e.spd*m+Math.sin(a)*e.spd*.6);for(let k=0;k<3;k++){e.bk[k]-=t;if(e.bk[k]>0)continue;const sa=T*2.2+k*2.094,sx=e.x+Math.cos(sa)*38,sy=e.y+Math.sin(sa)*38;if(Math.hypot(sx-SIM.x,sy-SIM.y)<SIM.r+8&&!e._targetGuest)hurt(8+G.w,sx,sy,true)}},
phantom:(e,t,dx,dy,d)=>{e.t=(e.t||0)+t;e.gh=Math.sin(e.t*2.1)>.2;ch(e,t,dx,dy,d,e.gh?1.3:.7)},
mantis:(e,t,dx,dy,d)=>{if(e.s===1){e.t-=t;if(e.t<=0){e.s=2;e.t=.28;e.dm=2.2}return}if(e.s===2){go(e,t,Math.cos(e.a)*640,Math.sin(e.a)*640);e.t-=t;if(e.t<=0){e.dm=1;if(e.n2>0){e.n2--;e.s=1;e.t=.35;e.a=Math.atan2(SIM.y-e.y,SIM.x-e.x);tl(e.x,e.y,e.x+Math.cos(e.a)*420,e.y+Math.sin(e.a)*420,.35)}else{e.s=0;e.cd=1.8}}return}ch(e,t,dx,dy,d);e.cd-=t;if(e.cd<=0&&d<300){e.s=1;e.t=.7;e.n2=1;e.a=Math.atan2(dy,dx);tl(e.x,e.y,e.x+Math.cos(e.a)*420,e.y+Math.sin(e.a)*420,.7);SFX.warn()}},
colossus:(e,t,dx,dy,d)=>{if(d>260)ch(e,t,dx,dy,d);e.cd-=t;if(e.cd<=0){e.cd=4;e.ph+=.5;const n=e.fz?4:3;for(let i=0;i<n;i++)BM.push({x:e.x,y:e.y,a:e.ph+i*6.283/n,w:.9,t:.5,wd:14,c:EC.solar,rot:0,e});SFX.warn()}},
flare:(e,t,dx,dy,d)=>ch(e,t,dx,dy,d,.4+Math.abs(Math.sin(T*4+e.o))*1.4),
behemoth:(e,t,dx,dy,d)=>{if(d>200)ch(e,t,dx,dy,d);e.cd-=t;if(e.cd<=0){e.cd=3.6;for(let i=0;i<2;i++)mort(e,SIM.x+R(-90,90),SIM.y+R(-90,90),'void',50,1)}},
stalker:(e,t,dx,dy,d)=>{e.t=(e.t||0)-t;if(e.s===1){go(e,t,Math.cos(e.a)*520,Math.sin(e.a)*520);e.gh=0;if(e.t<=0){e.s=0;e.dm=1;e.cd=3}return}if(e.s===2){e.gh=0;if(e.t<=0){e.s=1;e.t=.3;e.dm=2;e.a=Math.atan2(SIM.y-e.y,SIM.x-e.x)}return}e.gh=1;ch(e,t,dx,dy,d,.6);e.cd-=t;if(e.cd<=0){const a=SIM.ang+Math.PI;e.x=cl(SIM.x+Math.cos(a)*110,30,W-30);e.y=cl(SIM.y+Math.sin(a)*110,30,H-30);burst(e.x,e.y,EC.vortex,16,180);SFX.tp();e.s=2;e.t=.55;e.gh=0}},
warper:(e,t,dx,dy,d)=>{ch(e,t,dx,dy,d,d>380?1:d<300?-1:0);e.cd-=t;if(e.cd<=0){e.cd=3.4;const a=R(0,6.28),x0=SIM.x+Math.cos(a)*420,y0=SIM.y+Math.sin(a)*420,x1=SIM.x-Math.cos(a)*420,y1=SIM.y-Math.sin(a)*420;tl(x0,y0,x1,y1,.7,'#b03aff');for(let i=0;i<=9;i++)pool(x0+(x1-x0)*i/9,y0+(y1-y0)*i/9,22,'rift',6,.7)}},
dsent:(e,t,dx,dy,d)=>{e.oa=(e.oa||R(0,6))+t*.9;go(e,t,(SIM.x+Math.cos(e.oa)*230-e.x)*2.2,(SIM.y+Math.sin(e.oa)*230-e.y)*2.2);e.cd-=t;if(e.cd<=0){e.cd=2.4;const a=Math.atan2(dy,dx);for(let i=-1;i<2;i++)eb(e,a+i*.22,260,9+G.w,6)}},
turret:(e,t,dx,dy,d)=>{e.cd-=t;if(e.cd<=0){e.cd=5.5;e.ph+=1;for(let i=0;i<3;i++)BM.push({x:e.x,y:e.y,a:e.ph+i*2.094,w:.85,t:2.2,wd:12,c:EC.void,rot:.8,e});SFX.warn()}if(d>420)ch(e,t,dx,dy,d,.5)},
core:(e,t,dx,dy,d)=>{ch(e,t,dx,dy,d,d>250?1:-.3);e.cd-=t;if(e.cd<=0){e.cd=3.2;for(let i=0;i<2;i++)pool(SIM.x+R(-120,120),SIM.y+R(-120,120),38,'void',5,.7);for(let i=0;i<12;i++)eb(e,i*.5236,140,7+G.w,6);burst(e.x,e.y,EC.void,20,200)}}};
const DK={shard:e=>{for(let i=0;i<6;i++)eb(e,i*1.047,170,6+G.w,5)},split:e=>{if(!e.sm)for(let i=0;i<3;i++)spawn(23,e.x+R(-12,12),e.y+R(-12,12),1)}};
let enemyUidCounter=0,crateUidCounter=0,bulletUidCounter=0;const pendingGuestCrates=new Map();
function addCrate(x,y,t,b=0,uid){const c={uid:uid==null?++crateUidCounter:uid,x,y,t,b};crateUidCounter=Math.max(crateUidCounter,Number(c.uid)||0);CR.push(c);return c;}
function seededRand(){if(!PVP.active||PVP.role!=='host'||!G)return Math.random();let x=(G.rngState=(Math.imul(G.rngState||PVP.seed||1,1664525)+1013904223)>>>0);return x/4294967296;}
function pvpRandom(a,b){return a+seededRand()*(b-a);}

function upd2(dt){
if(!G.fr&&G.st==='wave'&&G.tot&&G.dead>=.85*G.tot&&E.length+G.q.length>0){G.fr=1;E.forEach(e=>{if(e.ty!=='b')e.fz=1});SFX.fz();SHK=Math.max(SHK,6)}
let sm=E.some(e=>e.lt)?.6:1;
for(const h of HZ){if(h.w>0){h.w-=dt;continue}h.t-=dt;const dp=h.ty==='fire'?14:h.ty==='acid'?10:h.ty==='ice'?6:h.ty==='void'||h.ty==='aether'?7:0;if(Math.hypot(h.x-P.x,h.y-P.y)<h.r+P.r){if(!ST.ad){if(dp&&!DBG.god){P.hp-=dp*dt*(1-ST.dr)*ST.tk;if(P.hp<=0)hurtPlayerDeath()}if(h.ty!=='fire'&&h.ty!=='acid')sm=Math.min(sm,.6);if(h.ty==='void'){P.vx+=(h.x-P.x)*dt*1.5;P.vy+=(h.y-P.y)*dt*1.5}}}if(PVP.active&&PVP.role==='host'&&PVP.oppAlive&&!PVP.oppHazardImmune&&dp&&!PVP.finished&&Math.hypot(h.x-PVP.oppX,h.y-PVP.oppY)<h.r+13)damagePvpGuest(dp*dt*(h.ty==='acid'?.85:1),'hazard-'+h.ty)}
HZ=HZ.filter(h=>h.t>0);P.sm=sm;
TL.forEach(l=>l.t-=dt);TL=TL.filter(l=>l.t>0);
MS.forEach(m=>{m.t+=dt;if(m.t>=m.T)burst(m.x1,m.y1,m.c,10,180)});MS=MS.filter(m=>m.t<m.T);
BM.forEach(b=>{if(b.e){if(b.e.hp>0){b.x=b.e.x;b.y=b.e.y}else b.t=0}b.a+=b.rot*dt;if(b.w>0){b.w-=dt;return}b.t-=dt;const test=(x,y,r)=>{const px=x-b.x,py=y-b.y;return px*Math.cos(b.a)+py*Math.sin(b.a)>0&&Math.abs(-px*Math.sin(b.a)+py*Math.cos(b.a))<b.wd+r};if(test(P.x,P.y,P.r))hurt(12+G.w*2,P.x,P.y,true);if(PVP.active&&PVP.role==='host'&&PVP.oppAlive&&!PVP.oppHazardImmune&&test(PVP.oppX,PVP.oppY,13))damagePvpGuest((12+G.w*2)*dt,'boss-beam')});BM=BM.filter(b=>b.t>0);
SHK=Math.max(0,SHK-dt*30)}
function deploy(cp){if(PVP.active&&PVP.phase!=='playing')return;SFX.click();ST=calc();pendingGuestCrates.clear();enemyUidCounter=0;crateUidCounter=0;bulletUidCounter=0;G={w:cp-1,warp:S.rec[cp]||0,startWarp:S.rec[cp]||0,runBanked:false,seed:PVP.active?(PVP.seed||1):((Math.random()*0xffffffff)>>>0),rngState:((PVP.seed||1)^cp)>>>0,cr:{wood:0,iron:0,solar:0,vortex:0,aether:0},kills:0,q:[],t:0,gap:1,st:'inter',tmr:1.5,el:'neutral',name:'Get ready',storm:0,stt:0,souls:0,spi:(eqI('p')&&S.aw[S.eq.p])?{cd:0,x:0,y:0}:null};P.at='neutral';P.rx=P.rv=P.ammo=0;
Object.assign(P,{x:W/2,y:H/2,vx:0,vy:0,hp:ST.mhp,inv:0,sp:0,spm:6,cd:0});deterministicRandom=(PVP.active&&PVP.role==='host')?()=>seededRand():null;E=[];B=[];EB=[];CR=[];PT=[];SL=[];HO=[];TL=[];HZ=[];MS=[];BM=[];SHK=HS=0;P.sm=1;mode='play';$('hubOverlay').className='ov';$('pauseOverlay').className='ov';netBroadcast({type:'status',mode:'play'})}
function nextWave(){const w=++G.w;G.rngState=((PVP.seed||G.seed||1)^Math.imul(w,0x9e3779b1))>>>0;S.rec[w]=Math.max(S.rec[w]||0,G.warp);G.q=[];HZ=[];BM=[];TL=[];MS=[];EB=[];const b=w%5===0,ids=w===5?[13,14]:[w*3-3,w*3-2,w*3-1],wt=w===5?[.5,.5]:[.45,.3,.25];
const baseCount=b?w+6:5+w*3,actualCount=PVP.active?Math.ceil(baseCount*1.35):baseCount;
for(let i=0;i<actualCount;i++){let r=PVP.active&&PVP.role==='host'?seededRand():Math.random(),k=0;while(k<ids.length-1&&r>wt[k]){r-=wt[k];k++}G.q.push(ids[k])}
if(b)G.q.unshift(w===5?12:30);G.tot=G.q.length;G.dead=0;G.fr=0;G.gap=Math.max(.3,1.1-w*.07);G.t=0;G.st='wave';G.el=WV[w-1][1];G.name=WV[w-1][0];
if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'&&PVP.opponent)netSend(PVP.opponent,{type:'pvp_wave_start',matchId:PVP.matchId,wave:w,name:G.name,el:G.el,fr:0});}
function spawn(id,x0,y0,mini){const w=G.w,n=EN30[id],s=RI(0,3),sd=SHD[id],bs=id===12||id===30,sc=bs?1:1+.08*(w-1),
e={x:x0!=null?x0:s<2?R(0,W):s===2?-20:W+20,y:y0!=null?y0:s<2?(s?H+20:-20):R(0,H),kx:0,ky:0,v:0,fx:1,fa:0,o:R(0,6.28),uid:++enemyUidCounter,id,b:n.ai,ty:bs?'b':'n',el:elOf(id),cd:R(.5,2),r:n.r*(mini?.7:1),spd:n.spd*(1+.02*(w-1)),fl:0,ph:0,st:5,fm:1,dm:1,fz:G.fr?1:0,sh:sd&&sd[0],tr:sd&&sd[1],rg:id===19,dk:mini?0:DKH[id],sm:mini?1:0};
const hpScale=(PVP.active?1.5:1)*(mini?.4:1);
e.hp=e.mh=n.hp*sc*hpScale;E.push(e);if(bs&&PVP.active&&PVP.role==='host'&&PVP.phase==='playing')netSend(PVP.opponent,{type:'pvp_boss_spawn',matchId:PVP.matchId,uid:e.uid,id,wave:G.w,name:n.n,el:e.el});}
function dmgE(e,d,el,fromGuest){if(e.inv>0||e.gh)return;const actual=Math.max(0,d*emul(el,e.el));e.hp-=actual;if(d>2)e.fl=.034;e._lastHitBy=fromGuest?'guest':'host';if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'&&PVP.stats){PVP.stats[fromGuest?'guest':'host'].damage+=actual;}}
function kill(e,j){const killer=e._lastHitBy||'host';E.splice(j,1);G.dead++;G.kills++;const bounty=Math.round((e.ty==='b'?150:Math.max(5,EN30[e.id].hp/6))*(1+.12*G.w)),souls=e.ty==='b'?25:1;if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'&&PVP.stats){const who=killer==='guest'?'guest':'host',st=PVP.stats[who],now=Date.now();st.kills++;st.souls=(st.souls||0)+souls;st.warp=(st.warp||0)+bounty;if(now-(st.lastKillAt||0)>3500)st.combo=0;st.combo=(st.combo||0)+1;st.bestCombo=Math.max(st.bestCombo||0,st.combo);st.lastKillAt=now;if(who==='host'){G.souls+=souls;G.warp+=bounty;}}else{G.souls+=souls;G.warp+=bounty;}burst(e.x,e.y,EC[e.el],e.ty==='b'?70:14,e.ty==='b'?320:170);SFX.boom();SHK=Math.max(SHK,e.ty==='b'?18:2.5);if(e.ty==='b')HS=6;if(e.dk)DK[e.dk](e);if(e.ty==='b'||seededRand()<.07)addCrate(e.x,e.y,CT[G.w-1],0);
if(PVP.active&&PVP.role==='host'&&e.ty==='b'&&G.w===PVP.target&&!PVP.finished){endPvp(killer==='guest'?'guest':'host','boss',{wave:G.w,boss:e.id,killer})}}
function damagePvpGuest(amount,reason='hazard'){
  if(!PVP.active||PVP.role!=='host'||PVP.phase!=='playing'||!PVP.oppAlive||PVP.finished)return;
  const raw=Math.max(0,Number(amount)||0),dmg=raw*(1-cl(Number(PVP.oppDr)||0,0,.75))*cl(Number(PVP.oppTk)||1,.5,2);if(!dmg)return;
  PVP.oppHp=Math.max(0,PVP.oppHp-dmg);
  const now=Date.now();
  if(PVP.oppHp<=0){PVP.oppAlive=false;PVP.oppDead=true;clearV05DeadAttacks('guest');netSend(PVP.opponent,{type:'pvp_guest_hp',matchId:PVP.matchId,hp:0,dmg,reason});netSend(PVP.opponent,{type:'pvp_you_died',matchId:PVP.matchId});queuePvpResult(PVP.playerDead?'draw':'host',PVP.playerDead?'both-dead':'opponent-death');}
  else if(now-(PVP.lastGuestHpPacket||0)>=50){PVP.lastGuestHpPacket=now;netSend(PVP.opponent,{type:'pvp_guest_hp',matchId:PVP.matchId,hp:PVP.oppHp,dmg,reason});}
}
function hurtPlayerDeath(){
  P.hp=0;
  if(PVP.active&&PVP.phase==='playing'&&!PVP.finished&&!PVP.playerDead){
    PVP.playerDead=true;P.vx=P.vy=0;
    netSend(PVP.opponent,{type:'pvp_player_died',role:PVP.role,matchId:PVP.matchId});
    if(PVP.role==='host'){queuePvpResult(PVP.oppDead||PVP.oppAlive===false?'draw':'guest',PVP.oppDead||PVP.oppAlive===false?'both-dead':'player-death');return}
    logs=['You died. Spectating until the host confirms the result...'];
    return;
  }
  endRun(false);
}
function hurt(d,x,y,melee){if(mode!=='play'||P.inv>0||DBG.god||PVP.playerDead)return;const s=eqI('s');
if(s&&!melee){const a=Math.atan2(y-P.y,x-P.x)-P.ang-s.side;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<1.1){burst(x,y,'#fff',6,120);SFX.hit();return}}
const dm=d*(1-ST.dr)*ST.tk;P.hp-=dm;if(ST.ad)P.ammo+=Math.ceil(dm/2);P.inv=.5;SFX.hurt();burst(P.x,P.y,'#ff3355',10,170);if(P.hp<=0)hurtPlayerDeath()}
function fire(){if(PVP.playerDead)return;const w=ST.w,k=w.k||1,volleyId=PVP.active&&PVP.role==='guest'?`${PVP.matchId||'match'}-v${++bulletUidCounter}`:null;let dm=ST.dmg;if(ST.fi&&P.at==='fire')dm*=1.1;if(ST.vd&&P.at==='vortex')dm*=1.2;const cr=Math.random()<.08;if(w.pi)SHK=Math.max(SHK,3);P.cd=ST.cd;P.rx=-9;SFX.shoot();if(ST.ad&&P.ammo>0){P.ammo--;dm*=1.6}
for(let i=0;i<k;i++){const a=P.ang+(k>1?(i-(k-1)/2)*(w.sp||.2):0)+R(-.03,.03),shotId=PVP.active&&PVP.role==='guest'?`${PVP.matchId||'match'}-${++bulletUidCounter}`:null,shotDamage=dm*(cr?1.8:1);
B.push({uid:shotId||++bulletUidCounter,x:P.x+Math.cos(P.ang)*18,y:P.y+Math.sin(P.ang)*18,vx:Math.cos(a)*620,vy:Math.sin(a)*620,d:shotDamage,cr,iceSet:!!(ST.ic&&P.at==='ice'),el:P.at,l:1.1,pi:w.pi||1,r:w.pi?7:4,h:[]});
if(PVP.active&&PVP.role==='guest'&&PVP.opponent&&PVP.phase==='playing'){netSend(PVP.opponent,{type:'pvp_fire',shotId,volleyId,matchId:PVP.matchId,x:P.x,y:P.y,ang:a,el:P.at,dmg:shotDamage,iceSet:!!(ST.ic&&P.at==='ice'),pi:w.pi||1,r:w.pi?7:4})}}}
function special(){
  if(mode!=='play'||P.sp>0||PVP.playerDead)return;
  SFX.sp();SHK=Math.max(SHK,8);
  const isGuestInPvP = PVP.active && PVP.role==='guest' && PVP.opponent && PVP.phase==='playing';
  if(isGuestInPvP){
    let kind='neutral';
    if(ST.so)kind='solar';
    else if(ST.vo)kind='vortex';
    netSend(PVP.opponent,{type:'pvp_special',matchId:PVP.matchId,kind,x:mx,y:my});
    if(ST.so){P.sp=P.spm=15;G.storm=2.5;G.stt=0;G.stormOwner='guest'}
    else if(ST.vo){P.sp=P.spm=12;HO.push({x:mx,y:my,t:4,owner:'guest'})}
    else{P.sp=P.spm=6;burst(P.x,P.y,'#00ff88',50,300);E.forEach(e=>{const d=D(e,P)||1;if(d<170){e.kx+=(e.x-P.x)/d*600;e.ky+=(e.y-P.y)/d*600}});}
    return;
  }
  if(ST.so){P.sp=P.spm=15;G.storm=2.5;G.stt=0;G.stormOwner='host'}
  else if(ST.vo){P.sp=P.spm=12;HO.push({x:mx,y:my,t:4,owner:'host'})}
  else{P.sp=P.spm=6;burst(P.x,P.y,'#00ff88',50,300);E.forEach(e=>{const d=D(e,P)||1;if(d<170){dmgE(e,ST.dmg*3,'neutral');e.kx+=(e.x-P.x)/d*600;e.ky+=(e.y-P.y)/d*600}});if(PVP.active&&PVP.role==='host'&&PVP.oppAlive&&Math.hypot(P.x-PVP.oppX,P.y-PVP.oppY)<170)damagePvpGuest(ST.dmg*3,'player-special');EB=EB.filter(b=>D(b,P)>150)}
}
function clearWave(){if(PVP.active&&PVP.finished)return;const w=G.w;G.lastClearedWave=Math.max(Number(G.lastClearedWave)||0,w);const clearBonus=w*25;if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'){if(!PVP.playerDead){G.warp+=clearBonus;PVP.stats.host.warp=(PVP.stats.host.warp||0)+clearBonus;}if(PVP.oppAlive)PVP.stats.guest.warp=(PVP.stats.guest.warp||0)+clearBonus;}else G.warp+=clearBonus;SFX.pick();if(w>=4&&!S.cp.includes(w-2))S.cp.push(w-2);
if(w===10){if(!S.cp.includes(8))S.cp.push(8);if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'){return;}G.cr[CT[9]]++;return endRun(true)}
addCrate(R(100,W-100),R(100,H-100),CT[w-1],0);G.st='inter';G.tmr=2.5;if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing')netSend(PVP.opponent,{type:'pvp_intermission_tick',matchId:PVP.matchId,wave:w,remaining:G.tmr,nextWave:w+1,name:WV[w][0]});save()}
function upd(dt){
  const isSpectator=PVP.active&&PVP.playerDead;
  if(PVP.active&&PVP.role==='guest'){let slow=1;for(const h of HZ){if(h.w>0)continue;if(Math.hypot(h.x-P.x,h.y-P.y)<h.r+P.r&&h.ty!=='fire'&&h.ty!=='acid')slow=Math.min(slow,.6)}P.sm=slow;}else if(!Number.isFinite(P.sm)||P.sm<=0)P.sm=1;
  if(!isSpectator){
    const ix=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+(Number(window.__sluggerTouchAxisX)||0),iy=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0)+(Number(window.__sluggerTouchAxisY)||0),inputLen=Math.hypot(ix,iy)||1,inputStrength=Math.min(1,Math.hypot(ix,iy)),ax=ix/inputLen*inputStrength,ay=iy/inputLen*inputStrength,fr=.88,f=Math.pow(fr,dt*60),A=2896*(1+.15*S.up.thr)*ST.spd*P.sm,VM=354*(1+.12*S.up.thr)*ST.spd*P.sm;
    P.vx=(P.vx+ax*A*dt)*f;P.vy=(P.vy+ay*A*dt)*f;{const q=Math.hypot(P.vx,P.vy);if(q>VM){P.vx*=VM/q;P.vy*=VM/q}}
  }else{P.vx=0;P.vy=0}
  P.x+=P.vx*dt;P.y+=P.vy*dt;
  if(P.x<P.r){P.x=P.r;P.vx=Math.abs(P.vx)*.5}if(P.x>W-P.r){P.x=W-P.r;P.vx=-Math.abs(P.vx)*.5}
  if(P.y<P.r){P.y=P.r;P.vy=Math.abs(P.vy)*.5}if(P.y>H-P.r){P.y=H-P.r;P.vy=-Math.abs(P.vy)*.5}
  if(Math.hypot(P.vx,P.vy)>30)P.fa=Math.atan2(P.vy,P.vx);
  if(window.__sluggerMobileFireHeld&&typeof window.__sluggerMobileAimAtTarget==='function')window.__sluggerMobileAimAtTarget();P.ang=Math.atan2(my-P.y,mx-P.x);P.cd-=dt;P.sp=Math.max(0,P.sp-dt);P.inv-=dt;
  if(md&&P.cd<=0&&!isSpectator)fire();
  P.rv=(P.rv-.15*P.rx)*.82;P.rx+=P.rv;
  if(!isSpectator&&Math.hypot(P.vx,P.vy)>120&&Math.random()<.4)PT.push({x:P.x-Math.cos(P.fa)*18,y:P.y-Math.sin(P.fa)*18,vx:Math.random()*50-25,vy:Math.random()*50-25,l:.5,c:'#7dff3c',sh:0,a:0});
  if(G.spi&&!isSpectator){const s=eqI('p'),a=T*1.7;G.spi.x=P.x+Math.cos(a)*50;G.spi.y=P.y+Math.sin(a)*50;G.spi.cd-=dt;const t=G.spi.cd<=0&&nearest(G.spi.x,G.spi.y,420);if(t){G.spi.cd=s.r;const an=Math.atan2(t.y-G.spi.y,t.x-G.spi.x);B.push({uid:++bulletUidCounter,x:G.spi.x,y:G.spi.y,vx:Math.cos(an)*560,vy:Math.sin(an)*560,d:ST.dmg*s.k*rk(S.eq.p),el:P.at,l:1,pi:s.pi||1,r:3,h:[]})}if(PVP.active&&PVP.role==='host'&&PVP.oppAlive&&Math.hypot(G.spi.x-PVP.oppX,G.spi.y-PVP.oppY)<18)damagePvpGuest(12*dt,'player-drone')}if(PVP.active&&PVP.role==='host'&&PVP.oppAlive&&!PVP.playerDead&&PVP.oppDrone&&Math.hypot(PVP.oppDrone.x-P.x,PVP.oppDrone.y-P.y)<18&&Date.now()>(PVP.guestDroneHitAt||0)){PVP.guestDroneHitAt=Date.now()+300;const dd=Math.max(2,(PVP.opponentLoadout?.damage||10)*.25);PVP.stats.guest.damage=(PVP.stats.guest.damage||0)+dd;hurt(dd,P.x,P.y,true);}
  if(S.up.slime>0&&!isSpectator){P.sl-=dt;if(P.sl<=0&&Math.hypot(P.vx,P.vy)>40){P.sl=.1;SL.push({x:P.x,y:P.y,t:2+S.up.slime})}}
  SL.forEach(s=>s.t-=dt);SL=SL.filter(s=>s.t>0);
  if(PVP.active&&PVP.role==='guest'){
    SHK=Math.max(0,SHK-dt*30);
    E.forEach(e=>{if(e.tx!==undefined){e.x+=(e.tx-e.x)*0.35;e.y+=(e.ty-e.y)*0.35;}});
    EB.forEach(b=>{if(b.tx!==undefined){b.x+=(b.tx-b.x)*0.45;b.y+=(b.ty-b.y)*0.45;}});
    CR.forEach(c=>{if(c.tx!==undefined){c.x+=(c.tx-c.x)*0.28;c.y+=(c.ty-c.y)*0.28;}});
    if(PVP.hostBulletsSnap) PVP.hostBulletsSnap.forEach(b=>{if(b.tx!==undefined){b.x+=(b.tx-b.x)*0.45;b.y+=(b.ty-b.y)*0.45;}});
    PVP.oppX+=(PVP.oppXT-PVP.oppX)*0.35;
    PVP.oppY+=(PVP.oppYT-PVP.oppY)*0.35;
    PVP.lastInput+=dt;
    if(PVP.lastInput>=0.05&&PVP.opponent&&PVP.phase==='playing'){PVP.lastInput=0;netSend(PVP.opponent,{type:'pvp_input',matchId:PVP.matchId,x:P.x,y:P.y,ang:P.ang,alive:!PVP.playerDead,at:P.at,dr:ST.dr,tk:ST.tk,mhp:ST.mhp,mag:ST.mag,shield:!!eqI('s'),shieldSide:eqI('s')?eqI('s').side:0,hazardImmune:!!ST.ad,drone:G.spi?{x:G.spi.x,y:G.spi.y}:null})}
    for(let i=B.length-1;i>=0;i--){
      const b=B[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;
      if(b.l<=0||b.x<-20||b.x>W+20||b.y<-20||b.y>H+20){B.splice(i,1);continue}
      if(PVP.active&&PVP.role==='guest'&&!PVP.playerDead&&Math.hypot(b.x-PVP.oppX,b.y-PVP.oppY)<13+(b.r||4)){burst(b.x,b.y,'#00ccff',5,100);B.splice(i,1);break;}
      for(const e of E){
        if(e.gh||b.h.includes(e.uid))continue;
        if(Math.hypot(b.x-e.x,b.y-e.y)<e.r+(b.r||4)){
          b.h.push(e.uid);
          burst(b.x,b.y,EC[b.el],3,120);
          SFX.hit();
          if(--b.pi<=0){B.splice(i,1);break}
        }
      }
    }
    // Guest-side speculative crate magnetism; the host confirms the collection by uid.
    for(let i=CR.length-1;i>=0;i--){const c=CR[i],uid=Number(c.uid),d=D(c,P)||1;c.b=(c.b||0)+dt;if(!PVP.playerDead&&d<ST.mag){c.x+=(P.x-c.x)/d*180*dt;c.y+=(P.y-c.y)/d*180*dt;}if(d<P.r+12&&!PVP.playerDead&&!pendingGuestCrates.has(uid)){pendingGuestCrates.set(uid,Date.now());CR.splice(i,1);netSend(PVP.opponent,{type:'pvp_collect_crate',matchId:PVP.matchId,uid});}}
    // Pending requests older than 2 seconds are retried after the next authoritative snapshot.
    for(const [uid,at] of pendingGuestCrates){if(Date.now()-at>2000){pendingGuestCrates.set(uid,Date.now());netSend(PVP.opponent,{type:'pvp_collect_crate',matchId:PVP.matchId,uid});}}
    PT.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.l-=dt});PT=PT.filter(p=>p.l>0);
    // The host alone resolves timeout/tie-breaks.
    return;
  }
  if(G.st==='inter'){G.tmr-=dt;if(G.tmr<=0)nextWave()}else{G.t-=dt;if(G.q.length&&G.t<=0&&E.length<45){spawn(G.q.shift());G.t=G.gap}if(!G.q.length&&!E.length)clearWave()}
  for(let i=B.length-1;i>=0;i--){const b=B[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0||b.x<-20||b.x>W+20||b.y<-20||b.y>H+20){B.splice(i,1);continue}
  if(PVP.active&&PVP.role==='host'&&b._guest&&!PVP.playerDead&&P.inv<=0&&Math.hypot(b.x-P.x,b.y-P.y)<P.r+(b.r||4)){const dmg=Math.max(0,Number(b.d)||8);PVP.stats.guest.damage=(PVP.stats.guest.damage||0)+dmg;B.splice(i,1);hurt(dmg,b.x,b.y,false);burst(b.x,b.y,'#ff3355',7,130);continue;}
  if(PVP.active&&PVP.role==='host'&&!b._guest&&PVP.oppAlive&&Math.hypot(b.x-PVP.oppX,b.y-PVP.oppY)<13+(b.r||4)){B.splice(i,1);damagePvpGuest(Math.max(0,Number(b.d)||8),'player-projectile');burst(b.x,b.y,'#00ccff',7,130);continue;}
  for(let j=0;j<E.length;j++){const e=E[j];if(e.hp<=0||e.gh||b.h.includes(e))continue;
  if(e.rg){let bl=0;e.bk=e.bk||[0,0,0];for(let k=0;k<3;k++){const sa=T*2.2+k*2.094;if(e.bk[k]<=0&&Math.hypot(b.x-e.x-Math.cos(sa)*38,b.y-e.y-Math.sin(sa)*38)<10)bl=k+1}if(bl){e.hc=(e.hc||0)+1;if(e.hc>=4){e.hc=0;e.bk[bl-1]=3;burst(e.x,e.y,EC.vortex,10,160)}burst(b.x,b.y,'#fff',4,140);B.splice(i,1);break}}
  if(Math.hypot(b.x-e.x,b.y-e.y)>e.r+b.r)continue;
  if(e.sh){const a=Math.atan2(b.y-e.y,b.x-e.x),df=Math.abs(Math.atan2(Math.sin(a-e.fa),Math.cos(a-e.fa)));if(df<(e.sh==='i'?1.3:1)){if(e.sh==='r')EB.push({uid:++bulletUidCounter,x:b.x,y:b.y,vx:-b.vx*.7,vy:-b.vy*.7,el:b.el,l:3,d:8+G.w,r:5});burst(b.x,b.y,'#fff',5,150);SFX.hit();B.splice(i,1);break}}
  b.h.push(e);dmgE(e,b.d,b.el,b._guest);if(b.iceSet&&b.el==='ice')e.slow=Math.max(e.slow||0,.45);SFX.hit();burst(b.x,b.y,EC[b.el],3,120);if(b.cr){HS=Math.max(HS,2);SHK=Math.max(SHK,3)}if(--b.pi<=0){B.splice(i,1);break}}}
  E.forEach(e=>{
    // determine target (nearest alive player during PvP)
    if(PVP.active && PVP.oppAlive){
      const dHost=Math.hypot(P.x-e.x,P.y-e.y);
      const dGuest=Math.hypot(PVP.oppX-e.x,PVP.oppY-e.y);
      if(PVP.playerDead || dGuest<dHost){
        SIM.x=PVP.oppX;SIM.y=PVP.oppY;SIM.r=13;SIM.ang=Math.atan2(PVP.oppY-e.y,PVP.oppX-e.x);SIM.hp=PVP.oppHp;
        e._targetGuest=true;
      }else{
        SIM.x=P.x;SIM.y=P.y;SIM.r=P.r;SIM.ang=P.ang;SIM.hp=P.hp;
        e._targetGuest=false;
      }
    }else{
      SIM.x=P.x;SIM.y=P.y;SIM.r=P.r;SIM.ang=P.ang;SIM.hp=P.hp;
      e._targetGuest=false;
    }
    const dx=SIM.x-e.x,dy=SIM.y-e.y,d=Math.hypot(dx,dy)||1;let t=dt*(e.fz?1.2:1);if(e.slow>0){t*=.55;e.slow=Math.max(0,e.slow-dt)}const a=Math.atan2(dy,dx);
    e.fl=Math.max(0,e.fl-dt);e.fm=e.fz?1.25:1;e.ox=e.x;e.oy=e.y;e.fx=dx<0?-1:1;
    if(e.sh){const df=Math.atan2(Math.sin(a-e.fa),Math.cos(a-e.fa));e.fa+=cl(df,-e.tr*t,e.tr*t)}else e.fa=a;if(e.inv>0)e.inv-=dt;
    if(!e.in){const q=Math.hypot(W/2-e.x,H/2-e.y)||1,m=Math.max(e.spd,100);go(e,t,(W/2-e.x)/q*m,(H/2-e.y)/q*m)}else AI[e.b](e,t,dx,dy,d);e.x+=e.kx*dt;e.y+=e.ky*dt;e.kx*=.9;e.ky*=.9;
    if(e.x>0&&e.x<W&&e.y>0&&e.y<H)e.in=1;if(e.in){e.x=cl(e.x,e.r,W-e.r);e.y=cl(e.y,e.r,H-e.r)}
    e.v=Math.hypot(e.x-e.ox,e.y-e.oy);
    if(!e.gh&&!e.lt&&d<e.r+SIM.r&&!PVP.playerDead&&!e._targetGuest)hurt((10+G.w)*e.dm,e.x,e.y,true);
  });
  for(let i=EB.length-1;i>=0;i--){const b=EB[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(b.l<=0||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30){EB.splice(i,1);continue}if(!PVP.playerDead&&Math.hypot(b.x-P.x,b.y-P.y)<P.r+(b.r||4)){EB.splice(i,1);hurt(b.d||7+G.w*1.5,b.x,b.y,false)}}
  for(let i=CR.length-1;i>=0;i--){const c=CR[i],dh=D(c,P)||1;let target=P,d=dh,who='host';if(PVP.active&&PVP.role==='host'&&PVP.oppAlive){const dg=Math.hypot(c.x-PVP.oppX,c.y-PVP.oppY)||1;if(dg<d){d=dg;target={x:PVP.oppX,y:PVP.oppY};who='guest'}}c.b=(c.b||0)+dt;if(d<ST.mag&&(!PVP.playerDead||who==='guest')){c.x+=(target.x-c.x)/d*180*dt;c.y+=(target.y-c.y)/d*180*dt}if(who==='host'&&dh<P.r+12&&!PVP.playerDead){G.cr[c.t]++;CR.splice(i,1);if(PVP.active&&PVP.role==='host'&&PVP.stats)PVP.stats.host.crates++;SFX.pick();burst(c.x,c.y,'#ffd23a',12,140)}}
  if(G.storm>0){G.storm-=dt;G.stt-=dt;if(G.stt<=0){G.stt=.25;burst(R(0,W),R(0,H),'#ff7a2a',25,260);SFX.boom();const owner=G.stormOwner==='guest'?'guest':'host',sd=owner==='guest'?(PVP.opponentLoadout?.damage||10):ST.dmg;E.forEach(e=>dmgE(e,sd*1.3,'fire',owner==='guest'));if(PVP.active&&PVP.role==='host'){if(owner==='guest'&&!PVP.playerDead){PVP.stats.guest.damage=(PVP.stats.guest.damage||0)+sd*.35;hurt(sd*.35,P.x,P.y,true)}else if(owner==='host'&&PVP.oppAlive)damagePvpGuest(sd*.35,'player-special')}}}
  HO.forEach(h=>{h.t-=dt;const owner=h.owner==='guest'?'guest':'host',od=owner==='guest'?(PVP.opponentLoadout?.damage||10):ST.dmg;E.forEach(e=>{const dx=h.x-e.x,dy=h.y-e.y,d=Math.hypot(dx,dy)||1;if(d<280&&e.ty!=='b'){e.x+=dx/d*(260-d*.5)*dt;e.y+=dy/d*(260-d*.5)*dt}if(d<110)dmgE(e,od*2.5*dt,'vortex',owner==='guest')});if(PVP.active&&PVP.role==='host'){if(owner==='host'&&PVP.oppAlive&&Math.hypot(h.x-PVP.oppX,h.y-PVP.oppY)<110)damagePvpGuest(od*.18*dt,'player-special');else if(owner==='guest'&&!PVP.playerDead&&Math.hypot(h.x-P.x,h.y-P.y)<110){PVP.stats.guest.damage=(PVP.stats.guest.damage||0)+od*.18*dt;hurt(od*.18*dt,P.x,P.y,true)}}});HO=HO.filter(h=>h.t>0);
  // Passive damage belongs to the living local player only. A dead host continues the shared simulation for the survivor, but their equipment auras cannot keep attacking.
  if(!PVP.active||!PVP.playerDead){if(ST.so)E.forEach(e=>{if(D(e,P)<90+e.r)dmgE(e,ST.dmg*1.8*dt,'solar')});if(ST.fireAura&&P.at==='fire')E.forEach(e=>{if(D(e,P)<78+e.r)dmgE(e,ST.dmg*.45*dt,'fire')});if(S.up.slime>0)E.forEach(e=>{if(SL.some(s=>Math.hypot(s.x-e.x,s.y-e.y)<e.r+9))dmgE(e,3*S.up.slime*dt,'neutral')});}
  for(let j=E.length-1;j>=0;j--)if(E[j].hp<=0)kill(E[j],j);
  upd2(dt);PT.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.l-=dt});PT=PT.filter(p=>p.l>0);
  if(PVP.active&&PVP.role==='host'&&PVP.opponent&&PVP.phase==='playing'){
    if(PVP.oppAlive){
      for(let i=EB.length-1;i>=0;i--){const b=EB[i];if(Math.hypot(b.x-PVP.oppX,b.y-PVP.oppY)<13+(b.r||4)){const a=Math.atan2(b.y-PVP.oppY,b.x-PVP.oppX),front=Math.abs(Math.atan2(Math.sin(a-(PVP.oppAng+(PVP.oppShieldSide||0))),Math.cos(a-(PVP.oppAng+(PVP.oppShieldSide||0)))));EB.splice(i,1);if(PVP.oppShield&&front<1.1){netSend(PVP.opponent,{type:'pvp_blocked',matchId:PVP.matchId,x:PVP.oppX,y:PVP.oppY});continue}const dmg=(b.d||7+G.w*1.5)*0.85;damagePvpGuest(dmg,'enemy-projectile')}}
      for(const e of E){if(e.gh||e.lt||!e.in)continue;if(Math.hypot(e.x-PVP.oppX,e.y-PVP.oppY)<e.r+13)damagePvpGuest((10+G.w)*dt,'enemy-contact')}
    }
    for(const c of CR)if(c.uid==null)c.uid=++crateUidCounter;for(const e of E)if(e.uid==null)e.uid=++enemyUidCounter;
    PVP.lastSnapshot+=dt;
    if(G.st==='inter'){PVP.lastIntermissionTick=(PVP.lastIntermissionTick||0)+dt;if(PVP.lastIntermissionTick>=.25){PVP.lastIntermissionTick=0;netSend(PVP.opponent,{type:'pvp_intermission_tick',matchId:PVP.matchId,wave:G.w,remaining:G.tmr,nextWave:G.w+1,name:WV[G.w]&&WV[G.w][0]})}}
    if(PVP.lastSnapshot>=0.066){
      PVP.lastSnapshot=0;
      netSend(PVP.opponent,{type:'pvp_snapshot',matchId:PVP.matchId,seed:PVP.seed,wave:G.w,waveName:G.name,el:G.el,fr:G.fr?1:0,stage:G.st,intermissionRemaining:G.st==='inter'?G.tmr:0,waveTimer:G.t,queueCount:G.q.length,total:G.tot,dead:G.dead,
        enemies:E.map(e=>({uid:e.uid,id:e.id,x:Math.round(e.x),y:Math.round(e.y),hp:e.hp,mh:e.mh,el:e.el,r:e.r,ty:e.ty,fz:e.fz?1:0,gh:e.gh?1:0,in:e.in?1:0,v:e.v||0,fx:e.fx||1,fa:e.fa||0,o:e.o||0,fl:e.fl||0,inv:e.inv||0,sh:e.sh||0,rg:e.rg?1:0,lt:e.lt?1:0})),
        eb:EB.map(b=>({uid:b.uid||null,x:Math.round(b.x),y:Math.round(b.y),r:b.r||4,el:b.el,vx:b.vx,vy:b.vy,d:b.d||0})),
        hb:B.filter(b=>!b._guest).map(b=>({uid:b.uid||null,x:Math.round(b.x),y:Math.round(b.y),r:b.r||4,el:b.el,vx:b.vx,vy:b.vy,pi:b.pi||1})),
        cr:CR.map(c=>({uid:c.uid,x:Math.round(c.x),y:Math.round(c.y),t:c.t,b:c.b||0})),
        hazards:HZ.map(h=>({x:h.x,y:h.y,r:h.r,ty:h.ty,t:h.t,w:h.w})),lines:TL.map(l=>({...l})),beams:BM.map(b=>({x:b.x,y:b.y,a:b.a,w:b.w,t:b.t,wd:b.wd,c:b.c,rot:b.rot})),particles:PT.slice(-180).map(p=>({x:p.x,y:p.y,vx:p.vx,vy:p.vy,l:p.l,c:p.c,sh:p.sh||0,a:p.a||0})),meteorFx:MS.map(m=>({x0:m.x0,y0:m.y0,x1:m.x1,y1:m.y1,t:m.t,T:m.T,c:m.c})),slime:SL.slice(-120).map(v=>({x:v.x,y:v.y,t:v.t})),holes:HO.map(h=>({x:h.x,y:h.y,t:h.t,owner:h.owner||'host'})),
        hostHp:P.hp,hostMh:ST.mhp,hostAlive:!PVP.playerDead,hostX:Math.round(P.x),hostY:Math.round(P.y),hostAt:P.at,hostHeading:P.ang,hostDrone:G.spi?{x:G.spi.x,y:G.spi.y}:null,hostTaunt:P.taunt&&P.taunt.until>Date.now()?P.taunt:null,guestTaunt:PVP.oppTaunt&&PVP.oppTaunt.until>Date.now()?PVP.oppTaunt:null,guestHp:PVP.oppHp,guestMh:PVP.oppMh,guestAlive:PVP.oppAlive,lastClearedWave:Number(G.lastClearedWave)||0,storm:Number(G.storm)||0,stormTick:Number(G.stt)||0,stormOwner:G.stormOwner==='guest'?'guest':'host',stats:PVP.stats});
    }
  }
}
function timeoutPvp(){ /* v0.5.3: no timer-based match conclusions. */ }
