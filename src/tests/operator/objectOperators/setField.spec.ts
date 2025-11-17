import { Fields } from "../../../aggregate/field";
import { SetField } from "../../../operator/objectOperators/setField";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("SetField MongoDB $setField Integration Test", () => {
    const context = new NoOpAggregationOperationContext();

    it("should create SetField from string field name", () => {
        const setField = SetField.field("price");
        const doc = setField.toDocument(context);

        expect(doc).toEqual({
            $setField: {
                field: "price"
            }
        });
    });

    it("should create SetField from Field instance", () => {
        const field = Fields.field("discount");
        const setField = SetField.field(field);
        const doc = setField.toDocument(context);

        expect(doc).toEqual({
            $setField: {
                field: "$discount"
            }
        });
    });

    it("should set input from field name", () => {
        const setField = SetField.field("price").input("discount");
        const doc = setField.toDocument(context);

        expect(doc).toEqual({
            $setField: {
                field: "price",
                input: "$discount"
            }
        });
    });

    it("should set input from Field instance", () => {
        const setField = SetField.field("price").input(Fields.field("discount"));
        const doc = setField.toDocument(context);

        expect(doc).toEqual({
            $setField: {
                field: "price",
                input: "$discount"
            }
        });
    });

    it("should set input from expression object", () => {
        const expr = { $add: ["$price", 10] };
        const setField = SetField.field("price").input(expr);
        const doc = setField.toDocument(context);

        expect(doc).toEqual({
            $setField: {
                field: "price",
                input: expr
            }
        });
    });

    it("should set value correctly", () => {
        const setField = SetField.field("price").toValue(100);
        const doc = setField.toDocument(context);

        expect(doc).toEqual({
            $setField: {
                field: "price",
                value: 100
            }
        });
    });

    it("should support chaining input and toValue", () => {
        const expr = { $add: ["$price", 10] };
        const setField = SetField.field("price").input("discount").toValue(expr);
        const doc = setField.toDocument(context);

        expect(doc).toEqual({
            $setField: {
                field: "price",
                input: "$discount",
                value: expr
            }
        });
    });
});