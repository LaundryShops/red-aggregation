import { SortByCountOperation } from "../../../operations/sortByCountOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { AggregationExpression } from "../../../aggregationExpression";
import { AggregationOperationContext } from "../../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Document } from "mongodb";

class StubAggregationExpression extends AggregationExpression {
    constructor(private readonly document: Document) {
        super();
    }

    toDocument(context: AggregationOperationContext): Document;
    toDocument(context: AggregationOperationContext, value: unknown): Document;
    toDocument(_context: AggregationOperationContext): Document {
        return this.document;
    }
}

describe("SortByCountOperation $sortByCount operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create $sortByCount using field reference", () => {
        const operation = new SortByCountOperation(Fields.field("category"));
        const document = operation.toDocument(context);

        expect(document).toEqual({
            $sortByCount: "$category"
        });
    });

    it("should create $sortByCount using aggregation expression", () => {
        const expressionDoc = { $concat: ["$brand", "-", "$category"] } as Document;
        const expression = new StubAggregationExpression(expressionDoc);
        const operation = new SortByCountOperation(expression);

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $sortByCount: expressionDoc
        });
    });

    it("should create $sortByCount using raw document", () => {
        const rawDoc = { $substr: ["$name", 0, 3] } as Document;
        const operation = new SortByCountOperation(rawDoc);

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $sortByCount: rawDoc
        });
    });

    it.each([null, undefined])("should throw when expression is %s", (value) => {
        expect(() => new SortByCountOperation(value as any)).toThrow("Expression count must not be negative");
    });

    it("should expose operator name", () => {
        const operation = new SortByCountOperation(Fields.field("category"));
        expect(operation.getOperator()).toBe("$sortByCount");
    });
});

