import { _decorator, Component, Node, Prefab, director, instantiate, Button, EventTouch, NodeEventType } from "cc";
import { ApiMsgEnum, IMsgGameStart, IMsgRoom } from "../Common";
// import { SceneEnum } from "../Enum";
import DataManager from "../Global/DataManager";
import NetworkManager from "../Global/NetworkManager";
import { PlayerManager } from "../UI/PlayerManager";
import { deepClone } from "../Utils";
const { ccclass, property } = _decorator;

@ccclass("RoomManager")
export class RoomManager extends Component {
  @property(Node) playerContainer: Node = null;
  @property(Button) startButton: Button = null;
  @property(Prefab) playerPrefab: Prefab = null;

  onLoad() {
    director.preloadScene('Battle');
    this.startButton.node.active = false;
    this.startButton.node.on(NodeEventType.TOUCH_END, this.handleStart, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgRoom, this.renderPlayers, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgGameStart, this.handleGameStart, this);
  }
  
  onDestroy() {
    // this.startButton.node.off(NodeEventType.TOUCH_END, this.handleStart, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgRoom, this.renderPlayers, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgGameStart, this.handleGameStart, this);
  }

  async start() {
    this.renderPlayers({
      room: DataManager.Instance.roomInfo,
    });
  }

  renderPlayers({ room: { players: list } }: IMsgRoom) {
    for (const item of this.playerContainer.children) {
      item.active = false;
    }
    while (this.playerContainer.children.length < list.length) {
      const playerItem = instantiate(this.playerPrefab);
      playerItem.active = false;
      playerItem.setParent(this.playerContainer);
    }

    for (let i = 0; i < list.length; i++) {
      const data = list[i];
      const node = this.playerContainer.children[i];
      const playerItemManager = node.getComponent(PlayerManager);
      playerItemManager.init(data);
    }
    if (list.length === 3) {
      this.startButton.node.active = true;
    }
  }

  async handleLeave() {
    const { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomLeave, {});
    if (!success) {
      console.log(error);
      return;
    }

    DataManager.Instance.roomInfo = null;
    director.loadScene('Hall');
  }

  async handleStart() {
    const { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiGameStart, { rid: DataManager.Instance.roomInfo.id });
    if (!success) {
      console.log(error);
      return;
    }
    return DataManager.Instance.pokersNext = res.pokersNext
  }

  handleGameStart({ state }: IMsgGameStart) {
    console.log(state);
    DataManager.Instance.state = state;
    director.loadScene('Battle');
  }
}
