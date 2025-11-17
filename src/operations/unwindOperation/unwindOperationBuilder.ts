import { UnwindOperation } from '.';
import { Field, Fields } from '../../aggregate/field';
import { Assert } from '../../utils';

interface EmptyArraysBuilder {
	preserveNullAndEmptyArrays(): UnwindOperation;
	skipNullAndEmptyArrays(): UnwindOperation;
}

interface IndexBuilder {
	arrayIndex(field: string): EmptyArraysBuilder;
	noArrayIndex(): EmptyArraysBuilder;
}

interface PathBuilder {
	path(path: string): IndexBuilder;
}

export class UnwindOperationBuilder
	implements PathBuilder, IndexBuilder, EmptyArraysBuilder
{
	private _field: Field | null = null;
	private _arrayIndex: Field | null = null;

	private constructor() {}

	static newBuilder() {
		return new UnwindOperationBuilder();
	}

	arrayIndex(field: string): EmptyArraysBuilder {
		Assert.hasText(field, 'ArrayIndex must not be null or empty');

		this._arrayIndex = Fields.field(field);
		return this;
	}

	noArrayIndex(): EmptyArraysBuilder {
		this._arrayIndex = null;
		return this;
	}

	preserveNullAndEmptyArrays(): UnwindOperation {
        Assert.notNull(this._field, 'Path needs to be set first');

		if(this._arrayIndex !== null) {
            return new UnwindOperation(this._field!, this._arrayIndex, true)
        }

        return new UnwindOperation(this._field!, true)
	}

	skipNullAndEmptyArrays(): UnwindOperation {
		Assert.notNull(this._field, 'Path needs to be set first');

		if (this._arrayIndex !== null) {
			return new UnwindOperation(this._field!, this._arrayIndex, false);
		}

		return new UnwindOperation(this._field!, false);
	}

	path(path: string): IndexBuilder {
		Assert.hasText(path, 'Path must not be null');

		this._field = Fields.field(path);
		return this;
	}
}
