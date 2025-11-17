import { Document } from 'mongodb';
import { AggregateOperation } from '../../aggregateOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { Field } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';

export class SortByCountOperation extends AggregateOperation {
	private readonly groupByField: Field | null;
	private readonly groupByExpression: AggregationExpression | Document | null;

	constructor(groupByField: Field);
	constructor(groupByExpression: AggregationExpression);
	constructor(groupByExpression: Document);
	constructor(expression: unknown) {
		super();

		Assert.notNull(expression, 'Expression count must not be negative');

		if (expression instanceof AggregationExpression) {
			this.groupByField = null;
			this.groupByExpression = expression;
			return;
		}

		if (expression instanceof Field) {
			this.groupByField = expression;
			this.groupByExpression = null;
			return;
		}

		this.groupByField = null;
		this.groupByExpression = expression as Document;
	}

	toDocument(context: AggregationOperationContext): Document {
		let op = this.getOperator();
		let doc: string;
		if (this.isExpressionUsed()) {
			if (this.groupByExpression instanceof AggregationExpression) {
				return {
					[op]: this.groupByExpression.toDocument(context),
				};
			}
			return {
				[op]: this.groupByExpression as Document,
			};
		}
		return {
			[op]: context.getReference(this.groupByField!).toString(),
		};
	}

	getOperator(): string {
		return '$sortByCount';
	}

	private isExpressionUsed() {
		return this.groupByExpression !== null;
	}
}
