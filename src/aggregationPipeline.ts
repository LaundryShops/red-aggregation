import { Document } from 'mongodb';
import { AggregateOperation } from './aggregateOperation';
import { AggregationOperationRenderer } from './aggregate/aggregateOperationContext/aggregateOperationRenderer';
import { AggregationOperationContext } from './aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from './utils';
import { MergeOperation } from './operations/mergeOperation';

export class AggregationPipeline {
	private pipeline: AggregateOperation[];

	static of(...stages: AggregateOperation[]) {
		return new AggregationPipeline([...stages]);
	}

	constructor(aggregationOperations?: AggregateOperation[]) {
		if (aggregationOperations === undefined) {
			aggregationOperations = [];
		}
		Assert.notNull(aggregationOperations, 'Aggregation operations must not be null');
		this.pipeline = aggregationOperations;
	}

	toDocuments(context: AggregationOperationContext): Document[] {
		this.verify();
		return AggregationOperationRenderer.toDocument(this.pipeline, context);
	}

	add(stage: AggregateOperation): AggregationPipeline;
	add(stage: AggregateOperation[]): AggregationPipeline;
	add(stage: AggregateOperation | AggregateOperation[]) {
		Assert.notNull(stage, 'Aggregation operations must not be null');

		if (Array.isArray(stage)) {
			this.pipeline = this.pipeline.concat(...stage);
		} else {
			this.pipeline.push(stage);
		}

		return this;
	}

	getOperations(): ReadonlyArray<AggregateOperation> {
		return this.pipeline;
	}

	firstOperation() {
		return this.pipeline[0];
	}

	lastOperation(): AggregateOperation | null {
		return this.pipeline[this.pipeline.length - 1] ?? null;
	}

	verify() {
		for (const operation of this.pipeline) {
			if (AggregationPipeline.isOut(operation) && this.isLast(operation)) {
				throw new Error('The $out operator must be the last stage in the pipeline');
			}

			if (AggregationPipeline.isMerge(operation) && this.isLast(operation)) {
				throw new Error('The $merge operator must be the last stage in the pipeline');
			}
		}
	}

	isOutOrMerge() {
		if (this.isEmpty()) {
			return false;
		}

		const operation = this.lastOperation();
		return operation !== null && (AggregationPipeline.isOut(operation) || AggregationPipeline.isMerge(operation));
	}

	isEmpty() {
		return this.pipeline.length === 0;
	}

	private isLast(aggregateOperation: AggregateOperation) {
		return this.pipeline.indexOf(aggregateOperation) === this.pipeline.length - 1;
	}

	private static isMerge(operator: AggregateOperation) {
		return operator instanceof MergeOperation || operator.getOperator() === '$merge';
	}

	private static isOut(operator: AggregateOperation) {
		console.log('Out operation is not implement');
		return false;
	}
}
