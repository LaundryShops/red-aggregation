import { ReplaceOneOperator } from "../../../operator/stringOperators/replaceOneOperator";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('ReplaceOneOperator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Happy cases ===

    test('TC_REPLACEONE_001: valueOf(string) => $replaceOne với field reference', () => {
        const expr = ReplaceOneOperator.valueOf("description");
        expect(expr.toDocument(context)).toEqual({
            $replaceOne: { input: "$description" }
        });
    });

    test('TC_REPLACEONE_002: valueOf(AggregationExpression)', () => {
        const expr = ReplaceOneOperator.valueOf({ $toLower: "$description" });
        expect(expr.toDocument(context)).toEqual({
            $replaceOne: { input: { $toLower: "$description" } }
        });
    });

    test('TC_REPLACEONE_003: value(string)', () => {
        const expr = ReplaceOneOperator.value("static text");
        expect(expr.toDocument(context)).toEqual({
            $replaceOne: { input: "static text" }
        });
    });

    test('TC_REPLACEONE_004: find(string) + replacement(string)', () => {
        const expr = ReplaceOneOperator.valueOf("description")
            .find("foo")
            .replacement("bar");
        expect(expr.toDocument(context)).toEqual({
            $replaceOne: {
                input: "$description",
                find: "foo",
                replacement: "bar"
            }
        });
    });

    test('TC_REPLACEONE_005: findValueOf(fieldReference) + replacementOf(fieldReference)', () => {
        const expr = ReplaceOneOperator.valueOf("description")
            .findValueOf("searchField")
            .replacementOf("replaceField");
        expect(expr.toDocument(context)).toEqual({
            $replaceOne: {
                input: "$description",
                find: "$searchField",
                replacement: "$replaceField"
            }
        });
    });

    test('TC_REPLACEONE_006: find(AggregationExpression) + replacement(AggregationExpression)', () => {
        const expr = ReplaceOneOperator.valueOf("description")
            .findValueOf({ $toLower: "$searchField" })
            .replacementOf({ $toUpper: "$replaceField" });
        expect(expr.toDocument(context)).toEqual({
            $replaceOne: {
                input: "$description",
                find: { $toLower: "$searchField" },
                replacement: { $toUpper: "$replaceField" }
            }
        });
    });

    // === Negative cases ===

    test('TC_REPLACEONE_007: valueOf(null) => throw error', () => {
        expect(() => ReplaceOneOperator.valueOf(null as any)).toThrow("Value must not be null");
    });

    test('TC_REPLACEONE_008: value(null) => throw error', () => {
        expect(() => ReplaceOneOperator.value(null as any)).toThrow("Value must not be null");
    });

    test('TC_REPLACEONE_009: find(null) => throw error', () => {
        const expr = ReplaceOneOperator.valueOf("description");
        expect(() => expr.find(null as any)).toThrow("Search string must not be null");
    });

    test('TC_REPLACEONE_010: findValueOf(null) => throw error', () => {
        const expr = ReplaceOneOperator.valueOf("description");
        expect(() => expr.findValueOf(null as any)).toThrow("Input must not be null");
    });

    test('TC_REPLACEONE_011: replacement(null) => throw error', () => {
        const expr = ReplaceOneOperator.valueOf("description");
        expect(() => expr.replacement(null as any)).toThrow("Replacement must not be null");
    });

    test('TC_REPLACEONE_012: replacementOf(null) => throw error', () => {
        const expr = ReplaceOneOperator.valueOf("description");
        expect(() => expr.replacementOf(null as any)).toThrow("Replacement must not be null");
    });
});
