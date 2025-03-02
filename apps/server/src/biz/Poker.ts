import { EAspect, ENUM_flower } from "../Common";


export default class Poker {
    color: ENUM_flower = null
    dianShu: number = 0
    fangXiang: EAspect = null
    constructor(color: ENUM_flower, dianShu: number) {
        this.color = color
        this.dianShu = dianShu
    }
}