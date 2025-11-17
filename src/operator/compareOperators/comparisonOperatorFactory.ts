import { AggregationExpression } from "../../aggregationExpression";
import { Cmp } from "./cmp";
import { Eq } from "./eq";
import { Gt } from "./gt";
import { Gte } from "./gte";
import { Lt } from "./lt";
import { Lte } from "./lte";
import { Ne } from "./ne";

export class ComparisonOperationFactory {
    private readonly fieldRef: string | null;
    private readonly expression: AggregationExpression | null;

    constructor(fieldReference: string)
    constructor(expression: AggregationExpression)
    constructor(fieldOrExpression: AggregationExpression | string) {
        if (typeof fieldOrExpression === 'string') {
            this.fieldRef = fieldOrExpression;
            this.expression = null;
            return;
        }    
        this.fieldRef = null;
        this.expression = fieldOrExpression;
    }

    compareTo(field: string): Cmp
    compareTo(expression: AggregationExpression): Cmp
    compareTo(expression: Record<string, any>): Cmp
    compareTo(fieldOrExpression: unknown) {
        if (typeof fieldOrExpression === 'string') {
            return this.createCmp().compareTo(fieldOrExpression)
        }    
        return this.createCmp().compareTo(fieldOrExpression!)
    }

    compareToValue(value: any) {
        return this.createCmp().compareToValue(value)
    }

    private createCmp() {
        return this.usesFieldRef() 
            ? Cmp.valueOf(this.fieldRef!)
            : Cmp.valueOf(this.expression!)
    }

    equalTo(field: string): Eq
    equalTo(expression: AggregationExpression): Eq
    equalTo(expression: Record<string, any>): Eq
    equalTo(fieldOrExpression: unknown) {
        return this.createEq().equalTo(fieldOrExpression!)
    }

    equalToValue(value: any) {
        return this.createEq().equalToValue(value)
    }

    private createEq() {
        return this.usesFieldRef() 
            ? Eq.valueOf(this.fieldRef!)
            : Eq.valueOf(this.expression!)
    }

    greaterThanEqualTo(field: string): Gte
    greaterThanEqualTo(expression: AggregationExpression): Gte
    greaterThanEqualTo(expression: Record<string, any>): Gte
    greaterThanEqualTo(fieldOrExpression: unknown) {
        return this.createGte().greaterThanEqualTo(fieldOrExpression!)
    }

    greaterThanEqualToValue(value: any) {
        return this.createGte().greaterThanEqualToValue(value)
    }

    private createGte() {
        return this.usesFieldRef() 
            ? Gte.valueOf(this.fieldRef!)
            : Gte.valueOf(this.expression!)
    }

    greaterThanTo(field: string): Gt
    greaterThanTo(expression: AggregationExpression): Gt
    greaterThanTo(expression: Record<string, any>): Gt
    greaterThanTo(fieldOrExpression: unknown) {
        return this.createGt().greaterThan(fieldOrExpression!)
    }

    greaterThanToValue(value: any) {
        return this.createGt().greaterThanValue(value)
    }

    private createGt() {
        return this.usesFieldRef() 
            ? Gt.valueOf(this.fieldRef!)
            : Gt.valueOf(this.expression!)
    }

    lessThanTo(field: string): Lt
    lessThanTo(expression: AggregationExpression): Lt
    lessThanTo(expression: Record<string, any>): Lt
    lessThanTo(fieldOrExpression: unknown) {
        return this.createLt().lessThan(fieldOrExpression!)
    }

    lessThanToValue(value: any) {
        return this.createLt().lessThanValue(value)
    }

    private createLt() {
        return this.usesFieldRef() 
            ? Lt.valueOf(this.fieldRef!)
            : Lt.valueOf(this.expression!)
    }

    lessThanEqualTo(field: string): Lte;
    lessThanEqualTo(expression: AggregationExpression): Lte;
    lessThanEqualTo(expression: Record<string, any>): Lte;
    lessThanEqualTo(fieldOrExpression: unknown) {
        return this.createLte().lessThanEqualTo(fieldOrExpression!)
    }

    lessThanEqualToValue(value: any) {
        return this.createLte().lessThanEqualToValue(value)
    }

    private createLte() {
        return this.usesFieldRef() 
            ? Lte.valueOf(this.fieldRef!)
            : Lte.valueOf(this.expression!)
    }

    notEqualTo(field: string): Ne
    notEqualTo(expression: AggregationExpression): Ne
    notEqualTo(expression: Record<string, any>): Ne
    notEqualTo(fieldOrExpression: unknown) {
        return this.createNe().notEqualTo(fieldOrExpression!)
    }

    notEqualToValue(value: any) {
        return this.createNe().notEqualToValue(value)
    }

    private createNe() {
        return this.usesFieldRef() 
            ? Ne.valueOf(this.fieldRef!)
            : Ne.valueOf(this.expression!)
    }

    private usesFieldRef() {
        return this.fieldRef != null;
    }
}