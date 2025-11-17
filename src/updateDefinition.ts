import { Document } from 'mongodb';

export interface ArrayFilter {
	asDocument(): Document;
}

export abstract class UpdateDefinition {
	abstract isIsolated(): boolean;
	abstract getUpdateObject(): Document;
	abstract modifies(key: string): boolean;
	abstract inc(key: string): UpdateDefinition;
	abstract getArrayFilters(): ArrayFilter[];

	hasArrayFilters() {
		return this.getArrayFilters().length > 0;
	}
}
