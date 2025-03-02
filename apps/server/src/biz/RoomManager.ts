import RectTransform, { Vector2 } from "../base/RectTransform";
import Singleton from "../base/Singleton";
import { ApiMsgEnum } from "../Common";
import PlayerManager from "./PlayerManager";
import PokerManager from "./PokerManager";
import Room from "./Room";

export default class RoomManager extends Singleton {
  static get Instance() {
    return super.GetInstance<RoomManager>();
  }

  nextRoomId = 1;
  rooms: Set<Room> = new Set();
  idMapRoom: Map<number, Room> = new Map();

  createRoom() {
    const room = new Room(this.nextRoomId++);
    this.rooms.add(room);
    this.idMapRoom.set(room.id, room);
    return room;
  }

  joinRoom(rid: number, uid: number) {
    const room = this.getRoomById(rid);
    if (room) {
      room.join(uid);
      return room;
    }
  }

  leaveRoom(rid: number, uid: number) {
    const room = this.getRoomById(rid);
    if (room) {
      room.leave(uid);
    }
  }

  closeRoom(rid: number) {
    const room = this.getRoomById(rid);
    if (room) {

      room.close();
      this.rooms.delete(room);
      this.idMapRoom.delete(rid);
      PokerManager.instance.pokers = [];
    }
  }

  startRoom(rid: number) {
    const room = this.getRoomById(rid);
    if (room) {
      PokerManager.instance.init()
      PokerManager.instance.fenPoker()
      room.start();
    }
  }

  getRoomById(id: number) {
    return this.idMapRoom.get(id);
  }

  syncRooms() {
    for (const player of PlayerManager.Instance.players) {
      player.connection.sendMsg(ApiMsgEnum.MsgRoomList, { list: this.getRoomsView() });
    }
  }

  syncRoom(rid: number) {
    const room = this.idMapRoom.get(rid);
    if (room) {
      room.sync();
    }
  }

  getRoomsView(rooms: Set<Room> = this.rooms) {
    return [...rooms].map((room) => this.getRoomView(room));
  }

  getRoomView({ id, players }: Room) {
    return { id, players: PlayerManager.Instance.getPlayersView(players) };
  }




  // // 为不同玩家分配不同锚点
  // public playerPanels: RectTransform[];

  // Rtfm() {
  //   // 当前玩家面板（底部）
  //   this.playerPanels[0].anchorMin = new Vector2(0.5, 0);
  //   this.playerPanels[0].anchorMax = new Vector2(0.5, 0);
  //   this.playerPanels[0].anchoredPosition = new Vector2(0, 50);

  //   // 其他玩家面板（顶部、左侧、右侧）
  //   this.playerPanels[1].anchorMin = new Vector2(0.5, 1);
  //   this.playerPanels[1].anchorMax = new Vector2(0.5, 1);
  //   this.playerPanels[1].anchoredPosition = new Vector2(0, -50);
  // }

}