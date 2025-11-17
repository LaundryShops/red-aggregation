import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AggregationExpression } from '../../aggregationExpression';

export abstract class Replacement {
	abstract toDocumentExpression(context: AggregationOperationContext): any;
}

export interface ReplacementContributor extends AggregationExpression {
	toDocument(context: AggregationOperationContext): Document;
}
