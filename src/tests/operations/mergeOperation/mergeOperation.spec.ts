import { MergeOperation } from "../../../operations/mergeOperation";
import { Let, ExpressionVariable } from "../../../operator/variableOperators/let";
import { WhenDocumentMatch } from "../../../operations/mergeOperation/whenDocumentsMatch";
import { WhenDocumentsDontMatch } from "../../../operations/mergeOperation/whenDocumentsdontMatch";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { AggregateOperation } from "../../../aggregateOperation";

describe("MergeOperation $merge operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create minimal $merge stage when only collection is provided", () => {
        const operation = MergeOperation.builder()
            .intoCollection("users")
            .build();

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $merge: "users"
        });

        expect(operation.getFields().exposesNoFields()).toBe(true);
    });

    it("should merge into collection located in another database", () => {
        const operation = MergeOperation.builder()
            .intoCollection("users")
            .inDatabase("analytics")
            .build();

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $merge: {
                into: {
                    db: "analytics",
                    coll: "users"
                }
            }
        });
    });

    it("should include custom id fields via on option", () => {
        const operation = MergeOperation.builder()
            .intoCollection("users")
            .on("email", "tenantId")
            .build();

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $merge: {
                into: "users",
                on: ["email", "tenantId"]
            }
        });
    });

    it("should include let variables", () => {
        const lets = Let.just(
            ExpressionVariable.newVariable("temp").forField("price"),
            ExpressionVariable.newVariable("discount").forField("discountRate")
        );

        const operation = MergeOperation.builder()
            .intoCollection("users")
            .let(lets)
            .build();

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $merge: {
                into: "users",
                let: {
                    temp: "$price",
                    discount: "$discountRate"
                }
            }
        });

        const fields = operation.getFields();
        expect(fields.getField("temp")).not.toBeNull();
        expect(fields.getField("discount")).not.toBeNull();
    });

    it("should include whenMatched and whenNotMatched options", () => {
        const operation = MergeOperation.builder()
            .intoCollection("users")
            .whenMatched(WhenDocumentMatch.keepExistingDocument())
            .whenNotMatched(WhenDocumentsDontMatch.insertNewDocument())
            .build();

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $merge: {
                into: "users",
                whenMatched: "keepExisting",
                whenNotMatched: "insert"
            }
        });
    });

    it("should support update pipeline configuration when documents match", () => {
        const pipelineStages = [{ $set: { updatedAt: "$$NOW" } }];

        const operation = MergeOperation.builder()
            .intoCollection("users")
            .whenMatched(
                WhenDocumentMatch.updateWith(
                    pipelineStages as unknown as AggregateOperation[]
                )
            )
            .build();

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $merge: {
                into: "users",
                whenMatched: pipelineStages
            }
        });
    });
});

