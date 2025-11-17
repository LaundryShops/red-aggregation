import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class SetEquals extends AbstractOperatorExpression {
	private constructor(value: any) {
		super(value);
	}

	static arrayAsSet(arrayReference: string): SetEquals;
	static arrayAsSet(expression: AggregationExpression): SetEquals;
	static arrayAsSet(expression: Record<string, any>): SetEquals;
	static arrayAsSet(expression: unknown) {
		Assert.notNull(expression, 'Expression must not be null');

		if (typeof expression === 'string') {
			return new SetEquals(this.asFields(expression));
		}

		return new SetEquals([expression]);
	}

	isEqualTo(...arrayReference: string[]): SetEquals;
	isEqualTo(...arrayExpression: AggregationExpression[]): SetEquals;
	isEqualTo(...arrayExpression: Record<string, any>[]): SetEquals;
	isEqualTo(...expressions: unknown[]) {
		Assert.notNull(expressions, 'Expressions must not be null');
        
		if (expressions.some((elm) => typeof elm === 'string')) {
			const fields = SetEquals.asFields(...(expressions as string[]));
			return new SetEquals(this.append(fields));
		}

		return new SetEquals(this.append([...expressions]));
	}

	protected getMongoMethod(): string {
		return '$setEquals';
	}
}
