import Singleton from "../base/Singleton";
import { ApiMsgEnum, IApiPlayerJoinReq } from "../Common";
import { Connection } from "../Core";
import Player from "./Player";
import RoomManager from "./RoomManager";
export default class PlayerManager extends Singleton {
  static get Instance() {
    return super.GetInstance<PlayerManager>();
  }

  players: Set<Player> = new Set();

  private nextPlayerId = 222220;
  private idMapPlayer: Map<number, Player> = new Map();

  createPlayer({ connection, nickname }: IApiPlayerJoinReq & { connection: Connection }) {
    const player = new Player({ id: this.nextPlayerId++, connection, nickname });
    this.players.add(player);
    this.idMapPlayer.set(player.id, player);
    return player;
  }

  removePlayer(uid: number) {
    const player = this.idMapPlayer.get(uid);
    if (player) {
      const rid = player.rid;
      if (rid !== undefined) {
        RoomManager.Instance.leaveRoom(rid, uid);
        RoomManager.Instance.syncRooms();
        RoomManager.Instance.syncRoom(rid);
      }
      this.players.delete(player);
      this.idMapPlayer.delete(uid);
      this.syncPlayers();
    }
  }

  getPlayerById(uid: number) {
    return this.idMapPlayer.get(uid);
  }

  syncPlayers() {
    for (const player of this.players) {
      player.connection.sendMsg(ApiMsgEnum.MsgPlayerList, { list: this.getPlayersView() });
    }
  }

  getPlayersView(players: Set<Player> = this.players) {
    return [...players].map((player) => this.getPlayerView(player));
  }

  getPlayerView({ id, nickname, rid }: Player) {
    return { id, nickname, rid };
  }
}
