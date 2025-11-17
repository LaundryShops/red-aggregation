import { Fields } from '../../aggregate/field';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class Multiply extends AbstractOperatorExpression {
	static valueOf(number: number): Multiply;
	static valueOf(fieldReference: string): Multiply;
	static valueOf(expression: Record<string, any>): Multiply;
	static valueOf(input: unknown) {
		if (typeof input === 'string') {
			return new Multiply(Fields.field(input));
		}
		return new Multiply(input);
	}

	private constructor(input: unknown) {
		Assert.notNull(input, 'FieldReference must not be null');
		super(input);
	}

	protected getMongoMethod(): string {
		return '$multiply';
	}

	multiplyBy(number: number): Multiply;
	multiplyBy(fieldReference: string): Multiply;
	multiplyBy(expression: Record<string, any>): Multiply;
	multiplyBy(input: number | string | Record<string, any>) {
		if (typeof input === 'string') {
			this.append(Fields.field(input));
		} else {
			this.append(input);
		}
		return this;
	}
}
