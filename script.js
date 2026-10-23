// ===== 实时时间更新 =====
function updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${h}:${m}`;
    
    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const dateStr = `${months[now.getMonth()]}${now.getDate()}日 ${days[now.getDay()]}`;
    
    document.getElementById('lockTime').textContent = timeStr;
    document.getElementById('lockDate').textContent = dateStr;
    document.getElementById('statusTime').textContent = timeStr;
    document.getElementById('widgetCalDay').textContent = now.getDate();
    document.getElementById('widgetCalWeek').textContent = days[now.getDay()];
    document.getElementById('widgetCalMonth').textContent = months[now.getMonth()];
}
updateTime();
setInterval(updateTime, 1000);

// ===== 锁屏交互 =====
const lockScreen = document.getElementById('lockScreen');
const passcodeOverlay = document.getElementById('passcodeOverlay');
const passcodeDots = document.getElementById('passcodeDots');
const passcodeError = document.getElementById('passcodeError');
const dots = passcodeDots.querySelectorAll('span');
let inputCode = '';
const CORRECT_CODE = '1107';

// 点击锁屏显示密码键盘
lockScreen.addEventListener('click', (e) => {
    if (!passcodeOverlay.classList.contains('show') && !e.target.closest('.key')) {
        passcodeOverlay.classList.add('show');
    }
});

// 键盘输入
document.querySelectorAll('.key[data-key]').forEach(key => {
    key.addEventListener('click', () => {
        if (inputCode.length < 4) {
            inputCode += key.dataset.key;
            updateDots();
            if (inputCode.length === 4) checkPasscode();
        }
    });
});

document.getElementById('keyDelete').addEventListener('click', () => {
    inputCode = inputCode.slice(0, -1);
    updateDots();
    passcodeError.classList.remove('show');
});

function updateDots() {
    dots.forEach((dot, i) => {
        dot.classList.toggle('filled', i < inputCode.length);
    });
}

function checkPasscode() {
    if (inputCode === CORRECT_CODE) {
        setTimeout(() => {
            lockScreen.classList.remove('active');
            document.getElementById('homeScreen').classList.add('active');
            passcodeOverlay.classList.remove('show');
            inputCode = '';
            updateDots();
        }, 200);
    } else {
        passcodeError.classList.add('show');
        passcodeDots.classList.add('shake');
        setTimeout(() => {
            passcodeDots.classList.remove('shake');
            inputCode = '';
            updateDots();
        }, 500);
    }
}

// ===== App 打开/关闭 =====
const appView = document.getElementById('appView');
const appTitle = document.getElementById('appTitle');
const appNames = {
    phone: '电话', messages: '信息', mail: '邮件', notes: '备忘录',
    camera: '相机', instagram: 'Instagram', browser: '浏览器', settings: '设置'
};

document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', () => {
        const app = item.dataset.app;
        appTitle.textContent = appNames[app] || '应用';
        appView.classList.add('open');
    });
});

document.getElementById('backBtn').addEventListener('click', () => {
    appView.classList.remove('open');
});