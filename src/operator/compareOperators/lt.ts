import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Lt extends AbstractOperatorExpression {
    private constructor(value: any[]) {
        super(value);
    }

    static valueOf(field: string): Lt
    static valueOf(expression: AggregationExpression): Lt
    static valueOf(expression: Record<string, any>): Lt
    static valueOf(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Lt(this.asFields(fieldOrExpression) as Field[])
        }

        return new Lt([fieldOrExpression])
    }

    lessThan(field: string): Lt
    lessThan(expression: AggregationExpression): Lt
    lessThan(expression: Record<string, any>): Lt
    lessThan(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return new Lt(this.append(Fields.field(fieldOrExpression)))
        }
        return new Lt(this.append([fieldOrExpression]))
    }

    lessThanValue(value: any) {
        return new Lt(this.append(value))
    }

    protected getMongoMethod(): string {
        return '$lt';
    }

}