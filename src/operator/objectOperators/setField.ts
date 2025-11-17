import { Document } from 'mongodb';
import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { SystemVariables } from "../../systemVariables";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class SetField extends AbstractOperatorExpression {

    static field(fieldName: string): SetField
    static field(field: Field): SetField
    static field(fieldName: string | Field): SetField {
        return new SetField(new Map().set("field", fieldName));
    }

    protected constructor(value: any) {
        super(value);
    }

    input(fieldRef: string): SetField
    input(expression: AggregationExpression): SetField
    input(fieldRef: any): SetField
    input(field: any) {
        if (typeof field === 'string' && !Object.values(SystemVariables).includes(field as SystemVariables)) {
            return this.input(Fields.field(field));
        }
        if (field instanceof AggregationExpression) {
            return this.input(field);
        }

        return new SetField(this.append('input', field));
    }

    toValue(value: any) {
        return new SetField(this.append('value', value))
    }

    toDocument(context: AggregationOperationContext): Document {
        const fieldValue = this.get('field');
        if (fieldValue instanceof Field) {
            const value = this.append("field", context.getReference(fieldValue).toString())
            return new SetField(value).toDocument(context);
        }
        return super.toDocument(context);
    }

    protected override getMongoMethod(): string {
        return '$setField';
    }

}
