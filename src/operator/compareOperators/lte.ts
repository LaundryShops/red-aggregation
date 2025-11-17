import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Lte extends AbstractOperatorExpression {
    private constructor(value: any[]) {
        super(value);
    }

    static valueOf(field: string): Lte
    static valueOf(expression: AggregationExpression): Lte
    static valueOf(expression: Record<string, any>): Lte
    static valueOf(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Lte(this.asFields(fieldOrExpression) as Field[])
        }

        return new Lte([fieldOrExpression])
    }

    lessThanEqualTo(field: string): Lte
    lessThanEqualTo(expression: AggregationExpression): Lte
    lessThanEqualTo(expression: Record<string, any>): Lte
    lessThanEqualTo(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Lte(this.append(Fields.field(fieldOrExpression)))
        }
        return new Lte(this.append([fieldOrExpression]))
    }

    lessThanEqualToValue(value: any) {
        return new Lte(this.append(value))
    }

    protected getMongoMethod(): string {
        return '$lte';
    }

}