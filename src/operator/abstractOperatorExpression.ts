import { Document } from 'mongodb';
import { Assert } from '../utils';
import { AggregationExpression } from '../aggregationExpression';
import { Field, Fields } from '../aggregate/field';
import { SystemVariables, SystemVariablesImpl } from '../systemVariables';
import { AggregationOperationContext } from '../aggregate/aggregateOperationContext/aggregationOperationContext';

export enum Expand {
	EXPAND_VALUES = 'EXPAND_VALUES',
	KEEP_SOURCE = 'KEEP_SOURCE',
}

export abstract class AbstractOperatorExpression extends AggregationExpression {
	private value: any;

	constructor(value: any) {
		super();
		this.value = value;
	}

	protected abstract getMongoMethod(): string;

	toDocument(context: AggregationOperationContext): Document;
	toDocument(context: AggregationOperationContext, value: any): Document;
	toDocument(context: AggregationOperationContext, _value?: any): Document {
		if (!_value) {
			_value = this.value;
		}

		const mongoMethod = this.getMongoMethod();
		return {
			[`${mongoMethod}`]: this.unpack(_value, context),
		};
	}

	protected static asFields(...fields: string[]) {
		if (fields.length === 0) {
			return [];
		}
		return Fields.fields(...fields).asList();
	}

	private unpack(_value: Field, context: AggregationOperationContext): string;
	private unpack(_value: AggregationExpression, context: AggregationOperationContext): Document;
	private unpack(_value: SystemVariables, context: AggregationOperationContext): Document;
	private unpack(_value: Map<any, any>, context: AggregationOperationContext): Document;
	private unpack(_value: Array<any>, context: AggregationOperationContext): Document;
	private unpack(_value: string, context: AggregationOperationContext): string;
	private unpack<T>(_value: T, context: AggregationOperationContext): Document | string {
		if (_value instanceof AggregationExpression) {
			return _value.toDocument(context);
		}

		if (_value instanceof Field) {
			return context.getReference(_value).toString();
		}

		if (_value instanceof Fields) {
			const mapped = [];
			for (const field of _value) {
				mapped.push(this.unpack(field, context));
			}
			return mapped;
		}

		if (Array.isArray(_value)) {
			const sourceList = _value;
			const mappedList = [];

			for (const o of sourceList) {
				const unpacked = this.unpack(o, context);
				mappedList.push(unpacked);
			}
			return mappedList;
		}

		if (_value instanceof Map) {
			const targetDocument: Document = {};
			const sourceMap = _value;

			for (const [key, value] of sourceMap.entries()) {
				targetDocument[key] = this.unpack(value, context);
			}
			return targetDocument;
		}

		if (this.isSystemVariable(_value as SystemVariables)) {
			const systemVariables = new SystemVariablesImpl(_value as SystemVariables);
			return systemVariables.toString();
		}

		return _value as string;
	}

	private isSystemVariable(name: SystemVariables): boolean {
		return Object.values(SystemVariables).includes(name as SystemVariables);
	}

	protected values() {
		if (Array.isArray(this.value)) {
			return this.value;
		}
		if (this.value instanceof Map) {
			return Array.from(this.value.entries());
		}
		return [this.value];
	}

	get<T>(key: any): T;
	get<T>(index: number): T;
	get(key: any) {
		if (typeof key === 'number') {
			this.findWithIndex(key);
		}

		Assert.isInstanceOf(Map, this.value, 'Values must be a type of Map');

		return this.value.get(key) ?? null;
	}

	private findWithIndex(index: number) {
		const values = this.values();

		return values[index] || undefined;
	}

	protected append<T = object>(value: T): Array<T>;
	protected append<T = object>(value: T, expandList: Expand): Array<T>;
	protected append<T = string | number | object>(key: string, value: T): Map<string, T>;
	protected append<T>(keyOrValue: unknown, value?: Expand | object): any {
		if (arguments.length === 1) {
			return this.append(keyOrValue, Expand.EXPAND_VALUES);
		}
		
		if ([Expand.EXPAND_VALUES, Expand.KEEP_SOURCE].includes(value as Expand)) {
			const _value = keyOrValue;
			const expandList = value;
			if (Array.isArray(this.value)) {
				const clone = [...this.value];

				if (Array.isArray(_value) && expandList === Expand.EXPAND_VALUES) {
					clone.push(..._value);
				} else {
					clone.push(keyOrValue as any);
				}
				this.value = clone;
				return clone;
			}
			if (Array.isArray(_value)) {
				this.value = [this.value, ...(_value as any)];
			} else {
				this.value = [this.value, _value as any];
			}
			return this.value;
		}

		return this._append(this.value as Map<string, T>, keyOrValue as string, value as any);
	}

	protected appendTo(key: string, value: any) {
		Assert.isInstanceOf(Map, this.value, 'Value must be a type of Map');

		if (this.value instanceof Map) {
			const target = new Map<string, any>(this.value as Map<string, any>);
			if (!target.has(key)) {
				target.set(key, value);
				return target;
			}

			if (target.has(key)) {
				const v = target.get(key);

				if (Array.isArray(v)) {
					const targetList = [...v];
					targetList.push(value);
					target.set(key, targetList);
				} else {
					target.set(key, [v, value]);
				}
			}
			return target;
		}
		throw new Error(`Cannot append value ${key}:${value}`);
	}

	private _append<T = object>(exiting: Map<string, T>, key: string, value: T) {
		const clone = new Map<string, T>(exiting);
		clone.set(key, value);
		return clone;
	}

	protected argumentMap(): ReadonlyMap<string, any> {
		Assert.isInstanceOf(Map, this.value, 'Value must be a type of Map');
		return new Map(this.value) as ReadonlyMap<string, any>;
	}

	protected contains(key: any): boolean {
		if (!(this.value instanceof Map)) {
			return false;
		}

		return (this.value as Map<string, any>).has(key);
	}
}
