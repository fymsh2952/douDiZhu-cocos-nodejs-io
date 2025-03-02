import Singleton from "../Base/Singleton";
import { instantiate, Node } from "cc";
import DataManager from "./DataManager";
import { EntityTypeEnum } from "../Common";

export default class ObjectPoolManager extends Singleton {
  static get Instance() {
    return super.GetInstance<ObjectPoolManager>();
  }

  private objectPool: Node = null;
  private map: Map<EntityTypeEnum, Node[]> = new Map();

  private getContainerName(objectName: EntityTypeEnum) {
    return objectName + "Pool";
  }

  reset() {
    this.objectPool = null;
    this.map.clear();
  }

  get(objectName: EntityTypeEnum) {
    if (this.objectPool === null) {
      this.objectPool = new Node("ObjectPool");
      this.objectPool.setParent(DataManager.Instance.stage);
    }

    if (!this.map.has(objectName)) {
      this.map.set(objectName, []);
      const container = new Node(this.getContainerName(objectName));
      container.setParent(this.objectPool);
    }

    let node: Node;
    const nodes = this.map.get(objectName);

    if (!nodes.length) {
      const prefab = DataManager.Instance.prefabMap.get(objectName);
      node = instantiate(prefab);
      node.name = objectName;
      node.setParent(this.objectPool.getChildByName(this.getContainerName(objectName)));
    } else {
      node = nodes.pop();
    }
    node.active = true;
    return node;
  }

  ret(object: Node) {
    object.active = false;
    const objectName = object.name as EntityTypeEnum;
    this.map.get(objectName).push(object);
  }
}
