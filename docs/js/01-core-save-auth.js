/* Slugger NEO v0.6 Phase 1 — Core constants, save normalisation/merging, authentication, and cloud persistence.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */

const W=960,H=600,cv=document.getElementById('gameCanvas'),cx=cv.getContext('2d'),$=i=>document.getElementById(i);cv.width=W;cv.height=H;
let deterministicRandom=null;const R=(a,b)=>a+(deterministicRandom?deterministicRandom():Math.random())*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const EC={neutral:'#e8f0ff',fire:'#ff5a1f',ice:'#00ccff',solar:'#ffcc00',vortex:'#aa00ff',aether:'#ff0055',void:'#ff0055'},CC={wood:'#c8884a',iron:'#9fb0c8',solar:'#ffcc00',vortex:'#aa00ff',aether:'#ff0055'};
const EN={neutral:'Neutral',fire:'Fire',ice:'Ice',solar:'Solar',vortex:'Vortex',aether:'Aether',void:'Void'},EL6=['neutral','fire','ice','solar','vortex','aether'],HK={1:'neutral',2:'fire',3:'ice',4:'solar',5:'vortex',6:'aether'};
const OPP={fire:'ice',ice:'fire',solar:'vortex',vortex:'solar'},REC={fire:'ice',ice:'fire',solar:'vortex',vortex:'solar',void:'aether'},BP={wood:150,iron:600};
const emul=(a,t)=>a==='aether'?(t==='void'?2:1):a==='neutral'?1:a===t?.7:OPP[a]===t?1.5*(1+.1*S.up.amp):1;
const WV=[['Garden Pests','neutral'],['Infernal Magmals','fire'],['Frost Cryos','ice'],['Pyre Fiends','fire'],['Frost Monarch Phase','ice'],['Solar Strikers','solar'],['Vortex Wraiths','vortex'],['Solar Overlords','solar'],['Void Dreadnoughts','vortex'],['Aether Monarch Final Phase','void']];
const CT=['wood','wood','iron','iron','iron','solar','vortex','solar','vortex','aether'];
const IT={
blaster:{n:'Basic Blaster',t:'w',d:10,r:.28,tier:0,ds:'Steady single shots.'},
spud:{n:'Spud Scattergun',t:'w',d:6,r:.22,k:3,sp:.28,tier:1,ds:'Three-pellet spread.'},
zippy:{n:'Zippy Zapper',t:'w',d:7,r:.12,tier:1,ds:'Very fast, light hits.'},
solarc:{n:'Solar Cannon',t:'w',d:26,r:.5,pi:3,set:'solar',tier:2,ds:'Heavy piercing shots.'},
vortb:{n:'Vortex Beam',t:'w',d:7,r:.11,set:'vortex',tier:2,ds:'Rapid void bolts.'},
aethl:{n:'Aether Lance',t:'w',d:32,r:.34,pi:5,set:'aether',tier:3,ds:'Piercing divine lance.'},
pyre:{n:'Pyre Blaster',t:'w',el:'fire',d:17,r:.23,set:'fire',tier:2,ds:'Flame rounds; part of the Pyre set.'},
glacial:{n:'Glacial Repeater',t:'w',el:'ice',d:13,r:.16,set:'ice',tier:2,ds:'Rapid frost rounds; part of the Cryo set.'},
voidl:{n:'Void Edge',t:'w',el:'vortex',d:20,r:.28,set:'void',tier:3,ds:'Rift-piercing shots; part of the Void set.'},
salt:{n:'Soggy Salt Shield',t:'s',side:0,tier:0,ds:'Blocks shots from the front.'},
rind:{n:'Rearguard Rind',t:'s',side:Math.PI,tier:1,ds:'Blocks shots from behind.'},
aegis:{n:'Solar Aegis',t:'s',side:0,set:'solar',tier:2,ds:'Front shield.'},
buck:{n:'Void Buckler',t:'s',side:Math.PI,set:'vortex',tier:2,ds:'Rear shield.'},
divs:{n:'Divine Bulwark',t:'s',side:0,set:'aether',tier:3,ds:'Front shield.'},
flguard:{n:'Pyreguard',t:'s',side:0,set:'fire',tier:2,ds:'Fire-set frontal shield.'},
iceward:{n:'Permafrost Ward',t:'s',side:0,set:'ice',tier:2,ds:'Ice-set frontal shield.'},
voidward:{n:'Rift Buckler',t:'s',side:Math.PI,set:'void',tier:3,ds:'Void-set rear shield.'},
jerk:{n:'Slimy Jerkin',t:'a',dr:.08,hp:10,tier:0,ds:'8% less damage, +10 HP.'},
chit:{n:'Chitin Chestpiece',t:'a',dr:.15,hp:20,tier:1,ds:'15% less damage, +20 HP.'},
solp:{n:'Solar Plate',t:'a',dr:.2,hp:30,set:'solar',tier:2,ds:'20% less damage, +30 HP.'},
voidm:{n:'Void Mantle',t:'a',dr:.2,hp:30,set:'vortex',tier:2,ds:'20% less damage, +30 HP.'},
halo:{n:'Halo Plate',t:'a',dr:.25,hp:40,set:'aether',tier:3,ds:'25% less damage, +40 HP.'},
pyreplate:{n:'Scoria Plate',t:'a',dr:.18,hp:25,set:'fire',tier:2,ds:'Fire-set armour.'},
cryoplate:{n:'Cryo Carapace',t:'a',dr:.22,hp:25,set:'ice',tier:2,ds:'Ice-set armour.'},
eclipse:{n:'Eclipse Mantle',t:'a',dr:.24,hp:35,set:'void',tier:3,ds:'Void-set armour.'},
magn:{n:'Magnet Charm',t:'c',tier:1,ds:'Pickups fly to you from afar.'},
rotc:{n:'Rotten Capsules',t:'c',tier:1,ds:'+25% damage dealt and taken.'},
sera:{n:'Seraph Charm',t:'c',set:'aether',tier:3,ds:'Aether set charm.'},
embercore:{n:'Cinder Core',t:'c',set:'fire',tier:2,ds:'Pyre set boost charm.'},
frostsigil:{n:'Frost Sigil',t:'c',set:'ice',tier:2,ds:'Cryo set boost charm.'},
umbra:{n:'Umbra Charm',t:'c',set:'void',tier:3,ds:'Void set boost charm.'},
pip:{n:'Pip Slug',t:'p',k:.35,r:.55,sc:60,tier:1,ds:'Tiny drone, steady shots.'},
bolt:{n:'Bolt Slug',t:'p',k:.6,r:.45,sc:150,tier:2,ds:'Faster, harder drone.'},
aesl:{n:'Aether Slug',t:'p',k:1.1,r:.35,pi:3,sc:300,tier:3,ds:'Piercing divine drone.'}};
const SETS={fire:{n:'Pyre',need:3,b2:'+10% fire damage while attuned to Fire',b:'A damaging fire aura while attuned to Fire.'},ice:{n:'Cryo',need:3,b2:'+15% damage reduction',b:'Cryo plating slows hazards and reduces incoming damage.'},solar:{n:'Solar Flare',need:3,b2:'+10% damage',b:'Scorching aura and the Solar Cataclysm special.'},vortex:{n:'Vortex Void',need:3,b2:'+10% thrust',b:'Black-hole special that drags small foes.'},void:{n:'Void Rift',need:3,b2:'+20% Vortex damage',b:'Rift pulse pulls nearby enemies and improves Vortex shots.'},aether:{n:'Aether Divine',need:4,b2:'+10% max HP',b:'Damage taken becomes empowered ammo (+60% shot damage). Hazard immunity applies once hazards exist.'}},SN={w:'Weapon',s:'Shield',a:'Armor',c:'Boost / Charm',p:'Spirit'};
const SK='slugger_neo_v0.2-alpha',SAVE_OWNER_KEY='slugger_neo_save_owner_v054',saveScopedKey=owner=>SK+':'+String(owner||'guest'),DEF=()=>({warp:0,pro:0,key:3,fus:0,souls:0,cr:{wood:0,iron:0,solar:0,vortex:0,aether:0},inv:{blaster:{d:0}},eq:{w:'blaster',s:null,a:null,c:null,p:null},aw:{},att:['neutral'],up:{hp:0,oc:0,thr:0,slime:0,amp:0},cp:[1],rec:{},hi:0,lastSaveTimestamp:Date.now()});
let S;try{S=normaliseSave(JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){S=DEF()}
const V05_SESSION_KEY='slugger_neo_save_1v1_v05';let save_sp=S,save_1v1=null,activeSaveMode='sp';
const firebaseConfig={apiKey:"AIzaSyAu7prBgEdGWbPY8u8g2CYCJbHjz2fLTl4",authDomain:"slugger-aether.firebaseapp.com",projectId:"slugger-aether",storageBucket:"slugger-aether.firebasestorage.app",messagingSenderId:"156152123566",appId:"1:156152123566:web:22cc7d829fa41ecd615d3f",measurementId:"G-TDDDMFNKZ9"};
const FIREBASE_CONFIG_ATTEMPTED=!!firebaseConfig.apiKey&&!firebaseConfig.apiKey.startsWith('YOUR_');
let FIREBASE_CONFIGURED=false,fbAuth=null,fbDb=null;
if(FIREBASE_CONFIG_ATTEMPTED&&typeof firebase!=='undefined'){try{firebase.initializeApp(firebaseConfig);fbAuth=firebase.auth();fbDb=firebase.firestore();FIREBASE_CONFIGURED=!!fbAuth&&!!fbDb}catch(e){console.warn('Firebase init failed:',e)}}
const GUEST_MODE_KEY='slugger_neo_guest_mode';
let persistedGuestMode=false;try{persistedGuestMode=localStorage.getItem(GUEST_MODE_KEY)==='1'}catch(e){}
const AUTH={user:null,username:persistedGuestMode?'Guest':null,guest:persistedGuestMode,mode:'login',observerStarted:false};
let authStateUnsub=null, cloudGeneration=0, presenceTimer=null, presenceUnsub=null, cloudProfileUnsub=null, cloudRequestUnsub=null, cloudDmUnsubs={}, cloudPresenceUnsubs=[], cloudDmSeen=new Set(), cloudUidBySlug={}, cloudFriends=[],cloudSocialUidStarted=null;
const USERNAME_AUTH_ENDPOINT='https://slugger-turn-ice.tholloway540.workers.dev/username-token';
const USERNAME_REGISTER_ENDPOINT='https://slugger-turn-ice.tholloway540.workers.dev/username-register';
let pendingUsernameAuth=null,accountHydrationUid=null,accountHydrationPromise=null,legacyFriendCacheMigrationUid=null;
function cleanUsernameInput(raw){return String(raw||'').normalize('NFKC').trim().replace(/\s+/gu,' ')}
function newAccountFriendIdCandidate(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='SLUG-';for(let i=0;i<4;i++)out+=alphabet[Math.floor(Math.random()*alphabet.length)];return out}
function authTab(mode){AUTH.mode='username';if($('authError'))$('authError').textContent='';}
async function setStableAccountFriendId(slugId){
  if(!/^SLUG-[A-Z0-9]{4}$/.test(String(slugId||'')))throw new Error('Cloud account has an invalid Friend ID. Contact the game maintainer.');
  const target=String(slugId),current=String(NET.id||'');
  NET.accountIdLocked=true;
  try{localStorage.setItem(PK,target)}catch(e){}
  if(current!==target){
    NET.id=target;NET_MODE_RESTARTING=true;NET_MODE_RESTART_RETRIES=0;
    netSchedulePeerRestart(1800,'Restoring your saved account Friend ID '+target+'. The prior PeerJS session will retire before reconnecting.');
  }else NET.id=target;
}
async function activateUsernameAccount(user,requestedName){
  if(accountHydrationUid===user.uid&&accountHydrationPromise)return accountHydrationPromise;
  accountHydrationUid=user.uid;
  accountHydrationPromise=(async()=>{
    const profileRef=fbDb.collection('users').doc(user.uid);
    let profileData=null;
    const firstLoginSlugId=newAccountFriendIdCandidate(); // do not reuse the previous guest or another account's local PeerJS ID
    await fbDb.runTransaction(async tx=>{
      const snap=await tx.get(profileRef),old=snap.exists?(snap.data()||{}):{};
      const oldName=String(old.username||'').trim();
      const username=oldName||cleanUsernameInput(requestedName)||'Player';
      const slugId=/^SLUG-[A-Z0-9]{4}$/.test(String(old.slugId||''))?old.slugId:(snap.exists?(NET.id||loadId()):firstLoginSlugId);
      const patch={username,usernameLower:cleanUsernameInput(username).toLowerCase(),slugId,lastLogin:firebase.firestore.FieldValue.serverTimestamp()};
      if(!snap.exists){patch.createdAt=firebase.firestore.FieldValue.serverTimestamp();patch.friends=[];}
      else if(!Array.isArray(old.friends))patch.friends=[];
      tx.set(profileRef,patch,{merge:true});
      profileData={...old,...patch,username,slugId};
    });
    if(typeof scopeLocalFriendCache==='function'&&scopeLocalFriendCache(user.uid))legacyFriendCacheMigrationUid=user.uid;
    if(typeof scopeLocalSaveForOwner==='function')scopeLocalSaveForOwner(user.uid);
    AUTH.user=user;AUTH.username=profileData.username;AUTH.guest=false;
    try{localStorage.removeItem(GUEST_MODE_KEY)}catch(e){}
    await setStableAccountFriendId(profileData.slugId);
    await loadCloudSave();
    return profileData;
  })().catch(e=>{if(accountHydrationUid===user.uid){accountHydrationUid=null;accountHydrationPromise=null}throw e});
  return accountHydrationPromise;
}
async function authSubmit(action='login'){
  const err=m=>{$('authError').textContent=m};err('');
  action=action==='register'?'register':'login';
  if(!FIREBASE_CONFIGURED||!fbAuth||!fbDb){err('Cloud username login is not configured. You can still play as Guest.');return}
  const username=cleanUsernameInput($('authUsername').value);
  const length=Array.from(username).length;
  if(length<3||length>20||/[\u0000-\u001f\u007f/\\]/u.test(username)){err('Choose a username 3–20 characters long. Slashes and control characters are not allowed.');return}
  const busyButtons=[$('authSubmitBtn'),$('authCreateBtn')].filter(Boolean);
  busyButtons.forEach(b=>b.disabled=true);
  pendingUsernameAuth=username;
  let authStage=action==='register'?'contacting username registration service':'contacting username sign-in service';
  try{
    const endpoint=action==='register'?USERNAME_REGISTER_ENDPOINT:USERNAME_AUTH_ENDPOINT;
    let response;
    try{response=await fetch(endpoint,{method:'POST',cache:'no-store',credentials:'omit',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({username})})}
    catch(fetchError){throw new Error('Could not contact the username service (Cloudflare/CORS/network). Check that ALLOWED_ORIGINS exactly matches this GitHub Pages origin and that the Worker is deployed. Details: '+String(fetchError.message||fetchError))}
    let body={};try{body=await response.json()}catch(e){}
    if(!response.ok||!body.customToken){
      const serviceMessage=String(body.error||'');
      if(response.status===503&&/FIREBASE_SERVICE_ACCOUNT_JSON|service-account JSON|service account/i.test(serviceMessage)){
        throw new Error('Username login server setup is incomplete. Your account has not been created. In Cloudflare, open Workers & Pages → slugger-turn-ice → Settings → Variables and Secrets → Production. Check FIREBASE_SERVICE_ACCOUNT_JSON is set as a Secret, then deploy. Details: '+serviceMessage);
      }
      if(action==='register'&&response.status===409)throw new Error(serviceMessage||'That username is already taken. Choose another or sign in instead.');
      if(action==='login'&&response.status===404)throw new Error(serviceMessage||'That username does not exist yet. Choose Create account to register it.');
      throw new Error('Username service HTTP '+response.status+': '+(serviceMessage||'No custom token returned. Check the Worker configuration and logs.'));
    }
    authStage='signing in to Firebase';
    let cred;
    try{cred=await fbAuth.signInWithCustomToken(body.customToken)}catch(firebaseError){throw new Error('Cloudflare returned a token, but Firebase sign-in failed ('+(firebaseError.code||'unknown')+'): '+String(firebaseError.message||firebaseError)+'. Check Firebase Authentication is enabled for project slugger-aether and the Worker uses the matching service account.')}
    AUTH.user=cred.user;AUTH.username=body.username||username;AUTH.guest=false;
    authStage='loading your cloud profile';
    await activateUsernameAccount(cred.user,body.username||username);
    enterGame();
  }catch(e){
    const msg=String(e.message||e||(action==='register'?'Account creation failed':'Sign-in failed'));
    console.error('Slugger username '+(action==='register'?'registration':'sign-in')+' failed at stage:',authStage,e);
    err(msg);
  }finally{pendingUsernameAuth=null;busyButtons.forEach(b=>b.disabled=false)}
}
function authGuest(){
  const old=AUTH.user;
  if(typeof scopeLocalFriendCache==='function')scopeLocalFriendCache('guest');
  if(typeof scopeLocalSaveForOwner==='function')scopeLocalSaveForOwner('guest');
  if(old&&fbAuth)fbAuth.signOut().catch(()=>{});
  AUTH.guest=true;AUTH.user=null;AUTH.username='Guest';NET.accountIdLocked=false;
  cancelCloudWork();stopCloudSocial();if(typeof releaseAccountPeerIdentity==='function')releaseAccountPeerIdentity();
  try{localStorage.setItem(GUEST_MODE_KEY,'1')}catch(e){}
  enterGame();
}
function authSignOut(){
  saveLocalOnly();const old=AUTH.user;
  if(old&&fbDb)fbDb.collection('presence').doc(old.uid).set({status:'OFFLINE',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(()=>{});
  if(typeof scopeLocalFriendCache==='function')scopeLocalFriendCache('guest');
  if(typeof scopeLocalSaveForOwner==='function')scopeLocalSaveForOwner('guest');
  cancelCloudWork();stopCloudSocial();AUTH.user=null;AUTH.username=null;AUTH.guest=false;NET.accountIdLocked=false;
  accountHydrationUid=null;accountHydrationPromise=null;NET.msgs=NET.msgs.filter(m=>m.sys);
  if(typeof releaseAccountPeerIdentity==='function')releaseAccountPeerIdentity();
  try{localStorage.removeItem(GUEST_MODE_KEY)}catch(e){}
  if(fbAuth&&old)fbAuth.signOut().catch(()=>{});
  $('authModal').style.display='flex';$('hubOverlay').className='ov';authTab('login');
}
function enterGame(){
  $('authModal').style.display='none';hub();
  if(AUTH.user&&!AUTH.guest)startCloudSocial();
}
function startAuthObserver(){
  if(!fbAuth||AUTH.observerStarted)return;AUTH.observerStarted=true;
  authStateUnsub=fbAuth.onAuthStateChanged(async user=>{
    if(AUTH.guest)return;
    if(user){
      const changed=!AUTH.user||AUTH.user.uid!==user.uid;AUTH.user=user;
      if(changed){
        try{
          await activateUsernameAccount(user,pendingUsernameAuth||AUTH.username||user.displayName||(user.email||'').split('@')[0]||'Player');
          if(!AUTH.guest&&AUTH.user&&AUTH.user.uid===user.uid){if($('authModal').style.display!=='none')enterGame();else startCloudSocial();}
        }catch(e){console.warn('Account hydration failed:',e);if($('authError'))$('authError').textContent='Could not load your cloud account: '+String(e.message||e)}
      }
    }else if(AUTH.user){
      AUTH.user=null;AUTH.username=null;NET.accountIdLocked=false;cancelCloudWork();stopCloudSocial();
    }
  });
}
function saveLocalOnly(){S.lastSaveTimestamp=Math.max(Date.now(),(Number(S.lastSaveTimestamp)||0)+1);S=normaliseSave(S);persistScopedSave();}
function cancelCloudWork(){cloudGeneration++;if(cloudSaveTimer){clearTimeout(cloudSaveTimer);cloudSaveTimer=null}cloudSavePending=false}
function stopCloudSocial(){if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null}if(presenceUnsub){presenceUnsub();presenceUnsub=null}if(cloudProfileUnsub){cloudProfileUnsub();cloudProfileUnsub=null}if(cloudRequestUnsub){cloudRequestUnsub();cloudRequestUnsub=null}Object.values(cloudDmUnsubs).forEach(fn=>{try{fn()}catch(e){}});cloudDmUnsubs={};cloudPresenceUnsubs.forEach(fn=>{try{fn()}catch(e){}});cloudPresenceUnsubs=[];cloudUidBySlug={};cloudFriends=[];cloudSocialUidStarted=null;cloudDmSeen.clear();NET.msgs=NET.msgs.filter(m=>m.sys)}
let cloudSaveTimer=null,cloudSavePending=false;
function saveScore(s){if(!s)return 0;let score=0;if(s.cp&&s.cp.length)score+=Math.max(...s.cp)*100000;score+=(s.hi||0)*1000;score+=(s.warp||0)+(s.pro||0)*10+(s.souls||0)*5;score+=Object.keys(s.inv||{}).length*2000;if(s.up)score+=Object.values(s.up).reduce((a,b)=>a+(Number(b)||0),0)*5000;return score}
function normaliseSave(raw){
  const base=DEF(),v=raw&&typeof raw==='object'?raw:{};
  const out={...base,...v};
  // v0.6 removes Cells, Purified Warp, weapon levels, and reinforcement ranks. No refunds are issued.
  delete out.cell;delete out.pur;delete out.wl;
  out.cr={...base.cr,...(v.cr||{})};
  const rawInv={...base.inv,...(v.inv||{})};out.inv={};
  for(const [id,rawItem] of Object.entries(rawInv)){if(!rawItem||typeof rawItem!=='object')continue;const item={...rawItem,d:Math.max(0,Number(rawItem.d)||0)};delete item.r;out.inv[id]=item;}
  out.eq={...base.eq,...(v.eq||{})};out.aw={...(v.aw||{})};
  out.att=Array.from(new Set(['neutral',...((Array.isArray(v.att)?v.att:[]).filter(x=>EL6.includes(x)))]));
  out.up={...base.up,...(v.up||{})};out.cp=Array.from(new Set([1,...(Array.isArray(v.cp)?v.cp.filter(x=>Number.isInteger(x)&&x>=1&&x<=8):[])])).sort((a,b)=>a-b);
  out.rec={...(v.rec||{})};out.lastSaveTimestamp=Number(v.lastSaveTimestamp)||0;
  for(const k of Object.keys(base.cr))out.cr[k]=Math.max(0,Number(out.cr[k])||0);
  return out;
}
function currentSaveOwner(){try{return AUTH.user&&!AUTH.guest?AUTH.user.uid:(AUTH.guest?'guest':(localStorage.getItem(SAVE_OWNER_KEY)||'guest'))}catch(e){return AUTH.user&&!AUTH.guest?AUTH.user.uid:(AUTH.guest?'guest':'guest')}}
function persistScopedSave(){try{const value=JSON.stringify(normaliseSave(S));localStorage.setItem(SK,value);localStorage.setItem(saveScopedKey(currentSaveOwner()),value);localStorage.setItem(SAVE_OWNER_KEY,currentSaveOwner())}catch(e){}}
function scopeLocalSaveForOwner(owner){
  owner=String(owner||'guest');let previous='';try{previous=localStorage.getItem(SAVE_OWNER_KEY)||''}catch(e){}
  if(!previous){
    // Adopt the legacy single-browser save once, preserving existing progress on first v0.6 Phase 1 login.
    persistScopedSaveFor(owner);return false;
  }
  if(previous!==owner){
    persistScopedSaveFor(previous);
    let raw=null;try{raw=localStorage.getItem(saveScopedKey(owner))}catch(e){}
    if(raw!==null){try{S=normaliseSave(JSON.parse(raw))}catch(e){S=DEF()}}
    else S=DEF();
    save_sp=S;save_1v1=null;activeSaveMode='sp';persistScopedSaveFor(owner);return true;
  }
  let raw=null;try{raw=localStorage.getItem(saveScopedKey(owner))}catch(e){}
  if(raw!==null){try{S=normaliseSave(JSON.parse(raw));save_sp=S;activeSaveMode='sp'}catch(e){S=DEF();save_sp=S}}
  persistScopedSaveFor(owner);return false;
}
function persistScopedSaveFor(owner){try{const value=JSON.stringify(normaliseSave(S));localStorage.setItem(SK,value);localStorage.setItem(saveScopedKey(owner),value);localStorage.setItem(SAVE_OWNER_KEY,String(owner||'guest'))}catch(e){}}
function mergeSaveProgress(localRaw,cloudRaw){
  const l=normaliseSave(localRaw),c=normaliseSave(cloudRaw),ln=Number(l.lastSaveTimestamp)||0,cn=Number(c.lastSaveTimestamp)||0;
  // Latest timestamp owns balances, duplicate counts and selected loadout; union only durable progression.
  const newer=cn>ln?c:l,older=cn>ln?l:c,out=normaliseSave(newer);
  out.cp=Array.from(new Set([...(l.cp||[1]),...(c.cp||[1])])).sort((a,b)=>a-b);
  out.hi=Math.max(Number(l.hi)||0,Number(c.hi)||0);
  out.att=Array.from(new Set([...(l.att||['neutral']),...(c.att||['neutral'])]));
  for(const k of Object.keys(out.up||{}))out.up[k]=Math.max(Number(l.up?.[k])||0,Number(c.up?.[k])||0);
  out.rec={...l.rec,...c.rec};for(const k of new Set([...Object.keys(l.rec||{}),...Object.keys(c.rec||{})]))out.rec[k]=Math.max(Number(l.rec?.[k])||0,Number(c.rec?.[k])||0);
  out.aw={...l.aw,...c.aw};
  // Preserve owned items and remaining duplicate stock; legacy reinforcement ranks are discarded.
  out.inv={};const ids=new Set([...Object.keys(l.inv||{}),...Object.keys(c.inv||{})]);
  for(const id of ids){const nv=newer.inv?.[id],ov=older.inv?.[id];
    if(nv||ov){out.inv[id]={...(nv||ov||{}),d:nv?Math.max(0,Number(nv.d)||0):0};delete out.inv[id].r;}}
  // Ensure equipped items exist in inventory without inventing duplicate counts.
  for(const id of Object.values(out.eq||{}).filter(Boolean)){if(!out.inv[id])out.inv[id]={d:0};}
  out.lastSaveTimestamp=Math.max(ln,cn);return normaliseSave(out)
}
function cloudSaveDebounced(){
  if(!fbDb||!AUTH.user||AUTH.guest||activeSaveMode==='pvp')return;cloudSavePending=true;if(cloudSaveTimer)clearTimeout(cloudSaveTimer);
  const generation=++cloudGeneration,uid=AUTH.user.uid,username=AUTH.username||'Player',snapshot=JSON.parse(JSON.stringify(normaliseSave(S)));
  cloudSaveTimer=setTimeout(async()=>{cloudSaveTimer=null;if(generation!==cloudGeneration||!AUTH.user||AUTH.guest||AUTH.user.uid!==uid||activeSaveMode==='pvp')return;cloudSavePending=false;
    try{const ref=fbDb.collection('saves').doc(uid);const wrote=await fbDb.runTransaction(async tx=>{const d=await tx.get(ref);if(generation!==cloudGeneration||!AUTH.user||AUTH.guest||AUTH.user.uid!==uid||activeSaveMode==='pvp')return false;
      const remoteTs=d.exists?Number(d.data().lastSaveTimestamp)||0:0,localTs=Number(snapshot.lastSaveTimestamp)||0;
      if(remoteTs>localTs)return false;
      const doc={data:snapshot,lastSaveTimestamp:localTs||Date.now(),username,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};tx.set(ref,doc,{merge:true});return true;
    });
    if(generation!==cloudGeneration)return;
    if(!wrote&&AUTH.user&&!AUTH.guest&&AUTH.user.uid===uid){await loadCloudSave();}
    else if(wrote&&AUTH.user&&!AUTH.guest&&AUTH.user.uid===uid)await syncCloudProfileSummary();
  }catch(e){console.warn('Cloud save failed:',e)}
  },1800)
}
async function loadCloudSave(){
  if(activeSaveMode==='pvp'||!fbDb||!AUTH.user||AUTH.guest)return;const uid=AUTH.user.uid,requestGeneration=cloudGeneration;
  try{const doc=await fbDb.collection('saves').doc(uid).get();if(activeSaveMode==='pvp'||!AUTH.user||AUTH.guest||AUTH.user.uid!==uid)return;
    const localLatest=normaliseSave(S);
    if(!doc.exists){S=localLatest;save();return}
    const dat=doc.data()||{},cloudData=normaliseSave(dat.data),cloudTs=Number(dat.lastSaveTimestamp||cloudData.lastSaveTimestamp)||0;cloudData.lastSaveTimestamp=cloudTs;
    S=mergeSaveProgress(localLatest,cloudData);
    logs=[cloudTs>(localLatest.lastSaveTimestamp||0)?'Cloud save reconciled with newer remote currency balances and merged permanent unlocks.':'Local save reconciled; newer local spending balances retained.'];
    persistScopedSave();
    // A newer local mutation made while the request was in flight must win and be re-saved.
    if(requestGeneration!==cloudGeneration||Number(S.lastSaveTimestamp||0)>=cloudTs)cloudSaveDebounced();
    await syncCloudProfileSummary();
  }catch(e){console.warn('Cloud load failed:',e);logs=['Cloud load failed; using local save.']}
}
const save=()=>{const sessionWrite=activeSaveMode==='pvp'&&!!save_1v1;S.lastSaveTimestamp=Math.max(Date.now(),(Number(S.lastSaveTimestamp)||0)+1);S=normaliseSave(S);if(sessionWrite){save_1v1=S;try{sessionStorage.setItem(V05_SESSION_KEY,JSON.stringify(S))}catch(e){}return;}save_sp=S;persistScopedSave();cloudSaveDebounced();};
function cloudProfileSummary(s=S){const crates=Object.values(s.cr||{}).reduce((a,v)=>a+(Number(v)||0),0);const equipment={weapon:s.eq?.w?{id:s.eq.w}:null,shield:s.eq?.s?{id:s.eq.s}:null,armor:s.eq?.a?{id:s.eq.a}:null,boost:s.eq?.c?{id:s.eq.c}:null,spirit:s.eq?.p?{id:s.eq.p}:null};return{stats:{warp:Number(s.warp)||0,protons:Number(s.pro)||0,souls:Number(s.souls)||0,crates},checkpoints:s.cp||[1],equipment,inventory:Object.entries(s.inv||{}).map(([id,v])=>({id,duplicates:Math.max(0,Number(v.d)||0),awakened:!!s.aw?.[id]})),lastSaveTimestamp:Number(s.lastSaveTimestamp)||0};}
async function syncCloudProfileSummary(){if(!fbDb||!AUTH.user||AUTH.guest||activeSaveMode==='pvp')return;const uid=AUTH.user.uid;try{await fbDb.collection('users').doc(uid).set({...cloudProfileSummary(),username:AUTH.username||'Player',usernameLower:cleanUsernameInput(AUTH.username||'Player').toLowerCase(),slugId:NET.id||loadId(),lastLogin:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){console.warn('Profile stats sync failed:',e)}}
let tab=0,ub=null,dm=false,T=0;
const O="stroke='#0a0814' stroke-width='3' stroke-linejoin='round' stroke-linecap='round'",sv=(w,h,b)=>`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}'>${b}</svg>`;
