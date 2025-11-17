import { RegexFindOperator } from "../../../operator/stringOperators/regexFindOperator";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('RegexFindOperator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    test('TC_REGEXFIND_001: valueOf(string) => $regexFind với field reference', () => {
        const expr = RegexFindOperator.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $regexFind: { input: "$username" }
        });
    });

    test('TC_REGEXFIND_002: valueOf(AggregationExpression)', () => {
        const expr = RegexFindOperator.valueOf({ $toLower: "$username" });
        expect(expr.toDocument(context)).toEqual({
            $regexFind: { input: { $toLower: "$username" } }
        });
    });

    test('TC_REGEXFIND_003: regex(string)', () => {
        const expr = RegexFindOperator.valueOf("username").regex("^[a-z]+$");
        expect(expr.toDocument(context)).toEqual({
            $regexFind: { input: "$username", regex: "^[a-z]+$" }
        });
    });

    test('TC_REGEXFIND_004: regexOf(fieldReference)', () => {
        const expr = RegexFindOperator.valueOf("username").regexOf("patternField");
        expect(expr.toDocument(context)).toEqual({
            $regexFind: { input: "$username", regex: "$patternField" }
        });
    });

    test('TC_REGEXFIND_005: pattern(RegExp)', () => {
        const expr = RegexFindOperator.valueOf("username").pattern(/abc/i);
        expect(expr.toDocument(context)).toEqual({
            $regexFind: { input: "$username", regex: "abc", options: "i" }
        });
    });

    test('TC_REGEXFIND_006: options(string)', () => {
        const expr = RegexFindOperator.valueOf("username").regex("abc").options("i");
        expect(expr.toDocument(context)).toEqual({
            $regexFind: { input: "$username", regex: "abc", options: "i" }
        });
    });

    test('TC_REGEXFIND_007: optionsOf(fieldReference)', () => {
        const expr = RegexFindOperator.valueOf("username").regex("abc").optionsOf("optField");
        expect(expr.toDocument(context)).toEqual({
            $regexFind: { input: "$username", regex: "abc", options: "$optField" }
        });
    });

    test('TC_REGEXFIND_008: valueOf(null) => throw error', () => {
        expect(() => RegexFindOperator.valueOf(null as any)).toThrow("Input must not be null");
    });

    test('TC_REGEXFIND_009: regex(null) => throw error', () => {
        const expr = RegexFindOperator.valueOf("username");
        expect(() => expr.regex(null as any)).toThrow("Regex must not be null");
    });

    test('TC_REGEXFIND_010: pattern(null) => throw error', () => {
        const expr = RegexFindOperator.valueOf("username");
        expect(() => expr.pattern(null as any)).toThrow("Pattern must not be null");
    });

    test('TC_REGEXFIND_011: options(null) => throw error', () => {
        const expr = RegexFindOperator.valueOf("username").regex("abc");
        expect(() => expr.options(null as any)).toThrow("Options must not be null.");
    });
});