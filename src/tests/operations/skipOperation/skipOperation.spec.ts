import { SkipOperation } from "../../../operations/skipOperation";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("SkipOperation $skip operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should render $skip document with provided count", () => {
        const operation = new SkipOperation(5);
        const document = operation.toDocument(context);

        expect(document).toEqual({
            $skip: 5
        });
    });

    it("should expose operator name", () => {
        const operation = new SkipOperation(3);

        expect(operation.getOperator()).toBe("$skip");
    });

    it.each([-1, -10])("should throw when skip count %s is not positive", (invalidCount) => {
        expect(() => new SkipOperation(invalidCount)).toThrow("Skip count must not be negative");
    });
});
