const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const lockScreen=$('#lockScreen'), homeScreen=$('#homeScreen'), pagesContainer=$('#pagesContainer');
const passcodeOverlay=$('#passcodeOverlay'), passcodeDots=$('#passcodeDots').children, passcodeError=$('#passcodeError');
const keypad=$('.keypad'), appView=$('#appView'), appTitle=$('#appTitle'), appContent=$('#appContent'), dots=$$('.dot');
const STORE='ryryry-simulator-v3-content';
const saved = (()=>{try{return JSON.parse(localStorage.getItem(STORE))||{}}catch(e){return {}}})();
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(saved))}catch(e){}};
// 首次打开时填充可编辑的中文演示内容；用户已有数据不会被覆盖。
const demoData={
 notes:[
  {title:'周末想做的事',body:`☕ 找一家喜欢的咖啡店\n📷 整理最近拍的照片\n🎧 听完收藏的歌单`,date:'今天'},
  {title:'随手记',body:'慢一点也没关系，把喜欢的日常认真记录下来。',date:'昨天'}
 ],
 contacts:[
  {name:'小雨',phone:'138 0000 1107',note:'好朋友'},
  {name:'林同学',phone:'138 0000 2024',note:'一起出去玩的人'},
  {name:'妈妈',phone:'138 0000 0001',note:'家人'},
  {name:'阿哲',phone:'139 0000 1028',note:'朋友'}
 ],
 messages:[
  {to:'小雨',body:'到家跟我说一声呀～',date:'今天 21:18'},
  {to:'妈妈',body:'周末有空的话给你打电话。',date:'今天 18:42'},
  {to:'林同学',body:'照片我整理好再发给你！',date:'昨天 16:20'}
 ],
 mail:[
  {to:'自己',body:'周末计划：整理照片、听歌、出门走走。',date:'今天 09:30'},
  {to:'小雨',body:`主题：上次拍的照片\n我先把照片整理一下，晚点发你。`,date:'昨天 20:15'}
 ],
 kakaotalk:[
  {to:'지민 / 智敏',body:'오늘 뭐 해? 😊（今天做什么呀？）',date:'今天 20:35'},
  {to:'친구들 / 好友群',body:'周末一起去喝咖啡吗？',date:'今天 17:06'}
 ],
 'posts_instagram':[
  {title:'最近的日常 📷',body:'一些普通但很喜欢的瞬间。生活碎片慢慢收集。',image:'',likes:24},
  {title:'☁️ 慢慢来',body:'把今天也过成自己喜欢的样子。',image:'',likes:16}
 ],
 'posts_x':[
  {title:'随手记录',body:'希望最近的每一天，都有一点小小的开心。',image:'',likes:8},
  {title:'今天',body:'听着喜欢的歌走路，感觉时间都变慢了。',image:'',likes:12}
 ],
 'posts_xiaohongshu':[
  {title:'我的日常碎片｜最近喜欢的生活节奏',body:`不赶时间，出门走走，拍几张喜欢的照片，再找个地方喝咖啡。\n普通日子也值得被记录 ✨`,image:'',likes:36},
  {title:'📸 手机相册里的小确幸',body:'随手拍下的光影、街角和天空，回头看都变成了很可爱的回忆。',image:'',likes:21}
 ],
 events:[
  {title:'整理相册',date:'今天 16:00'},
  {title:'和朋友喝咖啡',date:'明天 14:30'}
 ],
 photos:[1,2,3,4,5,6,7].map(n=>({data:`photos/${n}.jpg`,demo:true}))
};
Object.entries(demoData).forEach(([key,value])=>{if(!Object.prototype.hasOwnProperty.call(saved,key))saved[key]=value});
persist();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const appNames={messages:'信息',mail:'邮件',notes:'备忘录',camera:'相机',instagram:'Instagram',browser:'浏览器',settings:'设置',x:'X',kakaotalk:'KakaoTalk',phone:'电话',xiaohongshu:'小红书',voice:'语音备忘录',photos:'照片',contacts:'通讯录',calendar:'日历'};
const icons={messages:'💬',mail:'✉️',notes:'📝',camera:'📷',instagram:'📸',browser:'🧭',settings:'⚙️',x:'𝕏',kakaotalk:'🟡',phone:'📞',xiaohongshu:'📕',voice:'🎙️',photos:'🌄',contacts:'👤',calendar:'📅'};
let currentApp='', currentPasscode='';
const correctPasscode='1107';
function showPasscode(){
 if(!lockScreen.classList.contains('active') || passcodeOverlay.classList.contains('show')) return;
 passcodeError.classList.remove('show');
 passcodeOverlay.classList.add('show');
}
function resetPasscode(){currentPasscode='';updateDots()}
function hidePasscode(){passcodeOverlay.classList.remove('show');passcodeError.classList.remove('show');resetPasscode()}
// 点按或向上滑动都可调出密码键盘，兼容手机触摸和桌面鼠标。
let lockGestureStart=null;
lockScreen.addEventListener('touchstart',e=>{
 if(passcodeOverlay.classList.contains('show') || e.target.closest('.lock-bottom-actions,.passcode-overlay')) return;
 const t=e.changedTouches[0]; lockGestureStart={x:t.clientX,y:t.clientY};
},{passive:true});
lockScreen.addEventListener('touchend',e=>{
 if(!lockGestureStart) return;
 const t=e.changedTouches[0], dx=t.clientX-lockGestureStart.x, dy=t.clientY-lockGestureStart.y;
 lockGestureStart=null;
 if(dy < -35 && Math.abs(dy)>Math.abs(dx)*1.15) showPasscode();
},{passive:true});
let lockPointerStart=null;
lockScreen.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch' || passcodeOverlay.classList.contains('show') || e.target.closest('.lock-bottom-actions,.passcode-overlay')) return;
 lockPointerStart={x:e.clientX,y:e.clientY};
});
lockScreen.addEventListener('pointerup',e=>{
 if(!lockPointerStart) return;
 const dx=e.clientX-lockPointerStart.x, dy=e.clientY-lockPointerStart.y; lockPointerStart=null;
 if(dy < -35 && Math.abs(dy)>Math.abs(dx)*1.15) showPasscode();
});
$('.lock-content')?.addEventListener('click',e=>{if(!e.target.closest('.lock-hint')) showPasscode()});
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
let startX=0,isSwiping=false;
const startSwipe=x=>{startX=x;isSwiping=true},endSwipe=x=>{if(!isSwiping)return;isSwiping=false;const delta=startX-x;if(Math.abs(delta)>55){currentPage=Math.max(0,Math.min(totalPages-1,currentPage+(delta>0?1:-1)));updatePageIndicator()}};
homeScreen.addEventListener('touchstart',e=>{if(!e.target.closest('.app-item,.widget,.dot'))startSwipe(e.touches[0].clientX)},{passive:true});
homeScreen.addEventListener('touchend',e=>endSwipe(e.changedTouches[0].clientX),{passive:true});
homeScreen.addEventListener('mousedown',e=>{if(!e.target.closest('.app-item,.widget,.dot'))startSwipe(e.clientX)});
window.addEventListener('mouseup',e=>endSwipe(e.clientX));
// Long-press drag-and-drop for home screen icons.
let pressTimer=null,dragItem=null,dragging=false,dragStart=null,suppressAppClick=false,editMode=false;
function stopPressTimer(){if(pressTimer){clearTimeout(pressTimer);pressTimer=null}}
function persistIconOrder(){try{const order={};$$('.page').forEach((page,i)=>order['page'+(i+1)]=$$('.app-grid .app-item[data-app]',page).map(el=>el.dataset.app));order.dock=$$('.dock .app-item[data-app]').map(el=>el.dataset.app);localStorage.setItem('ryryry-icon-order',JSON.stringify(order))}catch(e){}}
function restoreIconOrder(){try{const order=JSON.parse(localStorage.getItem('ryryry-icon-order')||'null');if(!order)return;Object.entries(order).forEach(([key,apps])=>{const container=key==='dock'?$('.dock'):$(`#${key} .app-grid`);if(!container||!Array.isArray(apps))return;container.querySelectorAll('.app-item-empty').forEach(el=>el.remove());apps.forEach(app=>{const item=$$(`.app-item[data-app="${app}"]`).find(el=>container.contains(el));if(item)container.appendChild(item)})})}catch(e){}}
restoreIconOrder();
homeScreen.addEventListener('pointerdown',e=>{const item=e.target.closest('.app-item[data-app]');if(!item||e.button!==0)return;stopPressTimer();dragStart={x:e.clientX,y:e.clientY};pressTimer=setTimeout(()=>{editMode=true;dragItem=item;dragging=true;item.classList.add('is-dragging');toast('图标整理中：拖动图标调整位置')},380)},{passive:true});
homeScreen.addEventListener('pointermove',e=>{if(!dragStart)return;if(!dragging&&Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>10)stopPressTimer();if(!dragging||!dragItem)return;e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.app-item[data-app]');if(target&&target!==dragItem&&target.parentElement===dragItem.parentElement){const rect=target.getBoundingClientRect();dragItem.parentElement.insertBefore(dragItem,e.clientY<rect.top+rect.height/2?target:target.nextSibling)}},{passive:false});
function finishIconDrag(){stopPressTimer();if(dragItem){dragItem.classList.remove('is-dragging');dragItem=null}if(dragging){dragging=false;editMode=false;suppressAppClick=true;setTimeout(()=>suppressAppClick=false,280);persistIconOrder()}dragStart=null}
homeScreen.addEventListener('pointerup',()=>{if(dragging)finishIconDrag();else{stopPressTimer();dragStart=null}},{passive:true});
homeScreen.addEventListener('pointercancel',()=>{if(dragging)finishIconDrag();else{stopPressTimer();dragStart=null}},{passive:true});
homeScreen.addEventListener('click',e=>{const item=e.target.closest('.app-item[data-app]');if(!item)return;e.stopPropagation();if(suppressAppClick)return;openApp(item.dataset.app)});
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
  const photos=saved.photos||[];c.innerHTML=wrap(`<div class="sim-toolbar"><span>所有照片</span><span class="photo-count">${photos.length} 张照片</span></div><div class="photo-grid">${photos.map((p,i)=>`<button class="photo-tile" data-action="open-photo" data-index="${i}" aria-label="查看照片"><img src="${esc(p.data)}" alt="照片 ${i+1}"></button>`).join('')}</div>${photos.length?'':emptyState('🌄','还没有照片','用相机拍下喜欢的瞬间')}`,'回忆都在这里');return;
 }
 if(name==='voice'){
  const recs=saved.recordings||[];c.innerHTML=wrap(`<div class="voice-card"><div class="voice-orb">🎙️</div><h2 id="recordStatus">准备录音</h2><p>录音需要浏览器授权麦克风；若当前网页不支持，会提示原因。</p><div class="voice-controls">${actionButton('● 开始录音','record-start')}${actionButton('■ 停止','record-stop','secondary')}</div></div><div class="sim-list">${recs.map((r,i)=>`<div class="sim-list-row"><span class="sim-row-icon">🔊</span><span><b>${esc(r.name)}</b><small>${esc(r.date)}</small><audio controls src="${r.data}"></audio></span><button data-action="delete-recording" data-index="${i}">删除</button></div>`).join('')}</div>`,'轻轻一点，记录声音');return;
 }
 if(name==='camera'){
  c.innerHTML=wrap(`<div class="camera-stage"><div class="camera-preview" id="cameraPreview">📷<p>准备拍摄</p><small>记录此刻</small></div><label class="shutter"><input type="file" id="cameraUpload" accept="image/*" capture="environment" hidden>●</label><p class="sim-muted">电脑端选择图片；手机浏览器可能会打开相机。</p></div>`,'相机');return;
 }
 if(name==='settings'){
  const defaults=[['飞行模式','airplane',false],['无线局域网','wifi',true],['蓝牙','bluetooth',true],['深色模式','dark',false],['显示电量百分比','battery',true]];
  c.innerHTML=wrap(`<div class="settings-profile"><div class="profile-avatar">👤</div><div><b>我的 iPhone</b><p>我的设备</p></div></div><div class="sim-list">${defaults.map(([label,key,def])=>`<label class="setting-row"><span>${label}</span><input type="checkbox" data-setting="${key}" ${((saved.settings||{})[key]??def)?'checked':''}></label>`).join('')}</div><div class="sim-list">${actionButton('更换锁屏壁纸','change-lock')}${actionButton('更换桌面壁纸','change-home')}${actionButton('重置本地模拟数据','reset-data','danger')}</div><p class="sim-muted">设置仅影响此网页模拟器，不会修改真实 iPhone 系统。</p>`,'设置');return;
 }
 if(name==='calendar'){
  const d=new Date();c.innerHTML=wrap(`<div class="calendar-hero"><div>${d.getFullYear()}年 ${d.getMonth()+1}月</div><strong>${d.getDate()}</strong><span>${['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()]}</span></div><div class="sim-card"><h3>日程安排</h3><p>今天暂时没有日程。给自己留一点自由时间吧。</p>${actionButton('＋ 添加日程','add-event')}</div><div id="eventList">${(saved.events||[]).map((e,i)=>`<div class="sim-list-row"><span>📅</span><span><b>${esc(e.title)}</b><small>${esc(e.date)}</small></span><button data-action="delete-event" data-index="${i}">删除</button></div>`).join('')}</div>`,'日程安排');return;
 }
 if(name==='phone'){
  const calls=saved.calls||[{name:'小雨',number:'138 0000 1107',type:'呼入',time:'今天 21:08'},{name:'林同学',number:'138 0000 2024',type:'呼出',time:'今天 17:32'},{name:'妈妈',number:'138 0000 0001',type:'未接来电',time:'昨天 19:45'}];
  c.innerHTML=wrap(`<div class="sim-card"><h3>最近通话</h3><div class="sim-list">${calls.map((p,i)=>`<div class="sim-list-row"><span class="contact-avatar">${p.type==='未接来电'?'↙':'☎'}</span><span><b>${esc(p.name)}</b><small>${esc(p.type)} · ${esc(p.time)}</small><small>${esc(p.number)}</small></span><button data-action="call-contact" data-index="${i}">拨打</button></div>`).join('')}</div></div><div class="sim-card"><h3>拨号键盘</h3><div class="dial-display" id="dialDisplay"></div><div class="dial-pad">${'123456789*0#'.split('').map(n=>`<button data-dial="${n}">${n}</button>`).join('')}</div><div class="dial-actions">${actionButton('⌫ 删除','dial-delete','secondary')}${actionButton('📞 模拟拨号','dial-call','green')}</div></div>`,'个人收藏');return;
 }
 if(name==='messages'||name==='mail'||name==='kakaotalk'){
  const isMail=name==='mail', isKakao=name==='kakaotalk', label=isMail?'收件箱':isKakao?'聊天':'信息';
  const items=saved[name]||[];
  c.innerHTML=wrap(`<div class="sim-toolbar"><b>${label}</b>${actionButton(isMail?'＋ 写邮件':'＋ 新对话', 'new-message')}</div><div id="messageEditor"></div><div class="sim-list">${items.length?items.map((m,i)=>`<div class="sim-list-row"><span class="sim-row-icon">${isMail?'✉️':'💬'}</span><span><b>${esc(m.to||'新对话')}</b><small>${esc(m.body)}</small><small>${esc(m.date||'刚刚')}</small></span><button data-action="delete-message" data-index="${i}">×</button></div>`).join(''):emptyState(isMail?'✉️':'💬',isMail?'收件箱是空的':'还没有对话','点击上方按钮，创建一条模拟消息')}</div>`,'与朋友保持联系');return;
 }
 if(name==='instagram'){
  const posts=saved.posts_instagram||[];
  c.innerHTML=wrap(`<div class="ig-topbar"><strong>Instagram</strong><div><button aria-label="通知">♡</button><button aria-label="私信">➤</button></div></div><div class="ig-stories"><div class="ig-story"><span class="ig-story-avatar own">＋</span><small>你的动态</small></div>${[['小雨','🌷'],['智敏','🌙'],['阿哲','☕'],['朋友','🌤️']].map(([n,em])=>`<div class="ig-story"><span class="ig-story-avatar">${em}</span><small>${n}</small></div>`).join('')}</div><div id="postEditor"></div><div class="ig-feed">${posts.map((p,i)=>`<article class="ig-post"><div class="ig-post-head"><span class="ig-avatar">${i%2?'🌙':'📷'}</span><div><b>${i%2?'slow.days':'daily.moments'}</b><small>${i%2?'城市散步':'日常记录'}</small></div><button class="ig-more" aria-label="更多">•••</button></div>${p.image?`<img class="ig-post-image" src="${esc(p.image)}" alt="动态照片" data-action="open-post-image" data-index="${i}">`:`<div class="ig-post-art ig-art-${i%3}"><span>${i%2?'☁️':'🌿'}</span><b>${esc(p.title||'最近的日常')}</b><small>${esc(p.body)}</small></div>`}<div class="ig-post-actions"><button data-action="like-post" data-index="${i}">♡</button><button aria-label="评论">▢</button><button aria-label="分享">➤</button><button class="ig-bookmark" aria-label="收藏">♧</button></div><b class="ig-likes">${p.likes||24} 次赞</b><p class="ig-caption"><b>${i%2?'slow.days':'daily.moments'}</b> ${esc(p.body)}</p><small class="ig-comments">查看全部评论 · 昨天</small></article>`).join('')}</div><div class="ig-bottom"><span>⌂</span><span>⌕</span><button data-action="new-post">＋</button><span>♡</span><span>◉</span></div>`,'');return;
 }
 if(name==='x'){
  const posts=saved.posts_x||[];
  c.innerHTML=wrap(`<div class="x-topbar"><strong>𝕏</strong><span>为你推荐　　正在关注</span></div><div class="x-compose"><div class="x-avatar">雨</div><div class="x-compose-body"><textarea id="xQuickPost" rows="2" placeholder="有什么新鲜事？"></textarea><div class="x-compose-actions"><span>◎　▧　☷</span><button data-action="publish-x-quick">发帖</button></div></div></div><div class="x-feed">${posts.map((p,i)=>`<article class="x-post"><div class="x-avatar">${i%2?'☁':'雨'}</div><div class="x-post-main"><div class="x-post-meta"><b>${i%2?'慢慢来':'日常观察员'}</b><span>@${i%2?'slowly_today':'daily_note'} · ${i?'3小时':'1小时'}</span><button aria-label="更多">•••</button></div><p>${esc(p.body||p.title)}</p>${p.image?`<img class="x-post-image" src="${esc(p.image)}" alt="帖子图片" data-action="open-post-image" data-index="${i}">`:''}<div class="x-post-stats"><button aria-label="回复">▢ <span>${i?3:2}</span></button><button aria-label="转发">♧ <span>${i?5:8}</span></button><button data-action="like-post" data-index="${i}">♡ <span>${p.likes||8}</span></button><button aria-label="浏览">▥ <span>${i?'126':'248'}</span></button><button aria-label="分享">↥</button></div></div></article>`).join('')}</div><div class="x-bottom"><span>⌂</span><span>⌕</span><span>◎</span><span>♧</span><span>♙</span></div>`,'');return;
 }
 if(name==='xiaohongshu'){
  const posts=saved.posts_xiaohongshu||[];
  c.innerHTML=wrap(`<div class="social-profile"><div class="social-avatar">📕</div><div><b>小红书 · 我的主页</b><p>记录生活，分享此刻</p></div></div><div class="sim-toolbar">${actionButton('＋ 发布笔记','new-post')}</div><div id="postEditor"></div><div class="social-feed">${posts.map((p,i)=>`<article class="post-card"><div class="post-author">📕 <b>${esc(p.title||'我的日常')}</b></div><p>${esc(p.body)}</p>${p.image?`<img class="post-image" src="${esc(p.image)}" alt="笔记图片">`:''}<div class="post-actions"><button data-action="like-post" data-index="${i}">♡ ${p.likes||0} 喜欢</button><button data-action="delete-post" data-index="${i}">删除</button></div></article>`).join('')}</div>`,'发现美好生活');return;
 }
 if(name==='browser'){
  c.innerHTML=wrap(`<form class="browser-form" id="browserForm"><span>🔍</span><input id="browserUrl" placeholder="输入网址或搜索内容" value="https://www.apple.com"><button>前往</button></form><div class="browser-shortcuts">${[['Apple','https://www.apple.com'],['Bing','https://www.bing.com'],['GitHub','https://github.com']].map(x=>`<button data-url="${x[1]}"><span>🌐</span>${x[0]}</button>`).join('')}</div><div class="browser-note">网页将在独立浏览器标签页打开。<p>为了安全和兼容性，模拟器不直接把外部网页嵌入手机内。</p></div>`,'搜索或输入网址');return;
 }
 if(name==='camera')return;
 c.innerHTML=wrap(`<div class="sim-app-hero">${icons[name]||'📱'}</div><h2>${appNames[name]||name}</h2><p class="sim-muted">欢迎使用${appNames[name]||name}。</p><div class="sim-card"><h3>功能说明</h3><p>浏览并使用这里的功能。</p>${actionButton('返回桌面','go-home')}</div>`,'欢迎使用');
}
function openPhotoViewer(src,index=0){let viewer=$('#photoViewer');if(!viewer){viewer=document.createElement('div');viewer.id='photoViewer';viewer.className='photo-viewer';viewer.innerHTML='<button class="photo-viewer-close" aria-label="返回">‹</button><span class="photo-viewer-index"></span><img alt="照片大图">';$('.phone-frame').appendChild(viewer);viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.closest('.photo-viewer-close'))viewer.classList.remove('open')})}viewer.querySelector('img').src=src;viewer.querySelector('.photo-viewer-index').textContent=String(index+1);viewer.classList.add('open')}
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
  if(act==='open-photo'){const photo=(saved.photos||[])[index];if(photo)openPhotoViewer(photo.data,index)}
  if(act==='open-post-image'){const post=(saved['posts_'+currentApp]||[])[index];if(post?.image)openPhotoViewer(post.image,index)}
  if(act==='publish-x-quick'){const body=$('#xQuickPost')?.value.trim();if(!body){toast('先写点内容再发帖');return}saved.posts_x=saved.posts_x||[];saved.posts_x.unshift({title:'',body,image:'',likes:0});persist();renderApp('x');toast('已发布')}
  if(act==='delete-recording'){saved.recordings.splice(index,1);persist();renderApp('voice')}
  if(act==='new-message'){const mail=currentApp==='mail';renderEditor('messageEditor',`<div class="editor-card">${field(mail?'收件人':'联系人','msgTo','','输入姓名')}${mail?field('主题','msgSubject','','邮件主题'):''}<label class="sim-field">内容<textarea id="msgBody" rows="3" placeholder="输入内容..."></textarea></label>${actionButton('保存到模拟收件箱','save-message')}${actionButton('取消','cancel-message','secondary')}</div>`)}
  if(act==='cancel-message')renderEditor('messageEditor','');
  if(act==='save-message'){const to=$('#msgTo').value.trim()||'新对话',body=$('#msgBody').value.trim();if(!body){toast('请输入内容');return}saved[currentApp]=saved[currentApp]||[];saved[currentApp].unshift({to,body,date:new Date().toLocaleString()});persist();renderApp(currentApp);toast('已保存')}
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
  if(act==='delete-event'){saved.events.splice(index,1);persist();renderApp('calendar')}
  if(act==='dial-delete'){const d=$('#dialDisplay');d.textContent=d.textContent.slice(0,-1)}
  if(act==='dial-call'){const number=$('#dialDisplay').textContent;if(!number){toast('请先输入号码');return}saved.calls=saved.calls||[];saved.calls.unshift({name:number,number,type:'呼出',time:new Date().toLocaleString()});persist();toast('模拟拨号：'+number+'（未拨出真实电话）')}
  if(act==='call-contact'){const p=(saved.calls||[{name:'小雨',number:'138 0000 1107'},{name:'林同学',number:'138 0000 2024'},{name:'妈妈',number:'138 0000 0001'}])[index];if(p){$('#dialDisplay').textContent=p.number||'';toast('已填入号码，可进行模拟拨号')}}
  if(act==='record-start')startRecording();
  if(act==='record-stop')stopRecording();
 }
 const dial=e.target.closest('[data-dial]');if(dial)$('#dialDisplay').textContent+=dial.dataset.dial;
 const shortcut=e.target.closest('[data-url]');if(shortcut)window.open(shortcut.dataset.url,'_blank','noopener');
});
appContent.addEventListener('change',e=>{
 if(e.target.matches('[data-setting]')){saved.settings=saved.settings||{};saved.settings[e.target.dataset.setting]=e.target.checked;persist();document.body.classList.toggle('sim-dark',!!saved.settings.dark);toast('设置已保存')}
 if(e.target.id==='cameraUpload'){const files=[...e.target.files];files.forEach(file=>{const reader=new FileReader();reader.onload=()=>{$('#cameraPreview').innerHTML=`<img class="camera-result" src="${reader.result}"><p>已拍摄并保存</p>`;saved.photos=saved.photos||[];saved.photos.unshift({data:reader.result});persist();toast('照片已保存到相册')};reader.readAsDataURL(file)})}
});
appContent.addEventListener('input',e=>{if(e.target.id==='contactSearch'){const q=e.target.value.toLowerCase();$$('#contactList .sim-list-row').forEach(row=>row.style.display=row.textContent.toLowerCase().includes(q)?'':'none')}});
let mediaRecorder=null,recordChunks=[];
async function startRecording(){try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('浏览器不支持麦克风录音');const stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];mediaRecorder=new MediaRecorder(stream);mediaRecorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};mediaRecorder.onstop=()=>{const blob=new Blob(recordChunks,{type:mediaRecorder.mimeType||'audio/webm'});const reader=new FileReader();reader.onload=()=>{saved.recordings=saved.recordings||[];saved.recordings.unshift({name:'录音 '+new Date().toLocaleTimeString(),date:new Date().toLocaleString(),data:reader.result});persist();if(currentApp==='voice')renderApp('voice');toast('录音已保存')};reader.readAsDataURL(blob);stream.getTracks().forEach(t=>t.stop())};mediaRecorder.start();$('#recordStatus').textContent='正在录音…';toast('录音开始')}catch(err){toast('无法录音：请使用 HTTPS 并允许麦克风权限')}}
function stopRecording(){if(mediaRecorder&&mediaRecorder.state!=='inactive'){mediaRecorder.stop();$('#recordStatus').textContent='录音已停止'}else toast('当前没有正在进行的录音')}
appContent.addEventListener('submit',e=>{if(e.target.id==='browserForm'){e.preventDefault();let url=$('#browserUrl').value.trim();if(!url)return;if(!/^https?:\/\//i.test(url)){url=/\./.test(url)&&!/\s/.test(url)?'https://'+url:'https://www.google.com/search?q='+encodeURIComponent(url)}window.open(url,'_blank','noopener');}});
function updateClock(){const now=new Date(),time=now.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}),month=now.getMonth()+1,day=now.getDate(),week=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][now.getDay()],dateStr=`${month}月${day}日 ${week}`;['lockTime','lockStatusTime','statusTime'].forEach(id=>{const el=$('#'+id);if(el)el.textContent=time});if($('#lockDateTop'))$('#lockDateTop').textContent=dateStr;if($('#widgetCalDay'))$('#widgetCalDay').textContent=day;if($('#widgetCalWeek'))$('#widgetCalWeek').textContent=week;if($('#widgetCalMonth'))$('#widgetCalMonth').textContent=`${month}月`}
updateClock();setInterval(updateClock,1000);
try{const lock=localStorage.getItem('ryryry-change-lock'),home=localStorage.getItem('ryryry-change-home');if(lock) $('.lock-bg').style.backgroundImage=`url("${lock}")`;if(home) $('.home-bg').style.backgroundImage=`url("${home}")`;document.body.classList.toggle('sim-dark',!!saved.settings?.dark)}catch(e){}
