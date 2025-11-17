import { ArrayToObject } from "../../../operator/arrayOperators/arrayToObject";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("ArrayToObject", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    // === Positive cases ===

    test("TC_ARRAYTOOBJECT_001: arrayToObject(value) => $arrayToObject với biểu thức object", () => {
        const expr = ArrayToObject.arrayToObject([{ k: "name", v: "Alice" }]);
        expect(expr.toDocument(context)).toEqual({
            $arrayToObject: [[{ k: "name", v: "Alice" }]],
        });
    });

    test("TC_ARRAYTOOBJECT_002: arrayValueOfToObject(string) => $arrayToObject với field reference", () => {
        const expr = ArrayToObject.arrayValueOfToObject("pairs");
        expect(expr.toDocument(context)).toEqual({
            $arrayToObject: "$pairs",
        });
    });

    test("TC_ARRAYTOOBJECT_003: arrayValueOfToObject(AggregationExpression object)", () => {
        const expr = ArrayToObject.arrayValueOfToObject({ $map: { input: "$docs", as: "d", in: ["$$d.k", "$$d.v"] } });
        expect(expr.toDocument(context)).toEqual({
            $arrayToObject: [{ $map: { input: "$docs", as: "d", in: ["$$d.k", "$$d.v"] } }],
        });
    });

    test("TC_ARRAYTOOBJECT_004: getMongoMethod() => trả về $arrayToObject", () => {
        const expr = ArrayToObject.arrayToObject([{ k: "x", v: 1 }]);
        expect(expr["getMongoMethod"]()).toBe("$arrayToObject");
    });

    // === Negative / structure validation ===

    test("TC_ARRAYTOOBJECT_005: toDocument() output đúng cú pháp Mongo aggregate", () => {
        const expr = ArrayToObject.arrayValueOfToObject("arr");
        const doc = expr.toDocument(context);
        expect(Object.keys(doc)[0]).toBe("$arrayToObject");
        expect(doc.$arrayToObject).toBe("$arr");
    });
});
