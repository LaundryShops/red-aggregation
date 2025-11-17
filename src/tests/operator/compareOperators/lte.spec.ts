import { Lte } from "../../../operator/compareOperators/lte";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Lte Operator Integration Test", () => {
    it("should create $lte from field reference", () => {
        const lte = Lte.valueOf("price");

        expect(lte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $lte: ["$price"],
        });
    });

    // it("should create $lte from expression object", () => {
    //     const lte = Lte.valueOf({ $abs: -5 });

    //     expect(lte.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $lte: [{ $abs: -5 }],
    //     });
    // });

    it("should compare field less than or equal to another field", () => {
        const lte = Lte.valueOf("price").lessThanEqualTo("discount");

        expect(lte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $lte: ["$price", "$discount"],
        });
    });

    // it("should compare field less than or equal to expression", () => {
    //     const lte = Lte.valueOf("price").lessThanEqualTo({ $abs: "$discount" });

    //     expect(lte.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $lte: ["$price", { $abs: "$discount" }],
    //     });
    // });

    it("should compare field less than or equal to literal value", () => {
        const lte = Lte.valueOf("price").lessThanEqualToValue(100);

        expect(lte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $lte: ["$price", 100],
        });
    });

    it("should chain lessThanEqualTo and lessThanEqualToValue", () => {
        const lte = Lte.valueOf("price")
            .lessThanEqualTo("discount")
            .lessThanEqualToValue(50);

        expect(lte.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $lte: ["$price", "$discount", 50],
        });
    });
});