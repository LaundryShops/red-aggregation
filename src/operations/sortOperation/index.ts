import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Sort } from '../../domain/sort';
import { Assert } from '../../utils';
import { Direction } from '../../domain/order';
import { AggregateOperation } from '../../aggregateOperation';

export class SortOperation extends AggregateOperation {
	private readonly sort: Sort;

	constructor(sort: Sort) {
		Assert.notNull(sort, 'Sort must not be null');
		super();
		this.sort = sort;
	}

	and(sort: Sort): SortOperation;
	and(direction: Direction, ...fields: string[]): SortOperation;
	and(directionOrSort: Direction | Sort, ...fields: string[]) {
		if (directionOrSort instanceof Sort) {
			return new SortOperation(this.sort.and(directionOrSort));
		}

		return this.and(Sort.by(directionOrSort, ...fields));
	}

	toDocument(context: AggregationOperationContext): Document {
		const object: Record<string, number> = {};
		const operator = this.getOperator();

		for (const order of this.sort) {
			const reference = context.getReference(order.getProperty());
			object[reference.getRaw()] = order.isAscending() ? 1 : -1;
		}

		return { [operator]: object };
	}

	getOperator(): string {
		return '$sort';
	}
}
