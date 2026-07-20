/**
 * BroadcastChannel 멀티탭 통신 및 탭 고유 세션 ID 관리자
 */

const CHANNEL_NAME = "TRIVIA_BATTLE_BROADCAST_V3";
let channel = null;
const eventListeners = new Set();

// [결함 ④ 해결]: 탭 복제/새 탭 생성 시 동일 플레이어 ID 충돌을 방지하는 탭 고유 UUID 생성
if (!window.name || !window.name.startsWith("tab_session_")) {
  window.name = "tab_session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
}
const myPlayerId = "user_" + window.name;

export function initBroadcast(onMessageCallback) {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event && event.data) {
        eventListeners.forEach((cb) => cb(event.data));
      }
    };
  }

  if (onMessageCallback) {
    eventListeners.add(onMessageCallback);
  }

  return () => {
    if (onMessageCallback) {
      eventListeners.delete(onMessageCallback);
    }
  };
}

export function broadcastMessage(type, payload = {}) {
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  channel.postMessage({
    type,
    payload,
    senderId: getMyPlayerId(),
    timestamp: Date.now()
  });
}

export function getMyPlayerId() {
  return myPlayerId;
}
