import { _decorator, Component, Node, Prefab, instantiate, SpriteFrame, director, Vec3, Label, UITransform, Button, Color, Sprite, debug, log, settings } from "cc";
import { ActorManager } from "../Entity/Actor/ActorManager";
import DataManager from "../Global/DataManager";
import { EventEnum } from "../Enum";
import NetworkManager from "../Global/NetworkManager";
import { ApiMsgEnum, EntityTypeEnum, FenShu, IActor, IClientInput, IMsgChuPai, IMsgFenShu, IMsgJiaoDiZhu, IMsgServerSync, IMsgXianShiJiaBei2, IMsgXianShiJiaBei3, InputTypeEnum, PokerSTypeEnum, toFixed } from "../Common";
import EventManager from "../Global/EventManager";
import UiPoker from "../UI/UiPoker";

const { ccclass, property } = _decorator;

@ccclass("BattleManager")
export class BattleManager extends Component {

  @property(Node) map: Node = null;
  @property(Node) nodeActors: Node[] = []//玩家节点列表
  @property(Prefab) pokerPrefab: Prefab = null//牌预制体
  @property(Node) node_3Poker: Node = null;//3张底牌节点


  @property(Button) butnChuPoker: Button = null;
  @property(Button) butnBuChuPoker: Button = null;
  @property(Button) butnJiaBei: Button = null;
  @property(Button) butnBuJiaBei: Button = null;
  @property(Button) butnBuJiao: Button = null;
  @property(Button) butn3fen: Button = null;
  @property(Label) Labelinginging: Label = null;
  @property(Label) labelJiFen: Label = null;


  chuPokerList: Array<Node> = []//出牌列表


  async start() {
    this.butnChuPoker.interactable = false
    this.butnBuChuPoker.interactable = false
    this.labelJiFen.string = "0分"
    this.Labelinginging.node.active = false;
    this.butnChuPoker.node.active = false;
    this.butnBuChuPoker.node.active = false;
    this.butnJiaBei.node.active = false;
    this.butnBuJiaBei.node.active = false;
    this.butnBuJiao.node.active = false;
    this.butn3fen.node.active = false;
    //清空
    this.clearGame();
    //资源加载和网络连接同步执行
    await Promise.all([this.connectServer()]);

    // this.nodeActors.forEach((actor) => {
    //   actor.active = false;
    // })
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgServerSync, this.listenServerSync, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgGameEnd, this.listenGameEnd, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgJiaoDiZhu, this.listenJiaoDiZhu, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgXianShiJiaBei2, this.listenXianShiJiaBei2, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgXianShiJiaBei3, this.listenXianShiJiaBei3, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgChuPai, this.listenChuPai, this);
    EventManager.Instance.on(EventEnum.ClientSync, this.handleClientSync, this);
    EventManager.Instance.on(EventEnum.GameEnd, this.handleGameEnd, this);
    EventManager.Instance.on(EventEnum.PokerClick, this.handlePokerClick, this);
    this.butnChuPoker.node.on(Node.EventType.TOUCH_END, this.handleChuPoker, this);
    this.butnBuChuPoker.node.on(Node.EventType.TOUCH_END, this.handleBuChuPoker, this);

    this.onSyncAllPlayerInfo(); //同步所有玩家信息 和 视图位置的轮换
    this.actor_1JiaoDiZhu()//第一个进入房间的玩家先叫地主，其他玩家可以看到第一个玩家正在叫地主的状态逻辑
    this.actor_1Jiao3fenClick()
    this.actor_2JiaBeiClick()
    this.actor_3JiaBeiClick()
  }

  clearGame() {
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgChuPai, this.listenChuPai, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgJiaoDiZhu, this.listenJiaoDiZhu, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgXianShiJiaBei2, this.listenXianShiJiaBei2, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgXianShiJiaBei3, this.listenXianShiJiaBei3, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgJiaoDiZhu, this.listenJiaoDiZhu, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgServerSync, this.listenServerSync, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgGameEnd, this.listenGameEnd, this);
    EventManager.Instance.off(EventEnum.ClientSync, this.handleClientSync, this);
    EventManager.Instance.off(EventEnum.GameEnd, this.handleGameEnd, this);
    EventManager.Instance.off(EventEnum.PokerClick, this.handlePokerClick, this);
    this.butnChuPoker.node.off(Node.EventType.TOUCH_END, this.handleChuPoker);
    this.butnBuChuPoker.node.off(Node.EventType.TOUCH_END, this.handleBuChuPoker);

    DataManager.Instance.reset();
    this.node_3Poker.destroyAllChildren();
    this.chuPokerList.length = 0;
  }




  //******************************************同步所有玩家信息 和 视图位置的轮换**************************************************************** */
  actors: IActor[] = DataManager.Instance.state.actors;

  onSyncAllPlayerInfo() {
    let mySeataIndex;//自己座位号
    // 拿到自己的座位号
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      if (actor.id == DataManager.Instance.myPlayerId) {
        mySeataIndex = actor.scoreIndex;
      }
    }
    // 玩家视图位置轮回显示在 0 的位置上，  0为下边， 1 为左边， 2 为右边
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      let index = this.getLocalIndex(actor.scoreIndex, mySeataIndex, 3);
      switch (index) {
        case 0:
          this.updataUserInfo(0, actor);
          this.nodeActors[0].active = true;
          break;
        case 1:
          this.updataUserInfo(1, actor);
          this.nodeActors[1].active = true;
          break;
        case 2:
          this.updataUserInfo(2, actor);
          this.nodeActors[2].active = true;
          break;
        default:
          break;
      }
    }
    // 斗地主的剩余3张牌
    let ppokers = DataManager.Instance.state.pokersNext;
    for (let i = 0; i < ppokers.length; i++) {
      let p = instantiate(this.pokerPrefab)
      p.parent = this.node_3Poker
      p.position = new Vec3(0 + 120 * i, 0, 0,)
      let uiPoker = p.getComponent(UiPoker)
      uiPoker.init(ppokers[i])
    }
  }
  // 更新显示每个玩家的信息： 名字、手牌
  updataUserInfo(index, actor) {
    let nodeActor = this.nodeActors[index];
    let spriteJiaBei = nodeActor.getChildByName("Sprite_jiaBei")
    let labelName = nodeActor.getChildByName("Label")
    let labelPokerNum = nodeActor.getChildByName("Label_pokerNmber")
    let spriteDiZhu = nodeActor.getChildByName("Sprite_diZhu")
    let nodePoker = nodeActor.getChildByName("Node_poker")
    let nodeChuPoker = nodeActor.getChildByName("Node_chuPoker")

    labelName.getComponent(Label).string = actor.nickname;
    labelPokerNum.getComponent(Label).string = actor.pokers.length.toString();
    spriteDiZhu.active = false
    spriteJiaBei.active = false

    //斗地主的发牌每人17 张
    for (let j = 0; j < actor.pokers.length; j++) {
      let pp = instantiate(this.pokerPrefab)
      pp.parent = nodePoker
      // pp.parent = this.nodes_17Poker[index]
      let uiPoker = pp.getComponent(UiPoker)
      uiPoker.init(actor.pokers[j])
      if (index == 0) {
        uiPoker.isClicked = true
        pp.position = new Vec3(0 + 30 * j, 0, 0,)
      } else {
        pp.position = new Vec3(0 + 1 * j, 0, 0,)
        pp.active = false
      }
    }
    // 第一个进入游戏的玩家显示叫地主按钮逻辑
    let actor01 = this.actors[0]
    if (actor == actor01) {// 如果该玩家是第一个进入游戏的玩家，并且是自己的位置时，则显示叫分按钮 （不叫，1分，2分，3分）
      if (index == 0) {
        this.butnBuJiao.node.active = true
        this.butn3fen.node.active = true
      }
    }
  }
  /**
   * 获取每个玩家的位置号：0为下边， 1 为左边， 2 为右边
   * @param otherIndex 其他玩家位置号
   * @param thisIndex 我的位置号
   * @param playerNumbers 玩家总数 斗地主为3人
   * @returns 返回位置号：0为下边， 1 为左边， 2 为右边
   */
  getLocalIndex(otherIndex, thisIndex, playerNumbers) {
    let ret = (otherIndex - thisIndex + playerNumbers) % playerNumbers;
    return ret;
  }

  isActor1JiaoDizhu: boolean = false;//玩家1是否叫地主
  isActor2JiaoDizhu: boolean = false;//玩家2是否叫地主
  isActor3JiaoDizhu: boolean = false;//玩家3是否叫地主
  isActor1JiaBei: boolean = false;//玩家1是否加倍 
  isActor2JiaBei: boolean = false;//玩家2是否加倍
  isActor3JiaBei: boolean = false;//玩家3是否加倍
  isActor1buJiaBei: boolean = false;//玩家1是否加倍 
  isActor2buJiaBei: boolean = false;//玩家2是否加倍
  isActor3buJiaBei: boolean = false;//玩家3是否加倍

  //**************************叫地主：第一个进入房间的玩家先叫地主，其他玩家可以看到第一个玩家正在叫地主的状态逻辑************************ */

  actor_1JiaoDiZhu() {
    let mySeataIndex;//自己座位号
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      if (actor.id == DataManager.Instance.myPlayerId) {
        mySeataIndex = actor.scoreIndex;
      }
    }
    let actor_1 = this.actors[0];//第一个进入房间的玩家先叫地主，其他玩家可以看到第一个玩家正在叫地主的状态逻辑
    let index = this.getLocalIndex(actor_1.scoreIndex, mySeataIndex, 3);
    switch (index) {
      case 0:
        break;
      case 1:
        this.Labelinginging.node.active = true
        this.Labelinginging.getComponent(Label).string = `${actor_1.nickname} 正在叫地主请稍等...`
        break;
      case 2:
        this.Labelinginging.node.active = true
        this.Labelinginging.getComponent(Label).string = `${actor_1.nickname} 正在叫地主请稍等...`
        break;
      default:
        break;
    }
  }
  /***************************actor_1玩家叫3分的点击事件，叫3s分后向服务器发送不在显示提示语的开关（isok = true）***************************************************************** */

  actor_1Jiao3fenClick() {
    this.butn3fen.getComponent(Button).node.on(Node.EventType.TOUCH_END, () => {
      this.isActor1JiaoDizhu = true;
      this.butnBuJiao.node.active = false
      this.butn3fen.node.active = false
      let bbb = this.nodeActors[0].getChildByName("Sprite_diZhu")
      bbb.active = true//地主图片显示
      if (this.isActor1JiaoDizhu == true) {
        this.labelJiFen.string = '3分'
      }
      NetworkManager.Instance.sendMsg(ApiMsgEnum.MsgJiaoDiZhu, { id: this.actors[0].id, isok: true, fenShu: "3分" })
    }, this);
  }
  /****接收服务器发来的不在显示提示语的开关（isok = true）************ */
  listenJiaoDiZhu({ id, isok, fenShu }: IMsgJiaoDiZhu) {
    if (isok == true) {
      let mySeataIndex;//自己座位号
      for (let i = 0; i < this.actors.length; i++) {
        let actor = this.actors[i];
        if (actor.id == DataManager.Instance.myPlayerId) {
          mySeataIndex = actor.scoreIndex;
        }
      }
      let actor1 = this.actors[0];//第一个进入房间的玩家先叫地主，其他玩家可以看到第一个玩家正在叫地主的状态逻辑
      let index = this.getLocalIndex(actor1.scoreIndex, mySeataIndex, 3);
      switch (index) {
        case 0:
          this.butnBuChuPoker.node.active = true
          this.butnChuPoker.node.active = true
          break;
        case 1:
          this.Labelinginging.node.active = false
          this.butnJiaBei.node.active = true
          this.butnBuJiaBei.node.active = true
          let bbb = this.nodeActors[1].getChildByName("Sprite_diZhu")
          bbb.active = true//地主图片显示
          this.labelJiFen.string = fenShu
          break;
        case 2:
          this.Labelinginging.node.active = false
          this.butnJiaBei.node.active = true
          this.butnBuJiaBei.node.active = true
          let bbbb = this.nodeActors[2].getChildByName("Sprite_diZhu")
          bbbb.active = true//地主图片显示
          this.labelJiFen.string = fenShu
          break;
        default:
          break;
      }
    }
  }
  /********************************如果第一个进入游戏玩家叫地主，第二个进入游戏的玩家选择加不加倍的逻辑******************************************************************************************* */
  actor_2JiaBeiClick() {
    let mySeataIndex;//自己座位号
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      if (actor.id == DataManager.Instance.myPlayerId) {
        mySeataIndex = actor.scoreIndex;
      }
    }
    let actor2 = this.actors[1];
    let index = this.getLocalIndex(actor2.scoreIndex, mySeataIndex, 3);
    let nodeActor2 = this.nodeActors[0]
    let nodeActor2Name = nodeActor2.getChildByName("Label").getComponent(Label).string
    if (actor2.nickname == nodeActor2Name) {
      if (index == 0) {
        this.butnBuJiaBei.node.on(Node.EventType.TOUCH_END, () => {//玩家2不加倍
          this.isActor2buJiaBei = true
          this.butnJiaBei.node.active = false
          this.butnBuJiaBei.node.active = false
        }, this)
        this.butnJiaBei.node.on(Node.EventType.TOUCH_END, () => {//玩家2加倍
          this.isActor2JiaBei = true
          this.butnJiaBei.node.active = false
          this.butnBuJiaBei.node.active = false
          this.nodeActors[0].getChildByName("Sprite_jiaBei").active = true//显示加倍图片
          let aaa = this.labelJiFen.string
          if (this.isActor2JiaBei == true) {
            if (aaa == '3分') {
              this.labelJiFen.string = '6分'
            } else if (aaa == '6分') {
              this.labelJiFen.string = '12分'
            }
          }

          let bbb = this.labelJiFen.string


          NetworkManager.Instance.sendMsg(ApiMsgEnum.MsgXianShiJiaBei2, { id: actor2.id, isActive: true, fenShu: bbb })
        }, this)
      }
    }
  }

  listenXianShiJiaBei2({ id, isActive, fenShu }: IMsgXianShiJiaBei2) {
    let mySeataIndex;//自己座位号
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      if (actor.id == DataManager.Instance.myPlayerId) {
        mySeataIndex = actor.scoreIndex;
      }
    }
    let actor2 = this.actors[1];//第一个进入房间的玩家先叫地主，其他玩家可以看到第一个玩家正在叫地主的状态逻辑
    let index = this.getLocalIndex(actor2.scoreIndex, mySeataIndex, 3);

    switch (index) {
      case 0:
        break;
      case 1:
        this.nodeActors[1].getChildByName("Sprite_jiaBei").active = isActive//显示加倍图片
        this.labelJiFen.string = fenShu
        break;
      case 2:
        this.nodeActors[2].getChildByName("Sprite_jiaBei").active = isActive//显示加倍图片
        this.labelJiFen.string = fenShu
        break;
      default:
        break;
    }

  }

  /********************************如果第一个进入游戏玩家叫地主，第三个进入游戏的玩家选择加不加倍的逻辑******************************************************************************************* */
  actor_3JiaBeiClick() {
    let mySeataIndex;//自己座位号
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      if (actor.id == DataManager.Instance.myPlayerId) {
        mySeataIndex = actor.scoreIndex;
      }
    }
    let actor3 = this.actors[2];
    let index = this.getLocalIndex(actor3.scoreIndex, mySeataIndex, 3);
    let nodeActor3 = this.nodeActors[0]
    let nodeActor3Name = nodeActor3.getChildByName("Label").getComponent(Label).string
    if (actor3.nickname == nodeActor3Name) {
      if (index == 0) {
        this.butnBuJiaBei.node.on(Node.EventType.TOUCH_END, () => {//玩家2不加倍
          this.isActor3buJiaBei = true
          this.butnJiaBei.node.active = false
          this.butnBuJiaBei.node.active = false
        }, this)
        this.butnJiaBei.node.on(Node.EventType.TOUCH_END, () => {//玩家2加倍
          this.isActor3JiaBei = true
          this.butnJiaBei.node.active = false
          this.butnBuJiaBei.node.active = false
          this.nodeActors[0].getChildByName("Sprite_jiaBei").active = true//显示加倍图片

          let aaa = this.labelJiFen.string
          if (this.isActor3JiaBei == true) {
            if (aaa == '3分') {
              this.labelJiFen.string = '6分'
            } else if (aaa == '6分') {
              this.labelJiFen.string = '12分'
            }
          }
          let bbb = this.labelJiFen.string
          NetworkManager.Instance.sendMsg(ApiMsgEnum.MsgXianShiJiaBei3, { id: actor3.id, isActive: true, fenShu: bbb })

        }, this)
      }
    }
  }
  listenXianShiJiaBei3({ id, isActive, fenShu }: IMsgXianShiJiaBei3) {
    let mySeataIndex;//自己座位号
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      if (actor.id == DataManager.Instance.myPlayerId) {
        mySeataIndex = actor.scoreIndex;
      }
    }
    let actor3 = this.actors[2];//第一个进入房间的玩家先叫地主，其他玩家可以看到第一个玩家正在叫地主的状态逻辑
    let index = this.getLocalIndex(actor3.scoreIndex, mySeataIndex, 3);
    switch (index) {
      case 0:
        break;
      case 1:
        this.nodeActors[1].getChildByName("Sprite_jiaBei").active = isActive//显示加倍图片
        this.labelJiFen.string = fenShu
        break;
      case 2:
        this.nodeActors[2].getChildByName("Sprite_jiaBei").active = isActive//显示加倍图片
        this.labelJiFen.string = fenShu
        break;
      default:
        break;
    }
  }

  //******************************************扑克的点击事件：选中的牌位置上升20个单位************************************************************* */
  pokerType: PokerSTypeEnum
  handlePokerClick(_uiPoker: UiPoker) {
    console.log(`点击了牌：花色为${_uiPoker.poker.color}  点数为${_uiPoker.poker.dianShu}`);
    DataManager.Instance.state.actors.forEach((actor) => {
      if (actor.id == _uiPoker.myPlayerId) {
        this.nodeActors.forEach((node) => {
          node.getChildByName("Node_poker").children.forEach((poker) => {//Node_poker   Node_chuPoker
            let uiPoker = poker.getComponent(UiPoker);
            if (uiPoker.dianShu == _uiPoker.dianShu) {
              if (poker.getPosition().y == 0) {//如果牌y轴的位置为0，则表示牌没有被选中
                poker.position = new Vec3(poker.getPosition().x, poker.getPosition().y + 20, 0,)//选中牌位置上升20个单位
                this.chuPokerList.push(poker)//将选中的牌加入出牌列表 
              } else {
                poker.position = new Vec3(poker.getPosition().x, 0, 0,)//选中牌位置下降20个单位
                let ads = this.chuPokerList.indexOf(poker)             
                this.chuPokerList.splice(ads, 1)//将选中的牌从出牌列表中删除              
              }
            }
          })
        })
      }
    })

    this.aaa(this.chuPokerList)

  }

  aaa(list: Array<Node>): PokerSTypeEnum {
    let pokerSize = list.length
    console.log("出牌数组的长度 = ", pokerSize);
    if (pokerSize >= 1) {   //如果选中的牌只有一张，则出牌按钮可点击      
      this.butnChuPoker.interactable = true
      this.butnBuChuPoker.interactable = true
    } else {//如果选中的牌为0张，则出牌按钮不可点击
      this.butnChuPoker.interactable = false
      this.butnBuChuPoker.interactable = true
    }
    list.sort((a, b) => a.getComponent(UiPoker).poker.dianShu - b.getComponent(UiPoker).poker.dianShu)
    for (let i = 0; i < list.length; i++) {
      if (pokerSize == 1) {
        console.log("单张");
        return PokerSTypeEnum.单张
      }
      else if (pokerSize == 2) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        if (a == b) {
          console.log("对子");
          return PokerSTypeEnum.对子
        }
        if (a == 14 && b == 15 || a == 15 && b == 14) {
          console.log("王炸");
          return PokerSTypeEnum.王炸
        }
      }
      else if (pokerSize == 3) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        if (a == b && a == c) {
          console.log("三张");
          return PokerSTypeEnum.三张
        }
      }
      else if (pokerSize == 4) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        if (a == b && a == c && a == d) {
          console.log("炸弹");
          return PokerSTypeEnum.炸弹
        }
        if ((a == b && a == c && a != d) ||
          (a != b && b == c && b == d)) {
          console.log("三带一");
          return PokerSTypeEnum.三带一
        }
      }
      else if (pokerSize == 5) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e != 15 && e != 16 && e != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
        if ((a == b && a == c && a != d && d == e) ||
          (a == b && b != c && c == d && c == e)) {
          console.log("三带一对");
          return PokerSTypeEnum.三带一对
        }
      }
      else if (pokerSize == 6) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e + 1 == f && f != 15 && f != 16 && f != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
        if (a == b && a == c && c + 1 == d && d == e && d == f) {
          console.log("飞机");
          return PokerSTypeEnum.飞机
        }
        if (a == b && b + 1 == c && c == d && d + 1 == e && e == f) {
          console.log("连对");
          return PokerSTypeEnum.连对
        }
        // if ((a == b && a == c && a == d && a != e && a != f && e != f) ||
        //   (a != b && b == c && b == d && b == e && b != f && a != f) ||
        //   (a != b && b != c && c == d && c == e && c == f && a != c)) {
        //   console.log("四带两单");
        //   return PokerSTypeEnum.四带两单
        // }
      }
      else if (pokerSize == 7) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e + 1 == f && f + 1 == g && g != 15 && g != 16 && g != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
      }
      else if (pokerSize == 8) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        let h = list[7].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e + 1 == f && f + 1 == g && g + 1 == h && h != 15 && h != 16 && h != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
        if (a == b && b + 1 == c && c == d && d + 1 == e && e == f && f + 1 == g && g == h) {
          console.log("连对");
          return PokerSTypeEnum.连对
        }
        if ((a == b && a == c && c + 1 == d && d == e && d == f && f != g && g != h) ||
          (a != b && b == c && b == d && d + 1 == e && e == f && e == g && g != h) ||
          (a != b && b != c && c == d && c == e && e + 1 == f && f == g && f == h)) {
          console.log("飞机带单");
          return PokerSTypeEnum.飞机带单
        }
        // if ((a == b && a == c && a == d && a != e && e == f && f != g && g == h) ||
        //   (a == b && b != c && c == d && c == e && c == f && f != g && g == h) ||
        //   (a == b && b != c && c == d && d != e && e == f && e == g && e == h)) {
        //   console.log("四带两单");
        //   return PokerSTypeEnum.四带两对
        // }
      }
      else if (pokerSize == 9) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        let h = list[7].getComponent(UiPoker).poker.dianShu
        let i = list[8].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e + 1 == f && f + 1 == g && g + 1 == h && h + 1 == i && i != 15 && i != 16 && i != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
        if (a == b && a == c && c + 1 == d && d == e && d == f && f + 1 == g && g == h && h == i) {
          console.log("飞机");
          return PokerSTypeEnum.飞机
        }
      }
      else if (pokerSize == 10) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        let h = list[7].getComponent(UiPoker).poker.dianShu
        let i = list[8].getComponent(UiPoker).poker.dianShu
        let j = list[9].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e + 1 == f && f + 1 == g && g + 1 == h && h + 1 == i && i + 1 == j && j != 15 && j != 16 && j != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
        if (a == b && b + 1 == c && c == d && d + 1 == e && e == f && f + 1 == g && g == h && h + 1 == i && i == j) {
          console.log("连对");
          return PokerSTypeEnum.连对
        }
        if ((a == b && a == c && c + 1 == d && d == e && d == f && f != g && g == h && h != i && i == j) ||
          (a == b && b != c && c == d && c == e && e + 1 == f && f == g && f == h && h != i && i == j) ||
          (a == b && b != c && c == d && d != e && e == f && e == g && g + 1 == h && h == i && h == j)) {
          console.log("飞机带对");
          return PokerSTypeEnum.飞机带对
        }
      }
      else if (pokerSize == 11) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        let h = list[7].getComponent(UiPoker).poker.dianShu
        let i = list[8].getComponent(UiPoker).poker.dianShu
        let j = list[9].getComponent(UiPoker).poker.dianShu
        let k = list[10].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e + 1 == f && f + 1 == g && g + 1 == h && h + 1 == i && i + 1 == j && j + 1 == k && k != 15 && k != 16 && k != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
      }
      else if (pokerSize == 12) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        let h = list[7].getComponent(UiPoker).poker.dianShu
        let i = list[8].getComponent(UiPoker).poker.dianShu
        let j = list[9].getComponent(UiPoker).poker.dianShu
        let k = list[10].getComponent(UiPoker).poker.dianShu
        let l = list[11].getComponent(UiPoker).poker.dianShu
        if (a + 1 == b && b + 1 == c && c + 1 == d && d + 1 == e && e + 1 == f && f + 1 == g && g + 1 == h && h + 1 == i && i + 1 == j && j + 1 == k && k + 1 == l && l != 15 && l != 16 && l != 17) {
          console.log("顺子");
          return PokerSTypeEnum.顺子
        }
        if (a == b && b + 1 == c && c == d && d + 1 == e && e == f &&
          f + 1 == g && g == h && h + 1 == i && i == j && j + 1 == k && k == l) {
          console.log("连对");
          return PokerSTypeEnum.连对
        }
        if (a == b && a == c && c + 1 == d && d == e && d == f && f + 1 == g && g == h && g == i && i + 1 == j && j == k && j == l) {
          console.log("飞机");
          return PokerSTypeEnum.飞机
        }
        if ((a == b && a == c && c + 1 == d && d == e && d == f && f + 1 == g && g == h && g == i && i != j && j != k && k != l) ||
          (a != b && b != c && c != d && d == e && d == f && f + 1 == g && g == h && g == i && i + 1 == j && j == k && j == l)) {
          console.log("飞机带单");
          return PokerSTypeEnum.飞机带单
        }
      }
      else if (pokerSize == 14) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        let h = list[7].getComponent(UiPoker).poker.dianShu
        let i = list[8].getComponent(UiPoker).poker.dianShu
        let j = list[9].getComponent(UiPoker).poker.dianShu
        let k = list[10].getComponent(UiPoker).poker.dianShu
        let l = list[11].getComponent(UiPoker).poker.dianShu
        let m = list[12].getComponent(UiPoker).poker.dianShu
        let n = list[13].getComponent(UiPoker).poker.dianShu
        if (a == b && b + 1 == c && c == d && d + 1 == e && e == f &&
          f + 1 == g && g == h && h + 1 == i && i == j && j + 1 == k && k == l && l + 1 == m && m == n) {
          console.log("连对");
          return PokerSTypeEnum.连对
        }
      }
      else if (pokerSize == 15) {
        let a = list[0].getComponent(UiPoker).poker.dianShu
        let b = list[1].getComponent(UiPoker).poker.dianShu
        let c = list[2].getComponent(UiPoker).poker.dianShu
        let d = list[3].getComponent(UiPoker).poker.dianShu
        let e = list[4].getComponent(UiPoker).poker.dianShu
        let f = list[5].getComponent(UiPoker).poker.dianShu
        let g = list[6].getComponent(UiPoker).poker.dianShu
        let h = list[7].getComponent(UiPoker).poker.dianShu
        let i = list[8].getComponent(UiPoker).poker.dianShu
        let j = list[9].getComponent(UiPoker).poker.dianShu
        let k = list[10].getComponent(UiPoker).poker.dianShu
        let l = list[11].getComponent(UiPoker).poker.dianShu
        let m = list[12].getComponent(UiPoker).poker.dianShu
        let n = list[13].getComponent(UiPoker).poker.dianShu
        let o = list[14].getComponent(UiPoker).poker.dianShu
        if ((a == b && a == c && c + 1 == d && d == e && d == f && f + 1 == g && g == h && g == i && i != j && j == k && k != l && l == m && m != n && n == o) ||
          (a == b && b != c && c == d && c == e && e + 1 == f && f == g && f == h && h + 1 == i && i == j && i == k && k != l && l == m && m != n && n == o) ||
          (a == b && b != c && c == d && d != e && e == f && e == g && g + 1 == h && h == i && h == j && j + 1 == k && k == l && k == m && m != n && n == o) ||
          (a == b && b != c && c == d && d != e && e == f && f != g && g == h && g == i && i + 1 == j && j == k && j == l && l + 1 == m && m == n && m == o)) {
          console.log("飞机带对");
          return PokerSTypeEnum.飞机带对
        }
      }
    }
  }

  //****************************************************点击出牌按钮的事件************************************************************* */
  deskPokerSet: Array<Node> = new Array<Node>() //桌面牌
  handleChuPoker() {
    let abc: PokerSTypeEnum = this.aaa(this.chuPokerList)
    if (abc in PokerSTypeEnum) {
      // 发送出牌消息有问题 不能传Node节点 只能传数据   ？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？？      
      NetworkManager.Instance.sendMsg(ApiMsgEnum.MsgChuPai, { pokerType: abc })
      console.log("出牌");
    }
  }
  listenChuPai({ pokerType }: IMsgChuPai) {
    let chuPokerSet: Array<Node> = []
   
    this.chuPokerList.forEach((poker) => {
      chuPokerSet.push(poker)
    })
    this.chuPokerList.length = 0
    let mySeataIndex;//自己座位号
    for (let i = 0; i < this.actors.length; i++) {
      let actor = this.actors[i];
      if (actor.id == DataManager.Instance.myPlayerId) {
        mySeataIndex = actor.scoreIndex;
      }
    }
    let actor0 = this.actors[0];//第一个进入房间的玩家先叫地主，其他玩家可以看到第一个玩家正在叫地主的状态逻辑
    let index = this.getLocalIndex(actor0.scoreIndex, mySeataIndex, 3);


    
    switch (index) {
      case 0:
        let aaa = this.nodeActors[0].getChildByName("Node_chuPoker")
        chuPokerSet.forEach((poker,j) => {
          this.deskPokerSet.push(poker)
          poker.parent = aaa
          poker.position = new Vec3(0 + 30 * j, 0, 0,)
        })
        chuPokerSet.length = 0
        break;
      case 1:
        let bbb = this.nodeActors[1].getChildByName("Node_chuPoker")
        chuPokerSet.forEach((poker) => {
          poker.parent = bbb
        })
        break;
      case 2:
        let ccc = this.nodeActors[0].getChildByName("Node_chuPoker")
        chuPokerSet.forEach((poker) => {
          poker.parent = ccc
        })
        break;
      default:
        break;
    }
  }

  //****************************************************点击不出牌按钮的事件************************************************************* */
  handleBuChuPoker() {
    console.log("不出牌");
  }





































  async connectServer() {
    if (!(await NetworkManager.Instance.connect().catch(() => false))) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.connectServer();
    }
  }

  handleClientSync(input: IClientInput) {
    const msg = {
      frameId: DataManager.Instance.frameId++,
      input,
    };
    NetworkManager.Instance.sendMsg(ApiMsgEnum.MsgClientSync, msg);
  }

  listenServerSync({ lastFrameId, inputs }: IMsgServerSync) {

  }

  async handleGameEnd() {
    const { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiGameEnd, { rid: DataManager.Instance.roomInfo.id });
    if (!success) {
      console.log(error);
      return;
    }
  }

  listenGameEnd() {
    this.clearGame();
    director.loadScene('Hall');
  }
}
