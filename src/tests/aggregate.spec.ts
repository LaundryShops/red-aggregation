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
import { TypeBasedAggregationOperationContext } from '../aggregate/aggregateOperationContext/typeBasedAggregationOperationContext';

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

	it('adds stages to the pipeline using addPipeline with a single operation', () => {
		const project = new ProjectionOperation(Fields.fields('name'));
		const skip = new SkipOperation(5);

		const aggregation = Aggregation.newAggregation(project);
		aggregation.addPipeline(skip);

		const pipelineDocs = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			context
		);

		expect(pipelineDocs).toEqual([
			[{ $project: { name: 1 } }],
			[{ $skip: 5 }],
		]);
	});

	it('adds stages to the pipeline using addPipeline with an array of operations', () => {
		const project = new ProjectionOperation(Fields.fields('name'));
		const skip = new SkipOperation(5);
		const limit = new LimitOperation(3);

		const aggregation = Aggregation.newAggregation(project);
		aggregation.addPipeline([skip, limit]);

		const pipelineDocs = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			context
		);

		expect(pipelineDocs).toEqual([
			[{ $project: { name: 1 } }],
			[{ $skip: 5 }],
			[{ $limit: 3 }],
		]);
	});

	it('creates pipeline documents using the provided context via toPipeline', () => {
		const project = new ProjectionOperation(Fields.fields('price'));
		const skip = new SkipOperation(2);

		const aggregation = Aggregation.newAggregation(project, skip);

		const pipelineViaMethod = aggregation.toPipeline(context);
		const pipelineViaRenderer = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			context
		);

		expect(pipelineViaMethod).toEqual(pipelineViaRenderer);
	});

	it('creates pipeline documents using the default context when none is provided', () => {
		const project = new ProjectionOperation(Fields.fields('price'));
		const aggregation = Aggregation.newAggregation(project);

		const pipelineViaDefaultContext = aggregation.toPipeline();
		const pipelineViaExplicitContext = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			new TypeBasedAggregationOperationContext()
		);

		expect(pipelineViaDefaultContext).toEqual(pipelineViaExplicitContext);
	});

	it('applies aggregate options when building command in toDocument', () => {
		const projection = new ProjectionOperation(Fields.fields('price'));
		const aggregation = Aggregation.newAggregation(projection);

		const pipelineDocs = AggregationOperationRenderer.toDocument(
			Array.from(aggregation.getPipeline().getOperations()),
			context
		);

		// truy cập options nội bộ của Aggregation để kiểm tra việc gọi
		// applyAndReturnPotentiallyChangedCommand
		const internalAggregation: any = aggregation;
		const options = internalAggregation.options as AggregateOptions;

		const spy = jest
			.spyOn(options, 'applyAndReturnPotentiallyChangedCommand')
			.mockImplementation((cmd) => ({
				...cmd,
				customOptionApplied: true,
			}));

		const command = aggregation.toDocument('products', context);

		expect(spy).toHaveBeenCalledWith({
			aggregate: 'products',
			pipeline: pipelineDocs,
		});
		expect(command).toEqual({
			aggregate: 'products',
			pipeline: pipelineDocs,
			customOptionApplied: true,
		});
	});
});

