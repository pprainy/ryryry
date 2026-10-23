(function () {
    'use strict';

    /* ====== 密码 ====== */
    const PASSCODE = '1107';
    let entered = '';

    /* ====== DOM ====== */
    const lockScreen      = document.getElementById('lockScreen');
    const homeScreen      = document.getElementById('homeScreen');
    const passcodeOverlay = document.getElementById('passcodeOverlay');
    const passcodeDots    = document.getElementById('passcodeDots');
    const passcodeError   = document.getElementById('passcodeError');
    const pagesContainer  = document.getElementById('pagesContainer');
    const dots            = document.querySelectorAll('.dot');
    const appView         = document.getElementById('appView');
    const appTitle        = document.getElementById('appTitle');
    const backBtn         = document.getElementById('backBtn');

    /* ====== 时间 ====== */
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function updateTime() {
        const now = new Date();
        const hhmm = pad(now.getHours()) + ':' + pad(now.getMinutes());
        const month = now.getMonth() + 1;
        const date  = now.getDate();
        const weekDays = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
        const week = weekDays[now.getDay()];

        document.getElementById('lockStatusTime').textContent = hhmm;
        document.getElementById('lockTime').textContent       = hhmm;
        document.getElementById('lockDateTop').textContent    = month + '月' + date + '日 ' + week;
        document.getElementById('statusTime').textContent     = hhmm;

        document.getElementById('widgetCalDay').textContent   = date;
        document.getElementById('widgetCalWeek').textContent  = week;
        document.getElementById('widgetCalMonth').textContent = month + '月';
    }
    updateTime();
    setInterval(updateTime, 10000);

    /* ====== 锁屏上滑 ====== */
    let startY = 0;
    lockScreen.addEventListener('touchstart', function (e) { startY = e.touches[0].clientY; }, { passive: true });
    lockScreen.addEventListener('touchend', function (e) {
        const dy = startY - e.changedTouches[0].clientY;
        if (dy > 80) {
            passcodeOverlay.classList.add('show');
            entered = '';
            updateDots();
            passcodeError.classList.remove('show');
        }
    }, { passive: true });

    /* ====== 密码键盘 ====== */
    function updateDots() {
        const spans = passcodeDots.querySelectorAll('span');
        spans.forEach(function (s, i) { s.classList.toggle('filled', i < entered.length); });
    }

    passcodeOverlay.addEventListener('click', function (e) {
        const btn = e.target.closest('.key');
        if (!btn) return;
        if (btn.classList.contains('key-empty')) return;

        if (btn.classList.contains('key-delete')) {
            entered = entered.slice(0, -1);
        } else {
            if (entered.length >= 4) return;
            entered += btn.dataset.key;
        }
        updateDots();

        if (entered.length === 4) {
            if (entered === PASSCODE) {
                lockScreen.classList.remove('active');
                homeScreen.classList.add('active');
                passcodeOverlay.classList.remove('show');
                entered = '';
                updateDots();
            } else {
                passcodeError.classList.add('show');
                entered = '';
                updateDots();
                setTimeout(function () { updateDots(); passcodeError.classList.remove('show'); }, 800);
            }
        }
    });

    /* ====== 翻页 ====== */
    let currentPage = 0;
    const totalPages = 2;
    let startX = 0, startY2 = 0, dragging = false;

    pagesContainer.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY2 = e.touches[0].clientY;
        dragging = true;
        pagesContainer.style.transition = 'none';
    }, { passive: true });

    pagesContainer.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        const dx = e.touches[0].clientX - startX;
        const dy = Math.abs(e.touches[0].clientY - startY2);
        if (dy > Math.abs(dx)) return;
        const offset = -currentPage * 100 + (dx / 375) * 100;
        pagesContainer.style.transform = 'translateX(' + offset + '%)';
    }, { passive: true });

    pagesContainer.addEventListener('touchend', function (e) {
        if (!dragging) return;
        dragging = false;
        pagesContainer.style.transition = 'transform 0.35s cubic-bezier(0.25,0.8,0.25,1)';
        const dx = e.changedTouches[0].clientX - startX;
        if (dx < -50 && currentPage < totalPages - 1) currentPage++;
        else if (dx > 50 && currentPage > 0) currentPage--;
        goToPage(currentPage);
    }, { passive: true });

    function goToPage(idx) {
        currentPage = idx;
        pagesContainer.style.transform = 'translateX(' + (-currentPage * 100) + '%)';
        dots.forEach(function (d, i) { d.classList.toggle('active', i === currentPage); });
    }

    dots.forEach(function (d) {
        d.addEventListener('click', function () { goToPage(parseInt(d.dataset.page)); });
    });

    /* ====== 打开 App ====== */
    const appNames = {
        phone: '电话', messages: '信息', mail: '邮件', notes: '备忘录',
        camera: '相机', instagram: 'Instagram', settings: '设置',
        contacts: '联系人', photos: '相册', voicememos: '录音',
        x: 'X', kakaotalk: 'KakaoTalk', xiaohongshu: '小红书',
        calendar: '日历'
    };

    document.addEventListener('click', function (e) {
        const item = e.target.closest('.app-item[data-app]');
        if (!item) return;
        const key = item.dataset.app;
        if (appNames[key]) {
            appTitle.textContent = appNames[key];
            appView.classList.add('open');
        }
    });

    backBtn.addEventListener('click', function () {
        appView.classList.remove('open');
    });

})();
