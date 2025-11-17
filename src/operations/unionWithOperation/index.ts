import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AggregateOperation } from '../../aggregateOperation';
import { AggregationPipeline } from '../../aggregationPipeline';
import { Assert } from '../../utils';
import ExposedFieldsAggregationOperationContext from '../../aggregate/aggregateOperationContext/exposedFieldsAggregationOperationContext';

/**
 * <a href="https://docs.mongodb.com/master/reference/operator/aggregation/unionWith/">$unionWith</a> aggregation
 * (có từ MongoDB 4.4) thực hiện phép **union** giữa hai collection bằng cách kết hợp kết quả từ các pipeline,
 * có thể bao gồm các bản ghi trùng lặp, thành một tập kết quả duy nhất được chuyển tiếp sang stage tiếp theo. <br />
 *
 * Để loại bỏ các bản ghi trùng lặp, có thể thêm một {@link GroupOperation} ngay sau
 * {@link UnionWithOperation}. <br />
 *
 * Nếu {@link UnionWithOperation} sử dụng một
 * <a href="https://docs.mongodb.com/master/reference/operator/aggregation/unionWith/#unionwith-pipeline">pipeline</a>
 * để xử lý document, các tên field trong pipeline sẽ được giữ nguyên như khai báo.
 * Để ánh xạ tên property trong domain type sang tên field thực tế trong collection
 * (có xét đến các annotation {@link org.springframework.data.mongodb.core.mapping.Field} nếu có),
 * hãy đảm bảo aggregation bao ngoài là một {@link TypedAggregation}
 * và truyền kiểu dữ liệu đích (target type) cho stage {@code $unionWith} thông qua {@link #mapFieldsTo(Class)}.
 */
export class UnionWithOperation extends AggregateOperation {
	private readonly _collection: string;
	private readonly _pipeline: AggregationPipeline | null;

	constructor(collection: string, pipeline: AggregationPipeline | null) {
		super();
		Assert.notNull(collection, 'Collection must not be null');
		this._collection = collection;
		this._pipeline = pipeline;
	}

	static unionWith(collection: string) {
		return new UnionWithOperation(collection, null);
	}

	pipeline(pipeline: AggregationPipeline): UnionWithOperation;
	pipeline(pipeline: AggregateOperation[]): UnionWithOperation;
	pipeline(...pipeline: AggregateOperation[]): UnionWithOperation;
	pipeline(pipeline: AggregateOperation | AggregationPipeline | AggregateOperation[], ...pipelines: AggregateOperation[]) {
		if (pipeline instanceof AggregationPipeline) {
			return new UnionWithOperation(this._collection, pipeline);
		}

		if (Array.isArray(pipeline)) {
			return new UnionWithOperation(this._collection, new AggregationPipeline([...pipeline]));
		}

		return new UnionWithOperation(this._collection, new AggregationPipeline([pipeline, ...pipelines]));
	}

	toDocument(context: AggregationOperationContext): Document {
		const unionWith: Document = {};
		unionWith['coll'] = this._collection;
		if (this._pipeline === null || this._pipeline.isEmpty()) {
			return { [this.getOperator()]: unionWith };
		}

		unionWith['pipeline'] = this._pipeline.toDocuments(this.computedContext(context));

		return { [this.getOperator()]: unionWith };
	}

	getOperator(): string {
		return '$unionWith';
	}

	private computedContext(context: AggregationOperationContext): AggregationOperationContext {
		if (context instanceof ExposedFieldsAggregationOperationContext) {
			return this.computedContext(context.getRootContext());
		}

		return context;
	}
}
