'use strict';
const $ = id => document.getElementById(id);
const keys = ['about','services','floors','offices','hours','nearby'];
const labels = ['التعريف بالمبنى','الخدمات','الطوابق','المكاتب','الساعات المكتبية','المباني القريبة'];
const coords = [[-.34,.19],[0,.19],[.34,.19],[-.34,-.19],[0,-.19],[.34,-.19]];
let building, running = false, selected = null;
const scene = $('scene'), anchor = $('anchor');
function showError(message){$('error').textContent=message;$('error').hidden=false;setTimeout(()=>$('error').hidden=true,6500)}
function closeSheet(){ $('sheet').hidden=true;$('sheet-backdrop').hidden=true;selected=null; }
function openSheet(key){const section=building?.sections?.[key];if(!section)return;selected=key;$('sheet-title').textContent=section.title;$('sheet-content').replaceChildren();if(section.text){const p=document.createElement('p');p.textContent=section.text;$('sheet-content').append(p)}if(Array.isArray(section.items)){const ul=document.createElement('ul');section.items.forEach(value=>{const li=document.createElement('li');li.textContent=value;ul.append(li)});$('sheet-content').append(ul)}$('sheet').hidden=false;$('sheet-backdrop').hidden=false;$('close-sheet').focus()}
function createHotspots(){
  const parent=$('hotspots');
  const positions=[[-.33,.20],[0,.20],[.33,.20],[-.33,-.20],[0,-.20],[.33,-.20]];
  keys.forEach((key,i)=>{
    const [x,y]=positions[i];
    const entity=document.createElement('a-entity');
    entity.setAttribute('position',x+' '+y+' 0.06');
    entity.setAttribute('data-section',key);
    const card=document.createElement('a-plane');
    card.setAttribute('class','tap-target');
    card.setAttribute('width','.30');
    card.setAttribute('height','.14');
    card.setAttribute('material','color: #ffffff; opacity: .96; transparent: true; side: double; depthTest: false');
    const marker=document.createElement('a-circle');
    marker.setAttribute('radius','.041');
    marker.setAttribute('color','#1267a0');
    marker.setAttribute('position','-.104 0 .006');
    const digit=document.createElement('a-text');
    digit.setAttribute('value',String(i+1));
    digit.setAttribute('align','center');
    digit.setAttribute('color','#ffffff');
    digit.setAttribute('width','.24');
    digit.setAttribute('position','-.104 -.015 .012');
    const label=document.createElement('a-text');
    // Arabic text shaping is not reliably supported by A-Frame fonts.
    // Use a short English label inside the tracked marker; the detail sheet remains Arabic.
    label.setAttribute('value',['BUILDING','SERVICES','FLOORS','OFFICES','HOURS','NEARBY'][i]);
    label.setAttribute('align','center');
    label.setAttribute('color','#103b5b');
    label.setAttribute('width','.48');
    label.setAttribute('position','.042 -.015 .012');
    entity.append(card,marker,digit,label);
    parent.append(entity);
    const handler=()=>openSheet(key);
    card.addEventListener('click',handler);
    marker.addEventListener('click',handler);
    label.addEventListener('click',handler);
  });
}
async function loadData(){const response=await fetch('./data/building.json',{cache:'no-store'});if(!response.ok)throw new Error('تعذّر تحميل بيانات المبنى');const json=await response.json();if(json.isDemo!==true||!json.buildings?.[0]?.sections)throw new Error('ملف بيانات التجربة غير صالح');building=json.buildings[0];}
async function start(){if(running)return;const button=$('start');button.disabled=true;button.textContent='جارٍ تهيئة التجربة…';try{if(!window.isSecureContext && location.hostname!=='localhost' && location.hostname!=='127.0.0.1')throw new Error('يلزم فتح الموقع عبر HTTPS لتشغيل الكاميرا');if(!navigator.mediaDevices?.getUserMedia)throw new Error('هذا المتصفح لا يدعم الوصول إلى الكاميرا');await loadData();$('intro').hidden=true;$('experience').hidden=false;if(!scene.hasLoaded)await new Promise(resolve=>scene.addEventListener('loaded',resolve,{once:true}));await scene.systems['mindar-image-system'].start();running=true;}catch(err){console.error('Campus Vision AR:',err);$('intro').hidden=false;$('experience').hidden=true;showError(err.message||'تعذّر تشغيل الكاميرا. تحقّق من الأذونات وأعد المحاولة.')}finally{button.disabled=false;button.textContent='ابدأ التجربة ←'}}
async function stop(){closeSheet();if(running){try{await scene.systems['mindar-image-system'].stop()}catch(err){console.warn(err)}}running=false;$('experience').hidden=true;$('intro').hidden=false;$('hint').classList.remove('found')}
anchor.addEventListener('targetFound',()=>{$('hint').classList.add('found')});anchor.addEventListener('targetLost',()=>{$('hint').classList.remove('found');closeSheet()});
$('start').addEventListener('click',start);$('exit').addEventListener('click',stop);$('close-sheet').addEventListener('click',closeSheet);$('sheet-backdrop').addEventListener('click',closeSheet);document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSheet()});createHotspots();
