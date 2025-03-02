import Singleton from "../Base/Singleton";
import { ApiMsgEnum, IModel } from "../Common";
import { binaryEncode, binaryDecode } from "../Common/Binary";

const TIMEOUT = 5555;

interface IItem {
  cb: Function;
  ctx: unknown;
}

export interface ICallApiRet<T> {
  success: boolean;
  error?: Error;
  res?: T;
}
export default class NetworkManager extends Singleton {
  static get Instance() {
    return super.GetInstance<NetworkManager>();
  }

  ws: WebSocket;
  port = 5555;
  maps: Map<ApiMsgEnum, Array<IItem>> = new Map();
  isConnected = false;

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve(true);
        return;
      }
      this.ws = new WebSocket(`ws://localhost:${this.port}`);
      //onmessage接受的数据类型，只有在后端返回字节数组的时候才有效果
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.isConnected = true;
        resolve(true);
      };

      this.ws.onerror = (e) => {
        this.isConnected = false;
        console.log(e);
        reject("ws onerror");
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        reject("ws onclose");
      };

      this.ws.onmessage = (e) => {
        try {
          const json = binaryDecode(e.data);
          const { name, data } = json;
          try {
            if (this.maps.has(name) && this.maps.get(name).length) {
              // console.log(json);
              this.maps.get(name).forEach(({ cb, ctx }) => cb.call(ctx, data));
            }
          } catch (error) {
            console.log("onmessage:", error);
          }
        } catch (error) {
          console.log("解析失败，不是合法的JSON格式", error);
        }
      };
    });
  }

  callApi<T extends keyof IModel["api"]>(name: T, data: IModel["api"][T]["req"]): Promise<ICallApiRet<IModel["api"][T]["res"]>> {
    return new Promise((resolve) => {
      try {
        // 超时处理
        const timer = setTimeout(() => {
          resolve({ success: false, error: new Error("timeout") });
          this.unlistenMsg(name as any, cb, null);
        }, TIMEOUT);

        // 回调处理
        const cb = (res) => {
          resolve(res);
          clearTimeout(timer);
          this.unlistenMsg(name as any, cb, null);
        };
        this.listenMsg(name as any, cb, null);

        this.sendMsg(name as any, data);
      } catch (error) {
        resolve({ success: false, error: error as Error });
      }
    });
  }

  async sendMsg<T extends keyof IModel["msg"]>(name: T, data: IModel["msg"][T]) {
    const view = binaryEncode(name, data);
    let delay = parseInt(new URLSearchParams(location.search).get("delay") || "0") || 0;
    await new Promise((r) => setTimeout(r, delay));
    this.ws.send(view.buffer);
  }

  listenMsg<T extends keyof IModel["msg"]>(name: T, cb: (args: IModel["msg"][T]) => void, ctx: unknown) {
    if (this.maps.has(name)) {
      this.maps.get(name).push({ ctx, cb });
    } else {
      this.maps.set(name, [{ ctx, cb }]);
    }
  }

  unlistenMsg<T extends keyof IModel["msg"]>(name: T, cb: (args: IModel["msg"][T]) => void, ctx: unknown) {
    if (this.maps.has(name)) {
      const items = this.maps.get(name);
      const index = items.findIndex((i) => cb === i.cb && i.ctx === ctx);
      index > -1 && items.splice(index, 1);
    }
  }
}
