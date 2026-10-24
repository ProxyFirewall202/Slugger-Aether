/* Slugger NEO v0.6.2 Phase 2 — Authoritative network packets/snapshots, data-channel messages, chats, direct messages, and invitations.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
function netData(pid,d){
  if(!d||typeof d!=='object')return;
  NET.pktsRecv++;NET.bytesRecv+=(JSON.stringify(d)||'').length;
  if(d.type==='chat')netChat(pid,String(d.msg||'').slice(0,200));
  else if(d.type==='ping')netSend(pid,{type:'pong',t:d.t});
  else if(d.type==='pong')NET.ping=Date.now()-d.t;
  else if(d.type==='hello'){if(NET.friends[pid]&&d.name)NET.friends[pid].name=d.name;netSaveFriends();netRender()}
  else if(d.type==='status'){if(!NET.friends[pid])NET.friends[pid]={name:pid.replace(/^SLUG-/,''),added:Date.now()};NET.friends[pid].status=d.mode==='hub'?'IN_LOBBY':d.mode==='game'?'IN_MATCH':d.mode==='pause'?'IN_MATCH':'IN_GAME';NET.friends[pid].at=d.at||'neutral';netSaveFriends();netRender()}
  else if(d.type==='pvp_invite')onPvpInvite(pid,d.target);
  else if(d.type==='pvp_accept'){if(!PVP.active)enterPvpLobby('host',pid,d.target===10?10:5)}
  else if(d.type==='pvp_decline')netSys((NET.friends[pid]?.name||pid)+' declined your invite');
  else if(d.type==='pvp_cancel'&&PVP.active&&pid===PVP.opponent&&['lobby','sync','countdown'].includes(PVP.phase)&&(!d.matchId||d.matchId===PVP.matchId)){netSys('Opponent cancelled the lobby');cleanupPvp();if(mode!=='hub'){mode='hub';hub()}}
  else if(d.type==='pvp_ready'){if(PVP.active&&pid===PVP.opponent&&PVP.phase==='lobby'){PVP.opponentLoadout=acceptPvpLoadout(d.loadout);if(PVP.opponentLoadout){PVP.oppShotDamageMax=Math.min(400,PVP.opponentLoadout.damage*3.3);PVP.oppShotCooldown=PVP.opponentLoadout.cooldown;PVP.oppPellets=PVP.opponentLoadout.pellets;PVP.oppMh=PVP.opponentLoadout.hp;PVP.oppTk=PVP.opponentLoadout.tk;PVP.oppDr=PVP.opponentLoadout.dr;PVP.oppMag=PVP.opponentLoadout.mag;PVP.oppHazardImmune=PVP.opponentLoadout.hazardImmune;}onPvpReady(pid)}}
  else if(d.type==='pvp_init'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&PVP.phase==='lobby'){
    PVP.matchId=String(d.matchId||'');PVP.target=d.target===10?10:5;PVP.seed=(Number(d.seed)>>>0)||1;PVP.countdownStart=0;PVP.phase='sync';PVP.stats={host:{damage:0,kills:0,crates:0,souls:0,combo:0,bestCombo:0,lastKillAt:0},guest:{damage:0,kills:0,crates:0,souls:0,combo:0,bestCombo:0,lastKillAt:0}};cleanupPvpLobbyUi();showPvpCountdown();const waiting=$('pvpCountdownOverlay');if(waiting)waiting.textContent='SYNC';netSend(pid,{type:'pvp_init_ack',matchId:PVP.matchId});netBroadcast({type:'status',mode:'game'});
  }}
  else if(d.type==='pvp_init_ack'){if(PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.phase==='sync'&&!PVP.initAck){PVP.initAck=true;PVP.countdownStart=Date.now();PVP.phase='countdown';netSend(pid,{type:'pvp_countdown_start',matchId:PVP.matchId,duration:3000});const o=$('pvpCountdownOverlay');if(o)o.textContent='3';}}
  else if(d.type==='pvp_countdown_start'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.phase==='sync'){PVP.countdownStart=Date.now();PVP.phase='countdown';}}
  else if(d.type==='pvp_resume'){if(PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.phase==='reconnecting'&&!PVP.finished){PVP.reconnectDeadline=0;PVP.phase=PVP.reconnectPhase||'playing';PVP.reconnectPhase=null;mode=PVP.phase==='playing'?'play':PVP.phase==='pause'?'pause':'hub';$('pauseOverlay').innerHTML=PVP.pauseHtml||'<h2>Paused</h2><button onclick="pz()">Resume (Esc)</button><button onclick="endRun(false)">Abandon run</button>';$('pauseOverlay').className=mode==='pause'?'ov on':'ov';netSys('Opponent reconnected; match resumed.')}}
  else if(d.type==='pvp_collect_crate'){if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'&&pid===PVP.opponent&&d.matchId===PVP.matchId){const idx=CR.findIndex(c=>c.uid===d.uid),c=idx>=0?CR[idx]:null;const dist=c?Math.hypot(c.x-PVP.oppX,c.y-PVP.oppY):Infinity;if(c&&dist<=Math.max(55,(PVP.oppMag||80)+28)){CR.splice(idx,1);if(typeof v06MarkCrateDiscovered==='function')v06MarkCrateDiscovered(c.t,false);if(PVP.stats&&PVP.stats.guest)PVP.stats.guest.crates++;netSend(pid,{type:'pvp_crate_collected',matchId:PVP.matchId,uid:c.uid,t:c.t});}else netSend(pid,{type:'pvp_crate_denied',matchId:PVP.matchId,uid:d.uid});}}
  else if(d.type==='pvp_crate_collected'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){const uid=Number(d.uid);pendingGuestCrates.delete(uid);if(G&&G.cr&&G.cr[d.t]!=null){G.cr[d.t]++;if(typeof v06MarkCrateDiscovered==='function')v06MarkCrateDiscovered(d.t,false);PVP.stats.guest.crates++;SFX.pick();burst(P.x,P.y,CC[d.t]||'#ffcc00',10,130);}}}
  else if(d.type==='pvp_crate_denied'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId)pendingGuestCrates.delete(Number(d.uid));}
  else if(d.type==='pvp_wave_start'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){G.w=d.wave;G.el=d.el;G.name=d.name;G.st='wave';G.tmr=0;G.fr=0;netSys(`Wave ${d.wave}: ${d.name}`)}}
  else if(d.type==='pvp_intermission_tick'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){G.st='inter';G.tmr=Math.max(0,Number(d.remaining)||0);G.nextWave=d.nextWave;G.name=d.name||G.name}}
  else if(d.type==='pvp_boss_spawn'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){G.name=d.name||G.name;G.bossSpawned=true;logs=[G.name+' has entered the arena!'];SFX.roar()}}
  else if(d.type==='pvp_player_died'){
    if(PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId){
      if(PVP.role==='host'){
        B=B.filter(b=>!b._guest);
        // A peer cannot award itself a result merely by claiming it died; the host validates its own HP authority.
        if(PVP.oppHp<=0||PVP.oppAlive===false){B=B.filter(b=>!b._guest);PVP.oppDead=true;PVP.oppAlive=false;if(PVP.playerDead)queuePvpResult('draw','both-dead');else netSend(pid,{type:'pvp_spectate',matchId:PVP.matchId,guestDead:true});}
      }else netSys('Awaiting host-authoritative match result…');
    }
  }
  else if(d.type==='pvp_blocked'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){SFX.hit();burst(Number(d.x)||P.x,Number(d.y)||P.y,'#fff',6,110)}}
  else if(d.type==='pvp_you_died'){
    if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&!PVP.playerDead){PVP.playerDead=true;P.hp=0;P.vx=P.vy=0;P.sp=0;md=false;for(const k of Object.keys(K))K[k]=0;netSend(pid,{type:'pvp_player_died',role:'guest',matchId:PVP.matchId});netSys('You died — spectating');}
  }
  else if(d.type==='pvp_guest_hp'){
    if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){
      const oldHp=P.hp;
      P.hp=Math.max(0,Math.min(ST.mhp,Number(d.hp)||0));
      if(oldHp>P.hp+0.5){SFX.hurt();burst(P.x,P.y,'#ff3355',8,150);if(P.hp<=0&&!PVP.playerDead){PVP.playerDead=true;P.vx=P.vy=0;P.sp=0;md=false;clearV05DeadAttacks(PVP.role);for(const k of Object.keys(K))K[k]=0;netSend(PVP.opponent,{type:'pvp_player_died',role:PVP.role,matchId:PVP.matchId});netSys('You died — awaiting the host result.')}}
    }
  }
  else if(d.type==='pvp_special'){
    if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&Date.now()>=PVP.guestSpecialReadyAt){
      const gx=PVP.oppX,gy=PVP.oppY,kind=['neutral','solar','vortex'].includes(d.kind)?d.kind:'neutral';PVP.guestSpecialReadyAt=Date.now()+(kind==='solar'?15000:kind==='vortex'?12000:6000);
      if(kind==='vortex'&&PVP.oppAlive){HO.push({x:cl(Number(d.x)||gx,0,W),y:cl(Number(d.y)||gy,0,H),t:4,owner:'guest'});}
      else if(kind==='solar'){G.storm=2.5;G.stt=0;G.stormOwner='guest';}
      else{const specialDamage=(PVP.opponentLoadout?.damage||10)*3;E.forEach(e=>{const dist=Math.hypot(e.x-gx,e.y-gy)||1;if(dist<170){dmgE(e,specialDamage,'neutral',true);e.kx+=(e.x-gx)/dist*600;e.ky+=(e.y-gy)/dist*600}});if(!PVP.playerDead&&Math.hypot(P.x-gx,P.y-gy)<170){PVP.stats.guest.damage=(PVP.stats.guest.damage||0)+specialDamage;hurt(specialDamage,gx,gy,true);}EB=EB.filter(b=>Math.hypot(b.x-gx,b.y-gy)>150);}
      SHK=Math.max(SHK,8);
    }
  }
  else if(d.type==='pvp_fire'){if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'&&pid===PVP.opponent&&PVP.oppAlive&&d.matchId===PVP.matchId&&typeof d.shotId==='string'&&d.shotId.length<=100&&!PVP.receivedShots.has(d.shotId)){const x=Number(d.x),y=Number(d.y),ang=Number(d.ang),damage=Number(d.dmg),el=EC[d.el]?d.el:'neutral',now=Date.now(),volleyId=String(d.volleyId||d.shotId).slice(0,100);let volley=PVP.oppVolleyMap.get(volleyId);if(!volley){if(now-(PVP.oppFireLastAt||0)<Math.max(65,(PVP.oppShotCooldown||.11)*780))return;PVP.oppFireLastAt=now;volley={at:now,count:0,max:PVP.oppPellets||1};PVP.oppVolleyMap.set(volleyId,volley);if(PVP.oppVolleyMap.size>160)PVP.oppVolleyMap.delete(PVP.oppVolleyMap.keys().next().value);}const lim=PVP.oppShotDamageMax||120;if([x,y,ang,damage].every(Number.isFinite)&&Math.hypot(x-PVP.oppX,y-PVP.oppY)<110&&damage>0&&damage<=lim&&volley.count<volley.max){volley.count++;PVP.receivedShots.add(d.shotId);if(PVP.receivedShots.size>2000)PVP.receivedShots=new Set([...PVP.receivedShots].slice(-1000));B.push({uid:d.shotId,x,y,vx:Math.cos(ang)*620,vy:Math.sin(ang)*620,d:damage,el,l:1.1,pi:Math.max(1,Math.min(5,Number(d.pi)||1)),r:Math.max(3,Math.min(9,Number(d.r)||4)),h:[],iceSet:d.iceSet===true&&el==='ice',_guest:true});}}}
  else if(d.type==='pvp_input'){if(PVP.active&&PVP.role==='host'&&PVP.phase==='playing'&&pid===PVP.opponent&&d.matchId===PVP.matchId){const x=Number(d.x),y=Number(d.y),now=Date.now();if(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=W&&y>=0&&y<=H){if(!PVP.oppLastInputAt){PVP.oppX=x;PVP.oppY=y;}else{const elapsed=cl((now-PVP.oppLastInputAt)/1000,.03,.25),maxStep=640*elapsed+38,dist=Math.hypot(x-PVP.oppX,y-PVP.oppY);if(dist<=maxStep){PVP.oppX=x;PVP.oppY=y;}else if(dist<maxStep*1.35){PVP.oppX+=((x-PVP.oppX)/dist)*maxStep;PVP.oppY+=((y-PVP.oppY)/dist)*maxStep;}}PVP.oppLastInputAt=now;}PVP.oppAt=EN[d.at]?d.at:'neutral';PVP.oppAngTarget=Number.isFinite(Number(d.ang))?Number(d.ang):PVP.oppAngTarget||0;PVP.oppDr=cl(Number(d.dr)||0,0,.75);PVP.oppTk=cl(Number(d.tk)||1,0.5,2);PVP.oppMag=cl(Number(d.mag)||80,40,300);const remoteMhp=cl(Number(d.mhp)||100,50,2000);if(!PVP.oppInitialised){PVP.oppHp=remoteMhp;PVP.oppMh=remoteMhp;PVP.oppInitialised=true;}else{PVP.oppMh=remoteMhp;PVP.oppHp=Math.min(PVP.oppHp,PVP.oppMh)}PVP.oppShield=!!d.shield;PVP.oppShieldSide=Number(d.shieldSide)||0;PVP.oppHazardImmune=!!d.hazardImmune;if(d.drone&&Number.isFinite(Number(d.drone.x))&&Number.isFinite(Number(d.drone.y)))PVP.oppDroneTarget={x:cl(Number(d.drone.x),0,W),y:cl(Number(d.drone.y),0,H)};if(d.alive===false){PVP.oppHp=0;PVP.oppAlive=false;}if(d.alive===false&&(PVP.oppHp<=0||PVP.oppAlive===false)&&!PVP.oppDead){PVP.oppDead=true;PVP.oppAlive=false;if(PVP.playerDead)showBothDeadSummary();else netSend(pid,{type:'pvp_spectate',matchId:PVP.matchId,guestDead:true});}}}
  else if(d.type==='pvp_snapshot'){if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&['playing','reconnecting'].includes(PVP.phase)){
    const oldEByUid=new Map(E.filter(e=>e.uid!=null).map(e=>[String(e.uid),e]));
    const oldEBByUid=new Map(EB.filter(e=>e.uid!=null).map(e=>[String(e.uid),e]));
    const oldCrByUid=new Map(CR.filter(c=>c.uid!=null).map(c=>[String(c.uid),c]));
    E=(Array.isArray(d.enemies)?d.enemies:[]).filter(e=>e&&typeof e==='object'&&e.uid!=null&&Number.isFinite(Number(e.x))&&Number.isFinite(Number(e.y))&&Number.isFinite(Number(e.r))).map(e=>{const prev=oldEByUid.get(String(e.uid));return {...e,x:prev?prev.x:e.x,y:prev?prev.y:e.y,tx:e.x,ty:e.y,v:e.v||0,fx:e.fx||1,fa:e.fa||0,o:e.o||0,cd:0,spd:0,fm:1,dm:1,tr:1,dk:0,sm:0,b:'idle',ph:0};});
    EB=(Array.isArray(d.eb)?d.eb:[]).filter(b=>b&&typeof b==='object'&&b.uid!=null&&[b.x,b.y,b.vx,b.vy].every(v=>Number.isFinite(Number(v)))).map(b=>{const prev=oldEBByUid.get(String(b.uid));return {...b,x:prev?prev.x:Number(b.x),y:prev?prev.y:Number(b.y),tx:Number(b.x),ty:Number(b.y),vx:Number(b.vx),vy:Number(b.vy),l:1,d:Number(b.d)||0,r:Number(b.r)||4}});
    PVP.hostBulletsSnap=(Array.isArray(d.hb)?d.hb:[]).filter(b=>b&&typeof b==='object'&&b.uid!=null&&[b.x,b.y,b.vx,b.vy].every(v=>Number.isFinite(Number(v)))).map(b=>({uid:b.uid,x:Number(b.x),y:Number(b.y),tx:Number(b.x),ty:Number(b.y),r:Math.max(1,Math.min(12,Number(b.r)||4)),el:EC[b.el]?b.el:'neutral',vx:Number(b.vx),vy:Number(b.vy),l:1}));
    CR=(Array.isArray(d.cr)?d.cr:[]).filter(c=>c&&typeof c==='object'&&c.uid!=null&&Number.isFinite(Number(c.x))&&Number.isFinite(Number(c.y))&&CRATE_CATALOG[c.t]&&!pendingGuestCrates.has(Number(c.uid))).map(c=>{if(typeof v06MarkCrateDiscovered==='function')v06MarkCrateDiscovered(c.t,false);const prev=oldCrByUid.get(String(c.uid));return {uid:c.uid,x:prev?prev.x:Number(c.x),y:prev?prev.y:Number(c.y),tx:Number(c.x),ty:Number(c.y),t:c.t,b:Number(c.b)||0}});HZ=(Array.isArray(d.hazards)?d.hazards:[]).filter(h=>h&&typeof h==='object'&&[h.x,h.y,h.r,h.t].every(v=>Number.isFinite(Number(v)))).map(h=>({...h,x:Number(h.x),y:Number(h.y),r:Math.max(0,Math.min(180,Number(h.r))),t:Math.max(0,Number(h.t))}));TL=(Array.isArray(d.lines)?d.lines:[]).filter(l=>l&&typeof l==='object'&&[l.x1,l.y1,l.x2,l.y2,l.t].every(v=>Number.isFinite(Number(v)))).map(l=>({...l,x1:Number(l.x1),y1:Number(l.y1),x2:Number(l.x2),y2:Number(l.y2),t:Math.max(0,Number(l.t))}));BM=(Array.isArray(d.beams)?d.beams:[]).filter(b=>b&&typeof b==='object'&&Number.isFinite(Number(b.x))&&Number.isFinite(Number(b.y))).map(b=>({...b,x:Number(b.x),y:Number(b.y)}));PT=(Array.isArray(d.particles)?d.particles:[]).filter(p=>p&&typeof p==='object'&&[p.x,p.y,p.vx,p.vy,p.l].every(v=>Number.isFinite(Number(v)))).map(p=>({...p,x:Number(p.x),y:Number(p.y),vx:Number(p.vx),vy:Number(p.vy),l:Math.max(0,Number(p.l))}));MS=(Array.isArray(d.meteorFx)?d.meteorFx:[]).filter(m=>m&&typeof m==='object'&&[m.x,m.y,m.t].every(v=>Number.isFinite(Number(v)))).map(m=>({...m,x:Number(m.x),y:Number(m.y),t:Math.max(0,Number(m.t))}));SL=(Array.isArray(d.slime)?d.slime:[]).filter(v=>v&&typeof v==='object'&&[v.x,v.y,v.t].every(n=>Number.isFinite(Number(n)))).map(v=>({...v,x:Number(v.x),y:Number(v.y),t:Math.max(0,Number(v.t))}));HO=(Array.isArray(d.holes)?d.holes:[]).filter(h=>h&&typeof h==='object'&&[h.x,h.y,h.t].every(v=>Number.isFinite(Number(v)))).map(h=>({...h,x:Number(h.x),y:Number(h.y),t:Math.max(0,Number(h.t))}));
    G.w=Number(d.wave)||G.w;if(d.el)G.el=d.el;G.name=d.waveName||WV[Math.max(0,G.w-1)][0];G.fr=d.fr?1:0;G.st=d.stage||G.st;G.tmr=Number(d.intermissionRemaining)||0;G.t=Number(d.waveTimer)||0;G.q=Array(Math.max(0,Number(d.queueCount)||0)).fill(0);G.dead=Number(d.dead)||G.dead;G.tot=Number(d.total)||G.tot;
    PVP.oppXT=Number(d.hostX)||W/2;PVP.oppYT=Number(d.hostY)||H/2;PVP.oppHp=Number(d.hostHp)||0;PVP.oppMh=cl(Number(d.hostMh)||100,50,2000);PVP.oppAt=EL6.includes(d.hostAt)?d.hostAt:'neutral';PVP.oppAlive=d.hostAlive!==false;G.lastClearedWave=Math.max(Number(G.lastClearedWave)||0,cl(Number(d.lastClearedWave)||0,0,10));G.storm=cl(Number(d.storm)||0,0,10);G.stt=cl(Number(d.stormTick)||0,0,1);G.stormOwner=d.stormOwner==='guest'?'guest':'host';if(d.stats&&typeof d.stats==='object'){for(const side of ['host','guest']){const src=d.stats[side];if(!src||typeof src!=='object')continue;for(const key of ['damage','kills','crates','souls','warp','combo','bestCombo']){const n=Number(src[key]);if(Number.isFinite(n))PVP.stats[side][key]=Math.max(0,n);}}}
    if(!PVP.oppAlive&&!PVP.oppDead){PVP.oppDead=true;PVP.oppHp=0;clearV05DeadAttacks(PVP.role==='host'?'guest':'host');netSys('Opponent has died — continuing as spectator until the run ends');if(PVP.role==='host'){if(PVP.playerDead)showBothDeadSummary();else netSend(PVP.opponent,{type:'pvp_spectate',matchId:PVP.matchId,guestDead:true});}}
    if(typeof d.guestHp==='number'&&Number.isFinite(d.guestHp)){const oldGuestHp=P.hp;P.hp=Math.max(0,Math.min(ST.mhp,d.guestHp));if(oldGuestHp>P.hp+.5){SFX.hurt();burst(P.x,P.y,'#ff3355',7,130)}if(P.hp<=0&&!PVP.playerDead){PVP.playerDead=true;P.vx=P.vy=0;netSend(pid,{type:'pvp_player_died',role:'guest',matchId:PVP.matchId});netSys('You died — awaiting the host result.')}}if(d.guestAlive===false&&!PVP.playerDead){PVP.playerDead=true;P.hp=0;netSend(pid,{type:'pvp_player_died',role:'guest',matchId:PVP.matchId})}
  }}
  else if(d.type==='pvp_end_ack'){if(PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.finished){PVP.resultAcked=true;if(PVP.resultResendTimer){clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=null;}if(PVP.resultBanked&&Date.now()-(PVP.resultAt||0)>=4200){if(PVP.resultExpiryTimer)clearTimeout(PVP.resultExpiryTimer);cleanupPvp();hub();}}}
  else if(d.type==='pvp_end'){
    if(PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){netSend(pid,{type:'pvp_end_ack',matchId:PVP.matchId,receivedAt:Date.now()});if(!PVP.finished){PVP.finished=true;PVP.winner=d.winner;PVP.reason=d.reason;PVP.phase='finished';mode='pause';$('pauseOverlay').className='ov';PVP.stats=d.stats||PVP.stats;const iWon=d.winner===PVP.role,isDraw=d.winner==='draw';if(G&&!PVP.guestResultApplied){const gs=PVP.stats?.guest||{},reached=cl(Math.floor(Number(d.reachedWave)||G.w||1),1,10),clearedWave=cl(Math.floor(Number(d.lastClearedWave)||G.lastClearedWave||0),0,10);G.lastClearedWave=clearedWave;G.warp=(Number(G.startWarp)||0)+(Number(gs.warp)||0)+(iWon?500:0);G.souls=Number(gs.souls)||0;S.hi=Math.max(Number(S.hi)||0,G.warp);for(let cleared=4;cleared<=clearedWave;cleared++){const cp=cleared-2;if(cp>=2&&cp<=8&&!S.cp.includes(cp))S.cp.push(cp)}S.rec[reached]=Math.max(Number(S.rec[reached])||0,G.warp);PVP.guestResultApplied=true;}showPvpEnd(iWon,d.reason,isDraw,d.details||{},PVP.stats,d.elapsed||0);if(PVP.resultTimer)clearTimeout(PVP.resultTimer);PVP.resultTimer=setTimeout(()=>{cleanupPvp();if(mode!=='hub'){endRun(false)}else hub()},4200);}}
  }
}
function netChat(pid,msg){if(!msg)return;NET.msgs.push({from:pid,to:NET.id,msg,t:Date.now()});if(NET.msgs.length>200)NET.msgs.shift();netRender()}
function netSys(msg){NET.msgs.push({sys:1,from:'sys',msg,t:Date.now()});if(NET.msgs.length>200)NET.msgs.shift();netRender()}
function netConnect(arg){
  if(PVP.active&&PVP.playerDead){netSys('Spectators can only message the surviving player.');return;}
  let t=arg;if(typeof arg!=='string'){const el=$('netTarget');t=el?el.value:''}
  if(!t||!String(t).trim()){netDiag('Enter your friend’s SLUG-XXXX ID, then press Connect.','warn');return}
  let raw=String(t).trim().toUpperCase().replace(/[^A-Z0-9]/g,'');if(raw.startsWith('SLUG'))raw=raw.slice(4);
  const id='SLUG-'+raw;
  if(!/^SLUG-[A-Z0-9]{4}$/.test(id)){netDiag('Invalid friend ID. Expected the format SLUG-XXXX.','error');return}
  if(NET.conns[id]&&NET.conns[id].open){netDiag('Already connected to '+id+'.','success');return}
  if(NET.pendingConnections[id]){netDiag('A connection attempt to '+id+' is already in progress.','warn');return}
  if(!NET.peer||!NET.ready){netDiag('Signalling is not ready yet. Current state: '+(NET.err||'initializing')+'.','error');return}
  const attempt={conn:null,started:Date.now(),timer:null};NET.pendingConnections[id]=attempt;
  netDiag('Starting connection to '+id+'. Signalling is ready; requesting a PeerJS data channel.');
  netDiag('Connection mode for this attempt: '+netModeInfo().label+'. '+netModeInfo().help,'info');
  attempt.timer=setTimeout(()=>{
    const live=NET.pendingConnections[id];if(!live||live!==attempt)return;
    delete NET.pendingConnections[id];
    try{if(live.conn&&!live.conn.open)live.conn.close()}catch(e){}
    const detail=NET_CONNECTION_MODE==='relay'?'Timed out waiting for '+id+' in TURN RELAY ONLY mode. No relay-only data channel was established; verify TURN credentials, relay reachability, and the other player’s connection mode.':NET_CONNECTION_MODE==='direct'?'Timed out waiting for '+id+' in DIRECT ONLY mode. TURN was disabled intentionally; this network may require a relay.':'Timed out waiting for '+id+' in AUTO mode. No data channel was established; verify the friend ID, both players’ signalling status, and TURN credentials if configured.';
    netDiag(detail,'error');netSys(detail);netRender();
  },22000);
  try{const conn=NET.peer.connect(id,{reliable:true});attempt.conn=conn;netAccept(conn)}catch(e){netFailPending(id,null,'Could not start connection to '+id+': '+String(e.message||e))}
}
function netCopy(){const id=NET.id;if(!id)return;const done=()=>netSys('ID copied: '+id);if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(id).then(done).catch(()=>fallback())}else fallback();function fallback(){const t=document.createElement('textarea');t.value=id;document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(t);done()}}
function netDel(id){delete NET.friends[id];if(NET.conns[id])try{NET.conns[id].close()}catch(e){}delete NET.conns[id];netSaveFriends();if(dmSelected===id)dmSelected=null;netRender();SFX.click()}
let dmSelected=null;
function dmSelect(pid){if(PVP.active&&PVP.playerDead)return;dmSelected=pid;watchCloudDm(pid);SFX.click();hub()}
async function dmSay(pid){
  if(PVP.active){netSys(PVP.playerDead?'Spectators can only message the surviving player.':'Direct messages are disabled during an active 1v1.');return;}
  const el=$('netMsg');if(!el)return;const m=el.value.trim();if(!m)return;
  if(AUTH.user&&!AUTH.guest&&fbDb){
    const saved=await cloudSendDm(pid,{text:m,kind:'text'});
    if(saved){NET.msgs.push({from:saved.from,to:saved.to,msg:m,t:saved.t,id:saved.id,cloud:true});if(NET.msgs.length>300)NET.msgs.splice(0,NET.msgs.length-300);el.value='';hub();SFX.click();return;}
    const sentDirect=netSend(pid,{type:'chat',msg:m,messageId:`${NET.id||'local'}:${Date.now()}`});
    if(!sentDirect){netSys('Message failed: cloud history is unavailable and the friend is not directly connected.');return;}
    NET.msgs.push({from:NET.id,to:pid,msg:m,t:Date.now()});netSys('Message sent directly, but not saved to cloud history: '+(cloudDmLastError||'cloud write unavailable')+'. Check your Firestore rules and cloud diagnostics.');el.value='';hub();SFX.click();return;
  }
  const sent=netSend(pid,{type:'chat',msg:m,messageId:`${NET.id||'local'}:${Date.now()}:${Math.random().toString(36).slice(2,7)}`});
  if(!sent){netSys('Message failed: recipient is offline. Sign in with a username account to use cloud DMs while friends are offline.');return;}
  NET.msgs.push({from:NET.id,to:pid,msg:m,t:Date.now()});if(NET.msgs.length>200)NET.msgs.shift();el.value='';hub();SFX.click();
}
function dmActionsHtml(pid){
  const conn=NET.conns[pid],presence=String(NET.friends[pid]?.status||'OFFLINE'),cloudOnline=!!(AUTH.user&&!AUTH.guest&&fbDb&&cloudUidBySlug[pid]&&presence!=='OFFLINE');
  const canInvite=!PVP.active&&((conn&&conn.open)||cloudOnline);
  return canInvite?bt(`openInvite('${pid}')`,'⚔ Invite to 1v1',1,'Choose Wave 5 or Wave 10 boss target'):`<span class=ds>${PVP.active?'Already in a match':'Opponent offline'}</span>`;
}
function dmViewHtml(pid){
  const msgs=NET.msgs.filter(m=>m.sys||m.from===pid||m.to===pid);
  const log=msgs.length?msgs.slice(-60).map(m=>m.sys?`<div class="cm sys">${esc(m.msg)}</div>`:`<div class=cm><b>${esc(String(m.from||'').replace(/^SLUG-/,''))}</b> ${esc(m.msg)}</div>`).join(''):'<div class="cm sys">No messages yet.</div>';
  const friend=NET.friends[pid]||{};
  return `<div class=chatlog id=netLog>${log}</div>
    <div class=chatrow>
      <input class=nin id=netMsg placeholder="Message ${esc(friend.name||pid)}..." maxlength=200 onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();dmSay('${pid}')}">
      ${bt(`dmSay('${pid}')`,'Send',1)}
    </div>
    <div class=row id=netDmActions>${dmActionsHtml(pid)}</div>`;
}
function openInvite(pid){
  if(PVP.active){netSys('Already in a match');return}
  const ov=document.createElement('div');ov.className='modal';
  ov.innerHTML=`<div class=p style="max-width:420px"><h3>Invite ${esc(NET.friends[pid]?.name||pid)} to 1v1 Speedrun</h3>
    <p class=ds>Race through the same waves (host-authoritative). First to land the killing blow on the target boss wins. +50% enemy HP, +35% spawn count.</p>
    <div class=row>
      <button onclick="sendInvite('${pid}',5);this.closest('.modal').remove()">Wave 5 Boss</button>
      <button onclick="sendInvite('${pid}',10);this.closest('.modal').remove()">Wave 10 Boss</button>
    </div>
    <div class=row><button onclick="this.closest('.modal').remove()">Cancel</button></div>
  </div>`;
  document.body.appendChild(ov);
}
async function sendInvite(pid,target){
  if(PVP.active){netSys('Finish your current match before sending another invite.');return}const conn=NET.conns[pid],presence=String(NET.friends[pid]?.status||'OFFLINE'),cloudCanSend=!!(AUTH.user&&!AUTH.guest&&fbDb&&cloudUidBySlug[pid]&&presence!=='OFFLINE');if(!(conn&&conn.open)&&!cloudCanSend){netSys('Invite unavailable: friend is offline.');netRender();return}
  if(!netSend(pid,{type:'pvp_invite',target})){const ok=await cloudSendDm(pid,{kind:'match_invite',target,text:'1v1 Speedrun invitation'});if(!ok){netSys('Invite failed: peer is offline and cloud DM is unavailable.');return}}
  netSys(`Invite sent to ${NET.friends[pid]?.name||pid} (Wave ${target})`);
}
function onPvpInvite(pid,target){
  target=target===10?10:5;
  if(PVP.active){netSend(pid,{type:'pvp_decline'});return}
  const ov=document.createElement('div');ov.className='modal';
  const name=NET.friends[pid]?.name||pid;
  ov.innerHTML=`<div class=p style="max-width:420px"><h3>${esc(name)} challenges you!</h3>
    <p class=ds>1v1 Speedrun to Wave ${target} boss. First to kill wins. Winner takes +500 bonus Warp.</p>
    <div class=row>
      <button onclick="acceptInvite('${pid}',${target});this.closest('.modal').remove()">Accept</button>
      <button onclick="netSend('${pid}',{type:'pvp_decline'});this.closest('.modal').remove()">Decline</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  SFX.warn();
}
function acceptInvite(pid,target){
  if(PVP.active)return;
  netSend(pid,{type:'pvp_accept',target});
  enterPvpLobby('guest',pid,target);
}
const PVP={active:false,role:null,opponent:null,target:5,phase:'idle',hostReady:false,guestReady:false,countdownStart:0,startTime:0,lastInput:0,lastSnapshot:0,lastIntermissionTick:0,oppHp:100,oppMh:100,oppAlive:true,oppDead:false,oppHazardImmune:false,playerDead:false,oppX:W/2,oppY:H/2,oppXT:W/2,oppYT:H/2,oppAt:'neutral',hostBulletsSnap:[],finished:false,winner:null,reason:'',matchId:null,seed:1,stats:{host:{damage:0,kills:0,crates:0,souls:0,combo:0,bestCombo:0,lastKillAt:0},guest:{damage:0,kills:0,crates:0,souls:0,combo:0,bestCombo:0,lastKillAt:0}},receivedShots:new Set(),guestSpecialReadyAt:0,reconnectDeadline:0,reconnectPhase:null,reconnectTimer:null,timeoutRequested:false,syncStartedAt:0,initAck:false,pendingResult:null,pendingResultTimer:null,oppInitialised:false,oppTk:1,oppMag:80,oppShotDamageMax:120,oppShotCooldown:.11,oppFireLastAt:0,oppVolleyMap:new Map(),resultPacket:null,resultAcked:false,resultResendTimer:null,resultExpiryTimer:null,resultAt:0,resultBanked:false,pauseHtml:$('pauseOverlay').innerHTML,myLoadout:null,opponentLoadout:null,guestResultApplied:false};
