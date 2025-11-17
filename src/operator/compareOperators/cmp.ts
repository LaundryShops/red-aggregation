import { Field, Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AbstractOperatorExpression, Expand } from "../abstractOperatorExpression";

export class Cmp extends AbstractOperatorExpression {
    static valueOf(field: string): Cmp
    static valueOf(expression: AggregationExpression): Cmp
    static valueOf(expression: Record<string, any>): Cmp
    static valueOf(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            const a = this.asFields(fieldOrExpression)
            return new Cmp(a as Field[]);
        }
        return new Cmp([fieldOrExpression])
    }
    
    private constructor(value: any[]) {
        super(value)
    }

    compareTo(field: string): Cmp
    compareTo(expression: AggregationExpression): Cmp
    compareTo(expression: Record<string, any>): Cmp
    compareTo(fieldOrExpression: unknown): Cmp {
        if (typeof fieldOrExpression === 'string') {
            return new Cmp(this.append(Fields.field(fieldOrExpression)));
        }
        return new Cmp(this.append(fieldOrExpression))
    }

    compareToValue(value: any): Cmp {
        return new Cmp(this.append(value, Expand.KEEP_SOURCE));
    }

    protected getMongoMethod(): string {
        return '$cmp';
    }
}