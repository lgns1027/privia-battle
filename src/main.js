import './style.css';
import { initBroadcast, broadcastMessage, getMyPlayerId } from './engine/broadcast.js';
import { 
  getRooms, 
  setMemoryRooms, 
  updateSingleMemoryRoom, 
  createRoom, 
  joinRoom, 
  toggleReady, 
  leaveRoom, 
  resetRoomScores 
} from './engine/roomManager.js';
import { generateQuizSet, evaluateAnswer } from './engine/quizEngine.js';

import { renderLobbyView } from './components/LobbyView.js';
import { renderWaitingRoomView } from './components/WaitingRoomView.js';
import { renderQuizArenaView } from './components/QuizArenaView.js';
import { renderResultView } from './components/ResultView.js';

// --- State Management ---
let currentView = 'LOBBY'; 
let myProfile = JSON.parse(sessionStorage.getItem('trivia_profile') || 'null');

let currentRoomId = null;
let currentRoom = null;

// Quiz State
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

function isHost() {
  return currentRoom && currentRoom.hostId === getMyPlayerId();
}

function render() {
  const roomsList = getRooms();
  if (currentRoomId) {
    const found = roomsList.find(r => r.id === currentRoomId);
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
        if (!isHost()) return;
        resetRoomScores(currentRoom);

        const quizSet = generateQuizSet(currentRoom.category);
        const masterStartTime = Date.now();

        currentRoom.currentQuizSet = quizSet;
        currentRoom.currentQuestionIndex = 0;
        currentRoom.status = 'playing';
        currentRoom.roundStartTime = masterStartTime;
        currentRoom.roundSubmissions = {};
        
        updateSingleMemoryRoom(currentRoom);

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
    if (currentRoom) {
      currentView = (currentRoom.status === 'playing') ? 'QUIZ_ARENA' : 'WAITING_ROOM';
      render();
    } else {
      currentView = 'LOBBY';
      render();
    }
  }
}

function startQuizRound(qIndex, masterStartTime) {
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
      // 시간 만료 시 방장(Host)이 라운드 마감 주도
      if (isHost()) {
        hostFinishCurrentQuestionRound();
      }
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

  const submissionPayload = {
    playerId: getMyPlayerId(),
    nickname: myProfile.nickname,
    avatar: myProfile.avatar,
    answer: answerText,
    isCorrect: evalResult.isCorrect,
    score: evalResult.score,
    timeTaken
  };

  // 내 인메모리에 제출 저장
  if (currentRoom) {
    if (!currentRoom.roundSubmissions) currentRoom.roundSubmissions = {};
    if (!currentRoom.roundSubmissions[currentQuestionIndex]) {
      currentRoom.roundSubmissions[currentQuestionIndex] = {};
    }
    currentRoom.roundSubmissions[currentQuestionIndex][getMyPlayerId()] = submissionPayload;
    updateSingleMemoryRoom(currentRoom);
  }

  // 제출 패킷을 전 세계 네트워크로 전송
  broadcastMessage("SUBMITTED_ANSWER", { 
    roomId: currentRoom.id, 
    qIndex: currentQuestionIndex,
    submission: submissionPayload
  });

  // 방장일 경우 제출 상태 자동 검사 및 라운드 마감 트리거
  if (isHost()) {
    checkHostRoundCompletion();
  }

  render();
}

function checkHostRoundCompletion() {
  if (!isHost() || !currentRoom) return;

  const roundSubs = (currentRoom.roundSubmissions && currentRoom.roundSubmissions[currentQuestionIndex]) || {};
  const subCount = Object.keys(roundSubs).length;

  // 모든 인원이 제출 완료한 경우 방장이 즉시 라운드 마감 계산 후 전 세계 브로드캐스트
  if (subCount >= currentRoom.players.length) {
    if (quizTimer) {
      clearInterval(quizTimer);
      quizTimer = null;
    }
    hostFinishCurrentQuestionRound();
  }
}

// 방장(Authoritative Host) 전용 라운드 마감 및 점수 계산 로직
function hostFinishCurrentQuestionRound() {
  if (!isHost() || !currentRoom) return;

  const currentQuiz = currentRoom.currentQuizSet[currentQuestionIndex];
  const roundSubs = (currentRoom.roundSubmissions && currentRoom.roundSubmissions[currentQuestionIndex]) || {};

  const playerResults = currentRoom.players.map(p => {
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

  updateSingleMemoryRoom(currentRoom);

  const resultPayload = {
    questionIndex: currentQuestionIndex,
    correctAnswerText: currentQuiz.answers[0],
    players: playerResults,
    updatedRoom: currentRoom
  };

  // 방장이 라운드 결과 패킷을 전 세계 참가자에게 동시 분사
  broadcastMessage("ROUND_RESULT_BROADCAST", {
    roomId: currentRoom.id,
    result: resultPayload
  });

  processRoundResult(resultPayload);
}

function processRoundResult(resultPayload) {
  if (quizTimer) {
    clearInterval(quizTimer);
    quizTimer = null;
  }

  roundResultOverlay = {
    questionIndex: resultPayload.questionIndex,
    correctAnswerText: resultPayload.correctAnswerText,
    players: resultPayload.players
  };

  if (resultPayload.updatedRoom) {
    currentRoom = resultPayload.updatedRoom;
    updateSingleMemoryRoom(currentRoom);
  }

  render();

  if (roundTimeoutTimer) clearTimeout(roundTimeoutTimer);

  // 3.5초 결과 확인 후 방장의 지시에 따라 다음 라운드로 이동
  roundTimeoutTimer = setTimeout(() => {
    roundResultOverlay = null;
    if (isHost()) {
      if (currentQuestionIndex + 1 < currentRoom.currentQuizSet.length) {
        const nextStartTime = Date.now();
        currentRoom.roundStartTime = nextStartTime;
        updateSingleMemoryRoom(currentRoom);

        broadcastMessage("NEXT_ROUND_START", { 
          roomId: currentRoom.id, 
          qIndex: currentQuestionIndex + 1, 
          startTime: nextStartTime 
        });
        startQuizRound(currentQuestionIndex + 1, nextStartTime);
      } else {
        broadcastMessage("GAME_OVER_BROADCAST", { roomId: currentRoom.id });
        currentView = 'RESULT';
        render();
      }
    }
  }, 3500);
}

// 인터넷 전역 망 브로드캐스트 핸들러 (Authoritative Host Event Listener)
function handleBroadcastMessage(msg) {
  if (msg.type === "REQ_ROOM_LIST") {
    const activeRooms = getRooms();
    if (activeRooms && activeRooms.length > 0) {
      broadcastMessage("ROOM_LIST_UPDATE", { rooms: activeRooms });
    }
  }
  else if (msg.type === "ROOM_LIST_UPDATE") {
    const receivedRooms = msg.payload.rooms || [];
    setMemoryRooms(receivedRooms);
    if (currentView === 'LOBBY') render();
  } 
  else if (msg.type === "ROOM_STATE_UPDATE") {
    if (msg.payload.room) {
      updateSingleMemoryRoom(msg.payload.room);
      if (currentRoomId && msg.payload.room.id === currentRoomId) {
        currentRoom = msg.payload.room;
        if (currentView === 'WAITING_ROOM') render();
      }
    }
  }
  else if (msg.type === "GAME_STARTED") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      if (msg.payload.room) {
        currentRoom = msg.payload.room;
        updateSingleMemoryRoom(currentRoom);
      }
      if (msg.payload.quizSet) {
        currentRoom.currentQuizSet = msg.payload.quizSet;
      }
      currentRoom.roundStartTime = msg.payload.startTime || Date.now();
      
      startQuizRound(0, currentRoom.roundStartTime);
    }
  }
  else if (msg.type === "SUBMITTED_ANSWER") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      if (currentRoom && msg.payload.submission) {
        if (!currentRoom.roundSubmissions) currentRoom.roundSubmissions = {};
        if (!currentRoom.roundSubmissions[msg.payload.qIndex]) {
          currentRoom.roundSubmissions[msg.payload.qIndex] = {};
        }
        currentRoom.roundSubmissions[msg.payload.qIndex][msg.payload.submission.playerId] = msg.payload.submission;
        updateSingleMemoryRoom(currentRoom);
      }

      // 핵심 교정: 방장(Host)이 타 유저의 제출 패킷을 수신했을 때 라운드 마감 조건 즉시 검사!
      if (isHost()) {
        checkHostRoundCompletion();
      }

      if (currentView === 'QUIZ_ARENA') render();
    }
  }
  else if (msg.type === "ROUND_RESULT_BROADCAST") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      // 방장이 전송한 최신 라운드 결과 패킷 수신 및 결과 화면 즉시 동기화
      processRoundResult(msg.payload.result);
    }
  }
  else if (msg.type === "NEXT_ROUND_START") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      if (!isHost()) {
        startQuizRound(msg.payload.qIndex, msg.payload.startTime);
      }
    }
  }
  else if (msg.type === "GAME_OVER_BROADCAST") {
    if (currentRoomId && msg.payload.roomId === currentRoomId) {
      currentView = 'RESULT';
      render();
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
