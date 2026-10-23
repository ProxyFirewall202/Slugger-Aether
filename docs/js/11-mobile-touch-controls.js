/* Slugger NEO v0.5.4.2 — Mobile controls hotfix.
 * Loaded after game/network modules and before the final startup module.
 * Touch screens get a virtual joystick, hold-to-shoot with auto-aim, special, and element cycling.
 */
/* v0.5.4.2 mobile input: virtual movement joystick, auto-aim hold-to-fire, special and element cycling. */
const SLUGGER_TOUCH_DEVICE=(()=>{const ua=String(navigator.userAgent||''),points=Number(navigator.maxTouchPoints)||0,mm=window.matchMedia?window.matchMedia.bind(window):null;const mobileUA=/Android|iPhone|iPad|iPod/i.test(ua),ipadDesktopUA=/Macintosh/i.test(ua)&&points>1,narrowTouch=points>0&&mm&&mm('(max-width: 900px)').matches;return !!(mobileUA||ipadDesktopUA||narrowTouch)})();
let sluggerTouchControlsVisible=true,sluggerJoyPointer=null,sluggerJoyCenter=null,sluggerFirePointer=null;
try{const savedTouch=localStorage.getItem('slugger_neo_touch_controls');if(savedTouch==='0')sluggerTouchControlsVisible=false;else if(savedTouch==='1')sluggerTouchControlsVisible=true;}catch(e){}
const mobileControlsEl=$('mobileControls'),mobileJoyZone=$('mobileJoystickZone'),mobileJoyNub=$('mobileJoystickNub'),mobileShootBtn=$('mobileShoot'),mobileSpecialBtn=$('mobileSpecial'),mobileActions=$('mobileActions'),mobileControlsToggle=$('mobileControlsToggle');
window.__sluggerTouchAxisX=0;window.__sluggerTouchAxisY=0;window.__sluggerMobileFireHeld=false;
function sluggerResetJoystick(){window.__sluggerTouchAxisX=window.__sluggerTouchAxisY=0;sluggerJoyPointer=null;sluggerJoyCenter=null;if(mobileJoyNub)mobileJoyNub.style.transform='translate(0px,0px)';}
function sluggerUpdateJoystick(e){if(!mobileJoyZone||sluggerJoyPointer!==e.pointerId)return;const rect=mobileJoyZone.getBoundingClientRect(),cx0=rect.left+rect.width/2,cy0=rect.top+rect.height/2,dx=e.clientX-cx0,dy=e.clientY-cy0,max=Math.max(25,rect.width*.34),len=Math.hypot(dx,dy)||1,scale=Math.min(1,max/len),nx=dx*scale/max,ny=dy*scale/max,mag=Math.hypot(nx,ny);const dead=mag<.13?0:1;window.__sluggerTouchAxisX=nx*dead;window.__sluggerTouchAxisY=ny*dead;if(mobileJoyNub)mobileJoyNub.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;}
function sluggerMobileAimAtTarget(){
  if(mode!=='play'||PVP.playerDead)return;
  let best=null,bestD=Infinity;
  if(Array.isArray(E))for(const e of E){if(!e||e.hp<=0||!Number.isFinite(e.x)||!Number.isFinite(e.y))continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bestD){best=e;bestD=d;}}
  if(best){mx=best.x;my=best.y;return;}
  if(PVP.active&&PVP.oppAlive!==false&&Number.isFinite(PVP.oppX)&&Number.isFinite(PVP.oppY)){mx=PVP.oppX;my=PVP.oppY;return;}
  const a=Number.isFinite(P.ang)?P.ang:(Number.isFinite(P.fa)?P.fa:0);mx=P.x+Math.cos(a)*180;my=P.y+Math.sin(a)*180;
}
window.__sluggerMobileAimAtTarget=sluggerMobileAimAtTarget;
function sluggerReleaseShoot(){window.__sluggerMobileFireHeld=false;md=!!window.__sluggerDesktopFireHeld;sluggerFirePointer=null;}
function sluggerAimAndSpecial(e){e.preventDefault();e.stopPropagation();if(mode!=='play'||PVP.playerDead)return;au();sluggerMobileAimAtTarget();special();}
function sluggerTouchActivate(el,fn){if(!el)return;el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&SLUGGER_TOUCH_DEVICE===false)return;e.preventDefault();e.stopPropagation();au();fn(e);},{passive:false});}
if(mobileJoyZone){
  mobileJoyZone.addEventListener('pointerdown',e=>{if(!SLUGGER_TOUCH_DEVICE)return;e.preventDefault();e.stopPropagation();au();sluggerJoyPointer=e.pointerId;mobileJoyZone.setPointerCapture?.(e.pointerId);sluggerUpdateJoystick(e);},{passive:false});
  mobileJoyZone.addEventListener('pointermove',e=>{if(sluggerJoyPointer===e.pointerId){e.preventDefault();sluggerUpdateJoystick(e);}},{passive:false});
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])mobileJoyZone.addEventListener(ev,e=>{if(sluggerJoyPointer===e.pointerId)sluggerResetJoystick();});
}
sluggerTouchActivate(mobileShootBtn,e=>{if(mode!=='play'||PVP.playerDead)return;sluggerFirePointer=e.pointerId;mobileShootBtn.setPointerCapture?.(e.pointerId);window.__sluggerMobileFireHeld=true;md=true;sluggerMobileAimAtTarget();});
if(mobileShootBtn){for(const ev of ['pointerup','pointercancel','lostpointercapture'])mobileShootBtn.addEventListener(ev,e=>{if(sluggerFirePointer===null||sluggerFirePointer===e.pointerId)sluggerReleaseShoot();});}
sluggerTouchActivate(mobileSpecialBtn,sluggerAimAndSpecial);
sluggerTouchActivate($('mobileElementPrev'),()=>{if(mode==='play'&&!PVP.playerDead)cyc(-1);sluggerRefreshMobileElement();});
sluggerTouchActivate($('mobileElementNext'),()=>{if(mode==='play'&&!PVP.playerDead)cyc(1);sluggerRefreshMobileElement();});
function sluggerRefreshMobileElement(){const el=$('mobileCurrentElement');if(el){const name=EN[P.at]||'Neutral';el.textContent=name.toUpperCase();el.style.color=EC[P.at]||'var(--ac)';}}
function sluggerToggleMobileControls(){sluggerTouchControlsVisible=!sluggerTouchControlsVisible;try{localStorage.setItem('slugger_neo_touch_controls',sluggerTouchControlsVisible?'1':'0');}catch(e){}if(!sluggerTouchControlsVisible){sluggerResetJoystick();sluggerReleaseShoot();}sluggerRefreshMobileControls();}
function sluggerPlaceMobileControls(){if(!mobileControlsEl||!cv)return;const r=cv.getBoundingClientRect(),st=getComputedStyle(mobileControlsEl),safeL=parseFloat(st.getPropertyValue('--mc-left-safe'))||0,safeR=parseFloat(st.getPropertyValue('--mc-right-safe'))||0,gap=10;/* Keep controls aligned with the actual canvas while respecting device safe areas. */if(mobileJoyZone)mobileJoyZone.style.left=Math.max(safeL+gap,r.left+gap)+'px';if(mobileActions)mobileActions.style.right=Math.max(safeR+gap,window.innerWidth-r.right+gap)+'px';if(mobileControlsToggle)mobileControlsToggle.style.left=Math.max(safeL+8,r.left+8)+'px';}
function sluggerRefreshMobileControls(){if(!mobileControlsEl)return;sluggerPlaceMobileControls();const hub=$('hubOverlay'),pause=$('pauseOverlay'),auth=$('authModal'),end=$('pvpEndOverlay'),round=$('v05RoundOverlay');const modalActive=!!(hub?.classList.contains('on')||pause?.classList.contains('on')||end?.classList.contains('on')||round?.classList.contains('on')||auth?.style.display!=='none');const pvpPlayable=!PVP.active||PVP.phase==='playing';const active=SLUGGER_TOUCH_DEVICE&&mode==='play'&&!!G&&!modalActive&&pvpPlayable&&!(PVP.active&&PVP.playerDead)&&!PVP.finished;mobileControlsEl.classList.toggle('mc-active',!!active);mobileControlsEl.classList.toggle('mc-controls-off',!sluggerTouchControlsVisible);if(mobileControlsToggle){mobileControlsToggle.style.display=active?'block':'none';mobileControlsToggle.textContent=sluggerTouchControlsVisible?'Hide controls':'Show controls';mobileControlsToggle.setAttribute('aria-pressed',sluggerTouchControlsVisible?'true':'false');}if(!active){sluggerResetJoystick();sluggerReleaseShoot();}sluggerRefreshMobileElement();}
if(mobileControlsToggle)mobileControlsToggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();sluggerToggleMobileControls();});
window.addEventListener('resize',()=>{sluggerResetJoystick();sluggerRefreshMobileControls();});
window.addEventListener('orientationchange',()=>setTimeout(()=>{sluggerResetJoystick();sluggerRefreshMobileControls();},200));
document.addEventListener('visibilitychange',()=>{if(document.hidden){sluggerResetJoystick();sluggerReleaseShoot();}});
setInterval(sluggerRefreshMobileControls,180);
