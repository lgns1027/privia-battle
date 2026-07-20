import { getMyPlayerId } from '../engine/broadcast.js';

export function renderQuizArenaView({
  room,
  currentQuiz,
  questionIndex,
  totalQuestions = 10,
  timeLeft,
  hasSubmitted,
  submittedAnswer,
  roundResultOverlay = null,
  onSubmitAnswer
}) {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.height = '100%';
  container.style.position = 'relative';

  const isGoldenQuestion = currentQuiz.score === 2 || questionIndex === 9;
  const timerPercent = (timeLeft / 15) * 100;
  const isTimerWarning = timeLeft <= 4;

  container.innerHTML = `
    <div style="padding: 20px 20px 10px 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-sub);">QUESTION SESSION</span>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: #ffffff;">
            Q.${questionIndex + 1} / ${totalQuestions}
          </h3>
        </div>

        ${isGoldenQuestion ? `
          <span class="badge-chip badge-host" style="font-size: 0.85rem; padding: 6px 12px; font-weight: 800;">
            골든벨 2점 역전
          </span>
        ` : `
          <span class="badge-chip" style="background: rgba(255,255,255,0.08); color: var(--text-sub); font-size: 0.85rem; padding: 6px 12px;">
            일반 1점
          </span>
        `}
      </div>

      <!-- 타이머 프로그레스 바 -->
      <div class="timer-bar-wrapper">
        <div id="dynamic-timer-bar" class="timer-bar-fill ${isTimerWarning ? 'warning' : ''}" style="width: ${timerPercent}%;"></div>
      </div>
      
      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: -6px; margin-bottom: 14px;">
        <span>남은 시간</span>
        <span id="dynamic-timer-text" style="font-weight: 800; color: ${isTimerWarning ? 'var(--color-error)' : 'var(--border-focus)'};">${timeLeft}초</span>
      </div>
    </div>

    <!-- 퀴즈 문제 카드 -->
    <div style="padding: 0 20px;">
      <div class="quiz-question-box">
        ${currentQuiz.question}
      </div>

      <!-- 참가자 실시간 제출 상태 -->
      <div class="clean-card" style="padding: 12px 16px; margin-bottom: 16px;">
        <div style="font-size: 0.8rem; color: var(--text-sub); font-weight: 700; margin-bottom: 8px;">참가자 제출 상태</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${room.players.map(p => {
            const sub = room.roundSubmissions && room.roundSubmissions[questionIndex] 
              ? room.roundSubmissions[questionIndex][p.id] 
              : null;
            const submitted = !!sub;
            return `
              <div style="display: flex; align-items: center; gap: 6px; background: var(--input-bg); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; border: 1px solid var(--border-color);">
                <span style="font-weight: 800; color: #ffffff;">${p.nickname}</span>
                <span class="status-chip ${submitted ? 'success' : ''}" style="font-size: 0.7rem;">
                  ${submitted ? '제출완료' : '작성중'}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- 하단 고정 답안 입력바 -->
    <div class="bottom-input-bar">
      <form id="quiz-answer-form" style="display: flex; gap: 8px; width: 100%;">
        <input 
          type="text" 
          id="user-answer-input" 
          class="clean-input" 
          placeholder="${hasSubmitted ? '답안 제출 완료' : '주관식 정답 입력 후 엔터'}"
          value="${submittedAnswer || ''}"
          ${hasSubmitted || timeLeft <= 0 ? 'disabled' : ''}
          style="flex: 1;"
        />
        <button 
          type="submit" 
          class="clean-btn ${isGoldenQuestion ? 'btn-gold' : 'btn-primary'}" 
          style="width: 90px; height: 50px;"
          ${hasSubmitted || timeLeft <= 0 ? 'disabled' : ''}
        >
          ${hasSubmitted ? '완료' : '제출'}
        </button>
      </form>
    </div>
  `;

  // 폼 제출 연결
  setTimeout(() => {
    const form = container.querySelector('#quiz-answer-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = container.querySelector('#user-answer-input');
        const answerText = input.value.trim();
        if (!answerText) {
          alert('답안을 입력해 주세요.');
          return;
        }
        onSubmitAnswer(answerText);
      });
    }
  }, 0);

  // 결과 오버레이 팝업
  if (roundResultOverlay) {
    const modal = document.createElement('div');
    modal.className = 'overlay-backdrop';
    
    const correctPlayers = roundResultOverlay.players.filter(p => p.isCorrect);
    const wrongPlayers = roundResultOverlay.players.filter(p => !p.isCorrect);

    modal.innerHTML = `
      <div class="overlay-card">
        <div style="font-size: 0.8rem; color: var(--text-sub); text-align: center;">Q.${questionIndex + 1} 라운드 결과</div>
        <h3 style="font-size: 1.3rem; text-align: center; margin-top: 2px; font-weight: 800; color: #ffffff;">정답 공개</h3>
        
        <div style="background: rgba(37, 99, 235, 0.15); border: 1px solid var(--border-focus); color: var(--border-focus); padding: 12px; border-radius: 12px; font-weight: 800; text-align: center; margin: 12px 0 20px 0;">
          정답: <span style="font-size: 1.25rem;">${roundResultOverlay.correctAnswerText}</span>
        </div>

        <!-- 정답자 -->
        <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-success); margin-bottom: 8px;">
          정답자 (${correctPlayers.length}명)
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px;">
          ${correctPlayers.length === 0 ? `
            <div style="font-size: 0.8rem; color: var(--text-muted);">정답자가 없습니다.</div>
          ` : correctPlayers.map(p => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
              <span style="font-weight: 800; font-size: 0.9rem; color: #ffffff;">${p.nickname}</span>
              <span class="status-chip success">+${p.earnedScore}점 (누적 ${p.score}점)</span>
            </div>
          `).join('')}
        </div>

        <!-- 오답자 -->
        <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-error); margin-bottom: 8px;">
          오답 / 미제출 (${wrongPlayers.length}명)
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${wrongPlayers.length === 0 ? `
            <div style="font-size: 0.8rem; color: var(--text-muted);">오답자가 없습니다.</div>
          ` : wrongPlayers.map(p => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--input-bg); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
              <div>
                <span style="font-weight: 800; font-size: 0.9rem; color: #ffffff;">${p.nickname}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 6px;">"${p.userAnswer || '미제출'}"</span>
              </div>
              <span class="status-chip error">+0점</span>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; font-size: 0.8rem; color: var(--text-muted); margin-top: 20px;">
          잠시 후 다음 문제로 자동 이동합니다...
        </div>
      </div>
    `;

    container.appendChild(modal);
  }

  return container;
}
