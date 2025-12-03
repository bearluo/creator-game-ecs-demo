import { Component } from '@bl-framework/ecs';
import { Vec3 } from 'cc';
import { GameConfig } from '../GameConfig';

/**
 * 速度组件
 * 存储实体的移动速度
 */
export class VelocityComponent extends Component {
    /** 速度向量 */
    velocity: Vec3 = new Vec3();

    /** 最大速度 */
    maxSpeed: number = GameConfig.MOVEMENT.DEFAULT_MAX_SPEED;

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.velocity.set(0, 0, 0);
        this.maxSpeed = GameConfig.MOVEMENT.DEFAULT_MAX_SPEED;
    }
}

