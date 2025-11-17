import { UnwindOperation } from "../../../operations/unwindOperation";
import { UnwindOperationBuilder } from "../../../operations/unwindOperation/unwindOperationBuilder";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Fields } from "../../../aggregate/field";

describe("UnwindOperation $unwind operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should create basic $unwind with path only", () => {
        const operation = new UnwindOperation(Fields.field("items"));

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unwind: "$items"
        });
    });

    it("should preserve null and empty arrays when specified", () => {
        const operation = new UnwindOperation(Fields.field("items"), true);

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unwind: {
                path: "$items",
                preserveNullAndEmptyArrays: true
            }
        });
    });

    it("should include array index when provided", () => {
        const operation = new UnwindOperation(
            Fields.field("items"),
            Fields.field("idx"),
            false
        );

        const document = operation.toDocument(context);

        expect(document).toEqual({
            $unwind: {
                path: "$items",
                preserveNullAndEmptyArrays: false,
                includeArrayIndex: "idx"
            }
        });
    });

    it("should expose operator name", () => {
        const operation = new UnwindOperation(Fields.field("items"));
        expect(operation.getOperator()).toBe("$unwind");
    });

    it("should return exposed fields based on array index", () => {
        const operation = new UnwindOperation(
            Fields.field("items"),
            Fields.field("idx"),
            false
        );

        const fields = operation.getFields();
        expect(fields.exposesNoFields()).toBe(false);
        expect(fields.getField("idx")).not.toBeNull();
    });

    describe("builder", () => {
        it("should build $unwind without array index", () => {
            const operation = UnwindOperationBuilder.newBuilder()
                .path("items")
                .noArrayIndex()
                .preserveNullAndEmptyArrays();

            const document = operation.toDocument(context);

            expect(document).toEqual({
                $unwind: {
                    path: "$items",
                    preserveNullAndEmptyArrays: true
                }
            });
        });

        it("should build $unwind with array index and skip null arrays", () => {
            const operation = UnwindOperationBuilder.newBuilder()
                .path("items")
                .arrayIndex("idx")
                .skipNullAndEmptyArrays();

            const document = operation.toDocument(context);

            expect(document).toEqual({
                $unwind: {
                    path: "$items",
                    preserveNullAndEmptyArrays: false,
                    includeArrayIndex: "idx"
                }
            });
        });
    });
});

