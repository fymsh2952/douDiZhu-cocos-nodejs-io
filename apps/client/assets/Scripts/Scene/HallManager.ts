import { _decorator, Component, Node, Prefab, director, instantiate, Button, NodeEventType } from "cc";
import { ApiMsgEnum, IApiPlayerListRes, IApiRoomListRes, IMsgPlayerList, IMsgRoomList } from "../Common";
import { EventEnum } from "../Enum";
import DataManager from "../Global/DataManager";
import EventManager from "../Global/EventManager";
import NetworkManager from "../Global/NetworkManager";
import { PlayerManager } from "../UI/PlayerManager";
import { RoomManager } from "../UI/RoomManager";
const { ccclass, property } = _decorator;

@ccclass("HallManager")
export class HallManager extends Component {
  @property(Node)  playerContainer: Node = null;
  @property(Prefab)  playerPrefab: Prefab = null;
  @property(Node)  roomContainer: Node = null;
  @property(Prefab)  roomPrefab: Prefab = null;


  onLoad() {
    director.preloadScene("Room");
    EventManager.Instance.on(EventEnum.RoomJoin, this.handleJoinRoom, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgPlayerList, this.renderPlayers, this);
    NetworkManager.Instance.listenMsg(ApiMsgEnum.MsgRoomList, this.renderRooms, this);
  }
  
  onDestroy() {
    EventManager.Instance.off(EventEnum.RoomJoin, this.handleJoinRoom, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgPlayerList, this.renderPlayers, this);
    NetworkManager.Instance.unlistenMsg(ApiMsgEnum.MsgRoomList, this.renderRooms, this);
  }

  start() {
    this.playerContainer.destroyAllChildren();
    this.roomContainer.destroyAllChildren();
    this.getPlayers();
    this.getRooms();
  }

  async getPlayers() {
    const { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiPlayerList, {});
    if (!success) {
      console.log(error);
      return;
    }

    this.renderPlayers(res);
  }

  renderPlayers({ list }: IApiPlayerListRes | IMsgPlayerList) {
    for (const item of this.playerContainer.children) {
      item.active = false;
    }
    while (this.playerContainer.children.length < list.length) {
      const playerItem = instantiate(this.playerPrefab);
      playerItem.active = false;
      playerItem.setParent(this.playerContainer);
    }

    for (let i = 0; i < list.length; i++) {
      const node = this.playerContainer.children[i];
      const playerManager = node.getComponent(PlayerManager);
      playerManager.init(list[i]);
    }
  }

  async getRooms() {
    const { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomList, {});
    if (!success) {
      console.log(error);
      return;
    }

    this.renderRooms(res);
  }

  renderRooms = ({ list }: IApiRoomListRes | IMsgRoomList) => {
    for (const item of this.roomContainer.children) {
      item.active = false;
    }
    while (this.roomContainer.children.length < list.length) {
      const roomItem = instantiate(this.roomPrefab);
      roomItem.active = false;
      roomItem.setParent(this.roomContainer);
    }

    for (let i = 0; i < list.length; i++) {
      const data = list[i];
      const node = this.roomContainer.children[i];
      const roomItemManager = node.getComponent(RoomManager);
      roomItemManager.init(data);
    }
  };

  async handleCreateRoom() {
    const { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomCreate, {});
    if (!success) {
      console.log(error);
      return;
    }
    DataManager.Instance.roomInfo = res.room;
    director.loadScene("Room");
  }

  async handleJoinRoom(rid: number) {
    const { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiRoomJoin, { rid });
    if (!success) {
      console.log(error);
      return;
    }

    DataManager.Instance.roomInfo = res.room;
    director.loadScene("Room");
  }
}
