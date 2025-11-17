import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { FieldContributorSupport } from './abstractFieldContributorSupport';
import { AggregationExpression } from '../../aggregationExpression';
import { Field } from '../../aggregate/field';
import { Assert } from '../../utils';

export class ExpressionFieldContributor extends FieldContributorSupport {
	private readonly aggregationExpression: AggregationExpression;

	constructor(field: Field, aggregationExpression: AggregationExpression) {
		super(field);

		Assert.notNull(aggregationExpression, 'AggregationExpression must not be null');
		this.aggregationExpression = aggregationExpression;
	}

	toDocument(context: AggregationOperationContext): Document {
		return {
			[this.getField().getTarget()]: this.aggregationExpression.toDocument(context),
		};
	}
}
