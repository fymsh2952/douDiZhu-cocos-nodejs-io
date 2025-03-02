import { _decorator, Component, EditBox, director } from "cc";
import { ApiMsgEnum } from "../Common";
// import { SceneEnum } from "../Enum";
import DataManager from "../Global/DataManager";
import NetworkManager from "../Global/NetworkManager";
const { ccclass, property } = _decorator;

@ccclass("LoginManager")
export class LoginManager extends Component {
  @property(EditBox) input: EditBox = null;

  onLoad() {
    // this.input = this.node.getChildByName("Input").getComponent(EditBox);
    director.preloadScene("Hall");
  }

  async start() {
    await NetworkManager.Instance.connect();
    console.log("服务连接成功！");
  }

  async handleClick() {
    if (!NetworkManager.Instance.isConnected) {
      console.log("未连接！");
      await NetworkManager.Instance.connect();
    }
    const nickname = this.input.string;
    if (!nickname) {
      console.log("请输入昵称！");
      return;
    }
    let { success, res, error } = await NetworkManager.Instance.callApi(ApiMsgEnum.ApiPlayerJoin, {
      nickname,
    });

    if (!success) {
      console.log(error);
      return;
    }

    DataManager.Instance.myPlayerId = res.player.id;
    director.loadScene("Hall");
  }
}
