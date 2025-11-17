import { ReadConcern } from "mongodb";

export interface IReadConcernAware {
	getReadConcern(): ReadConcern | null;
	hasReadConcern(): boolean;
}

export abstract class AbstractReadConcernAware implements IReadConcernAware {
	abstract getReadConcern(): ReadConcern | null;

	hasReadConcern(): boolean {
		return this.getReadConcern() !== null;
	}
}
