import { broadcastMessage, getMyPlayerId } from './broadcast.js';

const ROOMS_KEY = "TRIVIA_BATTLE_ROOMS_STORE_V5";

export function getRooms() {
  try {
    const data = localStorage.getItem(ROOMS_KEY);
    if (!data) return [];
    const rooms = JSON.parse(data);
    
    const validRooms = rooms.filter(r => r && Array.isArray(r.players) && r.players.length > 0);
    if (validRooms.length !== rooms.length) {
      saveRooms(validRooms);
    }
    return validRooms;
  } catch (e) {
    return [];
  }
}

export function saveRooms(rooms) {
  try {
    const cleanRooms = rooms.filter(r => r && Array.isArray(r.players) && r.players.length > 0);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(cleanRooms));
  } catch (e) {
    console.error("Failed to save rooms", e);
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
  const rooms = getRooms();
  const myId = getMyPlayerId();

  rooms.forEach(r => {
    r.players = r.players.filter(p => p.id !== myId);
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

  const updatedRooms = [...rooms.filter(r => r.players.length > 0), newRoom];
  saveRooms(updatedRooms);
  
  // 전 세계 인터넷망으로 즉시 브로드캐스트 전송
  broadcastMessage("ROOM_LIST_UPDATE", { rooms: updatedRooms });
  return newRoom;
}

export function joinRoom(roomId, playerInfo) {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) return null;

  const room = rooms[roomIndex];

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

  saveRooms(rooms);
  broadcastMessage("ROOM_STATE_UPDATE", { room });
  broadcastMessage("ROOM_LIST_UPDATE", { rooms });
  return room;
}

export function updateRoomCategory(roomId, category) {
  const rooms = getRooms();
  const room = rooms.find(r => r.id === roomId);
  if (!room) return;

  room.category = category;
  saveRooms(rooms);
  broadcastMessage("ROOM_STATE_UPDATE", { room });
  broadcastMessage("ROOM_LIST_UPDATE", { rooms });
}

export function toggleReady(roomId, playerId) {
  const rooms = getRooms();
  const room = rooms.find(r => r.id === roomId);
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (player && !player.isHost) {
    player.isReady = !player.isReady;
    saveRooms(rooms);
    broadcastMessage("ROOM_STATE_UPDATE", { room });
  }
}

export function leaveRoom(roomId, playerId) {
  const rooms = getRooms();
  const roomIndex = rooms.findIndex(r => r.id === roomId);
  if (roomIndex === -1) return;

  const room = rooms[roomIndex];
  const isHostLeaving = (room.hostId === playerId);
  
  room.players = room.players.filter(p => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.splice(roomIndex, 1);
  } else {
    if (isHostLeaving) {
      room.players[0].isHost = true;
      room.players[0].isReady = true;
      room.hostId = room.players[0].id;
      broadcastMessage("ROOM_DISBANDED", { roomId });
    }
  }

  saveRooms(rooms);
  broadcastMessage("ROOM_STATE_UPDATE", { room });
  broadcastMessage("ROOM_LIST_UPDATE", { rooms });
}

if (typeof window !== "undefined") {
  const autoCleanup = () => {
    const myId = getMyPlayerId();
    const rooms = getRooms();
    rooms.forEach(r => {
      if (r.players.some(p => p.id === myId)) {
        leaveRoom(r.id, myId);
      }
    });
  };

  window.addEventListener('beforeunload', autoCleanup);
  window.addEventListener('pagehide', autoCleanup);
}
