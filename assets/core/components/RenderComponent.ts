import { Component } from '@bl-framework/ecs';
import { Node } from 'cc';

/**
 * 渲染组件
 * 用于将实体绑定到Cocos Creator节点
 */
export class RenderComponent extends Component {
    /** 绑定的节点 */
    node: Node | null = null;

    /** 是否启用渲染 */
    enabled: boolean = true;

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.node = null;
        this.enabled = true;
    }
}
