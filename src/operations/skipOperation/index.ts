import { Document } from 'mongodb';
import { AggregateOperation } from '../../aggregateOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';

export class SkipOperation extends AggregateOperation {
	private readonly skipCount: number;

	constructor(skipCount: number) {
		super();
		Assert.isTrue(skipCount >= 0, 'Skip count must not be negative');

		this.skipCount = skipCount;
	}

	toDocument(context: AggregationOperationContext): Document {
		return {
			[this.getOperator()]: this.skipCount,
		};
	}

	getOperator(): string {
		return '$skip';
	}
}
