
import { IPlayer, IRoom } from "./Api";
import { PokerSTypeEnum } from "./Enum";
import { FenShu, IClientInput, IState } from "./State";

export interface IMsgPlayerList { list: Array<IPlayer>; }

export interface IMsgRoomList { list: Array<IRoom>; }

export interface IMsgRoom { room: IRoom; }

export interface IMsgGameStart { state: IState; }

export interface IMsgGameEnd { }

export interface IMsgClientSync { frameId: number; input: IClientInput; }

export interface IMsgServerSync { lastFrameId: number; inputs: Array<IClientInput>; }

export interface IMsgJiaoDiZhu { id: number; isok: boolean; fenShu: string }

export interface IMsgXianShiJiaBei2 { id: number; isActive: boolean; fenShu: string }

export interface IMsgXianShiJiaBei3 { id: number; isActive: boolean ; fenShu: string}

export interface IMsgFenShu { fenshu: number }

export interface IMsgChuPai { pokerType: PokerSTypeEnum  }
