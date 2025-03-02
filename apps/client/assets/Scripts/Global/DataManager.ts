import { Node, Prefab, SpriteFrame, clamp } from "cc";
import Singleton from "../Base/Singleton";
import { EAspect, EntityTypeEnum, ENUM_flower, IClientInput, InputTypeEnum, IPoker, IRoom, IState, toFixed } from "../Common";
import { ActorManager } from "../Entity/Actor/ActorManager";
// import { BulletManager } from "../Entity/Bullet/BulletManager";
import { EventEnum } from "../Enum";
// import { JoyStickManager } from "../UI/JoyStickManager";
import EventManager from "./EventManager";
import UiPoker from "../UI/UiPoker";
// import IPoker from "../Common/State";

// export class Poker{
//   color: ENUM_flower = null
//   dianShu: number = 0
//   fangXiang: EAspect = null
//   uiPoker: UiPoker = null
//   constructor(color: ENUM_flower, dianShu: number) {
//       this.color = color
//       this.dianShu = dianShu
//   }
// }

export default class DataManager extends Singleton {
  static get Instance() {
    return super.GetInstance<DataManager>();
  }

  myPlayerId = 1;
  name: string = undefined
  roomInfo: IRoom;
  stage: Node;
  node_Poker: Node;
  pokers:[IPoker[]] = [[]];
  // pokers2: IPoker[] = [];
  // pokers3: IPoker[] = [];
  /**剩余3张牌 */
  pokersNext: IPoker[] = [];
  seatIndexList: number[] = [0, 1, 2];//座位索引列表

  reset() {
    this.frameId = 0;
    this.stage = null;
    this.node_Poker = null;
    this.pokers = [[]];
    // this.pokers2 = [];
    // this.pokers3 = [];
    this.pokersNext = [];
  }

  frameId = 0;

  state: IState = {
    actors: [
      {
        id: this.myPlayerId,
        nickname: this.name,
        pokers: this.pokers[0],
        scoreIndex: this.seatIndexList[0],
        poerkNum: 0,
        jiaoFenShu: 0
      },
      {
        id: this.myPlayerId,
        nickname: this.name,
        pokers: this.pokers[0],
        scoreIndex: this.seatIndexList[1],
        poerkNum: 0,
        jiaoFenShu: 0
      },
      {
        id: this.myPlayerId,
        nickname: this.name,
        pokers: this.pokers[0],
        scoreIndex: this.seatIndexList[2],
        poerkNum: 0,
        jiaoFenShu: 0
      },
    ],
    pokersNext: this.pokersNext,
  };


}
