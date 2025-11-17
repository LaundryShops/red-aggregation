import { Document } from "mongodb";
import { AggregateOperation } from "../../aggregateOperation";
import { AggregationOperationContext } from "../../aggregate/aggregateOperationContext/aggregationOperationContext";
import { Assert } from "../../utils";

export class LimitOperation extends AggregateOperation {
    private readonly maxElements: number;

    constructor(maxElements: number) {
        Assert.isTrue(maxElements >= 0, 'Maximum number of elements must be greater or equal to 0')
        super();
        this.maxElements = maxElements;
    }
    
    getOperator(): string {
        return '$limit';
    }

    toDocument(context: AggregationOperationContext): Document {
        return {
            [this.getOperator()]: this.maxElements,
        }
    }

}