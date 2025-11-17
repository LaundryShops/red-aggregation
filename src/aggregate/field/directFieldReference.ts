import { ExposedField } from "./exposeField";
import { Fields } from "./fields";

export interface FieldReference {
    getRaw(): string;
    getReferenceValue(): any;
    toString(): string;
}

export class DirectFieldReference implements FieldReference {
    private field: ExposedField

    constructor(field: ExposedField) {
        this.field = field;
    }

    getRaw(): string {
        const target = this.field.getTarget();
        return this.field.synthetic ? target : `${Fields.UNDERSCORE_ID}.${target}`;
    }

    getReferenceValue() {
        return this.field.synthetic && !this.field.isAliased()
            ? 1
            : this.toString()
    }

    toString() {
        if (this.getRaw().startsWith('$')) {
            return this.getRaw();
        }

        return `$${this.getRaw()}`
    }

}
