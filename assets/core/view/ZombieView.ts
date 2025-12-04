import { Component } from '@bl-framework/ecs';
import { Animation, AnimationState } from 'cc';
import { RenderComponent } from '../components';

/**
 * Zombie视图组件
 * 管理Zombie实体的动画播放和视图状态
 */
export class ZombieView extends Component {
    /** 当前播放的动画名称 */
    currentAnimation: string = 'run';

    /** 动画组件引用（通过RenderComponent.node获取） */
    private _animation: Animation | null = null;

    /** 动画播放完成回调 */
    private _onAnimationFinished: (() => void) | null = null;

    /**
     * 初始化动画组件
     * 从RenderComponent获取节点，然后获取Animation组件
     */
    initAnimation(renderComponent: RenderComponent): void {
        if (!renderComponent.node) {
            console.warn('[ZombieView] RenderComponent.node is null');
            return;
        }

        this._animation = renderComponent.node.getComponent(Animation);
        if (!this._animation) {
            console.warn('[ZombieView] Animation component not found on node');
        }
    }

    /**
     * 播放跑步动画（循环播放）
     */
    playRun(): void {
        if (!this._animation) {
            console.warn('[ZombieView] Animation component not initialized');
            return;
        }

        if (this.currentAnimation === 'run') {
            return; // 已经在播放跑步动画
        }

        this.currentAnimation = 'run';
        this._animation.play('run');
        
        // 获取动画状态并设置为循环播放
        const state = this._animation.getState('run');
        if (state) {
            // WrapMode: 1=Normal, 2=Loop
            state.wrapMode = 2; // Loop
        }
    }

    /**
     * 播放攻击动画（单次播放）
     * @param onFinished 动画播放完成回调
     */
    playAttack(onFinished?: () => void): void {
        if (!this._animation) {
            console.warn('[ZombieView] Animation component not initialized');
            return;
        }

        this.currentAnimation = 'attack';
        this._onAnimationFinished = onFinished || null;

        this._animation.play('attack');
        
        // 获取动画状态并设置为单次播放
        const state = this._animation.getState('attack');
        if (state) {
            // WrapMode: 1=Normal, 2=Loop
            state.wrapMode = 1; // Normal (单次播放)
            
            // 监听动画完成事件
            const onFinishedHandler = () => {
                if (this._onAnimationFinished) {
                    this._onAnimationFinished();
                    this._onAnimationFinished = null;
                }
                // 攻击动画完成后自动切换回跑步动画
                this.playRun();
            };

            // 使用once监听完成事件
            this._animation.once(Animation.EventType.FINISHED, onFinishedHandler);
        }
    }

    /**
     * 停止当前动画
     */
    stop(): void {
        if (this._animation) {
            this._animation.stop();
        }
        this.currentAnimation = '';
        this._onAnimationFinished = null;
    }

    /**
     * 获取当前动画状态
     */
    getCurrentAnimation(): string {
        return this.currentAnimation;
    }

    /**
     * 检查是否正在播放指定动画
     */
    isPlaying(animationName: string): boolean {
        return this.currentAnimation === animationName;
    }

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.currentAnimation = 'run';
        this._animation = null;
        this._onAnimationFinished = null;
    }
}

