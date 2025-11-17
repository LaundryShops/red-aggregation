import { RTrim } from "../../../operator/stringOperators/rtrimOperator";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('RTrim', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Happy cases ===

    test('TC_RTRIM_001: valueOf(string) => $rtrim với field reference', () => {
        const expr = RTrim.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $rtrim: { input: "$username" }
        });
    });

    test('TC_RTRIM_002: valueOf(AggregationExpression)', () => {
        const expr = RTrim.valueOf({ $toLower: "$username" });
        expect(expr.toDocument(context)).toEqual({
            $rtrim: { input: { $toLower: "$username" } }
        });
    });

    test('TC_RTRIM_003: valueOf(object expression)', () => {
        const expr = RTrim.valueOf({ custom: "expr" });
        expect(expr.toDocument(context)).toEqual({
            $rtrim: { input: { custom: "expr" } }
        });
    });

    test('TC_RTRIM_004: chars(string)', () => {
        const expr = RTrim.valueOf("username").chars("xyz");
        expect(expr.toDocument(context)).toEqual({
            $rtrim: { input: "$username", chars: "xyz" }
        });
    });

    test('TC_RTRIM_005: charsOf(fieldReference)', () => {
        const expr = RTrim.valueOf("username").charsOf("patternField");
        expect(expr.toDocument(context)).toEqual({
            $rtrim: { input: "$username", chars: "$patternField" }
        });
    });

    test('TC_RTRIM_006: charsOf(AggregationExpression)', () => {
        const expr = RTrim.valueOf("username").charsOf({ $toUpper: "$patternField" });
        expect(expr.toDocument(context)).toEqual({
            $rtrim: { input: "$username", chars: { $toUpper: "$patternField" } }
        });
    });

    // === Negative cases ===

    test('TC_RTRIM_007: valueOf(null) => throw error', () => {
        expect(() => RTrim.valueOf(null as any)).toThrow("FieldReference must not be null");
    });

    test('TC_RTRIM_008: chars(null) => throw error', () => {
        const expr = RTrim.valueOf("username");
        expect(() => expr.chars(null as any)).toThrow("Chars must not be null");
    });
});
