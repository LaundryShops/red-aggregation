import { Document } from 'mongodb';
import { AggregationOperationContext } from '../../aggregate/aggregateOperationContext/aggregationOperationContext';
import { AbstractProjection } from './abstractProjection';
import { Field, Fields } from '../../aggregate/field';
import { ExposedField } from '../../aggregate/field/exposeField';
import { Assert } from '../../utils';
import { SystemVariablesImpl } from '../../systemVariables';

export class FieldProjection extends AbstractProjection {
	private readonly _field!: Field;
	private readonly value: null | any;

	static from(fields: Fields): AbstractProjection[];
	static from(fields: Fields, value: any | null): FieldProjection[];
	static from(fields: Fields, value?: any | null) {
		Assert.notNull(fields, 'Fields must not be null');

		if (value === undefined) {
			return this.from(fields, null);
		}

		const projections: FieldProjection[] = [];
		for (const field of fields) {
			projections.push(new FieldProjection(field, value));
		}

		return projections;
	}

	constructor(name: string, value: any);
	constructor(field: Field, value: any | null);
	constructor(name: string | Field, value: any) {
		if (name instanceof Field) {
			super(new ExposedField(name.getName(), true));
			this._field = name;
			this.value = value;
			return;
		}

		return new FieldProjection(Fields.field(name), value);
	}

	isExcluded() {
		return this.value === 0 || this.value === false;
	}

	toDocument(context: AggregationOperationContext): Document {
		return {
			[this._field.getName()]: this.renderFieldValue(context),
		};
	}

	private renderFieldValue(context: AggregationOperationContext): any {
		if (this.value === null || this.value) {
			if (SystemVariablesImpl.isReferingToSystemVariable(this._field.getTarget())) {
				return this._field.getTarget();
			}

			return context.getReference(this._field).getReferenceValue();
		} else if (!this.value) {
			return 0;
		}

		return this.value;
	}
}
