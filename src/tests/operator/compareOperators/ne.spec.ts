import { Ne } from "../../../operator/compareOperators/ne";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Ne Operator Integration Test", () => {
    it("should create $ne from field reference", () => {
        const ne = Ne.valueOf("price");

        expect(ne.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $ne: ["$price"],
        });
    });

    // it("should create $ne from expression object", () => {
    //     const ne = Ne.valueOf({ $abs: -5 });

    //     expect(ne.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $ne: [{ $abs: -5 }],
    //     });
    // });

    it("should compare field not equal to another field", () => {
        const ne = Ne.valueOf("price").notEqualTo("discount");

        expect(ne.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $ne: ["$price", "$discount"],
        });
    });

    // it("should compare field not equal to expression", () => {
    //     const ne = Ne.valueOf("price").notEqualTo({ $abs: "$discount" });

    //     expect(ne.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $ne: ["$price", { $abs: "$discount" }],
    //     });
    // });

    it("should compare field not equal to literal value", () => {
        const ne = Ne.valueOf("price").notEqualToValue(100);

        expect(ne.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $ne: ["$price", 100],
        });
    });

    it("should chain notEqualTo and notEqualToValue", () => {
        const ne = Ne.valueOf("price")
            .notEqualTo("discount")
            .notEqualToValue(50);

        expect(ne.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $ne: ["$price", "$discount", 50],
        });
    });
});
