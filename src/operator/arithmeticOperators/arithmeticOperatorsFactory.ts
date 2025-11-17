import { AggregateField } from "../../aggregate/field/aggregateField";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { Add } from "./add";
import { ArithmeticOperators } from "./arithmeticOperators";
import { Divide } from "./divide";
import { Log } from "./log";
import { Mod } from "./mod";
import { Multiply } from "./multiply";
import { Pow } from "./pow";
import { Subtract } from "./subtract";

export class ArithmeticOperatorsFactory {
    private fieldReference: `$${string}` | null = null;
    private expression: Record<string, any> | null = null;

    constructor(fieldReference: string)
    constructor(expression: Record<string, any>)
    constructor(input: string | Record<string, any>) {
        Assert.notNull(input, "FieldReference must not be null");

        if (typeof input === 'string') {
            this.expression = null;
            if (input.startsWith('$')) {
                this.fieldReference = input as `$${string}`;
            } else {
                this.fieldReference = `$${input}`;
            }
        }

        if (typeof input !== 'string') {
            this.expression! = input;
            this.fieldReference = null;
        }
    }

    abs() {
        return this.useFieldRef()
            ? ArithmeticOperators.abs(this.fieldReference!)
            : ArithmeticOperators.abs(this.expression!!);
    }

    add(number: number): Add<number>
    add(fieldReference: string): Add<AggregateField>
    add(expression: AggregationExpression): Add<AggregationExpression>
    add(number: any) {
        const operatorCreated = this.useFieldRef()
            ? ArithmeticOperators.add(this.fieldReference!)
            : ArithmeticOperators.add(this.expression!);
        return operatorCreated.add(number);
    }

    ceil() {
        return this.useFieldRef()
            ? ArithmeticOperators.ceil(this.fieldReference!)
            : ArithmeticOperators.ceil(this.expression!);
    }

    divideBy(fieldReference: `$${string}`): Divide
    divideBy(number: number): Divide
    divideBy(expression: Record<string, any>): Divide
    divideBy(number: any) {
        const operatorCreated = this.useFieldRef()
            ? ArithmeticOperators.divide(this.fieldReference!)
            : ArithmeticOperators.divide(this.expression!);
        return operatorCreated.divideBy(number);
    }

    exp() {
        return this.useFieldRef()
            ? ArithmeticOperators.exp(this.fieldReference!)
            : ArithmeticOperators.exp(this.expression!);
    }

    floor() {
        return this.useFieldRef()
            ? ArithmeticOperators.floor(this.fieldReference!)
            : ArithmeticOperators.floor(this.expression!);
    }

    ln() {
        return this.useFieldRef()
            ? ArithmeticOperators.ln(this.fieldReference!)
            : ArithmeticOperators.ln(this.expression!);
    }

    log(fieldReference: `$${string}`): Log
    log(number: number): Log
    log(expression: Record<string, any>): Log
    log(base: any) {
        const operatorCreated = this.useFieldRef()
            ? ArithmeticOperators.log(this.fieldReference!)
            : ArithmeticOperators.log(this.expression!);
        return operatorCreated.log(base);
    }

    log10() {
        return this.useFieldRef()
            ? ArithmeticOperators.log10(this.fieldReference!)
            : ArithmeticOperators.log10(this.expression!);
    }

    mod(fieldReference: `$${string}`): Mod
    mod(number: number): Mod
    mod(expression: Record<string, any>): Mod
    mod(number: any) {
        const operatorCreated = this.useFieldRef()
            ? ArithmeticOperators.mod(this.fieldReference!)
            : ArithmeticOperators.mod(this.expression!);
        return operatorCreated.mod(number);
    }

    multiplyBy(fieldReference: `$${string}`): Multiply
    multiplyBy(number: number): Multiply
    multiplyBy(expression: Record<string, any>): Multiply
    multiplyBy(number: any) {
        const operatorCreated = this.useFieldRef()
            ? ArithmeticOperators.multiply(this.fieldReference!)
            : ArithmeticOperators.multiply(this.expression!);
        return operatorCreated.multiplyBy(number);
    }

    powBy(fieldReference: `$${string}`): Pow
    powBy(number: number): Pow
    powBy(expression: Record<string, any>): Pow
    powBy(number: any) {
        const operatorCreated = this.useFieldRef()
            ? ArithmeticOperators.pow(this.fieldReference!)
            : ArithmeticOperators.pow(this.expression!);
        return operatorCreated.pow(number);
    }

    round() {
        return this.useFieldRef()
            ? ArithmeticOperators.round(this.fieldReference!)
            : ArithmeticOperators.round(this.expression!);
    }

    roundToPlace(input: number) {
        return this.round().place(input);
    }

    sqrt() {
        return this.useFieldRef()
            ? ArithmeticOperators.sqrt(this.fieldReference!)
            : ArithmeticOperators.sqrt(this.expression!);
    }

    subtract(fieldReference: `$${string}`): Subtract
    subtract(number: number): Subtract
    subtract(expression: Record<string, any>): Subtract
    subtract(input: any) {
        const operatorCreated = this.useFieldRef()
            ? ArithmeticOperators.subtract(this.fieldReference!)
            : ArithmeticOperators.subtract(this.expression!);
        return operatorCreated.subtract(input);
    }
    
    trunc() {
        return this.useFieldRef()
            ? ArithmeticOperators.trunc(this.fieldReference!)
            : ArithmeticOperators.trunc(this.expression!);
        
    }

    private useFieldRef() {
        return this.fieldReference! !== null;
    }
}
