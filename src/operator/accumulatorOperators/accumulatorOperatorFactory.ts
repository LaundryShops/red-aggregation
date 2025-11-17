import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { Avg } from "./avg";
import { Max } from "./max";
import { Min } from "./min";
import { Sum } from "./sum";

export class AccumulatorOperatorFactory {
    private readonly fieldReference: string | null;
    private readonly expression: AggregationExpression | null;

    constructor(fieldReference: string)
    constructor(expression: AggregationExpression)
    constructor(input: string | AggregationExpression) {
        Assert.notNull(input, 'Input must not be null.');

        if (typeof input === 'string') {
            this.fieldReference = input;
            this.expression = null;
            return
        }
        this.expression = input;
        this.fieldReference = null;
        return;
    }

    sum() {
        return this.usesFieldRef() ? Sum.sumOf(this.fieldReference!) : Sum.sumOf(this.expression!);
    }

    min(numberOfResults: number): Min
    min(): Min
    min(numberOfResults?: number) {
        if (!Number.isNaN(Number(numberOfResults))) {
            return this.min().limit(numberOfResults!);
        }

        return this.usesFieldRef() ? Min.minOf(this.fieldReference!) : Min.minOf(this.expression!);
    }

    max(numberOfResults: number): Max;
    max(): Max
    max(numberOfResults?: number) {
        if (!Number.isNaN(Number(numberOfResults))) {
            return this.max().limit(numberOfResults!);
        }

        return this.usesFieldRef() ? Max.maxOf(this.fieldReference!) : Max.maxOf(this.expression!);
    }

    avg(): Avg {
        return this.usesFieldRef() ? Avg.avgOf(this.fieldReference!) : Avg.avgOf(this.expression!);
    }

    private usesFieldRef() {
        return this.fieldReference !== null;
    }
}

