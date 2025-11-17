import { Field } from "./field";
import { Fields } from "./fields";

export class ExposedField extends Field implements Field {
    private readonly _synthetic: boolean;
    private readonly field: Field;

    constructor(key: string, synthetic: boolean)
    constructor(delegate: Field, synthetic: boolean)
    constructor(keyOrDelegate: string | Field, synthetic: boolean) {
        super()
        if (typeof keyOrDelegate === 'string') {
            keyOrDelegate = Fields.field(keyOrDelegate);
        }

        this.field = keyOrDelegate;
        this._synthetic = synthetic;
    }

    get synthetic() {
        return this._synthetic;
    }

    getRaw(): string {
        throw new Error("Method not implemented.");
    }

    getName(): string {
        return this.field.getName()
    }

    getTarget(): string {
        return this.field.getTarget()
    }

    isSynthetic() {
        return this.synthetic;
    }

    isAliased() {
        return this.field.isAliased();
    }

    canBeReferredToBy(name: string) {
        return this.getName() === name || this.getTarget() === name;
    }

    toString(): string {
        return `AggregationField: ${this.field}, synthetic: ${this.synthetic}`;
    }

    equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }

        if (!(obj instanceof ExposedField)) {
            return false;
        }

        const that = obj as ExposedField;
        return this.field.getName() === that.field.getName() &&
            this.field.getTarget() === that.field.getTarget() &&
            this.synthetic === that.synthetic;
    }

}
