import { RegexMatchOperator } from "../../../operator/stringOperators/regexMatchOperator";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('RegexMatchOperator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    test('TC_REGEXMATCH_001: valueOf(string) => $regexMatch với field reference', () => {
        const expr = RegexMatchOperator.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $regexMatch: { input: "$username" }
        });
    });

    test('TC_REGEXMATCH_002: valueOf(AggregationExpression)', () => {
        const expr = RegexMatchOperator.valueOf({ $toLower: "$username" });
        expect(expr.toDocument(context)).toEqual({
            $regexMatch: { input: { $toLower: "$username" } }
        });
    });

    test('TC_REGEXMATCH_003: regex(string)', () => {
        const expr = RegexMatchOperator.valueOf("username").regex("^[a-z]+$");
        expect(expr.toDocument(context)).toEqual({
            $regexMatch: { input: "$username", regex: "^[a-z]+$" }
        });
    });

    test('TC_REGEXMATCH_004: regexOf(fieldReference)', () => {
        const expr = RegexMatchOperator.valueOf("username").regexOf("patternField");
        expect(expr.toDocument(context)).toEqual({
            $regexMatch: { input: "$username", regex: "$patternField" }
        });
    });

    test('TC_REGEXMATCH_005: pattern(RegExp)', () => {
        const expr = RegexMatchOperator.valueOf("username").pattern(/abc/i);
        expect(expr.toDocument(context)).toEqual({
            $regexMatch: { input: "$username", regex: "abc", options: "i" }
        });
    });

    test('TC_REGEXMATCH_006: options(string)', () => {
        const expr = RegexMatchOperator.valueOf("username").regex("abc").options("i");
        expect(expr.toDocument(context)).toEqual({
            $regexMatch: { input: "$username", regex: "abc", options: "i" }
        });
    });

    test('TC_REGEXMATCH_007: optionsOf(fieldReference)', () => {
        const expr = RegexMatchOperator.valueOf("username").regex("abc").optionsOf("optField");
        expect(expr.toDocument(context)).toEqual({
            $regexMatch: { input: "$username", regex: "abc", options: "$optField" }
        });
    });

    // === Negative cases ===

    test('TC_REGEXMATCH_008: valueOf(null) => throw error', () => {
        expect(() => RegexMatchOperator.valueOf(null as any)).toThrow("Input must not be null");
    });

    test('TC_REGEXMATCH_009: regex(null) => throw error', () => {
        const expr = RegexMatchOperator.valueOf("username");
        expect(() => expr.regex(null as any)).toThrow("Pattern must not be null");
    });

    test('TC_REGEXMATCH_010: pattern(null) => throw error', () => {
        const expr = RegexMatchOperator.valueOf("username");
        expect(() => expr.pattern(null as any)).toThrow("Pattern must not be null");
    });

    test('TC_REGEXMATCH_011: options(null) => throw error', () => {
        const expr = RegexMatchOperator.valueOf("username").regex("abc");
        expect(() => expr.options(null as any)).toThrow("Options must not be null");
    });
});