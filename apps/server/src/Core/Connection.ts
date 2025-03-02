import WebSocket from "ws"
import { EventEmitter } from "stream"
import { MyServer } from "./MyServer"
import { getTime, buffer2ArrayBuffer } from "../utils"
import { ApiMsgEnum, IModel } from "../Common"
import { binaryEncode, binaryDecode } from "../Common/Binary"

export enum ConnectionEventEnum {
  Close = "Close",
}

interface IItem {
  cb: Function
  ctx: unknown
}
export class Connection extends EventEmitter {
  server: MyServer
  ws: WebSocket
  msgMap: Map<ApiMsgEnum, Array<IItem>> = new Map()

  constructor(server: MyServer, ws: WebSocket) {
    super()

    this.server = server
    this.ws = ws
    this.ws.on("close", (code: number, reason: Buffer) => {
      this.emit(ConnectionEventEnum.Close, code, reason.toString())
    })

    this.ws.on("message", (buffer: Buffer) => {
      // const str = buffer.toString()
      try {
        const json = binaryDecode(buffer2ArrayBuffer(buffer))
        const { name, data } = json
        // console.log(`${getTime()}接收|字节数${buffer.length}|${this.playerId || -1}|${JSON.stringify(json)}`)
        if (this.server.apiMap.has(name)) {
          try {
            const cb = this.server.apiMap.get(name)
            const res = cb.call(null, this, data)
            this.sendMsg(name, {
              success: true,
              res,
            })
          } catch (error) {
            this.sendMsg(name, {
              success: false,
              error: (error as Error)?.message,
            })
          }
        } else {
          try {
            if (this.msgMap.has(name)) {
              this.msgMap.get(name).forEach(({ cb, ctx }) => cb.call(ctx, this, data))
            }
          } catch (error) {
            console.log(error)
          }
        }
      } catch (error) {
        console.log(`解析失败，不是合法的JSON格式：`, error)
      }
    })
  }

  listenMsg<T extends keyof IModel["msg"]>(name: T, cb: (connection: Connection, arg: IModel["msg"][T]) => void, ctx: unknown) {
    if (this.msgMap.has(name)) {
      this.msgMap.get(name).push({ cb, ctx })
    } else {
      this.msgMap.set(name, [{ cb, ctx }])
    }
  }

  unlistenMsg<T extends keyof IModel["msg"]>(name: T, cb: (connection: Connection, arg: IModel["msg"][T]) => void, ctx: unknown) {
    if (this.msgMap.has(name)) {
      const items = this.msgMap.get(name)
      const index = items.findIndex((i) => cb === i.cb && i.ctx === ctx)
      index > -1 && items.splice(index, 1)
    }
  }

  sendMsg<T extends keyof IModel["msg"]>(name: T, data: IModel["msg"][T]) {
    const msg = JSON.stringify({
      name,
      data,
    })
    const view = binaryEncode(name, data)
    const buffer = Buffer.from(view.buffer)
    // console.log(
    //   `${getTime()}发送|字节数${buffer.length}|${this.playerId || -1}|内存${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
    //     2
    //   )}MB|${msg}`
    // )
    this.ws.send(buffer)
  }
}
