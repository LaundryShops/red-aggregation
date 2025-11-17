import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Gte extends AbstractOperatorExpression {
    private constructor(value: any[]) {
        super(value);
    }

    static valueOf(field: string): Gte
    static valueOf(expression: AggregationExpression): Gte
    static valueOf(expression: Record<string, any>): Gte
    static valueOf(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Gte(this.asFields(fieldOrExpression) as Field[])
        }

        return new Gte([fieldOrExpression])
    }

    greaterThanEqualTo(field: string): Gte
    greaterThanEqualTo(expression: AggregationExpression): Gte
    greaterThanEqualTo(expression: Record<string, any>): Gte
    greaterThanEqualTo(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Gte(this.append(Fields.field(fieldOrExpression)))
        }
        return new Gte(this.append([fieldOrExpression]))
    }

    greaterThanEqualToValue(value: any) {
        return new Gte(this.append(value))
    }

    protected getMongoMethod(): string {
        return '$gte';
    }

}