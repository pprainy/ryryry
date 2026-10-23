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

// ===== 锁屏交互（点击/上滑 -> 弹密码盘 -> 验证解锁）=====
function initLockScreen() {
    const lockScreen = document.getElementById('lockScreen');
    const passcodeOverlay = document.getElementById('passcodeOverlay');
    const passcodeDots = document.getElementById('passcodeDots');
    const passcodeError = document.getElementById('passcodeError');
    const dots = passcodeDots ? passcodeDots.querySelectorAll('span') : [];
    let inputCode = '';
    const CORRECT_CODE = '1107';

    if (!lockScreen) return;

    // 显示密码键盘的通用函数
    function showPasscode() {
        if (passcodeOverlay && !passcodeOverlay.classList.contains('show')) {
            passcodeOverlay.classList.add('show');
            inputCode = '';
            updateDots();
            if (passcodeError) passcodeError.classList.remove('show');
        }
    }

    // 1. 点击锁屏任意位置 -> 弹出密码键盘
    lockScreen.addEventListener('click', function (e) {
        // 如果点击的是键盘按键本身或密码遮罩层内部，不重复触发
        if (e.target.closest('.key') || e.target.closest('#passcodeOverlay')) return;
        showPasscode();
    });

    // 2. 上滑操作 -> 同样只弹出密码键盘，不再直接解锁
    let startY = 0;
    lockScreen.addEventListener('touchstart', function (e) {
        startY = e.touches[0].clientY;
    }, { passive: true });

    lockScreen.addEventListener('touchend', function (e) {
        const endY = e.changedTouches[0].clientY;
        // 向上滑动超过 50px 才触发
        if (startY - endY > 50) {
            showPasscode();
        }
    });

    // 3. 键盘数字输入
    var keys = document.querySelectorAll('.key[data-key]');
    keys.forEach(function (key) {
        key.addEventListener('click', function (e) {
            e.stopPropagation(); // 防止冒泡触发锁屏点击事件
            if (inputCode.length < 4) {
                inputCode += key.getAttribute('data-key');
                updateDots();
                if (inputCode.length === 4) checkPasscode();
            }
        });
    });

    // 4. 删除键
    var keyDelete = document.getElementById('keyDelete');
    if (keyDelete) {
        keyDelete.addEventListener('click', function (e) {
            e.stopPropagation();
            inputCode = inputCode.slice(0, -1);
            updateDots();
            if (passcodeError) passcodeError.classList.remove('show');
        });
    }

    // 更新密码点状态
    function updateDots() {
        dots.forEach(function (dot, i) {
            if (i < inputCode.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    // 5. 核心：密码验证逻辑
    function checkPasscode() {
        if (inputCode === CORRECT_CODE) {
            // 密码正确 -> 解锁并进入桌面
            setTimeout(function () {
                lockScreen.classList.remove('active');
                var home = document.getElementById('homeScreen');
                if (home) home.classList.add('active');
                if (passcodeOverlay) passcodeOverlay.classList.remove('show');
                inputCode = '';
                updateDots();
            }, 200);
        } else {
            // 密码错误 -> 震动提示并清空
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
