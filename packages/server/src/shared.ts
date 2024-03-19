/* eslint-disable @typescript-eslint/no-var-requires */
import { DEFAULT_RUNTIME_LOAD_PATH, type ModelMeta, type PolicyDef, type ZodSchemas } from '@zenstackhq/runtime';
import path from 'path';
import { AdapterBaseOptions } from './types';

export function loadAssets(options: AdapterBaseOptions) {
    // model metadata
    const modelMeta = options.modelMeta ?? getDefaultModelMeta(options.loadPath);

    // zod schemas
    let zodSchemas: ZodSchemas | undefined;
    if (typeof options.zodSchemas === 'object') {
        zodSchemas = options.zodSchemas;
    } else if (options.zodSchemas === true) {
        zodSchemas = getDefaultZodSchemas(options.loadPath);
        if (!zodSchemas) {
            throw new Error('Unable to load zod schemas from default location');
        }
    }

    return { modelMeta, zodSchemas };
}

/**
 * Load model metadata.
 *
 * @param loadPath The path to load model metadata from. If not provided,
 * will use default load path.
 */
export function getDefaultModelMeta(loadPath: string | undefined): ModelMeta {
    try {
        if (loadPath) {
            const toLoad = path.resolve(loadPath, 'model-meta');
            return require(toLoad).default;
        } else {
            // model-meta should be resolved relative to the runtime
            const metaPath = require.resolve('.zenstack/model-meta', {
                paths: [require.resolve('@zenstackhq/runtime')],
            });
            return require(metaPath).default;
        }
    } catch {
        if (process.env.ZENSTACK_TEST === '1' && !loadPath) {
            try {
                // special handling for running as tests, try resolving relative to CWD
                return require(path.join(process.cwd(), 'node_modules', DEFAULT_RUNTIME_LOAD_PATH, 'model-meta'))
                    .default;
            } catch {
                throw new Error('Model meta cannot be loaded. Please make sure "zenstack generate" has been run.');
            }
        }
        throw new Error('Model meta cannot be loaded. Please make sure "zenstack generate" has been run.');
    }
}

/**
 * Load access policies.
 *
 * @param loadPath The path to load access policies from. If not provided,
 * will use default load path.
 */
export function getDefaultPolicy(loadPath: string | undefined): PolicyDef {
    try {
        if (loadPath) {
            const toLoad = path.resolve(loadPath, 'policy');
            return require(toLoad).default;
        } else {
            // policy should be resolved relative to the runtime
            const policyPath = require.resolve('.zenstack/policy', {
                paths: [require.resolve('@zenstackhq/runtime')],
            });
            return require(policyPath).default;
        }
    } catch {
        if (process.env.ZENSTACK_TEST === '1' && !loadPath) {
            try {
                // special handling for running as tests, try resolving relative to CWD
                return require(path.join(process.cwd(), 'node_modules', DEFAULT_RUNTIME_LOAD_PATH, 'policy')).default;
            } catch {
                throw new Error(
                    'Policy definition cannot be loaded from default location. Please make sure "zenstack generate" has been run.'
                );
            }
        }
        throw new Error(
            'Policy definition cannot be loaded from default location. Please make sure "zenstack generate" has been run.'
        );
    }
}

/**
 * Load zod schemas.
 *
 * @param loadPath The path to load zod schemas from. If not provided,
 * will use default load path.
 */
export function getDefaultZodSchemas(loadPath: string | undefined): ZodSchemas | undefined {
    try {
        if (loadPath) {
            const toLoad = path.resolve(loadPath, 'zod');
            return require(toLoad);
        } else {
            // policy should be resolved relative to the runtime
            const zodPath = require.resolve('.zenstack/zod', {
                paths: [require.resolve('@zenstackhq/runtime')],
            });
            return require(zodPath);
        }
    } catch {
        if (process.env.ZENSTACK_TEST === '1' && !loadPath) {
            try {
                // special handling for running as tests, try resolving relative to CWD
                return require(path.join(process.cwd(), 'node_modules', DEFAULT_RUNTIME_LOAD_PATH, 'zod'));
            } catch {
                return undefined;
            }
        }
        return undefined;
    }
}
