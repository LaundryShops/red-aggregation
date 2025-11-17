import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression, Expand } from "../abstractOperatorExpression";

export class Eq extends AbstractOperatorExpression {
    private constructor(value: any[]) {
        super(value);
    }

    protected getMongoMethod(): string {
        return '$eq';
    }

    static valueOf(field: string): Eq
    static valueOf(expression: AggregationExpression): Eq
    static valueOf(expression: Record<string, any>): Eq
    static valueOf(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Eq(this.asFields(fieldOrExpression) as Field[])
        }

        return new Eq([fieldOrExpression])
    }

    equalTo(field: string): Eq
    equalTo(expression: AggregationExpression): Eq
    equalTo(expression: Record<string, any>): Eq
    equalTo(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Eq(this.append(Fields.field(fieldOrExpression)))
        }
        return new Eq(this.append(fieldOrExpression));
    }

    equalToValue(value: any) {
        return new Eq(this.append(value, Expand.KEEP_SOURCE));
    }
}
