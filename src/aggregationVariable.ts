import { Field } from "./aggregate/field";

export abstract class AggregationVariable implements Field {
    public readonly PREFIX = "$$";
    abstract getTarget(): string 

    getName(): string {
        return this.getTarget()
    }

    isInternal(): boolean {
        return false
    }

    isAliased() {
        return this.getName() !== this.getTarget();
    }

    static isVariable(field: string): boolean;
    static isVariable(field: Field): boolean;
    static isVariable(field: Field | string) {
        if (field instanceof Field) {
            if (field instanceof AggregationVariable) {
                return true;
            }
            this.isVariable(field.getTarget())
        }
        
        return field != null && /^\$\$\w.*/.test((field as string).trim());
    }
}