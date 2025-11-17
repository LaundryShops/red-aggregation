import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { FieldContributorSupport } from './abstractFieldContributorSupport';
import { Field } from '../../aggregate/field';
import { Assert } from '../../utils';

export class ValueFieldContributor extends FieldContributorSupport {
	private readonly value: any;

	constructor(field: Field, value: any) {
		super(field);
		Assert.notNull(value, 'Value must not be null');
		this.value = value;
	}

	toDocument(context: AggregationOperationContext): Document {
		const doc: Document = { $set: this.value };

		return {
			[this.getField().getTarget()]: context.getMappedObject(doc)['$set'],
		};
	}
}
