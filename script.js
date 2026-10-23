const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const lockScreen=$('#lockScreen'), homeScreen=$('#homeScreen'), pagesContainer=$('#pagesContainer');
const passcodeOverlay=$('#passcodeOverlay'), passcodeDots=$('#passcodeDots').children, passcodeError=$('#passcodeError');
const keypad=$('.keypad'), appView=$('#appView'), appTitle=$('#appTitle'), appContent=$('#appContent'), dots=$$('.dot');
const STORE='ryryry-simulator-v2';
const saved = (()=>{try{return JSON.parse(localStorage.getItem(STORE))||{}}catch(e){return {}}})();
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(saved))}catch(e){}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const appNames={messages:'信息',mail:'邮件',notes:'备忘录',camera:'相机',instagram:'Instagram',browser:'浏览器',settings:'设置',x:'X',kakaotalk:'KakaoTalk',phone:'电话',xiaohongshu:'小红书',voice:'语音备忘录',photos:'照片',contacts:'通讯录',calendar:'日历'};
const icons={messages:'💬',mail:'✉️',notes:'📝',camera:'📷',instagram:'📸',browser:'🧭',settings:'⚙️',x:'𝕏',kakaotalk:'🟡',phone:'📞',xiaohongshu:'📕',voice:'🎙️',photos:'🌄',contacts:'👤',calendar:'📅'};
let currentApp='', currentPasscode='';
const correctPasscode='1107';
function showPasscode(){passcodeOverlay.classList.add('show')}
function resetPasscode(){currentPasscode='';updateDots()}
function hidePasscode(){passcodeOverlay.classList.remove('show');resetPasscode()}
$('.lock-content')?.addEventListener('click',showPasscode);
$('.lock-hint')?.addEventListener('click',showPasscode);
$('#btnFlashlight')?.addEventListener('click',e=>{e.stopPropagation();toast('手电筒快捷入口（网页无法控制真实闪光灯）')});
$('#btnCamera')?.addEventListener('click',e=>{e.stopPropagation();openApp('camera')});
keypad?.addEventListener('click',e=>{const b=e.target.closest('.key');if(!b||b.classList.contains('key-empty'))return;if(b.id==='keyDelete')currentPasscode=currentPasscode.slice(0,-1);else if(currentPasscode.length<4)currentPasscode+=b.dataset.key;updateDots();if(currentPasscode.length===4)setTimeout(checkPasscode,180)});
function updateDots(){[...passcodeDots].forEach((d,i)=>d.classList.toggle('filled',i<currentPasscode.length))}
function checkPasscode(){if(currentPasscode===correctPasscode){hidePasscode();lockScreen.classList.remove('active');homeScreen.classList.add('active')}else{passcodeError.classList.add('show');keypad.classList.add('shake');setTimeout(()=>{passcodeError.classList.remove('show');keypad.classList.remove('shake');resetPasscode()},650)}}
function toast(message){let t=$('#simToast');if(!t){t=document.createElement('div');t.id='simToast';t.className='sim-toast';document.body.append(t)}t.textContent=message;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}
let currentPage=0;const totalPages=2;
function updatePageIndicator(){pagesContainer.style.transform=`translateX(-${currentPage*50}%)`;dots.forEach((d,i)=>d.classList.toggle('active',i===currentPage))}
dots.forEach(d=>d.addEventListener('click',()=>{currentPage=Number(d.dataset.page);updatePageIndicator()}));
let startX=0,isDragging=false;
const startSwipe=x=>{startX=x;isDragging=true},endSwipe=x=>{if(!isDragging)return;isDragging=false;const delta=startX-x;if(Math.abs(delta)>55){currentPage=Math.max(0,Math.min(totalPages-1,currentPage+(delta>0?1:-1)));updatePageIndicator()}};
homeScreen.addEventListener('touchstart',e=>startSwipe(e.touches[0].clientX),{passive:true});
homeScreen.addEventListener('touchend',e=>endSwipe(e.changedTouches[0].clientX),{passive:true});
homeScreen.addEventListener('mousedown',e=>{if(!e.target.closest('.app-item,.widget,.dot'))startSwipe(e.clientX)});
window.addEventListener('mouseup',e=>endSwipe(e.clientX));
$$('.app-item[data-app]').forEach(item=>item.addEventListener('click',e=>{e.stopPropagation();openApp(item.dataset.app)}));
$('.widget-calendar')?.addEventListener('click',()=>openApp('calendar'));
$('#backBtn').addEventListener('click',()=>{appView.classList.remove('open');currentApp=''});
function openApp(name){currentApp=name;appTitle.textContent=appNames[name]||name;renderApp(name);appView.classList.add('open');}
function actionButton(label,action,cls=''){return `<button class="sim-btn ${cls}" data-action="${action}">${label}</button>`}
function field(label,id,value='',placeholder=''){return `<label class="sim-field">${label}<input id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`}
function emptyState(icon,title,desc=''){return `<div class="sim-empty"><div>${icon}</div><strong>${title}</strong><p>${desc}</p></div>`}
function renderApp(name){
 const c=appContent;
 const wrap=(inner,sub='')=>`<div class="sim-app ${name}"><div class="sim-app-subtitle">${sub}</div>${inner}</div>`;
 if(name==='notes'){
  const notes=saved.notes||[];c.innerHTML=wrap(`<div class="sim-toolbar">${actionButton('＋ 新建备忘录','new-note')}</div><div id="noteEditor"></div><div class="sim-list">${notes.length?notes.map((n,i)=>`<button class="sim-list-row" data-action="edit-note" data-index="${i}"><span class="sim-row-icon">📝</span><span><b>${esc(n.title||'新备忘录')}</b><small>${esc(n.body||'没有其他内容')}</small></span><span>›</span></button>`).join(''):emptyState('📝','还没有备忘录','点击“新建备忘录”记录想法')}</div>`,'随手记录你的灵感');return;
 }
 if(name==='contacts'){
  const contacts=saved.contacts||[{name:'小雨',phone:'138 0000 1107',note:'好朋友'},{name:'妈妈',phone:'138 0000 0001',note:'家人'}];
  c.innerHTML=wrap(`<div class="sim-toolbar">${actionButton('＋ 添加联系人','new-contact')}</div><div id="contactEditor"></div><input class="sim-search" id="contactSearch" placeholder="搜索姓名或号码"><div class="sim-list" id="contactList">${contacts.map((p,i)=>contactRow(p,i)).join('')}</div>`,'你的联系人');return;
 }
 if(name==='photos'){
  const photos=saved.photos||[];c.innerHTML=wrap(`<div class="sim-toolbar"><span>所有照片</span><label class="sim-btn upload-label">＋ 导入照片<input type="file" id="photoUpload" accept="image/*" multiple hidden></label></div><div class="photo-grid">${photos.map((p,i)=>`<div class="photo-tile"><img src="${p.data}" alt="照片"><button data-action="delete-photo" data-index="${i}" aria-label="删除">×</button></div>`).join('')}</div>${photos.length?'':emptyState('🌄','照片从这里开始','可以导入电脑里的图片，保存在这个模拟器中')}`,'回忆都在这里');return;
 }
 if(name==='voice'){
  const recs=saved.recordings||[];c.innerHTML=wrap(`<div class="voice-card"><div class="voice-orb">🎙️</div><h2 id="recordStatus">准备录音</h2><p>录音需要浏览器授权麦克风；若当前网页不支持，会提示原因。</p><div class="voice-controls">${actionButton('● 开始录音','record-start')}${actionButton('■ 停止','record-stop','secondary')}</div></div><div class="sim-list">${recs.map((r,i)=>`<div class="sim-list-row"><span class="sim-row-icon">🔊</span><span><b>${esc(r.name)}</b><small>${esc(r.date)}</small><audio controls src="${r.data}"></audio></span><button data-action="delete-recording" data-index="${i}">删除</button></div>`).join('')}</div>`,'轻轻一点，记录声音');return;
 }
 if(name==='camera'){
  c.innerHTML=wrap(`<div class="camera-stage"><div class="camera-preview" id="cameraPreview">📷<p>网页模拟相机</p><small>可以选择图片作为拍摄结果</small></div><label class="shutter"><input type="file" id="cameraUpload" accept="image/*" capture="environment" hidden>●</label><p class="sim-muted">电脑端选择图片；手机浏览器可能会打开相机。</p></div>`,'相机');return;
 }
 if(name==='settings'){
  const defaults=[['飞行模式','airplane',false],['无线局域网','wifi',true],['蓝牙','bluetooth',true],['深色模式','dark',false],['显示电量百分比','battery',true]];
  c.innerHTML=wrap(`<div class="settings-profile"><div class="profile-avatar">👤</div><div><b>我的 iPhone</b><p>网页模拟器 · 本地体验</p></div></div><div class="sim-list">${defaults.map(([label,key,def])=>`<label class="setting-row"><span>${label}</span><input type="checkbox" data-setting="${key}" ${((saved.settings||{})[key]??def)?'checked':''}></label>`).join('')}</div><div class="sim-list">${actionButton('更换锁屏壁纸','change-lock')}${actionButton('更换桌面壁纸','change-home')}${actionButton('重置本地模拟数据','reset-data','danger')}</div><p class="sim-muted">设置仅影响此网页模拟器，不会修改真实 iPhone 系统。</p>`,'设置');return;
 }
 if(name==='calendar'){
  const d=new Date();c.innerHTML=wrap(`<div class="calendar-hero"><div>${d.getFullYear()}年 ${d.getMonth()+1}月</div><strong>${d.getDate()}</strong><span>${['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()]}</span></div><div class="sim-card"><h3>日程安排</h3><p>今天暂时没有日程。给自己留一点自由时间吧。</p>${actionButton('＋ 添加日程','add-event')}</div><div id="eventList">${(saved.events||[]).map((e,i)=>`<div class="sim-list-row"><span>📅</span><span><b>${esc(e.title)}</b><small>${esc(e.date)}</small></span><button data-action="delete-event" data-index="${i}">删除</button></div>`).join('')}</div>`,'日程安排');return;
 }
 if(name==='phone'){
  c.innerHTML=wrap(`<div class="dial-display" id="dialDisplay"></div><div class="dial-pad">${'123456789*0#'.split('').map(n=>`<button data-dial="${n}">${n}</button>`).join('')}</div><div class="dial-actions">${actionButton('⌫ 删除','dial-delete','secondary')}${actionButton('📞 模拟拨号','dial-call','green')}</div><p class="sim-muted">这是模拟拨号，不会拨打真实电话。</p>`,'个人收藏');return;
 }
 if(name==='messages'||name==='mail'||name==='kakaotalk'){
  const isMail=name==='mail', isKakao=name==='kakaotalk', label=isMail?'收件箱':isKakao?'聊天':'信息';
  const items=saved[name]||[];
  c.innerHTML=wrap(`<div class="sim-toolbar"><b>${label}</b>${actionButton(isMail?'＋ 写邮件':'＋ 新对话', 'new-message')}</div><div id="messageEditor"></div><div class="sim-list">${items.length?items.map((m,i)=>`<div class="sim-list-row"><span class="sim-row-icon">${isMail?'✉️':'💬'}</span><span><b>${esc(m.to||'新对话')}</b><small>${esc(m.body)}</small><small>${esc(m.date||'刚刚')}</small></span><button data-action="delete-message" data-index="${i}">×</button></div>`).join(''):emptyState(isMail?'✉️':'💬',isMail?'收件箱是空的':'还没有对话','点击上方按钮，创建一条模拟消息')}</div><p class="sim-muted">消息仅保存在当前浏览器，不会发送到真实联系人。</p>`,'与朋友保持联系');return;
 }
 if(name==='instagram'||name==='x'||name==='xiaohongshu'){
  const social=name==='xiaohongshu'?'小红书':name==='instagram'?'Instagram':'X';
  const posts=saved['posts_'+name]||[];
  c.innerHTML=wrap(`<div class="social-profile"><div class="social-avatar">${icons[name]}</div><div><b>${social} · 我的主页</b><p>记录生活，分享此刻</p></div></div><div class="sim-toolbar">${actionButton('＋ 发布动态','new-post')}</div><div id="postEditor"></div><div class="social-feed">${posts.map((p,i)=>`<article class="post-card"><div class="post-author">${icons[name]} <b>${esc(p.title||'我的日常')}</b></div><p>${esc(p.body)}</p>${p.image?`<img class="post-image" src="${p.image}">`:''}<div class="post-actions"><button data-action="like-post" data-index="${i}">♡ ${p.likes||0} 喜欢</button><button data-action="delete-post" data-index="${i}">删除</button></div></article>`).join('')||emptyState(icons[name],'还没有动态','发布第一条内容，开始记录生活吧')}</div><p class="sim-muted">这是本地社交应用演示，不会连接真实平台账号。</p>`,'发现美好生活');return;
 }
 if(name==='browser'){
  c.innerHTML=wrap(`<form class="browser-form" id="browserForm"><span>🔍</span><input id="browserUrl" placeholder="输入网址或搜索内容" value="https://www.apple.com"><button>前往</button></form><div class="browser-shortcuts">${[['Apple','https://www.apple.com'],['Bing','https://www.bing.com'],['GitHub','https://github.com']].map(x=>`<button data-url="${x[1]}"><span>🌐</span>${x[0]}</button>`).join('')}</div><div class="browser-note">网页将在独立浏览器标签页打开。<p>为了安全和兼容性，模拟器不直接把外部网页嵌入手机内。</p></div>`,'搜索或输入网址');return;
 }
 if(name==='instagram' || name==='x') return;
 if(name==='camera')return;
 c.innerHTML=wrap(`<div class="sim-app-hero">${icons[name]||'📱'}</div><h2>${appNames[name]||name}</h2><p class="sim-muted">欢迎来到${appNames[name]||name}模拟应用。</p><div class="sim-card"><h3>功能说明</h3><p>这里是可交互的网页模拟体验。部分真实系统功能（例如真实电话、平台账号登录）无法由普通网页直接执行。</p>${actionButton('返回桌面','go-home')}</div>`,'欢迎使用');
}
function contactRow(p,i){return `<div class="sim-list-row"><span class="contact-avatar">${esc((p.name||'?').slice(0,1))}</span><span><b>${esc(p.name)}</b><small>${esc(p.phone)}</small><small>${esc(p.note||'')}</small></span><button data-action="delete-contact" data-index="${i}">删除</button></div>`}
function editorNote(index=null){const n=index===null?{title:'',body:''}:saved.notes[index];$('#noteEditor').innerHTML=`<div class="editor-card">${field('标题','noteTitle',n.title,'新备忘录')}<label class="sim-field">内容<textarea id="noteBody" rows="4" placeholder="开始输入...">${esc(n.body)}</textarea></label>${actionButton('保存','save-note')}${actionButton('取消','cancel-editor','secondary')}<input type="hidden" id="noteIndex" value="${index===null?'':index}"></div>`}
function renderEditor(id,html){const el=$('#'+id);if(el)el.innerHTML=html}
appContent.addEventListener('click',async e=>{
 const act=e.target.closest('[data-action]')?.dataset.action;
 if(act){
  const index=Number(e.target.closest('[data-index]')?.dataset.index);
  if(act==='new-note')editorNote();
  if(act==='edit-note')editorNote(index);
  if(act==='cancel-editor')renderEditor('noteEditor','');
  if(act==='save-note'){const title=$('#noteTitle').value.trim(),body=$('#noteBody').value.trim(),v=$('#noteIndex').value;if(!body&&!title){toast('先写一点内容吧');return}saved.notes=saved.notes||[];const item={title:title||'新备忘录',body,date:new Date().toLocaleString()};if(v==='')saved.notes.unshift(item);else saved.notes[Number(v)]=item;persist();renderApp('notes');toast('备忘录已保存')}
  if(act==='new-contact')renderEditor('contactEditor',`<div class="editor-card">${field('姓名','newContactName','','输入姓名')}${field('电话号码','newContactPhone','','输入号码')}${field('备注','newContactNote','','选填')}${actionButton('保存联系人','save-contact')}${actionButton('取消','cancel-contact','secondary')}</div>`);
  if(act==='cancel-contact')renderEditor('contactEditor','');
  if(act==='save-contact'){const name=$('#newContactName').value.trim(),phone=$('#newContactPhone').value.trim(),note=$('#newContactNote').value.trim();if(!name){toast('请填写姓名');return}saved.contacts=saved.contacts||[{name:'小雨',phone:'138 0000 1107',note:'好朋友'},{name:'妈妈',phone:'138 0000 0001',note:'家人'}];saved.contacts.unshift({name,phone,note});persist();renderApp('contacts');toast('联系人已保存')}
  if(act==='delete-contact'){saved.contacts.splice(index,1);persist();renderApp('contacts')}
  if(act==='delete-photo'){saved.photos.splice(index,1);persist();renderApp('photos')}
  if(act==='delete-recording'){saved.recordings.splice(index,1);persist();renderApp('voice')}
  if(act==='new-message'){const mail=currentApp==='mail';renderEditor('messageEditor',`<div class="editor-card">${field(mail?'收件人':'联系人','msgTo','','输入姓名')}${mail?field('主题','msgSubject','','邮件主题'):''}<label class="sim-field">内容<textarea id="msgBody" rows="3" placeholder="输入内容..."></textarea></label>${actionButton('保存到模拟收件箱','save-message')}${actionButton('取消','cancel-message','secondary')}</div>`)}
  if(act==='cancel-message')renderEditor('messageEditor','');
  if(act==='save-message'){const to=$('#msgTo').value.trim()||'新对话',body=$('#msgBody').value.trim();if(!body){toast('请输入内容');return}saved[currentApp]=saved[currentApp]||[];saved[currentApp].unshift({to,body,date:new Date().toLocaleString()});persist();renderApp(currentApp);toast('已保存（模拟发送）')}
  if(act==='delete-message'){saved[currentApp].splice(index,1);persist();renderApp(currentApp)}
  if(act==='new-post')renderEditor('postEditor',`<div class="editor-card">${field('标题','postTitle','','给这条动态起个标题')}<label class="sim-field">内容<textarea id="postBody" rows="4" placeholder="分享你的生活..."></textarea></label><label class="sim-field">添加图片（选填）<input type="file" id="postImage" accept="image/*"></label>${actionButton('发布','publish-post')}${actionButton('取消','cancel-post','secondary')}</div>`);
  if(act==='cancel-post')renderEditor('postEditor','');
  if(act==='publish-post'){const body=$('#postBody').value.trim(),title=$('#postTitle').value.trim();if(!body&&!title){toast('写点内容再发布吧');return}const file=$('#postImage').files[0];const publish=data=>{const key='posts_'+currentApp;saved[key]=saved[key]||[];saved[key].unshift({title,body,image:data||'',likes:0});persist();renderApp(currentApp);toast('动态已发布到本地')};if(file){const r=new FileReader();r.onload=()=>publish(r.result);r.readAsDataURL(file)}else publish('')}
  if(act==='like-post'){const arr=saved['posts_'+currentApp];arr[index].likes=(arr[index].likes||0)+1;persist();renderApp(currentApp)}
  if(act==='delete-post'){saved['posts_'+currentApp].splice(index,1);persist();renderApp(currentApp)}
  if(act==='go-home'){appView.classList.remove('open');currentApp=''}
  if(act==='change-lock'||act==='change-home'){const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=()=>{const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const bg=act==='change-lock'?'.lock-bg':'.home-bg';$(bg).style.backgroundImage=`url("${r.result}")`;try{localStorage.setItem('ryryry-'+act,r.result)}catch(e){toast('图片太大，已临时更换但无法持久保存')}};r.readAsDataURL(f)};input.click()}
  if(act==='reset-data'){if(confirm('确定清除模拟器保存的备忘录、联系人、动态和设置吗？')){localStorage.removeItem(STORE);Object.keys(saved).forEach(k=>delete saved[k]);renderApp('settings');toast('本地模拟数据已重置')}}
  if(act==='add-event'){renderEditor('eventList',`<div class="editor-card">${field('日程名称','eventTitle','','输入日程')}<input id="eventDate" type="datetime-local">${actionButton('保存日程','save-event')}${actionButton('取消','cancel-event','secondary')}</div>`)}
  if(act==='save-event'){const title=$('#eventTitle').value.trim(),date=$('#eventDate').value;if(!title){toast('请输入日程名称');return}saved.events=saved.events||[];saved.events.push({title,date:date||'未设置时间'});persist();renderApp('calendar')}
  if(act==='cancel-event')renderApp('calendar');
  if(act==='dial-delete'){const d=$('#dialDisplay');d.textContent=d.textContent.slice(0,-1)}
  if(act==='dial-call')toast('模拟拨号：'+($('#dialDisplay').textContent||'请先输入号码'))
  if(act==='record-start')startRecording();
  if(act==='record-stop')stopRecording();
 }
 const dial=e.target.closest('[data-dial]');if(dial)$('#dialDisplay').textContent+=dial.dataset.dial;
 const shortcut=e.target.closest('[data-url]');if(shortcut)window.open(shortcut.dataset.url,'_blank','noopener');
});
appContent.addEventListener('change',e=>{
 if(e.target.matches('[data-setting]')){saved.settings=saved.settings||{};saved.settings[e.target.dataset.setting]=e.target.checked;persist();document.body.classList.toggle('sim-dark',!!saved.settings.dark);toast('设置已保存')}
 if(e.target.id==='photoUpload'||e.target.id==='cameraUpload'){const files=[...e.target.files];files.forEach(file=>{const reader=new FileReader();reader.onload=()=>{if(e.target.id==='photoUpload'){saved.photos=saved.photos||[];saved.photos.unshift({data:reader.result});persist();renderApp('photos')}else{$('#cameraPreview').innerHTML=`<img class="camera-result" src="${reader.result}"><p>照片预览</p>`;saved.photos=saved.photos||[];saved.photos.unshift({data:reader.result});persist();toast('已拍摄并保存到照片')}};reader.readAsDataURL(file)})}
});
appContent.addEventListener('input',e=>{if(e.target.id==='contactSearch'){const q=e.target.value.toLowerCase();$$('#contactList .sim-list-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}});
let mediaRecorder=null,recordChunks=[];
async function startRecording(){try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('浏览器不支持麦克风录音');const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];mediaRecorder=new MediaRecorder(stream);mediaRecorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};mediaRecorder.onstop=()=>{const blob=new Blob(recordChunks,{type:mediaRecorder.mimeType||'audio/webm'});const reader=new FileReader();reader.onload=()=>{saved.recordings=saved.recordings||[];saved.recordings.unshift({name:'录音 '+new Date().toLocaleTimeString(),date:new Date().toLocaleString(),data:reader.result});persist();if(currentApp==='voice')renderApp('voice');toast('录音已保存')};reader.readAsDataURL(blob);stream.getTracks().forEach(t=>t.stop())};mediaRecorder.start();$('#recordStatus').textContent='正在录音…';toast('录音开始')}catch(err){toast('无法录音：请使用 HTTPS 并允许麦克风权限')}}
function stopRecording(){if(mediaRecorder&&mediaRecorder.state!=='inactive'){mediaRecorder.stop();$('#recordStatus').textContent='录音已停止'}else toast('当前没有正在进行的录音')}
appContent.addEventListener('submit',e=>{if(e.target.id==='browserForm'){e.preventDefault();let url=$('#browserUrl').value.trim();if(!url)return;if(!/^https?:\/\//i.test(url)){url=/\./.test(url)&&!/\s/.test(url)?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url)}window.open(url,'_blank','noopener');}});
function updateClock(){const now=new Date(),time=now.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),month=now.getMonth()+1,day=now.getDate(),week=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()],dateStr=`${month}月${day}日 ${week}`;['lockTime','lockStatusTime','statusTime'].forEach(id=>{const el=$('#'+id);if(el)el.textContent=time});if($('#lockDateTop'))$('#lockDateTop').textContent=dateStr;if($('#widgetCalDay'))$('#widgetCalDay').textContent=day;if($('#widgetCalWeek'))$('#widgetCalWeek').textContent=week;if($('#widgetCalMonth'))$('#widgetCalMonth').textContent=`${month}月`}
updateClock();setInterval(updateClock,1000);
try{const lock=localStorage.getItem('ryryry-change-lock'),home=localStorage.getItem('ryryry-change-home');if(lock) $('.lock-bg').style.backgroundImage=`url("${lock}")`;if(home) $('.home-bg').style.backgroundImage=`url("${home}")`;document.body.classList.toggle('sim-dark',!!saved.settings?.dark)}catch(e){}
