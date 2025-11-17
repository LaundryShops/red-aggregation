import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';

export class WhenDocumentsDontMatch {
	private readonly value: string;

	private constructor(value: string) {
		Assert.notNull(value, 'Value must not be null');
		this.value = value;
	}

	static whenNotMatchedOf(value: string) {
		return new WhenDocumentsDontMatch(value);
	}

	static insertNewDocument() {
		return this.whenNotMatchedOf('insert');
	}

	static discardDocument() {
		return this.whenNotMatchedOf('discard');
	}

	static failWhenNotMatch() {
		return this.whenNotMatchedOf('fail');
	}

	toDocument(context: AggregationOperationContext) {
		return { whenNotMatched: this.value };
	}
}
