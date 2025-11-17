import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';

export class UniqueMergedId {
	private static readonly ID = new UniqueMergedId([]);

	private readonly uniqueIdentifier: string[];

	private constructor(uniqueIdentifier: string[]) {
		this.uniqueIdentifier = uniqueIdentifier;
	}

	static ofIdFIelds(...fields: string[]) {
		if (fields.length === 0) {
			return this.id();
		}

		return new UniqueMergedId([...fields]);
	}

	static id() {
		return this.ID;
	}

	isJustIdField() {
		return this.equals(UniqueMergedId.ID);
	}

	toDocument(context: AggregationOperationContext): Document {
		const mappedOn: string[] = this.uniqueIdentifier
			.map((identifier) => context.getReference(identifier))
			.map((elm) => elm.getRaw());

		return { on: mappedOn.length === 1 ? mappedOn[0] : mappedOn };
	}

	private equals(uniqueIdInstance: UniqueMergedId) {
		if (this === uniqueIdInstance) {
			return true;
		}

		if (!uniqueIdInstance) {
			return false;
		}

		const { uniqueIdentifier } = uniqueIdInstance;
		if (this.uniqueIdentifier.length !== uniqueIdentifier.length) {
			return false;
		}

		return this.uniqueIdentifier.every(
			(field, index) => field === uniqueIdentifier[index]
		);
	}
}
