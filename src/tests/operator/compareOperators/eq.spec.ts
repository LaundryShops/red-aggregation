import { Eq } from "../../../operator/compareOperators/eq";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Eq Operator Integration Test", () => {
    it("should create $eq from field reference", () => {
        const eq = Eq.valueOf("price");

        expect(eq.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $eq: ["$price"],
        });
    });

    // it("should create $eq from expression object", () => {
    //     const eq = Eq.valueOf({ $abs: -5 });

    //     expect(eq.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $eq: [{ $abs: -5 }],
    //     });
    // });

    it("should compare field equal to another field", () => {
        const eq = Eq.valueOf("price").equalTo("discount");

        expect(eq.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $eq: ["$price", "$discount"],
        });
    });

    // it("should compare field equal to expression", () => {
    //     const eq = Eq.valueOf("price").equalTo({ $abs: "$discount" });

    //     expect(eq.toDocument(new NoOpAggregationOperationContext())).toEqual({
    //         $eq: ["$price", { $abs: "$discount" }],
    //     });
    // });

    it("should compare field equal to literal value", () => {
        const eq = Eq.valueOf("price").equalToValue(100);

        expect(eq.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $eq: ["$price", 100],
        });
    });

    it("should chain equalTo and equalToValue", () => {
        const eq = Eq.valueOf("price")
            .equalTo("discount")
            .equalToValue(50);

        expect(eq.toDocument(new NoOpAggregationOperationContext())).toEqual({
            $eq: ["$price", "$discount", 50],
        });
    });
});
