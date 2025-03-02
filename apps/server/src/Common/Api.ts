import { IPoker } from "./State";

export interface IPlayer {
  id: number;
  nickname: string;
  rid: number;
}

export interface IRoom {
  id: number;
  players: Array<IPlayer>;
}

export interface IApiPlayerListReq { }
export interface IApiPlayerListRes { list: Array<IPlayer>; }

export interface IApiPlayerJoinReq { nickname: string; }
export interface IApiPlayerJoinRes { player: IPlayer; }

export interface IApiRoomListReq { }
export interface IApiRoomListRes { list: Array<IRoom>; }

export interface IApiRoomCreateReq { }
export interface IApiRoomCreateRes { room: IRoom; }

export interface IApiRoomJoinReq { rid: number; }
export interface IApiRoomJoinRes { room: IRoom; }

export interface IApiRoomLeaveReq { }
export interface IApiRoomLeaveRes { }

export interface IApiGameStartReq { rid: number; }
export interface IApiGameStartRes { pokersNext: IPoker[] }

export interface IApiGameEndReq { rid: number; }
export interface IApiGameEndRes { }
