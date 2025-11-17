import type { GroupOperation } from ".";
import { Assert } from "../../utils";
import { Operation } from "./operation";

export class GroupOperationBuilder {
    private readonly groupOperation: GroupOperation;
    private readonly operation: Operation;

    constructor(groupOperation: GroupOperation, operation: Operation) {
        Assert.notNull(groupOperation, "GroupOperation must not be null");
        Assert.notNull(operation, "Operation must not be null");

        this.groupOperation = groupOperation;
        this.operation = operation;
    }

    as(alias: string) {
        return this.groupOperation.and(this.operation.withAlias(alias));
    }
}