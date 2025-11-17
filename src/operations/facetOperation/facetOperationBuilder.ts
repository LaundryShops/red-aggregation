import { FacetOperation } from './facetOperation';
import { AggregateOperation } from '../../aggregateOperation';
import { Assert } from '../../utils';
import { Facets } from './facets';

export class FacetOperationBuilder {
	private readonly current: Facets;
	private readonly operations: AggregateOperation[];

	constructor(current: Facets, operations: AggregateOperation[]) {
		this.current = current;
		this.operations = operations;
	}

	as(fieldName: string) {
		Assert.hasText(fieldName, 'FieldName must not be null or empty');
		return FacetOperation.newFacet(this.current.and(fieldName, this.operations));
	}
}
