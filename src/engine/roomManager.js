import { broadcastMessage, getMyPlayerId } from './broadcast.js';

/**
 * 100% Pure In-Memory Global Room Store (Zero LocalStorage)
 * - 브라우저의 LocalStorage를 완전히 제거하고 pure JS in-memory state로 전환합니다.
 * - 방 목록과 상태는 전 세계 WebSocket 네트워크 패킷을 통해서만 실시간 공유됩니다.
 */

// 메모리 전역 방 객체 (Key: roomId, Value: RoomObject)
const inMemoryRooms = new Map();

export function getRooms() {
  return Array.from(inMemoryRooms.values()).filter(r => r && Array.isArray(r.players) && r.players.length > 0);
}

export function setMemoryRooms(roomsArray) {
  inMemoryRooms.clear();
  if (Array.isArray(roomsArray)) {
    roomsArray.forEach(r => {
      if (r && r.id && Array.isArray(r.players) && r.players.length > 0) {
        inMemoryRooms.set(r.id, r);
      }
    });
  }
}

export function updateSingleMemoryRoom(room) {
  if (room && room.id) {
    if (!room.players || room.players.length === 0) {
      inMemoryRooms.delete(room.id);
    } else {
      inMemoryRooms.set(room.id, room);
    }
  }
}

export function resetRoomScores(room) {
  if (!room || !Array.isArray(room.players)) return;
  
  room.players.forEach(p => {
    p.score = 0;
    p.totalResponseTime = 0;
  });
  room.roundSubmissions = {};
  room.currentQuestionIndex = 0;
}

export function createRoom({ title, category, maxPlayers, hostNickname, hostAvatar }) {
  const myId = getMyPlayerId();

  // 기존 내 방 제거
  inMemoryRooms.forEach((r, id) => {
    r.players = r.players.filter(p => p.id !== myId);
    if (r.players.length === 0) inMemoryRooms.delete(id);
  });

  const newRoom = {
    id: "room_" + Math.random().toString(36).substr(2, 7),
    title: title || `${hostNickname}님의 대전 방`,
    category: category || "all",
    maxPlayers: Number(maxPlayers) || 4,
    hostId: myId,
    status: "waiting",
    players: [
      {
        id: myId,
        nickname: hostNickname,
        avatar: hostAvatar || hostNickname.charAt(0).toUpperCase(),
        isHost: true,
        isReady: true,
        score: 0,
        totalResponseTime: 0
      }
    ],
    currentQuizSet: [],
    currentQuestionIndex: 0,
    roundStartTime: 0,
    roundSubmissions: {}
  };

  inMemoryRooms.set(newRoom.id, newRoom);
  
  // 전 세계 인터넷 WebSocket 망으로 인메모리 방 목록 즉시 브로드캐스트
  broadcastMessage("ROOM_LIST_UPDATE", { rooms: getRooms() });
  return newRoom;
}

export function joinRoom(roomId, playerInfo) {
  const room = inMemoryRooms.get(roomId);
  if (!room) return null;

  const existingPlayer = room.players.find(p => p.id === playerInfo.id);
  if (!existingPlayer) {
    if (room.players.length >= room.maxPlayers) {
      alert("방 인원이 가득 찼습니다.");
      return null;
    }
    room.players.push({
      id: playerInfo.id,
      nickname: playerInfo.nickname,
      avatar: playerInfo.avatar || playerInfo.nickname.charAt(0).toUpperCase(),
      isHost: false,
      isReady: false,
      score: 0,
      totalResponseTime: 0
    });
  }

  inMemoryRooms.set(room.id, room);
  broadcastMessage("ROOM_STATE_UPDATE", { room });
  broadcastMessage("ROOM_LIST_UPDATE", { rooms: getRooms() });
  return room;
}

export function toggleReady(roomId, playerId) {
  const room = inMemoryRooms.get(roomId);
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (player && !player.isHost) {
    player.isReady = !player.isReady;
    inMemoryRooms.set(room.id, room);
    broadcastMessage("ROOM_STATE_UPDATE", { room });
  }
}

export function leaveRoom(roomId, playerId) {
  const room = inMemoryRooms.get(roomId);
  if (!room) return;

  const isHostLeaving = (room.hostId === playerId);
  room.players = room.players.filter(p => p.id !== playerId);

  if (room.players.length === 0) {
    inMemoryRooms.delete(roomId);
  } else {
    if (isHostLeaving) {
      room.players[0].isHost = true;
      room.players[0].isReady = true;
      room.hostId = room.players[0].id;
      broadcastMessage("ROOM_DISBANDED", { roomId });
    }
    inMemoryRooms.set(roomId, room);
  }

  broadcastMessage("ROOM_STATE_UPDATE", { room });
  broadcastMessage("ROOM_LIST_UPDATE", { rooms: getRooms() });
}

if (typeof window !== "undefined") {
  const autoCleanup = () => {
    const myId = getMyPlayerId();
    inMemoryRooms.forEach(r => {
      if (r.players.some(p => p.id === myId)) {
        leaveRoom(r.id, myId);
      }
    });
  };

  window.addEventListener('beforeunload', autoCleanup);
  window.addEventListener('pagehide', autoCleanup);
}
