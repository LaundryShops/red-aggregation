import { LTrim } from "../../../operator/stringOperators/ltrimOperator";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('LTrim Operator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    test('TC_LTRIM_001: valueOf(string) => $ltrim với field reference', () => {
        const expr = LTrim.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $ltrim: { input: "$username" }
        });
    });

    test('TC_LTRIM_002: valueOf(AggregationExpression)', () => {
        const expr = LTrim.valueOf({ $toLower: "$username" });
        expect(expr.toDocument(context)).toEqual({
            $ltrim: { input: { $toLower: "$username" } }
        });
    });

    test('TC_LTRIM_003: chars(string)', () => {
        const expr = LTrim.valueOf("username").chars("xyz");
        expect(expr.toDocument(context)).toEqual({
            $ltrim: { input: "$username", chars: "xyz" }
        });
    });

    test('TC_LTRIM_004: charsOf(fieldReference)', () => {
        const expr = LTrim.valueOf("username").charsOf("customChars");
        expect(expr.toDocument(context)).toEqual({
            $ltrim: { input: "$username", chars: "$customChars" }
        });
    });

    test('TC_LTRIM_005: charsOf(AggregationExpression)', () => {
        const expr = LTrim.valueOf("username").charsOf({ $toUpper: "$prefix" });
        expect(expr.toDocument(context)).toEqual({
            $ltrim: { input: "$username", chars: { $toUpper: "$prefix" } }
        });
    });

    test('TC_LTRIM_006: valueOf(null) => throw error', () => {
        expect(() => LTrim.valueOf(null as any)).toThrow("FieldReference must not be null");
    });

    test('TC_LTRIM_007: chars(null) => throw error', () => {
        const expr = LTrim.valueOf("username");
        expect(() => expr.chars(null as any)).toThrow("Chars must not be null");
    });
});
