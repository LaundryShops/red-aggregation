import type { EntityClass } from "../support/entityMetadata";
import { MongoPersistentProperty } from "../support/mongoPersistentRepository";
import type { IdentifierAccessor, PersistentEntity } from "../support/persistentEntity";
import type { PersistentProperty } from "../support/persistentProperty";
import type { PersistentPropertyAccessor } from "../support/persistentPropertyAccessor";

export class BasicPersistentEntity<T, P extends PersistentProperty = PersistentProperty>
    implements PersistentEntity<T, P>
{
    constructor(
        private readonly type?: EntityClass<T>,
    ) {}

    hasVersionProperty(): boolean {
        // Trong tương lai gần sẽ cập nhật để có thể lưu lại versioning của record
        return false;
    }

    hasIdProperty(): boolean {
        // Luôn luôn sử dụng _id làm identifier
        return false;
    }
    
    isNew(entity: T): boolean {
        const id = this.getIdentifierAccessor(entity).getIdentifier();
        return id == null;
    }

    getIdentifierAccessor(entity: T): IdentifierAccessor {
        const idAttr = this.getIdAttributeFallback();
        return {
            getIdentifier: () => {
                const raw = (entity as any)?.[idAttr];
                return raw ?? null;
            },
        };
    }

    getType(): EntityClass<T> {
        if (!this.type) {
            throw new Error("Entity type not configured");
        }
        return this.type;
    }

    getPropertyAccessor<E>(entity: E): PersistentPropertyAccessor<E> {
        return new class implements PersistentPropertyAccessor<E> {
            getProperty<P = unknown>(property: string): P | null;
            getProperty<P = unknown>(property: MongoPersistentProperty<P>): P | null;
            getProperty<P = unknown>(property: string | MongoPersistentProperty<P>): P | null {
                const name = typeof property === "string" ? property : property.getName();
                const raw = (entity as any)?.[name];
                return (raw ?? null) as P | null;
            }
        };
    }

    protected getIdAttributeFallback(): string {
        return "_id";
    }
}
