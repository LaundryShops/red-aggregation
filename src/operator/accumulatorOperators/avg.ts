import { Document } from 'mongodb';
import { Fields } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class Avg extends AbstractOperatorExpression {
	private constructor(value: any) {
		super(value);
	}

	static avgOf(fieldReference: string): Avg;
	static avgOf(expression: AggregationExpression): Avg;
	static avgOf(expression: Record<string, any>): Avg;
	static avgOf(input: unknown) {
		Assert.notNull(input, 'Input can not be null');

		if (typeof input === 'string') {
			return new Avg(this.asFields(input));
		}

		return new Avg([input]);
	}

	and(fieldReference: string): Avg;
	and(expression: AggregationExpression): Avg;
	and(expression: Record<string, any>): Avg;
	and(input: unknown) {
		Assert.notNull(input, 'Input can not be null');

		if (typeof input === 'string') {
			return new Avg(this.append(Fields.field(input)));
		}

		return new Avg(this.append(input));
	}

	toDocument(context: AggregationOperationContext, _value?: any): Document {
		if (Array.isArray(_value) && _value.length === 1) {
			return super.toDocument(context, _value[0]);
		}

		return super.toDocument(context, _value);
	}

	protected getMongoMethod(): string {
		return '$avg';
	}
}
