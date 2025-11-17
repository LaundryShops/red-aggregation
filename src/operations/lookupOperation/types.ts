import { LookupOperation } from './lookupOperation';
import { AggregationPipeline } from '../../aggregationPipeline';
import { ExpressionVariable, Let } from '../../operator/variableOperators/let';
import { AggregateOperation } from '../../aggregateOperation';

export interface PipelineBuilder extends LetBuilder {
	pipeline(pipeline: AggregationPipeline): AsBuilder;
	pipeline(...stages: AggregateOperation[]): AsBuilder;

	as(field: string): LookupOperation;
}

export interface LetBuilder {
	let(lets: Let): PipelineBuilder;
	let(...variables: ExpressionVariable[]): PipelineBuilder;
}

export interface AsBuilder extends PipelineBuilder {
	as(field: string): LookupOperation;
}

export interface ForeignFieldBuilder {
	foreignField(field: string): AsBuilder;
}

export interface LocalFieldBuilder extends PipelineBuilder {
	localField(field: string): ForeignFieldBuilder;
}

export interface FromBuilder {
	from(field: string): LocalFieldBuilder;
}
