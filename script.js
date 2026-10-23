// ===== 全局状态 =====
let currentScreen = 'lock';
let passcode = '';
const CORRECT_PASSCODE = '1107';
let currentYear, currentMonth;

// ===== DOM 元素 =====
const lockScreen = document.getElementById('lock-screen');
const homeScreen = document.getElementById('home-screen');
const passcodeOverlay = document.getElementById('passcode-overlay');
const passcodeDots = document.querySelectorAll('.passcode-dot');
const passcodeError = document.getElementById('passcode-error');
const lockTime = document.getElementById('lock-time');
const lockDateTop = document.getElementById('lock-date-top');
const statusTime = document.getElementById('status-time');
const appView = document.getElementById('app-view');
const appTitle = document.getElementById('app-title');
const appContent = document.getElementById('app-content');

// ===== 初始化 =====
function init() {
    updateClock();
    setInterval(updateClock, 1000);

    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();

    // 锁屏点击解锁
    lockScreen.addEventListener('click', (e) => {
        if (e.target.closest('.lock-action-btn')) return;
        showPasscode();
    });

    // 密码键盘
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const val = key.dataset.key;
            if (val === 'delete') {
                deleteDigit();
            } else if (val) {
                enterDigit(val);
            }
        });
    });

    // 主屏应用点击
    document.querySelectorAll('.app-item').forEach(item => {
        item.addEventListener('click', () => {
            const appName = item.dataset.app;
            if (appName) openApp(appName);
        });
    });

    // 小组件点击
    document.querySelectorAll('.widget').forEach(widget => {
        widget.addEventListener('click', () => {
            const app = widget.dataset.widget;
            if (app) openApp(app);
        });
    });

    // 返回主屏
    document.getElementById('back-btn').addEventListener('click', closeApp);

    // 锁屏底部按钮
    document.getElementById('btn-flashlight')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBtnState(e.currentTarget);
    });
    document.getElementById('btn-camera')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleBtnState(e.currentTarget);
        setTimeout(() => openApp('camera'), 300);
    });
}

function toggleBtnState(btn) {
    btn.classList.toggle('active');
}

// ===== 时钟更新 =====
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    lockTime.textContent = timeStr;
    statusTime.textContent = timeStr;

    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDay = weekDays[now.getDay()];
    lockDateTop.textContent = `${month}月${day}日 ${weekDay}`;
}

// ===== 密码输入 =====
function showPasscode() {
    passcode = '';
    passcodeError.classList.remove('show');
    updateDots();
    passcodeOverlay.classList.add('active');
}

function hidePasscode() {
    passcodeOverlay.classList.remove('active');
    passcode = '';
    updateDots();
}

function enterDigit(digit) {
    if (passcode.length >= 6) return;
    passcode += digit;
    updateDots();

    if (passcode.length === 6) {
        setTimeout(checkPasscode, 200);
    }
}

function deleteDigit() {
    passcode = passcode.slice(0, -1);
    passcodeError.classList.remove('show');
    updateDots();
}

function updateDots() {
    passcodeDots.forEach((dot, i) => {
        dot.classList.toggle('filled', i < passcode.length);
    });
}

function checkPasscode() {
    if (passcode === CORRECT_PASSCODE) {
        hidePasscode();
        switchScreen('home');
    } else {
        passcodeError.textContent = '密码错误，请重试';
        passcodeError.classList.add('show');
        passcode = '';
        updateDots();
        // 抖动反馈
        const box = document.querySelector('.passcode-box');
        box.style.animation = 'none';
        box.offsetHeight; // 触发回流
        box.style.animation = 'shake 0.4s ease';
    }
}

// ===== 屏幕切换 =====
function switchScreen(screen) {
    lockScreen.classList.remove('active');
    homeScreen.classList.remove('active');
    if (screen === 'lock') {
        lockScreen.classList.add('active');
    } else if (screen === 'home') {
        homeScreen.classList.add('active');
    }
    currentScreen = screen;
}

// ===== 应用系统 =====
function openApp(appName) {
    const apps = {
        calendar: { title: '日历', render: renderCalendar },
        weather: { title: '天气', render: renderWeather },
        photos: { title: '照片', render: renderPhotos },
        camera: { title: '相机', render: renderCamera },
        settings: { title: '设置', render: renderSettings },
        clock: { title: '时钟', render: renderClockApp },
        notes: { title: '备忘录', render: renderNotes },
        music: { title: '音乐', render: renderMusic },
        calculator: { title: '计算器', render: renderCalculator },
        messages: { title: '信息', render: renderMessages },
        phone: { title: '电话', render: renderPhone },
        mail: { title: '邮件', render: renderMail },
        maps: { title: '地图', render: renderMaps },
        appstore: { title: 'App Store', render: renderAppStore },
        safari: { title: 'Safari', render: renderSafari },
        wallet: { title: '钱包', render: renderWallet },
    };

    const app = apps[appName];
    if (!app) return;

    appTitle.textContent = app.title;
    appContent.innerHTML = '';
    app.render(appContent);
    appView.classList.add('active');
}

function closeApp() {
    appView.classList.remove('active');
}

// ===== 日历 App =====
function renderCalendar(container) {
    const div = document.createElement('div');
    div.className = 'calendar-content';

    const months = ['一月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '十一月', '十二月'];

    div.innerHTML = `
        <div class="calendar-nav">
            <button class="cal-nav-btn" id="cal-prev">&lt;</button>
            <span class="cal-nav-title" id="cal-title"></span>
            <button class="cal-nav-btn" id="cal-next">&gt;</button>
        </div>
        <button class="cal-today-btn" id="cal-today">回到今天</button>
        <div class="calendar-grid" id="cal-grid"></div>
        <button class="cal-add-today-btn" id="cal-add-today">为今天添加日程</button>
    `;
    container.appendChild(div);

    function renderGrid() {
        const title = document.getElementById('cal-title');
        const grid = document.getElementById('cal-grid');
        title.textContent = `${currentYear}年 ${months[currentMonth]}`;

        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        let html = weekDays.map(d => `<div class="cal-header">${d}</div>`).join('');

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevDays = new Date(currentYear, currentMonth, 0).getDate();

        const today = new Date();

        for (let i = firstDay - 1; i >= 0; i--) {
            html += `<div class="cal-day other-month">${prevDays - i}</div>`;
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            html += `<div class="cal-day${isToday ? ' today' : ''}">${d}</div>`;
        }
        const totalCells = firstDay + daysInMonth;
        const remaining = (7 - totalCells % 7) % 7;
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="cal-day other-month">${i}</div>`;
        }

        grid.innerHTML = html;
    }

    renderGrid();

    document.getElementById('cal-prev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderGrid();
    });
    document.getElementById('cal-next').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderGrid();
    });
    document.getElementById('cal-today').addEventListener('click', () => {
        const now = new Date();
        currentYear = now.getFullYear();
        currentMonth = now.getMonth();
        renderGrid();
    });
    document.getElementById('cal-add-today').addEventListener('click', () => {
        const today = new Date();
        alert(`已为 ${today.getMonth()+1}月${today.getDate()}日 添加日程`);
    });
}

// ===== 天气 App =====
function renderWeather(container) {
    container.innerHTML = `
        <div style="text-align:center;padding:40px 20px;">
            <div style="font-size:72px;margin-bottom:10px;">⛅</div>
            <div style="font-size:48px;font-weight:200;">26°</div>
            <div style="font-size:18px;opacity:0.7;margin-top:8px;">多云</div>
            <div style="font-size:14px;opacity:0.5;margin-top:4px;">香港特别行政区</div>
            <div style="margin-top:40px;display:flex;justify-content:space-around;font-size:14px;">
                <div><div style="opacity:0.5">湿度</div><div style="font-size:20px;margin-top:4px;">72%</div></div>
                <div><div style="opacity:0.5">风力</div><div style="font-size:20px;margin-top:4px;">3级</div></div>
                <div><div style="opacity:0.5">紫外线</div><div style="font-size:20px;margin-top:4px;">中等</div></div>
            </div>
            <div style="margin-top:40px;border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;">
                <div style="display:flex;justify-content:space-between;padding:10px 0;">
                    <span>周一</span><span>⛅ 25°</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;">
                    <span>周二</span><span>🌧 22°</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;">
                    <span>周三</span><span>☀️ 28°</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;">
                    <span>周四</span><span>⛅ 26°</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;">
                    <span>周五</span><span>🌤 27°</span>
                </div>
            </div>
        </div>
    `;
}

// ===== 照片 App =====
function renderPhotos(container) {
    const colors = ['#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#feca57','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ff6348','#7bed9f'];
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px;">';
    for (let i = 0; i < 24; i++) {
        html += `<div style="aspect-ratio:1;background:${colors[i%colors.length]};border-radius:2px;"></div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// ===== 相机 App =====
function renderCamera(container) {
    container.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#111;">
            <div style="flex:1;display:flex;align-items:center;justify-content:center;width:100%;">
                <div style="width:200px;height:200px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:60px;opacity:0.3;">📷</span>
                </div>
            </div>
            <div style="padding:30px;display:flex;align-items:center;gap:40px;">
                <div style="width:44px;height:44px;border-radius:8px;background:rgba(255,255,255,0.2);"></div>
                <div style="width:72px;height:72px;border-radius:50%;border:4px solid #fff;cursor:pointer;" id="shutter-btn"></div>
                <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:20px;">🔄</div>
            </div>
        </div>
    `;
    document.getElementById('shutter-btn')?.addEventListener('click', () => {
        const btn = document.getElementById('shutter-btn');
        btn.style.background = '#fff';
        setTimeout(() => btn.style.background = 'transparent', 150);
    });
}

// ===== 设置 App =====
function renderSettings(container) {
    const items = [
        { icon: '✈️', label: '飞行模式', type: 'toggle' },
        { icon: '📶', label: 'Wi-Fi', value: 'MyWiFi' },
        { icon: '🔵', label: '蓝牙', value: '开启' },
        { icon: '📱', label: '蜂窝网络' },
        { icon: '🔋', label: '电池', value: '85%' },
        { icon: '⚙️', label: '通用' },
        { icon: '🎨', label: '显示与亮度' },
        { icon: '🔔', label: '通知' },
        { icon: '🔒', label: '隐私与安全' },
    ];
    let html = '<div style="padding:10px 0;">';
    items.forEach(item => {
        html += `
            <div style="display:flex;align-items:center;padding:12px 16px;background:rgba(255,255,255,0.08);border-radius:12px;margin-bottom:2px;cursor:pointer;">
                <span style="width:30px;height:30px;border-radius:7px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin-right:12px;font-size:16px;">${item.icon}</span>
                <span style="flex:1;font-size:16px;">${item.label}</span>
                ${item.type === 'toggle'
                    ? '<div style="width:50px;height:30px;border-radius:15px;background:#34c759;position:relative;"><div style="width:26px;height:26px;border-radius:50%;background:#fff;position:absolute;right:2px;top:2px;"></div></div>'
                    : (item.value ? `<span style="opacity:0.5;font-size:14px;">${item.value} ›</span>` : '<span style="opacity:0.3;">›</span>')
                }
            </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// ===== 时钟 App =====
function renderClockApp(container) {
    container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;">
            <div style="font-size:64px;font-weight:200;" id="clock-display"></div>
            <div style="margin-top:10px;opacity:0.5;" id="clock-date-display"></div>
            <div style="margin-top:50px;">
                <div style="display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span>⏰ 闹钟</span><span style="opacity:0.3;">›</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span>🌍 世界时钟</span><span style="opacity:0.3;">›</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span>⏱ 秒表</span><span style="opacity:0.3;">›</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:16px 0;">
                    <span>⏳ 计时器</span><span style="opacity:0.3;">›</span>
                </div>
            </div>
        </div>
    `;
    function updateClockDisplay() {
        const now = new Date();
        const el = document.getElementById('clock-display');
        const dateEl = document.getElementById('clock-date-display');
        if (el) {
            el.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        }
        if (dateEl) {
            dateEl.textContent = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;
        }
    }
    updateClockDisplay();
    const timer = setInterval(updateClockDisplay, 1000);
    const observer = new MutationObserver(() => {
        if (!document.getElementById('clock-display')) clearInterval(timer);
    });
    observer.observe(container, { childList: true, subtree: true });
}

// ===== 备忘录 App =====
function renderNotes(container) {
    container.innerHTML = `
        <div style="padding:10px 0;">
            <div style="display:flex;justify-content:space-between;padding:14px 16px;background:rgba(255,255,255,0.08);border-radius:12px;margin-bottom:8px;cursor:pointer;">
                <div><div style="font-size:16px;">购物清单</div><div style="font-size:13px;opacity:0.4;margin-top:4px;">牛奶、鸡蛋、面包...</div>
