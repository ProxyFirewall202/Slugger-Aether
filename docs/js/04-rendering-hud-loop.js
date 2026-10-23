/* Slugger NEO v0.5.4.3 — Canvas drawing, player/enemy rendering, HUD, run conclusion UI, and base loop declaration.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
function drEn(e){const f=Math.floor(T*7+(e.o||0))%2,k='e'+e.id+'_'+f,im=(e.fl>0?WH:SP)[k];if(!im)return;const bs=e.ty==='b',sw=e.r*(bs?2.7:3.5),sq=Math.min(.25,(e.v||0)*.05)+.05*Math.sin(T*9+(e.o||0)),bo=bs?0:Math.abs(Math.sin(T*7+(e.o||0)))*3,col=e.fz?'#ff2222':EC[e.el];
cx.save();cx.translate(e.x,e.y-bo);cx.globalAlpha=e.gh?.35:1;cx.scale((e.fx||1)*(1+sq),1-sq);cx.shadowColor=col;cx.shadowBlur=e.fz?22:12;cx.drawImage(im,-sw/2,-sw/2,sw,sw);cx.restore();
cx.fillStyle=col;cx.globalAlpha=e.gh?.3:.85;for(let i=0;i<3;i++){const a=T*2+i*2.09+(e.o||0);cx.beginPath();cx.arc(e.x+Math.cos(a)*(e.r+9),e.y+Math.sin(a)*(e.r+9)-bo,2.5,0,7);cx.fill()}cx.globalAlpha=1;
if(e.fz){cx.fillStyle='#ff1a1a';for(const s of[-1,1]){cx.beginPath();cx.arc(e.x+s*.11*sw,e.y-.03*sw-bo,2.6,0,7);cx.fill()}cx.strokeStyle='#ff3030aa';cx.lineWidth=3;cx.beginPath();cx.arc(e.x,e.y-bo,e.r+7+Math.sin(T*12)*2,0,7);cx.stroke()}
if((e.inv||0)>0){cx.strokeStyle='#fff';cx.globalAlpha=.8;cx.lineWidth=5;cx.beginPath();cx.arc(e.x,e.y,e.r+14,0,7);cx.stroke();cx.globalAlpha=1}
if(e.rg)for(let q=0;q<3;q++){const sa=T*2.2+q*2.094;cx.fillStyle=EC.vortex;cx.shadowColor=EC.vortex;cx.shadowBlur=12;cx.beginPath();cx.arc(e.x+Math.cos(sa)*38,e.y+Math.sin(sa)*38,8,0,7);cx.fill();cx.shadowBlur=0}
if(e.sh){const w=e.sh==='i'?1.3:1;cx.strokeStyle=e.sh==='r'?'#fff':'#9fb0c8';cx.lineWidth=6;cx.lineCap='round';cx.beginPath();cx.arc(e.x,e.y,e.r+8,(e.fa||0)-w,(e.fa||0)+w);cx.stroke()}
if(bs){cx.strokeStyle=EC[e.el];cx.globalAlpha=.6;cx.lineWidth=3;cx.beginPath();cx.arc(e.x,e.y,e.r+10+3*Math.sin(T*4),0,7);cx.stroke();cx.globalAlpha=1;for(let i=0;i<3;i++){cx.save();cx.translate(e.x,e.y);cx.rotate(T*.8+i*2.09);cx.fillStyle='#4a4470';cx.strokeStyle='#0a0814';cx.lineWidth=3;cx.fillRect(e.r-4,-5,26,10);cx.strokeRect(e.r-4,-5,26,10);cx.fillStyle=EC[e.el];cx.beginPath();cx.arc(e.r+24,0,5,0,7);cx.fill();cx.restore()}}}
function drSlug(){if(PVP.active&&PVP.playerDead)return;const sp=Math.hypot(P.vx,P.vy),sq=Math.min(.3,sp/60*.05),col=EC[P.at],fi=P.inv>.15?'h'+(Math.floor(T*14)%2):(md||P.rx<-3)?'f'+(P.rx<-4?0:1):(S.up.slime>0&&sp>40)?'s'+(Math.floor(T*8)%3):'i'+(Math.floor(T*5)%4),im=SP['sl'+fi];if(!im)return;
const fa=fi[0]==='f'?P.ang:P.fa,da=P.ang-fa,px=Math.cos(da)*2.4,py=Math.sin(da)*2.4,w=fi[0]==='i'?[0,2,0,-2][+fi[1]]:0;
cx.save();cx.translate(P.x,P.y);if(P.inv>0&&Math.floor(P.inv*20)%2)cx.globalAlpha=.55;cx.rotate(fa);cx.scale(1+sq,1-sq);cx.shadowColor=col;cx.shadowBlur=24;cx.drawImage(im,-32,-24,64,48);cx.shadowBlur=0;
cx.fillStyle='#0a0814';for(const s of[-1,1]){cx.beginPath();cx.arc(12+px,s*5.5+py,fi[0]==='h'?2:2.5,0,7);cx.fill()}
cx.fillStyle=col;cx.shadowColor=col;cx.shadowBlur=10;for(const s of[-1,1]){cx.beginPath();cx.arc(27+w,s*13,2.4,0,7);cx.fill()}cx.restore()}
function drGun(){if(PVP.playerDead)return;const w=ST.w,len=w.pi?24:w.k?15:w.r<.15?21:17,th=w.pi?9:w.k?10:w.r<.15?5:7,col=EC[P.at],o=29+P.rx;cx.save();cx.translate(P.x+Math.cos(P.ang)*o,P.y+Math.sin(P.ang)*o);cx.rotate(P.ang);if(Math.abs(P.ang)>1.57)cx.scale(1,-1);
cx.lineWidth=2.5;cx.strokeStyle='#0a0814';cx.fillStyle='#5b5488';cx.beginPath();cx.rect(-9,-th/2,len,th);cx.fill();cx.stroke();cx.fillStyle='#2a2540';for(let i=0;i<3;i++)cx.fillRect(-4+i*4,-th/2+1,2,th-2);
cx.shadowColor=col;cx.shadowBlur=10;cx.fillStyle=col;cx.beginPath();cx.arc(-9,0,3.3+Math.sin(T*8)*.7,0,7);cx.fill();cx.restore()}
function draw(){cx.globalCompositeOperation='source-over';cx.globalAlpha=1;cx.shadowBlur=0;
const pl=BG[G?G.el:'neutral']||BG.neutral,gr=cx.createLinearGradient(0,0,0,H);gr.addColorStop(0,pl[0]);gr.addColorStop(1,pl[1]);cx.fillStyle=gr;cx.fillRect(0,0,W,H);
cx.fillStyle='#fff';stars.forEach((s,i)=>{cx.globalAlpha=.1+.07*(i%3);cx.beginPath();cx.arc(((s.x+Math.sin(T*.4+i)*16)%W+W)%W,(((s.y-T*(4+s.s*3))%H)+H)%H,s.s*5,0,7);cx.fill()});cx.globalAlpha=1;
cx.strokeStyle=G&&G.fr?'#ff3030cc':'#ffffff22';cx.lineWidth=G&&G.fr?4:2;cx.strokeRect(2,2,W-4,H-4);
if(!G||mode==='hub')return;
cx.save();if(PVP.active&&PVP.playerDead)cx.translate(W/2-(Number.isFinite(PVP.oppX)?PVP.oppX:P.x),H/2-(Number.isFinite(PVP.oppY)?PVP.oppY:P.y));if(SHK>.3)cx.translate((Math.random()*2-1)*SHK,(Math.random()*2-1)*SHK);
const dc=(x,y,r,c)=>{cx.fillStyle=c;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill()};
SL.forEach(s=>{cx.globalAlpha=Math.min(.55,s.t/2);dc(s.x,s.y,10+Math.sin(T*5+s.x)*1.5,'#7dff3c')});cx.globalAlpha=1;
HO.forEach(h=>{const g=cx.createRadialGradient(h.x,h.y,2,h.x,h.y,70);g.addColorStop(0,'#000');g.addColorStop(.5,'#7a2bd4');g.addColorStop(1,'#7a2bd400');dc(h.x,h.y,70,g)});
HZ.forEach(h=>{const c=HC[h.ty];cx.fillStyle=c;cx.strokeStyle=c;if(h.w>0){cx.globalAlpha=.2+.15*Math.sin(T*16);cx.beginPath();cx.arc(h.x,h.y,h.r,0,7);cx.fill();cx.globalAlpha=.9;cx.lineWidth=3;cx.setLineDash([8,6]);cx.beginPath();cx.arc(h.x,h.y,h.r,0,7);cx.stroke();cx.setLineDash([])}else{cx.globalAlpha=Math.min(.5,h.t/1.2)*(.8+.2*Math.sin(T*5+h.x));cx.beginPath();cx.arc(h.x,h.y,h.r,0,7);cx.fill();cx.globalAlpha=.7*Math.min(1,h.t);cx.lineWidth=2;cx.stroke()}});cx.globalAlpha=1;
TL.forEach(l=>{cx.strokeStyle=l.c;cx.globalAlpha=.35+.35*Math.sin(T*40);cx.lineWidth=3;cx.beginPath();cx.moveTo(l.x1,l.y1);cx.lineTo(l.x2,l.y2);cx.stroke()});cx.globalAlpha=1;
BM.forEach(b=>{const ex=b.x+Math.cos(b.a)*1000,ey=b.y+Math.sin(b.a)*1000;if(b.w>0){const nx=-Math.sin(b.a)*(b.wd+13),ny=Math.cos(b.a)*(b.wd+13);cx.globalAlpha=.2+.15*Math.sin(T*20);cx.fillStyle=b.c;cx.beginPath();cx.moveTo(b.x+nx,b.y+ny);cx.lineTo(ex+nx,ey+ny);cx.lineTo(ex-nx,ey-ny);cx.lineTo(b.x-nx,b.y-ny);cx.fill()}else{cx.globalAlpha=1;cx.shadowColor=b.c;cx.shadowBlur=18;cx.strokeStyle=b.c;cx.lineWidth=b.wd*2;cx.beginPath();cx.moveTo(b.x,b.y);cx.lineTo(ex,ey);cx.stroke();cx.strokeStyle='#fff';cx.lineWidth=b.wd*.7;cx.stroke();cx.shadowBlur=0}});cx.globalAlpha=1;
CR.forEach(c=>{const im=SP['cr'+c.t];if(!im)return;cx.save();cx.translate(c.x,c.y+Math.sin(c.b*4)*3);cx.rotate(Math.sin(c.b*3)*.12);cx.shadowColor=CC[c.t];cx.shadowBlur=16;cx.drawImage(im,-20,-20,40,40);cx.restore()});
E.forEach(drEn);
MS.forEach(m=>{const p=m.t/m.T,x=m.x0+(m.x1-m.x0)*p,y=m.y0+(m.y1-m.y0)*p,hy=y-Math.sin(p*Math.PI)*120;cx.fillStyle='#0006';cx.beginPath();cx.ellipse(x,y,8,4,0,0,7);cx.fill();dc(x,hy,8,m.c);dc(x,hy,4,'#fff')});
const bo=E.find(e=>e.ty==='b');if(bo){cx.fillStyle='#0a0814';cx.fillRect(W/2-204,H-30,408,14);cx.fillStyle=EC[bo.el];cx.fillRect(W/2-200,H-27,400*Math.max(0,bo.hp/bo.mh),8);cx.fillStyle='#fff';cx.font='800 12px Orbitron,sans-serif';cx.textAlign='center';cx.fillText((bo.id===30?'Aether Monarch':'Frost Reaper')+(bo.p2?' (enraged)':''),W/2,H-36)}
B.forEach(b=>{const sp=Math.hypot(b.vx,b.vy)||1;cx.shadowColor=EC[b.el];cx.shadowBlur=14;cx.strokeStyle=EC[b.el];cx.lineWidth=(b.r||4)*1.7;cx.lineCap='round';cx.beginPath();cx.moveTo(b.x-b.vx/sp*12,b.y-b.vy/sp*12);cx.lineTo(b.x,b.y);cx.stroke();dc(b.x,b.y,(b.r||4)*.7,'#fff')});
EB.forEach(b=>{cx.shadowColor=EC[b.el];cx.shadowBlur=10;dc(b.x,b.y,(b.r||4)+2,EC[b.el]);dc(b.x,b.y,(b.r||4)-1,'#fff')});cx.shadowBlur=0;
if(PVP.active&&PVP.role==='guest'){
  PVP.hostBulletsSnap.forEach(b=>{const sp=Math.hypot(b.vx,b.vy)||1;cx.shadowColor=EC[b.el];cx.shadowBlur=14;cx.strokeStyle=EC[b.el];cx.lineWidth=(b.r||4)*1.7;cx.lineCap='round';cx.beginPath();cx.moveTo(b.x-b.vx/sp*12,b.y-b.vy/sp*12);cx.lineTo(b.x,b.y);cx.stroke();dc(b.x,b.y,(b.r||4)*.7,'#fff')});
}
if(G.spi&&(!PVP.active||!PVP.playerDead)){cx.save();cx.translate(G.spi.x,G.spi.y);cx.shadowColor=EC[P.at];cx.shadowBlur=12;cx.fillStyle='#9dffd0';cx.strokeStyle='#0a0814';cx.lineWidth=2.5;cx.beginPath();cx.ellipse(0,0,10,7,Math.sin(T*3)*.3,0,7);cx.fill();cx.stroke();dc(4,-2,2.5,'#fff');dc(5,-2,1.2,'#0a0814');cx.restore()}
if(ST.so&&!PVP.playerDead){cx.strokeStyle='#ffcc0099';cx.lineWidth=3;cx.beginPath();cx.arc(P.x,P.y,90+Math.sin(T*6)*3,0,7);cx.stroke()}
const sh=eqI('s');if(sh&&!PVP.playerDead){cx.strokeStyle='#00ccffcc';cx.lineWidth=5;cx.lineCap='round';cx.beginPath();cx.arc(P.x,P.y,34,P.ang+sh.side-1.1,P.ang+sh.side+1.1);cx.stroke()}
if(PVP.active&&PVP.oppAlive!==false&&PVP.oppX!==undefined){
  const ox=PVP.oppX,oy=PVP.oppY;
  cx.save();cx.translate(ox,oy);cx.rotate(PVP.oppAng||0);cx.globalAlpha=.55;cx.shadowColor='#00ccff';cx.shadowBlur=14;
  const im=SP['sl'+((Math.floor(T*5)%4===0)?'i1':'i0')];
  if(im)cx.drawImage(im,-24,-18,48,36);
  cx.restore();cx.globalAlpha=1;
  cx.fillStyle='#00ccff';cx.font='9px Orbitron,sans-serif';cx.textAlign='center';cx.fillText('OPP',ox,oy-26);
}
if(!PVP.active||!PVP.playerDead){drSlug();drGun();}
cx.globalCompositeOperation='lighter';PT.forEach(p=>{cx.globalAlpha=Math.min(1,p.l*2);cx.fillStyle=p.c;cx.strokeStyle=p.c;if(p.sh===1){cx.lineWidth=2;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.vx*.04,p.y-p.vy*.04);cx.stroke()}else if(p.sh===2){cx.beginPath();cx.moveTo(p.x+4*Math.cos(p.a),p.y+4*Math.sin(p.a));cx.lineTo(p.x+2*Math.cos(p.a+2.4),p.y+2*Math.sin(p.a+2.4));cx.lineTo(p.x+2*Math.cos(p.a-2.4),p.y+2*Math.sin(p.a-2.4));cx.fill()}else dc(p.x,p.y,2.6,p.c)});cx.globalAlpha=1;cx.globalCompositeOperation='source-over';
cx.restore();
if(G.st==='inter'&&G.w<10){const k=1+.06*Math.sin(T*6),tx='Wave '+(G.w+1)+': '+WV[G.w][0];cx.save();cx.translate(W/2,H/2-80);cx.scale(k,k);cx.font='800 30px Orbitron,sans-serif';cx.textAlign='center';cx.lineWidth=7;cx.lineJoin='round';cx.strokeStyle='#0a0814';cx.strokeText(tx,0,0);cx.fillStyle='#fff';cx.fillText(tx,0,0);cx.restore()}
if(PVP.active&&PVP.playerDead){cx.fillStyle='#ff3355';cx.font='800 20px Orbitron,sans-serif';cx.textAlign='center';cx.fillText('SPECTATING',W/2,60);cx.font='11px Orbitron,sans-serif';cx.fillStyle='#a9c4d8';cx.fillText('Waiting for match to end',W/2,82)}}
function hud(){if(!G||mode==='hub'){$('topHUD').innerHTML='';return}
const b=(v,m,c)=>`<span class=bar><i style="width:${Math.max(0,Math.min(100,100*v/m))}%;background:${c}"></i></span>`,n=Object.values(G.cr).reduce((a,c)=>a+c,0),chips=EL6.map((el,i)=>S.att.includes(el)?`<span class="chip${P.at===el?' on':''}" style="--c:${EC[el]}">${i+1} ${EN[el]}</span>`:'').join('');
let pvp='';
if(PVP.active){
  const hostSide=PVP.role==='host',ohp=Math.max(0,Number(PVP.oppHp)||0),omhp=Math.max(1,Number(PVP.oppMh)||100),oalive=PVP.oppAlive!==false,youDead=PVP.playerDead,elapsed=Math.max(1,(Date.now()-(PVP.startTime||Date.now()))/1000),mine=PVP.stats?.[PVP.role]||{},theirs=PVP.stats?.[hostSide?'guest':'host']||{},myDps=Math.round((Number(mine.damage)||0)/elapsed),opDps=Math.round((Number(theirs.damage)||0)/elapsed),shield=eqI('s')?'SHIELD ON':'NO SHIELD';
  pvp=`<div class=pvpBanner>⚔ ${PVP.target===5?'SHORT SPRINT':'FULL RAID'} · Wave ${G?.w||1} · <b>${PVP.role.toUpperCase()}</b> · ${youDead?'<span class=dead>YOU DEAD</span>':`You ${Math.round(P.hp)}/${Math.round(ST.mhp)}`} · Opp ${Math.round(ohp)}/${Math.round(omhp)}${oalive?'':' ☠'} · ${shield} · Protons ${S.pro||0} · DPS ${myDps}:${opDps} · ${EN[PVP.oppAt]||'Neutral'}</div>`;
}
$('topHUD').innerHTML=`${pvp}<span>Warp ${G.warp}</span><span style="color:${EC[G.el]}">Wave ${G.w||1}: ${G.name}</span><span>HP ${b(P.hp,ST.mhp,'#ff3355')}</span><span>Special ${b(P.spm-P.sp,P.spm,'#ffcc00')}</span>${ST.ad?`<span>Ammo ${P.ammo}</span>`:''}<span>Crates ${n}</span><span>Souls ${G.souls}</span><span>Foes ${E.length+G.q.length}${G.fr?' FRENZY':''}</span><div class=ch>${chips}</div>`}
function endRun(win){if(mode==='hub'||(G&&G.runBanked))return;if(G)G.runBanked=true;mode='hub';$('pauseOverlay').className='ov';
if(win)CR.forEach(c=>G.cr[c.t]++);
S.warp+=G.warp;S.souls+=G.souls;let n=0;for(const k in G.cr){S.cr[k]+=G.cr[k];n+=G.cr[k]}S.hi=Math.max(S.hi,G.warp);S.cp.sort((a,b)=>a-b);md=false;
logs=[(win?'Victory: the Aether boss is down.':'Run over.')+` Reached wave ${G.w}, banked ${G.warp} Warp, ${G.souls} souls and ${n} crate${n==1?'':'s'}.`];save();netBroadcast({type:'status',mode:'hub'});hub()}
function pz(){if(PVP.active){return}if(mode==='play'){mode='pause';$('pauseOverlay').className='ov on'}else if(mode==='pause'){mode='play';$('pauseOverlay').className='ov'}}
const bt=(f,t,x,tp)=>`<button${x?'':' disabled'} onclick="${f}"${tp?` class=tt data-tip="${tp}"`:''}>${t}</button>`;
const TABS=['Deploys & checkpoints','Crate decryption','Skill tree & upgrades','Loadout & reinforcement','Friends & network'];
const UP=[['hp','Max health',5,60,'❤'],['oc','Blaster overclock',5,80,'⚡'],['thr','Movement thrusters',3,70,'🚀'],['slime','Slime trail generator',3,150,'🧪'],['amp','Attunement amplifiers',5,90,'✨']];

/* Base loop declaration is placed here intentionally: it was hoisted in the original monolithic script. */
function loop(t){
  const dt=Math.min(.05,(t-last)/1000)||0;last=t;T+=dt;
  DBG.frames++;
  if(t-DBG.lastFpsT>500){DBG.fps=DBG.frames*1000/(t-DBG.lastFpsT);DBG.dt=dt*1000;DBG.frames=0;DBG.lastFpsT=t}
  if(DBG.open){DBG.diagT+=dt;if(DBG.diagT>0.25){DBG.diagT=0;tickDbgDiag()}}
  pvpTickCountdown();pvpTickReconnect();
  setMus(mode==='hub'?'hub':mode==='pause'?mus:E.some(e=>e.ty==='b')?'boss':'combat');
  if(mode==='play'){if(HS>0)HS--;else upd(dt);hh-=dt;if(hh<=0){hh=.1;hud()}}
  draw();requestAnimationFrame(loop)
}
