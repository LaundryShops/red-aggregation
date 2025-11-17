import { Document } from 'mongodb';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { Facet } from './facet';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AggregateOperation } from '../../aggregateOperation';
import { Assert } from '../../utils';
import { ExposedField } from '../../aggregate/field/exposeField';

export class Facets {
	static readonly EMPTY = new Facets([]);

	private facets: Facet[];

	constructor(facets: Facet[]) {
		this.facets = facets;
	}

	and(fieldName: string, operations: AggregateOperation[]) {
		Assert.hasText(fieldName, 'FieldName must not be null or empty');
		Assert.notNull(operations, 'AggregationOperations must not be null');

		const facets = [...this.facets];
		facets.push(new Facet(new ExposedField(fieldName, true), operations));
        
        return new Facets(facets);
	}

	asExposedFields() {
		let fields = ExposedFields.from();
		for (const facet of this.facets) {
			fields = fields.and(facet.getExposedField());
		}

		return fields;
	}

	toDocument(context: AggregationOperationContext) {
		const doc: Document = {};

		for (const facet of this.facets) {
			doc[facet.getExposedField().getName()] = facet.toDocuments(context);
		}

		return doc;
	}
}
