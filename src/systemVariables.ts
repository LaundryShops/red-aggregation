import { AggregationVariable } from "./aggregationVariable";

export enum SystemVariables {
    NOW = 'NOW',
    ROOT = 'ROOT',
    CURRENT = 'CURRENT',
    REMOVE = 'REMOVE',
}

const PREFIX = '$$'

export class SystemVariablesImpl extends AggregationVariable implements AggregationVariable {
    readonly PREFIX = PREFIX;
    private readonly name: string;

    static isReferingToSystemVariable(field: string) {
        let candidate = SystemVariablesImpl.variableNameFrom(field);
        if (!candidate) {
            return false;
        }

        candidate = candidate.startsWith(PREFIX) ? candidate.substring(2) : candidate;
        return Object.values(SystemVariables).includes(candidate as any);
    }

    static variableNameFrom(field: string | null) {
        if (field === null || !field.startsWith(PREFIX) || field.length <= 2) {
            return null
        }
        const indexOfFirstDot = field.indexOf('.');
        return indexOfFirstDot === -1 ? field : field.substring(2, indexOfFirstDot);
    }

    constructor(name: SystemVariables) {
        super();
        this.name = name
    }

    getRaw(): string {
        return this.name;
    }

    getTarget(): string {
        return this.toString()
    }

    toString() {
        return `${this.PREFIX}${this.name}`
    }

}
