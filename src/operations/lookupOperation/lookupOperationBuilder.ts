import { LookupOperation } from './lookupOperation';
import { AggregationPipeline } from '../../aggregationPipeline';
import { ExpressionVariable, Let } from '../../operator/variableOperators/let';
import { AggregateOperation } from '../../aggregateOperation';
import { AsBuilder, ForeignFieldBuilder, FromBuilder, LocalFieldBuilder, PipelineBuilder } from './types';
import { Field, Fields } from '../../aggregate/field';
import { ExposedField } from '../../aggregate/field/exposeField';
import { Assert } from '../../utils';

export class LookupOperationBuilder implements AsBuilder, FromBuilder, ForeignFieldBuilder, LocalFieldBuilder {
	private _from: string | null = null;
	private _localField: Field | null = null;
	private _foreignField: Field | null = null;
	private _as: ExposedField | null = null;
	private _let: Let | null = null;
	private _pipeline: AggregationPipeline | null = null;

	as(field: string): LookupOperation {
		Assert.hasText(field, 'As must not be null or empty');
		Assert.notNull(this.from, 'From must be set first');

		this._as = new ExposedField(Fields.field(field), true);
		return new LookupOperation(this._from as string, this._localField, this._foreignField, this._let, this._pipeline, this._as);
	}

	pipeline(pipeline: AggregationPipeline): AsBuilder;
	pipeline(...stages: AggregateOperation[]): AsBuilder;
	pipeline(pipeline: AggregateOperation | AggregationPipeline, ...rest: AggregateOperation[]): AsBuilder {
		if (pipeline instanceof AggregationPipeline) {
			this._pipeline = pipeline;
		} else {
			return this.pipeline(AggregationPipeline.of(pipeline, ...rest));
		}

		return this;
	}

	let(lets: Let): PipelineBuilder;
	let(...variables: ExpressionVariable[]): PipelineBuilder;
	let(lets: Let | ExpressionVariable, ...rest: ExpressionVariable[]): PipelineBuilder {
		if (lets instanceof Let) {
			this._let = lets;
		} else {
			Assert.notNull(lets, 'ExpressionVariable must not be null');
			return this.let(Let.just(lets, ...rest))
		}

		return this;
	}

	localField(field: string): ForeignFieldBuilder {
		Assert.hasText(field, 'LocalField must not be null');

		this._localField = Fields.field(field);
		return this;
	}

	foreignField(field: string): AsBuilder {
		Assert.hasText(field, 'ForeignField must not be null');

		this._foreignField = Fields.field(field);
		return this;
	}

	from(field: string): LocalFieldBuilder {
		Assert.hasText(field, 'From must not be null');

		this._from = field;
		return this;
	}
}
