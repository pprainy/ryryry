const lockScreen = document.getElementById('lockScreen');
const homeScreen = document.getElementById('homeScreen');
const pagesContainer = document.getElementById('pagesContainer');
const passcodeOverlay = document.getElementById('passcodeOverlay');
const passcodeDots = document.getElementById('passcodeDots').children;
const passcodeError = document.getElementById('passcodeError');
const keypad = document.querySelector('.keypad');
const appView = document.getElementById('appView');
const appTitle = document.getElementById('appTitle');
const dots = document.querySelectorAll('.dot');

// === 锁屏与键盘逻辑 ===
document.querySelector('.lock-content').addEventListener('click', showPasscode);
document.querySelector('.lock-hint').addEventListener('click', showPasscode);
document.getElementById('btnFlashlight').addEventListener('click', (e) => { e.stopPropagation(); alert('手电筒'); });
document.getElementById('btnCamera').addEventListener('click', (e) => { e.stopPropagation(); alert('相机'); });

function showPasscode() { passcodeOverlay.classList.add('show'); }
function hidePasscode() { passcodeOverlay.classList.remove('show'); resetPasscode(); }

let currentPasscode = '';
const correctPasscode = '1234';

keypad.addEventListener('click', (e) => {
    if (e.target.classList.contains('key') && !e.target.classList.contains('key-empty')) {
        if (e.target.id === 'keyDelete') {
            currentPasscode = currentPasscode.slice(0, -1);
        } else {
            if (currentPasscode.length < 4) currentPasscode += e.target.dataset.key;
        }
        updateDots();
        if (currentPasscode.length === 4) setTimeout(checkPasscode, 200);
    }
});

function updateDots() {
    for (let i = 0; i < passcodeDots.length; i++) {
        passcodeDots[i].classList.toggle('filled', i < currentPasscode.length);
    }
}

function checkPasscode() {
    if (currentPasscode === correctPasscode) {
        hidePasscode();
        lockScreen.classList.remove('active');
        homeScreen.classList.add('active');
    } else {
        passcodeError.classList.add('show');
        keypad.classList.add('shake');
        setTimeout(() => { passcodeError.classList.remove('show'); keypad.classList.remove('shake'); resetPasscode(); }, 600);
    }
}
function resetPasscode() { currentPasscode = ''; updateDots(); }

// === 主屏幕翻页逻辑 (增加点击和滑动双重保障) ===
let currentPage = 0;
const totalPages = 2;

function updatePageIndicator() {
    // 移动容器实现翻页
    pagesContainer.style.transform = `translateX(-${currentPage * 50}%)`; 
    // 更新小圆点状态
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });
}

// 点击圆点翻页
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        currentPage = parseInt(dot.dataset.page);
        updatePageIndicator();
    });
});

// 左右滑动翻页 (PC端鼠标兼容 + 移动端触摸兼容)
let startX = 0;
let isDragging = false;

const startSwipe = (x) => { startX = x; isDragging = true; };
const endSwipe = (x) => {
    if (!isDragging) return;
    isDragging = false;
    let endX = x;
    if (startX - endX > 50 && currentPage < totalPages - 1) { // 左滑到第二页
        currentPage++;
        updatePageIndicator();
    } else if (endX - startX > 50 && currentPage > 0) { // 右滑回第一页
        currentPage--;
        updatePageIndicator();
    }
};

// 触摸事件
homeScreen.addEventListener('touchstart', e => startSwipe(e.touches[0].clientX), { passive: true });
homeScreen.addEventListener('touchend', e => endSwipe(e.changedTouches[0].clientX), { passive: true });

// 鼠标事件 (方便在电脑上测试)
homeScreen.addEventListener('mousedown', e => startSwipe(e.clientX));
window.addEventListener('mouseup', e => endSwipe(e.clientX));


// === 应用打开与日历绑定 ===
function openApp(appName) {
    appTitle.textContent = appName;
    appView.classList.add('open');
}

document.querySelectorAll('.app-item[data-app]').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.querySelector('span')?.textContent || item.dataset.app;
        openApp(appName);
    });
});

// 点击左上角日期进入日历
document.querySelector('.widget-calendar').addEventListener('click', () => {
    openApp('日历');
});

document.getElementById('backBtn').addEventListener('click', () => {
    appView.classList.remove('open');
});

// === 时间更新 ===
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

    document.getElementById('lockTime').textContent = timeStr;
    document.getElementById('lockDateTop').textContent = dateStr;
    document.getElementById('lockStatusTime').textContent = timeStr;
    document.getElementById('statusTime').textContent = timeStr;
    
    document.getElementById('widgetCalDay').textContent = day;
    document.getElementById('widgetCalWeek').textContent = weekDay;
    document.getElementById('widgetCalMonth').textContent = `${month}月`;
}

updateClock();
setInterval(updateClock, 1000);
