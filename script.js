// 获取DOM元素
const lockScreen = document.getElementById('lockScreen');
const homeScreen = document.getElementById('homeScreen');
const passcodeOverlay = document.getElementById('passcodeOverlay');
const passcodeDots = document.getElementById('passcodeDots').children;
const passcodeError = document.getElementById('passcodeError');
const keypad = document.querySelector('.keypad');
const appView = document.getElementById('appView');
const appTitle = document.getElementById('appTitle');

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
const correctPasscode = '1234'; // 默认密码

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

// 主屏幕App点击事件
document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.querySelector('span')?.textContent || item.dataset.app;
        appTitle.textContent = appName;
        appView.classList.add('open');
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
