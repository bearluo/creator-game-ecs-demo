import { _decorator, Component, Node, Vec3, Vec2, CCFloat } from 'cc';
import { MoveTouch } from './MoveTouch';
const { ccclass, property } = _decorator;

/**
 * CameraCtrl
 * 用于控制2D游戏中的摄像机移动的组件，通过绑定 MoveTouch 组件处理拖拽操作。
 */
@ccclass('CameraCtrl')
export class CameraCtrl extends Component {
    @property({ type: Node, tooltip: '需要控制的摄像机节点' })
    cameraNode: Node = null;

    @property({ type: Node, tooltip: 'MoveTouch 组件节点（可直接绑定带有MoveTouch的节点）' })
    touchNode: Node = null;

    @property({ type: CCFloat, tooltip: '摄像机可移动的最小X' })
    minX: number = -0;

    @property({ type: CCFloat, tooltip: '摄像机可移动的最大X' })
    maxX: number = 0;

    @property({ type: CCFloat, tooltip: '摄像机可移动的最小Y' })
    minY: number = -0;

    @property({ type: CCFloat, tooltip: '摄像机可移动的最大Y' })
    maxY: number = 0;

    @property({ type: CCFloat, tooltip: '摄像机移动灵敏度（最终=自身sensitivity * MoveTouch.sensitivity）' })
    sensitivity: number = 1;

    private _moveTouch: MoveTouch = null;

    onEnable() {
        if (this.touchNode) {
            this._moveTouch = this.touchNode.getComponent(MoveTouch);
            if (this._moveTouch) {
                this._moveTouch.onTouchMoveCallback = this._onTouchMove.bind(this);
            }
        }
    }

    onDisable() {
        if (this._moveTouch) {
            this._moveTouch.onTouchMoveCallback = null;
        }
    }

    private _onTouchMove(delta: Vec2, absPosition: Vec2) {
        if (!this.cameraNode) return;
        // 触控操作通常为视角“反向平移” —— 手指向左，画面要往右移动
        // 受自身sensitivity与MoveTouch.sensitivity乘积影响
        const moveDelta = delta.clone().multiplyScalar(this.sensitivity);
        const cameraPos = this.cameraNode.position.clone();
        cameraPos.x -= moveDelta.x;
        cameraPos.y -= moveDelta.y;

        // 边界限定
        cameraPos.x = Math.max(this.minX, Math.min(this.maxX, cameraPos.x));
        cameraPos.y = Math.max(this.minY, Math.min(this.maxY, cameraPos.y));

        this.cameraNode.setPosition(cameraPos);
    }
}

