import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AggregationExpression } from '../../aggregationExpression';
import { Keyword } from './enum';
import { Assert, isMongoDocument } from '../../utils';
import { ExposedField } from '../../aggregate/field/exposeField';
import { SystemVariablesImpl } from '../../systemVariables';
import { AggregateOperation } from '../../aggregateOperation';
import { GroupOperationBuilder } from './groupOperatorBuilder';

export class Operation extends AggregateOperation {
	private readonly op: Keyword | null = null;
	private readonly key: string | null = null;
	private readonly reference: string | null = null;
	private readonly value: any | null;

	constructor(expression: AggregationExpression);
	constructor(
		op: Keyword | null,
		key: string | null,
		reference: string | null,
		value: any | null
	);
	constructor(
		opOrExpression: AggregationExpression | Keyword | null,
		key?: string | null,
		reference?: string | null,
		value?: any | null
	) {
		super();
		if (opOrExpression instanceof AggregationExpression) {
			// new Operation(null, null, null, opOrExpression);
			this.op = null;
			this.key = null;
			this.reference = null;
			this.value = opOrExpression;
			return;
		}
		this.op = opOrExpression;
		this.key = key ?? null;
		this.reference = reference ?? null;
		this.value = value;
	}

	withAlias(key: string) {
		return new Operation(this.op, key, this.reference, this.value);
	}

	asField() {
		Assert.notNull(this.key, 'Key must be set first');

		return new ExposedField(this.key!, true);
	}

	toDocument(context: AggregationOperationContext): Document {
		const value: Record<string, any> = this.getValue(context);
		if (this.op === null && isMongoDocument(value)) {
			return {
				[this.key!]: value,
			};
		}

		Assert.notNull(this.op, 'Operation keyword must be set');
		const op = this.op?.toString()!;
		const key = this.key!;
		return {
			[key]: { [op]: value },
		};
	}

	getValue(context: AggregationOperationContext) {
		if (this.reference === null) {
			if (this.value instanceof AggregationExpression) {
				return this.value.toDocument(context);
			}

			return this.value;
		}

		if (SystemVariablesImpl.isReferingToSystemVariable(this.reference)) {
			return this.reference;
		}

		return context.getReference(this.reference).toString();
	}

	toString() {
		return `Operation op:${this.op} key:${this.key} reference=${this.reference} value=${this.value}`;
	}

	getOperator(): string {
		return ''
	}
}
