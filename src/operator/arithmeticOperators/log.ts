import { Fields } from '../../aggregate/field';
import { Assert } from '../../utils';
import { AbstractOperatorExpression } from '../abstractOperatorExpression';

export class Log extends AbstractOperatorExpression {
	static valueOf(number: number): Log;
	static valueOf(fieldReference: string): Log;
	static valueOf(expression: Record<string, any>): Log;
	static valueOf(input: unknown) {
		if (typeof input === 'string') {
			return new Log(Fields.field(input));
		}
		return new Log(input);
	}

	private constructor(input: unknown) {
		Assert.notNull(input, 'FieldReference must not be null');
		super(input);
	}

	protected override getMongoMethod(): string {
		return '$log';
	}

	log(fieldReference: string): Log;
	log(number: number): Log;
	log(expression: Record<string, any>): Log;
	log(base: unknown) {
		if (typeof base === 'string') {
			this.append(Fields.field(base));
		} else {
			this.append(base);
		}
		return this;
	}
}
