import { log } from "console";
import { ApiMsgEnum, EntityTypeEnum, FenShu, IActor, IClientInput, IMsgChuPai, IMsgClientSync, IMsgFenShu, IMsgJiaoDiZhu, IMsgXianShiJiaBei2, IMsgXianShiJiaBei3, InputTypeEnum, IState, toFixed } from "../Common";
import { Connection } from "../Core";
import type Player from "./Player";
import PlayerManager from "./PlayerManager";
import PokerManager from "./PokerManager";
import RoomManager from "./RoomManager";

export default class Room {
  id: number;
  players: Set<Player> = new Set();
  // pokers: Set<Player> = new Set();

  private lastTime?: number;
  private timers: NodeJS.Timer[] = [];
  private pendingInput: Array<IClientInput> = [];
  private lastPlayerFrameIdMap: Map<number, number> = new Map();

  constructor(rid: number) {
    this.id = rid;
  }

  join(uid: number) {
    const player = PlayerManager.Instance.getPlayerById(uid);
    if (player) {
      player.rid = this.id;
      this.players.add(player);
    }
  }

  leave(uid: number) {
    const player = PlayerManager.Instance.getPlayerById(uid);
    if (player) {
      player.rid = -1;
      player.connection.unlistenMsg(ApiMsgEnum.MsgClientSync, this.getClientMsg, this);
      this.players.delete(player);
      if (!this.players.size) {
        RoomManager.Instance.closeRoom(this.id);
      }
    }
  }

  close() {
    this.timers.forEach((t) => clearInterval(t));
    for (const player of this.players) {
      player.rid = -1;
      player.connection.sendMsg(ApiMsgEnum.MsgGameEnd, {});
      player.connection.unlistenMsg(ApiMsgEnum.MsgClientSync, this.getClientMsg, this);
    }
    this.players.clear();
  }

  sync() {
    for (const player of this.players) {
      player.connection.sendMsg(ApiMsgEnum.MsgRoom, {
        room: RoomManager.Instance.getRoomView(this),
      });
    }
  }

  start() {
    const state: IState = {
      actors: [...this.players].map((player, index) => ({
        id: player.id,
        nickname: player.nickname,
        pokers: this.pokerIndex(index),
        scoreIndex: index,
        poerkNum: this.pokerNum(index),
        jiaoFenShu: 0,
      })),
      pokersNext: PokerManager.instance.pokersNext
    };

    for (const player of this.players) {
      player.connection.sendMsg(ApiMsgEnum.MsgGameStart, {
        state,
      });
      player.connection.listenMsg(ApiMsgEnum.MsgClientSync, this.getClientMsg, this);
      player.connection.listenMsg(ApiMsgEnum.MsgJiaoDiZhu, this.getJiaoDiZhuMsg, this);
      player.connection.listenMsg(ApiMsgEnum.MsgXianShiJiaBei2, this.getXianShiJiaBei2Msg, this);
      player.connection.listenMsg(ApiMsgEnum.MsgXianShiJiaBei3, this.getXianShiJiaBei3Msg, this);
      player.connection.listenMsg(ApiMsgEnum.MsgFenShu, this.getFenShuMsg, this);
      player.connection.listenMsg(ApiMsgEnum.MsgChuPai, this.getChuPaiMsg, this);
    }
    let t1 = setInterval(() => {
      this.sendServerMsg();
    }, 100);
    let t2 = setInterval(() => {
      this.timePast();
    }, 16);
    this.timers = [t1, t2];
    // console.log(state.actors);
  }

  getChuPaiMsg(connection: Connection, { pokerType }: IMsgChuPai) {
    let aaa = pokerType

    log('收到客户端消息：');
    log( pokerType);
    [...this.players].map((player, index) => {
      player.connection.sendMsg(ApiMsgEnum.MsgChuPai, {
        pokerType: aaa,
      });
    });
  }

  getFenShuMsg(connection: Connection, { fenshu }: IMsgFenShu) {
    log('收到客户03端消息：', fenshu);
    [...this.players].map((player, index) => {
      player.connection.sendMsg(ApiMsgEnum.MsgFenShu, {
        fenshu: 12
      });
    });
  }

  getXianShiJiaBei3Msg(connection: Connection, { id, isActive, fenShu}: IMsgXianShiJiaBei3) {
    log('收到客户03端消息：', id, isActive);
    let aaa:string = fenShu;
    [...this.players].map((player, index) => {
      player.connection.sendMsg(ApiMsgEnum.MsgXianShiJiaBei3, {
        id: player.id,
        isActive: true,
        fenShu: aaa
      });
    });
  }
  getXianShiJiaBei2Msg(connection: Connection, { id, isActive ,fenShu}: IMsgXianShiJiaBei2) {
    log('收到客户端02消息：', id, isActive);
    let aaa:string = fenShu;
    [...this.players].map((player, index) => {
      player.connection.sendMsg(ApiMsgEnum.MsgXianShiJiaBei2, {
        id: player.id,
        isActive: true,
        fenShu: aaa
      });
    });
  }
 

  getJiaoDiZhuMsg(connection: Connection, { id, isok }: IMsgJiaoDiZhu) {
    log('收到客户端01消息：', id, isok);
    [...this.players].map((player, index) => {
      player.connection.sendMsg(ApiMsgEnum.MsgJiaoDiZhu, {
        id: player.id,
        isok: true,
        fenShu: "3分"
      });

    })
  }







  getClientMsg(connection: Connection, { frameId, input }: IMsgClientSync) {
    this.lastPlayerFrameIdMap.set(connection.playerId, frameId);
    this.pendingInput.push(input);
  }

  sendServerMsg() {
    const pendingInput = this.pendingInput;
    this.pendingInput = [];
    for (const player of this.players) {
      player.connection.sendMsg(ApiMsgEnum.MsgServerSync, {
        lastFrameId: this.lastPlayerFrameIdMap.get(player.id) ?? 0,
        inputs: pendingInput,
      });
    }
  }


  list: Player[] = []
  vec2(index) {
    if (index === 0) {
      return { x: -400, y: -260 };
    }
    if (index === 1) {
      return { x: -400, y: 100 };
    }
    if (index === 2) {
      return { x: 400, y: 100 };
    }
  }

  pokerNum(index: number) {
    if (index === 0) {
      return PokerManager.instance.pokers1.length;
    }
    if (index === 1) {
      return PokerManager.instance.pokers2.length;
    }
    if (index === 2) {
      return PokerManager.instance.pokers3.length;
    }
  }
  pokerIndex(index: number) {
    if (index === 0) {
      return PokerManager.instance.pokers1
    }
    if (index === 1) {
      return PokerManager.instance.pokers2
    }
    if (index === 2) {
      return PokerManager.instance.pokers3
    }
  }




  timePast() {
    let now = process.uptime();
    const dt = now - (this.lastTime ?? now);
    this.pendingInput.push({
      type: InputTypeEnum.TimePast,
      dt: toFixed(dt),
    });
    this.lastTime = now;
  }


}
