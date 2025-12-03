import { _decorator, Component, Node, Vec2 } from 'cc';
import { GameManager } from '../core/GameManager';
import { GameEventNames } from '../core/GameEvents';
import { ENTITY_TAGS, Faction } from '../core/Constants';
import { AIComponent, HealthComponent, MemberOfFaction, TagComponent, TransformComponent } from '../core/components';
import { initializeAIBehaviorTree } from '../core/ai/AIBehaviorTreeInitializer';
import { IWorld } from '@bl-framework/ecs';
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
        let entity = this.gameManager.createEntity('zombie');
        entity.getComponent(TransformComponent).position.set(-500, this.getRandomY());
        entity.getOrCreateComponent(TagComponent).addTag(ENTITY_TAGS.PLAYER_1);
        entity.getOrCreateComponent(MemberOfFaction).setFaction(Faction.Player_1);
        entity.getOrCreateComponent(AIComponent);
        entity.getOrCreateComponent(HealthComponent);
        initializeAIBehaviorTree(this.gameManager.world as IWorld, entity);
        let btComponent = entity.getComponent(BehaviorTreeComponent);
        btComponent.blackboard.set('d_velocity', new Vec2(10, 0));
    }

    private createPlayer_2() {
        let entity = this.gameManager.createEntity('zombie');
        entity.getComponent(TransformComponent).position.set(500, this.getRandomY());
        entity.getOrCreateComponent(TagComponent).addTag(ENTITY_TAGS.PLAYER_2);
        entity.getOrCreateComponent(MemberOfFaction).setFaction(Faction.Player_2);
        entity.getOrCreateComponent(AIComponent);
        entity.getOrCreateComponent(HealthComponent);
        initializeAIBehaviorTree(this.gameManager.world as IWorld, entity);
        let btComponent = entity.getComponent(BehaviorTreeComponent);
        btComponent.blackboard.set('d_velocity', new Vec2(-10, 0));
    }

    private createBase_1() {
        let entity = this.gameManager.createEntity('base1');
        entity.getComponent(TransformComponent).position.set(-800, 400);
        entity.getOrCreateComponent(TagComponent).addTag(ENTITY_TAGS.PLAYER_1);
        entity.getOrCreateComponent(MemberOfFaction).setFaction(Faction.Player_1);
        entity.getOrCreateComponent(HealthComponent);
    }

    private createBase_2() {
        let entity = this.gameManager.createEntity('base2');
        entity.getComponent(TransformComponent).position.set(800, 400);
        entity.getOrCreateComponent(TagComponent).addTag(ENTITY_TAGS.PLAYER_2);
        entity.getOrCreateComponent(MemberOfFaction).setFaction(Faction.Player_2);
        entity.getOrCreateComponent(HealthComponent);
    }

    private getRandomX(): number {
        return Math.random() * 1600 - 800; // -500 to 500
    }

    private getRandomY(): number {
        return Math.random() * 400 - 200; // -300 to 300
    }
}


