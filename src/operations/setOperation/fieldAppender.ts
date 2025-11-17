import { Fields } from '../../aggregate/field';
import { SetOperation } from './setOperation';

export interface ValueAppender {
	toValue<T>(value: T | null): SetOperation;
	toValueOf<T>(value: T): SetOperation;
}

export class FieldAppender {
	private readonly valueMap: Map<any, any>;

	constructor();
	constructor(source: Map<any, any>);
	constructor(source?: Map<any, any>) {
		if (source === undefined) {
			this.valueMap = new Map();
			return;
		}
		this.valueMap = source;
	}

	set(field: string): ValueAppender {
		const self = this;
		const build = () => this.build();

		return new (class implements ValueAppender {
			toValue<T>(value: T | null): SetOperation {
				self.valueMap.set(field, value);
				return build();
			}

			toValueOf<T>(value: T): SetOperation {
				self.valueMap.set(field, typeof value === 'string' ? Fields.field(value) : value);
				return build();
			}
		})();
	}

	private build() {
		return new SetOperation(this.valueMap);
	}
}
