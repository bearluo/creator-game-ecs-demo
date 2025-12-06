import { _decorator, Component, Node, EventTouch, Vec2, UITransform, view, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

const tmpVec2 = new Vec2();
const deltaVec2 = new Vec2();
/**
 * MoveTouch
 * 用于2D游戏摇杆、拖动或屏幕移动操作的触控处理组件。
 */
@ccclass('MoveTouch')
export class MoveTouch extends Component {
    @property({ tooltip: '触摸灵敏度调整' })
    sensitivity: number = 1;

    public onTouchMoveCallback: (delta: Vec2, absPosition: Vec2) => void = null;
    public onTouchStartCallback: (position: Vec2) => void = null;
    public onTouchEndCallback: () => void = null;

    private _touching: boolean = false;
    private _lastPos: Vec2 = new Vec2();

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private getTouchPos(touch: EventTouch, out: Vec2 = new Vec2()): Vec2 {
        const touchPosScreen = touch.getLocation();
        out.set(touchPosScreen.x, touchPosScreen.y);
        return out;
    }

    private onTouchStart(event: EventTouch) {
        this._touching = true;
        this.getTouchPos(event, this._lastPos);
        if (this.onTouchStartCallback) {
            this.onTouchStartCallback(this._lastPos.clone());
        }
    }

    private onTouchMove(event: EventTouch) {
        if (!this._touching) return;
        const pos = this.getTouchPos(event, tmpVec2);
        deltaVec2.set(pos).subtract(this._lastPos).multiplyScalar(this.sensitivity);
        if (this.onTouchMoveCallback) {
            this.onTouchMoveCallback(deltaVec2.clone(), pos.clone());
        }
        this._lastPos.set(pos);
    }

    private onTouchEnd(event: EventTouch) {
        this._touching = false;
        if (this.onTouchEndCallback) {
            this.onTouchEndCallback();
        }
    }
}
