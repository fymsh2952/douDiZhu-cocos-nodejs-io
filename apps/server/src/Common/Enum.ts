



export enum ApiMsgEnum {
  ApiPlayerList,
  ApiPlayerJoin,
  ApiRoomList,
  ApiRoomCreate,
  ApiRoomJoin,
  ApiRoomLeave,
  ApiGameStart,
  ApiGameEnd,

  MsgPlayerList,
  MsgRoomList,
  MsgRoom,
  MsgGameStart,
  MsgGameEnd,
  MsgClientSync,
  MsgServerSync,

  MsgJiaoDiZhu,//叫地主
  MsgXianShiJiaBei2,//显示加倍
  MsgXianShiJiaBei3,//显示加倍
  MsgFenShu,//显示加倍

  MsgChuPai,//出牌

}


export enum InputTypeEnum {
  ActorMove,
  WeaponShoot,
  TimePast,
}

export enum EntityTypeEnum {
  Map1 = "Map1",
  Actor1 = "Actor1",
  Actor2 = "Actor2",
  Actor3 = "Actor3",
}


export enum ENUM_flower  {
  HEI_TAO,
  HONG_TAO,
  MEI_HUA,
  FANG_KUAI,
  XIAO_WANG,
  DA_WANG
}

export enum EAspect {
  CLOSE,
  OPEN
}


export enum PokerSTypeEnum {
  "单张" = 1, //单张
  "对子" = 2, //对子
  "三张" = 3, //三张
  "三带一" = 4, //三带一
  "三带一对" = 5, //三带
  "四带两单" = 6, //四带二
  "顺子" = 7, //顺子
  "连对" = 8, //连对
  "飞机" = 9, //飞机
  "飞机带单" = 10, //飞机
  "飞机带对" = 11, //飞机
  "炸弹" = 12, //炸弹
  "王炸" = 13, //王炸
  "四带两对"= 14, //四带二

}
