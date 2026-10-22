/* Slugger NEO v0.5.3.1 — Desktop input handlers and final boot/init sequence. Base loop is declared in module 04 for hoisting compatibility.
 * Load order is controlled by index.html. These are classic scripts (not ES modules)
 * so the existing shared global scope and inline UI handlers remain compatible.
 */
const mp=e=>{const r=cv.getBoundingClientRect();mx=(e.clientX-r.left)*W/r.width;my=(e.clientY-r.top)*H/r.height};
addEventListener('mousemove',mp);
window.__sluggerDesktopFireHeld=false;
cv.addEventListener('mousedown',e=>{au();mp(e);if(e.button===0){window.__sluggerDesktopFireHeld=true;md=true}if(e.button===2)special()});
addEventListener('mouseup',()=>{window.__sluggerDesktopFireHeld=false;if(!window.__sluggerMobileFireHeld)md=false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
  if(e.key==='F2'||e.key==='`'||e.key==='~'){e.preventDefault();dbgToggle();return}
  const tag=document.activeElement&&document.activeElement.tagName;
  if(tag==='INPUT'||tag==='TEXTAREA')return;
  const k=e.key.toLowerCase();au();K[k]=1;
  if(HK[k])swap(HK[k]);if(k==='q')cyc(-1);if(k==='e')cyc(1);
  if(k==='m'&&MU)MU.gain.value=MU.gain.value?0:.5;
  if(k==='escape'||k==='p')pz();
  if(k===' ')special();
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)&&mode!=='hub')e.preventDefault()
});
addEventListener('keyup',e=>{K[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{window.__sluggerDesktopFireHeld=false;md=false;for(const k in K)K[k]=0;if(typeof sluggerResetJoystick==='function')sluggerResetJoystick();if(typeof sluggerReleaseShoot==='function')sluggerReleaseShoot()});

$('hubOverlay').addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&!b.disabled)SFX.hov()});
addEventListener('pointerdown',()=>au());
setInterval(musTick,90);
setInterval(()=>{const t=Date.now();Object.keys(NET.conns).forEach(k=>{if(NET.conns[k].open){netSend(k,{type:'ping',t});netSend(k,{type:'status',mode:mode==='hub'?'hub':(PVP.active?'game':mode==='pause'?'pause':'play'),at:P.at||'neutral',t})}})},5000);
netLoadFriends();
netInit();
startAuthObserver();
setInterval(()=>{if(mode==='hub'){save()}},60000);
if(!FIREBASE_CONFIGURED){
  $('authEmail').disabled=true;$('authPassword').disabled=true;$('authUsername').disabled=true;
  $('authSubmitBtn').disabled=true;$('authTabLogin').disabled=true;$('authTabRegister').disabled=true;
  $('fbStatus').innerHTML='<span class=lock>Cloud login not configured. Only Guest Mode available.</span>';
} else {
  $('fbStatus').innerHTML='<span class=act>Cloud login enabled.</span>';
}
if(AUTH.guest){AUTH.username='Guest';$('authModal').style.display='none';hub()}else $('authModal').style.display='flex';
requestAnimationFrame(loop);
