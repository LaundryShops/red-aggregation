import { UnionWithOperation } from "../../../operations/unionWithOperation";
import { AggregationPipeline } from "../../../aggregationPipeline";
import { AggregateOperation } from "../../../aggregateOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import ExposedFieldsAggregationOperationContext from "../../../aggregate/aggregateOperationContext/exposedFieldsAggregationOperationContext";
import { ExposedFields } from "../../../aggregate/field/exposeFields";
import { Document } from "mongodb";

class RecordingOperation extends AggregateOperation {
    private readonly operator: string;

    constructor(private readonly payload: Document, private readonly onCalled?: (context: any) => void) {
        super();
        this.operator = Object.keys(payload)[0] ?? "$noop";
    }

    toDocument(context: any): Document {
        this.onCalled?.(context);
        return this.payload;
    }

    getOperator(): string {
        return this.operator;
    }
}

describe("UnionWithOperation $unionWith operator", () => {
    let rootContext: NoOpAggregationOperationContext;

    beforeEach(() => {
        rootContext = new NoOpAggregationOperationContext();
    });

    it("should render $unionWith without pipeline", () => {
        const operation = UnionWithOperation.unionWith("archivedOrders");

        const document = operation.toDocument(rootContext);

        expect(document).toEqual({
            $unionWith: { coll: "archivedOrders" }
        });
    });

    it("should include pipeline documents when provided", () => {
        const recordingOperation = new RecordingOperation({ $match: { status: "ACTIVE" } });
        const pipeline = AggregationPipeline.of(recordingOperation);
        const operation = new UnionWithOperation("archivedOrders", pipeline);

        const document = operation.toDocument(rootContext);

        expect(document).toEqual({
            $unionWith: {
                coll: "archivedOrders",
                pipeline: [[{ $match: { status: "ACTIVE" } }]]
            }
        });
    });

    it("should strip exposed-field context before executing pipeline", () => {
        let receivedContext: any = null;
        const recordingOperation = new RecordingOperation({ $project: { name: 1 } }, (context) => {
            receivedContext = context;
        });
        const pipeline = AggregationPipeline.of(recordingOperation);
        const operation = new UnionWithOperation("customers", pipeline);

        const exposedContext = new ExposedFieldsAggregationOperationContext(
            ExposedFields.from(),
            rootContext
        );

        operation.toDocument(exposedContext);

        expect(receivedContext).toBe(rootContext);
    });

    it("should accept pipeline builders with variadic operations", () => {
        const op1 = new RecordingOperation({ $match: { type: "A" } });
        const op2 = new RecordingOperation({ $project: { type: 1 } });

        const operation = UnionWithOperation.unionWith("archivedOrders").pipeline(op1, op2);

        const document = operation.toDocument(rootContext);

        expect(document).toEqual({
            $unionWith: {
                coll: "archivedOrders",
                pipeline: [
                    [{ $match: { type: "A" } }],
                    [{ $project: { type: 1 } }]
                ]
            }
        });
    });
});

