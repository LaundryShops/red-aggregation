import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AbstractProjection } from './abstractProjection';
import { Field, Fields } from '../../aggregate/field';
import { Assert } from '../../utils';
import { ExposedField } from '../../aggregate/field/exposeField';
import { AggregateField } from '../../aggregate/field/aggregateField';
import { AggregationExpression } from '../../aggregationExpression';

export class OperationProjection extends AbstractProjection {
	private readonly _field: Field;
	private readonly operation: string;
	private readonly values: any[];

	constructor(field: Field, operation: string, values: any[]) {
		super(field);

		Assert.hasText(operation, 'Operation must not be null or empty');
		Assert.notNull(values, 'Values must not be null');

		this._field = field;
		this.operation = operation;
		this.values = [...values];
	}

	toDocument(context: AggregationOperationContext): Document {
		const inner = {
			[`$${this.operation}`]: this.getOperationArguments(context),
		};
		return { [this.getField().getName()]: inner };
	}

	protected getOperationArguments(context: AggregationOperationContext) {
		const result: any[] = [context.getReference(this.getField()).toString()];

		for (const elm of this.values) {
			if (elm instanceof Field) {
				result.push(context.getReference(elm).toString());
			} else if (elm instanceof Fields) {
				for (const field of elm) {
					result.push(context.getReference(field).toString());
				}
			} else if (elm instanceof AggregationExpression) {
				result.push(elm.toDocument(context));
			} else {
				result.push(elm);
			}
		}

		return result;
	}

	protected getField() {
		return this._field;
	}

	getExposedField() {
		if (this.getField().isAliased()) {
			return super.getExposedField();
		}

		return new ExposedField(new AggregateField(this.getField().getName()), true);
	}

	withAlias(alias: string): OperationProjection {
		const aliasedField = Fields.field(alias, this._field.getName());
		const operation = this.operation;
		const valuesCopy = [...this.values];
		const self = this;

		const originalArgs = (context: AggregationOperationContext) => this.getOperationArguments(context);

		return new (class extends OperationProjection {
			getField(): Field {
				return aliasedField;
			}

			protected override getOperationArguments(context: AggregationOperationContext): any[] {
				// reuse the arguments from the original projection we’re replacing
				return originalArgs(context);
			}
		})(aliasedField, operation, valuesCopy);
	}
}
