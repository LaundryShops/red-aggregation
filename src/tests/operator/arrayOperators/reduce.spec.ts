import { Fields } from "../../../aggregate/field";
import { PropertyExpression, Reduce } from "../../../operator/arrayOperators/reduce";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe("Reduce Operator", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
        jest.spyOn(context, "getReference").mockImplementation((field: any) => ({ toString: () => `$${field}` } as any));
        jest.spyOn(context, "getMappedObject").mockImplementation((obj: any) => obj);
    });

    it("should reduce over a literal array with initial value and aggregation expression", () => {
        const reduceOp = Reduce.arrayOf([1, 2, 3])
            .withInitialValue(0)
            .reduce({
                $add: ["$$value", "$$this"]
            });

        const doc = reduceOp.toDocument(context);
        expect(doc).toEqual({
            $reduce: {
                input: [1, 2, 3],
                initialValue: 0,
                in: { $add: ["$$value", "$$this"] }
            }
        });
    });

    it("should reduce over a field reference string", () => {
        jest.spyOn(Fields, "field").mockReturnValue("scores" as any);

        const reduceOp = Reduce.arrayOf("scores")
            .withInitialValue(0)
            .reduce({
                $add: ["$$value", "$$this"]
            });

        const doc = reduceOp.toDocument(context);
        expect(doc).toEqual({
            $reduce: {
                input: "scores",
                initialValue: 0,
                in: { $add: ["$$value", "$$this"] }
            }
        });
    });

    it("should reduce using PropertyExpression", () => {
        const propExpr = PropertyExpression.property("total").definedAs({
            toDocument: jest.fn().mockReturnValue({ $sum: ["$$value", "$$this"] })
        });

        const reduceOp = Reduce.arrayOf([10, 20])
            .withInitialValue(0)
            .reduce(propExpr);

        const doc = reduceOp.toDocument(context);
        expect(doc).toEqual({
            $reduce: {
                input: [10, 20],
                initialValue: 0,
                in: { total: { $sum: ["$$value", "$$this"] } }
            }
        });
    });

    it("should throw if arrayOf called with null", () => {
        expect(() => Reduce.arrayOf(null as any)).toThrow("Value must not be null");
    });
});