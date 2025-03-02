import { _decorator, instantiate, ProgressBar, Label, Vec3, Tween, tween, Component, Node } from "cc";
import { EntityTypeEnum, IActor, InputTypeEnum, IPoker, IVec2, toFixed } from "../../Common";
const { ccclass, property } = _decorator;

@ccclass("ActorManager")
export  class ActorManager extends Component implements IActor {
  id: number;
  nickname: string;
  position: IVec2;
  private label: Label;
  pokers: IPoker[];
  scoreIndex: number; //位置索引
  poerkNum: number;//牌数
  jiaoFenShu: number; //叫分

  // 初始化函数，传入一个IActor类型的参数data
  init(data: IActor) {
    const { id, nickname, pokers} = data;
    this.id = id;
    this.nickname = nickname;
    this.label = this.node.getComponentInChildren(Label);
    this.label.string = nickname;
    this.pokers = pokers
  }
}
