import { Document } from 'mongodb';
import { Aggregation } from './aggregation';
import { ArrayFilter, UpdateDefinition } from './updateDefinition';
import { AggregateOperation } from './aggregateOperation';
import { FieldsExposingAggregationOperation } from './aggregate/field/fieldExposingAggregationOperation';
import { UnsetOperation } from './operations/unsetOperation';
import { Assert } from './utils';
import { Fields } from './aggregate/field';
import { SetOperation } from './operations/setOperation';
import { ReplaceWithOperation } from './operations/replaceWithOperation';

export class AggregationUpdate extends Aggregation implements UpdateDefinition {
	private isolated: boolean = false;
	private readonly keysTouched: Set<string> = new Set();

	protected constructor();
	protected constructor(pipeline: AggregateOperation[]);
	protected constructor(pipeline?: AggregateOperation[]) {
		if (!pipeline) {
			return new AggregationUpdate([]);
		}

		super(pipeline);
		for (const operation of pipeline) {
			if (operation instanceof FieldsExposingAggregationOperation) {
				for (const field of operation.getFields()) {
					this.keysTouched.add(field.getName());
				}
			}
		}
	}

	static update() {
		return new AggregationUpdate();
	}

	static from(pipeline: AggregateOperation[]) {
		return new AggregationUpdate(pipeline);
	}

	set(setOperation: SetOperation) {
		Assert.notNull(setOperation, 'SetOperation must not be null');

		for (const field of setOperation.getFields()) {
			this.keysTouched.add(field.getName());
		}

		this.pipeline.add(setOperation);
		return this;
	}

	isIsolated(): boolean {
		return this.isolated;
	}

	getUpdateObject(): Document {
		return {
			'': this.toPipeline(Aggregation.DEFAULT_CONTEXT),
		};
	}

	modifies(key: string): boolean {
		return this.keysTouched.has(key);
	}

	inc(key: string): UpdateDefinition {
		throw new Error('Method not implemented.');
	}

	getArrayFilters(): ArrayFilter[] {
		return [];
	}

	hasArrayFilters(): boolean {
		return this.getArrayFilters().length > 0;
	}

	unset(...keys: string[]): AggregationUpdate;
	unset(unsetOperation: UnsetOperation): AggregationUpdate;
	unset(unsetOperation: UnsetOperation | string) {
		Assert.notNull(unsetOperation, 'Unset operation must not be null');

		if (typeof unsetOperation === 'string') {
			const fields = [];
			for (const field of arguments) {
				fields.push(Fields.field(field));
			}
			return this.unset(new UnsetOperation(fields));
		}

		this.pipeline.add(unsetOperation);
		for (const fieldName of unsetOperation.removedFieldNames()) {
			this.keysTouched.add(fieldName);
		}

		return this;
	}

	replaceWith(replaceWithOperation: ReplaceWithOperation): AggregationUpdate;
	replaceWith<T>(value: T): AggregationUpdate;
	replaceWith<T>(value: T | ReplaceWithOperation) {
		Assert.notNull(value, 'Value must not be null');
		if (value instanceof ReplaceWithOperation) {
			this.pipeline.add(value);
			return this;
		}
		return this.replaceWith(ReplaceWithOperation.replaceWithValue(value));
	}
}
