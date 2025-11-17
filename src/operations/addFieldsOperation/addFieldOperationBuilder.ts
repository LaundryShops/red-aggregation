import { AddFieldsOperation } from ".";
import { Fields } from "../../aggregate/field";

export interface ValueAppender {
    withValue<T>(value: T | null): AddFieldsOperationBuilder;
    withValueOf<T>(value: T): AddFieldsOperationBuilder;
    withValueOfExpression<T>(operation: string, ...values: T[]): AddFieldsOperationBuilder;
}

export class AddFieldsOperationBuilder {
    private readonly valueMap: Map<any, any> = new Map();

    constructor(source: Map<any, any>)
    constructor()
    constructor(source?: Map<any, any>) {
        if (source) {
            this.valueMap = source;
        }
    }

    build() {
        return AddFieldsOperation.internalCreateAddFieldOperation(this.valueMap);
    }

    addFieldWithValue<T>(field: string, value: T | null) {
        return this.addField(field).withValue(value);
    }

    addFieldWithValueOf<T>(field: string, value: T) {
        return this.addField(field).withValueOf(value);
    }

    addField(field: string): ValueAppender {
        const valueMap = this.valueMap;
        const addFieldsOperationBuilder = this;
        return new class implements ValueAppender {
            withValue<T>(value: T | null): AddFieldsOperationBuilder {
                valueMap.set(field, typeof value === 'string' ? Fields.field(value) : value);
                return addFieldsOperationBuilder;
            }

            withValueOf<T>(value: T): AddFieldsOperationBuilder {
                valueMap.set(field, typeof value === 'string' ? Fields.field(value) : value);
                return addFieldsOperationBuilder;
            }

            withValueOfExpression<T>(operation: string, ...values: T[]): AddFieldsOperationBuilder {
                throw new Error("Method not implemented.");
            }

        }
    }
}
