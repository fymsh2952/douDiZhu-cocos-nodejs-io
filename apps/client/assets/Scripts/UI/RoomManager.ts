import { _decorator, Component, Node, Label, Color } from "cc";
import { EventEnum } from "../Enum";
import EventManager from "../Global/EventManager";
const { ccclass, property } = _decorator;

@ccclass("RoomManager")
export class RoomManager extends Component {
  id: number;
  init({ id, players }: { id: number; players: Array<{ id: number; nickname: string }> }) {
    this.id = id;
    const label = this.getComponent(Label);
    label.string = `房间号: ${id}\n人数:${players.length}`;
    label.color = Color.BLACK
    this.node.active = true;
  }

  handleClick() {
    
    EventManager.Instance.emit(EventEnum.RoomJoin, this.id);
  }
}
