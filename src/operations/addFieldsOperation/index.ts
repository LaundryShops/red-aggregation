import { DocumentEnhancingOperation } from '../../DocumentEnhancingOperation';
import { AddFieldsOperationBuilder, type ValueAppender } from './addFieldOperationBuilder';

export class AddFieldsOperation extends DocumentEnhancingOperation {
	private constructor(source: Map<any, any>);
	private constructor(field: any, value: any | null);
	private constructor(field: any | Map<any, any>, value?: any | null) {
		if (value === undefined) {
			super(field);
			return;
		}
		super(new Map().set(field, value));
	}

	static internalCreateAddFieldOperation(source: Map<any, any>) {
		return new AddFieldsOperation(source);
	}

	static addField(field: string): ValueAppender
	static addField(field: any, value: any): AddFieldsOperation
	static addField(field: string | any, value?: any) {
		if (typeof field === 'string' && value === undefined) {
			return new AddFieldsOperationBuilder().addField(field);
		}

		const target = new Map();
		target.set(field, value);
        return new AddFieldsOperation(target);
	}

    static builder() {
        return new AddFieldsOperationBuilder();
    }

    and() {
        return new AddFieldsOperationBuilder(this.getValueMap());
    }



	protected mongoOperator(): string {
		return '$addFields';
	}
}
