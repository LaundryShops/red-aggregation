import { Fields } from "../../../aggregate/field";
import { GetField } from "../../../operator/objectOperators/getField";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("GetField Operator Integration Test", () => {
  it("should create $getField from field name string using static getField", () => {
    const getField = GetField.getField("price");

    const doc = getField.toDocument(new NoOpAggregationOperationContext());
    expect(doc).toEqual({ $getField: { field: "price" } });
  });

  it("should create $getField from Field instance", () => {
    const field = Fields.field("price");
    const getField = new GetField(new Map().set("field", field));

    const doc = getField.toDocument(new NoOpAggregationOperationContext());
    expect(doc).toEqual({ $getField: { field: "$price" } });
  });

  it("should create $getField from Map with raw value", () => {
    const getField = new GetField(new Map().set("field", "price"));

    const doc = getField.toDocument(new NoOpAggregationOperationContext());
    expect(doc).toEqual({ $getField: { field: "price" } });
  });

  it("should create $getField with input as object", () => {
    const getField = GetField.getField("price").of({ $abs: "$discount" });

    const doc = getField.toDocument(new NoOpAggregationOperationContext());
    expect(doc).toEqual({
      $getField: {
        field: "price",
        input: { $abs: "$discount" }
      }
    });
  });

  it("should create $getField with input as aggregation expression", () => {
    // Giả lập AggregationExpression bằng object
    const aggExpr = { $add: ["$price", 10] };
    const getField = GetField.getField("total").of(aggExpr);

    const doc = getField.toDocument(new NoOpAggregationOperationContext());
    expect(doc).toEqual({
      $getField: {
        field: "total",
        input: { $add: ["$price", 10] }
      }
    });
  });

  it("should allow chaining of of() multiple times", () => {
    const getField = GetField.getField("amount")
      .of({ $multiply: ["$qty", 2] })
      .of({ $add: ["$tax", 5] });

    const doc = getField.toDocument(new NoOpAggregationOperationContext());
    expect(doc).toEqual({
      $getField: {
        field: "amount",
        input: { $add: ["$tax", 5] }
      }
    });
  });
});

