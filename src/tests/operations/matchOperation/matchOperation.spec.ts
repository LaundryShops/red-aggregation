import { MatchOperation } from "../../../operations/matchOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { AggregationExpression } from "../../../aggregationExpression";
import { AggregationOperationContext } from "../../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Document } from "mongodb";
import { ClauseDefinition } from "../../../query/standardDefinition";

class TrackingContext extends NoOpAggregationOperationContext {
    public lastMapped: Document | null = null;

    override getMappedObject(document: Document): Document {
        this.lastMapped = document;
        return super.getMappedObject(document);
    }
}

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

class StubCriterialDefinition extends ClauseDefinition {
    constructor(private readonly document: Document) {
        super();
    }

    getCriteriaObject(): Document {
        return this.document;
    }

    getKey(): string | null {
        return null;
    }
}

describe("MatchOperation $match operator", () => {
    it("should create $match from raw criteria", () => {
        const context = new TrackingContext();
        const criteria = { status: "ACTIVE" } as Document;

        const operation = new MatchOperation(criteria);
        const document = operation.toDocument(context);

        expect(document).toEqual({
            $match: criteria
        });
        expect(context.lastMapped).toEqual(criteria);
    });

    it("should create $match using aggregation expression", () => {
        const expressionDoc = { score: { $gt: 10 } } as Document;
        const context = new TrackingContext();
        const expression = new StubAggregationExpression(expressionDoc);

        const operation = new MatchOperation(expression);
        const document = operation.toDocument(context);

        expect(document).toEqual({
            $match: expressionDoc
        });
        expect(context.lastMapped).toEqual(expressionDoc);
    });

    it("should create $match using criterial definition", () => {
        const definitionDoc = { role: { $eq: "admin" } } as Document;
        const context = new TrackingContext();
        const definition = new StubCriterialDefinition(definitionDoc);

        const operation = new MatchOperation(definition);
        const document = operation.toDocument(context);

        expect(document).toEqual({
            $match: definitionDoc
        });
        expect(context.lastMapped).toEqual(definitionDoc);
    });

    it("should throw when expression is null or undefined", () => {
        expect(() => new MatchOperation(null as unknown as Document)).toThrow(
            "Expression must not be null"
        );
        expect(() => new MatchOperation(undefined as unknown as Document)).toThrow(
            "Expression must not be null"
        );
    });
});

