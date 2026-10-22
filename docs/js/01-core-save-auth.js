/* Slugger NEO v0.5.2 — Core constants, save normalisation/merging, authentication, and cloud persistence.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */

const W=960,H=600,cv=document.getElementById('gameCanvas'),cx=cv.getContext('2d'),$=i=>document.getElementById(i);cv.width=W;cv.height=H;
let deterministicRandom=null;const R=(a,b)=>a+(deterministicRandom?deterministicRandom():Math.random())*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),D=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const EC={neutral:'#e8f0ff',fire:'#ff5a1f',ice:'#00ccff',solar:'#ffcc00',vortex:'#aa00ff',aether:'#ff0055',void:'#ff0055'},CC={wood:'#c8884a',iron:'#9fb0c8',solar:'#ffcc00',vortex:'#aa00ff',aether:'#ff0055'};
const EN={neutral:'Neutral',fire:'Fire',ice:'Ice',solar:'Solar',vortex:'Vortex',aether:'Aether',void:'Void'},EL6=['neutral','fire','ice','solar','vortex','aether'],HK={1:'neutral',2:'fire',3:'ice',4:'solar',5:'vortex',6:'aether'};
const OPP={fire:'ice',ice:'fire',solar:'vortex',vortex:'solar'},REC={fire:'ice',ice:'fire',solar:'vortex',vortex:'solar',void:'aether'},BP={wood:150,iron:600},RN=['','I','II','III','IV','V'];
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
const SK='slugger_neo_v0.2-alpha',DEF=()=>({warp:0,pro:0,cell:0,pur:0,key:3,fus:0,souls:0,cr:{wood:0,iron:0,solar:0,vortex:0,aether:0},inv:{blaster:{d:0,r:0}},eq:{w:'blaster',s:null,a:null,c:null,p:null},aw:{},att:['neutral'],up:{hp:0,oc:0,thr:0,slime:0,amp:0},wl:{},cp:[1],rec:{},hi:0,lastSaveTimestamp:Date.now()});
let S;try{S=normaliseSave(JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){S=DEF()}
const V05_SESSION_KEY='slugger_neo_save_1v1_v05';let save_sp=S,save_1v1=null,activeSaveMode='sp';
const firebaseConfig={apiKey:"AIzaSyAu7prBgEdGWbPY8u8g2CYCJbHjz2fLTl4",authDomain:"slugger-aether.firebaseapp.com",projectId:"slugger-aether",storageBucket:"slugger-aether.firebasestorage.app",messagingSenderId:"156152123566",appId:"1:156152123566:web:22cc7d829fa41ecd615d3f",measurementId:"G-TDDDMFNKZ9"};
const FIREBASE_CONFIG_ATTEMPTED=!!firebaseConfig.apiKey&&!firebaseConfig.apiKey.startsWith('YOUR_');
let FIREBASE_CONFIGURED=false,fbAuth=null,fbDb=null;
if(FIREBASE_CONFIG_ATTEMPTED&&typeof firebase!=='undefined'){try{firebase.initializeApp(firebaseConfig);fbAuth=firebase.auth();fbDb=firebase.firestore();FIREBASE_CONFIGURED=!!fbAuth&&!!fbDb}catch(e){console.warn('Firebase init failed:',e)}}
const GUEST_MODE_KEY='slugger_neo_guest_mode';
let persistedGuestMode=false;try{persistedGuestMode=localStorage.getItem(GUEST_MODE_KEY)==='1'}catch(e){}
const AUTH={user:null,username:persistedGuestMode?'Guest':null,guest:persistedGuestMode,mode:'login',observerStarted:false};
let authStateUnsub=null, cloudGeneration=0, presenceTimer=null, presenceUnsub=null, cloudProfileUnsub=null, cloudRequestUnsub=null, cloudDmUnsubs={}, cloudPresenceUnsubs=[], cloudDmSeen=new Set(), cloudUidBySlug={}, cloudFriends=[];
function authTab(mode){AUTH.mode=mode;$('authTabLogin').classList.toggle('on',mode==='login');$('authTabRegister').classList.toggle('on',mode==='register');$('authUsername').style.display=mode==='register'?'block':'none';$('authSubmitBtn').textContent=mode==='register'?'Create Account':'Login';$('authError').textContent='';SFX.click()}
async function authSubmit(){
  const err=m=>{$('authError').textContent=m};err('');
  if(!FIREBASE_CONFIGURED||!fbAuth){err('Firebase not configured. Use Guest Mode.');return}
  const email=$('authEmail').value.trim(),pw=$('authPassword').value,un=$('authUsername').value.trim();
  if(!email||!pw){err('Email and password required.');return}
  if(pw.length<6){err('Password must be at least 6 characters.');return}
  if(AUTH.mode==='register'&&!un){err('Username required.');return}
  $('authSubmitBtn').disabled=true;
  try{
    if(AUTH.mode==='register'){
      const cred=await fbAuth.createUserWithEmailAndPassword(email,pw);
      await cred.user.updateProfile({displayName:un});
      AUTH.user=cred.user;AUTH.username=un;
      await fbDb.collection('users').doc(cred.user.uid).set({username:un,email,slugId:NET.id||loadId(),createdAt:firebase.firestore.FieldValue.serverTimestamp(),lastLogin:firebase.firestore.FieldValue.serverTimestamp(),friends:[]},{merge:true});
    }else{
      const cred=await fbAuth.signInWithEmailAndPassword(email,pw);
      AUTH.user=cred.user;AUTH.username=cred.user.displayName||email.split('@')[0];
    }
    AUTH.guest=false;try{localStorage.removeItem(GUEST_MODE_KEY)}catch(e){}
    await loadCloudSave();
    enterGame();
  }catch(e){
    const msg=(e.code||e.message||'').toString();
    if(msg.includes('user-not-found'))err('No account with that email.');
    else if(msg.includes('wrong-password'))err('Incorrect password.');
    else if(msg.includes('email-already-in-use'))err('That email is already registered.');
    else if(msg.includes('invalid-email'))err('Invalid email address.');
    else if(msg.includes('weak-password'))err('Password too weak (min 6 chars).');
    else err(msg||'Login failed.');
  }finally{$('authSubmitBtn').disabled=false}
}
function authGuest(){AUTH.guest=true;AUTH.user=null;AUTH.username='Guest';try{localStorage.setItem(GUEST_MODE_KEY,'1')}catch(e){}cancelCloudWork();stopCloudSocial();enterGame()}
function authSignOut(){saveLocalOnly();const old=AUTH.user;if(old&&fbDb){fbDb.collection('presence').doc(old.uid).set({status:'OFFLINE',updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true}).catch(()=>{});}cancelCloudWork();stopCloudSocial();AUTH.user=null;AUTH.username=null;AUTH.guest=false;try{localStorage.removeItem(GUEST_MODE_KEY)}catch(e){}if(fbAuth&&old)fbAuth.signOut().catch(()=>{});$('authModal').style.display='flex';$('hubOverlay').className='ov';authTab('login')}
function enterGame(){$('authModal').style.display='none';hub();if(AUTH.user&&!AUTH.guest)startCloudSocial()}
function startAuthObserver(){if(!fbAuth||AUTH.observerStarted)return;AUTH.observerStarted=true;authStateUnsub=fbAuth.onAuthStateChanged(u=>{if(AUTH.guest)return;if(u){const changed=!AUTH.user||AUTH.user.uid!==u.uid;AUTH.user=u;AUTH.username=AUTH.username||u.displayName||(u.email||'').split('@')[0]||'Player';if(changed){const uid=u.uid;loadCloudSave().then(()=>{if(!AUTH.guest&&AUTH.user&&AUTH.user.uid===uid){if($('authModal').style.display!=='none')enterGame();else startCloudSocial();}}).catch(()=>{});}}else if(AUTH.user){AUTH.user=null;AUTH.username=null;cancelCloudWork();stopCloudSocial()} });}
function saveLocalOnly(){S.lastSaveTimestamp=Math.max(Date.now(),(Number(S.lastSaveTimestamp)||0)+1);S=normaliseSave(S);try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}}
function cancelCloudWork(){cloudGeneration++;if(cloudSaveTimer){clearTimeout(cloudSaveTimer);cloudSaveTimer=null}cloudSavePending=false}
function stopCloudSocial(){if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null}if(presenceUnsub){presenceUnsub();presenceUnsub=null}if(cloudProfileUnsub){cloudProfileUnsub();cloudProfileUnsub=null}if(cloudRequestUnsub){cloudRequestUnsub();cloudRequestUnsub=null}Object.values(cloudDmUnsubs).forEach(fn=>{try{fn()}catch(e){}});cloudDmUnsubs={};cloudPresenceUnsubs.forEach(fn=>{try{fn()}catch(e){}});cloudPresenceUnsubs=[];cloudUidBySlug={};cloudFriends=[]}
let cloudSaveTimer=null,cloudSavePending=false;
function saveScore(s){if(!s)return 0;let score=0;if(s.cp&&s.cp.length)score+=Math.max(...s.cp)*100000;score+=(s.hi||0)*1000;score+=(s.warp||0)+(s.pro||0)*10+(s.cell||0)*50+(s.pur||0)*50+(s.souls||0)*5;score+=Object.keys(s.inv||{}).length*2000;if(s.up)score+=Object.values(s.up).reduce((a,b)=>a+(Number(b)||0),0)*5000;return score}
function normaliseSave(raw){const base=DEF(),v=raw&&typeof raw==='object'?raw:{};const out={...base,...v};out.cr={...base.cr,...(v.cr||{})};out.inv={...base.inv,...(v.inv||{})};out.eq={...base.eq,...(v.eq||{})};out.aw={...(v.aw||{})};out.att=Array.from(new Set(['neutral',...((Array.isArray(v.att)?v.att:[]).filter(x=>EL6.includes(x)))]));out.up={...base.up,...(v.up||{})};out.wl={...(v.wl||{})};out.cp=Array.from(new Set([1,...(Array.isArray(v.cp)?v.cp.filter(x=>Number.isInteger(x)&&x>=1&&x<=8):[])])).sort((a,b)=>a-b);out.rec={...(v.rec||{})};out.lastSaveTimestamp=Number(v.lastSaveTimestamp)||0;for(const k of Object.keys(base.cr))out.cr[k]=Math.max(0,Number(out.cr[k])||0);return out}
function mergeSaveProgress(localRaw,cloudRaw){
  const l=normaliseSave(localRaw),c=normaliseSave(cloudRaw),ln=Number(l.lastSaveTimestamp)||0,cn=Number(c.lastSaveTimestamp)||0;
  // Latest timestamp owns balances, duplicate counts and selected loadout; union only durable progression.
  const newer=cn>ln?c:l,older=cn>ln?l:c,out=normaliseSave(newer);
  out.cp=Array.from(new Set([...(l.cp||[1]),...(c.cp||[1])])).sort((a,b)=>a-b);
  out.hi=Math.max(Number(l.hi)||0,Number(c.hi)||0);
  out.att=Array.from(new Set([...(l.att||['neutral']),...(c.att||['neutral'])]));
  for(const k of Object.keys(out.up||{}))out.up[k]=Math.max(Number(l.up?.[k])||0,Number(c.up?.[k])||0);
  out.rec={...l.rec,...c.rec};for(const k of new Set([...Object.keys(l.rec||{}),...Object.keys(c.rec||{})]))out.rec[k]=Math.max(Number(l.rec?.[k])||0,Number(c.rec?.[k])||0);
  out.wl={...l.wl,...c.wl};for(const k of new Set([...Object.keys(l.wl||{}),...Object.keys(c.wl||{})]))out.wl[k]=Math.max(Number(l.wl?.[k])||0,Number(c.wl?.[k])||0);
  out.aw={...l.aw,...c.aw};
  // Preserve owned items and highest reinforcement rank, but never resurrect spent duplicate stock.
  out.inv={};const ids=new Set([...Object.keys(l.inv||{}),...Object.keys(c.inv||{})]);
  for(const id of ids){const lv=l.inv?.[id],cv=c.inv?.[id],nv=newer.inv?.[id],ov=older.inv?.[id];
    if(nv||ov){out.inv[id]={...(nv||ov||{}),r:Math.max(Number(lv?.r)||0,Number(cv?.r)||0),d:nv?Math.max(0,Number(nv.d)||0):0};}}
  // Ensure equipped items exist in inventory without inventing duplicate counts.
  for(const id of Object.values(out.eq||{}).filter(Boolean)){if(!out.inv[id])out.inv[id]={d:0,r:0};}
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
    try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}
    // A newer local mutation made while the request was in flight must win and be re-saved.
    if(requestGeneration!==cloudGeneration||Number(S.lastSaveTimestamp||0)>=cloudTs)cloudSaveDebounced();
    await syncCloudProfileSummary();
  }catch(e){console.warn('Cloud load failed:',e);logs=['Cloud load failed; using local save.']}
}
const save=()=>{const sessionWrite=activeSaveMode==='pvp'&&!!save_1v1;S.lastSaveTimestamp=Math.max(Date.now(),(Number(S.lastSaveTimestamp)||0)+1);S=normaliseSave(S);if(sessionWrite){save_1v1=S;try{sessionStorage.setItem(V05_SESSION_KEY,JSON.stringify(S))}catch(e){}return;}save_sp=S;try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}cloudSaveDebounced();};
function cloudProfileSummary(s=S){const crates=Object.values(s.cr||{}).reduce((a,v)=>a+(Number(v)||0),0);const equipment={weapon:s.eq?.w?{id:s.eq.w,tier:Number(s.inv?.[s.eq.w]?.r)||0}:null,shield:s.eq?.s?{id:s.eq.s,tier:Number(s.inv?.[s.eq.s]?.r)||0}:null,armor:s.eq?.a?{id:s.eq.a,tier:Number(s.inv?.[s.eq.a]?.r)||0}:null,boost:s.eq?.c?{id:s.eq.c,tier:Number(s.inv?.[s.eq.c]?.r)||0}:null,spirit:s.eq?.p?{id:s.eq.p,tier:Number(s.inv?.[s.eq.p]?.r)||0}:null};return{stats:{warp:Number(s.warp)||0,protons:Number(s.pro)||0,cells:Number(s.cell)||0,purifiedWarp:Number(s.pur)||0,souls:Number(s.souls)||0,crates},checkpoints:s.cp||[1],equipment,inventory:Object.entries(s.inv||{}).map(([id,v])=>({id,tier:Number(v.r)||0,duplicates:Number(v.d)||0,awakened:!!s.aw?.[id]})),lastSaveTimestamp:Number(s.lastSaveTimestamp)||0};}
async function syncCloudProfileSummary(){if(!fbDb||!AUTH.user||AUTH.guest||activeSaveMode==='pvp')return;const uid=AUTH.user.uid;try{await fbDb.collection('users').doc(uid).set({...cloudProfileSummary(),username:AUTH.username||'Player',slugId:NET.id||loadId(),lastLogin:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})}catch(e){console.warn('Profile stats sync failed:',e)}}
let tab=0,ub=null,dm=false,T=0;
const O="stroke='#0a0814' stroke-width='3' stroke-linejoin='round' stroke-linecap='round'",sv=(w,h,b)=>`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}'>${b}</svg>`;
