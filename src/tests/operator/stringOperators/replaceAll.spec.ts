import { ReplaceAllOperator } from "../../../operator/stringOperators/replaceAll";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('ReplaceAllOperator', () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Happy cases ===

    test('TC_REPLACEALL_001: valueOf(string) => $replaceAll với field reference', () => {
        const expr = ReplaceAllOperator.valueOf("description");
        expect(expr.toDocument(context)).toEqual({
            $replaceAll: { input: "$description" }
        });
    });

    test('TC_REPLACEALL_002: valueOf(AggregationExpression)', () => {
        const expr = ReplaceAllOperator.valueOf({ $toLower: "$description" });
        expect(expr.toDocument(context)).toEqual({
            $replaceAll: { input: { $toLower: "$description" } }
        });
    });

    test('TC_REPLACEALL_003: value(string)', () => {
        const expr = ReplaceAllOperator.value("static text");
        expect(expr.toDocument(context)).toEqual({
            $replaceAll: { input: "static text" }
        });
    });

    test('TC_REPLACEALL_004: find(string) + replacement(string)', () => {
        const expr = ReplaceAllOperator.valueOf("description")
            .find("foo")
            .replacement("bar");
        expect(expr.toDocument(context)).toEqual({
            $replaceAll: {
                input: "$description",
                find: "foo",
                replacement: "bar"
            }
        });
    });

    test('TC_REPLACEALL_005: findValueOf(fieldReference) + replacementOf(fieldReference)', () => {
        const expr = ReplaceAllOperator.valueOf("description")
            .findValueOf("searchField")
            .replacementOf("replaceField");
        expect(expr.toDocument(context)).toEqual({
            $replaceAll: {
                input: "$description",
                find: "$searchField",
                replacement: "$replaceField"
            }
        });
    });

    test('TC_REPLACEALL_006: find(AggregationExpression) + replacement(AggregationExpression)', () => {
        const expr = ReplaceAllOperator.valueOf("description")
            .findValueOf({ $toLower: "$searchField" })
            .replacementOf({ $toUpper: "$replaceField" });
        expect(expr.toDocument(context)).toEqual({
            $replaceAll: {
                input: "$description",
                find: { $toLower: "$searchField" },
                replacement: { $toUpper: "$replaceField" }
            }
        });
    });

    // === Negative cases ===

    test('TC_REPLACEALL_007: valueOf(null) => throw error', () => {
        expect(() => ReplaceAllOperator.valueOf(null as any)).toThrow("Value must not be null");
    });

    test('TC_REPLACEALL_008: value(null) => throw error', () => {
        expect(() => ReplaceAllOperator.value(null as any)).toThrow("Value must not be null");
    });

    test('TC_REPLACEALL_009: find(null) => throw error', () => {
        const expr = ReplaceAllOperator.valueOf("description");
        expect(() => expr.find(null as any)).toThrow("Search string must not be null");
    });

    test('TC_REPLACEALL_010: findValueOf(null) => throw error', () => {
        const expr = ReplaceAllOperator.valueOf("description");
        expect(() => expr.findValueOf(null as any)).toThrow("Input must not be null");
    });

    test('TC_REPLACEALL_011: replacement(null) => throw error', () => {
        const expr = ReplaceAllOperator.valueOf("description");
        expect(() => expr.replacement(null as any)).toThrow("Replacement must not be null");
    });

    test('TC_REPLACEALL_012: replacementOf(null) => throw error', () => {
        const expr = ReplaceAllOperator.valueOf("description");
        expect(() => expr.replacementOf(null as any)).toThrow("Replacement must not be null");
    });
});
