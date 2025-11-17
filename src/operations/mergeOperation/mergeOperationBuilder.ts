import { MergeOperation } from '.';
import { Aggregation } from '../../aggregation';
import { Let } from '../../operator/variableOperators/let';
import { Assert } from '../../utils';
import { MergeOperationTarget } from './mergeOperationTarget';
import { UniqueMergedId } from './uniqueMergeId';
import { WhenDocumentsDontMatch } from './whenDocumentsdontMatch';
import { WhenDocumentMatch } from './whenDocumentsMatch';

export class MergeOperationBuilder {
	private collection: string | null = null;
	private db: string | null = null;
	private _whenMatched: WhenDocumentMatch<unknown> | null = null;
	private _whenNotMatched: WhenDocumentsDontMatch | null = null;
	private lets: Let | null = null;
	private _id: UniqueMergedId = UniqueMergedId.id();

	intoCollection(collection: string) {
		Assert.hasText(collection, 'Collection must not be null nor empty');

		this.collection = collection;
		return this;
	}

	inDatabase(db: string) {
		this.db = db;
		return this;
	}

	into(into: MergeOperationTarget) {
		this.db = into._db;
		this.collection = into._collection;
		return this;
	}

	target(target: MergeOperationTarget) {
		return this.into(target);
	}

	on(...fields: string[]) {
		return this.id(UniqueMergedId.ofIdFIelds(...fields));
	}

	id(id: UniqueMergedId) {
		this._id = id;
		return this;
	}

	let(lets: Let) {
		this.lets = lets;
		return this;
	}

	exposeVariablesOf(lets: Let) {
		return this.let(lets);
	}

	whenMatched<T, R extends WhenDocumentMatch<T>>(whenMatched: R) {
		this._whenMatched = whenMatched;
		return this;
	}

	whenDocumentsMatchApply(aggregation: Aggregation) {
		return this.whenMatched(WhenDocumentMatch.updateWith(aggregation));
	}

	whenNotMatched(whenNotMatched: WhenDocumentsDontMatch) {
		this._whenNotMatched = whenNotMatched;
		return this;
	}

	build() {
		return new MergeOperation(
			new MergeOperationTarget(this.db, this.collection!),
			this._id,
			this.lets,
			this._whenMatched,
			this._whenNotMatched
		);
	}
}
