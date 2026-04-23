export class AggregationResults<T> {
    private readonly mappedResults: T[];

    constructor(mappedResults: T[]) {
        this.mappedResults = mappedResults;
    }

    getMappedResults(): T[] {
        return this.mappedResults;
    }

    getMappedResult(): T | null {
        if (this.mappedResults.length === 0) {
            return null;
        }
        return this.mappedResults[0];
    }
}

