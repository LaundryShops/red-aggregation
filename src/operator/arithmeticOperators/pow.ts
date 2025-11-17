import { Field, Fields } from '../../aggregate/field';
import { AggregationExpression } from '../../aggregationExpression';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class Pow extends AbstractOperatorExpression {
	static valueOf(fieldReference: string): Pow;
	static valueOf(number: number): Pow;
	static valueOf(expression: Record<string, any>): Pow;
	static valueOf(input: unknown) {
		if (typeof input === 'string') {
			return new Pow(this.asFields(input) as Field[]);
		}
		return new Pow([input]);
	}

	private constructor(input: any[]) {
		Assert.notNull(input, 'FieldReference must not be null');
		super(input);
	}

	protected override getMongoMethod(): string {
		return '$pow';
	}

	pow(fieldReference: string): Pow;
	pow(number: number): Pow;
	pow(expression: AggregationExpression): Pow;
	pow(expression: Record<string, any>): Pow;
	pow(base: unknown) {
		return new Pow(this.append(base));
	}
}
