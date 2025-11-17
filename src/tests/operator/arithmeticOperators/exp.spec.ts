import { Exp } from "../../../operator/arithmeticOperators/exp";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Exp Operator Integration Test", () => {
  it("should create $exp from number", () => {
    const exp = Exp.valueOf(2.5);

    expect(exp.toDocument(new NoOpAggregationOperationContext())).toEqual({
      $exp: 2.5,
    });
  });

  it("should create $exp from field reference", () => {
    const exp = Exp.valueOf("$field");

    expect(exp.toDocument(new NoOpAggregationOperationContext())).toEqual({
      $exp: "$field",
    });
  });

  it("should create $exp from expression", () => {
    const exp = Exp.valueOf({ $add: [1, 2] });

    expect(exp.toDocument(new NoOpAggregationOperationContext())).toEqual({
      $exp: { $add: [1, 2] },
    });
  });
});
