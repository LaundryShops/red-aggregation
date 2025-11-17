import { Add } from "../../../operator/arithmeticOperators/add";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";

describe('Add Integration Test', () => {
    it('should chain add() with number operand', () => {
        const add = Add.valueOf('price').add(5);
        expect(add.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$add': ['$price', 5] });
    });

    it('should chain .add() with multiple operands', () => {
        const add = Add.valueOf('price')
            .add(5)
            .add('discount')

        expect(add.toDocument(new NoOpAggregationOperationContext()))
            .toEqual({ '$add': ['$price', 5, '$discount'] });
    });

    //   it('should create Add from expression', () => {
    //     const expr = { $sum: ['$qty', '$price'] };
    //     const add = Add.valueOf(expr);
    //     expect(add).toBeInstanceOf(Add);
    //     expect(add.toDocument(new NoOpAggregationOperationContext()))
    //       .toEqual({ '$add': [expr] });
    //   });

    it('should throw error when input is null', () => {
        expect(() => Add.valueOf(null as any)).toThrow('FieldReference must not be null');
    });
});
