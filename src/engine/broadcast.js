/**
 * 전 세계 인터넷 실시간 P2P 시그널링 통신 망 (Authoritative Signaling Relay Engine)
 * - 자동 핑/퐁 핑키핑 메커니즘으로 소켓 끊김 자동 복구 및 즉시 재연결
 * - Authoritative Host (방장 마스터 통제) 메시지 브로드캐스트 지원
 */

const eventListeners = new Set();

if (!window.name || !window.name.startsWith("tab_session_")) {
  window.name = "tab_session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
}
const myPlayerId = "user_" + window.name;

const GLOBAL_WS_ENDPOINT = "wss://free.piesocket.com/v3/trivia_battle_authoritative_v6?api_key=VCXScKGBs8mMVQqEizqDYrKPvdM82fQQFiGAKebn&notify_self=1";

let socket = null;
let localChannel = null;
let heartbeatInterval = null;

export function initBroadcast(onMessageCallback) {
  if (onMessageCallback) {
    eventListeners.add(onMessageCallback);
  }

  // 1. 로컬 탭 간 BroadcastChannel
  if (!localChannel && typeof BroadcastChannel !== "undefined") {
    try {
      localChannel = new BroadcastChannel("TRIVIA_LOCAL_V6");
      localChannel.onmessage = (e) => {
        if (e && e.data) notifyListeners(e.data);
      };
    } catch (e) {}
  }

  // 2. 글로벌 네트워크 자동 연결
  connectGlobalNetwork();

  return () => {
    if (onMessageCallback) {
      eventListeners.delete(onMessageCallback);
    }
  };
}

function connectGlobalNetwork() {
  try {
    if (socket) {
      socket.close();
    }
    socket = new WebSocket(GLOBAL_WS_ENDPOINT);

    socket.onopen = () => {
      console.log("⚡ Authoritative Network Connected!");
      // 5초 간격 하트비트 핑 송신 (소켓 단질 방지)
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "PING", senderId: getMyPlayerId() }));
        }
      }, 5000);

      // 방 목록 수신 요청 브로드캐스트
      broadcastMessage("REQ_ROOM_LIST", {});
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg && msg.type && msg.type !== "PING") {
          notifyListeners(msg);
        }
      } catch (e) {}
    };

    socket.onclose = () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      setTimeout(connectGlobalNetwork, 2000);
    };

    socket.onerror = () => {
      // 오류 시 재연결
    };
  } catch (e) {
    console.warn("Global Network Error, retrying...");
  }
}

export function broadcastMessage(type, payload = {}) {
  const msgObj = {
    type,
    payload,
    senderId: getMyPlayerId(),
    timestamp: Date.now()
  };

  if (localChannel) {
    try { localChannel.postMessage(msgObj); } catch (e) {}
  }

  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(msgObj));
    } catch (e) {}
  }
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
