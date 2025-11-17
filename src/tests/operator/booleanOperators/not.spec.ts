import { Not } from "../../../operator/booleanOperators/not";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Not Operator Integration Test", () => {
    it("should create $not with a literal value", () => {
        const not = Not.not(true);

        expect(not.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $not: [true],
        });
    });

    it("should add literal value with notValue", () => {
        const not = Not.not(true).notValue(false);

        expect(not.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $not: [true, false],
        });
    });

    it("should add field reference with notField", () => {
        const not = Not.not(true).notField("isActive");

        expect(not.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $not: [true, "$isActive"],
        });
    });

    it("should add nested expression with notExpression", () => {
        const nested = Not.not(false);
        const not = Not.not(true).notExpression(nested);

        expect(not.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $not: [true, { $not: [false] }],
        });
    });

    it("should chain notValue, notField and notExpression", () => {
        const nested = Not.not(false);
        const not = Not.not(true).notValue(false).notField("isDeleted").notExpression(nested);

        expect(not.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $not: [true, false, "$isDeleted", { $not: [false] }],
        });
    });

    it("should create $not with empty array when no input", () => {
        const not = Not.not();

        expect(not.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $not: [],
        });
    });
});