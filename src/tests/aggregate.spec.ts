import { Aggregation } from '../aggregation';
import { AggregateOptions } from '../aggregateOptions';
import { Fields } from '../aggregate/field';
import { ProjectionOperation } from '../operations/projectionOperation';
import { SkipOperation } from '../operations/skipOperation';
import { LimitOperation } from '../operations/limitOperation';
import { SortOperation } from '../operations/sortOperation';
import { Sort } from '../domain/sort';
import { Direction } from '../domain/order';
import { AggregationPipeline } from '../aggregationPipeline';
import { AggregationOperationRenderer } from '../aggregate/aggregateOperationContext/aggregateOperationRenderer';
import { NoOpAggregationOperationContext } from '../aggregate/aggregateOperationContext/noOpAggregationOperationContext';

describe('Aggregation', () => {
	let context: NoOpAggregationOperationContext;

	beforeEach(() => {
		context = new NoOpAggregationOperationContext();
	});

	it('builds aggregate options command fragment', () => {
		const builder = Aggregation.newAggregationOptions();
		const options = builder
			.allowDickUse(true)
			.cursorBatchSize(25)
			.explain(true)
			.build();

		const command = options.applyAndReturnPotentiallyChangedCommand({
			aggregate: 'orders',
			pipeline: [],
		});

		expect(command).toMatchObject({
			aggregate: 'orders',
			pipeline: [],
			allowDiskUse: true,
			explain: true,
			cursor: { batchSize: 25 },
		});
	});

	it('creates aggregation from varargs operations', () => {
		const project = new ProjectionOperation(Fields.fields('name'));
		const skip = new SkipOperation(5);

		const aggregation = Aggregation.newAggregation(project, skip);
		const pipelineDocs = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			context
		);

		expect(aggregation.getPipeline()).toBeInstanceOf(AggregationPipeline);
		expect(pipelineDocs).toEqual([
			[{ $project: { name: 1 } }],
			[{ $skip: 5 }],
		]);
	});

	it('creates aggregation from an array of operations', () => {
		const limit = new LimitOperation(3);
		const sort = new SortOperation(Sort.by(Direction.DESC, 'createdAt'));

		const aggregation = Aggregation.newAggregation([limit, sort]);
		const pipelineDocs = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			context
		);

		expect(pipelineDocs).toEqual([
			[{ $limit: 3 }],
			[{ $sort: { createdAt: -1 } }],
		]);
	});

	it('serializes aggregation command for a collection', () => {
		const projection = new ProjectionOperation(Fields.fields('price'));
		const aggregation = Aggregation.newAggregation(projection);

		const pipelineDocs = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			context
		);
		const command = aggregation.toDocument('products', context);

		expect(pipelineDocs).toEqual([[{ $project: { price: 1 } }]]);
		expect(command).toEqual({
			aggregate: 'products',
			pipeline: pipelineDocs,
		});
	});
});

