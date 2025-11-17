import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { ReplacementContributor } from './types';
import { ExposedField } from '../../aggregate/field/exposeField';
import { Field } from '../../aggregate/field';
import { Assert } from '../../utils';

export abstract class FieldContributorSupport implements ReplacementContributor {
	private readonly field: ExposedField;

	constructor(field: Field) {
		Assert.notNull(field, 'Field must not be null');
		this.field = new ExposedField(field, true);
	}

    abstract toDocument(context: AggregationOperationContext): Document

    public getField() {
        return this.field;
    }
}
