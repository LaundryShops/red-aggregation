import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Replacement } from './types';
import { AggregationExpression } from '../../aggregationExpression';

export class AggregationExpressionReplacement extends Replacement {
	private readonly aggregationExpression: AggregationExpression | Document;

	constructor(aggregationExpression: Document)
	constructor(aggregationExpression: AggregationExpression)
    constructor(aggregationExpression: AggregationExpression) {
		super();
        this.aggregationExpression = aggregationExpression;
    }

	toDocumentExpression(context: AggregationOperationContext): Document {
		if (this.aggregationExpression instanceof AggregationExpression) {
			return this.aggregationExpression.toDocument(context);
		}

		return this.aggregationExpression
	}
}
