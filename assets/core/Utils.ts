import { GAME } from "./Constants";

let ROTATION_ANGLE = GAME.ROTATION_ANGLE
/**
 * 工具类
 */
export class Utils {


    /**
     * 将逻辑坐标转换为渲染坐标
     * @param x 逻辑x坐标
     * @param y 逻辑y坐标
     * @returns [渲染x坐标, 渲染y坐标, 缩放比例]
     */
    static logicToRender(x: number, y: number,angle?: number): [number, number, number] {
        const [_x,_y,_layerDepth] = Utils.rotateAroundX(x,y,angle);
        const f = 800.0; // 焦距
        const scale = f / (f + _layerDepth);
        const X = _x * scale;
        const Y = _y * scale - _layerDepth * 0.2; // 让远处略高
        return [X, Y, scale];
    }

    /**
     * 将坐标绕x轴旋转45度，适用于2.5D视角转换
     * @param x 原始x坐标
     * @param y 原始y坐标
     * @param z 原始z坐标(深度)
     * @param angle 45度 = π/4弧度
     * @returns [x坐标, 旋转后y坐标, 旋转后z坐标]
     */
    static rotateAroundX(x: number, y: number,angle = ROTATION_ANGLE): [number, number, number] {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // 绕x轴旋转变换矩阵:
        // | 1    0       0    |
        // | 0  cos(θ) -sin(θ) |
        // | 0  sin(θ)  cos(θ) |
        const rotatedY = y * cos;
        const rotatedZ = y * sin;
        
        return [x, rotatedY, rotatedZ];
    }

    /**
     * 生成指定范围内的随机数
     * @param min 最小值
     * @param max 最大值
     * @returns 随机数
     */
    static random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * 生成指定范围内的随机整数
     * @param min 最小值
     * @param max 最大值
     * @returns 随机整数
     */
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 将角度转换为弧度
     * @param degrees 角度
     * @returns 弧度
     */
    static degreesToRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    /**
     * 将弧度转换为角度
     * @param radians 弧度
     * @returns 角度
     */
    static radiansToDegrees(radians: number): number {
        return radians * 180 / Math.PI;
    }
}
