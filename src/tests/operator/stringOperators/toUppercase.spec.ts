import { ToLower } from "../../../operator/stringOperators/toLowercase";
import { ToUpper } from "../../../operator/stringOperators/toUppercase";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('ToUpper Operator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Happy path ===

    test('TC_TOUPPER_001: valueOf(string) => field reference', () => {
        const expr = ToUpper.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $toUpper: "$username"
        });
    });

    test('TC_TOUPPER_002: valueOf(AggregationExpression) với ToLower instance', () => {
        const expr = ToUpper.valueOf(ToLower.valueOf("username"));
        expect(expr.toDocument(context)).toEqual({
            $toUpper: { $toLower: "$username" }
        });
    });

    test('TC_TOUPPER_003: valueOf(object literal)', () => {
        const expr = ToUpper.valueOf({ $concat: ["$first", "$last"] });
        expect(expr.toDocument(context)).toEqual({
            $toUpper: { $concat: ["$first", "$last"] }
        });
    });

    test('TC_TOUPPER_004: lower(string) => string literal', () => {
        const expr = ToUpper.lower("abc");
        expect(expr.toDocument(context)).toEqual({
            $toUpper: "abc"
        });
    });

    // === Negative cases ===

    test('TC_TOUPPER_005: valueOf(null) => throw error', () => {
        expect(() => ToUpper.valueOf(null as any)).toThrow("Value must not be null");
    });

    test('TC_TOUPPER_006: lower(null) => throw error', () => {
        expect(() => ToUpper.lower(null as any)).toThrow("Value must not be null");
    });
});
