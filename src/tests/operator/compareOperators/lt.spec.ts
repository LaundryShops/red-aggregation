import { Lt } from "../../../operator/compareOperators/lt";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Lt Operator Integration Test", () => {
  it("should create $lt from field reference", () => {
    const lt = Lt.valueOf("price");

    expect(lt.toDocument(new NoOpAggregationOperationContext())).toEqual({
      $lt: ["$price"],
    });
  });

//   it("should create $lt from expression object", () => {
//     const lt = Lt.valueOf({ $abs: -5 });

//     expect(lt.toDocument(new NoOpAggregationOperationContext())).toEqual({
//       $lt: [{ $abs: -5 }],
//     });
//   });

  it("should compare field less than another field", () => {
    const lt = Lt.valueOf("price").lessThan("discount");

    expect(lt.toDocument(new NoOpAggregationOperationContext())).toEqual({
      $lt: ["$price", "$discount"],
    });
  });

//   it("should compare field less than expression", () => {
//     const lt = Lt.valueOf("price").lessThan({ $abs: "$discount" });

//     expect(lt.toDocument(new NoOpAggregationOperationContext())).toEqual({
//       $lt: ["$price", { $abs: "$discount" }],
//     });
//   });

  it("should compare field less than literal value", () => {
    const lt = Lt.valueOf("price").lessThanValue(100);

    expect(lt.toDocument(new NoOpAggregationOperationContext())).toEqual({
      $lt: ["$price", 100],
    });
  });

  it("should chain lessThan and lessThanValue", () => {
    const lt = Lt.valueOf("price")
      .lessThan("discount")
      .lessThanValue(50);

    expect(lt.toDocument(new NoOpAggregationOperationContext())).toEqual({
      $lt: ["$price", "$discount", 50],
    });
  });
});