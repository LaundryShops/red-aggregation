import { Document } from 'mongodb';
import { Fields } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class Max extends AbstractOperatorExpression {
	private constructor(value: any) {
		super(value);
	}

	static maxOf(fieldReference: string): Max;
	static maxOf(expression: AggregationExpression): Max;
	static maxOf(expression: Record<string, any>): Max;
	static maxOf(input: unknown) {
		Assert.notNull(input, 'Input must not be null');

		if (typeof input === 'string') {
			return new Max(new Map().set('input', Fields.field(input)));
		}

		return new Max(new Map().set('input', input));
	}

	and(fieldReference: string): Max;
	and(expression: AggregationExpression): Max;
	and(expression: Record<string, any>): Max;
	and(input: unknown) {
		Assert.notNull(input, 'Input must not be null');

		if (typeof input === 'string') {
			return new Max(this.appendTo('input', Fields.field(input)));
		}
		return new Max(this.appendTo('input', input));
	}

	limit(numberOfResult: number) {
		return new Max(this.append('n', numberOfResult));
	}

	toDocument(context: AggregationOperationContext): Document;
	toDocument(context: AggregationOperationContext, value: any): Document;
	toDocument(context: AggregationOperationContext, _value?: any): Document {
		if (!_value) {
			if (this.get('n') === null) {
				return this.toDocument(context, this.get('input'));
			}

			return super.toDocument(context);
		}

		if (Array.isArray(_value) && _value.length === 1) {
			return super.toDocument(context, _value[0]);
		}

		return super.toDocument(context, _value);
	}

	protected getMongoMethod(): string {
		return this.contains('n') ? '$maxN' : '$max';
	}
}
