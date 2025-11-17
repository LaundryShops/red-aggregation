import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Gt extends AbstractOperatorExpression {
    private constructor(value: any[]) {
        super(value);
    }

    static valueOf(field: string): Gt
    static valueOf(expression: AggregationExpression): Gt
    static valueOf(expression: Record<string, any>): Gt
    static valueOf(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Gt(this.asFields(fieldOrExpression) as Field[])
        }

        return new Gt([fieldOrExpression])
    }

    greaterThan(field: string): Gt
    greaterThan(expression: AggregationExpression): Gt
    greaterThan(expression: Record<string, any>): Gt
    greaterThan(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Gt(this.append(Fields.field(fieldOrExpression)))
        }
        return new Gt(this.append([fieldOrExpression]))
    }

    greaterThanValue(value: any) {
        return new Gt(this.append(value))
    }

    protected getMongoMethod(): string {
        return '$gt';
    }

}