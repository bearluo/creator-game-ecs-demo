import { _decorator, Component, Node, Vec2 } from 'cc';
import { GameManager } from '../core/GameManager';
import { GameEventNames } from '../core/GameEvents';
import { ENTITY_TAGS, Faction } from '../core/Constants';
import { TransformComponent } from '../core/components';
import { BehaviorTreeComponent } from '@bl-framework/behaviortree-ecs';
const { ccclass, property } = _decorator;

@ccclass('Scene2DTest')
export class Scene2DTest extends Component {
    @property(GameManager)
    gameManager: GameManager = null;

    start() {
        app.manager.event.on(GameEventNames.GAME_INIT, this.onGameInit, this);
    }

    onGameInit() {
        this.createBase_1();
        this.createBase_2();
        for (let i = 0; i < 10; i++) {
            this.createPlayer_1();
        }
        for (let i = 0; i < 10; i++) {
            this.createPlayer_2();
        }
    }

    update(deltaTime: number) {
        if (!this.gameManager.isInit()) return;
    }

    private createPlayer_1() {
        const entity = this.gameManager.createEntity('zombie', {
            position: new Vec2(-500, this.getRandomY()),
            faction: Faction.Player_1,
            tag: ENTITY_TAGS.PLAYER_1
        });
        
        // 设置初始速度（通过行为树黑板）
        const btComponent = entity.getComponent(BehaviorTreeComponent);
        if (btComponent && btComponent.blackboard) {
            btComponent.blackboard.set('d_velocity', new Vec2(10, 0));
        }
    }

    private createPlayer_2() {
        const entity = this.gameManager.createEntity('zombie', {
            position: new Vec2(500, this.getRandomY()),
            faction: Faction.Player_2,
            tag: ENTITY_TAGS.PLAYER_2
        });
        
        // 设置初始速度（通过行为树黑板）
        const btComponent = entity.getComponent(BehaviorTreeComponent);
        if (btComponent && btComponent.blackboard) {
            btComponent.blackboard.set('d_velocity', new Vec2(-10, 0));
        }
    }

    private createBase_1() {
        this.gameManager.createEntity('base1', {
            position: new Vec2(-600, 0),
            faction: Faction.Player_1,
            tag: ENTITY_TAGS.PLAYER_1
        });
    }

    private createBase_2() {
        this.gameManager.createEntity('base2', {
            position: new Vec2(600, 0),
            faction: Faction.Player_2,
            tag: ENTITY_TAGS.PLAYER_2
        });
    }

    private getRandomX(): number {
        return Math.random() * 1600 - 800; // -500 to 500
    }

    private getRandomY(): number {
        return Math.random() * 400 - 200; // -300 to 300
    }
}


