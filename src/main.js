import './style.css';
import { initBroadcast, broadcastMessage, getMyPlayerId } from './engine/broadcast.js';
import { getRooms, saveRooms, createRoom, joinRoom, toggleReady, leaveRoom, resetRoomScores } from './engine/roomManager.js';
import { generateQuizSet, evaluateAnswer } from './engine/quizEngine.js';

import { renderLobbyView } from './components/LobbyView.js';
import { renderWaitingRoomView } from './components/WaitingRoomView.js';
import { renderQuizArenaView } from './components/QuizArenaView.js';
import { renderResultView } from './components/ResultView.js';

// --- State Management ---
let currentView = 'LOBBY'; 
let myProfile = JSON.parse(sessionStorage.getItem('trivia_profile') || 'null');

let currentRoomId = null;
let roomsList = getRooms();
let currentRoom = null;

// Quiz State (원자적 이중 실행 방지용 타이머 참조)
let quizTimer = null;
let roundTimeoutTimer = null;
let timeLeft = 15;
let currentQuestionIndex = 0;
let hasSubmittedCurrentQuestion = false;
let submittedAnswerText = "";
let roundResultOverlay = null;

const appEl = document.getElementById('app');

function init() {
  initBroadcast((msg) => {
    handleBroadcastMessage(msg);
  });
  render();
}

function render() {
  if (currentRoomId) {
    const freshRooms = getRooms();
    const found = freshRooms.find(r => r.id === currentRoomId);
    if (found) {
      currentRoom = found;
    }
  }

  appEl.innerHTML = '';

  if (currentView === 'LOBBY' || !myProfile || !myProfile.nickname) {
    const view = renderLobbyView({
      rooms: roomsList,
      player: myProfile,
      onSaveProfile: (profile) => {
        myProfile = profile;
        sessionStorage.setItem('trivia_profile', JSON.stringify(profile));
        render();
      },
      onCreateRoom: ({ title, category, maxPlayers }) => {
        const newRoom = createRoom({
          title,
          category,
          maxPlayers,
          hostNickname: myProfile.nickname,
          hostAvatar: myProfile.avatar
        });
        currentRoomId = newRoom.id;
        currentRoom = newRoom;
        currentView = 'WAITING_ROOM';
        render();
      },
      onJoinRoom: (roomId) => {
        const joined = joinRoom(roomId, {
          id: getMyPlayerId(),
          nickname: myProfile.nickname,
          avatar: myProfile.avatar
        });
        if (joined) {
          currentRoomId = roomId;
          currentRoom = joined;
          currentView = 'WAITING_ROOM';
          render();
        }
      }
    });
    appEl.appendChild(view);
  } 
  else if (currentView === 'WAITING_ROOM' && currentRoom) {
    const view = renderWaitingRoomView({
      room: currentRoom,
      onToggleReady: () => {
        toggleReady(currentRoom.id, getMyPlayerId());
        render();
      },
      onStartGame: () => {
        // 게임 시작 전 0점 명시적 초기화
        resetRoomScores(currentRoom);

        const quizSet = generateQuizSet(currentRoom.category);
        const masterStartTime = Date.now();

        currentRoom.currentQuizSet = quizSet;
        currentRoom.currentQuestionIndex = 0;
        currentRoom.status = 'playing';
        currentRoom.roundStartTime = masterStartTime;
        currentRoom.roundSubmissions = {};
        
        const fresh = getRooms();
        const roomIdx = fresh.findIndex(r => r.id === currentRoom.id);
        if (roomIdx !== -1) {
          fresh[roomIdx] = currentRoom;
        } else {
          fresh.push(currentRoom);
        }
        saveRooms(fresh);

        // 메세지에 퀴즈 세트 직접 전달 (방장을 제외한 인원이 튕기는 버그 100% 원천 해결)
        broadcastMessage("GAME_STARTED", { 
          roomId: currentRoom.id, 
          room: currentRoom,
          quizSet: quizSet,
          startTime: masterStartTime
        });

        startQuizRound(0, masterStartTime);
      },
      onLeaveRoom: () => {
        leaveRoom(currentRoom.id, getMyPlayerId());
        currentRoomId = null;
        currentRoom = null;
        currentView = 'LOBBY';
        render();
      }
    });
    appEl.appendChild(view);
  }
  else if (currentView === 'QUIZ_ARENA' && currentRoom && currentRoom.currentQuizSet && currentRoom.currentQuizSet.length > 0) {
    const quizSet = currentRoom.currentQuizSet;
    const question = quizSet[currentQuestionIndex] || quizSet[0];

    const view = renderQuizArenaView({
      room: currentRoom,
      currentQuiz: question,
      questionIndex: currentQuestionIndex,
      totalQuestions: quizSet.length,
      timeLeft,
      hasSubmitted: hasSubmittedCurrentQuestion,
      submittedAnswer: submittedAnswerText,
      roundResultOverlay,
      onSubmitAnswer: (answerText) => {
        handleAnswerSubmit(answerText);
      }
    });
    appEl.appendChild(view);
  }
  else if (currentView === 'RESULT' && currentRoom) {
    const view = renderResultView({
      room: currentRoom,
      onReturnToLobby: () => {
        leaveRoom(currentRoom.id, getMyPlayerId());
        currentRoomId = null;
        currentRoom = null;
        currentView = 'LOBBY';
        render();
      }
    });
    appEl.appendChild(view);
  } else {
    // 튕김 방지 가드: 대기실/게임중 상태이면 안전하게 WAITING_ROOM 세션 유지
    if (currentRoom) {
      currentView = (currentRoom.status === 'playing') ? 'QUIZ_ARENA' : 'WAITING_ROOM';
      render();
    } else {
      currentView = 'LOBBY';
      render();
    }
  }
}

// --- 퀴즈 라운드 제어 (타이머 중복 실행 100% 원천 차단) ---
function startQuizRound(qIndex, masterStartTime) {
  // 이전 타이머와 라운드 대기 타이머를 모두 명확히 파기 (문제가 휙휙 넘어가는 현상 100% 차단)
  if (quizTimer) {
    clearInterval(quizTimer);
    quizTimer = null;
  }
  if (roundTimeoutTimer) {
    clearTimeout(roundTimeoutTimer);
    roundTimeoutTimer = null;
  }

  currentQuestionIndex = qIndex;
  hasSubmittedCurrentQuestion = false;
  submittedAnswerText = "";
  roundResultOverlay = null;

  const startTime = masterStartTime || Date.now();
  if (currentRoom) {
    currentRoom.roundStartTime = startTime;
    currentRoom.currentQuestionIndex = qIndex;
  }

  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  timeLeft = Math.max(0, 15 - elapsedSec);

  currentView = 'QUIZ_ARENA';
  render();

  quizTimer = setInterval(() => {
    const baseStart = (currentRoom && currentRoom.roundStartTime) ? currentRoom.roundStartTime : startTime;
    const nowElapsedSec = Math.floor((Date.now() - baseStart) / 1000);
    timeLeft = Math.max(0, 15 - nowElapsedSec);

    if (timeLeft <= 0) {
      clearInterval(quizTimer);
      quizTimer = null;
      timeLeft = 0;
      updateDynamicTimerUI();
      finishCurrentQuestionRound();
    } else {
      updateDynamicTimerUI();
    }
  }, 1000);
}

function updateDynamicTimerUI() {
  const timerBar = document.getElementById('dynamic-timer-bar');
  const timerText = document.getElementById('dynamic-timer-text');

  if (timerBar && timerText) {
    const timerPercent = (timeLeft / 15) * 100;
    const isTimerWarning = timeLeft <= 4;

    timerBar.style.width = `${timerPercent}%`;
    timerText.textContent = `${timeLeft}초`;

    if (isTimerWarning) {
      timerBar.classList.add('warning');
      timerText.style.color = 'var(--color-error)';
    } else {
      timerBar.classList.remove('warning');
      timerText.style.color = 'var(--border-focus)';
    }
  }
}

function handleAnswerSubmit(answerText) {
  if (hasSubmittedCurrentQuestion) return;
  hasSubmittedCurrentQuestion = true;
  submittedAnswerText = answerText;

  const timeTaken = Date.now() - (currentRoom ? currentRoom.roundStartTime : Date.now());
  const currentQuiz = currentRoom.currentQuizSet[currentQuestionIndex];
  const evalResult = evaluateAnswer(currentQuiz, answerText);

  const freshRooms = getRooms();
  const room = freshRooms.find(r => r.id === currentRoom.id);
  if (room) {
    if (!room.roundSubmissions) room.roundSubmissions = {};
    if (!room.roundSubmissions[currentQuestionIndex]) {
      room.roundSubmissions[currentQuestionIndex] = {};
    }

    room.roundSubmissions[currentQuestionIndex][getMyPlayerId()] = {
      playerId: getMyPlayerId(),
      nickname: myProfile.nickname,
      avatar: myProfile.avatar,
      answer: answerText,
      isCorrect: evalResult.isCorrect,
      score: evalResult.score,
      timeTaken
    };

    saveRooms(freshRooms);
    broadcastMessage("SUBMITTED_ANSWER", { 
      roomId: room.id, 
      qIndex: currentQuestionIndex,
      submission: room.roundSubmissions[currentQuestionIndex][getMyPlayerId()]
    });

    const subCount = Object.keys(room.roundSubmissions[currentQuestionIndex]).length;
    if (subCount >= room.players.length) {
      if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
      }
      finishCurrentQuestionRound();
    }
  }

  render();
}

function finishCurrentQuestionRound() {
  const freshRooms = getRooms();
  const room = freshRooms.find(r => r.id === currentRoom.id);
  if (!room) return;

  const currentQuiz = room.currentQuizSet[currentQuestionIndex];
  const roundSubs = (room.roundSubmissions && room.roundSubmissions[currentQuestionIndex]) || {};

  const playerResults = room.players.map(p => {
    const sub = roundSubs[p.id];
    let isCorrect = false;
    let earnedScore = 0;
    let timeTaken = 15000;
    let userAnswer = "";

    if (sub) {
      isCorrect = sub.isCorrect;
      earnedScore = sub.score;
      timeTaken = sub.timeTaken;
      userAnswer = sub.answer;
    }

    p.score += earnedScore;
    p.totalResponseTime = (p.totalResponseTime || 0) + timeTaken;

    return {
      id: p.id,
      nickname: p.nickname,
      avatar: p.avatar,
      isCorrect,
      earnedScore,
      score: p.score,
      userAnswer
    };
  });

  saveRooms(freshRooms);

  roundResultOverlay = {
    questionIndex: currentQuestionIndex,
    correctAnswerText: currentQuiz.answers[0],
    players: playerResults
  };

  render();

  // 이전 라운드 대기 타이머가 있다면 파기
  if (roundTimeoutTimer) clearTimeout(roundTimeoutTimer);

  roundTimeoutTimer = setTimeout(() => {
    roundResultOverlay = null;
    if (currentQuestionIndex + 1 < room.currentQuizSet.length) {
      const isHost = (room.hostId === getMyPlayerId());
      const nextStartTime = Date.now();

      room.roundStartTime = nextStartTime;
      saveRooms(getRooms().map(r => r.id === room.id ? room : r));

      // 오직 방장(Host)만 라운드 진행 이벤트를 주도하여 이중 이노케이션 차단
      if (isHost) {
        broadcastMessage("NEXT_ROUND_START", { roomId: room.id, qIndex: currentQuestionIndex + 1, startTime: nextStartTime });
        startQuizRound(currentQuestionIndex + 1, nextStartTime);
      }
    } else {
      currentView = 'RESULT';
      render();
    }
  }, 3500);
}

// Broadcast Message Handler - 방장 외 튕김 버그 & 이중 라운드 이동 100% 원천 차단
function handleBroadcastMessage(msg) {
  if (msg.type === "ROOM_LIST_UPDATE") {
    roomsList = msg.payload.rooms || [];
    if (currentView === 'LOBBY') render();
  } 
  else if (msg.type === "ROOM_STATE_UPDATE") {
    if (currentRoomId && msg.payload.room && msg.payload.room.id === currentRoomId) {
      currentRoom = msg.payload.room;
      if (currentView === 'WAITING_ROOM') render();
    }
  }
  else if (msg.type === "GAME_STARTED") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      if (msg.payload.room) {
        currentRoom = msg.payload.room;
      }
      if (msg.payload.quizSet) {
        currentRoom.currentQuizSet = msg.payload.quizSet;
      }
      currentRoom.roundStartTime = msg.payload.startTime || Date.now();
      
      // 방장을 포함한 모든 참가자 안전 시작
      startQuizRound(0, currentRoom.roundStartTime);
    }
  }
  else if (msg.type === "NEXT_ROUND_START") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      const isHost = (currentRoom && currentRoom.hostId === getMyPlayerId());
      // 참가자(Client)만 방장의 라운드 신호를 받아 이동 (이중 실행 100% 차단)
      if (!isHost) {
        startQuizRound(msg.payload.qIndex, msg.payload.startTime);
      }
    }
  }
  else if (msg.type === "SUBMITTED_ANSWER") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      const freshRooms = getRooms();
      currentRoom = freshRooms.find(r => r.id === currentRoomId) || currentRoom;
      if (currentView === 'QUIZ_ARENA') render();
    }
  }
  else if (msg.type === "ROOM_DISBANDED") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      alert("방장이 방을 이탈하여 로비로 이동합니다.");
      currentRoomId = null;
      currentRoom = null;
      currentView = 'LOBBY';
      render();
    }
  }
}

init();
