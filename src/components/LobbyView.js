export function renderLobbyView({ rooms, player, onSaveProfile, onCreateRoom, onJoinRoom }) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';
  container.style.width = '100%';

  // 1. 닉네임 입력 전 뷰 (첫 화면 정중앙 정밀 정렬)
  if (!player || !player.nickname) {
    container.innerHTML = `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px; text-align: center;">
        <div style="width: 100%; max-width: 320px;">
          <h1 class="brand-title" style="font-size: 1.8rem; margin-bottom: 8px;">상식퀴즈대전</h1>
          <p class="brand-desc" style="margin-bottom: 32px;">실시간 멀티플레이 퀴즈 대전</p>

          <div class="clean-card" style="padding: 28px 20px;">
            <label style="display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-sub); margin-bottom: 12px; text-align: left;">
              사용할 닉네임
            </label>
            <input 
              type="text" 
              id="nickname-input" 
              class="clean-input" 
              placeholder="닉네임 입력 (최대 8자)" 
              maxlength="8" 
              style="margin-bottom: 16px; text-align: center;" 
              autofocus
            />
            
            <button id="save-profile-btn" class="clean-btn clean-btn-primary" style="width: 100%;">
              대전 시작하기
            </button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const saveBtn = container.querySelector('#save-profile-btn');
      const nicknameInput = container.querySelector('#nickname-input');

      const submitProfile = () => {
        const nickname = nicknameInput.value.trim();
        if (!nickname) {
          alert('닉네임을 입력해 주세요.');
          return;
        }
        onSaveProfile({ nickname, avatar: nickname.charAt(0).toUpperCase() });
      };

      saveBtn.addEventListener('click', submitProfile);
      nicknameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          submitProfile();
        }
      });
    }, 0);

    return container;
  }

  // 2. 메인 대기 로비 뷰
  container.innerHTML = `
    <div style="padding: 20px 20px 16px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="brand-title" style="font-size: 1.3rem;">상식퀴즈대전</h1>
        <p class="brand-desc" style="font-size: 0.8rem;">대기 중인 방에 참가하거나 개설하세요</p>
      </div>
      <div style="background: var(--card-bg); padding: 6px 14px; border-radius: 12px; border: 1px solid var(--border-color); font-weight: 800; font-size: 0.88rem; color: #ffffff;">
        ${player.nickname} 님
      </div>
    </div>

    <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <button id="open-create-room-btn" class="clean-btn clean-btn-gold" style="flex: 1;">방 만들기</button>
        <button id="quick-join-btn" class="clean-btn clean-btn-primary" style="flex: 1;">빠른 입장</button>
      </div>

      <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-sub); margin-bottom: 12px;">
        대기 방 목록 (${rooms.length})
      </div>

      <div id="room-list" style="flex: 1; overflow-y: auto;">
        ${rooms.length === 0 ? `
          <div class="clean-card" style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 0.9rem;">
            개설된 방이 없습니다.<br>[방 만들기]를 눌러 첫 방을 생성해보세요.
          </div>
        ` : rooms.map(room => `
          <div class="clean-card room-item" data-room-id="${room.id}" style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
            <div>
              <div style="font-weight: 800; font-size: 1rem; margin-bottom: 2px; color: #ffffff;">${room.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-sub);">카테고리: ${getCategoryLabel(room.category)}</div>
            </div>
            <div style="font-weight: 800; font-size: 0.85rem; color: ${room.players.length >= room.maxPlayers ? 'var(--color-error)' : 'var(--border-focus)'}">
              ${room.players.length} / ${room.maxPlayers} 명
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  setTimeout(() => {
    container.querySelector('#open-create-room-btn').addEventListener('click', () => {
      showCreateRoomModal(onCreateRoom);
    });

    container.querySelectorAll('.room-item').forEach(card => {
      card.addEventListener('click', () => {
        onJoinRoom(card.dataset.roomId);
      });
    });

    container.querySelector('#quick-join-btn').addEventListener('click', () => {
      const availableRoom = rooms.find(r => r.players.length < r.maxPlayers && r.status === 'waiting');
      if (availableRoom) {
        onJoinRoom(availableRoom.id);
      } else {
        alert('입장 가능한 빈 방이 없습니다. 방을 개설해보세요!');
      }
    });
  }, 0);

  return container;
}

function getCategoryLabel(cat) {
  const map = {
    all: "전체 상식",
    history: "역사/문화",
    science: "과학/IT",
    sports: "스포츠/엔터",
    economy: "시사/경제"
  };
  return map[cat] || "일반";
}

function showCreateRoomModal(onCreateRoom) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay-backdrop';
  overlay.innerHTML = `
    <div class="overlay-card" style="max-width: 380px;">
      <h3 style="margin-bottom: 16px; font-size: 1.2rem; font-weight: 800; color: #ffffff;">대 방 만들기</h3>
      
      <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--text-sub); margin-bottom:6px;">방 제목</label>
      <input type="text" id="modal-room-title" class="clean-input" value="상식 한판 승부" style="margin-bottom: 14px;" />

      <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--text-sub); margin-bottom:6px;">카테고리</label>
      <select id="modal-room-category" class="clean-input" style="margin-bottom: 14px;">
        <option value="all">전체 상식 (추천)</option>
        <option value="history">역사/문화</option>
        <option value="science">과학/IT</option>
        <option value="sports">스포츠/엔터</option>
        <option value="economy">시사/경제</option>
      </select>

      <label style="display:block; font-size:0.8rem; font-weight:700; color:var(--text-sub); margin-bottom:6px;">최대 인원</label>
      <select id="modal-room-max" class="clean-input" style="margin-bottom: 20px;">
        <option value="2">2명 (1:1)</option>
        <option value="4" selected>4명 (권장)</option>
        <option value="6">6명</option>
        <option value="8">8명</option>
      </select>

      <div style="display: flex; gap: 10px;">
        <button id="modal-cancel-btn" class="clean-btn btn-sub" style="flex: 1;">취소</button>
        <button id="modal-submit-btn" class="clean-btn btn-primary" style="flex: 1;">생성 및 입장</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#modal-cancel-btn').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  overlay.querySelector('#modal-submit-btn').addEventListener('click', () => {
    const title = overlay.querySelector('#modal-room-title').value.trim();
    const category = overlay.querySelector('#modal-room-category').value;
    const maxPlayers = overlay.querySelector('#modal-room-max').value;

    onCreateRoom({ title, category, maxPlayers });
    document.body.removeChild(overlay);
  });
}
