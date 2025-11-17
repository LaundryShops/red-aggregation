import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { StringUtils } from '../../utils/string';

export class MergeOperationTarget {
	private readonly db: string | null;
	private readonly collection: string;

	constructor(db: string | null, collection: string) {
		Assert.hasText(collection, 'Collection must not be null or empty');

		this.db = db;
		this.collection = collection;
	}

    get _db() {
        return this.db;
    }

    get _collection() {
        return this.collection;
    }

	static collection(collection: string) {
		return new MergeOperationTarget(null, collection);
	}

	inDatabase(db: string) {
		return new MergeOperationTarget(db, this.collection);
	}

	isTargetingSameDatabase() {
		return !StringUtils.hasText(this.db);
	}

	toDocument(_context: AggregationOperationContext) {
		if (this.isTargetingSameDatabase()) {
			return { into: this.collection };
		}

		return {
			into: {
				db: this.db as string,
				coll: this.collection,
			},
		};
	}
}
