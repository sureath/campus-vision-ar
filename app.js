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
// Arabic HTML hotspots are projected from the tracked image's 3D coordinates.
const hotspotButtons=[];
let trackingVisible=false;
let animationStarted=false;
function createHotspots(){
  const layer=document.createElement('div');
  layer.id='tracked-hotspots';
  layer.className='tracked-hotspots';
  layer.hidden=true;
  $('experience').append(layer);
  const symbols=['⌂','✦','▤','▦','◷','⌖'];
  keys.forEach((key,i)=>{
    const button=document.createElement('button');
    button.type='button';
    button.className='tracked-hotspot';
    button.innerHTML='<span class="tracked-icon" aria-hidden="true">'+symbols[i]+'</span><span class="tracked-label">'+labels[i]+'</span>';
    button.setAttribute('aria-label',labels[i]);
    button.addEventListener('click',()=>openSheet(key));
    layer.append(button);
    hotspotButtons.push(button);
  });
}
function projectHotspots(){
  requestAnimationFrame(projectHotspots);
  if(!trackingVisible || !running || !scene.camera || !anchor.object3D.visible)return;
  const bounds=$('experience').getBoundingClientRect();
  if(!bounds.width || !bounds.height)return;
  const camera=scene.camera;
  camera.updateMatrixWorld(true);
  anchor.object3D.updateWorldMatrix(true,false);
  coords.forEach(([x,y],i)=>{
    const point=new THREE.Vector3(x,y,0.04);
    anchor.object3D.localToWorld(point);
    point.project(camera);
    const button=hotspotButtons[i];
    const inFrame=point.z>=-1&&point.z<=1&&Math.abs(point.x)<=1&&Math.abs(point.y)<=1;
    button.hidden=!inFrame;
    if(inFrame){
      button.style.left=((point.x+1)*0.5*bounds.width)+'px';
      button.style.top=((1-point.y)*0.5*bounds.height)+'px';
    }
  });
}
function showTrackedHotspots(show){
  trackingVisible=show;
  $('tracked-hotspots').hidden=!show;
  if(show&&!animationStarted){animationStarted=true;requestAnimationFrame(projectHotspots)}
  if(!show)closeSheet();
}
async function loadData(){const response=await fetch('./data/building.json',{cache:'no-store'});if(!response.ok)throw new Error('تعذّر تحميل بيانات المبنى');const json=await response.json();if(json.isDemo!==true||!json.buildings?.[0]?.sections)throw new Error('ملف بيانات التجربة غير صالح');building=json.buildings[0];}
async function start(){if(running)return;const button=$('start');button.disabled=true;button.textContent='جارٍ تهيئة التجربة…';try{if(!window.isSecureContext && location.hostname!=='localhost' && location.hostname!=='127.0.0.1')throw new Error('يلزم فتح الموقع عبر HTTPS لتشغيل الكاميرا');if(!navigator.mediaDevices?.getUserMedia)throw new Error('هذا المتصفح لا يدعم الوصول إلى الكاميرا');await loadData();$('intro').hidden=true;$('experience').hidden=false;if(!scene.hasLoaded)await new Promise(resolve=>scene.addEventListener('loaded',resolve,{once:true}));await scene.systems['mindar-image-system'].start();running=true;}catch(err){console.error('Campus Vision AR:',err);$('intro').hidden=false;$('experience').hidden=true;showError(err.message||'تعذّر تشغيل الكاميرا. تحقّق من الأذونات وأعد المحاولة.')}finally{button.disabled=false;button.textContent='ابدأ التجربة ←'}}
async function stop(){showTrackedHotspots(false);closeSheet();if(running){try{await scene.systems['mindar-image-system'].stop()}catch(err){console.warn(err)}}running=false;$('experience').hidden=true;$('intro').hidden=false;$('hint').classList.remove('found')}
anchor.addEventListener('targetFound',()=>{$('hint').classList.add('found');showTrackedHotspots(true)});anchor.addEventListener('targetLost',()=>{$('hint').classList.remove('found');showTrackedHotspots(false)});
$('start').addEventListener('click',start);$('exit').addEventListener('click',stop);$('close-sheet').addEventListener('click',closeSheet);$('sheet-backdrop').addEventListener('click',closeSheet);document.addEventListener('keydown',event=>{if(event.key==='Escape')closeSheet()});createHotspots();
