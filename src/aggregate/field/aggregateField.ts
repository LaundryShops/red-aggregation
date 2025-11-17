import { AggregationVariable } from "../../aggregationVariable";
import { Field } from "./field";

export class AggregateField extends Field implements Field {
    private readonly raw: string;
    private readonly name: string;
    private readonly target: string;

    constructor(name: string, target: string | null = null) {
        super()
        this.raw = name;

        const nameToSet = name !== null ? AggregateField.cleanUp(name) : '';
        const targetToSet = target !== null ? AggregateField.cleanUp(target) : '';

        if (target == null && name.includes(".")) {
            this.name = nameToSet.substring(nameToSet.indexOf('.') + 1);
            this.target = nameToSet;
        } else {
            this.name = nameToSet;
            this.target = targetToSet;
        }
    }

    static cleanUp(source: string) {
        if (AggregationVariable.isVariable(source)) {
            return source
        }
        const dollarIndex = source.lastIndexOf('$');
        return dollarIndex === -1 ? source : source.substring(dollarIndex + 1);
    }
    getName(): string {
        return this.name;
    }

    getTarget(): string {
        if (this.isLocalVar() || this.pointsToDBRefId()) {
            return this.getRaw();
        }

        return this.target?.trim() ? this.target : this.name;
    }

    isLocalVar(): boolean {
        return this.raw.startsWith("$$") && !this.raw.startsWith("$$$");
    }

    isAliased(): boolean {
        return !(this.getName() === this.getTarget());
    }

    getRaw() {
        return this.raw;
    }

    isInternal(): boolean {
        return this.getRaw().endsWith("$$this") || this.getRaw().endsWith("$$value");
    }

    protected pointsToDBRefId(): boolean {
        return this.raw.endsWith(".$id");
    }

}
