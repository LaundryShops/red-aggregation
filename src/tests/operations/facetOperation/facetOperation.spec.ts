import { FacetOperation } from '../../../operations/facetOperation/facetOperation';
import { FacetOperationBuilder } from '../../../operations/facetOperation/facetOperationBuilder';
import { Facets } from '../../../operations/facetOperation/facets';
import { NoOpAggregationOperationContext } from '../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext';
import { AggregateOperation } from '../../../aggregateOperation';
import { Document } from 'mongodb';

class RecordingOperation extends AggregateOperation {
	constructor(private readonly doc: Document) {
		super();
	}

	toDocument(): Document {
		return this.doc;
	}

	getOperator(): string {
		return Object.keys(this.doc)[0] ?? '$noop';
	}
}

describe('FacetOperation $facet operator', () => {
	let context: NoOpAggregationOperationContext;

	beforeEach(() => {
		context = new NoOpAggregationOperationContext();
	});

	it('should render empty facet', () => {
		const document = FacetOperation.EMPTY.toDocument(context);

		expect(document).toEqual({
			$facet: {},
		});
	});

	it('should build facet with single pipeline via builder', () => {
		const stage = new RecordingOperation({ $match: { status: 'ACTIVE' } });
		const operation = FacetOperation.EMPTY.and(stage).as('activeOrders');

		const document = operation.toDocument(context);

		expect(document).toEqual({
			$facet: {
				activeOrders: [{ $match: { status: 'ACTIVE' } }],
			},
		});

		const fields = operation.getFields();
		expect(fields.getField('activeOrders')).not.toBeNull();
	});

	it('should accumulate multiple facets', () => {
		const matchStage = new RecordingOperation({ $match: { status: 'ACTIVE' } });
		const sortStage = new RecordingOperation({ $sort: { createdAt: -1 } });

		const operation = FacetOperation.EMPTY.and(matchStage).as('active').and(sortStage).as('recent');

		const document = operation.toDocument(context);

		expect(document).toEqual({
			$facet: {
				active: [{ $match: { status: 'ACTIVE' } }],
				recent: [{ $sort: { createdAt: -1 } }],
			},
		});
	});

	it('should support starting from existing facets', () => {
		const stage = new RecordingOperation({ $count: 'total' });
		const facets = Facets.EMPTY.and('counts', [stage]);

		const operation = FacetOperation.newFacet(facets);
		const document = operation.toDocument(context);

		expect(document).toEqual({
			$facet: {
				counts: [{ $count: 'total' }],
			},
		});
	});
});
