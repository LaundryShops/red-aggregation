import { Document } from 'mongodb';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { FieldsExposingAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { ExposedField } from '../../aggregate/field/exposeField';

export class CountOperation extends FieldsExposingAggregationOperation {
	readonly fieldName: string;

	constructor(fieldName: string) {
		super();
		Assert.hasText(fieldName, 'Field name must not be null');
		this.fieldName = fieldName;
	}

	getFields(): ExposedFields {
		return ExposedFields.from(new ExposedField(this.fieldName, true));
	}

	toDocument(context: AggregationOperationContext): Document {
		const operator = this.getOperator();
		return { [operator]: this.fieldName };
	}

	getOperator(): string {
		return '$count';
	}
}

export class CountOperationBuilder {
	as(fieldName: string) {
		return new CountOperation(fieldName);
	}
}
