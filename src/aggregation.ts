import { Document } from 'mongodb';
import { AggregationOperationRenderer } from './aggregate/aggregateOperationContext/aggregateOperationRenderer';
import { AggregationOperationContext } from './aggregate/aggregateOperationContext/aggregationOperationContext';
import { SystemVariables } from './systemVariables';
import { AggregationPipeline } from './aggregationPipeline';
import { AggregateOperation } from './aggregateOperation';
import { Assert } from './utils';
import { AggregateOptions } from './aggregateOptions';
import { AddFieldsOperation } from './operations/addFieldsOperation';
import { Field, Fields } from './aggregate/field';
import { ProjectionOperation } from './operations/projectionOperation';
import { UnwindOperation } from './operations/unwindOperation';
import { AggregationExpression } from './aggregationExpression';
import { GroupOperation } from './operations/groupOperation';
import { Sort } from './domain/sort';
import { SortOperation } from './operations/sortOperation';
import { Direction } from './domain/order';
import { SortByCountOperation } from './operations/sortByCountOperation';
import { SkipOperation } from './operations/skipOperation';
import { LimitOperation } from './operations/limitOperation';
import { MatchOperation } from './operations/matchOperation';
import { IClauseDefinition } from './query/standardDefinition';
import { MergeOperation } from './operations/mergeOperation';
import { FacetOperation, FacetOperationBuilder } from './operations/facetOperation';
import { LookupOperation, LookupOperationBuilder } from './operations/lookupOperation';
import { CountOperationBuilder } from './operations/countOperation';
import { ReplaceRootOperation } from './operations/replaceRootOperation';
import { ReplaceRootOperationBuilder } from './operations/replaceRootOperation/replaceRootOperationBuilder';
import { TypeBasedAggregationOperationContext } from './aggregate/aggregateOperationContext/typeBasedAggregationOperationContext';

export class Aggregation {
	public static readonly DEFAULT_CONTEXT = AggregationOperationRenderer.DEFAULT_CONTEXT;
	public static readonly ROOT = SystemVariables.ROOT.toString();
	public static readonly CURRENT = SystemVariables.CURRENT.toString();
	public static readonly DEFAULT_OPTIONS = this.newAggregationOptions().build();

	protected pipeline!: AggregationPipeline;
	private readonly options!: AggregateOptions;

	protected constructor(operations: AggregateOperation[]);
	protected constructor(...operations: AggregateOperation[]);
	protected constructor(operations: AggregateOperation[], options: AggregateOptions);
	protected constructor(operations: AggregateOperation | AggregateOperation[]) {
		if (!Array.isArray(operations)) {
			return new Aggregation(Aggregation.asAggregationList(...arguments));
		}

		const maybeOptions = arguments[arguments.length - 1] as AggregateOptions | undefined;
		// Chỉ nhận vào mảng operations
		if (Array.isArray(operations) && !(maybeOptions instanceof AggregateOptions)) {
			return new Aggregation(operations, Aggregation.DEFAULT_OPTIONS);
		}

		Assert.notNull(operations, 'Aggregate operations must not be null');
		Assert.notNull(maybeOptions, 'Aggregate options must not be null');

		this.pipeline = new AggregationPipeline(operations);
		this.options = maybeOptions as AggregateOptions;
	}

	protected static asAggregationList(...operations: AggregateOperation[]) {
		Assert.notEmpty(operations, 'Aggregate operation must not be null or empty');

		return [...operations];
	}

	public static newAggregationOptions() {
		return AggregateOptions.builder();
	}

	public static newAggregation(operations: AggregateOperation[]): Aggregation;
	public static newAggregation(...operations: AggregateOperation[]): Aggregation;
	public static newAggregation(operation: AggregateOperation | AggregateOperation[]) {
		if (Array.isArray(operation)) {
			return this.newAggregation(...operation);
		}

		return new Aggregation([...arguments]);
	}

	public static addFields() {
		return AddFieldsOperation.builder();
	}

	public static replaceRoot(): ReplaceRootOperationBuilder;
	public static replaceRoot(field: string): ReplaceRootOperation;
	public static replaceRoot(expression: AggregationExpression): ReplaceRootOperation;
	public static replaceRoot(expression: Document): ReplaceRootOperation;
	public static replaceRoot(field?: unknown) {
		if (field === undefined) {
			return ReplaceRootOperation.builder();
		}

		if (field instanceof AggregationExpression) {
			return ReplaceRootOperation.builder().withValueOf(field);
		}

		if (typeof field === 'string') {
			return ReplaceRootOperation.builder().withValueOf(field);
		}

		return ReplaceRootOperation.builder().withValueOf(field as Document);
	}

	public static project(...fields: string[]): ProjectionOperation;
	public static project(fields: Fields): ProjectionOperation;
	public static project(field: string | Fields) {
		if (typeof field === 'string') {
			return this.project(Fields.fields(...arguments));
		}
		return new ProjectionOperation(field);
	}

	public static unwind(field: string): UnwindOperation;
	public static unwind(field: string, preserveNullAndEmptyArrays: boolean): UnwindOperation;
	public static unwind(field: string, arrayIndex: string): UnwindOperation;
	public static unwind(field: string, arrayIndex: string, preserveNullAndEmptyArrays: boolean): UnwindOperation;
	public static unwind(field: string, arrayIndex?: string | boolean, preserveNullAndEmptyArrays?: boolean) {
		if (arrayIndex === undefined && preserveNullAndEmptyArrays === undefined) {
			return new UnwindOperation(Fields.field(field));
		}

		if (typeof arrayIndex === 'string' && typeof preserveNullAndEmptyArrays === 'boolean') {
			return new UnwindOperation(this.field(field), this.field(arrayIndex), preserveNullAndEmptyArrays);
		}

		if (typeof arrayIndex === 'string') {
			return new UnwindOperation(this.field(field), this.field(arrayIndex), false);
		}

		if (typeof arrayIndex === 'boolean') {
			const preserveNullAndEmptyArrays = arrayIndex;
			return new UnwindOperation(this.field(field), preserveNullAndEmptyArrays);
		}
	}

	public static group(fields: Fields) {
		return new GroupOperation(fields);
	}

	public static sort(sort: Sort): SortOperation;
	public static sort(direction: Direction, fields: string[]): SortOperation;
	public static sort(sort: Sort | Direction, fields?: string[]) {
		if (sort instanceof Sort) {
			return new SortOperation(sort);
		}

		const direction = sort;
		return new SortOperation(Sort.by(direction, ...(fields as string[])));
	}

	public static skip(elemToSkip: number) {
		return new SkipOperation(elemToSkip);
	}

	public static limit(maxElem: number) {
		return new LimitOperation(maxElem);
	}

	public static match(expression: AggregationExpression): MatchOperation;
	public static match(expression: IClauseDefinition): MatchOperation;
	public static match(expression: Document): MatchOperation;
	public static match(expression: AggregationExpression | IClauseDefinition | Document) {
		if (expression instanceof AggregateOperation) {
			return new MatchOperation(expression);
		}
		return new MatchOperation(expression);
	}

	public static merge() {
		return MergeOperation.builder();
	}

	public static facet(): FacetOperation;
	public static facet(...operations: AggregateOperation[]): FacetOperationBuilder;
	public static facet() {
		if (arguments.length === 0) {
			return FacetOperation.EMPTY;
		}

		return this.facet().and(...arguments);
	}

	public static lookup(): LookupOperationBuilder;
	public static lookup(from: string, localField: string, foreignField: string, _as: string): LookupOperation;
	public static lookup(from: Field, localField: Field, foreignField: Field, _as: Field): LookupOperation;
	public static lookup(from?: Field | string, localField?: Field | string, foreignField?: Field | string, _as?: Field | string) {
		if (arguments.length === 0) {
			return new LookupOperationBuilder();
		}

		if (typeof from === 'string' && typeof localField === 'string' && typeof foreignField === 'string' && typeof _as === 'string') {
			return this.lookup(this.field(from), this.field(localField), this.field(foreignField), this.field(_as));
		}

		return new LookupOperation(from as Field, localField as Field, foreignField as Field, _as as Field);
	}

	public static count() {
		return new CountOperationBuilder();
	}

	public static sortByCount(field: string): SortByCountOperation;
	public static sortByCount(expression: AggregationExpression): SortByCountOperation;
	public static sortByCount(expression: Document): SortByCountOperation;
	public static sortByCount(field: unknown) {
		if (typeof field === 'string') {
			return new SortByCountOperation(this.field(field));
		}
		return new SortByCountOperation(field as AggregateOperation);
	}

	public static field(name: string) {
		return Fields.field(name);
	}

	addPipeline(pipeline: AggregateOperation): Aggregation;
	addPipeline(pipeline: AggregateOperation[]): Aggregation
	addPipeline(pipeline: AggregateOperation | AggregateOperation[]) {
		if (Array.isArray(pipeline)) {
			this.pipeline = this.pipeline.add(pipeline)
		} else {
			this.pipeline = this.pipeline.add(pipeline)
		}

		return this;
	}

	toPipeline(rootContext?: AggregationOperationContext): Document[] {
		if (rootContext) {
			return this.pipeline.toDocuments(rootContext);
		}

		return this.toPipeline(this.createAggregationContext());
	}

	getPipeline(): Readonly<AggregationPipeline> {
		return this.pipeline;
	}

	private createAggregationContext() {
        return new TypeBasedAggregationOperationContext();
    }

	toDocument(inputCollectionName: string, rootContext: AggregationOperationContext) {
		const cmd: Document = { aggregate: inputCollectionName };
		cmd['pipeline'] = this.toPipeline(rootContext);

		return this.options.applyAndReturnPotentiallyChangedCommand(cmd);
	}
}
