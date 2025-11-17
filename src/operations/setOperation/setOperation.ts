import { DocumentEnhancingOperation } from "../../DocumentEnhancingOperation";
import { FieldAppender, ValueAppender } from "./fieldAppender";

export class SetOperation extends DocumentEnhancingOperation {
    /**
     * Internal Constructor, It's only use by {@class FieldAppendder}. If you want to create new instance,
     * use {@static createSetOperation} method instead of Constructor.
     */
    constructor(source: Map<any, any>) {
        super(source);
    } 

    static createSetOperation(field: any, value: any | null) {
        return new SetOperation(new Map().set(field, value));
    }

    builder() {
        return new FieldAppender();
    }

    set(field: string): ValueAppender;
    set(field: any, value: any): SetOperation;
    set(field: any | string, value?: any) {
        if(typeof field === 'string' && value === undefined) {
            return new FieldAppender().set(field);
        }

        const target = new Map(this.getValueMap())
        target.set(field, value);

        return new SetOperation(target);
    }

    and() {
        return new FieldAppender(this.getValueMap());
    }

    protected mongoOperator(): string {
        return '$set'
    }

}