import { LTrim } from "../../../operator/stringOperators/ltrimOperator";
import { RTrim } from "../../../operator/stringOperators/rtrimOperator";
import { ToUpper } from "../../../operator/stringOperators/toUppercase";
import { Trim } from "../../../operator/stringOperators/trimOperator";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('Trim Operator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Happy path ===

    test('TC_TRIM_001: valueOf(string)', () => {
        const expr = Trim.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $trim: { input: "$username" }
        });
    });

    test('TC_TRIM_002: valueOf(AggregationExpression) với ToUpper', () => {
        const expr = Trim.valueOf(ToUpper.valueOf("username"));
        expect(expr.toDocument(context)).toEqual({
            $trim: { input: { $toUpper: "$username" } }
        });
    });

    test('TC_TRIM_003: valueOf(object literal)', () => {
        const expr = Trim.valueOf({ $concat: ["$first", "$last"] });
        expect(expr.toDocument(context)).toEqual({
            $trim: { input: { $concat: ["$first", "$last"] } }
        });
    });

    test('TC_TRIM_004: chars(string)', () => {
        const expr = Trim.valueOf("username").chars("xyz");
        expect(expr.toDocument(context)).toEqual({
            $trim: { input: "$username", chars: "xyz" }
        });
    });

    test('TC_TRIM_005: charsOf(fieldReference)', () => {
        const expr = Trim.valueOf("username").charsOf("charsetField");
        expect(expr.toDocument(context)).toEqual({
            $trim: { input: "$username", chars: "$charsetField" }
        });
    });

    test('TC_TRIM_006: charsOf(AggregationExpression)', () => {
        const expr = Trim.valueOf("username").charsOf(ToUpper.valueOf("charsetField"));
        expect(expr.toDocument(context)).toEqual({
            $trim: { input: "$username", chars: { $toUpper: "$charsetField" } }
        });
    });

    test('TC_TRIM_007: charsOf(object literal)', () => {
        const expr = Trim.valueOf("username").charsOf({ $concat: ["x", "y"] });
        expect(expr.toDocument(context)).toEqual({
            $trim: { input: "$username", chars: { $concat: ["x", "y"] } }
        });
    });

    test('TC_TRIM_008: left() => instance của LTrim', () => {
        const expr = Trim.valueOf("username").chars("x").left();
        expect(expr).toBeInstanceOf(LTrim);
        expect(expr.toDocument(context)).toEqual({
            $ltrim: { input: "$username", chars: "x" }
        });
    });

    test('TC_TRIM_009: right() => instance của RTrim', () => {
        const expr = Trim.valueOf("username").chars("y").right();
        expect(expr).toBeInstanceOf(RTrim);
        expect(expr.toDocument(context)).toEqual({
            $rtrim: { input: "$username", chars: "y" }
        });
    });

    // === Negative cases ===

    test('TC_TRIM_010: valueOf(null) => throw error', () => {
        expect(() => Trim.valueOf(null as any)).toThrow("Value must not be null");
    });

    test('TC_TRIM_011: chars(null) => throw error', () => {
        const expr = Trim.valueOf("username");
        expect(() => expr.chars(null as any)).toThrow("Chars must not be null");
    });

    test('TC_TRIM_012: charsOf(null) => throw error', () => {
        const expr = Trim.valueOf("username");
        expect(() => expr.charsOf(null as any)).toThrow("Value must not be null");
    });
});