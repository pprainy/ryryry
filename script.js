// ===== DOM 元素获取 =====
const lockScreen = document.getElementById('lockScreen');
const homeScreen = document.getElementById('homeScreen');
const passcodeOverlay = document.getElementById('passcodeOverlay');
const passcodeDots = document.getElementById('passcodeDots').children;
const passcodeError = document.getElementById('passcodeError');
const keypad = document.querySelector('.keypad');
const appView = document.getElementById('appView');
const appTitle = document.getElementById('appTitle');
const lockContent = document.querySelector('.lock-content');
const lockHint = document.querySelector('.lock-hint');
const btnFlashlight = document.getElementById('btnFlashlight');
const btnCamera = document.getElementById('btnCamera');

// ===== 状态变量 =====
let currentPasscode = '';
const CORRECT_CODE = '1107';

// ===== 基础交互逻辑 =====

// 1. 显示密码键盘 (阻止点击事件冒泡，防止重复触发)
function showPasscode(e) {
    if(e) e.stopPropagation();
    if (!passcodeOverlay.classList.contains('show')) {
        passcodeOverlay.classList.add('show');
        resetPasscode();
    }
}

// 点击锁屏任意位置弹出键盘
lockContent.addEventListener('click', showPasscode);
lockHint.addEventListener('click', showPasscode);

// 2. 底部快捷按钮 (阻止冒泡)
btnFlashlight.addEventListener('click', (e) => {
    e.stopPropagation();
    alert('手电筒功能 (示例)');
});
btnCamera.addEventListener('click', (e) => {
    e.stopPropagation();
    alert('相机功能 (示例)');
});

// 3. 数字键盘输入逻辑 (事件委托，性能最优)
keypad.addEventListener('click', (e) => {
    // 查找最近的 .key 按钮，防止点到按钮中间的缝隙
    const key = e.target.closest('.key');
    if (!key || key.classList.contains('key-empty')) return;

    if (key.id === 'keyDelete') {
        // 删除操作
        currentPasscode = currentPasscode.slice(0, -1);
    } else {
        // 输入操作 (最多输入4位)
        if (currentPasscode.length < 4) {
            currentPasscode += key.getAttribute('data-key');
        }
    }

    updateDots();

    // 输入满 4 位时自动触发验证
    if (currentPasscode.length === 4) {
        setTimeout(checkPasscode, 150);
    }
});

// 4. 更新密码小圆点
function updateDots() {
    for (let i = 0; i < passcodeDots.length; i++) {
        if (i < currentPasscode.length) {
            passcodeDots[i].classList.add('filled');
        } else {
            passcodeDots[i].classList.remove('filled');
        }
    }
}

// 5. 验证密码逻辑
function checkPasscode() {
    if (currentPasscode === CORRECT_CODE) {
        // 密码正确：隐藏键盘，解锁进入主屏幕
        passcodeOverlay.classList.remove('show');
        resetPasscode();
        setTimeout(() => {
            lockScreen.classList.remove('active');
            homeScreen.classList.add('active');
        }, 200);
    } else {
        // 密码错误：显示错误提示并抖动
        passcodeError.classList.add('show');
        keypad.classList.add('shake');
        
        setTimeout(() => {
            passcodeError.classList.remove('show');
            keypad.classList.remove('shake');
            resetPasscode();
        }, 500);
    }
}

function resetPasscode() {
    currentPasscode = '';
    updateDots();
}

// ===== 应用程序打开/关闭 =====
document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', () => {
        const appName = item.querySelector('span')?.textContent || item.getAttribute('data-app');
        appTitle.textContent = appName || '应用';
        appView.classList.add('open');
    });
});

document.getElementById('backBtn').addEventListener('click', () => {
    appView.classList.remove('open');
});

// ===== 实时时间与日期更新 =====
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${h}:${m}`;

    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const dateStr = `${months[now.getMonth()]}${now.getDate()}日 ${days[now.getDay()]}`;

    // 更新锁屏
    document.getElementById('lockTime').textContent = timeStr;
    document.getElementById('lockDateTop').textContent = dateStr;
    document.getElementById('lockStatusTime').textContent = timeStr;
    
    // 更新主屏幕
    document.getElementById('statusTime').textContent = timeStr;
    
    // 更新小组件
    document.getElementById('widgetCalDay').textContent = now.getDate();
    document.getElementById('widgetCalWeek').textContent = days[now.getDay()];
    document.getElementById('widgetCalMonth').textContent = months[now.getMonth()];
}

// 初始化运行
updateClock();
setInterval(updateClock, 1000);
