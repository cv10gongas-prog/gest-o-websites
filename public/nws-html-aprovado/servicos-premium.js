(()=>{
'use strict';
const tabs=Array.from(document.querySelectorAll('[data-sv-tab]'));
const panels=Array.from(document.querySelectorAll('.sv-panel[role="tabpanel"]'));
const active=(name,focus=false)=>{
  for(const tab of tabs){const selected=tab.dataset.svTab===name;tab.classList.toggle('is-selected',selected);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();}
  for(const p of panels){p.hidden=p.id!==`sv-panel-${name}`;}
};
tabs.forEach((tab,i)=>{
 tab.addEventListener('click',()=>active(tab.dataset.svTab));
 tab.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  let index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  active(tabs[index].dataset.svTab,true);
 });
});
active('website');
})();
