import type { Document } from 'mongodb';
import { AggregationOperationContext } from './aggregate/aggregateOperationContext/aggregationOperationContext';

export interface IAggregationOperation {
	toPipelineStages(context: AggregationOperationContext): Document;
	toDocument(context: AggregationOperationContext): Document;
	getOperator(): string;
}

export abstract class AggregateOperation implements IAggregationOperation {
	abstract toDocument(context: AggregationOperationContext): Document;
	// abstract getOperator(): string;

	toPipelineStages(context: AggregationOperationContext): [Document] {
		return [this.toDocument(context)];
	}

	abstract getOperator(): string;
	// getOperator(): string {
	// 	// TODO: Cần phân tích thêm để quyết định việc lấy operator key đầu tiên đang được xử lý hay không
	// 	return '';
	// 	// return (
	// 	// 	this.toDocument(Aggregation.DEFAULT_CONTEXT).keys().next().value ??
	// 	// 	''
	// 	// );
	// }
}
