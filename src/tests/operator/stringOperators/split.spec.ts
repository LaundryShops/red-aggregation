import { Fields } from "../../../aggregate/field";
import { SplitOperator } from "../../../operator/stringOperators/splitOperator";
import { ToUpper } from "../../../operator/stringOperators/toUppercase";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('SplitOperator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Happy cases ===

    test('TC_SPLIT_001: valueOf(string) => $split với field reference', () => {
        const expr = SplitOperator.valueOf("username");
        expect(expr.toDocument(context)).toEqual({
            $split: ["$username"]
        });
    });

    test('TC_SPLIT_002: valueOf(AggregationExpression)', () => {
        const expr = SplitOperator.valueOf({ $toLower: "$username" });
        expect(expr.toDocument(context)).toEqual({
            $split: [{ $toLower: "$username" }]
        });
    });

    test('TC_SPLIT_003: valueOf(object expression)', () => {
        const expr = SplitOperator.valueOf({ custom: "expr" });
        expect(expr.toDocument(context)).toEqual({
            $split: [{ custom: "expr" }]
        });
    });

    test('TC_SPLIT_004: split(string delimiter)', () => {
        const expr = SplitOperator.valueOf("username").split(" ");
        expect(expr.toDocument(context)).toEqual({
            $split: ["$username", " "]
        });
    });

    test('TC_SPLIT_005: split(Field reference) => delimiter là field', () => {
        const expr = SplitOperator.valueOf("username").split(Fields.field("delimiterField"));
        expect(expr.toDocument(context)).toEqual({
            $split: ["$username", "$delimiterField"]
        });
    });

    test('TC_SPLIT_006: split(AggregationExpression)', () => {
        const expr = SplitOperator.valueOf("username").split({ $toUpper: "$delimiterField" });
        expect(expr.toDocument(context)).toEqual({
            $split: ["$username", { $toUpper: "$delimiterField" }]
        });
    });

    test('TC_SPLIT_007: split(object expression)', () => {
        const expr = SplitOperator.valueOf("username").split({ custom: "delimiter" });
        expect(expr.toDocument(context)).toEqual({
            $split: ["$username", { custom: "delimiter" }]
        });
    });

    test('TC_SPLIT_008: input là AggregationExpression, delimiter là string', () => {
        const expr = SplitOperator.valueOf({ $concat: ["$first", "$last"] }).split(" ");
        expect(expr.toDocument(context)).toEqual({
            $split: [{ $concat: ["$first", "$last"] }, " "]
        });
    });

    test('TC_SPLIT_009: input là AggregationExpression, delimiter là AggregationExpression', () => {
        const expr = SplitOperator.valueOf({ $concat: ["$first", "$last"] })
            .split({ $toUpper: "$delimiter" });
        expect(expr.toDocument(context)).toEqual({
            $split: [{ $concat: ["$first", "$last"] }, { $toUpper: "$delimiter" }]
        });
    });

    test('TC_SPLIT_EXPR_010: input UpperCase + delimiter UpperCase', () => {
        const expr = SplitOperator
            .valueOf(ToUpper.valueOf("username"))
            .split(ToUpper.valueOf("delimiter"));
        expect(expr.toDocument(context)).toEqual({
            $split: [
                { $toUpper: "$username" },
                { $toUpper: "$delimiter" }
            ]
        });
    });

    // === Negative cases ===

    test('TC_SPLIT_008: valueOf(null) => throw error', () => {
        expect(() => SplitOperator.valueOf(null as any)).toThrow("Value must not be null");
    });

    test('TC_SPLIT_009: split(null) => throw error', () => {
        const expr = SplitOperator.valueOf("username");
        expect(() => expr.split(null as any)).toThrow("Value must not be null");
    });
});
