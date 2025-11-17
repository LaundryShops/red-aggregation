import { Document } from 'mongodb';
import { AggregationOperationContext } from "./aggregate/aggregateOperationContext/aggregationOperationContext"

export abstract class AggregationExpression {
    abstract toDocument(context: AggregationOperationContext): Document
    abstract toDocument(context: AggregationOperationContext, value: any): Document
}

