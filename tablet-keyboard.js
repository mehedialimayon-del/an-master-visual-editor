/* Tablet canvas-first keyboard and contextual palette integration. */
(()=>{'use strict';
const tablet=()=>matchMedia('(min-width:701px) and (max-width:900px) and (orientation:portrait)').matches;
const canvas=document.getElementById('canvas'),tools=document.querySelector('.tools'),dock=document.querySelector('.mobile-dock');
if(!canvas||!tools||!dock)return;
const palette=document.createElement('div');palette.id='anTabletPalette';palette.setAttribute('role','toolbar');palette.setAttribute('aria-label','Contextual element effects');palette.hidden=true;
document.body.append(palette);
const styles=document.createElement('style');styles.textContent=`
@media(min-width:701px) and (max-width:900px) and (orientation:portrait){
 body.an-tablet-typing .tools,body.an-tablet-typing #quickText{display:none!important}
 body.an-tablet-typing .mobile-dock{display:none!important}
 body.an-tablet-typing #designRibbon{display:none!important}
 body.an-tablet-typing #pageTrail{display:none!important}
 body.an-tablet-typing>header{display:none!important}
 body.an-tablet-typing .canvas{position:fixed!important;top:0!important;left:0!important;right:0!important;margin:0 auto!important;max-height:var(--an-keyboard-height,100dvh)!important;z-index:20!important}
 #anTabletPalette:not([hidden]){display:flex;position:fixed;right:10px;bottom:66px;max-width:min(330px,calc(100vw - 20px));gap:5px;flex-wrap:wrap;padding:8px;background:#101321eb;backdrop-filter:blur(10px);border:1px solid #9d48da;border-radius:12px;z-index:110;box-shadow:0 5px 24px #0008}
 #anTabletPalette button{padding:8px 10px;min-height:36px;border-radius:8px;background:#262031;border:1px solid #a04de2;color:white}
 #anTabletPalette button[aria-pressed=true]{background:#f60;border-color:#ff9a44}
}`;document.head.append(styles);
function viewport(){const v=window.visualViewport;document.body.style.setProperty('--an-keyboard-height',(v?v.height:window.innerHeight)+'px')}
function closePalette(){palette.hidden=true;palette.replaceChildren()}
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);palette.append(b);return b}
function showPalette(kind){if(!tablet())return;if(!palette.hidden&&palette.dataset.kind===kind){closePalette();return}closePalette();palette.dataset.kind=kind;palette.hidden=false;
 if(kind==='Effects'){for(const [label,id] of [['Glow','ribbonGlow'],['Shadow','ribbonShadow'],['Opacity','ribbonOpacity'],['Blur','ribbonBlur']])button(label,()=>{const target=document.getElementById(id);if(target){target.click();target.focus()}else document.querySelector('.an-v2-tabs button')?.click();closePalette()})}
 else if(kind==='Shadow'){for(const n of [0,5,12,24])button(n===0?'None':n+'px',()=>{const slider=document.getElementById('ribbonShadow');if(slider){slider.value=String(n);slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}))}closePalette()})}
}
function startInline(e){if(!tablet())return;const el=e.target.closest?.('.item[data-type="text"] .content');if(!el)return;tools.classList.remove('sheet-open');closePalette();document.body.classList.add('an-tablet-typing');viewport()}
document.addEventListener('pointerdown',startInline,true);
document.addEventListener('focusin',e=>{if(!tablet())return;if(e.target.matches?.('.item[data-type="text"] .content[contenteditable="true"]')){document.body.classList.add('an-tablet-typing');tools.classList.remove('sheet-open');viewport()}},true);
document.addEventListener('focusout',e=>{if(!e.target.matches?.('.item[data-type="text"] .content[contenteditable="true"]'))return;requestAnimationFrame(()=>{if(!document.querySelector('.item .content[contenteditable="true"]:focus'))document.body.classList.remove('an-tablet-typing')})},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('an-tablet-typing'))document.activeElement.blur();if(e.key==='Escape')closePalette()});
window.visualViewport?.addEventListener('resize',viewport);
document.addEventListener('click',e=>{if(!tablet())return;const b=e.target.closest?.('.an-v2-tabs button');if(b&&['Effects','Shadow'].includes(b.textContent.trim())){e.preventDefault();e.stopImmediatePropagation();tools.classList.remove('sheet-open');showPalette(b.textContent.trim())}},true);
})();
