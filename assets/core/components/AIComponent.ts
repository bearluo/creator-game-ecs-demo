import { Component, Entity } from "@bl-framework/ecs";
import { Vec2 } from "cc";
import { TransformComponent, VelocityComponent } from "../components";
import { GameConfig } from "../GameConfig";


export class AIComponent extends Component {
    public attackRange: number = GameConfig.AI.DEFAULT_ATTACK_RANGE; // 攻击范围
    public attackDamage: number = GameConfig.AI.DEFAULT_ATTACK_DAMAGE; // 攻击伤害
    public attackCooldown: number = GameConfig.AI.DEFAULT_ATTACK_COOLDOWN; // 攻击冷却时间（毫秒）
    
    // 状态变量
    public currentState: string = 'idle'; // 当前状态
    public lastStateChangeTime: number = 0; // 上次状态改变时间
    public lastAttackTime: number = 0; // 上次攻击时间
    public target: Entity | null = null; // 目标实体
    
    constructor() {
        super();
    }

    reset(): void {
        super.reset();
        this.attackRange = GameConfig.AI.DEFAULT_ATTACK_RANGE;
        this.attackDamage = GameConfig.AI.DEFAULT_ATTACK_DAMAGE;
        this.attackCooldown = GameConfig.AI.DEFAULT_ATTACK_COOLDOWN;
        this.currentState = 'idle';
        this.lastStateChangeTime = 0;
        this.lastAttackTime = 0;
    }
    
    /**
     * 改变AI状态
     */
    public changeState(newState: string): void {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.lastStateChangeTime = Date.now();
        }
    }
    
    /**
     * 检查是否在指定状态时间内
     */
    public isInStateFor(duration: number): boolean {
        return (Date.now() - this.lastStateChangeTime) >= duration;
    }

    /**
     * 检查是否可以攻击（冷却时间是否已过）
     */
    public canAttack(): boolean {
        return (Date.now() - this.lastAttackTime) >= this.attackCooldown;
    }

    /**
     * 记录攻击时间
     */
    public recordAttack(): void {
        this.lastAttackTime = Date.now();
    }

} 