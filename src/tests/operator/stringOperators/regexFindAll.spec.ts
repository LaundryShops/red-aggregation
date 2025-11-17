import { RegexFindAllOperator } from "../../../operator/stringOperators/regexFindAllOperator";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('RegexFindAllOperator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    test('TC_REGEX_001: valueOf(string) => $regexFindAll với field reference', () => {
        const expr = RegexFindAllOperator.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $regexFindAll: { input: "$username" }
        });
    });

    test('TC_REGEX_002: valueOf(AggregationExpression)', () => {
        const expr = RegexFindAllOperator.valueOf({ $toLower: "$username" });
        expect(expr.toDocument(context)).toEqual({
            $regexFindAll: { input: { $toLower: "$username" } }
        });
    });

    test('TC_REGEX_003: regex(string)', () => {
        const expr = RegexFindAllOperator.valueOf("username").regex("^[a-z]+$");
        expect(expr.toDocument(context)).toEqual({
            $regexFindAll: { input: "$username", regex: "^[a-z]+$" }
        });
    });

    test('TC_REGEX_004: regexOf(fieldReference)', () => {
        const expr = RegexFindAllOperator.valueOf("username").regexOf("patternField");
        expect(expr.toDocument(context)).toEqual({
            $regexFindAll: { input: "$username", regex: "$patternField" }
        });
    });

    test('TC_REGEX_005: pattern(RegExp)', () => {
        const expr = RegexFindAllOperator.valueOf("username").pattern(/abc/i);
        expect(expr.toDocument(context)).toEqual({
            $regexFindAll: { input: "$username", regex: "abc", options: "i" }
        });
    });

    test('TC_REGEX_006: options(string)', () => {
        const expr = RegexFindAllOperator.valueOf("username").regex("abc").options("i");
        expect(expr.toDocument(context)).toEqual({
            $regexFindAll: { input: "$username", regex: "abc", options: "i" }
        });
    });

    test('TC_REGEX_007: optionsOf(fieldReference)', () => {
        const expr = RegexFindAllOperator.valueOf("username").regex("abc").optionsOf("optField");
        expect(expr.toDocument(context)).toEqual({
            $regexFindAll: { input: "$username", regex: "abc", options: "$optField" }
        });
    });

    test('TC_REGEX_008: valueOf(null) => throw error', () => {
        expect(() => RegexFindAllOperator.valueOf(null as any)).toThrow("Input must not be null");
    });

    test('TC_REGEX_009: regex(null) => throw error', () => {
        const expr = RegexFindAllOperator.valueOf("username");
        expect(() => expr.regex(null as any)).toThrow("Regex must not be null");
    });

    test('TC_REGEX_010: pattern(null) => throw error', () => {
        const expr = RegexFindAllOperator.valueOf("username");
        expect(() => expr.pattern(null as any)).toThrow("Pattern must not be null");
    });

    test('TC_REGEX_011: options(null) => throw error', () => {
        const expr = RegexFindAllOperator.valueOf("username").regex("abc");
        expect(() => expr.options(null as any)).toThrow("Options must not be null.");
    });
});