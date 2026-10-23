/* Slugger NEO v0.5.4.3 — PvP lobby and ready protocol, loadouts, cloud friend relationships, cloud presence, and invites.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
function enterPvpLobby(role,pid,target){
  PVP.active=true;PVP.role=role;PVP.opponent=pid;PVP.target=target;
  PVP.phase='lobby';PVP.hostReady=false;PVP.guestReady=false;
  PVP.playerDead=false;PVP.oppDead=false;PVP.oppHazardImmune=false;PVP.finished=false;PVP.winner=null;PVP.reason='';PVP.pendingResult=null;PVP.initAck=false;PVP.syncStartedAt=0;
  PVP.oppHp=100;PVP.oppMh=100;PVP.oppInitialised=false;PVP.oppTk=1;PVP.oppMag=80;PVP.oppShotDamageMax=120;PVP.oppShotCooldown=.11;PVP.oppFireLastAt=0;PVP.oppVolleyMap=new Map();PVP.oppAlive=true;PVP.oppX=W/2;PVP.oppY=H/2;PVP.oppXT=W/2;PVP.oppYT=H/2;PVP.oppAt='neutral';PVP.oppAng=0;PVP.oppAngTarget=0;PVP.oppDrone=null;PVP.oppDroneTarget=null;PVP.hostDrone=null;PVP.hostDroneTarget=null;PVP.oppLastInputAt=0;PVP.oppFireLastAt=0;PVP.oppVolleyMap=new Map();PVP.oppInitialised=false;PVP.resultBanked=false;PVP.resultAt=0;PVP.resultAcked=false;PVP.guestResultApplied=false;
  PVP.hostBulletsSnap=[];PVP.lastInput=0;PVP.lastSnapshot=0;PVP.matchId=null;PVP.seed=1;PVP.stats={host:{damage:0,kills:0,crates:0,souls:0,warp:0,combo:0,bestCombo:0,lastKillAt:0},guest:{damage:0,kills:0,crates:0,souls:0,warp:0,combo:0,bestCombo:0,lastKillAt:0}};PVP.receivedShots=new Set();PVP.guestSpecialReadyAt=0;PVP.reconnectDeadline=0;PVP.reconnectPhase=null;PVP.timeoutRequested=false;pendingGuestCrates.clear();
  showPvpLobby();
  SFX.warn();
}
function showPvpLobby(){
  cleanupPvpLobbyUi();
  const o=document.createElement('div');
  o.id='pvpLobbyOverlay';o.className='modal';
  o.innerHTML=`<div class=p style="max-width:420px;text-align:center">
    <h3>1v1 Speedrun Lobby</h3>
    <p class=ds>Target: Wave ${PVP.target} boss · You are <b>${PVP.role.toUpperCase()}</b></p>
    <div class=pvpLobbyRow><span>You</span><span id=pvpYouStatus>⏳ Not ready</span></div>
    <div class=pvpLobbyRow><span>Opponent</span><span id=pvpOppStatus>⏳ Not ready</span></div>
    <button id=pvpReadyBtn class=pvpLobbyBtn onclick="pvpClickReady()">Ready</button>
    <button onclick="pvpCancelLobby()" style="width:100%;padding:6px;margin-top:6px">Cancel</button>
  </div>`;
  document.body.appendChild(o);
  updatePvpLobbyUi();
}
function updatePvpLobbyUi(){
  const btn=$('pvpReadyBtn'),ys=$('pvpYouStatus'),os=$('pvpOppStatus');
  if(!btn||!ys||!os)return;
  const myReady=PVP.role==='host'?PVP.hostReady:PVP.guestReady;
  const oppReady=PVP.role==='host'?PVP.guestReady:PVP.hostReady;
  btn.disabled=myReady;
  btn.textContent=myReady?'Waiting for opponent...':'Ready';
  ys.textContent=myReady?'✅ Ready':'⏳ Not ready';
  os.textContent=oppReady?'✅ Ready':'⏳ Not ready';
}
function makePvpLoadout(){const c=calc(),id=IT[S.eq.w]?S.eq.w:'blaster',iv=S.inv[id]||{r:0},sets=Object.fromEntries(Object.keys(SETS).map(k=>[k,setN(k)]));return{weapon:id,rank:cl(Number(iv.r)||0,0,5),level:cl(Number(S.wl[id])||0,0,20),damage:cl(Number(c.dmg)||10,1,180),cooldown:cl(Number(c.cd)||c.w.r,.07,2),pellets:cl(Number(c.w.k)||1,1,5),pierce:cl(Number(c.w.pi)||1,1,5),radius:cl(Number(c.w.pi)?7:4,3,9),hp:cl(Number(c.mhp)||100,50,2000),dr:cl(Number(c.dr)||0,0,.75),tk:cl(Number(c.tk)||1,.5,2),mag:cl(Number(c.mag)||80,40,300),hazardImmune:!!c.ad,sets};}
function acceptPvpLoadout(raw){if(!raw||typeof raw!=='object')return null;const wid=IT[raw.weapon]?raw.weapon:'blaster',base=IT[wid];const rank=cl(Number(raw.rank)||0,0,5),level=cl(Number(raw.level)||0,0,20),damage=cl(Number(raw.damage)||base.d,Math.max(1,base.d*.6),Math.max(5,base.d*4));return{weapon:wid,rank,level,damage,cooldown:cl(Number(raw.cooldown)||base.r,.07,2),pellets:cl(Math.floor(Number(raw.pellets)||base.k||1),1,5),pierce:cl(Math.floor(Number(raw.pierce)||base.pi||1),1,5),radius:cl(Number(raw.radius)||4,3,9),hp:cl(Number(raw.hp)||100,50,2000),dr:cl(Number(raw.dr)||0,0,.75),tk:cl(Number(raw.tk)||1,.5,2),mag:cl(Number(raw.mag)||80,40,300),hazardImmune:!!raw.hazardImmune,sets:raw.sets&&typeof raw.sets==='object'?raw.sets:{}};}
function pvpClickReady(){
  if(PVP.phase!=='lobby')return;
  PVP.myLoadout=makePvpLoadout();
  if(PVP.role==='host')PVP.hostReady=true;else PVP.guestReady=true;
  netSend(PVP.opponent,{type:'pvp_ready',loadout:PVP.myLoadout});
  updatePvpLobbyUi();
  tryStartCountdown();
}
function onPvpReady(pid){
  if(PVP.phase!=='lobby'||pid!==PVP.opponent)return;
  if(PVP.role==='host')PVP.guestReady=true;else PVP.hostReady=true;
  updatePvpLobbyUi();
  tryStartCountdown();
}
function tryStartCountdown(){
  if(PVP.phase!=='lobby'||PVP.role!=='host'||!PVP.hostReady||!PVP.guestReady)return;
  PVP.phase='sync';PVP.matchId=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;PVP.seed=(Math.random()*0xffffffff)>>>0;PVP.countdownStart=0;PVP.syncStartedAt=Date.now();PVP.initAck=false;
  PVP.stats={host:{damage:0,kills:0,crates:0,souls:0,combo:0,bestCombo:0,lastKillAt:0},guest:{damage:0,kills:0,crates:0,souls:0,combo:0,bestCombo:0,lastKillAt:0}};PVP.receivedShots=new Set();PVP.initAck=false;PVP.lastGuestHpPacket=0;
  cleanupPvpLobbyUi();showPvpCountdown();netBroadcast({type:'status',mode:'game'});
  netSend(PVP.opponent,{type:'pvp_init',matchId:PVP.matchId,target:PVP.target,seed:PVP.seed,waves:[5,10],settings:{enemyHp:1.5,spawnScale:1.35},hostStatus:'ready',guestStatus:'ready'});const o=$('pvpCountdownOverlay');if(o)o.textContent='SYNC';
}
function cleanupPvpLobbyUi(){const o=$('pvpLobbyOverlay');if(o)o.remove()}
function showPvpCountdown(){
  const o=document.createElement('div');
  o.id='pvpCountdownOverlay';
  o.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:90;font-family:Orbitron,sans-serif;font-size:140px;color:#00ff88;text-shadow:0 0 50px #00ff88;font-weight:800;';
  document.body.appendChild(o);
}
function pvpTickCountdown(){
  if(PVP.phase==='sync'){
    const el=$('pvpCountdownOverlay');if(el){el.textContent='SYNC';el.style.fontSize='70px';}
    if(PVP.role==='host'&&Date.now()-(PVP.syncStartedAt||Date.now())>=6000&&!PVP.initAck){netSys('Opponent did not acknowledge match settings; countdown cancelled.');netSend(PVP.opponent,{type:'pvp_cancel',matchId:PVP.matchId});cleanupPvp();mode='hub';hub();}
    return;
  }
  if(PVP.phase!=='countdown')return;
  const el=$('pvpCountdownOverlay');
  if(!el)return;
  const elapsed=Date.now()-(PVP.countdownStart||Date.now());
  if(elapsed>=3000){
    PVP.phase='playing';
    PVP.startTime=Date.now();PVP.stats=PVP.stats||{host:{damage:0,kills:0,crates:0,souls:0,warp:0,combo:0,bestCombo:0,lastKillAt:0},guest:{damage:0,kills:0,crates:0,souls:0,warp:0,combo:0,bestCombo:0,lastKillAt:0}};
    PVP.oppInitialised=false;PVP.resultAcked=false;PVP.resultPacket=null;PVP.guestResultApplied=false;PVP.oppVolleyMap=new Map();PVP.oppFireLastAt=0;
    deploy(1);
    if(PVP.role==='guest'){PVP.oppHp=PVP.opponentLoadout?.hp||100;PVP.oppMh=PVP.oppHp;}else{PVP.oppHp=PVP.opponentLoadout?.hp||100;PVP.oppMh=PVP.oppHp;PVP.oppInitialised=!!PVP.opponentLoadout;}PVP.oppAlive=true;PVP.playerDead=false;PVP.oppDead=false;
    el.innerHTML='GO!';
    el.style.color='#ffcc00';
    setTimeout(()=>{const e=$('pvpCountdownOverlay');if(e)e.remove()},500);
    return;
  }
  const remaining=Math.ceil((3000-elapsed)/1000);
  el.textContent=remaining>0?remaining:'';
}
function pvpCancelLobby(){
  if(!['lobby','sync','countdown'].includes(PVP.phase))return;
  netSend(PVP.opponent,{type:'pvp_cancel',matchId:PVP.matchId});
  cleanupPvp();mode='hub';hub();
}
function cleanupPvp(){
  deterministicRandom=null;if(PVP.pendingResultTimer)clearTimeout(PVP.pendingResultTimer);PVP.pendingResultTimer=null;PVP.pendingResult=null;if(PVP.reconnectTimer)clearTimeout(PVP.reconnectTimer);PVP.reconnectDeadline=0;PVP.reconnectPhase=null;if(PVP.resultResendTimer){clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=null}if(PVP.resultExpiryTimer){clearTimeout(PVP.resultExpiryTimer);PVP.resultExpiryTimer=null}if(PVP.resultTimer){clearTimeout(PVP.resultTimer);PVP.resultTimer=null}pendingGuestCrates.clear();PVP.active=false;PVP.phase='idle';PVP.role=null;PVP.opponent=null;PVP.resultPacket=null;PVP.resultAcked=false;PVP.oppInitialised=false;
  PVP.hostReady=false;PVP.guestReady=false;PVP.finished=false;PVP.winner=null;PVP.reason='';PVP.resultPacket=null;PVP.resultAcked=false;PVP.resultAt=0;PVP.resultBanked=false;PVP.guestResultApplied=false;if(PVP.resultResendTimer){clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=null}if(PVP.resultExpiryTimer){clearTimeout(PVP.resultExpiryTimer);PVP.resultExpiryTimer=null}
  PVP.playerDead=false;PVP.oppDead=false;PVP.oppHazardImmune=false;PVP.oppAlive=true;PVP.oppHp=100;PVP.initAck=false;PVP.syncStartedAt=0;
  cleanupPvpLobbyUi();
  const c=$('pvpCountdownOverlay');if(c)c.remove();
  const e=$('pvpEndOverlay');if(e){e.className='';e.innerHTML=''}
}
function queuePvpResult(winner,reason,details={}){
  if(!PVP.active||PVP.role!=='host'||PVP.finished)return;
  // A boss kill is definitive; death events get a short grace to reconcile same-frame double deaths.
  if(PVP.pendingResult&&PVP.pendingResult.reason==='boss')return;
  if(reason==='boss')PVP.pendingResult={winner,reason,details};
  else if(!PVP.pendingResult)PVP.pendingResult={winner,reason,details};
  if(PVP.pendingResultTimer)clearTimeout(PVP.pendingResultTimer);
  PVP.pendingResultTimer=setTimeout(()=>{
    PVP.pendingResultTimer=null;if(PVP.finished||!PVP.active)return;
    const pending=PVP.pendingResult||{winner,reason,details};PVP.pendingResult=null;
    if(pending.reason==='boss')endPvp(pending.winner,pending.reason,pending.details||{});
    else if(PVP.playerDead&&PVP.oppDead)endPvp('draw','both-dead',pending.details||{});
    else if(PVP.playerDead)endPvp('guest','player-death',pending.details||{});
    else if(PVP.oppDead||PVP.oppAlive===false)endPvp('host','opponent-death',pending.details||{});
    else endPvp(pending.winner,pending.reason,pending.details||{});
  },100);
}
function endPvp(winner,reason,details={}){
  if(PVP.finished)return;
  if(PVP.role==='guest'&&reason!=='disconnect')return;
  if(PVP.pendingResultTimer)clearTimeout(PVP.pendingResultTimer);PVP.pendingResultTimer=null;PVP.pendingResult=null;
  PVP.finished=true;PVP.winner=winner;PVP.reason=reason;PVP.phase='finished';PVP.resultAt=Date.now();PVP.resultBanked=false;mode='pause';$('pauseOverlay').className='ov';
  const iWon=winner===PVP.role,isDraw=winner==='draw';
  if(PVP.role==='guest'&&reason==='disconnect'&&G&&!PVP.guestResultApplied){const gs=PVP.stats?.guest||{},reached=cl(Math.floor(Number(G.w)||1),1,10),clearedWave=cl(Math.floor(Number(G.lastClearedWave)||0),0,10);G.warp=(Number(G.startWarp)||0)+(Number(gs.warp)||0);G.souls=Number(gs.souls)||0;S.hi=Math.max(Number(S.hi)||0,G.warp);for(let cleared=4;cleared<=clearedWave;cleared++){const cp=cleared-2;if(cp>=2&&cp<=8&&!S.cp.includes(cp))S.cp.push(cp)}S.rec[reached]=Math.max(Number(S.rec[reached])||0,G.warp);PVP.guestResultApplied=true;}
  if(iWon&&G){G.warp+=500;if(PVP.stats&&PVP.stats[PVP.role])PVP.stats[PVP.role].warp=(PVP.stats[PVP.role].warp||0)+500;}
  const elapsed=Math.max(0,Date.now()-(PVP.startTime||Date.now()));
  PVP.resultPacket=Object.freeze({type:'pvp_end',matchId:PVP.matchId,winner,reason,details:JSON.parse(JSON.stringify(details||{})),stats:JSON.parse(JSON.stringify(PVP.stats||{})),elapsed,reachedWave:G?G.w:1,lastClearedWave:G?Number(G.lastClearedWave)||0:0,finishedAt:PVP.resultAt});
  PVP.resultAcked=false;
  if(PVP.role==='host'&&PVP.opponent){netSend(PVP.opponent,PVP.resultPacket);if(PVP.resultResendTimer)clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=setInterval(()=>{if(!PVP.active||!PVP.finished||PVP.resultAcked||!PVP.resultPacket){if(PVP.resultResendTimer){clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=null;}return}netSend(PVP.opponent,PVP.resultPacket)},550);}
  showPvpEnd(iWon,reason,isDraw,details,PVP.stats,elapsed);
  if(PVP.resultTimer)clearTimeout(PVP.resultTimer);
  PVP.resultTimer=setTimeout(()=>{if(!PVP.resultBanked){PVP.resultBanked=true;if(mode!=='hub')endRun(false);else hub();}if(PVP.role!=='host'||PVP.resultAcked){cleanupPvp();hub();}else{if(PVP.resultExpiryTimer)clearTimeout(PVP.resultExpiryTimer);PVP.resultExpiryTimer=setTimeout(()=>{if(PVP.active&&PVP.finished){cleanupPvp();hub()}},11000);}},4200);
}
function showPvpEnd(iWon,reason,isDraw,details={},stats=PVP.stats,elapsed=0){
  const o=$('pvpEndOverlay');if(!o)return;o.className=isDraw?'on draw':(iWon?'on':'on lose');
  const title=isDraw?'DRAW':(iWon?'VICTORY':'DEFEAT');let sub='';
  if(reason==='boss')sub=iWon?'You slew the target boss first!':'Opponent slew the target boss first.';
  else if(reason==='timeout')sub='';
  else if(reason==='both-dead')sub='Both players fell.';else if(reason==='disconnect')sub='Opponent did not reconnect within the grace period.';else if(reason==='forfeit')sub=details&&details.quitRole==='host'?'Host ended the session; opponent wins.':'Opponent left the session; you win.';else if(reason==='player-death'||reason==='opponent-death')sub=iWon?'Opponent defeated; you win.':'You were defeated.';else sub='Match ended.';
  const fmt=n=>{n=Math.max(0,Math.floor(Number(n)||0));return Math.floor(n/60000)+':'+String(Math.floor(n/1000)%60).padStart(2,'0')};
  const h=stats&&stats.host||{},g=stats&&stats.guest||{};
  const table=`<div class=p style="max-width:660px;width:min(660px,88vw);text-align:left"><h3>Match stats</h3><div class=pvpLobbyRow><b>Metric</b><b>Host</b><b>Guest</b></div><div class=pvpLobbyRow><span>Total time</span><span>${fmt(elapsed||details.elapsed||0)}</span><span>${fmt(elapsed||details.elapsed||0)}</span></div><div class=pvpLobbyRow><span>Wave reached</span><b>${Math.max(1,Math.floor(Number(details.wave||G?.w||PVP.roundWave||1)))}</b><b>${Math.max(1,Math.floor(Number(details.wave||G?.w||PVP.roundWave||1)))}</b></div><div class=pvpLobbyRow><span>Damage dealt</span><b>${Math.round(h.damage||0)}</b><b>${Math.round(g.damage||0)}</b></div><div class=pvpLobbyRow><span>Enemies defeated</span><b>${h.kills||0}</b><b>${g.kills||0}</b></div><div class=pvpLobbyRow><span>Crates collected</span><b>${h.crates||0}</b><b>${g.crates||0}</b></div><div class=pvpLobbyRow><span>Highest combo</span><b>${h.bestCombo||0}</b><b>${g.bestCombo||0}</b></div><div class=pvpLobbyRow><span>Ranked souls earned</span><b>${h.souls||0}</b><b>${g.souls||0}</b></div></div>`;
  const tie=details&&details.tieBreak?`<p class=ds>Timeout tie-break order: damage dealt, kills, then crates.</p>`:'';
  o.innerHTML=`<h2>${title}</h2><p style="color:#d6ffe9;max-width:620px">${esc(sub)}</p>${table}${tie}<p class=ds>${iWon&&!isDraw?'Winner bonus: +500 Warp. ':''}Returning to hub…</p>`;
}
function startCloudSocial(){
  if(!fbDb||!AUTH.user||AUTH.guest)return;
  if(cloudSocialUidStarted===AUTH.user.uid)return;
  stopCloudSocial();const uid=AUTH.user.uid,profile=fbDb.collection('users').doc(uid);cloudSocialUidStarted=uid;
  profile.set({...cloudProfileSummary(),username:AUTH.username||'Player',usernameLower:cleanUsernameInput(AUTH.username||'Player').toLowerCase(),slugId:NET.id||loadId(),lastLogin:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).then(async()=>{
    // On the first username login only, migrate legacy contacts from the old browser-wide friend cache.
    // Future logins use the UID-scoped cache and cloud profile, so another account never inherits those contacts.
    if(legacyFriendCacheMigrationUid===uid&&AUTH.user&&AUTH.user.uid===uid){
      legacyFriendCacheMigrationUid=null;
      const legacyIds=Object.keys(NET.friends||{}).filter(slug=>/^SLUG-[A-Z0-9]{4}$/.test(slug)&&slug!==NET.id);
      await Promise.allSettled(legacyIds.map(slug=>persistCloudFriend(slug,true)));
    }
  }).catch(e=>console.warn('Profile sync failed:',e));
  cloudProfileUnsub=profile.onSnapshot(doc=>{if(!doc.exists)return;const d=doc.data()||{};cloudFriends=Array.isArray(d.friends)?d.friends.filter(x=>/^SLUG-[A-Z0-9]{4}$/.test(x)):[];cloudUidBySlug={};watchCloudFriendPresence();},e=>console.warn('Profile listener failed:',e));
  const writePresence=()=>{if(!AUTH.user||AUTH.guest||!fbDb||AUTH.user.uid!==uid)return;const status=PVP.active?'IN_MATCH':mode==='hub'?'IN_LOBBY':'IN_GAME';fbDb.collection('presence').doc(uid).set({uid,slugId:NET.id||loadId(),username:AUTH.username||'Player',status,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(e=>console.warn('Presence update failed:',e));};writePresence();presenceTimer=setInterval(writePresence,30000);
}
function watchCloudFriendPresence(){cloudPresenceUnsubs.forEach(fn=>{try{fn()}catch(e){}});cloudPresenceUnsubs=[];if(!fbDb||!AUTH.user||AUTH.guest||!cloudFriends.length){return}const ownerUid=AUTH.user.uid,batches=[];for(let i=0;i<cloudFriends.length;i+=10)batches.push(cloudFriends.slice(i,i+10));batches.forEach(tags=>{fbDb.collection('users').where('slugId','in',tags).get().then(snap=>{if(!AUTH.user||AUTH.guest||AUTH.user.uid!==ownerUid)return;snap.forEach(doc=>{const d=doc.data()||{},slug=d.slugId;if(!slug)return;cloudUidBySlug[slug]=doc.id;if(!NET.friends[slug])NET.friends[slug]={name:d.username||slug.replace('SLUG-',''),status:'off',added:Date.now(),cloud:true};cloudPresenceUnsubs.push(fbDb.collection('presence').doc(doc.id).onSnapshot(pd=>{const v=pd.exists?pd.data():null;NET.friends[slug].status=v&&v.updatedAt&&v.updatedAt.toMillis&&Date.now()-v.updatedAt.toMillis()<90000?(v.status||'ONLINE'):'OFFLINE';NET.friends[slug].name=(v&&v.username)||d.username||NET.friends[slug].name;netSaveFriends();netRender();}));watchCloudDm(slug);netSaveFriends();netRender()})}).catch(e=>console.warn('Friend presence query failed:',e));});}
function cloudChatId(uidA,uidB){return [uidA,uidB].sort().join('_')}
let cloudDmLastError='';
function watchCloudDm(slug){
  if(!fbDb||!AUTH.user||AUTH.guest||!cloudUidBySlug[slug]||cloudDmUnsubs[slug])return;
  const ownerUid=AUTH.user.uid,friendUid=cloudUidBySlug[slug],chat=cloudChatId(ownerUid,friendUid);
  cloudDmUnsubs[slug]=fbDb.collection('chats').doc(chat).collection('messages').orderBy('createdAt').limitToLast(60).onSnapshot(snap=>{
    if(!AUTH.user||AUTH.guest||AUTH.user.uid!==ownerUid||cloudUidBySlug[slug]!==friendUid)return;
    snap.docChanges().forEach(ch=>{
      if(ch.type!=='added')return;
      const cloudId='cloud:'+chat+':'+ch.doc.id;if(cloudDmSeen.has(cloudId))return;cloudDmSeen.add(cloudId);
      const d=ch.doc.data()||{};
      if(d.kind==='match_invite'){if(d.fromUid!==ownerUid)onCloudInvite(slug,d.target);return}
      const fromSlug=d.fromSlug||(d.fromUid===ownerUid?NET.id:slug),toSlug=d.toSlug||(d.toUid===ownerUid?NET.id:slug),created=d.createdAt&&typeof d.createdAt.toMillis==='function'?d.createdAt.toMillis():Date.now();
      NET.msgs.push({from:fromSlug,to:toSlug,msg:String(d.text||'').slice(0,200),t:created,id:cloudId,cloud:true});
      if(d.fromUid!==ownerUid&&window.showV05Toast)window.showV05Toast(NET.friends[slug]?.name||slug,String(d.text||'').slice(0,200),slug);
      if(NET.msgs.length>300)NET.msgs.splice(0,NET.msgs.length-300);
    });
    netRender();
  },e=>console.warn('Cloud DM listener failed:',e));
}
async function cloudSendDm(slug,payload){
  cloudDmLastError='';
  if(!fbDb||!AUTH.user||AUTH.guest){cloudDmLastError='Sign in with a username account to save messages to cloud history.';return false;}
  if(!cloudUidBySlug[slug]){
    try{const q=await fbDb.collection('users').where('slugId','==',slug).limit(1).get();if(q.empty){cloudDmLastError='That Friend ID is not linked to a username cloud account.';return false;}cloudUidBySlug[slug]=q.docs[0].id;}
    catch(e){cloudDmLastError=String(e.code||e.message||'could not look up the friend profile');console.warn('Cloud DM friend lookup failed:',e);return false;}
  }
  try{
    const friendUid=cloudUidBySlug[slug],chat=cloudChatId(AUTH.user.uid,friendUid),messages=fbDb.collection('chats').doc(chat).collection('messages'),ref=messages.doc(),cloudId='cloud:'+chat+':'+ref.id;
    // Use a stable document ID before writing so the sender's own listener can't duplicate the optimistic entry.
    cloudDmSeen.add(cloudId);
    await ref.set({fromUid:AUTH.user.uid,fromSlug:NET.id||loadId(),toUid:friendUid,toSlug:slug,text:String(payload.text||'').slice(0,200),kind:payload.kind||'text',target:payload.target||null,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
    watchCloudDm(slug);
    return {id:cloudId,chatId:chat,from:NET.id||loadId(),to:slug,t:Date.now()};
  }catch(e){cloudDmLastError=String(e.code||e.message||'Firestore write failed');console.warn('Cloud DM send failed:',e);return false;}
}
async function persistCloudFriend(slug,quiet=false){
  if(!fbDb||!AUTH.user||AUTH.guest||!slug||slug===NET.id||!/^SLUG-[A-Z0-9]{4}$/.test(slug))return false;
  const ownerUid=AUTH.user.uid;
  try{
    const found=await fbDb.collection('users').where('slugId','==',slug).limit(1).get();
    if(found.empty){if(!quiet)netDiag('Connected to '+slug+', but it is not linked to a username cloud account; this friend cannot sync across devices yet.','warn');return false;}
    const friendDoc=found.docs[0];if(friendDoc.id===ownerUid)return false;
    if(!AUTH.user||AUTH.user.uid!==ownerUid||AUTH.guest)return false;
    await fbDb.collection('users').doc(ownerUid).set({friends:firebase.firestore.FieldValue.arrayUnion(slug)},{merge:true});
    const data=friendDoc.data()||{};cloudUidBySlug[slug]=friendDoc.id;
    NET.friends[slug]={...(NET.friends[slug]||{}),name:data.username||NET.friends[slug]?.name||slug.replace('SLUG-',''),status:NET.friends[slug]?.status||'OFFLINE',added:NET.friends[slug]?.added||Date.now(),cloud:true};
    if(!cloudFriends.includes(slug))cloudFriends.push(slug);
    watchCloudDm(slug);netSaveFriends();netRender();
    netDiag('Friend '+slug+' saved to your cloud friend list. The other player saves you when their connection opens.','success');
    return true;
  }catch(e){console.warn('Cloud friend sync failed:',e);if(!quiet)netDiag('Connected to '+slug+', but cloud friend sync failed: '+String(e.code||e.message||e),'warn');return false;}
}
function onCloudInvite(slug,target){if(PVP.active)return;const ov=document.createElement('div');ov.className='modal';ov.innerHTML=`<div class=p style="max-width:420px"><h3>Cloud 1v1 invitation</h3><p>${esc(slug)} invited you to race to the Wave ${target} boss.</p><button onclick="acceptCloudInvite('${esc(slug)}',${target});this.closest('.modal').remove()">Connect and accept</button><button onclick="this.closest('.modal').remove()">Decline</button></div>`;document.body.appendChild(ov);SFX.warn()}
function acceptCloudInvite(slug,target){if(PVP.active)return;NET.pendingCloudInvite={pid:slug,target:target===10?10:5};netConnect(slug)}
