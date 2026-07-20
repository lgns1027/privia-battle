import { getMyPlayerId } from '../engine/broadcast.js';

export function renderWaitingRoomView({ room, onToggleReady, onStartGame, onLeaveRoom }) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';
  container.style.padding = '20px';

  const myId = getMyPlayerId();
  const me = room.players.find(p => p.id === myId);
  const isHost = me ? me.isHost : false;
  const allReadyExceptHost = room.players
    .filter(p => !p.isHost)
    .every(p => p.isReady);
  const canStart = isHost && room.players.length >= 2 && allReadyExceptHost;

  container.innerHTML = `
    <!-- 상단 헤더 및 퇴장 버튼 -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">${room.title}</h2>
        <p style="color: var(--text-sub); font-size: 0.82rem; margin-top: 4px;">
          ${getCategoryLabel(room.category)} | 정원 ${room.players.length} / ${room.maxPlayers} 명
        </p>
      </div>
      <button id="leave-room-btn" class="btn-red" style="height: 40px; padding: 0 16px; font-size: 0.85rem;">
        퇴장
      </button>
    </div>

    <!-- 참가자 리스트 -->
    <div class="clean-card" style="flex: 1; margin-bottom: 20px; display: flex; flex-direction: column;">
      <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-sub); margin-bottom: 14px;">
        대기 중인 참가자 목록 (${room.players.length}명)
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto;">
        ${room.players.map(p => `
          <div style="display: flex; align-items: center; justify-content: space-between; background: var(--input-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="user-avatar">
                ${p.nickname.charAt(0).toUpperCase()}
              </div>
              <div style="font-weight: 800; font-size: 0.95rem; color: #ffffff;">
                ${p.nickname} ${p.id === myId ? '<span style="color: var(--border-focus); font-size: 0.8rem;">(나)</span>' : ''}
              </div>
            </div>
            <div>
              ${p.isHost ? `
                <span class="badge-chip badge-host">HOST</span>
              ` : `
                <span class="badge-chip ${p.isReady ? 'badge-ready' : 'badge-waiting'}">
                  ${p.isReady ? 'READY' : 'WAITING'}
                </span>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 하단 액션 버튼 -->
    <div style="margin-top: auto;">
      ${!isHost ? `
        <button id="toggle-ready-btn" class="clean-btn ${me && me.isReady ? 'btn-sub' : 'btn-primary'}" style="width: 100%;">
          ${me && me.isReady ? 'READY 취소' : '준비 완료 (READY)'}
        </button>
      ` : `
        <button id="start-game-btn" class="clean-btn btn-gold" style="width: 100%;" ${!canStart ? 'disabled' : ''}>
          게임 시작 (${canStart ? '준비 완료' : '모든 참가자 READY 필요'})
        </button>
      `}
    </div>
  `;

  setTimeout(() => {
    container.querySelector('#leave-room-btn').addEventListener('click', () => {
      onLeaveRoom();
    });

    const readyBtn = container.querySelector('#toggle-ready-btn');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        onToggleReady();
      });
    }

    const startBtn = container.querySelector('#start-game-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (canStart) {
          onStartGame();
        }
      });
    }
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
