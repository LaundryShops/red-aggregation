import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Ne extends AbstractOperatorExpression {
    private constructor(value: any[]) {
        super(value);
    }

    static valueOf(field: string): Ne
    static valueOf(expression: AggregationExpression): Ne
    static valueOf(expression: Record<string, any>): Ne
    static valueOf(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Ne(this.asFields(fieldOrExpression) as Field[])
        }

        return new Ne([fieldOrExpression])
    }

    notEqualTo(field: string): Ne
    notEqualTo(expression: AggregationExpression): Ne
    notEqualTo(expression: Record<string, any>): Ne
    notEqualTo(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Ne(this.append(Fields.field(fieldOrExpression)))
        }
        return new Ne(this.append([fieldOrExpression]))
    }

    notEqualToValue(value: any) {
        return new Ne(this.append(value))
    }

    protected getMongoMethod(): string {
        return '$ne';
    }

}