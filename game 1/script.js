// =========================================================================
// 1. CẤU HÌNH DỮ LIỆU CHÍNH XÁC 5 MÀN CHƠI THEO ĐÚNG ẢNH GỐC
// =========================================================================
const stageConfigs = {
    1: { title: "Màn 1: Cơn Mưa Tại Trạm Xe Buýt", timeLimit: 17, items: [1, 2, 5, 10], type: "normal", tool: "🌂", unit: "người" },
    2: { title: "Màn 2: Dòng Lũ Cô Lập – Thuyền Cứu Hộ", timeLimit: 19, items: [1, 1, 2, 2, 3, 5, 6], type: "normal", tool: "🛶", unit: "người" },
    3: { title: "Màn 3: Hỏa Hoạn Ghen Đua – Thang Sinh Tồn", timeLimit: 23, items: [1, 1, 1, 1, 2, 2, 3, 3, 4, 5], type: "normal", tool: "🪜", unit: "người" },
    4: { title: "Màn 4: Thung Lũng Hoang Dã (5 Xe Hàng)", timeLimit: 17, items: [1, 2, 3, 5, 6], type: "valley_rule", tool: "🛒", unit: "xe" },
    5: { title: "Màn 5: Phi Vụ Cuối Cùng (7 Tên Trộm)", timeLimit: 21, items: [1, 1, 2, 3, 4, 5, 6], type: "heist_rule", tool: "⌚", unit: "trộm" }
};

let currentStage = 1;
let timeRemaining = 0; 
let currentSide = "start"; 

let startState = [];
let endState = [];
let selectedItems = [];

// =========================================================================
// 2. LOGIC QUẢN LÝ GIAO DIỆN & MENU CHỌN MÀN
// =========================================================================

function initStage(stageNum) {
    document.getElementById('level-menu').style.display = 'none';
    document.getElementById('game-play-zone').style.display = 'block';

    currentStage = parseInt(stageNum);
    const config = stageConfigs[currentStage];
    
    const viewport = document.getElementById('viewport');
    viewport.innerHTML = `
        <div class="env-effect" id="env-effect"></div>
        <div class="camera-laser" id="laser-scan"></div>
        <div class="game-arena">
            <div class="side-dock" id="start-dock">
                <h4 class="dock-title">XUẤT PHÁT</h4>
                <div class="char-container" id="start-chars"></div>
            </div>
            <div class="center-path">
                <div class="transport-vehicle" id="vehicle">
                    <span id="vehicle-icon">🌂</span>
                    <div id="passenger-slots"></div>
                </div>
            </div>
            <div class="side-dock" id="end-dock">
                <h4 class="dock-title">ĐÍCH ĐẾN</h4>
                <div class="char-container" id="end-chars"></div>
            </div>
        </div>
    `;

    timeRemaining = config.timeLimit;
    currentSide = "start";
    selectedItems = [];
    endState = [];
    
    // Đánh mã số cố định dựa theo đúng thứ tự (Số 1 là số đầu tiên, Số 2 là số tiếp theo...)
    startState = config.items.map((val, idx) => {
        return { id: idx + 1, val: val };
    });
    
    document.getElementById('stage-title').innerText = config.title;
    document.getElementById('vehicle-icon').innerText = config.tool;
    document.getElementById('laser-scan').style.display = (currentStage === 5) ? "block" : "none";
    viewport.classList.remove('screen-game-over-shake');
    
    displayTime();
    updateUI();
}

function backToMenu() {
    document.getElementById('game-play-zone').style.display = 'none';
    document.getElementById('level-menu').style.display = 'block';
}

function selectLevel(levelNum) {
    initStage(levelNum);
}

function displayTime() {
    document.getElementById('time-left').innerText = `${timeRemaining}:00`;
    
    let totalLimit = stageConfigs[currentStage].timeLimit;
    let percent = (timeRemaining / totalLimit) * 100;
    document.getElementById('progress-fill').style.width = percent + '%';
    document.getElementById('env-effect').style.height = (100 - percent) + '%';
    
    if (percent <= 20) {
        document.getElementById('progress-fill').style.backgroundColor = '#ff1744';
    } else if (percent <= 50) {
        document.getElementById('progress-fill').style.backgroundColor = '#ffea00';
    } else {
        document.getElementById('progress-fill').style.backgroundColor = '#00e676';
    }
}

// =========================================================================
// 3. LOGIC ĐIỀU KHIỂN NHÂN VẬT & DI CHUYỂN
// =========================================================================

function updateUI() {
    const startContainer = document.getElementById('start-chars');
    const endContainer = document.getElementById('end-chars');
    const vehicle = document.getElementById('vehicle');
    
    startContainer.innerHTML = '';
    endContainer.innerHTML = '';
    
    startState.forEach((item) => {
        startContainer.appendChild(createCharDiv(item, "start"));
    });
    
    endState.forEach((item) => {
        endContainer.appendChild(createCharDiv(item, "end"));
    });
    
    if (currentSide === "start") {
        vehicle.style.left = "20px";
        document.getElementById('action-btn').innerText = "DI CHUYỂN QUA ĐÍCH";
    } else {
        vehicle.style.left = "calc(100% - 110px)";
        document.getElementById('action-btn').innerText = "QUAY VỀ ĐÓN NGƯỜI";
    }
    
    document.getElementById('passenger-slots').innerText = selectedItems.map(i => i.val + 'p').join(' & ');
}

function createCharDiv(item, side) {
    const config = stageConfigs[currentStage];
    let div = document.createElement('div');
    div.className = 'character';
    
    let idNumber = item.id;
    let isOdd = (idNumber % 2 !== 0);

    if (currentStage === 4) {
        div.innerText = `MÃ SỐ ${idNumber} [${item.val}p] ${isOdd ? '🥩' : ''}`;
        div.title = isOdd ? "Xe số lẻ có đồ ăn bảo vệ!" : "Xe số chẵn, đi chung 2 xe chẵn sẽ bị thú dữ tấn công!";
    } else if (currentStage === 5) {
        div.innerText = `MÃ SỐ ${idNumber} [${item.val}p] ${isOdd ? '🎭' : ''}`;
        div.title = isOdd ? "Trộm số lẻ có thể vận hành đồng hồ ngụy trang!" : "Trộm số chẵn, đi chung 2 người chẵn đồng hồ sẽ hỏng!";
    } else {
        div.innerText = `${config.unit.toUpperCase()} ${item.val}p`;
    }
    
    let isSelected = selectedItems.some(i => i.id === item.id);
    if (isSelected) div.classList.add('selected');
    
    div.onclick = () => toggleSelect(item, side);
    return div;
}

function toggleSelect(item, side) {
    if (side !== currentSide) return;
    
    let existingIndex = selectedItems.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
        selectedItems.splice(existingIndex, 1);
    } else {
        if (selectedItems.length >= 2) return;
        selectedItems.push(item);
    }
    updateUI();
}

function handleAction() {
    if (selectedItems.length === 0) return;
    
    // 🚨 KIỂM TRA QUY LUẬT SỐ LẺ DỰA TRÊN ID (MÃ SỐ THỨ TỰ)
    if (selectedItems.length === 2 && (stageConfigs[currentStage].type === "valley_rule" || stageConfigs[currentStage].type === "heist_rule")) {
        let hasOddId = selectedItems.some(item => item.id % 2 !== 0);
        if (!hasOddId) {
            triggerGameOver("rule_violation");
            return;
        }
    }
    
    // Thời gian tiêu tốn là số phút lớn nhất trong các thực thể được chọn
    let vals = selectedItems.map(i => i.val);
    let costTime = Math.max(...vals);
    
    // ⏳ THỰC HIỆN TRỪ THỜI GIAN ĐẾM NGƯỢC
    timeRemaining -= costTime;
    
    // 🔄 CẬP NHẬT MẢNG DỮ LIỆU SANG BỜ ĐỐI DIỆN
    if (currentSide === "start") {
        selectedItems.forEach(selectedItem => {
            let idx = startState.findIndex(i => i.id === selectedItem.id);
            if (idx > -1) startState.splice(idx, 1);
            endState.push(selectedItem);
        });
        currentSide = "end";
    } else {
        selectedItems.forEach(selectedItem => {
            let idx = endState.findIndex(i => i.id === selectedItem.id);
            if (idx > -1) endState.splice(idx, 1);
            startState.push(selectedItem);
        });
        currentSide = "start";
    }
    
    selectedItems = [];
    updateUI();
    
    // 🏆 KIỂM TRA ĐIỀU KIỆN CHIẾN THẮNG (Tất cả qua bờ và thời gian lớn hơn hoặc bằng 0)
    if (startState.length === 0 && currentSide === "end" && timeRemaining >= 0) {
        if (timeRemaining < 0) timeRemaining = 0;
        displayTime();
        triggerWin();
        return;
    }
    
    // 🚨 NẾU CHƯA QUA HẾT MÀ THỜI GIAN ĐÃ HẾT (HOẶC NHỎ HƠN 0) -> THUA
    if (timeRemaining <= 0) {
        timeRemaining = 0;
        displayTime();
        triggerGameOver("time_out");
        return;
    }
    
    displayTime();
}

// =========================================================================
// 4. HIỆU ỨNG KẾT THÚC: THẮNG / THUA 
// =========================================================================

function triggerWin() {
    const arena = document.querySelector('.game-arena');
    let title = "CHIẾN THẮNG!";
    let msg = "";
    let stageNum = parseInt(currentStage);

    if (stageNum === 1) {
        msg = "Mọi người đều vào kịp cổng công ty, quẹt thẻ báo xanh thành công, cả nhóm reo hò vui mừng rạng rỡ vì bảo toàn được phần thưởng chuyên cần.";
    } else if (stageNum === 2) {
        msg = "Thuyền cập bờ an toàn ngay trước khi đập thủy điện xả lũ đợt 2. Các nhân vật nhảy lên bờ cao vẫy tay ăn mừng nhẹ nhõm.";
    } else if (stageNum === 3) {
        msg = "Nhân vật cuối cùng bước qua ban công an toàn, chiếc thang tre rơi xuống đúng lúc ngọn lửa hung hãn bùng lên thiêu rụi căn phòng cũ.";
    } else if (stageNum === 4) {
        title = "MÀN 4 HOÀN THÀNH!";
        msg = "Xe hàng cuối cùng tới nơi, người chủ của 5 xe hàng vừa vặn gặp được thương nhân ngay khi ông ta định từ bỏ chờ đợi và bán được núi vàng thành công mỹ mãn!";
    } else if (stageNum === 5) {
        title = "PHI VỤ THẾ KỶ THÀNH CÔNG!";
        msg = "Hacker vô hiệu hóa hoàn toàn hệ thống an ninh của hoàng gia. Nhóm trộm rút lui thành công vào bóng tối, trộm được rất nhiều tiền vàng và chia nhau chiến lợi phẩm.";
    }
    
    arena.innerHTML = `
        <div style="text-align:center; width:100%; padding: 40px; box-sizing:border-box;">
            <h1 style="color:#00ffcc; font-size:2rem; text-shadow:0 0 10px rgba(0,255,204,0.4);">${title}</h1>
            <p style="font-size:1.1rem; line-height:1.6; max-width:600px; margin:20px auto; color:#fff;">${msg}</p>
            <p style="font-size:1.2rem; color:#ffea00; font-weight:bold;">Thời gian còn dư: ${timeRemaining} phút</p>
            <div style="display:flex; justify-content:center; gap:15px; margin-top:25px;">
                ${stageNum < 5 ? 
                    `<button class="action-btn" onclick="nextStage()">MÀN TIẾP THEO</button>` : 
                    `<h2 style="color:#ffea00; margin:0; display:flex; align-items:center;">🏆 BẠN ĐÃ PHÁ ĐẢO TRÒ CHƠI!</h2>`
                }
                <button class="action-btn" style="background:#2a2a50;" onclick="backToMenu()">VỀ CHỌN MÀN</button>
            </div>
        </div>
    `;
}

function triggerGameOver(reason) {
    const viewport = document.getElementById('viewport');
    const arena = document.querySelector('.game-arena');
    
    viewport.classList.add('screen-game-over-shake');
    let loseMessage = "";
    let stageNum = parseInt(currentStage);
    
    if (reason === "time_out") {
        if (stageNum === 4) {
            loseMessage = "Thương nhân đã bỏ đi! 5 xe hàng mất trắng!";
        } else if (stageNum === 5) {
            loseMessage = "Không hoàn thành nhiệm vụ! Phải chết!";
        } else {
            const generic = {
                1: "Trễ giờ! Mất thưởng chuyên cần của cả nhóm!",
                2: "Lũ lớn ập đến! Cả nhóm bị cô lập hoàn toàn!",
                3: "Khói độc bao phủ! Không kịp thoát hiểm!"
            };
            loseMessage = generic[stageNum];
        }
    } else if (reason === "rule_violation") {
        if (stageNum === 4) {
            loseMessage = "Bị thú dữ tấn công! Xe hàng mất trắng!";
        } else if (stageNum === 5) {
            document.getElementById('laser-scan').classList.add('alarm');
            loseMessage = "Chiếc đồng hồ ngụy trang trên tay nhân vật phát ra các tia chớp điện chập mạch Xoẹt! Xoẹt! rồi nổ nhẹ và bốc khói. Ngay lập tức, Camera giám sát phía trên khóa mục tiêu bằng một hồng tâm đỏ rực. Tiếng còi báo động rú vang liên tục, màn hình rung lắc dữ dội. Và tất cả bị bắt cả ông trùm cũng bị bắt!";
        }
    }
    
    arena.innerHTML = `
        <div style="text-align:center; width:100%; padding: 40px; box-sizing:border-box; color:#ff1744;">
            <h1 style="font-size:2.5rem; margin:0; text-shadow:0 0 10px rgba(255,23,68,0.4);">GAME OVER</h1>
            <p style="font-size:1.1rem; color:#fff; line-height:1.6; max-width:600px; margin:20px auto;">${loseMessage}</p>
            <div style="display:flex; justify-content:center; gap:15px; margin-top:25px;">
                <button class="action-btn" style="background:#ff1744;" onclick="restartStage()">THỬ LẠI</button>
                <button class="action-btn" style="background:#2a2a50;" onclick="backToMenu()">VỀ CHỌN MÀN</button>
            </div>
        </div>
    `;
}

function nextStage() { initStage(currentStage + 1); }
function restartStage() { initStage(currentStage); }

window.onload = () => {
    backToMenu();
};