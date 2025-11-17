import { Fields } from "../../../aggregate/field";
import { ReverseArray } from "../../../operator/arrayOperators/reverseArray";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("ReverseArray Operator", () => {
  let context: NoOpAggregationOperationContext;

  beforeEach(() => {
    context = new NoOpAggregationOperationContext();
    jest.spyOn(context, "getReference").mockImplementation((field: any) => ({ toString: () => `$${field}` } as any));
  });

  it("should reverse a literal array", () => {
    const op = ReverseArray.reverseArray([1, 2, 3]);
    const doc = op.toDocument(context);
    expect(doc).toEqual({
      $reverseArray: [1, 2, 3]
    });
  });

  it("should reverse a field reference string", () => {
    jest.spyOn(Fields, "field").mockReturnValue("arrField" as any);

    const op = ReverseArray.reverseArrayOf("arrField");
    const doc = op.toDocument(context);
    expect(doc).toEqual({
      $reverseArray: "arrField"
    });
  });

  it("should reverse a plain object", () => {
    const obj = { a: 1, b: 2 };
    const op = ReverseArray.reverseArrayOf(obj);
    const doc = op.toDocument(context);
    expect(doc).toEqual({
      $reverseArray: { a: 1, b: 2 }
    });
  });

  it("should throw if null is passed", () => {
    expect(() => ReverseArray.reverseArrayOf(null as any)).toThrow("Value must not be null");
  });
});
