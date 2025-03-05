import { Connection, MyServer, MyServerEventEnum } from "./Core"
import PlayerManager from "./biz/PlayerManager"
import RoomManager from "./biz/RoomManager"
import { copyCommon, getTime, symlinkCommon } from "./utils"
import {
  ApiMsgEnum,
  IApiGameEndReq,
  IApiGameEndRes,
  IApiGameStartReq,
  IApiGameStartRes,
  IApiPlayerJoinReq,
  IApiPlayerJoinRes,
  IApiPlayerListReq,
  IApiPlayerListRes,
  IApiRoomCreateReq,
  IApiRoomCreateRes,
  IApiRoomJoinReq,
  IApiRoomJoinRes,
  IApiRoomLeaveReq,
  IApiRoomLeaveRes,
  IApiRoomListReq,
  IApiRoomListRes,
  IModel,
} from "./Common"
import PokerManager from "./biz/PokerManager"

declare module "./Core" {
  interface Connection {
    playerId?: number
  }
}

const server = new MyServer({ port: 5555 })

// event
server.on(MyServerEventEnum.Connect, (connection: Connection) => {
  console.log(`${getTime()}来人|人数|${server.connections.size}`)
})

server.on(MyServerEventEnum.DisConnect, (connection: Connection) => {
  console.log(`${getTime()}走人|人数|${server.connections.size}`)
  if (connection.playerId) {
    PlayerManager.Instance.removePlayer(connection.playerId)
  }
})

// api
server.setApi(ApiMsgEnum.ApiPlayerList, (connection: Connection, data: IApiPlayerListReq): IApiPlayerListRes => {
  return { list: PlayerManager.Instance.getPlayersView() }
})

server.setApi(ApiMsgEnum.ApiPlayerJoin, (connection: Connection, { nickname }: IApiPlayerJoinReq): IApiPlayerJoinRes => {
  const player = PlayerManager.Instance.createPlayer({ connection, nickname })
  PlayerManager.Instance.syncPlayers()
  return {
    player: PlayerManager.Instance.getPlayerView(player),
  }
})

server.setApi(ApiMsgEnum.ApiRoomList, (connection: Connection, data: IApiRoomListReq): IApiRoomListRes => {
  return { list: RoomManager.Instance.getRoomsView() }
})

server.setApi(ApiMsgEnum.ApiRoomCreate, (connection: Connection, data: IApiRoomCreateReq): IApiRoomCreateRes => {
  if (connection.playerId) {
    const room = RoomManager.Instance.joinRoom(RoomManager.Instance.createRoom().id, connection.playerId)
    if (room) {
      RoomManager.Instance.syncRooms()
      PlayerManager.Instance.syncPlayers()
      return {
        room: RoomManager.Instance.getRoomView(room),
      }
    } else {
      throw new Error("ApiRoomCreate room不存在")
    }
  } else {
    throw new Error("ApiRoomCreate 玩家未登录")
  }
})

server.setApi(ApiMsgEnum.ApiRoomJoin, (connection: Connection, data: IApiRoomJoinReq): IApiRoomJoinRes => {
  if (connection.playerId) {
    const room = RoomManager.Instance.joinRoom(data.rid, connection.playerId)
    if (room) {
      RoomManager.Instance.syncRooms()
      PlayerManager.Instance.syncPlayers()
      RoomManager.Instance.syncRoom(room.id)
      return {
        room: RoomManager.Instance.getRoomView(room),
      }
    } else {
      throw new Error("ApiRoomJoin room不存在")
    }
  } else {
    throw new Error("ApiRoomJoin 玩家未登录")
  }
})

server.setApi(ApiMsgEnum.ApiRoomLeave, (connection: Connection, data: IApiRoomLeaveReq): IApiRoomLeaveRes => {
  if (connection.playerId) {
    const player = PlayerManager.Instance.getPlayerById(connection.playerId)
    if (player) {
      const rid = player.rid
      if (rid) {
        RoomManager.Instance.leaveRoom(rid, player.id)
        PlayerManager.Instance.syncPlayers()
        RoomManager.Instance.syncRooms()
        RoomManager.Instance.syncRoom(rid)
        return {}
      } else {
        throw new Error("ApiRoomLeave 玩家不在房间")
      }
    } else {
      throw new Error("ApiRoomLeave 玩家不存在")
    }
  } else {
    throw new Error("ApiRoomLeave 玩家未登录")
  }
})

server.setApi(ApiMsgEnum.ApiGameStart, (connection: Connection, data: IApiGameStartReq): IApiGameStartRes => {
  if (connection.playerId) {
    const player = PlayerManager.Instance.getPlayerById(connection.playerId)
    if (player) {
      const rid = player.rid
      if (rid) {
        RoomManager.Instance.startRoom(rid)
        PlayerManager.Instance.syncPlayers()
        RoomManager.Instance.syncRooms()
        return { pokersNext: PokerManager.instance.pokers }
      } else {
        throw new Error("ApiRoomLeave 玩家不在房间")
      }
    } else {
      throw new Error("ApiRoomLeave 玩家不存在")
    }
  } else {
    throw new Error("ApiRoomLeave 玩家未登录")
  }
})

server.setApi(ApiMsgEnum.ApiGameEnd, (connection: Connection, data: IApiGameEndReq): IApiGameEndRes => {
  if (connection.playerId) {
    const player = PlayerManager.Instance.getPlayerById(connection.playerId)
    if (player) {
      const rid = player.rid
      if (rid) {
        RoomManager.Instance.closeRoom(rid)
        PlayerManager.Instance.syncPlayers()
        RoomManager.Instance.syncRooms()
        return {}
      } else {
        throw new Error("ApiGameEnd 玩家不在房间")
      }
    } else {
      throw new Error("ApiGameEnd 玩家不存在")
    }
  } else {
    throw new Error("ApiGameEnd 玩家未登录")
  }
})

// start!!
server
  .start()
  .then(() => {
    symlinkCommon()
    // copyCommon()
    console.log("服务启动！")
  })
  .catch((e) => {
    console.log("服务异常", e)
  })
