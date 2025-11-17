import { Document } from 'mongodb';
import { ExposedFields } from './aggregate/field/exposeFields';
import { InheritsFieldsAggregationOperation } from './aggregate/field/fieldExposingAggregationOperation';
import { AggregationOperationContext } from './aggregate/aggregateOperationContext/aggregationOperationContext';
import { Field, Fields } from './aggregate/field';
import { ExposedField } from './aggregate/field/exposeField';
import { AggregationExpression } from './aggregationExpression';

export abstract class DocumentEnhancingOperation extends InheritsFieldsAggregationOperation {
	private readonly valueMap: Map<any, any> = new Map();
	private exposedFields = ExposedFields.empty();

	protected abstract mongoOperator(): string;

	protected constructor(source: Map<any, any>) {
		super();
		this.valueMap = source;
		for (const key of source.keys()) {
			this.exposedFields = this.add(key);
		}
	}

	protected getValueMap() {
		return this.valueMap;
	}

	getFields(): ExposedFields {
		return this.exposedFields;
	}

	toDocument(context: AggregationOperationContext): Document {
		const operationContext: AggregationOperationContext =
			context.inheritAndExpose(this.exposedFields);
		const mongoOperator = this.mongoOperator();

		if (this.valueMap.size === 1) {
			const iterator = this.valueMap.entries();
			const values = DocumentEnhancingOperation.toSetEntry(iterator.next().value!, operationContext)
			return context.getMappedObject({
				[mongoOperator]: values,
			});
		}

		const $set: Document = {};
		const entries = Array.from(this.valueMap.entries());
		const documents = entries.map((entry) =>
			DocumentEnhancingOperation.toSetEntry(entry, operationContext)
		);
		documents.forEach((doc) => {
			Object.assign($set, doc);
		});

		return context.getMappedObject({ [mongoOperator]: $set });
	}

	private static toSetEntry(
		entry: [any, any],
		context: AggregationOperationContext
	): Document {
		const field =
			typeof entry[0] === 'string'
				? context.getReference(entry[0]).getRaw()
				: context.getReference(entry[0] as Field).getRaw();

		const value = this.computeValue(entry[1], context);

		return { [field]: value };
	}

	getOperator(): string {
		return this.mongoOperator();
	}

	private static computeValue<T>(
		value: T,
		context: AggregationOperationContext
	) {
		if (value === null) {
			return value;
		}

		if (value instanceof Field) {
			return context.getReference(value).toString();
		}

		if (value instanceof AggregationExpression) {
			return value.toDocument(context);
		}

		if (Array.isArray(value)) {
			const result: any[] = value.map((elm) =>
				this.computeValue(elm, context)
			);
			return result;
		}

		return value;
	}

	private add<T>(fieldValue: T) {
		if (fieldValue instanceof Field) {
			return this.exposedFields.and(new ExposedField(fieldValue, true));
		}

		if (typeof fieldValue === 'string') {
			return this.exposedFields.and(
				new ExposedField(Fields.field(fieldValue), true)
			);
		}

		throw new Error(`Expected ${fieldValue} to be a field/property`);
	}
}
