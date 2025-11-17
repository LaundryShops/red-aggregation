import { Field } from "../../aggregate/field";
import { AggregationExpression } from "../../aggregationExpression";
import { Assert } from "../../utils";
import { Concat } from "./concat";
import { LTrim } from "./ltrimOperator";
import { RegexFindAllOperator } from "./regexFindAllOperator";
import { RegexFindOperator } from "./regexFindOperator";
import { RegexMatchOperator } from "./regexMatchOperator";
import { ReplaceAllOperator } from "./replaceAll";
import { ReplaceOneOperator } from "./replaceOneOperator";
import { RTrim } from "./rtrimOperator";
import { SplitOperator } from "./splitOperator";
import { ToLower } from "./toLowercase";
import { ToUpper } from "./toUppercase";
import { Trim } from "./trimOperator";

export class StringOperatorFactory {
    private fieldReference: string | null = null;
    private expression: AggregationExpression | Record<string, any> | null = null;

    constructor(fieldReference: string)
    constructor(expression: AggregationExpression)
    constructor(expression: Record<string, any>)
    constructor(input: string | Record<string, any>) {
        Assert.notNull(input, "FieldReference must not be null");

        if (typeof input === 'string') {
            this.expression = null;
            this.fieldReference = input;
        }

        if (typeof input !== 'string') {
            this.expression = input;
            this.fieldReference = null;
        }
    }

    replaceAll(search: string, replacement: string): ReplaceAllOperator
    replaceAll(search: AggregationExpression, replacement: string): ReplaceAllOperator
    replaceAll(search: Record<string, any>, replacement: string): ReplaceAllOperator
    replaceAll(search: string | AggregationExpression | Record<string, any>, replacement: string) {
        if (typeof search === 'string') {
            return this.createReplaceAll().find(search).replacement(replacement);
        }
        return this.createReplaceAll().findValueOf(search).replacement(replacement);
    }

    private createReplaceAll() {
        return this.useFieldRef() ? ReplaceAllOperator.valueOf(this.fieldReference!) : ReplaceAllOperator.valueOf(this.expression!);
    }

    replaceOne(search: AggregationExpression, replacement: string): ReplaceOneOperator
    replaceOne(search: Record<string, any>, replacement: string): ReplaceOneOperator
    replaceOne(search: string, replacement: string): ReplaceOneOperator
    replaceOne(search: string | AggregationExpression | Record<string, any>, replacement: string) {
        if (typeof search === 'string') {
            return this.createReplaceOne().find(search).replacement(replacement)
        }
        return this.createReplaceOne().findValueOf(search).replacement(replacement)
    }

    private createReplaceOne() {
        return this.useFieldRef() ? ReplaceOneOperator.valueOf(this.fieldReference!) : ReplaceOneOperator.valueOf(this.expression!);
    }

    regexMatch(pattern: RegExp): RegexMatchOperator;
    regexMatch(expression: AggregationExpression): RegexMatchOperator;
    regexMatch(expression: Record<string, any>): RegexMatchOperator;
    regexMatch(regex: string): RegexMatchOperator;
    regexMatch(regex: string, options: string): RegexMatchOperator;
    regexMatch(value: any, options?: string) {
        if (typeof value === 'string') {
            const regex = this.createRegexMatch().regex(value);
            if (options) {
                return regex.options(options);
            }
            return regex;
        }
        return this.createRegexMatch().regexOf(value);
    }

    private createRegexMatch() {
        return this.useFieldRef() ? RegexMatchOperator.valueOf(this.fieldReference!) : RegexMatchOperator.valueOf(this.expression!);
    }

    regexFindAll(pattern: RegExp): RegexFindAllOperator;
    regexFindAll(expression: AggregationExpression): RegexFindAllOperator;
    regexFindAll(expression: Record<string, any>): RegexFindAllOperator;
    regexFindAll(regex: string, options: string): RegexFindAllOperator;
    regexFindAll(value: any, options?: string) {
        if (typeof value === 'string' && options) {
            return this.createRegexFindAll().regex(value).options(options);
        }
        return this.createRegexFind().regexOf(value);
    }

    private createRegexFindAll() {
        return this.useFieldRef() ? RegexFindAllOperator.valueOf(this.fieldReference!) : RegexFindAllOperator.valueOf(this.expression!);
    }

    regexFind(pattern: RegExp): RegexFindOperator;
    regexFind(expression: AggregationExpression): RegexFindOperator;
    regexFind(expression: Record<string, any>): RegexFindOperator;
    regexFind(regex: string, options: string): RegexFindOperator;
    regexFind(value: string | RegExp | AggregationExpression | Record<string, any>, options?: string) {
        if (typeof value === 'string' && options) {
            return this.createRegexFind().regex(value).options(options);
        }
        if (value instanceof RegExp) {
            return this.createRegexFind().regexOf(value);
        }
        if (value instanceof AggregationExpression) {
            return this.createRegexFind().regexOf(value);
        }
        return this.createRegexFind().regexOf(value as Record<string, any>);
    }

    private createRegexFind() {
        return this.useFieldRef() ? RegexFindOperator.valueOf(this.fieldReference!) : RegexFindOperator.valueOf(this.expression!);
    }

    split(): SplitOperator;
    split(delimiter: string): SplitOperator;
    split(fieldReference: Field): SplitOperator;
    split(fieldReference: AggregationExpression): SplitOperator;
    split(fieldReference: Record<string, any>): SplitOperator;
    split(value?: any) {
        if (!value) {
            return this.createSplit();
        }
        return this.split().split(value)
    }

    private createSplit() {
        return this.useFieldRef() ? SplitOperator.valueOf(this.fieldReference!) : SplitOperator.valueOf(this.expression!);
    }

    toUpper() {
        return this.useFieldRef() ? ToUpper.valueOf(this.fieldReference!) : ToUpper.valueOf(this.expression!);
    }

    toLower() {
        return this.useFieldRef() ? ToLower.valueOf(this.fieldReference!) : ToLower.valueOf(this.expression!);
    }

    trim(): Trim;
    trim(chars: string): Trim;
    trim(expression: AggregationExpression): Trim;
    trim(expression: Record<string, any>): Trim;
    trim(value?: string | AggregationExpression | Record<string, any>) {
        if (!value) {
            return this.createTrim();
        }
        if (typeof value === 'string') {
            return this.trim().chars(value)
        }
        return this.trim().charsOf(value);
    }

    private createTrim() {
        return this.useFieldRef() ? Trim.valueOf(this.fieldReference!) : Trim.valueOf(this.expression!);
    }

    rtrim(): RTrim;
    rtrim(chars: string): RTrim;
    rtrim(expression: AggregationExpression): RTrim;
    rtrim(expression: Record<string, any>): RTrim;
    rtrim(value?: string | AggregationExpression | Record<string, any>) {
        if (!value) {
            return this.createRTrim();
        }
        if (typeof value === 'string') {
            return this.rtrim().chars(value);
        }
        return this.rtrim().charsOf(value);
    }

    private createRTrim() {
        return this.useFieldRef() ? RTrim.valueOf(this.fieldReference!) : RTrim.valueOf(this.expression!);
    }

    ltrim(): LTrim
    ltrim(chars: string): LTrim
    ltrim(expression: AggregationExpression): LTrim
    ltrim(expression: Record<string, any>): LTrim
    ltrim(value?: unknown): LTrim {
        if (!value) {
            return this.createLTrim();
        }
        if (typeof value === 'string') {
            return this.createLTrim().charsOf(value);
        }
        if (value instanceof AggregationExpression) {
            return this.createLTrim().charsOf(value);
        }
        return this.createLTrim().charsOf(value as Record<string, any>);
    }

    private createLTrim() {
        return this.useFieldRef() ? LTrim.valueOf(this.fieldReference!) : LTrim.valueOf(this.expression!);
    }

    concatValueOf(fieldReference: string): Concat
    concatValueOf(expression: AggregationExpression): Concat
    concatValueOf(expression: Record<string, any>): Concat
    concatValueOf(value: unknown) {
        Assert.notNull(value, 'Value must not be null');
        if (typeof value === 'string') {
            return this.createConcat().concatValueof(value);
        }

        if (value instanceof AggregationExpression) {
            return this.createConcat().concatValueof(value);
        }

        return this.createConcat().concatValueof(value as Record<string, any>);
    }

    concat(value: string): Concat {
        Assert.notNull(value, 'Value must not be null');
        return this.createConcat().concat(value);
    }

    private createConcat() {
        return this.useFieldRef() ? Concat.valueOf(this.fieldReference!) : Concat.valueOf(this.expression!);
    }

    private useFieldRef() {
        return this.fieldReference !== null;
    }
}
