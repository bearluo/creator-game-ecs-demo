import { Component } from '@bl-framework/ecs';
import { Faction, FactionRelation } from '../Constants';

/**
 * 阵营成员组件
 * 用于标识实体所属阵营并判断与其他阵营的关系
 */
export class MemberOfFaction extends Component {
    /** 实体所属阵营 */
    private faction: Faction;

    /**
     * 设置阵营
     */
    setFaction(faction: Faction): void {
        this.faction = faction;
    }

    /**
     * 获取阵营
     */
    getFaction(): Faction {
        return this.faction;
    }

    /**
     * 判断与目标阵营的关系
     * @returns 'ally' 表示友方, 'enemy' 表示敌方
     */
    getRelationWith(targetFaction: Faction): 'ally' | 'enemy' {
        return FactionRelation[this.faction][targetFaction];
    }

    /** 重置组件 */
    reset(): void {
        super.reset();
        this.faction = null;
    }
}
