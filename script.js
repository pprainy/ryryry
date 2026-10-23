// ===== 实时时间更新 =====
function updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const timeStr = h + ':' + m;

    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const dateStr = months[now.getMonth()] + now.getDate() + '日 ' + days[now.getDay()];

    const lockTime = document.getElementById('lockTime');
    if (lockTime) lockTime.textContent = timeStr;

    const lockDate = document.getElementById('lockDate');
    if (lockDate) lockDate.textContent = dateStr;

    const statusTime = document.getElementById('statusTime');
    if (statusTime) statusTime.textContent = timeStr;

    const widgetCalDay = document.getElementById('widgetCalDay');
    if (widgetCalDay) widgetCalDay.textContent = now.getDate();

    const widgetCalWeek = document.getElementById('widgetCalWeek');
    if (widgetCalWeek) widgetCalWeek.textContent = days[now.getDay()];

    const widgetCalMonth = document.getElementById('widgetCalMonth');
    if (widgetCalMonth) widgetCalMonth.textContent = months[now.getMonth()];
}

// ===== 锁屏交互（点击 + 上滑解锁）=====
function initLockScreen() {
    const lockScreen = document.getElementById('lockScreen');
    const passcodeOverlay = document.getElementById('passcodeOverlay');
    const passcodeDots = document.getElementById('passcodeDots');
    const passcodeError = document.getElementById('passcodeError');
    const dots = passcodeDots ? passcodeDots.querySelectorAll('span') : [];
    let inputCode = '';
    const CORRECT_CODE = '1107';

    if (!lockScreen) return;

    // 点击锁屏显示密码键盘
    lockScreen.addEventListener('click', function (e) {
        if (
            passcodeOverlay &&
            !passcodeOverlay.classList.contains('show') &&
            !e.target.closest('.key')
        ) {
            passcodeOverlay.classList.add('show');
        }
    });

    // 上滑解锁
    let startY = 0;
    lockScreen.addEventListener('touchstart', function (e) {
        startY = e.touches[0].clientY;
    }, { passive: true });

    lockScreen.addEventListener('touchend', function (e) {
        const endY = e.changedTouches[0].clientY;
        if (startY - endY > 80 && (!passcodeOverlay || !passcodeOverlay.classList.contains('show'))) {
            lockScreen.classList.remove('active');
            var home = document.getElementById('homeScreen');
            if (home) home.classList.add('active');
        }
    });

    // 键盘输入
    var keys = document.querySelectorAll('.key[data-key]');
    keys.forEach(function (key) {
        key.addEventListener('click', function () {
            if (inputCode.length < 4) {
                inputCode += key.getAttribute('data-key');
                updateDots();
                if (inputCode.length === 4) checkPasscode();
            }
        });
    });

    var keyDelete = document.getElementById('keyDelete');
    if (keyDelete) {
        keyDelete.addEventListener('click', function () {
            inputCode = inputCode.slice(0, -1);
            updateDots();
            if (passcodeError) passcodeError.classList.remove('show');
        });
    }

    function updateDots() {
        dots.forEach(function (dot, i) {
            if (i < inputCode.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    function checkPasscode() {
        if (inputCode === CORRECT_CODE) {
            setTimeout(function () {
                lockScreen.classList.remove('active');
                var home = document.getElementById('homeScreen');
                if (home) home.classList.add('active');
                if (passcodeOverlay) passcodeOverlay.classList.remove('show');
                inputCode = '';
                updateDots();
            }, 200);
        } else {
            if (passcodeError) passcodeError.classList.add('show');
            if (passcodeDots) passcodeDots.classList.add('shake');
            setTimeout(function () {
                if (passcodeDots) passcodeDots.classList.remove('shake');
                inputCode = '';
                updateDots();
            }, 500);
        }
    }
}

// ===== 应用程序打开/关闭 =====
function initApps() {
    var appView = document.getElementById('appView');
    var appTitle = document.getElementById('appTitle');
    var appNames = {
        phone: '电话',
        messages: '信息',
        mail: '邮件',
        notes: '备忘录',
        camera: '相机',
        instagram: 'Instagram',
        browser: '浏览器',
        settings: '设置'
    };

    if (!appView) return;

    var appItems = document.querySelectorAll('.app-item');
    appItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var app = item.getAttribute('data-app');
            if (appTitle) {
                appTitle.textContent = appNames[app] || '应用';
            }
            appView.classList.add('open');
        });
    });

    var backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function () {
            appView.classList.remove('open');
        });
    }
}

// ===== 页面加载后启动 =====
document.addEventListener('DOMContentLoaded', function () {
    updateTime();
    setInterval(updateTime, 1000);
    initLockScreen();
    initApps();
});
