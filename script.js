// ===== 配置 =====
const PASSCODE = "1107";

// ===== 状态 =====
let currentPasscode = "";
let currentScreen = "lock";
let currentApp = null;
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();

// ===== DOM =====
const lockScreen = document.getElementById("lock-screen");
const homeScreen = document.getElementById("home-screen");
const passcodeOverlay = document.getElementById("passcode-overlay");
const passcodeDots = document.querySelectorAll(".passcode-dot");
const passcodeError = document.getElementById("passcode-error");
const lockTime = document.getElementById("lock-time");
const lockDateTop = document.getElementById("lock-date-top");
const calTitle = document.getElementById("cal-title");
const calGrid = document.getElementById("cal-grid");
const appView = document.getElementById("app-view");
const appTitle = document.getElementById("app-title");
const appContent = document.getElementById("app-content");

// ===== 时间更新 =====
function updateLockTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    lockTime.textContent = `${hh}:${mm}:${ss}`;

    const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDay = weekDays[now.getDay()];
    lockDateTop.textContent = `${month}月${date}日 ${weekDay}`;
}

setInterval(updateLockTime, 1000);
updateLockTime();

// ===== 锁屏滑动解锁 =====
let startY = 0;
let isDragging = false;

lockScreen.addEventListener("touchstart", (e) => {
    if (passcodeOverlay.classList.contains("active")) return;
    startY = e.touches[0].clientY;
    isDragging = true;
});

lockScreen.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY;
    if (diff < -30) {
        isDragging = false;
        showPasscode();
    }
});

lockScreen.addEventListener("mousedown", (e) => {
    if (passcodeOverlay.classList.contains("active")) return;
    startY = e.clientY;
    isDragging = true;
});

lockScreen.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    if (e.clientY - startY < -30) {
        showPasscode();
    }
});

// ===== 密码键盘 =====
function showPasscode() {
    passcodeOverlay.classList.add("active");
    currentPasscode = "";
    updateDots();
    passcodeError.classList.remove("show");
}

function hidePasscode() {
    passcodeOverlay.classList.remove("active");
    currentPasscode = "";
    updateDots();
    passcodeError.classList.remove("show");
}

function updateDots() {
    passcodeDots.forEach((dot, i) => {
        dot.classList.toggle("filled", i < currentPasscode.length);
    });
}

function handleKey(value) {
    if (value === "delete") {
        currentPasscode = currentPasscode.slice(0, -1);
        updateDots();
        return;
    }
    if (currentPasscode.length >= 4) return;
    currentPasscode += value;
    updateDots();
    if (currentPasscode.length === 4) {
        setTimeout(checkPasscode, 200);
    }
}

function checkPasscode() {
    if (currentPasscode === PASSCODE) {
        hidePasscode();
        switchScreen("home");
    } else {
        passcodeError.classList.add("show");
        currentPasscode = "";
        updateDots();
        setTimeout(() => passcodeError.classList.remove("show"), 1500);
    }
}

document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("click", () => {
        const val = key.getAttribute("data-key");
        if (val) handleKey(val);
    });
});

// ===== 屏幕切换 =====
function switchScreen(screen) {
    currentScreen = screen;
    lockScreen.classList.toggle("active", screen === "lock");
    homeScreen.classList.toggle("active", screen === "home");
}

// ===== 应用打开 / 关闭 =====
function openApp(name) {
    currentApp = name;
    appTitle.textContent = name;
    appContent.innerHTML = "";

    if (name === "日历") {
        renderCalendar(calendarYear, calendarMonth);
    } else if (name === "天气") {
        appContent.innerHTML = `
            <div style="text-align:center;padding-top:40px;">
                <div style="font-size:60px;margin-bottom:12px;">⛅</div>
                <div style="font-size:48px;font-weight:200;">26°</div>
                <div style="font-size:16px;opacity:0.7;margin-top:8px;">多云</div>
                <div style="font-size:14px;opacity:0.5;margin-top:4px;">香港</div>
            </div>`;
    } else if (name === "设置") {
        appContent.innerHTML = `
            <div style="padding-top:20px;">
                <div style="background:rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">
                    <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.06);">飞行模式</div>
                    <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.06);">Wi-Fi</div>
                    <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.06);">蓝牙</div>
                    <div style="padding:14px 16px;">通知</div>
                </div>
            </div>`;
    } else {
        appContent.innerHTML = `<div style="text-align:center;padding-top:100px;opacity:0.5;">${name}</div>`;
    }

    appView.classList.add("active");
}

function closeApp() {
    appView.classList.remove("active");
    currentApp = null;
}

document.getElementById("back-btn").addEventListener("click", closeApp);

// ===== 应用点击 =====
document.querySelectorAll(".app-item").forEach((item) => {
    item.addEventListener("click", () => {
        const name = item.querySelector("span").textContent;
        openApp(name);
    });
});

// ===== 日历 =====
function renderCalendar(year, month) {
    const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    calTitle.textContent = `${year}年 ${months[month]}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    let html = "";
    const weekLabels = ["日", "一", "二", "三", "四", "五", "六"];
    weekLabels.forEach((d) => {
        html += `<div class="cal-header">${d}</div>`;
    });

    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="cal-day other-month">${prevDays - i}</div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === todayDate && month === todayMonth && year === todayYear;
        html += `<div class="cal-day${isToday ? " today" : ""}">${d}</div>`;
    }
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="cal-day other-month">${i}</div>`;
    }

    calGrid.innerHTML = html;
}

document.getElementById("cal-prev").addEventListener("click", () => {
    calendarMonth--;
    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderCalendar(calendarYear, calendarMonth);
});

document.getElementById("cal-next").addEventListener("click", () => {
    calendarMonth++;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }
    renderCalendar(calendarYear, calendarMonth);
});

document.getElementById("cal-today").addEventListener("click", () => {
    const now = new Date();
    calendarYear = now.getFullYear();
    calendarMonth = now.getMonth();
    renderCalendar(calendarYear, calendarMonth);
});

document.getElementById("cal-add-today").addEventListener("click", () => {
    alert("已添加今日日程！");
});

// ===== 小组件点击 =====
document.querySelector(".widget-calendar").addEventListener("click", () => openApp("日历"));
document.querySelector(".widget-weather").addEventListener("click", () => openApp("天气"));
