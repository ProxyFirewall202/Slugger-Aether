/* Slugger NEO v0.6 Phase 1 — Existing v0.5.1 campaign/spectator/upgrade/results/network overrides, preserved as one ordered IIFE.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
/* ========================= SLUGGER (NEO) v0.5.4 MOBILE CONTROLS HOTFIX =========================
   Session-isolated 1v1 campaign, permadeath spectator, shared 60s upgrade
   stage, graceful exits, emoji taunts, DM toasts, and local-only impact feel.
   This release splits the unchanged systems into ordered classic scripts and a stylesheet.
*/
(function installV05(){
  const V05_REWARDS={winner:{warp:500,pro:10},participant:{warp:100,pro:2},draw:{warp:50,pro:1}};
  const blankCrates=()=>({wood:0,iron:0,solar:0,vortex:0,aether:0});
  const clone=x=>JSON.parse(JSON.stringify(x));
  const clampCheckpoint=(w,target)=>cl(Math.floor(Number(w)||1),1,target===5?5:8);
  const commonCheckpoints=()=>Array.from(new Set([...(PVP.myCheckpoints||[1]),...(PVP.opponentCheckpoints||[1])].filter(x=>(PVP.myCheckpoints||[1]).includes(x)&&(PVP.opponentCheckpoints||[1]).includes(x)&&x<=PVP.target))).sort((a,b)=>a-b);
  const safeCommon=()=>{const c=commonCheckpoints();return c.length?c:[1]};
  function beginPvpSaveSession(){
    if(activeSaveMode==='pvp'&&save_1v1){S=save_1v1;return;}
    if(activeSaveMode!=='pvp'&&ub&&ub.ph===1){const opening=ub;opening.res=roll(opening.t);opening.ph=2;save();SFX.open();}
    save_sp=normaliseSave(S);
    // UI-only crate reveal state must not appear in the isolated PvP hub.
    ub=null;dm=false;tab=0;
    // Strict isolation: every 1v1 session begins from the game's baseline, never from save_sp.
    save_1v1=normaliseSave(DEF());
    save_1v1.cp=[1];save_1v1.rec={};save_1v1.hi=0;
    activeSaveMode='pvp';S=save_1v1;
    try{sessionStorage.setItem(V05_SESSION_KEY,JSON.stringify(save_1v1))}catch(e){}
    PVP.myCheckpoints=(S.cp||[1]).slice();PVP.opponentCheckpoints=[1];PVP.startWave=1;PVP.bankedGuestWarp=0;PVP.bankedGuestSouls=0;PVP.roundBanked=false;PVP.rewardApplied=false;PVP.continueReady=false;PVP.upgradeReady=false;PVP.noReward=false;
  }
  function discardPvpSaveSession(){
    if(activeSaveMode==='pvp')save_sp=save_sp||S;
    S=save_sp||S;activeSaveMode='sp';save_1v1=null;
    try{sessionStorage.removeItem(V05_SESSION_KEY)}catch(e){}
  }
  function bankPvpRoundProgress(){
    if(!PVP.active||!save_1v1||!G||PVP.roundBanked)return;
    const session=S;
    if(PVP.role==='host'){
      const earned=Math.max(0,(Number(G.warp)||0)-(Number(G.startWarp)||0));
      S.warp=Math.max(0,Number(S.warp)||0)+earned;
      S.souls=Math.max(0,Number(S.souls)||0)+Math.max(0,Number(G.souls)||0);
      S.cr=S.cr||blankCrates();for(const k of Object.keys(G.cr||{}))S.cr[k]=(Number(S.cr[k])||0)+(Number(G.cr[k])||0);
    }else{
      const gs=PVP.stats&&PVP.stats.guest||{};
      const earned=Math.max(0,(Number(gs.warp)||0)-(Number(PVP.bankedGuestWarp)||0));
      const souls=Math.max(0,(Number(gs.souls)||0)-(Number(PVP.bankedGuestSouls)||0));
      S.warp=Math.max(0,Number(S.warp)||0)+earned;
      S.souls=Math.max(0,Number(S.souls)||0)+souls;
      PVP.bankedGuestWarp=Number(gs.warp)||0;PVP.bankedGuestSouls=Number(gs.souls)||0;
      S.cr=S.cr||blankCrates();for(const k of Object.keys(G.cr||{}))S.cr[k]=(Number(S.cr[k])||0)+(Number(G.cr[k])||0);
    }
    G.warp=0;G.startWarp=0;G.souls=0;G.cr=blankCrates();G.runBanked=true;PVP.roundBanked=true;
    save();
  }
  function unlockSessionCheckpoint(wave,role){
    const cp=wave>=4?wave-2:0;if(cp<2||cp>8||!save_1v1)return;
    if(role==='host'&&!S.cp.includes(cp))S.cp.push(cp);
    if(role==='guest'&&!S.cp.includes(cp))S.cp.push(cp);
    S.cp.sort((a,b)=>a-b);PVP.myCheckpoints=(S.cp||[1]).slice();
  }
  function applyPermanentPvpReward(winner,reason){
    if(PVP.rewardApplied)return;PVP.rewardApplied=true;
    if(PVP.noReward||reason==='menu-exit')return discardPvpSaveSession();
    // Only this explicit reward is transferred. 1v1 balances, crate loot,
    // inventory and temporary upgrades are intentionally discarded.
    let reward=winner==='draw'?V05_REWARDS.draw:(winner===PVP.role?V05_REWARDS.winner:V05_REWARDS.participant);
    save_sp=normaliseSave(save_sp||DEF());save_sp.warp=(Number(save_sp.warp)||0)+reward.warp;save_sp.pro=(Number(save_sp.pro)||0)+reward.pro;
    S=save_sp;activeSaveMode='sp';save_1v1=null;try{sessionStorage.removeItem(V05_SESSION_KEY)}catch(e){}save();
  }
  function showV05Toast(sender,message,slug){
    let layer=$('v05ToastLayer');if(!layer){layer=document.createElement('div');layer.id='v05ToastLayer';document.body.appendChild(layer)}
    const toast=document.createElement('div');toast.className='v05-toast';toast.textContent=`✉ ${String(sender||'Friend').slice(0,28)}: ${String(message||'').slice(0,140)}`;
    const pvpCombat=PVP.active&&['playing','reconnecting','countdown','sync','finished'].includes(PVP.phase);
    const inCombat=pvpCombat||(!PVP.active&&mode==='play');
    const spectatorRestricted=!!(PVP.active&&PVP.playerDead);
    toast.style.pointerEvents=inCombat||spectatorRestricted?'none':'auto';
    if(!inCombat&&!spectatorRestricted&&slug){toast.title='Open direct message';toast.addEventListener('click',()=>{if(PVP.active&&(!['lobby','roundSummary','upgrade','waveSelect'].includes(PVP.phase)||PVP.playerDead))return;tab=4;dmSelected=slug;if(PVP.active){const round=$('v05RoundOverlay');if(round)round.className='v05-modal';}hub();const input=$('netMsg');if(input)input.focus();toast.remove()})}
    layer.appendChild(toast);setTimeout(()=>{if(toast.isConnected)toast.classList.add('fade')},5200);setTimeout(()=>toast.remove(),6000);
    while(layer.children.length>4)layer.firstElementChild.remove();
  }
  function ensureV05Ui(){
    if(!$('v05ToastLayer')){const d=document.createElement('div');d.id='v05ToastLayer';document.body.appendChild(d)}
    if(!$('v05QuitBtn')){const b=document.createElement('button');b.id='v05QuitBtn';b.textContent='Quit 1v1';b.onclick=pvpQuit;b.style.display='none';document.body.appendChild(b)}
    if(!$('v05SpectatorDM')){const d=document.createElement('div');d.id='v05SpectatorDM';d.innerHTML='<b>MESSAGE SURVIVOR</b><div class="v05-chatrow"><input id="v05SpectatorInput" maxlength="200" placeholder="Send a message…"><button onclick="pvpSendSpectatorDM()">Send</button></div>';document.body.appendChild(d)}
    if(!$('v05RoundOverlay')){const d=document.createElement('div');d.id='v05RoundOverlay';document.body.appendChild(d)}
  }
  function renderPvpRoundSummary(){
    ensureV05Ui();const o=$('v05RoundOverlay');o.className='v05-modal on';
    const st=PVP.stats||{},h=st.host||{},g=st.guest||{},elapsed=Math.max(0,Date.now()-(PVP.startTime||Date.now()));
    const fmt=n=>Math.floor(Math.max(0,Number(n)||0));
    o.innerHTML=`<section class="v05-panel"><div class="v05-kicker">RUN OVER · BOTH PLAYERS DOWN</div><h2>Run summary · Wave ${Math.max(1,Number(PVP.roundWave)||G?.w||1)}</h2><p class="ds">Both players are down. Review the run stats, then both players must continue before upgrades open. Nobody respawns during this run.</p><div class="v05-stats"><div>Damage <b>${fmt(h.damage)}</b> : <b>${fmt(g.damage)}</b></div><div>Kills <b>${fmt(h.kills)}</b> : <b>${fmt(g.kills)}</b></div><div>Crates <b>${fmt(h.crates)}</b> : <b>${fmt(g.crates)}</b></div><div>Time <b>${Math.floor(elapsed/60000)}:${String(Math.floor(elapsed/1000)%60).padStart(2,'0')}</b></div></div><p class="ds">Session currencies and loot have been banked to your temporary 1v1 save.</p><button class="pvpLobbyBtn" onclick="pvpRoundContinue()">${PVP.continueReady?'Waiting for opponent…':'Continue'}</button><button class="pvpLobbyBtn v05-danger" onclick="pvpQuit()">Quit / End Game</button><p class="ds">Both players must continue before the 60-second upgrade stage begins.</p></section>`;
  }
  function renderPvpUpgradeHub(){
    ensureV05Ui();const o=$('hubOverlay'),oldScroll=o.scrollTop,round=$('v05RoundOverlay');if(round)round.className='v05-modal';mode='hub';
    if(!Number.isInteger(Number(PVP.upgradeTab))||Number(PVP.upgradeTab)<0||Number(PVP.upgradeTab)>3)PVP.upgradeTab=0;tab=PVP.upgradeTab;
    const remaining=Math.max(0,Math.ceil(((PVP.upgradeDeadline||Date.now())-Date.now())/1000));
    const resources=[['Warp','🌀',S.warp,'Earned from kills and cleared waves.'],['Protons','⚛',S.pro,'Used to craft Decryption Keys.'],['Keys','🗝',S.key,'Decrypt crates.'],['Fusion','🔮',S.fus,'Unlock Aether attunement.'],['Souls','👻',S.souls,'Awaken Spirit Slugs.']];
    const myStatus=PVP.upgradeReady?'YOU READY':'NOT READY',peerStatus=PVP.peerUpgradeReady?'OPPONENT READY':'WAITING FOR OPPONENT';let body='';
    if(tab===0){body=t0().replace(/onclick="dep\((\d+)\)"/g,'disabled onclick="pvpDeployNotice($1)"').replace(/>Deploy here<\/button>/g,'>Select after Ready<\/button>');}
    else if(tab===1)body=t1().replace(/\boc\(/g,'pvpOpenCrate(').replace(/\bbc\(/g,'pvpBuyCrate(').replace(/\bcf\(/g,'pvpCraft(');
    else if(tab===2)body=t2().replace(/\bupg\(/g,'pvpUpgrade(').replace(/\bunl\(/g,'pvpUnlock(');
    else body=t3().replace(/\beq\(/g,'pvpEquip(').replace(/\bue\(/g,'pvpUnequip(').replace(/\baw\(/g,'pvpAwaken(');
    if(PVP.upgradeReady)body=body.replace(/<button(?=[^>]*onclick=)/g,'<button disabled');
    o.className='ov on';$('topHUD').innerHTML='';
    o.innerHTML=`<div class=hd><svg class=logo viewBox='0 0 380 74'><defs><linearGradient id='lg' x1='0' x2='1'><stop offset='0' stop-color='#00ff88'/><stop offset='1' stop-color='#00ccff'/></linearGradient></defs><text x='190' y='46' text-anchor='middle' font-size='40' font-weight='800' font-family='Orbitron,sans-serif' fill='url(#lg)' stroke='#0a0814' stroke-width='7' paint-order='stroke' stroke-linejoin='round'>SLUGGER <tspan fill='#ff0055'>(NEO)</tspan></text><path class=dr d='M70 52q5 12 0 18q-5-6 0-18' fill='#00ff88' stroke='#0a0814' stroke-width='2'/><path class=dr d='M190 52q5 12 0 18q-5-6 0-18' fill='#00ff88' stroke='#0a0814' stroke-width='2'/><path class=dr d='M300 52q5 12 0 18q-5-6 0-18' fill='#00ff88' stroke='#0a0814' stroke-width='2'/></svg><div class=rs>${resources.map(r=>`<span class=tt data-tip="${r[3]}"><b>${r[1]} ${Math.floor(Number(r[2])||0)}</b> ${r[0]}</span>`).join('')}</div></div><div class="v06-pvp-status"><span>⚔ 1v1 UPGRADE WINDOW</span><b id="v05ReadyStatus">${myStatus} · ${peerStatus}</b><span>TIME LEFT <strong><span id="v05Timer">${remaining}</span>s</strong></span>${remaining===0?'<span>WAITING FOR BOTH READY</span>':''}</div><nav>${['Deploy','Unboxing / Crates','Skill Tree','Equipment & Sets'].map((t,i)=>`<button class="tab${i===tab?' on':''}" onclick="pvpUpgradeTab(${i})">${t}</button>`).join('')}</nav><div class=tbc>${body}</div><p><button onclick="pvpToggleReady()" class="pvpLobbyBtn" ${PVP.upgradeReady?'disabled':''}>${PVP.upgradeReady?'✓ Ready — '+(PVP.peerUpgradeReady?'both ready':'waiting for opponent'):'Ready for next run'}</button> <button onclick="pvpQuit()" class="pvpLobbyBtn v05-danger">Quit / End Game</button> <span class=ds>Temporary 1v1 balances are isolated from Singleplayer. Ready locks further purchases on your side.</span></p>`;o.scrollTop=oldScroll;
  }
  function renderPvpWaveSelect(){
    ensureV05Ui();const hubUi=$('hubOverlay');if(hubUi)hubUi.className='ov';$('topHUD').innerHTML='';const o=$('v05RoundOverlay');o.className='v05-modal on';const maxCheckpoint=PVP.target===5?5:8;const valid=safeCommon().filter(c=>Number.isInteger(c)&&c>=1&&c<=maxCheckpoint).sort((a,b)=>a-b);if(!valid.length)valid.push(1);const selected=Number(PVP.nextSelectedWave),chosen=valid.includes(selected)?selected:valid[valid.length-1];if(PVP.role==='host')PVP.nextSelectedWave=chosen;const options=valid.map(w=>`<option value="${w}" ${w===chosen?'selected':''}>Wave ${w}: ${esc(WV[w-1]?.[0]||'Campaign')}</option>`).join('');
    o.innerHTML=`<section class="v05-panel"><div class="v05-kicker">NEXT CAMPAIGN STAGE</div><h2>Wave selection</h2><p class="ds">The host chooses from checkpoints unlocked in both players' 1v1 session saves. The selected wave is used for both players, and both return alive when the run launches.</p>${PVP.role==='host'?`<label for="v05WaveSelect">Shared checkpoint</label><select id="v05WaveSelect" class="nin" onchange="PVP.nextSelectedWave=Number(this.value)">${options}</select><button class="pvpLobbyBtn" onclick="pvpStartSelectedWave()">Deploy wave ${chosen}</button>`:`<h3>Host is choosing the next stage…</h3><p class="ds">Shared checkpoints: ${valid.map(w=>'Wave '+w).join(', ')}</p>`}<button class="pvpLobbyBtn v05-danger" onclick="pvpQuit()">Quit / End Game</button></section>`;
  }
  function ensurePvpUpgradeTicker(){
    if(PVP.upgradeTickTimer||!PVP.active||PVP.role!=='host'||PVP.phase!=='upgrade')return;
    PVP.upgradeTickTimer=setInterval(()=>{if(!PVP.active||PVP.phase!=='upgrade'){clearInterval(PVP.upgradeTickTimer);PVP.upgradeTickTimer=null;return}const remaining=Math.max(0,Math.ceil((PVP.upgradeDeadline-Date.now())/1000));netSend(PVP.opponent,{type:'pvp_upgrade_tick',matchId:PVP.matchId,remaining,ready:PVP.upgradeReady,opponentReady:PVP.peerUpgradeReady});const el=$('v05Timer');if(el)el.textContent=remaining;if(PVP.upgradeReady&&PVP.peerUpgradeReady)finishPvpUpgradeStage();},250);
  }
  function startPvpUpgradeStage(){
    if(!PVP.active||PVP.role!=='host'||PVP.finished||PVP.phase!=='roundSummary')return;
    PVP.phase='upgrade';PVP.upgradeDeadline=Date.now()+60000;PVP.upgradeReady=false;PVP.peerUpgradeReady=false;renderPvpUpgradeHub();
    netSend(PVP.opponent,{type:'pvp_upgrade_start',matchId:PVP.matchId,duration:60000,stats:PVP.stats,checkpoints:PVP.myCheckpoints});
    if(PVP.upgradeTickTimer){clearInterval(PVP.upgradeTickTimer);PVP.upgradeTickTimer=null;}ensurePvpUpgradeTicker();
  }
  function finishPvpUpgradeStage(){if(!PVP.active||PVP.role!=='host'||PVP.phase!=='upgrade')return;if(PVP.upgradeTickTimer){clearInterval(PVP.upgradeTickTimer);PVP.upgradeTickTimer=null;}PVP.phase='waveSelect';PVP.opponentCheckpoints=PVP.opponentCheckpoints||[1];PVP.nextSelectedWave=Math.max(...safeCommon().filter(w=>w<=(PVP.target===5?5:8)),1);renderPvpWaveSelect();netSend(PVP.opponent,{type:'pvp_wave_select',matchId:PVP.matchId,checkpoints:PVP.myCheckpoints,opponentCheckpoints:PVP.opponentCheckpoints,nextWave:PVP.nextSelectedWave});}
  function pvpRoundContinue(){if(!PVP.active||PVP.phase!=='roundSummary'||PVP.continueReady)return;PVP.continueReady=true;renderPvpRoundSummary();netSend(PVP.opponent,{type:'pvp_round_continue',matchId:PVP.matchId,checkpoints:S.cp||[1],dead:!!PVP.playerDead});if(PVP.role==='host'&&PVP.peerContinueReady)startPvpUpgradeStage();}
  function pvpToggleReady(){if(!PVP.active||PVP.phase!=='upgrade'||PVP.upgradeReady)return;if(ub&&ub.ph===1){showV05Toast('Upgrade hub','Wait for the crate reveal to finish before Ready.',null);return;}PVP.myLoadout=makePvpLoadout();PVP.upgradeReady=true;renderPvpUpgradeHub();netSend(PVP.opponent,{type:'pvp_upgrade_ready',matchId:PVP.matchId,checkpoints:S.cp||[1],loadout:PVP.myLoadout});if(PVP.role==='host'&&PVP.peerUpgradeReady)finishPvpUpgradeStage();}
  function pvpUpgrade(k,base){if(!PVP.active||PVP.phase!=='upgrade'||PVP.upgradeReady)return;const row=UP.find(x=>x[0]===k),lvl=Number(S.up[k])||0;if(!row||lvl>=row[2])return;const cost=UCOST(k,base);if(S.warp<cost)return;S.warp-=cost;S.up[k]=lvl+1;ST=calc();save();SFX.buy();renderPvpUpgradeHub();}
  function pvpCanEditHub(){return PVP.active&&PVP.phase==='upgrade'&&!PVP.upgradeReady;}
  function applyPvpOpponentLoadout(raw){const loadout=acceptPvpLoadout(raw);if(!loadout)return;PVP.opponentLoadout=loadout;PVP.oppShotDamageMax=Math.min(400,loadout.damage*3.3);PVP.oppShotCooldown=loadout.cooldown;PVP.oppPellets=loadout.pellets;PVP.oppMh=loadout.hp;PVP.oppTk=loadout.tk;PVP.oppDr=loadout.dr;PVP.oppMag=loadout.mag;PVP.oppHazardImmune=loadout.hazardImmune;}
  function pvpUpgradeTab(i){if(!PVP.active||PVP.phase!=='upgrade'||PVP.upgradeReady)return;PVP.upgradeTab=Math.max(0,Math.min(3,Number(i)||0));tab=PVP.upgradeTab;dm=false;SFX.tab();renderPvpUpgradeHub();}
  function pvpDeployNotice(){showV05Toast('Deploy','Both players must be Ready before the host can choose a shared checkpoint.',null);}
  function pvpOpenCrate(t){if(!pvpCanEditHub()||!LT[t])return;oc(t);}
  function pvpBuyCrate(t){if(!pvpCanEditHub()||!BP[t]||S.warp<BP[t])return;bc(t);}
  function pvpCraft(i){if(!pvpCanEditHub())return;cf(Number(i));}
  function pvpUnlock(el){if(!pvpCanEditHub()||!EL6.includes(el)||S.att.includes(el))return;unl(el);}
  function pvpUnequip(t){if(!pvpCanEditHub()||!SN[t])return;ue(t);}
  function pvpAwaken(k){if(!pvpCanEditHub()||!S.inv[k]||IT[k]?.t!=='p')return;aw(k);}
  const _hubBeforePvpUpgrade=hub;hub=function(){if(PVP.active&&PVP.phase==='upgrade'){renderPvpUpgradeHub();return;}_hubBeforePvpUpgrade();};
  function pvpEquip(k){if(!PVP.active||PVP.phase!=='upgrade'||PVP.upgradeReady||!IT[k]||!S.inv[k])return;S.eq[IT[k].t]=k;ST=calc();save();SFX.click();renderPvpUpgradeHub();}
  function pvpDecrypt(t){if(!PVP.active||PVP.phase!=='upgrade'||PVP.upgradeReady||!LT[t]||(Number(S.cr[t])||0)<1||S.key<LT[t].k)return;S.cr[t]--;S.key-=LT[t].k;const results=roll(t);save();SFX.open();renderPvpUpgradeHub();showV05Toast('Decryption',results.join(' · ')||'No bonus loot this time.',null);}
  function pvpCraftKey(){if(!PVP.active||PVP.phase!=='upgrade'||PVP.upgradeReady||S.pro<2||S.warp<45)return;S.pro-=2;S.warp-=45;S.key++;save();SFX.buy();renderPvpUpgradeHub();}
  function pvpStartSelectedWave(){if(!PVP.active||PVP.role!=='host'||PVP.phase!=='waveSelect')return;const choices=safeCommon().filter(c=>Number.isInteger(c)&&c>=1&&c<=(PVP.target===5?5:8));if(!choices.length)choices.push(1);const el=$('v05WaveSelect');let w=Number(el?.value);if(!Number.isInteger(w)||!choices.includes(w))w=choices[choices.length-1];PVP.nextSelectedWave=w;netSend(PVP.opponent,{type:'pvp_start_wave',matchId:PVP.matchId,wave:w,checkpoints:PVP.myCheckpoints,opponentCheckpoints:PVP.opponentCheckpoints,hostDead:!!PVP.playerDead});PVPStartWaveLocal(w);}
  function PVPStartWaveLocal(w){if(!PVP.active||PVP.finished||!G)return;const shared=safeCommon().filter(c=>Number.isInteger(c)&&c>=1&&c<=(PVP.target===5?5:8));if(!shared.length)shared.push(1);w=Number(w);if(!Number.isInteger(w)||!shared.includes(w))w=shared[shared.length-1];PVP.startWave=cl(w,1,PVP.target===5?5:10);PVP.phase='playing';PVP.continueReady=false;PVP.peerContinueReady=false;PVP.upgradeReady=false;PVP.peerUpgradeReady=false;PVP.playerDead=false;PVP.oppDead=false;PVP.oppAlive=true;PVP.oppInitialised=false;PVP.oppLastInputAt=0;PVP.lastGuestHpPacket=0;PVP.oppMh=cl(Number(PVP.opponentLoadout?.hp)||Number(PVP.oppMh)||100,50,2000);PVP.oppHp=PVP.oppMh;P.x=PVP.role==='host'?W*.42:W*.58;P.y=H/2;P.vx=P.vy=0;P.rx=P.rv=0;P.sp=0;P.cd=0;P.inv=1;P.hp=100;PVP.oppX=PVP.role==='host'?W*.58:W*.42;PVP.oppY=H/2;PVP.oppXT=PVP.oppX;PVP.oppYT=H/2;PVP.oppDrone=null;PVP.oppDroneTarget=null;PVP.hostDrone=null;PVP.hostDroneTarget=null;PVP.hostDroneHitAt=0;PVP.guestDroneHitAt=0;for(const k of Object.keys(K))K[k]=0;md=false;PVP.hostBulletsSnap=[];PVP.hostParticlesSnap=[];PVP.hostMortarsSnap=[];PVP.hostHolesSnap=[];PVP.hostSlimeSnap=[];PVP.hostStorm={t:0,stt:0,owner:'host'};PVP.receivedShots=new Set();PVP.oppVolleyMap=new Map();PVP.oppFireLastAt=0;PVP.oppAng=0;PVP.oppAngTarget=0;PVP.oppTaunt=null;P.taunt=null;PVP.guestSpecialReadyAt=0;pendingGuestCrates.clear();G.bossSpawned=false;G.w=PVP.startWave-1;G.st='inter';G.tmr=.45;G.q=[];E=[];B=[];EB=[];CR=[];PT=[];SL=[];HZ=[];TL=[];BM=[];MS=[];HO=[];G.spi=(eqI('p')&&S.aw[S.eq.p])?{cd:0,x:0,y:0}:null;G.storm=0;G.stt=0;G.stormOwner='host';G.fr=0;G.dead=0;G.tot=0;G.runBanked=false;PVP.roundBanked=false;G.warp=Math.max(0,Number(S.rec[PVP.startWave])||0);G.startWarp=G.warp;G.cr=blankCrates();G.souls=0;ST=calc();P.hp=ST.mhp;P.at=S.att.includes(P.at)?P.at:'neutral';mode='play';$('hubOverlay').className='ov';$('topHUD').innerHTML='';$('v05RoundOverlay').className='v05-modal';$('pauseOverlay').className='ov';save();}
  function pvpQuit(){if(!PVP.active){hub();return;}PVP.noReward=false;const inRun=['playing','reconnecting'].includes(PVP.phase);netSend(PVP.opponent,{type:'pvp_quit',matchId:PVP.matchId,inRun,quitRole:PVP.role});if(PVP.role==='host'){endPvp('guest','forfeit',{quit:true,quitRole:'host'});}else{showV05Toast('System','Quit request sent; ending 1v1 session.',null);}}
  function returnToV05PvpMenu(){
    const h=$('hubOverlay');if(h)h.className='ov';if(!PVP.active)return;
    if(PVP.phase==='roundSummary')renderPvpRoundSummary();
    else if(PVP.phase==='upgrade')renderPvpUpgradeHub();
    else if(PVP.phase==='waveSelect')renderPvpWaveSelect();
    else if(PVP.phase==='lobby')showPvpLobby();
    else if(PVP.phase==='countdown'||PVP.phase==='sync'){const c=$('pvpCountdownOverlay');if(c)c.style.display='flex';}
  }
  function pvpSendSpectatorDM(){if(!PVP.active||!PVP.playerDead||!PVP.opponent||PVP.oppDead||PVP.oppAlive===false)return;const el=$('v05SpectatorInput'),msg=(el?.value||'').trim().slice(0,200);if(!msg)return;netSend(PVP.opponent,{type:'pvp_spectator_dm',matchId:PVP.matchId,text:msg,from:AUTH.username||NET.id});if(el)el.value='';NET.msgs.push({from:'Spectator DM',to:NET.id,msg,t:Date.now(),sys:1});showV05Toast('You → survivor',msg,null);}
  function drawV05Taunt(x,y,taunt){if(!taunt||!taunt.emoji||Number(taunt.until)<Date.now())return;const age=1-(taunt.until-Date.now())/2200;cx.save();cx.globalAlpha=Math.max(0,1-age);cx.font='26px sans-serif';cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='#0a0814';cx.fillStyle='#fff';const by=y-45-age*20;cx.beginPath();cx.roundRect(x-23,by-24,46,34,10);cx.fill();cx.stroke();cx.beginPath();cx.moveTo(x-5,by+10);cx.lineTo(x+2,by+10);cx.lineTo(x-1,by+18);cx.fill();cx.fillText(taunt.emoji,x,by+1);cx.restore();}
  function fireV05Taunt(key){if(!PVP.active||PVP.phase!=='playing'||PVP.playerDead)return;const map={'7':'😂','8':'😈','9':'💀','0':'🔥'},emoji=map[key];if(!emoji)return;P.taunt={emoji,until:Date.now()+2200};SFX.click();if(PVP.opponent)netSend(PVP.opponent,{type:'pvp_taunt',matchId:PVP.matchId,emoji,until:Date.now()+2200});}

  // Session state is activated before either player sees a PvP lobby.
  const _enterPvpLobby=enterPvpLobby;
  enterPvpLobby=function(role,pid,target){beginPvpSaveSession();const result=_enterPvpLobby(role,pid,target);PVP.myCheckpoints=(S.cp||[1]).slice();PVP.opponentCheckpoints=[1];PVP.opponentCheckpointKnown=false;PVP.startWave=1;PVP.rewardApplied=false;netSend(pid,{type:'pvp_v05_session',checkpoints:PVP.myCheckpoints,target:PVP.target});return result;};
  const _showPvpLobby=showPvpLobby;
  showPvpLobby=function(){cleanupPvpLobbyUi();const choices=safeCommon();const o=document.createElement('div');o.id='pvpLobbyOverlay';o.className='modal';o.innerHTML=`<div class="p" style="max-width:460px;text-align:center"><h3>1v1 Campaign Lobby</h3><p class=ds>Target boss: Wave ${PVP.target}. Temporary session save active.</p>${PVP.role==='host'?`<label for="v05LobbyStart">Starting checkpoint (unlocked by both)</label><select class=nin id="v05LobbyStart" onchange="PVP.startWave=Number(this.value)">${choices.map(w=>`<option value="${w}" ${w===(PVP.startWave||1)?'selected':''}>Wave ${w}: ${esc(WV[w-1]?.[0]||'Campaign')}</option>`).join('')}</select>`:`<p class=ds>Host chooses a start checkpoint from the intersection of both session saves.</p>`}<div class=pvpLobbyRow><span>You</span><span id=pvpYouStatus>⏳ Not ready</span></div><div class=pvpLobbyRow><span>Opponent</span><span id=pvpOppStatus>⏳ Not ready</span></div><button id=pvpReadyBtn class=pvpLobbyBtn onclick="pvpClickReady()">Ready</button><button onclick="pvpQuit()" class="pvpLobbyBtn v05-danger">Quit / End Game</button></div>`;document.body.appendChild(o);updatePvpLobbyUi();};
  const _updateLobbyUiV05=updatePvpLobbyUi;updatePvpLobbyUi=function(){_updateLobbyUiV05();const b=$('pvpReadyBtn');if(b&&PVP.active&&PVP.role==='host'&&!PVP.opponentCheckpointKnown){b.disabled=true;b.textContent='Syncing checkpoints…';}};
  pvpClickReady=function(){if(PVP.phase!=='lobby'||(PVP.role==='host'&&!PVP.opponentCheckpointKnown))return;PVP.myLoadout=makePvpLoadout();PVP.myCheckpoints=(S.cp||[1]).slice();if(PVP.role==='host'){PVP.hostReady=true;PVP.startWave=Number($('v05LobbyStart')?.value||PVP.startWave||1)}else PVP.guestReady=true;netSend(PVP.opponent,{type:'pvp_ready',loadout:PVP.myLoadout,checkpoints:PVP.myCheckpoints});updatePvpLobbyUi();tryStartCountdown();};
  tryStartCountdown=function(){if(PVP.phase!=='lobby'||PVP.role!=='host'||!PVP.hostReady||!PVP.guestReady)return;const choices=safeCommon();if(!choices.includes(Number(PVP.startWave)))PVP.startWave=choices[0];PVP.phase='sync';PVP.matchId=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;PVP.seed=(Math.random()*0xffffffff)>>>0;PVP.countdownStart=0;PVP.syncStartedAt=Date.now();PVP.initAck=false;PVP.stats={host:{damage:0,kills:0,crates:0,souls:0,warp:0,combo:0,bestCombo:0,lastKillAt:0},guest:{damage:0,kills:0,crates:0,souls:0,warp:0,combo:0,bestCombo:0,lastKillAt:0}};PVP.receivedShots=new Set();PVP.cleanupRound=false;cleanupPvpLobbyUi();showPvpCountdown();netBroadcast({type:'status',mode:'game'});netSend(PVP.opponent,{type:'pvp_init',matchId:PVP.matchId,target:PVP.target,startWave:PVP.startWave,checkpoints:PVP.myCheckpoints,seed:PVP.seed,waves:[5,10],settings:{enemyHp:1.5,spawnScale:1.35},hostStatus:'ready',guestStatus:'ready'});const o=$('pvpCountdownOverlay');if(o)o.textContent='SYNC';};
  const _deploy=deploy;
  deploy=function(cp){const use=PVP.active?cl(Number(PVP.startWave)||Number(cp)||1,1,PVP.target===5?5:8):cp;_deploy(use);if(PVP.active&&save_1v1){G.warp=Math.max(0,Number(S.rec[use])||0);G.startWarp=G.warp;G.cr=blankCrates();G.souls=0;G.runBanked=false;PVP.roundBanked=false;PVP.stats=PVP.stats||{};PVP.myCheckpoints=(S.cp||[1]).slice();}};
  const _nextWave=nextWave;
  nextWave=function(){if(PVP.active&&PVP.role==='host'&&(PVP.finished||PVP.phase!=='playing'))return;PVP.roundBanked=false;_nextWave();};
  const _clearWave=clearWave;
  clearWave=function(){if(PVP.active){if(PVP.role!=='host'||PVP.phase!=='playing'||PVP.finished)return;}else{return _clearWave();}const wave=G.w;G.lastClearedWave=Math.max(Number(G.lastClearedWave)||0,wave);const bonus=wave*25;if(!PVP.playerDead){G.warp+=bonus;PVP.stats.host.warp=(PVP.stats.host.warp||0)+bonus;}if(PVP.oppAlive)PVP.stats.guest.warp=(PVP.stats.guest.warp||0)+bonus;/* Shared run checkpoint: both session saves unlock the cleared stage, even if one player is spectating. */unlockSessionCheckpoint(wave,'host');unlockSessionCheckpoint(wave,'guest');netSend(PVP.opponent,{type:'pvp_checkpoint_unlock',matchId:PVP.matchId,wave,record:Number(PVP.stats.guest.warp)||0});if(!PVP.playerDead)S.rec[wave]=Math.max(Number(S.rec[wave])||0,Number(G.warp)||0);SFX.pick();if(wave>=PVP.target){return;}addCrate(R(100,W-100),R(100,H-100),CT[wave-1],0);G.st='inter';G.tmr=2.5;netSend(PVP.opponent,{type:'pvp_intermission_tick',matchId:PVP.matchId,wave,remaining:G.tmr,nextWave:wave+1,name:WV[wave]?.[0]||'Campaign'});save();};
  // A dead player cannot leave owner-tagged specials or projectiles dealing damage.
  function clearV05DeadAttacks(deadRole){if(!PVP.active)return;if(PVP.role==='host'){if(deadRole==='host'){B=B.filter(b=>b._guest===true);HO=HO.filter(h=>h.owner==='guest');SL=[];if(G&&G.stormOwner==='host'){G.storm=0;G.stt=0;}if(G)G.spi=null;P.taunt=null;}else{B=B.filter(b=>!b._guest);HO=HO.filter(h=>h.owner==='host');if(G&&G.stormOwner==='guest'){G.storm=0;G.stt=0;}PVP.oppDrone=null;PVP.oppDroneTarget=null;PVP.oppTaunt=null;}}else{if(deadRole==='guest'){B=[];HO=HO.filter(h=>h.owner==='host');if(G&&G.stormOwner==='guest'){G.storm=0;G.stt=0;}if(G)G.spi=null;P.taunt=null;}else{HO=HO.filter(h=>h.owner==='guest');SL=[];if(G&&G.stormOwner==='host'){G.storm=0;G.stt=0;}PVP.hostDrone=null;PVP.hostDroneTarget=null;PVP.oppTaunt=null;PVP.hostBulletsSnap=[];}}}
  // Keep a corpse inert and spectate until the campaign boss falls or both are dead.
  hurtPlayerDeath=function(){P.hp=0;if(PVP.active&&PVP.phase==='playing'&&!PVP.finished&&!PVP.playerDead){PVP.playerDead=true;P.vx=P.vy=0;P.sp=0;md=false;clearV05DeadAttacks(PVP.role);for(const k of Object.keys(K))K[k]=0;netSend(PVP.opponent,{type:'pvp_player_died',role:PVP.role,matchId:PVP.matchId});if(PVP.role==='host'){if(PVP.oppDead||PVP.oppAlive===false){showBothDeadSummary();}else{netSend(PVP.opponent,{type:'pvp_spectate',matchId:PVP.matchId,hostDead:true});netSys('You died. Spectating the surviving player.');}}else{netSys('You died. Spectating the surviving player.');if(PVP.oppDead||PVP.oppAlive===false)netSend(PVP.opponent,{type:'pvp_both_dead',matchId:PVP.matchId});}return;}if(PVP.active&&PVP.phase==='playing'){if(PVP.playerDead&&(PVP.oppDead||PVP.oppAlive===false)&&PVP.role==='host')showBothDeadSummary();return;}endRun(false);};
  function showBothDeadSummary(){if(!PVP.active||PVP.role!=='host'||PVP.phase!=='playing')return;PVP.oppDead=true;PVP.oppAlive=false;PVP.roundWave=G?.w||1;bankPvpRoundProgress();PVP.phase='roundSummary';PVP.continueReady=false;PVP.peerContinueReady=false;mode='pause';PVP.roundStartedAt=Date.now();renderPvpRoundSummary();netSend(PVP.opponent,{type:'pvp_round_summary',matchId:PVP.matchId,wave:PVP.roundWave,stats:PVP.stats,hostDead:true,guestDead:true,checkpoints:PVP.myCheckpoints,remaining:0});}
  damagePvpGuest=function(amount,reason='hazard'){if(!PVP.active||PVP.role!=='host'||PVP.phase!=='playing'||!PVP.oppAlive||PVP.finished)return;const raw=Math.max(0,Number(amount)||0),dmg=raw*(1-cl(Number(PVP.oppDr)||0,0,.75)*1)*(cl(Number(PVP.oppTk)||1,.5,2));if(!dmg)return;const now=Date.now();if(String(reason).startsWith('player-')){if(now<(PVP.oppInvUntil||0))return;PVP.oppInvUntil=now+300;PVP.stats.host.damage=(PVP.stats.host.damage||0)+dmg;}PVP.oppHp=Math.max(0,PVP.oppHp-dmg);if(PVP.oppHp<=0){PVP.oppAlive=false;PVP.oppDead=true;netSend(PVP.opponent,{type:'pvp_guest_hp',matchId:PVP.matchId,hp:0,dmg,reason});netSend(PVP.opponent,{type:'pvp_you_died',matchId:PVP.matchId});if(PVP.playerDead){netSend(PVP.opponent,{type:'pvp_both_dead',matchId:PVP.matchId});showBothDeadSummary();}}else if(now-(PVP.lastGuestHpPacket||0)>=50){PVP.lastGuestHpPacket=now;netSend(PVP.opponent,{type:'pvp_guest_hp',matchId:PVP.matchId,hp:PVP.oppHp,dmg,reason});}};

  const _cleanupPvp=cleanupPvp;
  cleanupPvp=function(){if(PVP.upgradeTickTimer){clearInterval(PVP.upgradeTickTimer);PVP.upgradeTickTimer=null;}const o=$('v05RoundOverlay');if(o)o.className='v05-modal';const quit=$('v05QuitBtn');if(quit)quit.style.display='none';const spec=$('v05SpectatorDM');if(spec)spec.style.display='none';if(activeSaveMode==='pvp'&&save_1v1)discardPvpSaveSession();_cleanupPvp();};
  // Match conclusion is host-authoritative; results are immutable and acknowledged.
  endPvp=function(winner,reason,details={}){if(!PVP.active||PVP.finished)return;if(PVP.role==='guest'&&!['disconnect','forfeit','menu-exit'].includes(reason))return;if(PVP.pendingResultTimer){clearTimeout(PVP.pendingResultTimer);PVP.pendingResultTimer=null;}PVP.pendingResult=null;if(reason==='boss'||reason==='both-dead'||reason==='forfeit')bankPvpRoundProgress();PVP.finished=true;PVP.winner=winner;PVP.reason=reason;PVP.phase='finished';PVP.resultAt=Date.now();PVP.resultBanked=false;mode='pause';$('pauseOverlay').className='ov';const elapsed=Math.max(0,Date.now()-(PVP.startTime||Date.now()));const pkt=Object.freeze({type:'pvp_end',matchId:PVP.matchId,winner,reason,details:clone(details||{}),stats:clone(PVP.stats||{}),elapsed,reachedWave:G?G.w:1,lastClearedWave:G?Number(G.lastClearedWave)||0:0,finishedAt:PVP.resultAt,noReward:!!PVP.noReward});PVP.resultPacket=pkt;PVP.resultAcked=false;if(PVP.role==='host'&&PVP.opponent){netSend(PVP.opponent,pkt);if(PVP.resultResendTimer)clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=setInterval(()=>{if(!PVP.active||!PVP.finished||PVP.resultAcked||!PVP.resultPacket){clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=null;return;}netSend(PVP.opponent,PVP.resultPacket)},500);}showPvpEnd(winner===PVP.role,reason,winner==='draw',details,PVP.stats,elapsed);const panel=$('pvpEndOverlay');if(panel&&!PVP.noReward){const msg=document.createElement('p');msg.className='ds';msg.textContent=winner==='draw'?'Draw reward: +50 Warp, +1 Proton.':winner===PVP.role?'Winner reward: +500 Warp, +10 Protons.':'Participation reward: +100 Warp, +2 Protons.';panel.appendChild(msg);}if(PVP.resultTimer)clearTimeout(PVP.resultTimer);PVP.resultTimer=setTimeout(()=>{if(!PVP.resultBanked){PVP.resultBanked=true;applyPermanentPvpReward(winner,reason);}cleanupPvp();mode='hub';tab=2;showV05Toast('System',(reason==='menu-exit'||reason==='forfeit')?'Game Ended':'1v1 session complete',null);hub();},6500);};

  // New packets are intercepted before legacy PvP handlers; all other packets
  // continue through the v0.4.5 implementation unchanged.
  const _netData=netData;
  netData=function(pid,d){
    if(!d||typeof d!=='object')return;
    if(d.type==='pvp_wave_start'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&activeSaveMode==='pvp'){const w=cl(Number(d.wave)||1,1,10);S.rec[w]=Math.max(Number(S.rec[w])||0,Number(S.warp)||0);save();}
    if(d.type==='pvp_cancel'&&PVP.active&&pid===PVP.opponent&&['lobby','sync','countdown'].includes(PVP.phase)){PVP.noReward=true;showV05Toast('System','Game Ended',null);cleanupPvp();mode='hub';hub();return;}
    if(d.type==='pvp_v05_session'&&PVP.active&&PVP.phase==='lobby'&&pid===PVP.opponent){PVP.opponentCheckpointKnown=true;PVP.opponentCheckpoints=Array.isArray(d.checkpoints)?d.checkpoints.filter(n=>Number.isInteger(n)&&n>=1&&n<=8):[1];if(PVP.role==='host'){const choices=safeCommon();if(!choices.includes(Number(PVP.startWave)))PVP.startWave=choices[0];showPvpLobby();}else updatePvpLobbyUi();return;}
    if(d.type==='pvp_ready'&&PVP.active&&pid===PVP.opponent){PVP.opponentCheckpointKnown=true;PVP.opponentCheckpoints=Array.isArray(d.checkpoints)?d.checkpoints.filter(n=>Number.isInteger(n)&&n>=1&&n<=8):[1];if(PVP.role==='host'&&PVP.phase==='lobby'&&!PVP.hostReady){const choices=safeCommon();if(!choices.includes(Number(PVP.startWave)))PVP.startWave=choices[0];showPvpLobby();}}
    if(d.type==='pvp_init'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent){PVP.startWave=cl(Number(d.startWave)||1,1,d.target===5?5:8);PVP.opponentCheckpoints=Array.isArray(d.checkpoints)?d.checkpoints:[1];}
    if(d.type==='pvp_end_ack'){if(PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.finished){PVP.resultAcked=true;if(PVP.resultResendTimer){clearInterval(PVP.resultResendTimer);PVP.resultResendTimer=null;}return;} }
    if(d.type==='pvp_end'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){netSend(pid,{type:'pvp_end_ack',matchId:PVP.matchId,receivedAt:Date.now()});if(PVP.finished)return;if(d.reason==='forfeit'||d.details?.quit){PVP.playerDead=true;PVP.oppDead=true;PVP.oppAlive=false;PVP.oppHp=0;P.hp=0;P.vx=P.vy=0;P.sp=0;md=false;for(const k of Object.keys(K))K[k]=0;}PVP.stats=d.stats||PVP.stats;PVP.winner=d.winner;PVP.reason=d.reason;PVP.noReward=!!d.noReward;PVP.finished=true;PVP.phase='finished';mode='pause';$('pauseOverlay').className='ov';if(G){G.lastClearedWave=cl(Number(d.lastClearedWave)||G.lastClearedWave||0,0,10);}if(d.noReward)PVP.noReward=true;showPvpEnd(d.winner===PVP.role,d.reason,d.winner==='draw',d.details||{},PVP.stats,d.elapsed||0);const panel=$('pvpEndOverlay');if(panel&&!PVP.noReward){const msg=document.createElement('p');msg.className='ds';msg.textContent=d.winner==='draw'?'Draw reward: +50 Warp, +1 Proton.':d.winner===PVP.role?'Winner reward: +500 Warp, +10 Protons.':'Participation reward: +100 Warp, +2 Protons.';panel.appendChild(msg);}if(PVP.resultTimer)clearTimeout(PVP.resultTimer);PVP.resultTimer=setTimeout(()=>{if(!PVP.resultBanked){PVP.resultBanked=true;applyPermanentPvpReward(d.winner,d.reason);}cleanupPvp();mode='hub';tab=2;showV05Toast('System',(d.reason==='menu-exit'||d.reason==='forfeit')?'Game Ended':'1v1 session complete',null);hub();},6500);return;}
    if(d.type==='pvp_both_dead'&&PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.playerDead&&(PVP.oppHp<=0||PVP.oppAlive===false)){showBothDeadSummary();return;}
    if(d.type==='pvp_player_died'&&PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId){if(PVP.oppHp<=0||PVP.oppAlive===false){PVP.oppDead=true;PVP.oppAlive=false;clearV05DeadAttacks('guest');if(PVP.playerDead)showBothDeadSummary();else netSend(pid,{type:'pvp_spectate',matchId:PVP.matchId,guestDead:true});}return;}
    if(d.type==='pvp_round_summary'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.stats=d.stats||PVP.stats;PVP.roundWave=Number(d.wave)||G?.w||1;PVP.phase='roundSummary';if(d.hostDead){PVP.oppDead=true;PVP.oppAlive=false;}if(d.guestDead){PVP.playerDead=true;P.hp=0;P.vx=P.vy=0;}PVP.peerContinueReady=false;PVP.continueReady=false;if(G){/* Reached wave is not necessarily a cleared wave; preserve authoritative lastClearedWave. */bankPvpRoundProgress();}PVP.myCheckpoints=(S.cp||[1]).slice();netSend(pid,{type:'pvp_round_ack',matchId:PVP.matchId,checkpoints:PVP.myCheckpoints,dead:!!PVP.playerDead});mode='pause';renderPvpRoundSummary();return;}
    if(d.type==='pvp_round_ack'&&PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.opponentCheckpoints=Array.isArray(d.checkpoints)?d.checkpoints:[1];if(d.dead)PVP.oppDead=true;return;}
    if(d.type==='pvp_round_continue'&&PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.opponentCheckpoints=Array.isArray(d.checkpoints)?d.checkpoints:[1];if(PVP.role==='host'){PVP.peerContinueReady=true;if(PVP.continueReady)startPvpUpgradeStage();}else{PVP.peerContinueReady=true;}return;}
    if(d.type==='pvp_upgrade_start'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.phase='upgrade';PVP.upgradeDeadline=Date.now()+cl(Number(d.duration)||60000,1000,60000);PVP.intermissionRemaining=60;PVP.peerHostTimer=60;PVP.upgradeReady=false;PVP.peerUpgradeReady=false;if(G)bankPvpRoundProgress();renderPvpUpgradeHub();return;}
    if(d.type==='pvp_upgrade_tick'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.intermissionRemaining=Math.max(0,Number(d.remaining)||0);PVP.peerUpgradeReady=!!d.ready;PVP.peerHostTimer=Number(d.remaining)||0;const timer=$('v05Timer');if(timer)timer.textContent=PVP.intermissionRemaining;const status=$('v05ReadyStatus');if(status)status.textContent=(PVP.upgradeReady?'YOU READY':'NOT READY')+' · '+(PVP.peerUpgradeReady?'OPPONENT READY':'WAITING FOR OPPONENT');return;}
    if(d.type==='pvp_upgrade_ready'&&PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.peerUpgradeReady=true;PVP.opponentCheckpoints=Array.isArray(d.checkpoints)?d.checkpoints:[1];if(d.loadout)applyPvpOpponentLoadout(d.loadout);if(PVP.upgradeReady)finishPvpUpgradeStage();return;}
    if(d.type==='pvp_upgrade_ready'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.peerUpgradeReady=true;if(d.loadout)applyPvpOpponentLoadout(d.loadout);return;}
    if(d.type==='pvp_wave_select'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.phase='waveSelect';PVP.opponentCheckpoints=Array.isArray(d.checkpoints)?d.checkpoints:[1];PVP.myCheckpoints=(S.cp||[1]).slice();PVP.nextSelectedWave=Number(d.nextWave)||((G?.w||0)+1);renderPvpWaveSelect();return;}
    if(d.type==='pvp_start_wave'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){if(Array.isArray(d.checkpoints))PVP.opponentCheckpoints=d.checkpoints.filter(n=>Number.isInteger(n)&&n>=1&&n<=8);if(Array.isArray(d.opponentCheckpoints))PVP.myCheckpoints=(S.cp||[1]).slice();PVP.nextSelectedWave=Number(d.wave)||1;PVPStartWaveLocal(PVP.nextSelectedWave);return;}
    if(d.type==='pvp_checkpoint_unlock'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){unlockSessionCheckpoint(Number(d.wave)||0,'guest');save();return;}
    if(d.type==='pvp_taunt'&&PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.oppAlive!==false&&['😂','😈','💀','🔥'].includes(d.emoji)){PVP.oppTaunt={emoji:d.emoji,until:Date.now()+2200};return;}
    if(d.type==='pvp_spectator_dm'&&PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId&&!PVP.playerDead&&(PVP.oppDead||PVP.oppAlive===false)){showV05Toast(String(d.from||'Spectator'),String(d.text||'').slice(0,200),null);PVP.spectatorMessages=PVP.spectatorMessages||[];PVP.spectatorMessages.push({from:d.from||'Spectator',text:String(d.text||'').slice(0,200),at:Date.now()});return;}
    if(d.type==='pvp_spectate'&&PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId){if(d.hostDead){PVP.oppDead=true;PVP.oppAlive=false;}return;}
    if(d.type==='pvp_quit'&&PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId){if(PVP.role==='host'){PVP.noReward=false;endPvp('host','forfeit',{quit:true,quitRole:'guest'});}else if(!PVP.finished){PVP.noReward=false;showV05Toast('System','Host ended the 1v1 session.',null);}return;}
    if(d.type==='pvp_game_ended'&&PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.noReward=true;showV05Toast('System','Game Ended',null);cleanupPvp();mode='hub';hub();return;}
    if(d.type==='pvp_resume'&&PVP.active&&pid===PVP.opponent&&d.matchId===PVP.matchId&&PVP.phase==='reconnecting'){_netData(pid,d);restoreV05PvpPhase();return;}
    _netData(pid,d);
  };

  const _netChat=netChat;
  netChat=function(pid,msg){if(PVP.active)return;_netChat(pid,msg);const name=NET.friends[pid]?.name||pid;showV05Toast(name,msg,pid);};
  // Cloud DM listener has its own append path; add the same toast there.
  const oldDmNeedle="NET.msgs.push({from:slug,to:NET.id,msg:String(d.text||'').slice(0,200),t:Date.now()});if(NET.msgs.length>200)NET.msgs.shift();";
  const newDmNeedle="NET.msgs.push({from:slug,to:NET.id,msg:String(d.text||'').slice(0,200),t:Date.now()});showV05Toast(NET.friends[slug]?.name||slug,String(d.text||'').slice(0,200),slug);if(NET.msgs.length>200)NET.msgs.shift();";
  // Replace the matching body text in the original function source is not possible at runtime;
  // a source-level replacement is applied by the build script below.

  const _pvpResume=pvpResumeConnection;
  function restoreV05PvpPhase(){if(!PVP.active)return;if(PVP.phase==='playing'){mode='play';const o=$('hubOverlay');if(o)o.className='ov';const r=$('v05RoundOverlay');if(r)r.className='v05-modal';}else if(PVP.phase==='roundSummary'){mode='pause';renderPvpRoundSummary();}else if(PVP.phase==='upgrade'){mode='hub';renderPvpUpgradeHub();if(PVP.role==='host')ensurePvpUpgradeTicker();}else if(PVP.phase==='waveSelect'){mode='hub';renderPvpWaveSelect();}else if(PVP.phase==='lobby'){mode='hub';showPvpLobby();}else if(PVP.phase==='sync'||PVP.phase==='countdown'){mode='pause';const c=$('pvpCountdownOverlay');if(c)c.style.display='flex';}}
  pvpResumeConnection=function(pid){_pvpResume(pid);if(PVP.active){restoreV05PvpPhase();if(PVP.phase==='playing'){const b=$('v05QuitBtn');if(b)b.style.display='block';}}};
  // Draw-layer additions: camera tracking is local-only so network coordinates remain untouched.
  const _draw=draw;
  draw=function(){ensureV05Ui();const b=$('v05QuitBtn'),spec=$('v05SpectatorDM');if(b)b.style.display=PVP.active&&!PVP.finished&&['playing','reconnecting','roundSummary','upgrade','waveSelect'].includes(PVP.phase)?'block':'none';if(spec)spec.style.display=PVP.active&&PVP.playerDead&&PVP.oppAlive!==false&&!PVP.finished&&['playing','roundSummary','upgrade','waveSelect'].includes(PVP.phase)?'block':'none';
    // The existing renderer owns its context; camera offsets are reset immediately after this render.
    _draw();
    if(PVP.active){const worldPos=(x,y)=>PVP.playerDead?{x:W/2+x-(Number.isFinite(PVP.oppX)?PVP.oppX:P.x),y:H/2+y-(Number.isFinite(PVP.oppY)?PVP.oppY:P.y)}:{x,y};if(!PVP.playerDead){const q=worldPos(P.x,P.y);drawV05Taunt(q.x,q.y,P.taunt);}if(!PVP.oppDead){const q=worldPos(PVP.oppX,PVP.oppY);drawV05Taunt(q.x,q.y,PVP.oppTaunt);}if(PVP.role==='guest'&&PVP.hostDrone){const q=worldPos(PVP.hostDrone.x,PVP.hostDrone.y);cx.save();cx.translate(q.x,q.y);cx.fillStyle='#9dffd0';cx.strokeStyle='#0a0814';cx.lineWidth=2;cx.beginPath();cx.ellipse(0,0,9,6,0,0,7);cx.fill();cx.stroke();cx.restore();}if(PVP.role==='host'&&PVP.oppDrone){const q=worldPos(PVP.oppDrone.x,PVP.oppDrone.y);cx.save();cx.translate(q.x,q.y);cx.fillStyle='#9dffd0';cx.strokeStyle='#0a0814';cx.lineWidth=2;cx.beginPath();cx.ellipse(0,0,9,6,0,0,7);cx.fill();cx.stroke();cx.restore();}}
  };
  // Wrap upd to continue interpolation even when the local player is dead; no gameplay inputs run for corpses.
  const _upd=upd;
  upd=function(dt){if(PVP.active&&PVP.playerDead){md=false;P.vx=P.vy=0;P.sp=0;for(const k of ['w','a','s','d','arrowup','arrowleft','arrowright','arrowdown',' '])K[k]=0;} _upd(dt);if(PVP.active&&PVP.role==='guest'){PVP.oppAng=Number.isFinite(PVP.oppAng)?PVP.oppAng:0;PVP.oppAngTarget=Number.isFinite(PVP.oppAngTarget)?PVP.oppAngTarget:0;PVP.oppAng+=(angleDelta(PVP.oppAng,PVP.oppAngTarget))*.28;const target=PVP.oppDroneTarget;if(target){PVP.hostDrone=PVP.hostDrone||{...target};PVP.hostDrone.x+=(target.x-PVP.hostDrone.x)*.35;PVP.hostDrone.y+=(target.y-PVP.hostDrone.y)*.35;}}else if(PVP.active&&PVP.role==='host'){PVP.oppAng=Number.isFinite(PVP.oppAng)?PVP.oppAng:0;PVP.oppAngTarget=Number.isFinite(PVP.oppAngTarget)?PVP.oppAngTarget:0;PVP.oppAng+=(angleDelta(PVP.oppAng,PVP.oppAngTarget))*.28;const target=PVP.oppDroneTarget;if(target){PVP.oppDrone=PVP.oppDrone||{...target};PVP.oppDrone.x+=(target.x-PVP.oppDrone.x)*.35;PVP.oppDrone.y+=(target.y-PVP.oppDrone.y)*.35;}}};
  function angleDelta(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a));}
  // Network payload additions. Input and snapshot functions remain authoritative on the host.
  const _fire=fire;
  fire=function(){if(PVP.active&&PVP.playerDead)return;_fire();};
  const _special=special;
  special=function(){if(PVP.active&&PVP.playerDead)return;_special();};
  const _pvpTickCountdown=pvpTickCountdown;
  pvpTickCountdown=function(){_pvpTickCountdown();if(PVP.phase==='upgrade'&&PVP.role==='guest'){const el=$('v05Timer');if(el)el.textContent=Math.max(0,Number(PVP.intermissionRemaining)||Math.ceil(((PVP.upgradeDeadline||Date.now())-Date.now())/1000));}};
  // Enforce menu exit protocol for the legacy Cancel button as well.
  pvpCancelLobby=function(){pvpQuit();};
  // Keep set-bonus equipment and crate rewards in the currently active save through existing save().
  // UI handlers are exposed to inline buttons as globals in this classic script.
  Object.assign(window,{pvpRoundContinue,pvpToggleReady,pvpDeployNotice,pvpUpgrade,pvpEquip,pvpDecrypt,pvpOpenCrate,pvpBuyCrate,pvpCraft,pvpUnlock,pvpUnequip,pvpAwaken,pvpCraftKey,pvpStartSelectedWave,pvpQuit,pvpSendSpectatorDM,pvpUpgradeTab,showV05Toast,returnToV05PvpMenu});
  // Host input handler already checks role and position. Add heading/drone interpolation inputs.
  const _netDataFinal=netData;
  netData=function(pid,d){if(d&&d.type==='pvp_input'&&PVP.active&&PVP.role==='host'&&pid===PVP.opponent&&d.matchId===PVP.matchId){PVP.oppAngTarget=Number.isFinite(Number(d.ang))?Number(d.ang):PVP.oppAngTarget||0;if(d.drone&&Number.isFinite(Number(d.drone.x))&&Number.isFinite(Number(d.drone.y)))PVP.oppDroneTarget={x:cl(Number(d.drone.x),0,W),y:cl(Number(d.drone.y),0,H)};}
    if(d&&d.type==='pvp_snapshot'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){if(Number.isFinite(Number(d.hostHeading)))PVP.oppAngTarget=Number(d.hostHeading);if(d.hostDrone&&Number.isFinite(Number(d.hostDrone.x))&&Number.isFinite(Number(d.hostDrone.y)))PVP.hostDroneTarget={x:cl(Number(d.hostDrone.x),0,W),y:cl(Number(d.hostDrone.y),0,H)};if(d.hostTaunt&&d.hostTaunt.until>Date.now())PVP.oppTaunt={emoji:d.hostTaunt.emoji,until:d.hostTaunt.until};if(d.guestTaunt&&d.guestTaunt.until>Date.now())P.taunt={emoji:d.guestTaunt.emoji,until:d.guestTaunt.until};}
    if(d&&d.type==='pvp_spectator_dm'&&PVP.active&&PVP.playerDead&&PVP.phase==='playing'){}
    if(d&&(d.type==='pvp_you_died'||d.type==='pvp_guest_hp')&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){_netDataFinal(pid,d);if(PVP.playerDead)clearV05DeadAttacks('guest');if(PVP.playerDead&&(PVP.oppDead||PVP.oppAlive===false))netSend(pid,{type:'pvp_both_dead',matchId:PVP.matchId});return;}
    _netDataFinal(pid,d);if(d&&d.type==='pvp_snapshot'&&PVP.active&&PVP.role==='guest'&&pid===PVP.opponent&&d.matchId===PVP.matchId){if(PVP.playerDead)clearV05DeadAttacks('guest');if(d.hostAlive===false)clearV05DeadAttacks('host');if(d.hostAlive===false||!d.hostDrone){PVP.hostDrone=null;PVP.hostDroneTarget=null;}}};
  // Snapshot and input payload fields are patched directly in this source before parsing.

  // Guard legacy result paths: ordinary player deaths never conclude the session.
  const _endPvpDeathGuard=endPvp;
  endPvp=function(winner,reason,details={}){
    if(PVP.active&&!PVP.finished&&['player-death','opponent-death','both-dead'].includes(reason)){
      if(PVP.role==='host'&&PVP.phase==='playing'&&PVP.playerDead&&(PVP.oppDead||PVP.oppAlive===false))showBothDeadSummary();
      return;
    }
    return _endPvpDeathGuard(winner,reason,details);
  };
  const _queuePvpResultDeathGuard=queuePvpResult;
  queuePvpResult=function(winner,reason,details={}){
    if(PVP.active&&!PVP.finished&&reason!=='boss'){
      if(PVP.role==='host'&&PVP.phase==='playing'&&PVP.playerDead&&(PVP.oppDead||PVP.oppAlive===false))showBothDeadSummary();
      return;
    }
    return _queuePvpResultDeathGuard(winner,reason,details);
  };

  // Number-key taunts run alongside, never replacing, movement/attunement handlers.
  addEventListener('keydown',e=>{const tag=document.activeElement&&document.activeElement.tagName;if(tag==='INPUT'||tag==='TEXTAREA')return;const k=e.key;if(['7','8','9','0'].includes(k)){if(PVP.active&&PVP.phase==='playing'){e.preventDefault();fireV05Taunt(k);}}});

  // Keep the local hit-stop visual-only: simulation and network snapshots continue advancing.
  const _loopDraw=draw;
  let v0603RuntimeFault=null;
  loop=function(t){
    try{
      if(v0603RuntimeFault)return;
      const dt=Math.min(.05,(t-last)/1000)||0;last=t;T+=dt;DBG.frames++;
      if(t-DBG.lastFpsT>500){DBG.fps=DBG.frames*1000/(t-DBG.lastFpsT);DBG.dt=dt*1000;DBG.frames=0;DBG.lastFpsT=t;}
      if(DBG.open){DBG.diagT+=dt;if(DBG.diagT>.25){DBG.diagT=0;tickDbgDiag();}}
      pvpTickCountdown();pvpTickReconnect();
      setMus(mode==='hub'?'hub':mode==='pause'?mus:E.some(e=>e.ty==='b')?'boss':'combat');
      if(mode==='play'){upd(dt);hh-=dt;if(hh<=0){hh=.1;hud();}}
      if(HS>0&&mode==='play'){HS--;}else draw();
    }catch(err){
      v0603RuntimeFault=err;
      const detail=String(err&&err.stack||err&&err.message||err);
      window.__sluggerRuntimeFault=detail;
      console.error('[Slugger runtime fault — v0.6.0.4]',err);
      try{
        mode='pause';
        const pause=$('pauseOverlay');
        if(pause){
          pause.className='ov on';
          pause.innerHTML='<div style="max-width:760px;margin:0 auto;padding:20px"><h2 style="color:#ff668b">GAME PAUSED — INTERNAL ERROR</h2><p>The game detected an unexpected error and paused instead of silently freezing. Copy the diagnostic below when reporting the bug.</p><pre id="sluggerRuntimeFaultText" style="white-space:pre-wrap;text-align:left;overflow-wrap:anywhere;max-height:35vh;overflow:auto"></pre><button onclick="location.reload()">Reload game</button></div>';
          const diagnostic=pause.querySelector('#sluggerRuntimeFaultText');if(diagnostic)diagnostic.textContent=detail;
        }
      }catch(uiErr){console.error('[Slugger] Could not display runtime diagnostic:',uiErr);}
    }finally{
      if(!v0603RuntimeFault)requestAnimationFrame(loop);
    }
  };
  ensureV05Ui();
})();

