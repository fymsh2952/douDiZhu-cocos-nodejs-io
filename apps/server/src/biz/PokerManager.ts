import Singleton from "../base/Singleton";
import { ENUM_flower, IPoker } from "../Common";
import Poker from "./Poker";
// import Poker from "../Common/State";
// import Poker from "./Poker";


export default class PokerManager extends Singleton {
    static get instance() {
        return super.GetInstance<PokerManager>();
    }  
    /**一副牌 */
    pokers: IPoker[] = [];
    pokers1: IPoker[] = [];
    pokers2: IPoker[] = [];
    pokers3: IPoker[] = [];
    /**剩余3张牌 */
    pokersNext: IPoker[] = [];

 
    /**54张扑克的数据 this.pokers*/
    init() {
        for (let i = ENUM_flower.HEI_TAO; i <= ENUM_flower.DA_WANG; i++) {
            if (i == ENUM_flower.HEI_TAO || i == ENUM_flower.HONG_TAO || i == ENUM_flower.MEI_HUA || i == ENUM_flower.FANG_KUAI) {
                for (let j = 3; j <= 15; j++) {
                    let poker: Poker = new Poker(i, j)
                        this.pokers.push(poker)
                }
            }
            if (i == ENUM_flower.XIAO_WANG) {
                let poker = new Poker(i, 16)
                this.pokers.push(poker)
            }
            if (i == ENUM_flower.DA_WANG) {
                let poker = new Poker(i, 17)
                this.pokers.push(poker)
            }
        }
       
        this.shuffle(this.pokers, 9) // 洗牌
    }
    
    fenPoker(){
        this.pokers1 = this.pokers.splice(0, 17)
        this.pokers1.sort((a, b) => a.dianShu - b.dianShu)//排序
        this.pokers2 = this.pokers.splice(0, 17)
        this.pokers2.sort((a, b) => a.dianShu - b.dianShu)//排序
        this.pokers3 = this.pokers.splice(0, 17)
        this.pokers3.sort((a, b) => a.dianShu - b.dianShu)//排序
        this.pokersNext = this.pokers.splice(0, 3)
        this.pokersNext.sort((a, b) => a.dianShu - b.dianShu)//排序
    }

    /** 洗牌 打乱顺序 的 方法*/
    shuffle(arr: Array<any>, aaa: number) {
        for (let i = 0; i < aaa; i++) {
            let m = arr.length;
            while (m > 1) {
                let index = Math.floor(Math.random() * m--);
                [arr[m], arr[index]] = [arr[index], arr[m]]
            }
            return arr;
        }
    }
}