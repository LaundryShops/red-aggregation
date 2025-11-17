import { Gte } from "../../../operator/compareOperators/gte";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Gte Operator Integration Test", () => {
    it("should create $gte from field reference", () => {
        const gte = Gte.valueOf("price");

        expect(gte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gte: ["$price"],
        });
    });

    // it("should create $gte from expression object", () => {
    //     const gte = Gte.valueOf({ $abs: -5 });

    //     expect(gte.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $gte: [{ $abs: -5 }],
    //     });
    // });

    it("should compare field greater than or equal to another field", () => {
        const gte = Gte.valueOf("price").greaterThanEqualTo("discount");

        expect(gte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gte: ["$price", "$discount"],
        });
    });

    // it("should compare field greater than or equal to expression", () => {
    //     const gte = Gte.valueOf("price").greaterThanEqualTo({ $abs: "$discount" });

    //     expect(gte.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $gte: ["$price", { $abs: "$discount" }],
    //     });
    // });

    it("should compare field greater than or equal to literal value", () => {
        const gte = Gte.valueOf("price").greaterThanEqualToValue(100);

        expect(gte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gte: ["$price", 100],
        });
    });

    it("should chain greaterThanEqualTo and greaterThanEqualToValue", () => {
        const gte = Gte.valueOf("price")
            .greaterThanEqualTo("discount")
            .greaterThanEqualToValue(50);

        expect(gte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $gte: ["$price", "$discount", 50],
        });
    });
});
