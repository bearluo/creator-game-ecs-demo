/**
 * 配置验证器
 * 在开发模式下验证配置值的合理性，防止配置错误
 */

import { GameConfig } from './GameConfig';

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
    /** 是否有效 */
    valid: boolean;
    /** 错误消息列表 */
    errors: string[];
    /** 警告消息列表 */
    warnings: string[];
}

/**
 * 配置验证器类
 */
export class ConfigValidator {
    /**
     * 验证所有配置
     * @param config 配置对象
     * @returns 验证结果
     */
    static validate(config: typeof GameConfig): ConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // 验证 AI 配置
        this.validateAIConfig(config.AI, errors, warnings);

        // 验证空间索引配置
        this.validateSpatialIndexConfig(config.SPATIAL_INDEX, errors, warnings);

        // 验证移动配置
        this.validateMovementConfig(config.MOVEMENT, errors, warnings);

        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * 验证 AI 配置
     */
    private static validateAIConfig(
        aiConfig: typeof GameConfig.AI,
        errors: string[],
        warnings: string[]
    ): void {
        // 攻击范围验证
        if (aiConfig.DEFAULT_ATTACK_RANGE <= 0) {
            errors.push('AI.DEFAULT_ATTACK_RANGE 必须大于 0');
        } else if (aiConfig.DEFAULT_ATTACK_RANGE > 1000) {
            warnings.push('AI.DEFAULT_ATTACK_RANGE 值较大，可能影响性能');
        }

        // 攻击伤害验证
        if (aiConfig.DEFAULT_ATTACK_DAMAGE <= 0) {
            errors.push('AI.DEFAULT_ATTACK_DAMAGE 必须大于 0');
        }

        // 攻击冷却时间验证
        if (aiConfig.DEFAULT_ATTACK_COOLDOWN < 0) {
            errors.push('AI.DEFAULT_ATTACK_COOLDOWN 不能为负数');
        } else if (aiConfig.DEFAULT_ATTACK_COOLDOWN < 100) {
            warnings.push('AI.DEFAULT_ATTACK_COOLDOWN 值较小，可能导致攻击过于频繁');
        }

        // 搜索半径验证
        if (aiConfig.SEARCH_RADIUS <= 0) {
            errors.push('AI.SEARCH_RADIUS 必须大于 0');
        } else if (aiConfig.SEARCH_RADIUS > 20) {
            warnings.push('AI.SEARCH_RADIUS 值较大，可能影响性能');
        }
    }

    /**
     * 验证空间索引配置
     */
    private static validateSpatialIndexConfig(
        spatialConfig: typeof GameConfig.SPATIAL_INDEX,
        errors: string[],
        warnings: string[]
    ): void {
        // 网格单元大小验证
        if (spatialConfig.CELL_SIZE <= 0) {
            errors.push('SPATIAL_INDEX.CELL_SIZE 必须大于 0');
        } else if (spatialConfig.CELL_SIZE < 10) {
            warnings.push('SPATIAL_INDEX.CELL_SIZE 值过小，可能导致网格过多，影响性能');
        } else if (spatialConfig.CELL_SIZE > 500) {
            warnings.push('SPATIAL_INDEX.CELL_SIZE 值过大，可能导致空间索引精度不足');
        }
    }

    /**
     * 验证移动配置
     */
    private static validateMovementConfig(
        movementConfig: typeof GameConfig.MOVEMENT,
        errors: string[],
        warnings: string[]
    ): void {
        // 最大速度验证
        if (movementConfig.DEFAULT_MAX_SPEED <= 0) {
            errors.push('MOVEMENT.DEFAULT_MAX_SPEED 必须大于 0');
        } else if (movementConfig.DEFAULT_MAX_SPEED > 1000) {
            warnings.push('MOVEMENT.DEFAULT_MAX_SPEED 值较大，可能导致移动过快');
        }
    }

    /**
     * 在开发模式下验证配置并输出结果
     * @param config 配置对象
     */
    static validateInDev(config: typeof GameConfig): void {
        const result = this.validate(config);

        if (result.errors.length > 0) {
            console.error('[ConfigValidator] 配置验证失败:');
            result.errors.forEach(error => {
                console.error(`  ❌ ${error}`);
            });
        }

        if (result.warnings.length > 0) {
            console.warn('[ConfigValidator] 配置警告:');
            result.warnings.forEach(warning => {
                console.warn(`  ⚠️ ${warning}`);
            });
        }

        if (result.valid && result.warnings.length === 0) {
            console.log('[ConfigValidator] ✅ 配置验证通过');
        }
    }
}

