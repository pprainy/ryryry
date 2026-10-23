const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const lockScreen=$('#lockScreen'),homeScreen=$('#homeScreen'),appView=$('#appView'),appContent=$('#appContent');
let pass='',page=0,startX=0,drag=false;
const apps={
 messages:{title:'信息',render:messages},
 notes:{title:'备忘录',render:notes},
 phone:{title:'电话',render:phone},
 calendar:{title:'日历',render:calendar},
 instagram:{title:'Instagram',render:instagram},
 x:{title:'X',render:xApp},
 kakaotalk:{title:'KakaoTalk',render:kakao},
 contacts:{title:'通讯录',render:contacts},
 photos:{title:'照片',render:photos},
 voice:{title:'录音',render:voice},
 xiaohongshu:{title:'小红书',render:xhs},
 camera:{title:'相机',render:camera},
 mail:{title:'邮件',render:mail},
 browser:{title:'浏览器',render:browser},
 settings:{title:'设置',render:settings}
};
function now(){return new Date()}
function clock(){const d=now(),t=d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});['lockStatusTime','lockTime','statusTime','appTime'].forEach(id=>{const e=$('#'+id);if(e)e.textContent=t});const w=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()];$('#lockDateTop').textContent=`${d.getMonth()+1}月${d.getDate()}日 ${w}`;$('#widgetCalDay').textContent=d.getDate();$('#widgetCalWeek').textContent=w;$('#widgetCalMonth').textContent=`${d.getMonth()+1}月`}
clock();setInterval(clock,1000);
function showPass(){ $('#passcodeOverlay').classList.add('show') } $('#lockContent').onclick=showPass;$('#btnFlashlight').onclick=e=>{e.stopPropagation();alert('手电筒已打开（模拟）')};$('#btnCamera').onclick=e=>{e.stopPropagation();openApp('camera')};
$$('.key').forEach(k=>k.onclick=()=>{if(k.id==='keyDelete'){pass=pass.slice(0,-1)}else if(pass.length<4)pass+=k.dataset.key;$$('#passcodeDots i').forEach((x,i)=>x.classList.toggle('filled',i<pass.length));if(pass.length===4)setTimeout(()=>{if(pass==='1107'){pass='';$('#passcodeOverlay').classList.remove('show');lockScreen.classList.remove('active');homeScreen.classList.add('active')}else{$('#passcodeError').classList.add('show');pass='';setTimeout(()=>{$('#passcodeError').classList.remove('show');$$('#passcodeDots i').forEach(x=>x.classList.remove('filled'))},650)}},180)});
function updatePage(){ $('#pagesContainer').style.transform=`translateX(-${page*50}%)`;$$('.dot').forEach((d,i)=>d.classList.toggle('active',i===page)) }
$$('.dot').forEach(d=>d.onclick=()=>{page=+d.dataset.page;updatePage()});homeScreen.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;drag=true},{passive:true});homeScreen.addEventListener('touchend',e=>{if(!drag)return;drag=false;let dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45){page=Math.max(0,Math.min(1,page+(dx<0?1:-1)));updatePage()}});
function openApp(name){const a=apps[name]||{title:name,render:empty};appContent.innerHTML='';appView.classList.add('open');a.render(appContent);clock()}
$$('[data-app]').forEach(el=>el.addEventListener('click',()=>openApp(el.dataset.app)));
$('#homeIndicator').onclick=()=>appView.classList.remove('open');
function shell(title,body,opts={}){return `<div class="native ${opts.dark?'dark':''} ${opts.className||''}">${body}</div>`}
function top(title,action=''){return `<header class="native-top"><button class="plain back-app" onclick="closeApp()">‹</button><h1>${title}</h1><button class="top-action">${action}</button></header>`}
function tabs(items,active=0){return `<nav class="bottom-tabs">${items.map((x,i)=>`<button class="${i===active?'active':''}"><span>${x[0]}</span><small>${x[1]}</small></button>`).join('')}</nav>`}
function emptyState(icon,title,desc){return `<div class="empty-state"><div class="empty-icon">${icon}</div><h2>${title}</h2><p>${desc||''}</p></div>`}
function closeApp(){$('#appView').classList.remove('open')}
function messages(c){c.innerHTML=shell('信息',`${top('信息','＋')}<div class="search">⌕　搜索</div>${emptyState('💬','暂无信息','你的短信会显示在这里')}${tabs([['✉','信息'],['◉','编辑']])}`)}
function notes(c){c.innerHTML=shell('备忘录',`<header class="notes-head"><button onclick="closeApp()">‹ 文件夹</button><div>☷　＋</div></header><h1 class="big-title">所有备忘录</h1><div class="subcount">0 个备忘录</div><div class="search light">搜索</div>${emptyState('📝','暂无备忘录','点击右上角“＋”创建一条备忘录')}`)}
function phone(c){c.innerHTML=shell('电话',`<header class="phone-head"><h1>个人收藏</h1><button>编辑</button></header>${emptyState('☆','暂无个人收藏','')}</div><div class="phone-bottom"><button>☆<small>个人收藏</small></button><button class="active">◷<small>最近通话</small></button><button>♙<small>通讯录</small></button><button>⌨<small>拨号键盘</small></button><button>▤<small>语音留言</small></button></div>`)}
function calendar(c){const d=now(),y=d.getFullYear(),m=d.getMonth();let first=new Date(y,m,1).getDay();let days=new Date(y,m+1,0).getDate();let cells='';for(let i=0;i<first;i++)cells+='<span></span>';for(let i=1;i<=days;i++)cells+=`<button class="day ${i===d.getDate()?'today':''}">${i}</button>`;c.innerHTML=shell('日历',`<div class="calendar-page"><div class="cal-top"><button onclick="closeApp()">‹</button><button>＋</button></div><h1>${y}年 ${m+1}月</h1><div class="week">${['日','一','二','三','四','五','六'].map(x=>`<span>${x}</span>`).join('')}</div><div class="month-grid">${cells}</div><h2>今天的日程</h2>${emptyState('◷','暂无日程','这一天还没有安排')}</div>`)}
function instagram(c){c.innerHTML=shell('Instagram',`<div class="social-dark"><div class="ig-head"><button onclick="closeApp()">⌂</button><b>Instagram</b><button>＋</button></div><div class="ig-stories"><span>＋<small>你的快拍</small></span></div>${emptyState('◎','还没有内容','关注账号后，这里会显示动态')}${tabs([['⌂','首页'],['⌕','搜索'],['＋','发布'],['♡','动态'],['◉','个人'],],0)}</div>`)}
function xApp(c){c.innerHTML=shell('X',`<div class="social-dark"><div class="x-head"><button>◎</button><b>𝕏</b><button>＋</button></div><div class="x-tabs"><button class="active">为你推荐</button><button>正在关注</button></div>${emptyState('𝕏','暂无帖子','这里暂时没有内容')}${tabs([['⌂','主页'],['⌕','搜索'],['♧','通知'],['✉','消息']],0)}</div>`)}
function kakao(c){c.innerHTML=shell('KakaoTalk',`<div class="kakao-page"><header><button onclick="closeApp()">‹</button><h1>朋友</h1><div>⌕　＋</div></header><div class="my-profile"><div class="avatar"></div><div><b>我的账号</b><small>状态消息</small></div></div><div class="section-label">朋友 0</div>${emptyState('☺','暂无朋友','添加朋友后会显示在这里')}${tabs([['♙','朋友'],['▢','聊天'],['◉','动态'],['✉','更多']],0)}</div>`)}
function contacts(c){c.innerHTML=shell('通讯录',`<header class="contacts-head"><button onclick="closeApp()">‹</button><h1>联系人</h1><button>＋</button></header><div class="search light">⌕　搜索</div>${emptyState('♙','暂无联系人','你的联系人会显示在这里')}`)}
function photos(c){c.innerHTML=shell('照片',`<header class="photos-head"><button onclick="closeApp()">相簿</button><h1>图库</h1><button>选择</button></header><div class="photo-grid">${Array.from({length:12},()=>'<span></span>').join('')}</div>${emptyState('▧','暂无照片','导入照片后会显示在这里')}`)}
function voice(c){c.innerHTML=shell('录音',`<header class="voice-head"><button onclick="closeApp()">录音</button><h1>所有录音</h1><button>编辑</button></header>${emptyState('◉','暂无录音','点击录音按钮开始录制')}<button class="record-button">●</button>`)}
function xhs(c){c.innerHTML=shell('小红书',`<div class="xhs-page"><header><button onclick="closeApp()">小红书</button><div>⌕　＋</div></header><div class="xhs-tabs"><button class="active">发现</button><button>关注</button><button>附近</button></div>${emptyState('♡','暂无笔记','你关注的内容会显示在这里')}${tabs([['⌂','首页'],['⌕','搜索'],['＋','发布'],['▢','消息'],['♙','我']],0)}</div>`)}
function camera(c){c.innerHTML=shell('相机',`<div class="camera-page"><div class="camera-preview">相机预览</div><div class="camera-controls"><button>◐</button><button class="shutter">●</button><button>▣</button></div></div>`)}
function mail(c){c.innerHTML=shell('邮件',`${top('邮箱','＋')}<div class="search light">搜索</div>${emptyState('✉','暂无邮件','收到邮件后会显示在这里')}`)}
function browser(c){c.innerHTML=shell('浏览器',`<div class="browser-page"><div class="browser-bar">⌕　搜索或输入网站地址</div>${emptyState('◎','开始浏览','输入网址即可打开网页')}</div>`)}
function settings(c){c.innerHTML=shell('设置',`<header class="settings-head"><button onclick="closeApp()">‹</button><h1>设置</h1></header><div class="settings-list"><button>账户与安全 <span>›</span></button><button>通知 <span>›</span></button><button>显示与亮度 <span>›</span></button><button>壁纸 <span>›</span></button><button>通用 <span>›</span></button></div>`)}
function empty(c){c.innerHTML=shell('应用',`${top('应用')}${emptyState('○','暂无内容','功能正在准备中')}`)}
window.closeApp=closeApp;
