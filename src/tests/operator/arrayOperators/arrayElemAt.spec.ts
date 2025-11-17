import { ArrayElemAt } from "../../../operator/arrayOperators/arrayElemAt";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("ArrayElemAt", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Positive cases ===

    test("TC_ARRAYELEMAT_001: arrayOf(string) => $arrayElemAt với field reference", () => {
        const expr = ArrayElemAt.arrayOf("items").elementAt(0);
        expect(expr.toDocument(context)).toEqual({
            $arrayElemAt: ["$items", 0],
        });
    });

    test("TC_ARRAYELEMAT_002: arrayOf(expression object)", () => {
        const expr = ArrayElemAt.arrayOf({ $split: ["$tags", ","] }).elementAt(1);
        expect(expr.toDocument(context)).toEqual({
            $arrayElemAt: [{ $split: ["$tags", ","] }, 1],
        });
    });

    test("TC_ARRAYELEMAT_003: elementAt(number)", () => {
        const expr = ArrayElemAt.arrayOf("list").elementAt(5);
        expect(expr.toDocument(context)).toEqual({
            $arrayElemAt: ["$list", 5],
        });
    });

    test("TC_ARRAYELEMAT_004: elementAt(fieldReference string)", () => {
        const expr = ArrayElemAt.arrayOf("values").elementAt("indexField");
        expect(expr.toDocument(context)).toEqual({
            $arrayElemAt: ["$values", "$indexField"],
        });
    });

    test("TC_ARRAYELEMAT_005: elementAt(AggregationExpression object)", () => {
        const expr = ArrayElemAt.arrayOf("values").elementAt({ $add: ["$i", 1] });
        expect(expr.toDocument(context)).toEqual({
            $arrayElemAt: ["$values", { $add: ["$i", 1] }],
        });
    });

    test("TC_ARRAYELEMAT_006: getMongoMethod() => trả về $arrayElemAt", () => {
        const expr = ArrayElemAt.arrayOf("arr");
        expect(expr["getMongoMethod"]()).toBe("$arrayElemAt");
    });

    // === Negative cases ===

    test("TC_ARRAYELEMAT_007: arrayOf(null) => throw error", () => {
        expect(() => ArrayElemAt.arrayOf(null as any)).toThrow("Value must not be null");
    });

    // === Structure validation ===

    test("TC_ARRAYELEMAT_008: toDocument() output đúng cú pháp Mongo aggregate", () => {
        const expr = ArrayElemAt.arrayOf("myArray").elementAt(2);
        const doc = expr.toDocument(context);
        expect(Object.keys(doc)[0]).toBe("$arrayElemAt");
        expect(Array.isArray(doc.$arrayElemAt)).toBe(true);
        expect(doc.$arrayElemAt.length).toBe(2);
    });
});
