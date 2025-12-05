import { LookupOperation } from "../../../operations/lookupOperation/lookupOperation";
import { LookupOperationBuilder } from "../../../operations/lookupOperation/lookupOperationBuilder";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";
import { AggregationPipeline } from "../../../aggregationPipeline";
import { AggregateOperation } from "../../../aggregateOperation";
import { Let, ExpressionVariable } from "../../../operator/variableOperators/let";
import { Document } from "mongodb";

class RecordingOperation extends AggregateOperation {
    constructor(private readonly doc: Document) {
        super();
    }

    toDocument(): Document {
        return this.doc;
    }

    getOperator(): string {
        return Object.keys(this.doc)[0] ?? "$noop";
    }
}

describe("LookupOperation $lookup operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create simple lookup using local and foreign fields", () => {
        const operation = new LookupOperation(
            Fields.field("orders"),
            Fields.field("customerId"),
            Fields.field("id"),
            Fields.field("customer")
        );

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $lookup: {
                from: "orders",
                as: "customer",
                localField: "customerId",
                foreignField: "id"
            }
        });

        const exposedFields = operation.getFields();
        expect(exposedFields.getField("customer")).not.toBeNull();
    });

    it("should create lookup with let variables and pipeline", () => {
        const variable = ExpressionVariable.newVariable("orderId").forField("orderId");
        const lets = Let.just(variable);
        const pipeline = AggregationPipeline.of(new RecordingOperation({ $match: { $expr: { $eq: ["$id", "$$orderId"] } } }));

        const operation = new LookupOperation(
            "orders",
            lets,
            pipeline,
            Fields.field("matchedOrders")
        );

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $lookup: {
                from: "orders",
                as: "matchedOrders",
                let: {
                    orderId: "$orderId"
                },
                pipeline: [{ $match: { $expr: { $eq: ["$id", "$$orderId"] } } }]
            }
        });
    });

    it("should support builder flow for local/foreign fields", () => {
        const operation = new LookupOperationBuilder()
            .from("orders")
            .localField("customerId")
            .foreignField("id")
            .as("customer");

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $lookup: {
                from: "orders",
                as: "customer",
                localField: "customerId",
                foreignField: "id"
            }
        });
    });

    it("should support builder flow with let variables and pipeline stages", () => {
        const eqPipelineStage = new RecordingOperation({ $match: { status: "ACTIVE" } });
        const operation = new LookupOperationBuilder()
            .from("orders")
            .let(ExpressionVariable.newVariable("customerId").forField("customerId"))
            .pipeline(eqPipelineStage)
            .as("activeOrders");

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $lookup: {
                from: "orders",
                as: "activeOrders",
                let: {
                    customerId: "$customerId"
                },
                pipeline: [{ $match: { status: "ACTIVE" } }]
            }
        });
    });

    it("should allow builder pipeline with multiple operations", () => {
        const stages = [
            new RecordingOperation({ $match: { status: "ACTIVE" } }),
            new RecordingOperation({ $project: { status: 1 } })
        ];

        const operation = new LookupOperationBuilder()
            .from("orders")
            .let(ExpressionVariable.newVariable("customerId").forField("customerId"))
            .pipeline(...stages)
            .as("activeOrders");

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $lookup: {
                from: "orders",
                as: "activeOrders",
                let: {
                    customerId: "$customerId"
                },
                pipeline: [
                    { $match: { status: "ACTIVE" } },
                    { $project: { status: 1 } }
                ]
            }
        });
    });
});

