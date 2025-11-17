import { Document } from "mongodb";
import { Fields } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Assert } from "../../utils";
import { AbstractOperatorExpression } from "../abstractOperatorExpression";

export class Min extends AbstractOperatorExpression {
    private constructor(value: any) {
        super(value);
    }

    static minOf(fieldReference: string): Min;
    static minOf(expression: AggregationExpression): Min;
    static minOf(expression: Record<string, any>): Min;
    static minOf(input: unknown) {
        Assert.notNull(input, "Input must not be null");

        if(typeof input === 'string') {
            return new Min(new Map().set('input', Fields.field(input)));
        }

        return new Min(new Map().set('input', input));
    }

    and(fieldReference: string): Min;
    and(expression: AggregationExpression): Min;
    and(expression: Record<string, any>): Min;
    and(input: unknown) {
        Assert.notNull(input, "Input must not be null");

        if(typeof input === 'string') {
            return new Min(this.appendTo('input', Fields.field(input)))
        }
        return new Min(this.appendTo('input', input))
    }

    limit(numberOfResult: number) {
        return new Min(this.append('n', numberOfResult))
    }

    toDocument(context: AggregationOperationContext): Document;
    toDocument(context: AggregationOperationContext, value: any): Document;
    toDocument(context: AggregationOperationContext, _value?: any): Document {
        if (!_value) {
            if (this.get('n') === null) {
                return this.toDocument(context, this.get('input'))
            }

            return super.toDocument(context);
        }

        if (Array.isArray(_value) && _value.length === 1) {
            return super.toDocument(context, _value[0])
        }
        
        return super.toDocument(context, _value)
    }

    protected getMongoMethod(): string {
        return this.contains('n') ? '$minN' : '$min';
    }

}