import { UnsetOperation } from "../../../operations/unsetOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { AggregationExpression } from "../../../aggregationExpression";
import { AggregationOperationContext } from "../../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Document } from "mongodb";

class StubExpression extends AggregationExpression {
    constructor(private readonly document: Document) {
        super();
    }

    toDocument(context: AggregationOperationContext): Document;
    toDocument(context: AggregationOperationContext, value: unknown): Document;
    toDocument(_context: AggregationOperationContext): Document {
        return this.document;
    }
}

describe("UnsetOperation $unset operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create $unset document for single field", () => {
        const operation = UnsetOperation.unset("deprecatedField");

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unset: "deprecatedField"
        });
    });

    it("should create $unset document for multiple field names", () => {
        const operation = UnsetOperation.unset("fieldA", "fieldB");

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unset: ["fieldA", "fieldB"]
        });
    });

    it("should accept Field instances and map to raw names", () => {
        const field = Fields.field("aliasField", "actualField");
        const operation = new UnsetOperation([field]);

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unset: "actualField"
        });
    });

    it("should support AggregationExpression entries", () => {
        const exprDoc = { $concat: ["$first", "-", "$second"] } as Document;
        const expression = new StubExpression(exprDoc);
        const operation = new UnsetOperation([expression]);

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unset: exprDoc
        });
    });

    it("should chain additional fields using and()", () => {
        const operation = UnsetOperation.unset("first").and("second");

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unset: ["first", "second"]
        });
        expect(operation.removedFieldNames()).toEqual(["first", "second"]);
    });

    it("should expose operator name", () => {
        const operation = UnsetOperation.unset("field");
        expect(operation.getOperator()).toBe("$unset");
    });

    it("should throw when fields contain null entries", () => {
        expect(() => new UnsetOperation(["valid", null])).toThrow(
            "Fields must not be null"
        );
    });
});

