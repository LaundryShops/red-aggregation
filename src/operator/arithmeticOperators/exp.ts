import { Fields } from '../../aggregate/field';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class Exp extends AbstractOperatorExpression {
	static valueOf(fieldReference: string): Exp;
	static valueOf(number: number): Exp;
	static valueOf(expression: Record<string, any>): Exp;
	static valueOf(input: unknown) {
		if (typeof input === 'string') {
			return new Exp(Fields.field(input));
		}
		return new Exp(input);
	}

	private constructor(input: unknown) {
		Assert.notNull(input, 'FieldReference must not be null');
		super(input);
	}

	protected override getMongoMethod(): string {
		return '$exp';
	}
}
