import { Aggregation } from '../../aggregation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AggregationPipeline } from '../../aggregationPipeline';
import { AggregateOperation } from '../../aggregateOperation';

export class WhenDocumentMatch<T> {
	private readonly value: T;

	private constructor(value: T) {
		this.value = value;
	}

	static whenMatchedOf<T extends string>(value: T): WhenDocumentMatch<T> {
		return new WhenDocumentMatch(value);
	}

	static replaceDocument() {
		return this.whenMatchedOf('replace');
	}

	static keepExistingDocument() {
		return this.whenMatchedOf('keepExisting');
	}

	static mergeDocuments() {
		return this.whenMatchedOf('merge');
	}

	static failOnMatch() {
		return this.whenMatchedOf('fail');
	}

	static updateWith(pipelines: AggregateOperation[]): WhenDocumentMatch<AggregateOperation[]>;
	static updateWith(aggregation: Aggregation): WhenDocumentMatch<Aggregation>;
	static updateWith(aggregation: Aggregation | AggregateOperation[]) {
		return new WhenDocumentMatch(aggregation);
	}

	toDocument(context: AggregationOperationContext) {
		if (this.value instanceof Aggregation) {
			return { whenMatched: this.value.toPipeline(context) };
		}

		return { whenMatched: this.value };
	}
}
