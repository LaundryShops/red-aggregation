import { Fields } from "../../../aggregate/field";
import { In } from "../../../operator/arrayOperators/in";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";


describe("In Operator", () => {
  let context: NoOpAggregationOperationContext;

  beforeEach(() => {
    context = new NoOpAggregationOperationContext();
  });

  it("should create $in operation from string field reference", () => {
    jest.spyOn(Fields, "field").mockReturnValue("$category" as any);

    const inOp = In.arrayOf("category").containsValue("Electronics");
    const doc = inOp.toDocument(context);

    expect(doc).toEqual({
      $in: ["Electronics", "$category"],
    });
  });

  it("should create $in operation from plain object", () => {
    const obj = { $size: "$tags" };
    const inOp = In.arrayOf(obj).containsValue(5);
    const doc = inOp.toDocument(context);

    expect(doc).toEqual({
      $in: [5, { $size: "$tags" }],
    });
  });

  it("should create $in operation from array", () => {
    const arr = [1, 2, 3];
    const inOp = In.arrayOf(arr).containsValue(0);
    const doc = inOp.toDocument(context);

    expect(doc).toEqual({
      $in: [0, [1, 2, 3]],
    });
  });

  it("should throw error if arrayOf called with null", () => {
    expect(() => In.arrayOf(null as any)).toThrow("Value must not be null");
  });

  it("should throw error if containsValue called with null", () => {
    const builder = In.arrayOf("price");
    jest.spyOn(Fields, "field").mockReturnValue("$price" as any);
    expect(() => builder.containsValue(null)).toThrow("Value must not be null");
  });
});
