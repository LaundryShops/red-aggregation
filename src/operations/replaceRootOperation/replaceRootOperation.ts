import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { FieldsExposingAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { Replacement } from './types';
import { Field } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';
import { AggregationExpressionReplacement } from './aggregationExpressionReplacement';
import { FieldReplacement } from './fieldReplacement';
import { Assert } from '../../utils';
import { ReplaceRootOperationBuilder } from './replaceRootOperationBuilder';
import { ReplacementDocument } from './replacementDocument';
import { ReplaceRootDocumentOperationBuilder } from './replaceRootDocumentOperationBuilder';

export class ReplaceRootOperation extends FieldsExposingAggregationOperation {
	private readonly replacement!: Replacement;

	constructor(field: Field);
	constructor(aggregationExpression: AggregationExpression);
	constructor(aggregationExpression: Document);
	constructor(replacement: Replacement);
	constructor(input: unknown) {
		if (input instanceof AggregationExpression) {
			return new ReplaceRootOperation(new AggregationExpressionReplacement(input));
		}

		if (input instanceof Field) {
			return new ReplaceRootOperation(new FieldReplacement(input));
		}

		if (input instanceof Replacement) {
			super();
			Assert.notNull(input, 'Replacement must not be null');
			this.replacement = input;
			return;
		}

		return new ReplaceRootOperation(new AggregationExpressionReplacement(input as Document));
	}

	static builder() {
		return new ReplaceRootOperationBuilder();
	}

	getFields(): ExposedFields {
		return ExposedFields.from();
	}

	toDocument(context: AggregationOperationContext): Document {
		const v = this.getReplacement().toDocumentExpression(context);
		return {
			$replaceRoot: {
				newRoot: v,
			},
		};
	}

	protected getReplacement() {
		return this.replacement;
	}

	getOperator(): string {
		return '$replaceRoot';
	}
}

export class ReplaceRootDocumentOperation extends ReplaceRootOperation {
	private static readonly EMPTY = new ReplacementDocument();
	private readonly current!: ReplacementDocument;

	constructor();
	constructor(replacementDocument: ReplacementDocument);
	constructor(currentOperation: ReplaceRootDocumentOperation, extension: ReplacementDocument);
	constructor(input?: unknown, extension?: ReplacementDocument) {
		if (input === undefined) {
			return new ReplaceRootDocumentOperation(ReplaceRootDocumentOperation.EMPTY);
		}

		if (input instanceof ReplaceRootDocumentOperation && extension instanceof ReplacementDocument) {
			return new ReplaceRootDocumentOperation(input.current.extendWith(extension));
		}

		if (input instanceof ReplacementDocument) {
			super(input);
			this.current = input;
			return;
		}
	}

	and(aggregationExpression: AggregationExpression) {
		return new ReplaceRootDocumentOperationBuilder(this, aggregationExpression);
	}

	andValue<T>(value: T) {
		return new ReplaceRootDocumentOperationBuilder(this, value);
	}

	andValuesOf<T>(value: T) {
		return new ReplaceRootDocumentOperation(this, ReplacementDocument.valueOf(value));
	}
}
