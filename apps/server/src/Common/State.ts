// import Poker from "../biz/Poker";
import { EAspect, EntityTypeEnum, ENUM_flower, InputTypeEnum } from "./Enum";

export interface  IPoker {
  color: ENUM_flower 
  dianShu: number 
  fangXiang?: EAspect 
 
}

export interface FenShu {
  fenShu: string;
}

export interface IActor {
  id: number;
  nickname: string;
  scoreIndex: number;
  pokers: IPoker[];
  poerkNum: number;
  jiaoFenShu: number;
}


export interface IVec2 {
  x: number;
  y: number;
}

export interface IState {
  actors: IActor[];
  pokersNext: IPoker[]
  
}



export type IClientInput = ITimePast;

// export interface IActorMove {
//   type: InputTypeEnum.ActorMove;
//   id: number;
//   // direction: IVec2;
//   dt: number;
// }

// export interface IWeaponShoot {
//   type: InputTypeEnum.WeaponShoot;
//   owner: number;
//   position: IVec2;
//   // direction: IVec2;
// }

export interface ITimePast {
  type: InputTypeEnum.TimePast;
  dt: number;
}
