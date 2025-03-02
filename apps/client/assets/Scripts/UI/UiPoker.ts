import { _decorator, AudioClip, Color, Component, Label, Sprite, SpriteFrame } from 'cc';
// import { Poker } from '../Global/DataManager';
import { ENUM_flower, IPoker } from '../Common';
import EventManager from '../Global/EventManager';
import { EventEnum } from '../Enum';
import DataManager from '../Global/DataManager';
const { ccclass, property } = _decorator;
const POKER_MAP = {    
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '10': '10',
    '11': 'J',
    '12': 'Q',
    '13': 'K',
    '14': 'A',
    '15': '2',
    '16': ' \n \n \n \n小\n王\nW\nN\nG',
    '17': ' \n \n \n \n大\n王\nW\nN\nG',
}
@ccclass('UiPoker')
export default class UiPoker extends Component {
    myPlayerId: number 
    @property(Sprite) bg: Sprite = null
    @property(Sprite) big: Sprite = null
    @property(SpriteFrame) xiao_wang: SpriteFrame = null
    @property(SpriteFrame) da_wang: SpriteFrame = null
    @property(Sprite) small: Sprite = null
    @property(Label) dianShu: Label = null
    @property(SpriteFrame) openBg: SpriteFrame = null
    @property(SpriteFrame) closeBg: SpriteFrame = null
    @property(SpriteFrame) smalls: SpriteFrame[] = []
    @property(SpriteFrame) bigs: SpriteFrame[] = []
    @property(SpriteFrame) JQKs: SpriteFrame[] = []
    @property(AudioClip) adse: AudioClip = null
    poker: IPoker = null
    isClicked: boolean = false
    init(poker: IPoker) {
        this.myPlayerId = DataManager.Instance.myPlayerId
        this.poker = poker
        this.dianShu.string = POKER_MAP[poker.dianShu]
        if (poker.color === ENUM_flower.HEI_TAO || poker.color === ENUM_flower.MEI_HUA || poker.color === ENUM_flower.XIAO_WANG) {
            this.dianShu.color = Color.BLACK
            this.dianShu.isBold = true
        }
        if (poker.color === ENUM_flower.HONG_TAO || poker.color === ENUM_flower.FANG_KUAI || poker.color === ENUM_flower.DA_WANG) {
            this.dianShu.color = Color.RED
            this.dianShu.isBold = true
        }
        if (poker.dianShu >= 11 && poker.dianShu <= 13) {
            this.big.spriteFrame = this.JQKs[poker.dianShu - 11]
        }
        if (poker.dianShu == 16) {
            this.dianShu.fontSize = 15
            this.dianShu.isBold = true
            this.big.spriteFrame = this.xiao_wang
        }
        if (poker.dianShu == 17) {
            this.dianShu.fontSize = 15
            this.dianShu.isBold = true
            this.big.spriteFrame = this.da_wang
        }
        if (poker.dianShu >= 3 && poker.dianShu <= 10) {
            this.big.spriteFrame = this.bigs[poker.color]
        }
        if (poker.dianShu >= 14 && poker.dianShu <= 15) {
            this.big.spriteFrame = this.bigs[poker.color]
        }
        this.small.spriteFrame = this.smalls[poker.color]
    }

    handleClick() {
        // this.node.getPosition().y + 20
        if (this.isClicked === true) {
            EventManager.Instance.emit(EventEnum.PokerClick, this);
            
        }
    }
}


