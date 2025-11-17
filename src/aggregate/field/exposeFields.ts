import { Assert } from "../../utils";
import { ExposedField } from "./exposeField";
import { Fields } from "./fields";
import { FieldReference } from "./directFieldReference";
import { CompositeIterator } from "./compositionIterator";

export class ExposedFields implements Iterable<ExposedField> {
    private static readonly NO_FIELDS = [];
    private static readonly EMPTY = new ExposedFields(ExposedFields.NO_FIELDS, ExposedFields.NO_FIELDS)

    private readonly originalFields: ExposedField[];
    private readonly syntheticFields: ExposedField[];

    static empty() {
        return this.EMPTY;
    }

    static from(...fields: ExposedField[]): ExposedFields
    static from(fields: ExposedField[]): ExposedFields
    static from(fields: ExposedField | ExposedField[]) {
        if (arguments.length > 1 || !Array.isArray(fields)) {
            // eslint-disable-next-line prefer-rest-params
            fields = [...arguments];
        }
        let result = this.EMPTY;

        for (const field of fields as ExposedField[]) {
            result = result.and(field);
        }

        return result
    }

    public static synthetic(fields: Fields): ExposedFields {
        return ExposedFields.createFields(fields, true);
    }

    public static nonSynthetic(fields: Fields): ExposedFields {
        return ExposedFields.createFields(fields, false);
    }

    private static createFields(fields: Fields, synthetic: boolean): ExposedFields {
        Assert.notNull(fields, "Fields must not be null");
        const result: ExposedField[] = [];

        for (const field of fields) {
            result.push(new ExposedField(field, synthetic));
        }

        return ExposedFields.from(result);
    }

    constructor(original: ExposedField[], synthetic: ExposedField[]) {
        this.originalFields = original;
        this.syntheticFields = synthetic;
    }

    and(field: ExposedField): ExposedFields {
        Assert.notNull(field, "Exposed field must not be null");

        let result: ExposedField[] = [];
        result = result.concat(field.synthetic ? this.syntheticFields : this.originalFields)
        result.push(field);

        return new ExposedFields(
            field.synthetic ? this.originalFields : result,
            field.synthetic ? result : this.syntheticFields
        );
    }

    getField(name: string) {
        for (const field of this) {
            if (field.canBeReferredToBy(name)) {
                return field;
            }
        }
        return null;
    }

    exposesNoNonSyntheticFields() {
        return this.originalFields.length === 0;
    }

    exposesSingleNonSyntheticFieldOnly() {
        return this.originalFields.length === 1;
    }

    exposesNoFields(): boolean {
        return this.exposedFieldsCount() == 0;
    }

    private exposedFieldsCount() {
        return this.originalFields.length + this.syntheticFields.length
    }

    iterator() {
        const iterator = new CompositeIterator<ExposedField>();
        if (this.syntheticFields.length > 0) {
            iterator.add(this.syntheticFields.values());
        }

        if (this.originalFields.length > 0) {
            iterator.add(this.originalFields.values());
        }

        return iterator;
    }

    [Symbol.iterator](): Iterator<ExposedField> {
        const allFields = [...this.syntheticFields, ...this.originalFields];
        return allFields[Symbol.iterator]();
    }
}

export class ExpressionFieldReference implements FieldReference {
    private delegate: FieldReference;

    constructor(field: FieldReference) {
        this.delegate = field;
    }

    getRaw(): string {
        return this.delegate.getRaw();
    }

    getReferenceValue() {
        return this.delegate.getReferenceValue()
    }

    toString() {
        const fieldRef = this.delegate.toString();

        if (fieldRef.startsWith("$$")) {
            return fieldRef;
        }

        if (fieldRef.startsWith("$")) {
            return `$${fieldRef}`;
        }

        return fieldRef;
    }

    equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }

        if (!(obj instanceof ExpressionFieldReference)) {
            return false;
        }

        const that = obj as ExpressionFieldReference;
        return this.delegate.getRaw() === that.delegate.getRaw()
    }

}
