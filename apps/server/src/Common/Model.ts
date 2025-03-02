import {
  IApiGameEndReq,
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
  IApiGameEndRes,
} from "./Api";

import { ApiMsgEnum } from "./Enum";

import { IMsgChuPai, IMsgClientSync, 
  IMsgFenShu, 
  IMsgGameEnd, 
  IMsgGameStart, 
  IMsgJiaoDiZhu, 
  IMsgPlayerList, 
  IMsgRoom, 
  IMsgRoomList, 
  IMsgServerSync,
  IMsgXianShiJiaBei2,
  IMsgXianShiJiaBei3
} from "./Msg";

export interface IModel {
  api: {
    [ApiMsgEnum.ApiPlayerJoin]: {
      req: IApiPlayerJoinReq;
      res: IApiPlayerJoinRes;
    };
    [ApiMsgEnum.ApiPlayerList]: {
      req: IApiPlayerListReq;
      res: IApiPlayerListRes;
    };
    [ApiMsgEnum.ApiRoomList]: {
      req: IApiRoomListReq;
      res: IApiRoomListRes;
    };
    [ApiMsgEnum.ApiRoomCreate]: {
      req: IApiRoomCreateReq;
      res: IApiRoomCreateRes;
    };
    [ApiMsgEnum.ApiRoomJoin]: {
      req: IApiRoomJoinReq;
      res: IApiRoomJoinRes;
    };
    [ApiMsgEnum.ApiRoomLeave]: {
      req: IApiRoomLeaveReq;
      res: IApiRoomLeaveRes;
    };
    [ApiMsgEnum.ApiGameStart]: {
      req: IApiGameStartReq;
      res: IApiGameStartRes;
    };
    [ApiMsgEnum.ApiGameEnd]: {
      req: IApiGameEndReq;
      res: IApiGameEndRes;
    };
  };
  msg: {
    [ApiMsgEnum.MsgPlayerList]: IMsgPlayerList;
    [ApiMsgEnum.MsgRoomList]: IMsgRoomList;
    [ApiMsgEnum.MsgRoom]: IMsgRoom;
    [ApiMsgEnum.MsgGameStart]: IMsgGameStart;
    [ApiMsgEnum.MsgGameEnd]: IMsgGameEnd;
    [ApiMsgEnum.MsgClientSync]: IMsgClientSync;
    [ApiMsgEnum.MsgServerSync]: IMsgServerSync;

    [ApiMsgEnum.MsgJiaoDiZhu]: IMsgJiaoDiZhu;
    [ApiMsgEnum.MsgXianShiJiaBei2]: IMsgXianShiJiaBei2;
    [ApiMsgEnum.MsgXianShiJiaBei3]: IMsgXianShiJiaBei3;
    [ApiMsgEnum.MsgFenShu]: IMsgFenShu;
    [ApiMsgEnum.MsgChuPai]: IMsgChuPai;
  };
}
