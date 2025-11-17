import { Document } from 'mongodb';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { InheritsFieldsAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { MergeOperationTarget } from './mergeOperationTarget';
import { UniqueMergedId } from './uniqueMergeId';
import { Let } from '../../operator/variableOperators/let';
import { WhenDocumentMatch } from './whenDocumentsMatch';
import { WhenDocumentsDontMatch } from './whenDocumentsdontMatch';
import { Assert } from '../../utils';
import { MergeOperationBuilder } from './mergeOperationBuilder';
import { Fields } from '../../aggregate/field';

export class MergeOperation extends InheritsFieldsAggregationOperation {
	private readonly into: MergeOperationTarget;
	private readonly on: UniqueMergedId;
	private readonly lets: Let | null;
	private readonly whenMatched: WhenDocumentMatch<unknown> | null;
	private readonly whenNotMatched: WhenDocumentsDontMatch | null;

	constructor(
		into: MergeOperationTarget,
		on: UniqueMergedId,
		lets: Let | null,
		whenMatched: WhenDocumentMatch<unknown> | null,
		whenNotMatched: WhenDocumentsDontMatch | null
	) {
		super();
		Assert.notNull(
			into,
			'Into must not be null Please provide a target collection'
		);
		Assert.notNull(
			on,
			'On must not be null Use UniqueMergeId.id() instead'
		);

		this.into = into;
		this.on = on;
		this.lets = lets;
		this.whenMatched = whenMatched;
		this.whenNotMatched = whenNotMatched;
	}

	static builder() {
		return new MergeOperationBuilder();
	}

	mergeInto(collection: string) {
		return MergeOperation.builder().intoCollection(collection).build();
	}

	inheritsFields() {
		return true;
	}

	getFields(): ExposedFields {
		if (this.lets === null) {
			return ExposedFields.from();
		}

		return ExposedFields.synthetic(
			Fields.fields(...this.lets.getVariableNames())
		);
	}

	toDocument(context: AggregationOperationContext): Document {
		if (this.isJustCollection()) {
			return { [this.getOperator()]: this.into._collection };
		}

		let merge: Document = {};
		merge = Object.assign(merge, this.into.toDocument(context));

		if (!this.on.isJustIdField()) {
			merge = Object.assign(merge, this.on.toDocument(context));
		}

		if (this.lets !== null) {
			merge['let'] = this.lets.toDocument(context)['$let'].vars;
		}

		if (this.whenMatched !== null) {
			merge = Object.assign(merge, this.whenMatched.toDocument(context));
		}

		if (this.whenNotMatched !== null) {
			merge = Object.assign(
				merge,
				this.whenNotMatched.toDocument(context)
			);
		}

		return {
			[this.getOperator()]: merge,
		};
	}

	getOperator(): string {
		return '$merge';
	}

	private isJustCollection() {
		return (
			this.into.isTargetingSameDatabase() &&
			this.lets === null &&
			this.whenMatched === null &&
			this.whenNotMatched === null &&
			this.on.isJustIdField()
		);
	}
}
