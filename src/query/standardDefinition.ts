import { Document } from 'mongodb';

export interface IClauseDefinition {
    getCriteriaObject(): Document;
    getKey(): string | null;
}

export abstract class ClauseDefinition implements IClauseDefinition {
    abstract getCriteriaObject(): Document
    abstract getKey(): string | null;
}
