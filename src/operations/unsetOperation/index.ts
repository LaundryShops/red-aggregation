import { Document } from 'mongodb';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { InheritsFieldsAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Assert } from '../../utils';
import { Field } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';

export class UnsetOperation extends InheritsFieldsAggregationOperation {
	private readonly fields: any[];

	constructor(fields: any[]) {
		Assert.notNull(fields, 'Fields must not be null');
		Assert.noNullElements(fields, 'Fields must not contain null values');

		super();
		this.fields = fields;
	}

	static unset(...fields: string[]) {
		return new UnsetOperation([...fields]);
	}

	and(...fields: string[]): UnsetOperation;
	and(...fields: Field[]): UnsetOperation;
	and(...fields: Array<Field | string>) {
		const target = [...this.fields, ...fields];
		return new UnsetOperation(target);
	}

	getFields(): ExposedFields {
		return ExposedFields.from();
	}

	removedFieldNames() {
		const fieldNames = [];
		for (const it of this.fields) {
			if (it instanceof Field) {
				fieldNames.push(it.getName());
			} else {
				fieldNames.push(`${it}`);
			}
		}

		return fieldNames;
	}

	toDocument(context: AggregationOperationContext): Document {
		if (this.fields.length === 1) {
			return {
				[this.getOperator()]: this.computeFieldName(this.fields[0], context),
			};
		}

		return {
			[this.getOperator()]: this.fields.map((field) => this.computeFieldName(field, context)),
		};
	}

	getOperator(): string {
		return '$unset';
	}

	private computeFieldName<T>(field: T, context: AggregationOperationContext) {
		if (field instanceof Field) {
			return context.getReference(field).getRaw();
		}

		if (field instanceof AggregationExpression) {
			return field.toDocument(context);
		}

		if (typeof field === 'string') {
			return context.getReference(field).getRaw();
		}

		return field;
	}
}
