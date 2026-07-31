import "reflect-metadata";
import {
    definePropertyType,
    getPropertyTypeMetadata,
    PropertyTypeDescriptor,
} from "../../../../core/mapping/types/propertyType";

class StubType implements PropertyTypeDescriptor<string> {
    readonly kind = "stub";

    constructor(private readonly defaultValue?: string) {}

    hasDefault(): boolean {
        return this.defaultValue !== undefined;
    }

    getDefault(): string | null {
        return this.defaultValue ?? null;
    }

    validate(value: unknown): string | null {
        return value == null || typeof value === "string" ? null : "not a string";
    }
}

function StubField(defaultValue?: string): PropertyDecorator {
    return definePropertyType(new StubType(defaultValue));
}

describe("propertyType registration", () => {
    it("registers a decorated property with its descriptor", () => {
        class User {
            @StubField() name!: string;
        }

        const entries = getPropertyTypeMetadata(User);
        expect(entries).toHaveLength(1);
        expect(entries[0].name).toBe("name");
        expect(entries[0].descriptor.kind).toBe("stub");
    });

    it("accumulates multiple decorated properties on the same class", () => {
        class User {
            @StubField() name!: string;
            @StubField() email!: string;
        }

        const entries = getPropertyTypeMetadata(User);
        expect(entries.map((e) => e.name).sort()).toEqual(["email", "name"]);
    });

    it("replaces the entry when the same property is decorated again", () => {
        class User {
            name!: string;
        }
        StubField("first")(User.prototype, "name");
        StubField("second")(User.prototype, "name");

        const entries = getPropertyTypeMetadata(User);
        expect(entries).toHaveLength(1);
        expect(entries[0].descriptor.getDefault()).toBe("second");
    });

    it("returns an empty array when no property is decorated", () => {
        class Plain {
            name!: string;
        }

        expect(getPropertyTypeMetadata(Plain)).toEqual([]);
    });

    it("propagates through inheritance via reflect-metadata prototype walk", () => {
        class BaseEntity {
            @StubField() _id!: string;
        }
        class ChildEntity extends BaseEntity {
            @StubField() name!: string;
        }

        const entries = getPropertyTypeMetadata(ChildEntity);
        expect(entries.map((e) => e.name).sort()).toEqual(["_id", "name"]);
    });

    it("does not mutate the parent's own metadata when a child adds its own field", () => {
        class BaseEntity {
            @StubField() _id!: string;
        }
        class ChildEntity extends BaseEntity {
            @StubField() name!: string;
        }
        void ChildEntity;

        expect(getPropertyTypeMetadata(BaseEntity).map((e) => e.name)).toEqual(["_id"]);
    });
});
