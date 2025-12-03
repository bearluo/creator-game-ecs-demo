import { Component } from '@bl-framework/ecs';

/**
 * 面朝方向组件
 * 存储实体的面朝方向
 */
export class FaceComponent extends Component {
    /** 面朝方向 1:朝右 -1:朝左 */
    direction: number = 1;

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.direction = 1;
    }
}
