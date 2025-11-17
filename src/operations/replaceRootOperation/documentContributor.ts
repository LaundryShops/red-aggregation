import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { ReplacementContributor } from './types';
import { Assert } from '../../utils';

export class DocumentContributor implements ReplacementContributor {
	private readonly value: any;

	constructor(value: any) {
		Assert.notNull(value, 'Value must not be null');
		this.value = value;
	}

	toDocument(context: AggregationOperationContext): Document {
		const doc: Document = { $set: this.value };

        return context.getMappedObject(doc)['$set'];
	}
}
