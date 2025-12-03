import { _decorator, Component, Graphics, Node } from 'cc';
import { Utils } from './Utils';
import { GAME } from './Constants';
const { ccclass, property,executeInEditMode } = _decorator;

let ROTATION_ANGLE = GAME.ROTATION_ANGLE

@ccclass('Grid2_5D')
@executeInEditMode(true)
export class Grid2_5D extends Component {
    @property(Graphics)
    graphics: Graphics = null;

    @property
    gridWidth: number = 50;

    @property
    gridHeight: number = 50;

    @property
    minX: number = -500;

    @property
    maxX: number = 500;

    @property
    minY: number = -300;

    @property
    maxY: number = 300;

    @property
    _angle: number = ROTATION_ANGLE;
    @property
    set angle(value: number) {
        // 将角度转换为弧度
        this._angle = Utils.degreesToRadians(value);
    }
    get angle() {
        // 将弧度转换为角度
        return Utils.radiansToDegrees(this._angle);
    }

    onLoad() {
        if (!this.graphics) {
            this.graphics = this.getComponent(Graphics);
        }
        if (!this.graphics) {
            this.graphics = this.addComponent(Graphics);
        }
    }

    start() {
        this.drawGrid();
    }

    protected update(dt: number): void {
        this.drawGrid();
    }

    drawGrid() {
        const graphics = this.graphics;
        graphics.clear(); // 清除之前的绘制内容
        graphics.lineWidth = 2; // 线宽改小一点便于观察

        // 绘制水平线
        for (let y = this.minY; y <= this.maxY; y += this.gridHeight) {
            for (let x = this.minX; x < this.maxX; x += this.gridWidth) {
                const [x1, y1, s1] = Utils.logicToRender(x, y, this._angle);
                const [x2, y2, s2] = Utils.logicToRender(x + this.gridWidth, y, this._angle);
                graphics.moveTo(x1, y1);
                graphics.lineTo(x2, y2);
            }
        }

        // 绘制垂直线
        for (let x = this.minX; x <= this.maxX; x += this.gridWidth) {
            for (let y = this.minY; y < this.maxY; y += this.gridHeight) {
                const [x1, y1, s1] = Utils.logicToRender(x, y, this._angle);
                const [x2, y2, s2] = Utils.logicToRender(x, y + this.gridHeight, this._angle);
                graphics.moveTo(x1, y1);
                graphics.lineTo(x2, y2);
            }
        }

        graphics.stroke();
    }
}
