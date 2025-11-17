import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { SetEquals } from './setEquals';
import { SetIsSubset } from './setIsSubset';
import { SetUnion } from './setUnion';

export class SetOperatorFactory {
	private readonly fieldReference: string | null;
	private readonly expression: AggregationExpression | null;

	constructor(fieldReference: string);
	constructor(expression: AggregationExpression);
	constructor(expression: Record<string, any>);
	constructor(expression: unknown) {
		Assert.notNull(expression, 'Expression must not be null');

		if (typeof expression === 'string') {
			this.fieldReference = expression;
			this.expression = null;
			return;
		}

		this.fieldReference = null;
		this.expression = expression as AggregationExpression;
	}

	isSubsetOf(...arrayFieldReferences: string[]): SetIsSubset;
	isSubsetOf(...expression: AggregationExpression[]): SetIsSubset;
	isSubsetOf(...expression: Record<string, any>[]): SetIsSubset;
	isSubsetOf(...expression: unknown[]) {
		return this.createSetIsSubset().isSubsetOf(...(expression as string[]));
	}

	private createSetIsSubset() {
		return this.usesFieldRef()
			? SetIsSubset.arrayAsSet(this.fieldReference!)
			: SetIsSubset.arrayAsSet(this.expression!);
	}

	union(...arrayFieldReferences: string[]): SetUnion;
	union(...expression: AggregationExpression[]): SetUnion;
	union(...expression: Record<string, any>[]): SetUnion;
	union(...expression: unknown[]) {
		return this.createUnion().union(...(expression as string[]));
	}

	private createUnion() {
		return this.usesFieldRef()
			? SetUnion.arrayAsSet(this.fieldReference!)
			: SetUnion.arrayAsSet(this.expression!);
	}

	isEqualTo(...arrayFieldReferences: string[]): SetEquals;
	isEqualTo(...expression: AggregationExpression[]): SetEquals;
	isEqualTo(...expression: Record<string, any>[]): SetEquals;
	isEqualTo(...expression: unknown[]) {
		return this.createSetIsEquals().isEqualTo(...(expression as string[]));
	}

	private createSetIsEquals() {
		return this.usesFieldRef()
			? SetEquals.arrayAsSet(this.fieldReference!)
			: SetEquals.arrayAsSet(this.expression!);
	}

	private usesFieldRef() {
		return this.fieldReference != null;
	}
}
