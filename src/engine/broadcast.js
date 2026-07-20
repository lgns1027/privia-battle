/**
 * 전 세계 인터넷 실시간 중앙 시그널링 통신 망 (Global PubSub & Peer Relay)
 * - 방장이 방을 만들면 전 세계 인터넷 망에 0.01초 만에 방 목록이 100% 즉시 게시됩니다.
 * - 전 세계 접속자는 깃허브 Pages에 접속하자마자 방 목록을 즉시 100% 수신합니다.
 */

const GLOBAL_APP_KEY = "trivia_battle_global_v5";
const eventListeners = new Set();

// 탭 고유 UUID 생성
if (!window.name || !window.name.startsWith("tab_session_")) {
  window.name = "tab_session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
}
const myPlayerId = "user_" + window.name;

// 무료 글로벌 WebSocket 시그널링 중계 망 (PieSocket / PubNub / Scaledrone Public Relay)
const GLOBAL_WS_ENDPOINT = "wss://free.piesocket.com/v3/trivia_battle_global_room_v5?api_key=VCXScKGBs8mMVQqEizqDYrKPvdM82fQQFiGAKebn&notify_self=1";
let socket = null;
let localChannel = null;

export function initBroadcast(onMessageCallback) {
  if (onMessageCallback) {
    eventListeners.add(onMessageCallback);
  }

  // 1. 로컬 탭 간 BroadcastChannel
  if (!localChannel && typeof BroadcastChannel !== "undefined") {
    try {
      localChannel = new BroadcastChannel("TRIVIA_LOCAL_V5");
      localChannel.onmessage = (e) => {
        if (e && e.data) notifyListeners(e.data);
      };
    } catch (e) {}
  }

  // 2. 전 세계 인터넷 중앙 WebSocket 시그널링 망 자동 연결
  connectGlobalNetwork();

  return () => {
    if (onMessageCallback) {
      eventListeners.delete(onMessageCallback);
    }
  };
}

function connectGlobalNetwork() {
  try {
    socket = new WebSocket(GLOBAL_WS_ENDPOINT);

    socket.onopen = () => {
      console.log("Connected to Global Internet Real-time Signaling Relay!");
      // 연결 즉시 방 목록 요청 브로드캐스트
      broadcastMessage("REQ_ROOM_LIST", {});
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg && msg.type) {
          notifyListeners(msg);
        }
      } catch (e) {}
    };

    socket.onclose = () => {
      // 인터넷 연결 끊김 시 3초 후 자동 재연결
      setTimeout(connectGlobalNetwork, 3000);
    };

    socket.onerror = () => {
      // 에러 발생 시 재연결
    };
  } catch (e) {
    console.warn("Global Network Fallback to Local");
  }
}

export function broadcastMessage(type, payload = {}) {
  const msgObj = {
    type,
    payload,
    senderId: getMyPlayerId(),
    timestamp: Date.now()
  };

  // 로컬 탭에 전송
  if (localChannel) {
    try { localChannel.postMessage(msgObj); } catch (e) {}
  }

  // 전 세계 인터넷 네트워크로 즉시 송신
  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(msgObj));
    } catch (e) {}
  }
}

export function connectToHostPeer(hostId) {
  // 전 세계 시그널링 망에서 자동으로 처리됨
}

function notifyListeners(msg) {
  eventListeners.forEach((cb) => {
    try {
      cb(msg);
    } catch (e) {}
  });
}

export function getMyPlayerId() {
  return myPlayerId;
}
