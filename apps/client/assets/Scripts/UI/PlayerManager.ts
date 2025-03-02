import { _decorator, Component, Node, Label } from "cc";
import DataManager from "../Global/DataManager";
const { ccclass, property } = _decorator;

@ccclass("PlayerManager")
export class PlayerManager extends Component {
  init({ id, nickname, rid }: { id: number; nickname: string; rid: number }) {
    const label = this.getComponent(Label);
    let str = nickname;
    if (DataManager.Instance.myPlayerId === id) {
      str += `(我)`;
    }
    if (rid !== -1) {
      str += `(房间${rid})`;
    }
    label.string = str;
    this.node.active = true;
    console.log(id, nickname, rid);
    
  }
}
