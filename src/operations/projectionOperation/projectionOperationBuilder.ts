import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { Fields } from '../../aggregate/field';
import { Cond } from '../../operator/conditionalOperators/cond';
import { IfNull } from '../../operator/conditionalOperators/ifNull';
import { AbstractProjection } from './abstractProjection';
import { AbstractProjectionOperationBuilder } from './abstractProjectionOperationBuilder';
import { OperationProjection } from './operationProjection';
import { ProjectionOperation } from './projectionOperation';
import { Assert, isMongoDocument } from '../../utils';
import { FieldProjection } from './fieldProjection';
import { AggregationExpression } from '../../aggregationExpression';
import { ExpressionProjection } from './expressionOperation';
import { ExpressionVariable, Let } from '../../operator/variableOperators/let';
import { IsArray } from '../../operator/arrayOperators/isArray';
import { Concat, ToLower, ToUpper } from '../../operator/stringOperators';
import { Abs, Add, Ceil, Divide, Exp, Floor, Ln, Log, Log10, Mod, Multiply, Pow, Sqrt, Subtract, Trunc } from '../../operator/arithmeticOperators';
import { Filter } from '../../operator/arrayOperators/filter';
import { Size } from '../../operator/arrayOperators/size';
import { Cmp } from '../../operator/compareOperators/cmp';
import { Eq } from '../../operator/compareOperators/eq';
import { Gt } from '../../operator/compareOperators/gt';
import { Gte } from '../../operator/compareOperators/gte';
import { Lt } from '../../operator/compareOperators/lt';
import { Lte } from '../../operator/compareOperators/lte';
import { Ne } from '../../operator/compareOperators/ne';
import { Slice } from '../../operator/arrayOperators/slice';
import { ArrayElemAt } from '../../operator/arrayOperators/arrayElemAt';
import { ConcatArrays } from '../../operator/arrayOperators/concatArray';
import { SetEquals } from '../../operator/setOperators/setEquals';
import { SetUnion } from '../../operator/setOperators/setUnion';
import { SetIsSubset } from '../../operator/setOperators/setIsSubset';

export class ProjectionOperationBuilder extends AbstractProjectionOperationBuilder {
	static readonly NUMBER_NOT_NULL = 'Number must not be null';
	static readonly FIELD_REFERENCE_NOT_NULL = 'Field reference must not be null';

	static createPrivateProjectionOperation(value: any, operation: ProjectionOperation, prevProjection: OperationProjection | null) {
		return new ProjectionOperationBuilder(value, operation, prevProjection);
	}

	private readonly name: string | null;
	private prevProjection: OperationProjection | null;

	constructor(name: string, operation: ProjectionOperation, prevProjection: OperationProjection | null) {
		super(name, operation);

		if (typeof name === 'string') {
			this.name = name;
		} else {
			this.name = null;
		}

		this.prevProjection = prevProjection;
	}

	previousOperation() {
		return this.operation.andExclude(Fields.UNDERSCORE_ID).and(new PreviousOperationProjection(this.getRequiredName()));
	}

	nested(fields: Fields): ProjectionOperation {
		return this.operation.and(new NestedFieldProjection(this.getRequiredName(), fields));
	}

	as(alias: string) {
		if (this.prevProjection !== null) {
			return this.operation.andReplaceLastOneWith(this.prevProjection.withAlias(alias));
		}

		if (this.value instanceof AggregationExpression) {
			return this.operation.and(new ExpressionProjection(Fields.field(alias, alias), this.value));
		}

		if (isMongoDocument(this.value)) {
			return this.operation.and(new ExpressionProjection(Fields.field(alias, alias), this.value));
		}

		return this.operation.and(new FieldProjection(Fields.field(alias, this.getRequiredName()), null));
	}

	applyCondition(cond: Cond): ProjectionOperation;
	applyCondition(ifNull: IfNull): ProjectionOperation;
	applyCondition(input: Cond | IfNull): ProjectionOperation {
		Assert.notNull(input, 'ConditionalOperator | IfNullOperator must not be null');

		return this.operation.and(new ExpressionProjection(Fields.field(this.getRequiredName()), input));
	}

	plus(num: number): ProjectionOperationBuilder;
	plus(fieldReference: string): ProjectionOperationBuilder;
	plus(expression: AggregationExpression): ProjectionOperationBuilder;
	plus(expression: Document): ProjectionOperationBuilder;
	plus(input: unknown) {
		return this.operation.and(Add.valueOf(this.getRequiredName()).add(input as number));
	}

	minus(num: number): ProjectionOperationBuilder;
	minus(fieldReference: string): ProjectionOperationBuilder;
	minus(expression: AggregationExpression): ProjectionOperationBuilder;
	minus(expression: Document): ProjectionOperationBuilder;
	minus(input: unknown) {
		return this.operation.and(Subtract.valueOf(this.getRequiredName()).subtract(input as number));
	}

	multiply(num: number): ProjectionOperationBuilder;
	multiply(fieldReference: string): ProjectionOperationBuilder;
	multiply(expression: AggregationExpression): ProjectionOperationBuilder;
	multiply(expression: Document): ProjectionOperationBuilder;
	multiply(input: unknown) {
		return this.operation.and(Multiply.valueOf(this.getRequiredName()).multiplyBy(input as number));
		// if (typeof input === 'string') {
		// 	return this.project('multiply', Fields.field(input));
		// }

		// return this.project('multiply', input);
	}

	divide(num: number): ProjectionOperationBuilder;
	divide(fieldReference: string): ProjectionOperationBuilder;
	divide(expression: AggregationExpression): ProjectionOperationBuilder;
	divide(expression: Document): ProjectionOperationBuilder;
	divide(input: unknown) {
		return this.operation.and(Divide.valueOf(this.getRequiredName()).divideBy(input as number));
		// if (typeof input === 'string') {
		// 	return this.project('divide', Fields.field(input));
		// }

		// return this.project('divide', input);
	}

	mod(num: number): ProjectionOperationBuilder;
	mod(fieldReference: string): ProjectionOperationBuilder;
	mod(expression: AggregationExpression): ProjectionOperationBuilder;
	mod(expression: Document): ProjectionOperationBuilder;
	mod(input: unknown) {
		return this.operation.and(Mod.valueOf(this.getRequiredName()).mod(input as number));
	}

	size() {
		return this.operation.and(Size.lengthOfArray([Fields.field(this.getRequiredName())]));
	}

	cmp(field: string): ProjectionOperationBuilder;
	cmp(expression: AggregationExpression): ProjectionOperationBuilder;
	cmp(expression: Record<string, any>): ProjectionOperationBuilder;
	cmp(compareValue: unknown) {
		return this.operation.and(Cmp.valueOf(this.getRequiredName()).compareToValue(compareValue as string));
	}

	eq(compareValue: any) {
		return this.operation.and(Eq.valueOf(this.getRequiredName()).equalToValue(compareValue));
	}

	gt(compareValue: any) {
		return this.operation.and(Gt.valueOf(this.getRequiredName()).greaterThanValue(compareValue));
	}

	gte(compareValue: any) {
		return this.operation.and(Gte.valueOf(this.getRequiredName()).greaterThanEqualToValue(compareValue));
	}

	lt(compareValue: any) {
		return this.operation.and(Lt.valueOf(this.getRequiredName()).lessThanValue(compareValue));
	}

	lte(compareValue: any) {
		return this.operation.and(Lte.valueOf(this.getRequiredName()).lessThanEqualToValue(compareValue));
	}

	ne(compareValue: any) {
		return this.operation.and(Ne.valueOf(this.getRequiredName()).notEqualToValue(compareValue));
	}

	slice(count: number): ProjectionOperationBuilder;
	slice(count: number, offset: number): ProjectionOperationBuilder;
	slice(count: number, offset?: number) {
		if (offset === undefined) {
			return this.operation.and(Slice.sliceArrayOf(this.getRequiredName()).itemCount(count));
		}

		return this.operation.and(Slice.sliceArrayOf(this.getRequiredName()).offset(offset).itemCount(count));
	}

	filter(as: string, condition: AggregationExpression) {
		return this.operation.and(Filter.filter(this.getRequiredName()).as(as).by(condition));
	}

	equalsArrays(...arrays: string[]) {
		Assert.notEmpty(arrays, 'Array must not be null or empty');
		return this.operation.and(SetEquals.arrayAsSet(this.getRequiredName()).isEqualTo(...arrays));
	}

	intersectsArrays(...arrays: string[]) {
		Assert.notEmpty(arrays, 'Array must not be null or empty');
		return this.project('setIntersection', Fields.fields(...arrays));
	}

	unionArrays(...arrays: string[]) {
		Assert.notEmpty(arrays, 'Array must not be null or empty');
		return this.operation.and(SetUnion.arrayAsSet(this.getRequiredName()).union(...arrays));
	}

	differenceToArrays(array: string) {
		Assert.notEmpty(array, 'Array must not be null or empty');
		return this.project('setDifference', Fields.fields(array));
	}

	subsetOfArray(array: string) {
		return this.operation.and(SetIsSubset.arrayAsSet(this.getRequiredName()).isSubsetOf(array));
	}

	// anyElementInArrayTrue() {}

	// allElementsInArrayTrue() {}

	absoluteValue() {
		return this.operation.and(Abs.valueOf(this.getRequiredName()));
	}

	ceil() {
		return this.operation.and(Ceil.valueOf(this.getRequiredName()));
	}

	exp() {
		return this.operation.and(Exp.valueOf(this.getRequiredName()));
	}

	floor() {
		return this.operation.and(Floor.valueOf(this.getRequiredName()));
	}

	ln() {
		return this.operation.and(Ln.valueOf(this.getRequiredName()));
	}

	log(base: any) {
		return this.operation.and(Log.valueOf(this.getRequiredName()).log(base));
	}

	log10() {
		return this.operation.and(Log10.valueOf(this.getRequiredName()));
	}

	pow(fieldReference: string): ProjectionOperationBuilder;
	pow(number: number): ProjectionOperationBuilder;
	pow(expression: Document): ProjectionOperationBuilder;
	pow(value: string | number | Document) {
		return this.operation.and(Pow.valueOf(this.getRequiredName()).pow(value as string));
	}

	sqrt() {
		return this.operation.and(Sqrt.valueOf(this.getRequiredName()));
	}

	trunc() {
		return this.operation.and(Trunc.valueOf(this.getRequiredName()));
	}

	concat(...values: any[]) {
		let concat = Concat.valueOf(this.getRequiredName());
		for (const value of values) {
			concat = concat.concat(value);
		}
		return this.operation.and(concat);
	}

	substring(start: number): ProjectionOperationBuilder;
	substring(start: number, length: number): ProjectionOperationBuilder;
	substring(start: number, length?: number) {
		if (length === undefined) {
			return this.substring(start, -1);
		}

		return this.project('substr', start, length);
	}

	toLower() {
		return this.operation.and(ToLower.valueOf(this.getRequiredName()));
	}

	toUpper(): ProjectionOperationBuilder {
		return this.operation.and(ToUpper.valueOf(this.getRequiredName()));
	}

	arrayElementAt(position: number): ProjectionOperationBuilder {
		return this.operation.and(ArrayElemAt.arrayOf(this.getRequiredName()).elementAt(position));
	}

	concatArrays(...fields: string[]): ProjectionOperationBuilder {
		let concatArray = ConcatArrays.arrayOf(this.getRequiredName());
		for (const field of fields) {
			concatArray = concatArray.concat(field);
		}
		return this.operation.and(concatArray);
	}

	isArray(): ProjectionOperationBuilder {
		return this.operation.and(IsArray.isArray(this.getRequiredName()));
	}

	lets(valueExpression: AggregationExpression, variableName: string, _in: AggregationExpression): ProjectionOperationBuilder;
	lets(variables: ExpressionVariable[], _in: AggregationExpression): ProjectionOperationBuilder;
	lets(variables: ExpressionVariable[] | AggregationExpression, variableName: string | AggregationExpression | Document, _in?: AggregationExpression) {
		if (variables instanceof AggregationExpression && typeof variableName === 'string' && _in !== undefined) {
			const valueExpression = variables;
			const vars = ExpressionVariable.newVariable(variableName).forExpression(valueExpression);
			return this.operation.and(Let.define(vars).andApply(_in));
		}

		const __in = variableName as AggregationExpression;
		return this.operation.and(Let.define(variables as ExpressionVariable[]).andApply(__in));
	}

	private getRequiredName(): string {
		Assert.state(this.name != null, 'Projection field name must not be null');

		return this.name!;
	}

	toDocument(context: AggregationOperationContext) {
		return this.operation.toDocument(context);
	}

	project(operation: string, ...values: any[]) {
		const operationProjection = new OperationProjection(Fields.field(this.value), operation, values);
		return new ProjectionOperationBuilder(this.value, this.operation.and(operationProjection), operationProjection);
	}
}

class NestedFieldProjection extends AbstractProjection {
	private readonly name: string;
	private readonly fields: Fields;

	constructor(name: string, fields: Fields) {
		super(Fields.field(name));
		this.name = name;
		this.fields = fields;
	}

	toDocument(context: AggregationOperationContext): Document {
		const nestedObj: Document = {};

		for (const field of this.fields) {
			nestedObj[field.getName()] = context.getReference(field.getTarget()).toString();
		}

		return {
			[this.name]: nestedObj,
		};
	}
}

class PreviousOperationProjection extends AbstractProjection {
	private readonly name: string;

	constructor(name: string) {
		super(Fields.field(name));

		this.name = name;
	}

	toDocument(context: AggregationOperationContext): Document {
		return {
			[this.name]: Fields.UNDERSCORE_ID_REF,
		};
	}
}
