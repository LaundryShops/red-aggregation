import { Document } from 'mongodb';
import { ExposedFields } from '../../aggregate/field/exposeFields';
import { FieldsExposingAggregationOperation } from '../../aggregate/field/fieldExposingAggregationOperation';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Operation } from './operation';
import { Fields } from '../../aggregate/field';
import { Assert } from '../../utils';
import { GroupOps, Keyword } from './enum';
import { AggregationExpression } from '../../aggregationExpression';
import { GroupOperationBuilder } from './groupOperatorBuilder';
import { ExposedField } from '../../aggregate/field/exposeField';

export class GroupOperation extends FieldsExposingAggregationOperation {
	private readonly idFields: ExposedFields;
	private readonly operations: Operation[];

	constructor(groupOperation: GroupOperation);
	constructor(groupOperation: Fields);
	constructor(groupOperation: GroupOperation, nextOperations: Operation[]);
	constructor(fields: Fields | GroupOperation, operations: Operation[] = []) {
		super();
		if (fields instanceof Fields) {
			this.idFields = ExposedFields.nonSynthetic(fields);
			this.operations = [];
			return
		}

		if (fields instanceof GroupOperation && operations === undefined) {
			this.idFields = fields.idFields;
			this.operations = ([] as Operation[]).concat(fields.operations);
			return;
		}

		Assert.notNull(fields, 'GroupOperation must not be null');
		Assert.notNull(operations, 'NextOperations must not be null');

		this.idFields = fields.idFields;
		this.operations = ([] as Operation[]).concat(fields.operations);
		if (operations.length) {
			this.operations = this.operations.concat(operations);
		}
		return;
	}

	sum(reference: string): GroupOperationBuilder;
	sum(expression: AggregationExpression): GroupOperationBuilder;
	sum(expression: Record<string, any>): GroupOperationBuilder;
	sum(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.SUM, expression, null);
		}

		return this.newBuilder(GroupOps.SUM, null, expression);
	}

	stdDevSamp(reference: string): GroupOperationBuilder;
	stdDevSamp(expression: AggregationExpression): GroupOperationBuilder;
	stdDevSamp(expression: Record<string, any>): GroupOperationBuilder;
	stdDevSamp(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.STD_DEV_SAMP, expression, null);
		}

		return this.newBuilder(GroupOps.STD_DEV_SAMP, null, expression);
	}

	stdDevPop(reference: string): GroupOperationBuilder;
	stdDevPop(expression: AggregationExpression): GroupOperationBuilder;
	stdDevPop(expression: Record<string, any>): GroupOperationBuilder;
	stdDevPop(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.STD_DEV_POP, expression, null);
		}

		return this.newBuilder(GroupOps.STD_DEV_POP, null, expression);
	}

	push(reference: string): GroupOperationBuilder;
	push(expression: AggregationExpression): GroupOperationBuilder;
	push(expression: Record<string, any>): GroupOperationBuilder;
	push(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.PUSH, expression, null);
		}

		return this.newBuilder(GroupOps.PUSH, null, expression);
	}

	min(reference: string): GroupOperationBuilder;
	min(expression: AggregationExpression): GroupOperationBuilder;
	min(expression: Record<string, any>): GroupOperationBuilder;
	min(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.MIN, expression, null);
		}

		return this.newBuilder(GroupOps.MIN, null, expression);
	}

	max(reference: string): GroupOperationBuilder;
	max(expression: AggregationExpression): GroupOperationBuilder;
	max(expression: Record<string, any>): GroupOperationBuilder;
	max(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.MAX, expression, null);
		}

		return this.newBuilder(GroupOps.MAX, null, expression);
	}

	last(reference: string): GroupOperationBuilder;
	last(expression: AggregationExpression): GroupOperationBuilder;
	last(expression: Record<string, any>): GroupOperationBuilder;
	last(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.LAST, expression, null);
		}

		return this.newBuilder(GroupOps.LAST, null, expression);
	}

	first(reference: string): GroupOperationBuilder;
	first(expression: AggregationExpression): GroupOperationBuilder;
	first(expression: Record<string, any>): GroupOperationBuilder;
	first(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.FIRST, expression, null);
		}

		return this.newBuilder(GroupOps.FIRST, null, expression);
	}

	count(): GroupOperationBuilder {
		return this.newBuilder(GroupOps.SUM, null, 1);
	}

	avg(reference: string): GroupOperationBuilder;
	avg(expression: AggregationExpression): GroupOperationBuilder;
	avg(expression: Record<string, any>): GroupOperationBuilder;
	avg(expression: unknown) {
		if (typeof expression === 'string') {
			return this.newBuilder(GroupOps.AVG, expression, null);
		}

		return this.newBuilder(GroupOps.AVG, null, expression);
	}

	addToSet(reference: string): GroupOperationBuilder;
	addToSet(value: any): GroupOperationBuilder;
	addToSet(input: unknown) {
		if (typeof input === 'string') {
			return this.newBuilder(GroupOps.ADD_TO_SET, input, null);
		}

		return this.newBuilder(GroupOps.ADD_TO_SET, null, input);
	}

	and(operation: Operation): GroupOperation;
	and(fieldName: string, expression: AggregationExpression): GroupOperation;
	and(opOrFieldName: string | Operation, expression?: AggregationExpression) {
		if (opOrFieldName instanceof Operation) {
			return new GroupOperation(this, [opOrFieldName]);
		}

		return new GroupOperationBuilder(this, new Operation(expression!)).as(
			opOrFieldName
		);
	}

	private newBuilder(
		keyword: Keyword,
		reference: string | null,
		value: any | null
	) {
		return new GroupOperationBuilder(
			this,
			new Operation(keyword, null, reference, value)
		);
	}

	getFields(): ExposedFields {
		let fields: ExposedFields = this.idFields.and(
			new ExposedField(Fields.UNDERSCORE_ID, true)
		);

		for (const operation of this.operations) {
			fields = fields.and(operation.asField());
		}

		return fields;
	}

	toDocument(context: AggregationOperationContext): Document {
		const operationObject: Document = {};

		if (this.idFields.exposesNoNonSyntheticFields()) {
			operationObject[Fields.UNDERSCORE_ID] = null;
		} else if (this.idFields.exposesSingleNonSyntheticFieldOnly()) {
			const reference = context.getReference(
				this.idFields.iterator().next().value
			);
			operationObject[Fields.UNDERSCORE_ID] = reference.toString();
		} else {
			const inner: Document = {};

			for (const field of this.idFields) {
				const reference = context.getReference(field);
				inner[field.getName()] = reference.toString();
			}

			operationObject[Fields.UNDERSCORE_ID] = inner;
		}

		for (const operation of this.operations) {
			Object.assign(operationObject, operation.toDocument(context));
		}
		const op = this.getOperator();
		return { [op]: operationObject };
	}

	getOperator(): string {
		return '$group';
	}
}
