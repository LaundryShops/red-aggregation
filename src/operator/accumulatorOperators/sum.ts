import { Document } from 'mongodb';
import { Fields } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class Sum extends AbstractOperatorExpression {
	private constructor(value: any) {
        super(value);
    }

    static sumOf(fieldReference: string): Sum
    static sumOf(expression: AggregationExpression): Sum
    static sumOf(expression: Record<string, any>): Sum
    static sumOf(input: unknown) {
        if (typeof input === 'string') {
            return new Sum(this.asFields(input))
        }

        return new Sum([input]);
    }

    and(fieldReference: string): Sum
    and(value: number): Sum
    and(expression: AggregationExpression): Sum
    and(expression: Record<string, any>): Sum
    and(input: unknown) {
        Assert.notNull(input, 'Input must not be null');

        if (typeof input === 'string') {
            return new Sum(this.append(Fields.field(input)));
        }

        return new Sum(this.append(input));
    }

    toDocument(context: AggregationOperationContext, _value?: any): Document {
        if (Array.isArray(_value) && _value.length === 1) {
            return super.toDocument(context, _value[0]);
        } 

        return super.toDocument(context, _value);
    }

    protected getMongoMethod(): string {
        return '$sum';
    }
}
