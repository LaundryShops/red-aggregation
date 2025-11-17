import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { Switch, CaseOperator } from "../../../operator/conditionalOperators/switch";
import { Gt } from "../../../operator/compareOperators/gt";
import { Fields } from "../../../aggregate/field";
import { ArithmeticOperators } from "../../../operator/arithmeticOperators/arithmeticOperators";

describe("Switch conditional operator ($switch)", () => {
    let context: NoOpAggregationOperationContext;

    beforeEach(() => {
        context = new NoOpAggregationOperationContext();
    });

    it("should build single branch with default literal", () => {
        const cond = Gt.valueOf("score").greaterThanValue(90);
        const c1 = CaseOperator.thenBuilder(cond).then("A");

        const sw = Switch.switchCases(c1).defaultTo("N/A");
        const doc = sw.toDocument(context);

        expect(doc).toEqual({
            $switch: {
                branches: [
                    {
                        case: { $gt: ["$score", 90] },
                        then: "A",
                    },
                ],
                default: "N/A",
            },
        });
    });

    it("should build multiple branches with varargs", () => {
        const c1 = CaseOperator.thenBuilder(Gt.valueOf("score").greaterThanValue(90)).then("A");
        const c2 = CaseOperator.thenBuilder(Gt.valueOf("score").greaterThanValue(75)).then("B");
        const c3 = CaseOperator.thenBuilder(Gt.valueOf("score").greaterThanValue(60)).then("C");

        const sw = Switch.switchCases(c1, c2, c3).defaultTo("F");
        const doc = sw.toDocument(context);

        expect(doc).toEqual({
            $switch: {
                branches: [
                    { case: { $gt: ["$score", 90] }, then: "A" },
                    { case: { $gt: ["$score", 75] }, then: "B" },
                    { case: { $gt: ["$score", 60] }, then: "C" },
                ],
                default: "F",
            },
        });
    });

    it("should build using array input and 'then' as field reference", () => {
        const c1 = CaseOperator.thenBuilder(Gt.valueOf("qty").greaterThanValue(0)).then(Fields.field("inStock"));
        const sw = Switch.switchCases([c1]).defaultTo(false);
        const doc = sw.toDocument(context);

        expect(doc).toEqual({
            $switch: {
                branches: [
                    {
                        case: { $gt: ["$qty", 0] },
                        then: "$inStock",
                    },
                ],
                default: false,
            },
        });
    });

    it("should support AggregationExpression as 'then' value", () => {
        const cond = Gt.valueOf("price").greaterThanValue(100);
        const thenExpr = ArithmeticOperators.add("$price").add(10);
        const c1 = CaseOperator.thenBuilder(cond).then(thenExpr);

        const sw = Switch.switchCases(c1).defaultTo(0);
        const doc = sw.toDocument(context);

        expect(doc).toEqual({
            $switch: {
                branches: [
                    {
                        case: { $gt: ["$price", 100] },
                        then: { $add: ["$price", 10] },
                    },
                ],
                default: 0,
            },
        });
    });
});

