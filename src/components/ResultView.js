import confetti from 'canvas-confetti';

export function renderResultView({ room, onReturnToLobby }) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';
  container.style.padding = '20px';

  // 1) 점수 내림차순 2) 반응속도 오름차순 정렬
  const sortedPlayers = [...room.players].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.totalResponseTime || 0) - (b.totalResponseTime || 0);
  });

  const first = sortedPlayers[0] || { nickname: "-", score: 0 };
  const second = sortedPlayers[1] || null;
  const third = sortedPlayers[2] || null;

  // 폭죽 효과
  setTimeout(() => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, 100);

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 16px;">
      <h2 style="font-size: 1.5rem; font-weight: 800; color: #ffffff;">FINAL LEADERBOARD</h2>
      <p style="color: var(--text-sub); font-size: 0.85rem; margin-top: 4px;">10라운드 대전 결과</p>
    </div>

    <!-- 시상대 단상 (텍스트 및 배치가 안 깨지도록 교정) -->
    <div class="podium-container">
      <!-- 2등 -->
      ${second ? `
        <div class="podium-slot rank-2">
          <div class="podium-user-name">${second.nickname}</div>
          <div class="podium-user-score">${second.score}점</div>
          <div class="podium-box">2</div>
        </div>
      ` : ''}

      <!-- 1등 -->
      <div class="podium-slot rank-1">
        <div style="font-size: 0.75rem; font-weight: 900; color: var(--btn-gold); margin-bottom: 2px;">CHAMPION</div>
        <div class="podium-user-name" style="font-size: 1.1rem; color: #ffffff;">${first.nickname}</div>
        <div class="podium-user-score" style="color: var(--btn-gold); font-weight: 800;">${first.score}점</div>
        <div class="podium-box">1</div>
      </div>

      <!-- 3등 -->
      ${third ? `
        <div class="podium-slot rank-3">
          <div class="podium-user-name">${third.nickname}</div>
          <div class="podium-user-score">${third.score}점</div>
          <div class="podium-box">3</div>
        </div>
      ` : ''}
    </div>

    <!-- 전체 종합 순위표 -->
    <div class="clean-card" style="flex: 1; margin-bottom: 20px; display: flex; flex-direction: column;">
      <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-sub); margin-bottom: 12px;">
        종합 대전 순위표
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px; overflow-y: auto;">
        ${sortedPlayers.map((p, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-weight: 900; font-size: 1rem; width: 32px; color: ${idx === 0 ? 'var(--btn-gold)' : 'var(--text-main)'}">
                ${idx + 1}위
              </span>
              <span style="font-weight: 800; font-size: 0.95rem; color: #ffffff;">${p.nickname}</span>
            </div>
            <div style="font-weight: 900; font-size: 1.05rem; color: var(--border-focus);">
              ${p.score} 점
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <button id="return-lobby-btn" class="clean-btn btn-primary" style="width: 100%;">
      로비로 돌아가기
    </button>
  `;

  setTimeout(() => {
    container.querySelector('#return-lobby-btn').addEventListener('click', () => {
      onReturnToLobby();
    });
  }, 0);

  return container;
}
