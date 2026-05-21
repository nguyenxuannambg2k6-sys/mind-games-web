// =========================================================================
// 1. CẤU HÌNH MA TRẬN CỬA ĐỘNG CHO CẢ 5 MÀN CHƠI DỰA TRÊN ẢNH GỐC VÀ YÊU CẦU
// =========================================================================
const stageConfigs = {
    1: { name: "Màn 1: Cổng Cơ Bản", doorsCount: 3, gridCols: 3 },
    2: { name: "Màn 2: Tường Lửa Cấp 2", doorsCount: 5, gridCols: 5 },
    3: { name: "Màn 3: Ma Trận Dữ Liệu", doorsCount: 20, gridCols: 5 },
    4: { name: "Màn 4: Siêu Máy Chủ", doorsCount: 50, gridCols: 10 },
    5: { name: "Màn 5: Lõi Hoàng Gia", doorsCount: 100, gridCols: 10 }
};

let currentStage = 1;
let doors = []; // Mảng quản lý danh sách object cửa { id, isReward }
let firstChosenId = null;
let aiKeptId = null; // Cánh cửa duy nhất được AI giữ lại để ép người chơi đấu trí
let gameState = "choose_first"; // Các trạng thái: choose_first, wait_decision, end

// =========================================================================
// 2. KHỞI TẠO MÀN CHƠI - ĐÃ DỌN SẠCH CODE LẶP DƯ THỪA GÂY LỖI KHUẤT Ô
// =========================================================================
function initStage(stageNum) {
    document.getElementById('level-menu').style.display = 'none';
    document.getElementById('game-play-zone').style.display = 'block';
    document.getElementById('control-panel').style.display = 'none';
    
    const viewport = document.getElementById('viewport');
    viewport.classList.remove('screen-shake');

    currentStage = parseInt(stageNum);
    const config = stageConfigs[currentStage];
    
    document.getElementById('stage-title').innerText = config.name;
    document.getElementById('instruction').innerText = "BẤM CHỌN 1 CÁNH CỬA BẤT KỲ ĐỂ BẮT ĐẦU XÂM NHẬP";
    
    gameState = "choose_first";
    firstChosenId = null;
    aiKeptId = null;
    doors = [];

    // Tái cấu trúc lưới CSS Grid
    const grid = document.getElementById('doors-grid');
    grid.style.gridTemplateColumns = `repeat(${config.gridCols}, 1fr)`;
    grid.innerHTML = '';

    // Chọn ngẫu nhiên một số từ 1 đến tổng số lượng cửa làm cửa thưởng
    const rewardIndex = Math.floor(Math.random() * config.doorsCount) + 1;

    // VÒNG LẶP CHUẨN: Chạy chính xác từ 1 đến hết cấu hình số cửa (Hiện đủ từ 1 đến 100)
    for (let i = 1; i <= config.doorsCount; i++) {
        doors.push({ id: i, isReward: (i === rewardIndex) });
        
        let div = document.createElement('div');
        div.className = 'door';
        div.id = `door-${i}`;
        div.innerText = i;
        div.onclick = () => handleFirstChoice(i);
        grid.appendChild(div);
    }
}

function backToMenu() {
    document.getElementById('game-play-zone').style.display = 'none';
    document.getElementById('level-menu').style.display = 'block';
}

function selectLevel(levelNum) { 
    initStage(levelNum); 
}

// =========================================================================
// 3. THUẬT TOÁN ĐẤU TRÍ QUÉT BẪY VÀ LỌC CỬA CỦA AI (LUẬT MONTY HALL CỦA BẠN)
// =========================================================================
function handleFirstChoice(chosenId) {
    if (gameState !== "choose_first") return;
    
    firstChosenId = chosenId;
    document.getElementById(`door-${chosenId}`).classList.add('selected');
    
    gameState = "wait_decision";
    processAiFilter();
}

function processAiFilter() {
    const chosenDoor = doors.find(d => d.id === firstChosenId);
    let potentialKeepDoors = [];

    // ÁP DỤNG CHÍNH XÁC LUẬT GIỮ CỬA THÔNG MINH CỦA BẠN:
    if (chosenDoor.isReward) {
        // Nếu ban đầu người chơi hên chọn TRÚNG cửa thưởng -> AI giữ lại 1 cửa THUA ngẫu nhiên
        potentialKeepDoors = doors.filter(d => d.id !== firstChosenId);
    } else {
        // Nếu ban đầu chọn SAI -> AI bắt buộc phải giữ lại chính xác CỬA THƯỞNG để đấu trí
        potentialKeepDoors = doors.filter(d => d.isReward);
    }

    // Chọn ra ID của cánh cửa được AI giữ lại
    let randomKeepObj = potentialKeepDoors[Math.floor(Math.random() * potentialKeepDoors.length)];
    aiKeptId = randomKeepObj.id;

    // AI mở toang xối xả tất cả các cánh cửa bẫy còn lại thành dấu ❌
    doors.forEach(d => {
        if (d.id !== firstChosenId && d.id !== aiKeptId) {
            let doorDiv = document.getElementById(`door-${d.id}`);
            doorDiv.classList.add('opened-trap');
            doorDiv.innerText = "❌";
        }
    });

    // Cập nhật text hiển thị bảng thông số lựa chọn Đổi/Giữ
    document.getElementById('instruction').innerText = "AI ĐÃ QUÉT SẠCH CÁC CỬA BẪY KHÁC! BẠN CÓ MUỐN ĐỔI SANG CÁNH CỬA CÒN LẠI KHÔNG?";
    document.getElementById('countdown-display').innerText = `Cửa bạn đang chọn: Số ${firstChosenId} | Cửa đối diện duy nhất: Số ${aiKeptId}`;
    document.getElementById('control-panel').style.display = 'block';
}

// =========================================================================
// 4. KIỂM TRA ĐIỀU KIỆN THẮNG / THUA TỪNG MÀN CHƠI CHUẨN KỊCH BẢN TÀN KHỐC
// =========================================================================
function confirmDecision(isSwitch) {
    if (gameState !== "wait_decision") return;
    gameState = "end";
    document.getElementById('control-panel').style.display = 'none';

    // Xác định cửa cuối cùng sau khi chọn Đổi hoặc Giữ
    let finalChosenId = isSwitch ? aiKeptId : firstChosenId;
    
    // Đồ họa cập nhật highlight viền vàng cho ô được mở cuối cùng
    document.getElementById(`door-${firstChosenId}`).classList.remove('selected');
    document.getElementById(`door-${finalChosenId}`).classList.add('selected');

    const finalDoorObj = doors.find(d => d.id === finalChosenId);
    const grid = document.getElementById('doors-grid');
    
    let totalDoorsCount = stageConfigs[currentStage].doorsCount;

    if (finalDoorObj.isReward) {
        // 🏆 KỊCH BẢN CHIẾN THẮNG KHỚP KỊCH BẢN
        let percent = isSwitch 
            ? Math.round(((totalDoorsCount - 1) / totalDoorsCount) * 100) 
            : Math.round((1 / totalDoorsCount) * 100);
        
        let winMessage = currentStage === 5 
            ? "HACK THÀNH CÔNG! Bạn đã lấy được lõi dữ liệu tối cao của Hoàng Gia và trộm được núi tiền vàng khổng lồ!"
            : "HACK THÀNH CÔNG! Đã chiếm quyền điều khiển Máy chủ bảo mật thành công!";

        grid.innerHTML = `
            <div style="text-align:center; width:100%; color:#00ffcc; grid-column: 1 / -1; padding:20px;">
                <h2 style="font-size:2rem; margin:0 0 10px 0;">${currentStage === 5 ? "PHI VỤ THẾ KỶ THÀNH CÔNG!" : "CHIẾN THẮNG!"}</h2>
                <p style="color:#fff; font-size:1.1rem; max-width:550px; margin: 10px auto; line-height:1.6;">${winMessage}</p>
                <p style="color:#ffea00; font-size:0.95rem; font-weight:bold;">Toán học thực tế chứng minh: Hành động ${isSwitch ? 'ĐỔI CỬA' : 'GIỮ CỬA'} ở màn ${totalDoorsCount} cửa này mang lại cho bạn tỷ lệ thắng là ${percent}%!</p>
                <div style="margin-top:25px;">
                    ${currentStage < 5 ? `<button class="game-btn switch-btn" onclick="nextStage()">MÀN TIẾP THEO</button>` : `<h3 style="color:#ffea00; font-size:1.5rem; margin-bottom:15px;">🏆 BẠN ĐÃ PHÁ ĐẢO TOÀN BỘ SIÊU MÁY CHỦ!</h3>`}
                    <button class="game-btn keep-btn" onclick="backToMenu()">VỀ CHỌN MÀN</button>
                </div>
            </div>
        `;
    } else {
        // 💀 KỊCH BẢN THUA CUỘC TÀN KHỐC THEO CÂU CHỮ YÊU CẦU CỦA BẠN
        document.getElementById('viewport').classList.add('screen-shake'); // Rung lắc màn hình dữ dội
        
        let loseMessage = "";
        
        if (currentStage === 5) {
            if (isSwitch) {
                // Đổi cửa nhưng vẫn thua ở màn 5
                loseMessage = "Chiếc đồng hồ ngụy trang trên tay nhân vật phát ra các tia chớp điện chập mạch Xoẹt! Xoẹt! rồi nổ nhẹ và bốc khói. Ngay lập tức, Camera giám sát phía trên khóa mục tiêu bằng một hồng tâm đỏ rực. Tiếng còi báo động rú vang liên tục, màn hình rung lắc dữ dội. Và tất cả bị bắt cả ông trùm cũng bị bắt!";
            } else {
                // Cố chấp giữ nguyên cửa thua ở màn 5 (Tỷ lệ thua 99%)
                loseMessage = "Không hoàn thành nhiệm vụ! Phải chết! Ông trùm ở nơi khác đã lạnh lùng bấm nút xóa sổ tất cả bọn họ, con chip được cấy trên người phát nổ!";
            }
        } else {
            // Màn 1, 2, 3, 4 thua dính bẫy điện
            loseMessage = "THẤT BẠI! Kích hoạt bẫy điện cao thế, toàn bộ hệ thống bốc cháy và dữ liệu bị thiêu rụi hoàn toàn!";
        }

        grid.innerHTML = `
            <div style="text-align:center; width:100%; color:#ff1744; grid-column: 1 / -1; padding:20px;">
                <h1 style="font-size:2.3rem; margin:0 0 10px 0; text-shadow:0 0 10px rgba(255,23,68,0.4);">GAME OVER</h1>
                <p style="color:#fff; font-size:1.1rem; max-width:580px; margin: 10px auto; line-height:1.6;">${loseMessage}</p>
                <div style="margin-top:25px;">
                    <button class="game-btn switch-btn" style="background:#ff1744; box-shadow:0 4px 12px rgba(255,23,68,0.3);" onclick="restartStage()">THỬ LẠI MÀN NÀY</button>
                    <button class="game-btn keep-btn" onclick="backToMenu()">VỀ CHỌN MÀN</button>
                </div>
            </div>
        `;
    }
}

function nextStage() { initStage(currentStage + 1); }
function restartStage() { initStage(currentStage); }

window.onload = () => {
    backToMenu();
};