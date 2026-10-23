// 获取DOM元素
const lockScreen = document.getElementById('lockScreen');
const homeScreen = document.getElementById('homeScreen');
const passcodeOverlay = document.getElementById('passcodeOverlay');
const passcodeDots = document.getElementById('passcodeDots').children;
const passcodeError = document.getElementById('passcodeError');
const keypad = document.querySelector('.keypad');
const appView = document.getElementById('appView');
const appTitle = document.getElementById('appTitle');
const appContent = document.querySelector('.app-content'); // 获取内容区域以便动态插入日历

// 锁屏提示文字点击/滑动唤醒键盘
document.querySelector('.lock-content').addEventListener('click', showPasscode);
document.querySelector('.lock-hint').addEventListener('click', showPasscode);

// 底部按钮事件
document.getElementById('btnFlashlight').addEventListener('click', (e) => {
    e.stopPropagation();
    alert('手电筒功能 (示例)');
});
document.getElementById('btnCamera').addEventListener('click', (e) => {
    e.stopPropagation();
    alert('相机功能 (示例)');
});

// 显示密码键盘
function showPasscode() {
    passcodeOverlay.classList.add('show');
}

// 隐藏密码键盘
function hidePasscode() {
    passcodeOverlay.classList.remove('show');
    resetPasscode();
}

// 密码逻辑
let currentPasscode = '';
const correctPasscode = '1107'; // 默认密码

keypad.addEventListener('click', (e) => {
    if (e.target.classList.contains('key') && !e.target.classList.contains('key-empty')) {
        if (e.target.id === 'keyDelete') {
            currentPasscode = currentPasscode.slice(0, -1);
        } else {
            if (currentPasscode.length < 4) {
                currentPasscode += e.target.dataset.key;
            }
        }
        updateDots();
        
        if (currentPasscode.length === 4) {
            setTimeout(checkPasscode, 200);
        }
    }
});

function updateDots() {
    for (let i = 0; i < passcodeDots.length; i++) {
        if (i < currentPasscode.length) {
            passcodeDots[i].classList.add('filled');
        } else {
            passcodeDots[i].classList.remove('filled');
        }
    }
}

function checkPasscode() {
    if (currentPasscode === correctPasscode) {
        // 解锁成功
        hidePasscode();
        lockScreen.classList.remove('active');
        homeScreen.classList.add('active');
    } else {
        // 密码错误
        passcodeError.classList.add('show');
        keypad.classList.add('shake');
        setTimeout(() => {
            passcodeError.classList.remove('show');
            keypad.classList.remove('shake');
            resetPasscode();
        }, 600);
    }
}

function resetPasscode() {
    currentPasscode = '';
    updateDots();
}

// ===== 新增：日历相关逻辑 =====
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth(); // 0-11
let anniversaries = {}; // 存储纪念日数据，格式: "YYYY-MM-DD": "内容"

// 左上角日历入口点击
const calendarEntryBtn = document.getElementById('calendarEntryBtn');
if (calendarEntryBtn) {
    calendarEntryBtn.addEventListener('click', () => {
        openCalendarApp();
    });
}

function openCalendarApp() {
    appTitle.textContent = '日历';
    renderCalendar(calendarYear, calendarMonth);
    appView.classList.add('open');
}

function renderCalendar(year, month) {
    const monthsCN = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let html = `
        <div class="calendar-header" style="display:flex; justify-content:space-between; align-items:center; padding:10px 20px;">
            <button id="calPrev" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;">‹</button>
            <span style="font-size:18px; font-weight:bold;">${year}年 ${monthsCN[month]}</span>
            <button id="calNext" style="background:none; border:none; color:#fff; font-size:20px; cursor:pointer;">›</button>
        </div>
        <div class="calendar-grid" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; padding:10px 20px;">
    `;
    
    // 表头
    weekDays.forEach(day => {
        html += `<div style="text-align:center; color:#888; font-size:12px; padding:5px;">${day}</div>`;
    });
    
    // 空白填充
    for (let i = 0; i < firstDay; i++) {
        html += `<div></div>`;
    }
    
    // 日期
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
        const hasAnniversary = anniversaries[dateKey];
        
        html += `
            <div class="cal-day-item" data-date="${dateKey}" style="
                aspect-ratio:1; 
                display:flex; 
                flex-direction:column; 
                align-items:center; 
                justify-content:center; 
                border-radius:50%; 
                background:${isToday ? '#0A84FF' : 'transparent'}; 
                color:${isToday ? '#fff' : '#fff'};
                position:relative;
                cursor:pointer;
            ">
                <span style="font-size:14px;">${d}</span>
                ${hasAnniversary ? '<div style="width:4px; height:4px; background:#FF9F0A; border-radius:50%; margin-top:2px;"></div>' : ''}
            </div>
        `;
    }
    
    html += `</div>`;
    
    // 插入内容
    appContent.innerHTML = html;
    
    // 绑定切换月份事件
    document.getElementById('calPrev').addEventListener('click', () => {
        calendarMonth--;
        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear--;
        }
        renderCalendar(calendarYear, calendarMonth);
    });
    
    document.getElementById('calNext').addEventListener('click', () => {
        calendarMonth++;
        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear++;
        }
        renderCalendar(calendarYear, calendarMonth);
    });
    
    // 绑定日期点击添加纪念日
    document.querySelectorAll('.cal-day-item').forEach(item => {
        item.addEventListener('click', function() {
            const date = this.dataset.date;
            const existing = anniversaries[date] || '';
            const input = prompt(`为 ${date} 添加/修改纪念日:`, existing);
            if (input !== null) {
                if (input.trim() === '') {
                    delete anniversaries[date];
                } else {
                    anniversaries[date] = input;
                }
                renderCalendar(calendarYear, calendarMonth); // 重新渲染以更新标记
            }
        });
    });
}

// 主屏幕App点击事件
document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.querySelector('span')?.textContent || item.dataset.app;
        
        // 如果是日历入口已经在上面处理了，这里处理其他普通App
        if (appName !== '日历') {
            appTitle.textContent = appName;
            // 重置内容为默认提示，除非是特定App
            appContent.innerHTML = `<p style="text-align:center; color:#999; margin-top:40vh;">这里是 ${appName} 的内容区域</p>`;
            appView.classList.add('open');
        }
    });
});

// 返回按钮
document.getElementById('backBtn').addEventListener('click', () => {
    appView.classList.remove('open');
});

// 更新时间与日期
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDay = weekDays[now.getDay()];
    const dateStr = `${month}月${day}日 ${weekDay}`;

    // 更新锁屏时间
    document.getElementById('lockTime').textContent = timeStr;
    document.getElementById('lockDateTop').textContent = dateStr;
    document.getElementById('lockStatusTime').textContent = timeStr;

    // 更新主屏幕时间
    document.getElementById('statusTime').textContent = timeStr;
    
    // 更新小组件
    document.getElementById('widgetCalDay').textContent = day;
    document.getElementById('widgetCalWeek').textContent = weekDay;
    document.getElementById('widgetCalMonth').textContent = `${month}月`;
}

// 初始化并每秒更新
updateClock();
setInterval(updateClock, 1000);
