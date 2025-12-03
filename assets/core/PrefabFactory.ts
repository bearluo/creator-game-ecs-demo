import { _decorator, assert, Component, instantiate, Node, Pool, Prefab } from 'cc';
const { ccclass, property } = _decorator;

export class PrefabFactory {

    _prefab_pools: Map<string, Pool<Node>> = new Map();
    _prefab_configs: Map<string, IPrefabConfig> = new Map();
    
    registerPrefabFactory(config: IPrefabConfig) {
        let { name, prefab_path, pool_size = 10 ,shrink_threshold = 10} = config;
        if (this._prefab_configs.has(name)) {
            throw new Error(`预制体工厂已注册: ${name}`);
        }
        const prefab = app.manager.asset.get(prefab_path,Prefab);
        this._prefab_configs.set(name, config);
        this._prefab_pools.set(name, new Pool(()=>{
            return instantiate(prefab);
        }, pool_size, (node: Node)=>{
            node.destroy();
        }, shrink_threshold));
    }

    getEntity(name: string) {
        assert(this._prefab_pools.has(name), `预制体工厂未注册: ${name}`);
        return this._prefab_pools.get(name).alloc();
    }

    putEntity(name: string, node: Node) {
        assert(this._prefab_pools.has(name), `预制体工厂未注册: ${name}`);
        this._prefab_pools.get(name).free(node);
        node.parent = null;
    }
}
/**
 * 实体配置
 * @interface IEntityConfig
 * @property {string} name 实体名称
 * @property {string} prefab 实体预制体
 * @property {number} pool_size 实体池大小
 * @property {number} shrink_threshold 实体池收缩阈值
 */
interface IPrefabConfig {
    name: string;
    prefab_path: string;
    pool_size?: number;
    shrink_threshold?: number;
}