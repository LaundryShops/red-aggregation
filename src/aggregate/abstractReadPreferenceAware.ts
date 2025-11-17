import { ReadPreference } from "mongodb";

export interface IReadPreferenceAware {
    hasReadPreference(): boolean;
    getReadPreference(): ReadPreference | null;
}

export abstract class AbstractReadPreferenceAware implements IReadPreferenceAware {
    abstract getReadPreference(): ReadPreference | null;

    hasReadPreference(): boolean {
        return this.getReadPreference() !== null;
    }

}
