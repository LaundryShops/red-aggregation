export interface Keyword {
    toString(): string;
}

export class GroupOps implements Keyword {
    static readonly SUM = new GroupOps('$sum');
    static readonly LAST = new GroupOps('$last');
    static readonly FIRST = new GroupOps('$first');
    static readonly PUSH = new GroupOps('$push');
    static readonly AVG = new GroupOps('$avg');
    static readonly MIN = new GroupOps('$min');
    static readonly MAX = new GroupOps('$max');
    static readonly ADD_TO_SET = new GroupOps('$addToSet');
    static readonly STD_DEV_POP = new GroupOps('$stdDevPop');
    static readonly STD_DEV_SAMP = new GroupOps('$stdDevSamp');

    private constructor(private readonly mongoOperator: string) { }

    toString(): string {
        return this.mongoOperator;
    }
}