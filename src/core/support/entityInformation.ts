import type { EntityClass, EntityMetadata } from "./entityMetadata";
import { Assert } from "../../utils/assert";

export interface EntityInformation<T, ID> extends EntityMetadata<T> {
    isNew(entity: T): boolean;

    /**
     * Id của entity, hoặc `null` nếu không lấy được
     *
     * @param entity không được `null` / `undefined`
     */
    getId(entity: T): ID | null;

    /**
     * Kiểu (constructor) của id.
     */
    // getIdType(): EntityClass<ID>;

    /**
     * Bắt buộc có id; ném nếu entity null hoặc {@link getId} trả về null.
     *
     * @param entity không được null
     * @throws Error nếu không lấy được id
     */
    getRequiredId(entity: T): ID;
}

/**
 * Triển khai mặc định giống default method trên interface Java.
 */
export function getRequiredEntityId<T, ID>(
    information: Pick<EntityInformation<T, ID>, "getId">,
    entity: T,
): ID {
    Assert.notNull(entity, "Entity must not be null");
    const id = information.getId(entity);
    if (id != null) {
        return id;
    }
    throw new Error(
        `Could not obtain required identifier from entity ${entity}`,
    );
}

/**
 * Lớp cơ sở tùy chọn: cài sẵn {@link EntityInformation.getRequiredId} thay vì lặp lại logic.
 */
export abstract class AbstractEntityInformation<T, ID> implements EntityInformation<T, ID> {
    abstract isNew(entity: T): boolean;
    abstract getId(entity: T): ID | null;
    abstract getEntityType(): EntityClass<T>;

    getRequiredId(entity: T): ID {
        return getRequiredEntityId(this, entity);
    }
}
