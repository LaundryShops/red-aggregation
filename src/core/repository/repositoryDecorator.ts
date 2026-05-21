import type { EntityClass } from "../support/entityMetadata";

export const REPOSITORY_METADATA = Symbol.for("mongodb.repository");

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Reflect {
        function defineMetadata(metadataKey: unknown, metadataValue: unknown, target: object): void;
        function getMetadata(metadataKey: unknown, target: object): unknown;
    }
}

export interface RepositoryMetadata<T = unknown> {
    entityClass: EntityClass<T>;
    collection?: string;
}

export interface RepositoryOptions {
    /**
     * Optional collection override for this repository class.
     * Useful when multiple repositories target the same entity with different collections.
     */
    collection?: string;
}

export function Repository<T>(
    entityClass: EntityClass<T>,
    options: RepositoryOptions = {},
): ClassDecorator {
    return (target: object) => {
        const meta: RepositoryMetadata<T> = {
            entityClass,
            collection: options.collection,
        };
        Reflect.defineMetadata(REPOSITORY_METADATA, meta, target);
    };
}

export function getRepositoryMetadata<T>(target: Function): RepositoryMetadata<T> | null {
    if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
        return null;
    }
    const meta = Reflect.getMetadata(REPOSITORY_METADATA, target) as RepositoryMetadata<T> | undefined;
    return meta ?? null;
}
