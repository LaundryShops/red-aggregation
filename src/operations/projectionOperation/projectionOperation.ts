import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { FieldsExposingAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { Field, Fields } from '../../aggregate/field';
import { AbstractProjection } from './abstractProjection';
import { Assert } from '../../utils';
import { ProjectionOperationBuilder } from './projectionOperationBuilder';
import { FieldProjection } from './fieldProjection';
import { ArrayProjection, ArrayProjectionBuilder } from './arrayProjection';
import { AggregationExpression } from '../../aggregationExpression';

export class ProjectionOperation extends FieldsExposingAggregationOperation {
	static NONE = [];
	static EXCLUSION_ERROR = 'Mixing inclusion and exclusion in projection is not allowed.';

	private readonly _projections!: any[];

	constructor();
	constructor(fields: Fields);
	constructor(current: AbstractProjection[], projections: AbstractProjection[]);
	constructor(fields?: Fields | AbstractProjection[], projections?: AbstractProjection[]) {
		super();

		if (fields === undefined && projections === undefined) {
			return new ProjectionOperation(ProjectionOperation.NONE, ProjectionOperation.NONE);
		}
		if (fields instanceof Fields) {
			return new ProjectionOperation(ProjectionOperation.NONE, FieldProjection.from(fields));
		}

		Assert.notNull(fields, 'Current projections must not be null');
		Assert.notNull(projections, 'Projections must not be null');

		this._projections = [];
		this._projections = this._projections.concat(...(fields as AbstractProjection[]));
		this._projections = this._projections.concat(...(projections as AbstractProjection[]));
	}

	get projections() {
		return this._projections;
	}

	/**
	 * !!!DOT NOT USE AS PUBIC METHOD!!!
	 * Private method, used by builder
	 */
	andReplaceLastOneWith(projection: AbstractProjection) {
		const projections = this.projections.length === 0 ? [] : this.projections.slice(0, this.projections.length - 1);

		return new ProjectionOperation(projections, [projection]);
	}

	and(name: string): ProjectionOperationBuilder;
	and(projection: AbstractProjection): ProjectionOperation;
	and(expression: AggregationExpression): ProjectionOperationBuilder;
	and(expression: Document): ProjectionOperationBuilder;
	and(input: string | AbstractProjection | AggregationExpression | Document) {
		if (input instanceof AbstractProjection) {
			return new ProjectionOperation(this.projections, [input]);
		}

		if (typeof input === 'string') {
			return new ProjectionOperationBuilder(input, this, null);
		}

		return ProjectionOperationBuilder.createPrivateProjectionOperation(input, this, null);
	}

	andExclude(fields: Fields): ProjectionOperation;
	andExclude(...fields: string[]): ProjectionOperation;
	andExclude(field: Fields | string, ...fields: string[]) {
		if (field instanceof Fields) {
			return new ProjectionOperation(this.projections, FieldProjection.from(field, false));
		}

		const projections = FieldProjection.from(Fields.fields(field, ...fields), false);
		return new ProjectionOperation(this.projections, projections);
	}

	andInclude(fields: Fields): ProjectionOperation;
	andInclude(...fields: string[]): ProjectionOperation;
	andInclude(field: Fields | string, ...fields: string[]) {
		if (field instanceof Fields) {
			return new ProjectionOperation(this.projections, FieldProjection.from(field, true));
		}

		const projections = FieldProjection.from(Fields.fields(field, ...fields), true);
		return new ProjectionOperation(this.projections, projections);
	}

	asArray(name: string) {
		return new ProjectionOperation([], [new ArrayProjection(Fields.field(name), this.projections)]);
	}

	andArrayOf<T>(values: T[]) {
		const builder = new ArrayProjectionBuilder(this);

		for (const value of values) {
			if (value instanceof Field) {
				builder.and(value);
			} else if (value instanceof AggregationExpression) {
				builder.and(value);
			} else {
				builder.and(value as Document);
			}
		}

		return builder;
	}

	inheritsFields() {
		return this.projections.filter((p): p is FieldProjection => p instanceof FieldProjection).some((p) => p.isExcluded());
	}

	getFields(): ExposedFields {
		let fields = null;
		for (const projection of this.projections as AbstractProjection[]) {
			const field = projection.getExposedField();
			fields = fields === null ? ExposedFields.from(field) : fields.and(field);
		}

		return fields !== null ? fields : ExposedFields.empty();
	}

	toDocument(context: AggregationOperationContext): Document {
		const fieldObj: Document = {};

		for (const projection of this.projections) {
			Object.assign(fieldObj, projection.toDocument(context));
		}

		return { [this.getOperator()]: fieldObj };
	}

	getOperator(): string {
		return '$project';
	}
}
