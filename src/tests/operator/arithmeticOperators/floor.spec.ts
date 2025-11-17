import { Floor } from "../../../operator/arithmeticOperators/floor";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Floor Operator Integration Test", () => {
    it("should create $floor from number", () => {
        const floor = Floor.valueOf(12.7);

        expect(floor.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $floor: 12.7,
        });
    });

    it("should create $floor from field reference", () => {
        const floor = Floor.valueOf("price");

        expect(floor.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $floor: "$price",
        });
    });

    it("should create $floor from expression", () => {
        const floor = Floor.valueOf({ $add: [5.5, 2.3] });

        expect(floor.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $floor: { $add: [5.5, 2.3] },
        });
    });

    it("should throw error when input is null", () => {
        expect(() => Floor.valueOf(null as any)).toThrow("FieldReference must not be null");
    });
});
