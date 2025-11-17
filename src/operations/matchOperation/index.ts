import { Document } from 'mongodb';
import { AggregateOperation } from '../../aggregateOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import {
	IClauseDefinition,
	ClauseDefinition,
} from '../../query/standardDefinition';
import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';

export class MatchOperation extends AggregateOperation {
	private readonly ClauseDefinition: IClauseDefinition | null;
	private readonly expression: AggregationExpression | Document | null;

	constructor(standardDefinition: IClauseDefinition);
	constructor(expression: AggregationExpression);
	constructor(expression: Document);
	constructor(expression: unknown) {
		super();

		Assert.notNull(expression, 'Expression must not be null');

		if (expression instanceof ClauseDefinition) {
			this.ClauseDefinition = expression;
			this.expression = null;
			return;
		}

		if (expression instanceof AggregationExpression) {
			this.ClauseDefinition = null;
			this.expression = expression;
			return;
		}

		this.ClauseDefinition = null;
		this.expression = expression as Record<string, any>;
	}

	toDocument(context: AggregationOperationContext): Document {
		let op = this.getOperator();
		let doc: Document
		if (this.isExpressionUsed()) {
			if (this.expression instanceof AggregationExpression) {
				doc = this.expression.toDocument(context);
			} else {
				doc = this.expression as Document;
			}
		} else {
			doc = this.ClauseDefinition!.getCriteriaObject();
		}
		return {
			[op]: context.getMappedObject(doc)
		};
	}

	getOperator(): string {
		return '$match';
	}

	private isExpressionUsed() {
		return this.expression !== null;
	}
}
