/* Slugger NEO v0.5.2 — Friend ID, TURN endpoint loading, mode policy, PeerJS lifecycle, signalling, and route inspection.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
function genId(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];const id='SLUG-'+s;try{localStorage.setItem(PK,id)}catch(e){}return id}
function loadId(){try{const v=localStorage.getItem(PK);if(v&&/^SLUG-[A-Z0-9]{4}$/.test(v))return v}catch(e){}return genId()}
/* TURN configuration is served by your permanently deployed Cloudflare Worker.
   Set this endpoint ONCE after deploying the Worker, then keep it unchanged in future game releases.
   Metered API key stays server-side as a Cloudflare Worker Secret. Do not put it in this HTML.
   Browser clients must receive temporary TURN username/password data for WebRTC; the API key is not sent. */
const TURN_CREDENTIALS_ENDPOINT='https://slugger-turn-ice.tholloway540.workers.dev/ice-servers';
function isTurnEndpointConfigured(){
  const value=String(TURN_CREDENTIALS_ENDPOINT||'').trim();
  return /^https:\/\//i.test(value)&&/\/ice-servers(?:[?#].*)?$/i.test(value)&&!/(SET-YOUR|YOUR-WORKER|YOUR-SUBDOMAIN|REPLACE-ME)/i.test(value);
}
let NET_INIT_SEQ=0,NET_RESTART_TIMER=null;
const NET_MODE_STORE='slugger_neo_connection_mode_v1';
const NET_MODE_ORDER=['auto','direct','relay'];
const NET_MODE_INFO={
  auto:{label:'AUTO',button:'Switch to Direct only',help:'Automatic ICE: direct/STUN candidates are preferred when viable; TURN relay candidates are available as fallback.'},
  direct:{label:'DIRECT ONLY',button:'Switch to TURN relay only',help:'Direct-only mode: STUN is allowed, TURN relay candidates are disabled. This is useful for testing a direct route.'},
  relay:{label:'TURN RELAY ONLY',button:'Switch to Auto',help:'Relay-only mode: requires valid TURN credentials and forces ICE to use relay candidates. Higher latency is possible.'}
};
function loadConnectionMode(){try{const m=localStorage.getItem(NET_MODE_STORE);if(NET_MODE_ORDER.includes(m))return m}catch(e){}return 'auto'}
let NET_CONNECTION_MODE=loadConnectionMode(),NET_MODE_RESTARTING=false,NET_MODE_RESTART_RETRIES=0;
function netModeInfo(m=NET_CONNECTION_MODE){return NET_MODE_INFO[m]||NET_MODE_INFO.auto}
function filterIceServers(servers,kind){
  const re=kind==='turn'?/^turns?:/i:/^stuns?:/i;
  const out=[];
  for(const server of (Array.isArray(servers)?servers:[])){
    const raw=Array.isArray(server?.urls)?server.urls:[server?.urls];
    const urls=raw.filter(u=>typeof u==='string'&&re.test(u));
    if(urls.length)out.push({...server,urls:Array.isArray(server.urls)?urls:urls[0]});
  }
  return out;
}
function netCycleConnectionMode(){
  if(PVP.active){netDiag('Connection mode cannot be changed during an active 1v1. Finish the match first.','warn');return}
  const live=Object.values(NET.conns).some(c=>c&&c.open),pending=Object.keys(NET.pendingConnections).length>0;
  if((live||pending)&&!confirm('Switching connection mode restarts PeerJS and closes current data connections. Your Friend ID should stay the same, but you will need to press Connect again. Continue?'))return;
  const idx=NET_MODE_ORDER.indexOf(NET_CONNECTION_MODE),next=NET_MODE_ORDER[(idx+1)%NET_MODE_ORDER.length];
  NET_CONNECTION_MODE=next;try{localStorage.setItem(NET_MODE_STORE,next)}catch(e){}
  for(const pid of Object.keys(NET.pendingConnections)){const p=NET.pendingConnections[pid];if(p?.timer)clearTimeout(p.timer);delete NET.pendingConnections[pid];try{if(p?.conn&&!p.conn.open)p.conn.close()}catch(e){}}
  for(const pid of Object.keys(NET.conns)){const c=NET.conns[pid];delete NET.conns[pid];if(NET.friends[pid])NET.friends[pid].status='OFFLINE';try{if(c)c.close()}catch(e){}}
  NET.routeReported={};NET_MODE_RESTARTING=true;NET_MODE_RESTART_RETRIES=0;
  netSchedulePeerRestart(2300,'Connection mode changed to '+netModeInfo().label+'. Retiring the old PeerJS session before reclaiming your Friend ID; reconnect to friends after signalling returns.');
}
const NET={peer:null,id:null,conns:{},friends:{},msgs:[],ready:false,err:null,bytesSent:0,bytesRecv:0,pktsSent:0,pktsRecv:0,ping:0,turnStatus:'Preparing ICE configuration…',diag:[],connectionStatus:'Waiting for the signalling service…',connectionLevel:'info',pendingConnections:{},routeReported:{}};
// PeerJS emits "disconnected" during destroy(), before setting peer.destroyed=true.
// Detach NET.peer BEFORE destroying it, otherwise the old disconnected handler can
// call reconnect() on the instance being retired and race the new instance for the same ID.
function netSchedulePeerRestart(delayMs,message){
  if(NET_RESTART_TIMER){clearTimeout(NET_RESTART_TIMER);NET_RESTART_TIMER=null;}
  const oldPeer=NET.peer;
  NET.peer=null; // IMPORTANT: make old event handlers inert before destroy emits "disconnected".
  NET_INIT_SEQ++;
  NET.ready=false;NET.err=null;
  NET.turnStatus='Waiting for PeerJS to release your Friend ID…';
  if(oldPeer){try{oldPeer.destroy()}catch(e){netDiag('Error while retiring previous PeerJS instance: '+String(e.message||e),'warn')}}
  const scheduledSeq=NET_INIT_SEQ;
  netDiag(message+' Waiting '+Math.ceil(Math.max(1500,Number(delayMs)||2300)/1000)+'s before restarting signalling.','warn');
  NET_RESTART_TIMER=setTimeout(()=>{
    if(NET_INIT_SEQ!==scheduledSeq)return;
    NET_RESTART_TIMER=null;
    netInit(false);
  },Math.max(1500,Number(delayMs)||2300));
  netRender();
}
function netDiag(message,level='info'){
  const safe=String(message||'').replace(/(?:apiKey=)[^\s&]+/ig,'apiKey=[redacted]').slice(0,260);
  NET.diag.push({t:Date.now(),message:safe,level});if(NET.diag.length>18)NET.diag.splice(0,NET.diag.length-18);
  NET.connectionStatus=safe;NET.connectionLevel=level;
  try{const fn=level==='error'?'error':level==='warn'?'warn':'info';console[fn]('[Slugger network]',safe)}catch(e){}
  netRenderDiag();
}
function netRenderDiag(){
  const modeCurrent=$('netModeCurrent');if(modeCurrent)modeCurrent.textContent=netModeInfo().label;
  const modeButton=$('netModeBtn');if(modeButton)modeButton.textContent=netModeInfo().button;
  const modeExplain=$('netModeExplain');if(modeExplain)modeExplain.textContent=netModeInfo().help;
  if(modeButton)modeButton.disabled=!!PVP.active;
  const log=$('netConnDiag');if(log)log.innerHTML=NET.diag.slice(-9).map(d=>`<div class="netDiagLine ${esc(d.level)}"><span class=time>${new Date(d.t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>${esc(d.message)}</div>`).join('')||'<div class=ds>No network events yet.</div>';
  const current=$('netConnectionStatus');if(current){current.className='netConnCurrent '+esc(NET.connectionLevel);current.textContent=NET.connectionStatus||'Waiting for a connection attempt.'}
}
function netClearPending(pid){const a=NET.pendingConnections[pid];if(a&&a.timer)clearTimeout(a.timer);delete NET.pendingConnections[pid]}
function netFailPending(pid,conn,message){const a=NET.pendingConnections[pid];if(a){if(a.timer)clearTimeout(a.timer);delete NET.pendingConnections[pid]}if(conn&&!conn.open){try{conn.close()}catch(e){}}netDiag(message,'error');netSys(message);netRender()}
async function fetchMeteredIceServers(){
  if(!isTurnEndpointConfigured())return null;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch(TURN_CREDENTIALS_ENDPOINT,{cache:'no-store',credentials:'omit',signal:controller.signal,headers:{'Accept':'application/json'}});
    if(!response.ok)throw new Error('TURN configuration endpoint returned HTTP '+response.status);
    const servers=await response.json();
    const hasTurn=Array.isArray(servers)&&servers.some(server=>{const urls=Array.isArray(server?.urls)?server.urls:[server?.urls];return urls.some(u=>typeof u==='string'&&/^turns?:/i.test(u))});
    if(!hasTurn)throw new Error('Metered response contained no TURN servers');
    // Preserve the familiar public STUN path even if the Metered array changes.
    const merged=[{urls:'stun:stun.l.google.com:19302'},...servers];
    const seen=new Set();return merged.filter(server=>{const urls=Array.isArray(server.urls)?server.urls:[server.urls];const key=JSON.stringify({urls,username:server.username||'',credential:server.credential||''});if(seen.has(key))return false;seen.add(key);return true});
  }finally{clearTimeout(timer)}
}
function netLoadFriends(){try{NET.friends=JSON.parse(localStorage.getItem(FK)||'{}')}catch(e){NET.friends={}}}
function netSaveFriends(){try{localStorage.setItem(FK,JSON.stringify(NET.friends))}catch(e){}}
function pvpBeginReconnect(pid){if(!PVP.active||pid!==PVP.opponent||PVP.finished||PVP.phase==='reconnecting')return;PVP.reconnectPhase=PVP.phase;PVP.phase='reconnecting';PVP.reconnectDeadline=Date.now()+15000;mode='pause';$('pauseOverlay').className='ov on';$('pauseOverlay').innerHTML=`<h2>Connection Lost</h2><p>Reconnecting to ${esc(pid)}…</p><h3 id="pvpReconnectTimer">15</h3><p class=ds>Reconnect from the Friends tab within 15 seconds to resume.</p><button onclick="netConnect('${esc(pid)}')">Reconnect now</button>`;}
function pvpResumeConnection(pid){if(!PVP.active||pid!==PVP.opponent||PVP.phase!=='reconnecting')return;PVP.reconnectDeadline=0;PVP.phase=PVP.reconnectPhase||'playing';PVP.reconnectPhase=null;mode=PVP.phase==='playing'?'play':PVP.phase==='pause'?'pause':'hub';$('pauseOverlay').innerHTML=PVP.pauseHtml||'<h2>Paused</h2><button onclick="pz()">Resume (Esc)</button><button onclick="endRun(false)">Abandon run</button>';$('pauseOverlay').className=mode==='pause'?'ov on':'ov';netSend(pid,{type:'pvp_resume',matchId:PVP.matchId,phase:PVP.phase,seed:PVP.seed});netSys('Connection restored; match resumed.');}
function pvpTickReconnect(){if(PVP.phase!=='reconnecting'||!PVP.reconnectDeadline)return;const left=Math.max(0,Math.ceil((PVP.reconnectDeadline-Date.now())/1000)),el=$('pvpReconnectTimer');if(el)el.textContent=left;if(left<=0){PVP.reconnectDeadline=0;if(PVP.role==='host'){endPvp('host','disconnect',{reason:'reconnect-timeout',graceMs:15000});}else{PVP.noReward=false;endPvp('guest','disconnect',{reason:'host-reconnect-timeout',graceMs:15000,opponentRole:'host'});}}}
function sendPvpStatus(){const modeName=PVP.active?'game':mode==='hub'?'hub':mode==='pause'?'pause':'play';netBroadcast({type:'status',mode:modeName,at:P.at||'neutral',t:Date.now()});}
async function netInit(newId){
  if(NET_RESTART_TIMER){clearTimeout(NET_RESTART_TIMER);NET_RESTART_TIMER=null;}
  const initSeq=++NET_INIT_SEQ;
  NET.err=null;NET.ready=false;NET.turnStatus='Loading network configuration for '+netModeInfo().label+' mode…';
  if(NET.peer){const previousPeer=NET.peer;NET.peer=null;try{previousPeer.destroy()}catch(e){}}
  if(typeof Peer==='undefined'){NET.err='PeerJS not loaded';netDiag('PeerJS library did not load. Check whether this network blocks the CDN.','error');netRender();return}
  if(newId)NET.id=genId();else if(!NET.id)NET.id=loadId();
  let peerOptions={debug:2},iceServers=null;
  if(isTurnEndpointConfigured()){
    NET.turnStatus='Loading ICE servers from the configured Worker for '+netModeInfo().label+' mode…';netDiag('Loading ICE server configuration from the configured Worker for '+netModeInfo().label+' mode.');netRender();
    try{
      iceServers=await fetchMeteredIceServers();if(initSeq!==NET_INIT_SEQ)return;
      if(iceServers){NET.turnStatus='TURN servers loaded through the Worker.';netDiag('TURN ICE server list loaded successfully through the Worker.','success')}
    }catch(e){if(initSeq!==NET_INIT_SEQ)return;const reason=e.name==='AbortError'?'request timed out':String(e.message||e).slice(0,100);NET.turnStatus='TURN configuration unavailable; applying '+netModeInfo().label+' policy.';netDiag('TURN Worker fetch failed ('+reason+'). Applying the selected connection mode anyway.','warn');console.warn('Slugger TURN setup unavailable:',reason)}
  }else{
    NET.turnStatus='TURN Worker endpoint is not configured.';
    netDiag('TURN_CREDENTIALS_ENDPOINT has not been set to your deployed Worker URL. Direct connectivity may still work, but custom TURN fallback is not active.','warn');
  }
  if(initSeq!==NET_INIT_SEQ)return;
  const modeAtStart=NET_CONNECTION_MODE;
  const stunOnly=filterIceServers(iceServers||[], 'stun');
  const turnOnly=filterIceServers(iceServers||[], 'turn');
  if(modeAtStart==='auto'){
    if(iceServers){peerOptions.config={iceServers,iceTransportPolicy:'all',sdpSemantics:'unified-plan'};NET.turnStatus='AUTO mode: direct preferred when viable; TURN relay candidates available.';netDiag('AUTO mode selected: all configured ICE candidates enabled; WebRTC normally prefers a viable direct path and can select TURN relay candidates.','success')}
    else{NET.turnStatus='AUTO mode: PeerJS default ICE; Metered TURN not loaded.';netDiag('AUTO mode uses PeerJS default ICE because Metered TURN configuration is unavailable. Direct connectivity may work, but custom TURN fallback is not active.','warn')}
  }else if(modeAtStart==='direct'){
    const directServers=stunOnly.length?stunOnly:[{urls:'stun:stun.l.google.com:19302'}];
    peerOptions.config={iceServers:directServers,iceTransportPolicy:'all',sdpSemantics:'unified-plan'};
    NET.turnStatus='DIRECT ONLY mode: STUN allowed, TURN disabled.';netDiag('DIRECT ONLY mode selected: host/STUN candidates only; TURN relay candidates are disabled.','warn');
  }else{
    peerOptions.config={iceServers:turnOnly,iceTransportPolicy:'relay',sdpSemantics:'unified-plan'};
    if(turnOnly.length){NET.turnStatus='TURN RELAY ONLY mode: relay candidates forced.';netDiag('TURN RELAY ONLY mode selected: ICE policy is relay-only ('+turnOnly.length+' TURN server entries).','warn')}
    else{NET.turnStatus='TURN RELAY ONLY unavailable: valid TURN credentials required.';netDiag('TURN RELAY ONLY selected, but no usable TURN servers were loaded. Connections will fail until Metered configuration is corrected.','error')}
  }
  if(initSeq!==NET_INIT_SEQ)return;
  try{NET.peer=new Peer(NET.id,peerOptions)}catch(e){NET.err=e.message||'init error';netDiag('Could not create PeerJS: '+NET.err,'error');netRender();return}
  const peer=NET.peer;
  peer.on('open',id=>{if(NET.peer!==peer)return;NET.id=id;NET.ready=true;NET.err=null;NET_MODE_RESTARTING=false;NET_MODE_RESTART_RETRIES=0;netDiag('Signalling connected in '+netModeInfo().label+' mode. Your Friend ID is '+id+'; waiting for a peer-to-peer data connection.','success');if(AUTH.user&&!AUTH.guest&&fbDb)fbDb.collection('users').doc(AUTH.user.uid).set({slugId:id},{merge:true}).catch(e=>console.warn('Slug ID profile update failed:',e));netRender()});
  peer.on('error',e=>{
    if(NET.peer!==peer)return;
    if(e.type==='unavailable-id'){
      if(NET_MODE_RESTARTING&&NET_MODE_RESTART_RETRIES<3){
        const retry=++NET_MODE_RESTART_RETRIES,wait=4000+retry*2000;
        netSchedulePeerRestart(wait,'PeerJS reports that your Friend ID is still reserved after the mode change; retry '+retry+'/3 scheduled for the same ID.');return;
      }
      if(NET_MODE_RESTARTING){NET_MODE_RESTARTING=false;NET.err='Friend ID temporarily unavailable';NET.ready=false;if(NET.peer===peer)NET.peer=null;netDiag('Could not reacquire the same Friend ID after three delayed retries. The saved ID is unchanged; wait a little longer and switch mode once to retry.','error');netRender();return;}
      NET.id=null;try{localStorage.removeItem(PK)}catch(x){}netDiag('Friend ID was already in use; generating a new ID.','warn');netInit(true);return;
    }
    const type=String(e.type||'error'),msg=String(e.message||'');
    if(type==='peer-unavailable'){
      const ids=Object.keys(NET.pendingConnections);const target=ids.find(pid=>!msg||msg.includes(pid))||ids[0];
      if(target){netFailPending(target,NET.pendingConnections[target]?.conn,'Friend '+target+' is unavailable or offline. Confirm their ID and ask them to keep the game open.');return}
      netDiag('PeerJS could not find the requested peer: '+msg,'error');netRender();return;
    }
    const fatal=['network','server-error','socket-error','socket-closed','browser-incompatible','ssl-unavailable','invalid-id','invalid-key','disconnected'].includes(type);
    if(fatal){NET.err=type+': '+msg;NET.ready=false;netDiag('PeerJS signalling error ('+type+'): '+msg,'error')}
    else{netDiag('PeerJS network warning ('+type+'): '+msg,'warn')}
    netRender();
  });
  peer.on('connection',c=>{if(NET.peer===peer){netDiag('Incoming WebRTC connection request from '+c.peer+' using '+netModeInfo().label+' mode.','info');netAccept(c)}});
  peer.on('disconnected',()=>{if(NET.peer===peer&&!peer.destroyed){netDiag('PeerJS signalling disconnected; attempting to restore signalling.','warn');try{peer.reconnect()}catch(e){netDiag('Signalling reconnect failed: '+String(e.message||e),'error')}}});
}
function netAccept(c){
  if(!c)return;
  const pid=c.peer;
  c.on('iceStateChanged',state=>{
    if(state==='checking')netDiag('ICE is checking candidate pairs for '+pid+' under '+netModeInfo().label+' mode.');
    else if(state==='connected'||state==='completed')netDiag('ICE transport established with '+pid+'; identifying the selected route…','success');
    else if(state==='disconnected')netDiag('ICE temporarily disconnected from '+pid+'; browser is attempting recovery.','warn');
    else if(state==='failed')netDiag('ICE failed for '+pid+' under '+netModeInfo().label+' mode: no allowed candidate pair could connect. Check both clients’ selected modes, network restrictions, and TURN configuration.','error');
    else if(state==='closed')netDiag('ICE transport closed for '+pid+'.','warn');
  });
  c.on('open',()=>{
    netClearPending(pid);
    const previous=NET.conns[pid];if(previous&&previous!==c&&previous.open){try{previous.close()}catch(e){}}NET.conns[pid]=c;
    if(PVP.active&&PVP.role==='host'&&PVP.finished&&PVP.resultPacket&&PVP.opponent===pid)netSend(pid,PVP.resultPacket);else pvpResumeConnection(pid);
    if(!NET.friends[pid])NET.friends[pid]={name:pid.replace(/^SLUG-/,''),status:'hub',added:Date.now()};
    netSaveFriends();netDiag('Peer-to-peer data channel CONNECTED to '+pid+'. Checking whether the active route is direct or relayed…','success');netSys('Connected to '+pid);
    netSend(pid,{type:'hello',name:AUTH.username||'SLUG'});
    netSend(pid,{type:'status',mode:mode==='hub'?'hub':(PVP.active?'game':'play'),at:P.at||'neutral'});
    if(NET.pendingCloudInvite&&NET.pendingCloudInvite.pid===pid){const inv=NET.pendingCloudInvite;NET.pendingCloudInvite=null;enterPvpLobby('guest',pid,inv.target);netSend(pid,{type:'pvp_accept',target:inv.target});}
    netRender();setTimeout(()=>netInspectRoute(pid,c,0),450);
  });
  c.on('data',d=>netData(pid,d));
  c.on('close',()=>{
    const wasCurrent=NET.conns[pid]===c;
    if(wasCurrent){delete NET.conns[pid];if(NET.friends[pid])NET.friends[pid].status='OFFLINE';netSaveFriends();netDiag('Peer-to-peer data channel closed with '+pid+'.','warn');netSys('Disconnected '+pid);if(PVP.active&&PVP.opponent===pid&&!PVP.finished){if(['playing','countdown','sync','reconnecting','roundSummary','upgrade','waveSelect'].includes(PVP.phase)){netSys('Opponent connection lost — 15-second reconnect window started');pvpBeginReconnect(pid)}else{netSys('Opponent disconnected from the lobby.');cleanupPvp();if(mode!=='hub'){mode='hub';hub()}}}netRender();}
    const pending=NET.pendingConnections[pid];if(pending&&pending.conn===c)netFailPending(pid,c,'Connection to '+pid+' closed before it was established.');
  });
  c.on('error',err=>{
    const errType=String(err&&err.type||'data-connection-error');
    const pending=NET.pendingConnections[pid];if(pending&&pending.conn===c){netFailPending(pid,c,'Connection to '+pid+' failed ('+errType+'): '+String(err&&err.message||'WebRTC error'));return;}
    const wasCurrent=NET.conns[pid]===c;
    netDiag('Connection error with '+pid+' ('+errType+'): '+String(err&&err.message||'WebRTC error'),'error');
    if(wasCurrent){delete NET.conns[pid];if(NET.friends[pid])NET.friends[pid].status='OFFLINE';netSaveFriends();netRender();if(PVP.active&&PVP.opponent===pid&&!PVP.finished){if(['playing','countdown','sync','reconnecting','roundSummary','upgrade','waveSelect'].includes(PVP.phase))pvpBeginReconnect(pid);else{cleanupPvp();if(mode!=='hub'){mode='hub';hub()}}}}
  });
}
async function netInspectRoute(pid,conn,retry){
  if(!conn||NET.conns[pid]!==conn||!conn.open)return;
  const pc=conn.peerConnection;
  if(!pc||typeof pc.getStats!=='function'){
    if(retry<2){setTimeout(()=>netInspectRoute(pid,conn,retry+1),900);return}
    netDiag('Connected to '+pid+'; this browser did not expose route details, so direct-vs-relay cannot be confirmed.','warn');return;
  }
  try{
    const report=await pc.getStats(),items=[];report.forEach(v=>items.push(v));
    const byId=new Map(items.filter(v=>v.id).map(v=>[v.id,v]));let pair=null;
    for(const stat of items){if(stat.type==='transport'&&stat.selectedCandidatePairId){pair=byId.get(stat.selectedCandidatePairId);if(pair)break}}
    if(!pair)pair=items.find(v=>v.type==='candidate-pair'&&v.state==='succeeded'&&(v.selected===true||v.nominated===true));
    if(!pair&&retry<3){setTimeout(()=>netInspectRoute(pid,conn,retry+1),900);return}
    if(pair){const local=byId.get(pair.localCandidateId),remote=byId.get(pair.remoteCandidateId),lt=String(local&&local.candidateType||''),rt=String(remote&&remote.candidateType||'');
      if(lt||rt){const relayed=lt==='relay'||rt==='relay';const desc=relayed?'TURN RELAY ACTIVE':'DIRECT P2P ACTIVE (no TURN relay)';const detail=`${desc} with ${pid}${lt||rt?' — local '+(lt||'unknown')+', remote '+(rt||'unknown'):''}`;NET.routeReported[pid]=conn;netDiag(detail,relayed?'success':'success');return;}
    }
    if(retry<3){setTimeout(()=>netInspectRoute(pid,conn,retry+1),900);return}
    netDiag('Connected to '+pid+'; selected network route is active but candidate details are unavailable in this browser.','warn');
  }catch(e){if(retry<2){setTimeout(()=>netInspectRoute(pid,conn,retry+1),900);return}netDiag('Connected to '+pid+'; route diagnostics were unavailable ('+String(e.message||'getStats failed')+').','warn')}
}
function netSend(pid,obj){const c=NET.conns[pid];if(!c||!c.open)return false;try{c.send(obj);NET.pktsSent++;NET.bytesSent+=(JSON.stringify(obj)||'').length;return true}catch(e){return false}}
function netBroadcast(obj){Object.keys(NET.conns).forEach(k=>netSend(k,obj))}
