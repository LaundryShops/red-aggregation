import { ToLower } from "../../../operator/stringOperators/toLowercase";
import { ToUpper } from "../../../operator/stringOperators/toUppercase";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('ToLower Operator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Happy path ===

    test('TC_TOLOWER_001: valueOf(string) => field reference', () => {
        const expr = ToLower.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $toLower: "$username"
        });
    });

    test('TC_TOLOWER_002: valueOf(AggregationExpression)', () => {
        const expr = ToLower.valueOf(ToUpper.valueOf("username"));
        expect(expr.toDocument(context)).toEqual({
            $toLower: { $toUpper: "$username" }
        });
    });

    test('TC_TOLOWER_003: valueOf(object literal)', () => {
        const expr = ToLower.valueOf({ $concat: ["$first", "$last"] });
        expect(expr.toDocument(context)).toEqual({
            $toLower: { $concat: ["$first", "$last"] }
        });
    });

    test('TC_TOLOWER_004: lower(string) => string literal', () => {
        const expr = ToLower.lower("ABC");
        expect(expr.toDocument(context)).toEqual({
            $toLower: "ABC"
        });
    });

    // === Negative cases ===

    test('TC_TOLOWER_005: valueOf(null) => throw error', () => {
        expect(() => ToLower.valueOf(null as any)).toThrow("Value must not be null");
    });

    test('TC_TOLOWER_006: lower(null) => throw error', () => {
        expect(() => ToLower.lower(null as any)).toThrow("Value must not be null");
    });
});