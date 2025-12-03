import { Component } from '@bl-framework/ecs';

/**
 * 标签组件
 * 用于给实体添加标签标识
 */
export class TagComponent extends Component {
    /** 标签集合 */
    private tags: Set<string> = new Set();

    /**
     * 添加标签
     */
    addTag(tag: string): void {
        this.tags.add(tag);
    }

    /**
     * 移除标签
     */
    removeTag(tag: string): void {
        this.tags.delete(tag);
    }

    /**
     * 是否包含标签
     */
    hasTag(tag: string): boolean {
        return this.tags.has(tag);
    }

    /**
     * 获取所有标签
     */
    getAllTags(): string[] {
        return Array.from(this.tags);
    }

    /**
     * 清空所有标签
     */
    clearTags(): void {
        this.tags.clear();
    }

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.clearTags();
    }
}
