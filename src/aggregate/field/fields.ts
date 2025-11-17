import { AggregateField } from "./aggregateField";
import { Field } from "./field";
import { format } from 'util';

export class Fields {
    public static readonly UNDERSCORE_ID = '_id';
    public static readonly UNDERSCORE_ID_REF = '$_id';
    private static readonly AMBIGUOUS_EXCEPTION = "Found two fields both using '%s' as name: %s and %s; Please "
        + "customize your field definitions to get to unique field names";

    static field(name: string, target?: string) {
        return new AggregateField(name, target);
    }

    static fieldsField(...fields: Field[]) {
        return new Fields([...fields]);
    }

    static fields(...names: string[]) {
        const fields = [];

        for (const name of names) {
            fields.push(Fields.field(name));
        }

        return new Fields(fields);
    }

    asList(): Readonly<Array<Field>> {
		return Object.freeze([...this.fields]);
	}

    private static verify(fields: Field[]) {
        const reference = new Map<string, Field>();
        for (const field of fields) {
            const name = field.getName()
            const found = reference.get(name)
            if (found) {
                throw new Error(format(Fields.AMBIGUOUS_EXCEPTION, name, found, field))
            }

            reference.set(name, field)
        }

        return fields;
    }

    private fields: Field[];

    private constructor(fields: Field[]) {
        this.fields = Fields.verify(fields);
    }

    [Symbol.iterator](): Iterator<Field> {
        return this.fields[Symbol.iterator]();
    }
}
