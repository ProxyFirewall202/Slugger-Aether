/* Slugger NEO v0.6 Phase 1 — Friends UI, connection diagnostics, developer console, and main hub renderer.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
function netRender(){
  const idb=$('netIdBox');if(idb)idb.textContent=NET.id||'SLUG-????';
  const fl=$('netFriendsList');if(fl)fl.innerHTML=friendListHtml();
  const st=$('netStatus');if(st)st.innerHTML=statusHtml();
  const lg=$('netLog');if(lg){const pid=dmSelected;if(pid){const msgs=NET.msgs.filter(m=>m.sys||m.from===pid||m.to===pid);lg.innerHTML=msgs.slice(-60).map(m=>m.sys?`<div class="cm sys">${esc(m.msg)}</div>`:`<div class=cm><b>${esc(String(m.from||'').replace(/^SLUG-/,''))}</b> ${esc(m.msg)}</div>`).join('');lg.scrollTop=lg.scrollHeight}}
  const actions=$('netDmActions');if(actions&&dmSelected)actions.innerHTML=dmActionsHtml(dmSelected);
  netRenderDiag();
}
function friendListHtml(){
  const keys=Object.keys(NET.friends);
  if(!keys.length)return '<p class=ds>No friends yet. Share your ID and connect.</p>';
  return keys.map(id=>{
    const f=NET.friends[id]||{},c=NET.conns[id];
    const status=(c&&c.open)?(f.status||'ONLINE'):(f.cloud&&f.status&&f.status!=='OFFLINE'?f.status:'OFFLINE');
    const st=status==='IN_LOBBY'||status==='hub'?'lb':status==='IN_MATCH'||status==='game'?'game':status==='IN_GAME'||status==='play'?'on':status==='ONLINE'?'on':'off';
    const label=st==='lb'?'IN LOBBY':st==='game'?'IN MATCH':st==='on'?(f.cloud?'ONLINE':'IN GAME'):'OFFLINE';
    const sel=dmSelected===id?' sel':'';
    return `<div class="fr${sel}" onclick="dmSelect('${id}')"><span class=nm>${esc(f.name||id)}<br><span class=ds>${esc(id)}</span></span><span class="bdg ${st}">${label}</span></div>`;
  }).join('');
}
function statusHtml(){if(NET.err)return `<span class=lock>Signalling error: ${esc(NET.err)}</span>`;if(NET.ready)return `<span class=act>Signalling connected · ID ready</span>`;return `<span class=ds>Connecting to signalling…</span>`}
function t4(){
  const friendCount=Object.keys(NET.friends).filter(id=>NET.conns[id]&&NET.conns[id].open).length;
  const dmp=dmSelected?`<p class=ds>Chatting with <b>${esc(NET.friends[dmSelected]?.name||dmSelected)}</b></p>${dmViewHtml(dmSelected)}`:'<p class=ds>Select a friend from the list to open a DM.</p>';
  return `<div class=g>
    <div class=p><h3>Your Friend ID</h3>
      <div class=idbox id=netIdBox>${NET.id||'SLUG-????'}</div>
      <div class=row>${bt('netCopy()','Copy ID',NET.id?1:0)} <span id=netStatus>${statusHtml()}</span></div>
      <div class=ds style="margin-top:6px">${AUTH.username?`Logged in as <b>${esc(AUTH.username)}</b>${AUTH.guest?' (guest)':''}`:'Guest mode'}</div>
    </div>
    <div class=p><h3>Connect to a friend</h3>
      <input class=nin id=netTarget placeholder="Friend ID (SLUG-XXXX)" maxlength=12 onkeydown="if(event.key==='Enter'){event.preventDefault();netConnect()}">
      ${bt('netConnect()','Connect',NET.ready?1:0)}
      <div class=ds style="margin-top:6px">${friendCount} P2P connected / ${Object.keys(NET.friends).length} saved</div><div class=ds>A successful connection automatically saves each other to your cloud friend lists when both players use username accounts.</div>
    </div>
  </div>
  <div class=p style="margin-top:8px"><h3>Connection mode</h3><div class=row style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span>Current mode: <b id=netModeCurrent>${esc(netModeInfo().label)}</b></span><button id=netModeBtn onclick="netCycleConnectionMode()">${esc(netModeInfo().button)}</button></div><p id=netModeExplain class=ds style="margin:4px 0">${esc(netModeInfo().help)}</p><p class=ds style="margin:4px 0 0">Cycle: Auto → Direct only → TURN relay only. A mode change closes data connections, retires the old PeerJS session, and waits for the Friend ID to be released before reconnecting. Reconnect to friends after signalling returns. Mode changes are blocked during an active 1v1.</p></div>
  <div class=p style="margin-top:8px"><h3>Connection status & diagnostics</h3><div id=netConnectionStatus class="netConnCurrent ${esc(NET.connectionLevel)}">${esc(NET.connectionStatus)}</div><div id=netConnDiag class=netDiag>${NET.diag.slice(-9).map(d=>`<div class="netDiagLine ${esc(d.level)}"><span class=time>${new Date(d.t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>${esc(d.message)}</div>`).join('')||'<div class=ds>No network events yet.</div>'}</div><p class=ds style="margin:5px 0 0">“Signalling connected” means your Friend ID is online. “Direct P2P” or “TURN relay” is reported separately after the peer-to-peer data channel opens.</p></div>
  <div class=g>
    <div class="p dmSidebar"><h3>Friends</h3><div id=netFriendsList>${friendListHtml()}</div></div>
    <div class=p><h3>Direct Message ${dmSelected?`· ${esc(NET.friends[dmSelected]?.name||dmSelected)}`:''}</h3>${dmp}</div>
  </div>`;
}
const DK2='slugger_neo_dbg';
const DBG={open:false,god:false,fps:0,dt:0,frames:0,lastFpsT:0,diagT:0};
try{const p=JSON.parse(localStorage.getItem(DK2)||'{}');if(p&&typeof p.god==='boolean')DBG.god=p.god}catch(e){}
const dbgSave=()=>{try{localStorage.setItem(DK2,JSON.stringify({god:DBG.god}))}catch(e){}};
const fmtB=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(2)+' MB';
function dbgToggle(){DBG.open=!DBG.open;$('dbgPanel').classList.toggle('on',DBG.open);if(DBG.open)buildDbg();SFX.click()}
function dbgGod(v){DBG.god=!!v;dbgSave();if(mode==='play'&&DBG.god)P.hp=ST.mhp;SFX.click()}
function dbgKillAll(){if(mode!=='play')return;for(let i=E.length-1;i>=0;i--)kill(E[i],i);G.q=[];G.dead=G.tot;SFX.boom()}
function dbgCrate(t){if(mode!=='play')return;addCrate(P.x+R(-50,50),P.y+R(-50,50),t,0);SFX.pick()}
function dbgMoney(){S.warp+=10000;fin()}
function dbgMoney2(){S.pro+=50;fin()}
function dbgMoney5(){S.souls+=1000;fin()}
function dbgWarpWave(){if(mode!=='play')return;const sel=$('dbgWave');if(!sel)return;const w=+sel.value;if(!(w>=1&&w<=10))return;E=[];B=[];EB=[];HZ=[];BM=[];TL=[];MS=[];G.q=[];G.w=w-1;nextWave();SFX.tab()}
function buildDbg(){
  const p=$('dbgPanel');if(!p)return;
  p.innerHTML=`<div class=row style="justify-content:space-between"><b style="color:var(--ac);letter-spacing:1px">DEV CONSOLE v0.6 Phase 1</b><button onclick="dbgToggle()">✕</button></div>
    <h3>CHEATS</h3>
    <label><input type="checkbox" id="dbgGodCb" ${DBG.god?'checked':''} onchange="dbgGod(this.checked)"> God Mode</label>
    <div class=row>${bt('dbgKillAll()','Insta-Kill All',mode==='play'?1:0)}</div>
    <h3>Spawn Crate</h3>
    <div class=row>${bt("dbgCrate('wood')",'Wood',mode==='play'?1:0)}${bt("dbgCrate('iron')",'Iron',mode==='play'?1:0)}${bt("dbgCrate('solar')",'Solar',mode==='play'?1:0)}${bt("dbgCrate('vortex')",'Vortex',mode==='play'?1:0)}${bt("dbgCrate('aether')",'Aether',mode==='play'?1:0)}</div>
    <h3>Currency Injector</h3>
    <div class=row>${bt('dbgMoney()','+10k Warp',1)}${bt('dbgMoney2()','+50 Protons',1)}${bt('dbgMoney5()','+1000 Souls',1)}</div>
    <h3>Wave Teleport</h3>
    <div class=row><select id=dbgWave>${Array.from({length:10},(_,i)=>`<option value="${i+1}">Wave ${i+1}${i%5===4?' (Boss)':''}</option>`).join('')}</select>${bt('dbgWarpWave()','Teleport',mode==='play'?1:0)}</div>
    <h3>DIAGNOSTICS</h3><div id=dbgDiag></div>`;
  tickDbgDiag();
}
function tickDbgDiag(){
  const d=$('dbgDiag');if(!d)return;
  const conns=Object.keys(NET.conns).filter(k=>NET.conns[k].open);
  const ping=conns.length?NET.ping+' ms':'—';
  d.innerHTML=`<div class=kv><span>FPS</span><b>${DBG.fps?DBG.fps.toFixed(0):'—'}</b></div>
    <div class=kv><span>Frame Δ</span><b>${DBG.dt?DBG.dt.toFixed(2)+' ms':'—'}</b></div>
    <div class=kv><span>Ping</span><b>${ping}</b></div>
    <div class=kv><span>Packets</span><b>${NET.pktsSent} / ${NET.pktsRecv}</b></div>
    <div class=kv><span>Bytes</span><b>${fmtB(NET.bytesSent)} / ${fmtB(NET.bytesRecv)}</b></div>
    <div class=kv><span>Peers</span><b>${conns.length}</b></div>
    <div class=kv><span>Enemies</span><b>${E.length}</b></div>
    <div class=kv><span>Queue</span><b>${G?G.q.length:0}</b></div>
    <div class=kv><span>Bullets P/E</span><b>${B.length} / ${EB.length}</b></div>
    <div class=kv><span>Particles</span><b>${PT.length}</b></div>
    <div class=kv><span>Pos</span><b>${P.x.toFixed(0)}, ${P.y.toFixed(0)}</b></div>
    <div class=kv><span>HP</span><b>${P.hp.toFixed(0)} / ${ST?ST.mhp.toFixed(0):100}</b></div>
    <div class=kv><span>Mode</span><b>${mode}</b></div>
    <div class=kv><span>PVP</span><b>${PVP.active?PVP.phase+' · '+PVP.role:'—'}</b></div>`;
}
function hub(){
  const o=$('hubOverlay');if(!o){console.error('[Slugger] hubOverlay element is missing');return false;}
  const sc=o.scrollTop;
  try{if(!S||typeof S!=='object')S=DEF();if(typeof normaliseSave==='function')S=normaliseSave(S);}catch(e){console.error('[Slugger] Save normalisation before hub render failed:',e);}
  const authState=typeof AUTH!=='undefined'&&AUTH?AUTH:{user:null,username:null,guest:true};
  const pvpState=typeof PVP!=='undefined'&&PVP?PVP:{active:false,phase:'idle',upgradeDeadline:Date.now(),upgradeReady:false,peerUpgradeReady:false};
  const tabsList=typeof TABS!=='undefined'&&Array.isArray(TABS)?TABS:['Deploys & checkpoints','Crates & Decryption','Skill Tree & Upgrades','Loadout & Sets','Friends & network'];
  if(!Number.isInteger(Number(tab))||Number(tab)<0||Number(tab)>4)tab=0;else tab=Number(tab);
  const rs5=[['Warp','🌀',S?.warp??0,'Earned from kills and cleared waves.'],['Protons','⚛',S?.pro??0,'Used to craft Decryption Keys.'],['Keys','🗝',S?.key??0,'Decrypt crates.'],['Fusion','🔮',S?.fus??0,'Unlock Aether attunement.'],['Souls','👻',S?.souls??0,'Awaken Spirit Slugs.']];
  const inPvpUpgrade=!!(pvpState.active&&pvpState.phase==='upgrade');
  let body='',renderWarning='';
  try{
    let renderer;
    if(inPvpUpgrade){renderer=[t0,t1,t2,t3][Math.max(0,Math.min(3,tab))];}
    else if(pvpState.active){renderer=typeof t4==='function'?t4:null;}
    else renderer=[t0,t1,t2,t3,t4][tab];
    if(typeof renderer!=='function')throw new Error('The selected menu renderer is unavailable (tab '+tab+').');
    body=renderer();
    if(typeof body!=='string')body=String(body??'');
    if(!body.trim())throw new Error('The selected menu renderer returned an empty panel.');
  }catch(e){
    console.error('[Slugger] Menu panel failed to render:',e);
    renderWarning='Menu panel could not render: '+String(e&&e.message||e);
    tab=0;
    try{if(typeof t0==='function')body=t0();}catch(recoveryError){console.error('[Slugger] Fallback deploy menu also failed:',recoveryError);}
    if(!body||!String(body).trim())body=`<div class="p v06-menu-recovery"><h3>Menu failed to load</h3><p class="ds">${esc(renderWarning||'A required game module did not finish loading.')}</p><p class="ds">Try reloading the game. If this keeps happening, share the exact error from the browser console.</p><button onclick="hub()">Retry menu</button> <button onclick="location.reload()">Reload game</button></div>`;
    else body=`<div class="p v06-menu-recovery-note"><b>Menu recovery:</b> ${esc(renderWarning)} Showing Deploys & checkpoints instead.</div>`+body;
  }
  const signBtn=authState.user?`<button onclick="authSignOut()">Sign out (${esc(authState.username||'')})</button>`:'<span class=ds>Guest mode</span>';
  let navHtml='';
  if(inPvpUpgrade)navHtml=`<nav>${tabsList.slice(0,4).map((t,i)=>`<button class="tab${i===tab?' on':''}" onclick="tb(${i})">${['Deploy','Unboxing / Crates','Skill Tree','Equipment & Sets'][i]}</button>`).join('')}</nav>`;
  else if(pvpState.active)navHtml='<nav><button class="tab on" disabled>Direct Messages</button></nav>';
  else navHtml=`<nav>${tabsList.map((t,i)=>`<button class="tab${i===tab?' on':''}" onclick="tb(${i})">${t}</button>`).join('')}</nav>`;
  const statusHtml=inPvpUpgrade?`<div class="v05-upgrade-status" style="margin:8px auto;padding:10px 14px;max-width:1100px;border:1px solid #00ccff66;border-radius:10px;background:#101a2a;color:#d5e8f7;text-align:center;font-family:Orbitron,sans-serif;font-size:12px">UPGRADE WINDOW · <b><span id="v05Timer">${Math.max(0,Math.ceil(((pvpState.upgradeDeadline||Date.now())-Date.now())/1000))}</span>s</b> · <b>${pvpState.upgradeReady?'✓ YOU READY':'YOU NOT READY'}</b> · <b>${pvpState.peerUpgradeReady?'✓ OPPONENT READY':'WAITING FOR OPPONENT'}</b></div>`:'';
  const logHtml=Array.isArray(logs)&&logs.length?`<div class="p log">${logs.map(x=>esc(String(x))).join('<br>')}</div>`:'';
  const footer=pvpState.active?(inPvpUpgrade?'':'<button onclick="returnToV05PvpMenu()">Return to 1v1</button>'):`${signBtn} <button onclick="rs()">Reset save</button>`;
  const versionLabel='<span class=ds>v0.6.0.3 · Phase 1 hotfix · F2 or ~ opens dev console</span>';
  const header=`<div class=hd><svg class=logo viewBox='0 0 380 74'><defs><linearGradient id='lg' x1='0' x2='1'><stop offset='0' stop-color='#00ff88'/><stop offset='1' stop-color='#00ccff'/></linearGradient></defs><text x='190' y='46' text-anchor='middle' font-size='40' font-weight='800' font-family='Orbitron,sans-serif' fill='url(#lg)' stroke='#0a0814' stroke-width='7' paint-order='stroke' stroke-linejoin='round'>SLUGGER <tspan fill='#ff0055'>(NEO)</tspan></text><path class=dr d='M70 52q5 12 0 18q-5-6 0-18' fill='#00ff88' stroke='#0a0814' stroke-width='2'/><path class=dr d='M190 52q5 12 0 18q-5-6 0-18' fill='#00ff88' stroke='#0a0814' stroke-width='2'/><path class=dr d='M300 52q5 12 0 18q-5-6 0-18' fill='#00ff88' stroke='#0a0814' stroke-width='2'/></svg><div class=rs>${rs5.map(r=>`<span class=tt data-tip="${r[3]}"><b>${r[1]} ${r[2]}</b> ${r[0]}</span>`).join('')}</div></div>`;
  let html='';
  try{html=header+navHtml+statusHtml+logHtml+`<div class=tbc>${body}</div><p>${footer} ${versionLabel}</p>`;}
  catch(e){console.error('[Slugger] Menu shell failed to render:',e);html=`<div class="p v06-menu-recovery"><h2>Slugger menu recovery</h2><p class="ds">${esc(String(e&&e.message||e))}</p><button onclick="location.reload()">Reload game</button></div>`;}
  o.innerHTML=html;
  o.className='ov on';
  o.scrollTop=Math.min(sc,o.scrollHeight||sc);
  $('topHUD').innerHTML='';
  if(tab===4&&!pvpState.active){try{netRender();if(typeof dmSelected!=='undefined'&&dmSelected)watchCloudDm(dmSelected)}catch(e){console.error('[Slugger] Social menu refresh failed:',e);const warn=document.createElement('p');warn.className='p lock';warn.textContent='Friends panel could not refresh: '+String(e.message||e);o.querySelector('.tbc')?.prepend(warn)}}
  if(typeof sluggerRefreshMobileControls==='function')sluggerRefreshMobileControls();
  return true;
}
