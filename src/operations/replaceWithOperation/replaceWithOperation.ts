import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { ReplaceRootOperation } from '../replaceRootOperation';
import { Replacement } from '../replaceRootOperation/types';
import { Field, Fields } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';

export class ReplaceWithOperation extends ReplaceRootOperation {
	constructor(replacement: Replacement) {
		super(replacement);
	}

	static replaceWithValue<T>(value: T): ReplaceWithOperation {
		return new ReplaceWithOperation(
			new (class extends Replacement {
				toDocumentExpression(): T {
					return value;
				}
			})()
		);
	}

	static replaceWithValueOf(value: string | Field | AggregationExpression | any): ReplaceWithOperation {
		Assert.notNull(value, 'Value must not be null');

		return new ReplaceWithOperation(
			new (class extends Replacement {
				private readonly rawValue = value;

				toDocumentExpression(ctx: AggregationOperationContext) {
					const target = typeof this.rawValue === 'string' ? Fields.field(this.rawValue) : this.rawValue;

					return ReplaceWithOperation.computeValue(target, ctx);
				}
			})()
		);
	}

	private static computeValue<T>(value: T, context: AggregationOperationContext) {
		if (value instanceof Field) {
			return context.getReference(value).toString();
		}
		if (value instanceof AggregationExpression) {
			return value.toDocument(context);
		}
		if (Array.isArray(value)) {
			const result = value.map((it) => ReplaceWithOperation.computeValue(it, context)) as T;
			return result;
		}

		return value;
	}

	toDocument(context: AggregationOperationContext): Document {
		return context.getMappedObject({
			$replaceWith: this.getReplacement().toDocumentExpression(context),
		});
	}
}
