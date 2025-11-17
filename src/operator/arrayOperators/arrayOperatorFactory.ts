import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { ArrayElemAt } from './arrayElemAt';
import { ConcatArrays } from './concatArray';
import { Filter } from './filter';
import { First } from './first';
import { IndexOfArray } from './indexOfArray';
import { IsArray } from './isArray';
import { Last } from './last';
import { Reduce } from './reduce';
import { ReverseArray } from './reverseArray';
import { Size } from './size';
import { Slice } from './slice';

export interface ReduceInitialValueBuilder {
	startingWith(value: any): Reduce;
}

export class ArrayOperatorFactory {
	private readonly fieldReference: string | null;
	private readonly aggregationExpression: AggregationExpression | null;
	private readonly values: any[] | null;

	constructor(field: string);
	constructor(expression: AggregationExpression);
	constructor(expression: Record<string, any>);
	constructor(values: any[]);
	constructor(input: unknown) {
		Assert.notNull(input, 'Input must not be null');

		if (typeof input === 'string') {
			this.fieldReference = input;
			this.aggregationExpression = null;
			this.values = null;
		} else if (input instanceof AggregationExpression) {
			this.fieldReference = null;
			this.aggregationExpression = input;
			this.values = null;
		} else if (Array.isArray(input)) {
			this.fieldReference = null;
			this.aggregationExpression = null;
			this.values = input;
		} else if (typeof input === 'object') {
			this.fieldReference = null;
			this.aggregationExpression = null;
			this.values = [input];
		} else {
			throw new Error(`Unsupported input type: ${typeof input}`);
		}
	}

	last() {
		if (this.usesFieldReference()) {
			return Last.lastOf(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return Last.lastOf(
				this.aggregationExpression as AggregationExpression
			);
		}

		return Last.lastOf(this.values as any[]);
	}

	first() {
		if (this.usesFieldReference()) {
			return First.firstOf(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return First.firstOf(
				this.aggregationExpression as AggregationExpression
			);
		}

		return First.firstOf(this.values as any[]);
	}

	reduce(expression: AggregationExpression): ReduceInitialValueBuilder;
	reduce(expression: Record<string, any>): ReduceInitialValueBuilder;
	reduce(...expression: AggregationExpression[]): ReduceInitialValueBuilder;
	reduce(...expression: Record<string, any>[]): ReduceInitialValueBuilder;
	reduce(...expression: unknown[]) {
		const isUsedWithFieldRef = this.usesFieldReference();
		const field = this.fieldReference;
		const expr = this.aggregationExpression;

		return {
			startingWith: (initialValue: any) => {
				return (
					isUsedWithFieldRef
						? Reduce.arrayOf(field as string)
						: Reduce.arrayOf(expr!)
				)
					.withInitialValue(initialValue)
					.reduce(expression);
			},
		};
	}

	reverse() {
		if (this.usesFieldReference()) {
			return ReverseArray.reverseArrayOf(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return ReverseArray.reverseArrayOf(
				this.aggregationExpression as AggregationExpression
			);
		}

		return ReverseArray.reverseArrayOf(this.values as any[]);
	}

	indexOf(value: any): IndexOfArray {
		if (this.usesFieldReference()) {
			return IndexOfArray.arrayOf(this.fieldReference as string).indexOf(
				value
			);
		}

		if (this.usesAggregationExpression()) {
			return IndexOfArray.arrayOf(
				this.aggregationExpression as AggregationExpression
			).indexOf(value);
		}

		return IndexOfArray.arrayOf(this.values as any[]).indexOf(value);
	}

	slice() {
		if (this.usesFieldReference()) {
			return Slice.sliceArrayOf(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return Slice.sliceArrayOf(
				this.aggregationExpression as AggregationExpression
			);
		}

		return Slice.sliceArrayOf(this.values as any[]);
	}

	size() {
		if (this.usesFieldReference()) {
			return Size.lengthOfArray(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return Size.lengthOfArray(
				this.aggregationExpression as AggregationExpression
			);
		}

		return Size.lengthOfArray(this.values as any[]);
	}

	isArray() {
		Assert.state(
			this.values === null,
			'isArray() cannot be used with raw array values'
		);
		return this.usesFieldReference()
			? IsArray.isArray(this.fieldReference as string)
			: IsArray.isArray(
					this.aggregationExpression as AggregationExpression
			  );
	}

	filter() {
		if (this.usesFieldReference()) {
			return Filter.filter(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return Filter.filter(
				this.aggregationExpression as AggregationExpression
			);
		}

		return Filter.filter(this.values as any[]);
	}

	concat(field: string): ConcatArrays;
	concat(expression: AggregationExpression): ConcatArrays;
	concat(expression: Record<string, any>): ConcatArrays;
	concat(input: unknown): ConcatArrays {
		Assert.notNull(input, 'Input must not be null');
		return this.createConcatArray().concat(input as any);
	}

	private createConcatArray() {
		if (this.usesFieldReference()) {
			return ConcatArrays.arrayOf(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return ConcatArrays.arrayOf(
				this.aggregationExpression as AggregationExpression
			);
		}

		return ConcatArrays.arrayOf(this.values as any[]);
	}

	elementAt(expression: AggregationExpression): ArrayElemAt;
	elementAt(expression: Record<string, any>): ArrayElemAt;
	elementAt(position: number): ArrayElemAt;
	elementAt(field: string): ArrayElemAt;
	elementAt(input: unknown) {
		Assert.notNull(input, 'Input must not be null');
		return this.createElementAt().elementAt(input as any);
	}

	private createElementAt() {
		if (this.usesFieldReference()) {
			return ArrayElemAt.arrayOf(this.fieldReference as string);
		}

		if (this.usesAggregationExpression()) {
			return ArrayElemAt.arrayOf(
				this.aggregationExpression as AggregationExpression
			);
		}

		return ArrayElemAt.arrayOf(this.values as any[]);
	}

	private usesFieldReference(): boolean {
		return this.fieldReference !== null;
	}

	private usesAggregationExpression(): boolean {
		return this.aggregationExpression !== null;
	}
}
