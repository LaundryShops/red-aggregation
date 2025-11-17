import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { FieldsExposingAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { Facets } from './facets';
import { AggregateOperation } from '../../aggregateOperation';
import { Assert } from '../../utils';
import { FacetOperationBuilder } from './facetOperationBuilder';

export class FacetOperation extends FieldsExposingAggregationOperation {
	static readonly EMPTY = new FacetOperation();
	static newFacet(facets: Facets) {
		return new FacetOperation(facets);
	}

	private readonly facets: Facets;

	private constructor(facets?: Facets) {
		super();
		this.facets = facets ?? Facets.EMPTY;
	}

	and(...operations: AggregateOperation[]) {
		Assert.notNull(operations, 'AggregationOperations must not be null');
		Assert.notEmpty(operations, 'AggregationOperations must not be empty');

		return new FacetOperationBuilder(this.facets, [...operations]);
	}

	getFields(): ExposedFields {
		return this.facets.asExposedFields();
	}

	toDocument(context: AggregationOperationContext): Document {
		return {
			[this.getOperator()]: this.facets.toDocument(context),
		};
	}

	getOperator(): string {
		return '$facet';
	}
}
