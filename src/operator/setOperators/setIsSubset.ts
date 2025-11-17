import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class SetIsSubset extends AbstractOperatorExpression {
	private constructor(value: any) {
		super(value);
	}

	static arrayAsSet(arrayReference: string): SetIsSubset;
	static arrayAsSet(expression: AggregationExpression): SetIsSubset;
	static arrayAsSet(expression: Record<string, any>): SetIsSubset;
	static arrayAsSet(expression: unknown) {
		Assert.notNull(expression, 'Expression must not be null');

		if (typeof expression === 'string') {
			return new SetIsSubset(this.asFields(expression));
		}

		return new SetIsSubset([expression]);
	}

	isSubsetOf(...arrayReference: string[]): SetIsSubset;
	isSubsetOf(...arrayExpression: AggregationExpression[]): SetIsSubset;
	isSubsetOf(...arrayExpression: Record<string, any>[]): SetIsSubset;
	isSubsetOf(...expressions: unknown[]) {
		Assert.notNull(expressions, 'Expressions must not be null');
		if (expressions.some((elm) => typeof elm === 'string')) {
			const fields = SetIsSubset.asFields(...(expressions as string[]));
			return new SetIsSubset(this.append(fields));
		}

		return new SetIsSubset(this.append([...expressions]));
	}

	protected getMongoMethod(): string {
		return '$setIsSubset';
	}
}
