import { Document, CollationOptions, ReadConcern, ReadPreference } from 'mongodb';
import { IReadConcernAware } from './aggregate/abstractReadConcernAware';
import { IReadPreferenceAware } from './aggregate/abstractReadPreferenceAware';
import { DiskUse } from './query/diskUse';
import { Assert, BsonUtils, containsKey, isDocument, isMongoDocument } from './utils';
import { ifPresent, isPresent, orElse } from './utils/optional';
import { toMillis } from './utils/duration';

export enum ResultOptions {
	SKIP = 'SKIP',
	READ = 'READ',
}

export enum DomainTypeMapping {
	STRICT = 'STRICT',
	RELAXED = 'RELAXED',
	NONE = 'NONE',
}

export class AggregateOptions implements IReadConcernAware, IReadPreferenceAware {
	private static readonly BATCH_SIZE = 'batchSize';
	private static readonly CURSOR = 'cursor';
	private static readonly EXPLAIN = 'explain';
	private static readonly ALLOW_DISK_USE = 'allowDiskUse';
	private static readonly COLLATION = 'collation';
	private static readonly COMMENT = 'comment';
	private static readonly MAX_TIME = 'maxTimeMS';
	private static readonly HINT = 'hint';

	private readonly diskUse: DiskUse;
	private readonly explain: boolean;
	private readonly cursor: Document | null;
	private readonly collation: CollationOptions | null;
	private readonly comment: String | null;
	private readonly hint: any | null;

	private readConcern?: ReadConcern;
	private readPreference?: ReadPreference;
    /**
     * Tính bằng millisecond
     */
	private maxTime: number = 0;
	private resultOptions: ResultOptions = ResultOptions.READ;
	private domainTypeMapping: DomainTypeMapping = DomainTypeMapping.RELAXED;

	static withCursorBatchSize(allowDiskUse: boolean, explain: boolean, cursorBatchSize: number): AggregateOptions {
		return new AggregateOptions(allowDiskUse, explain, AggregateOptions.createCursor(cursorBatchSize), null);
	}

	static createCursor(batchSize: number): Document {
		return { batchSize };
	}

	/**
	 * Creates a new {@link AggregateOptions}.
	 *
	 * @param allowDiskUse whether to off-load intensive sort-operations to disk.
	 * @param explain whether to get the execution plan for the aggregation instead of the actual results.
	 * @param {Document | null} cursor can be {@literal null}, used to pass additional options to the aggregation.
	 */
	constructor(allowDiskUse: boolean, explain: boolean, cursor: Document | null);
	constructor(diskUse: DiskUse, explain: boolean, cursor: Document | null);

	/**
	 * Creates a new {@link AggregateOptions}.
	 *
	 * @param allowDiskUse whether to off-load intensive sort-operations to disk.
	 * @param explain whether to get the execution plan for the aggregation instead of the actual results.
	 * @param {Document | null} cursor - Can be {@literal null}, used to pass additional options (such as {@constant batchSize}) to the
	 *          aggregation.
	 * @param {CollationOptions | null} collation collation for string comparison. Can be {@literal null}.
	 */
	constructor(allowDiskUse: boolean, explain: boolean, cursor: Document | null, collation: CollationOptions | null);
	constructor(diskUse: DiskUse, explain: boolean, cursor: Document | null, collation: CollationOptions | null);

	/**
	 * Creates a new {@link AggregateOptions}.
	 *
	 * @param allowDiskUse whether to off-load intensive sort-operations to disk.
	 * @param explain whether to get the execution plan for the aggregation instead of the actual results.
	 * @param {Document | null} cursor can be {@literal null}, used to pass additional options (such as {@code batchSize}) to the
	 *          aggregation.
	 * @param collation collation for string comparison. Can be {@literal null}.
	 * @param comment execution comment. Can be {@literal null}.
	 */
	constructor(allowDiskUse: boolean, explain: boolean, cursor: Document | null, collation: CollationOptions | null, comment: string | null);
	constructor(diskUse: DiskUse, explain: boolean, cursor: Document | null, collation: CollationOptions | null, comment: string | null);
	/**
	 * It's not valid for create new {@link AggregateOptions} instance. Please use other constructor instead.
	 *
	 * @param diskUseOrAllow
	 * @param explain
	 * @param cursor
	 * @param collation
	 * @param comment
	 * @param hint
	 */
	constructor(
		diskUseOrAllow: boolean | DiskUse,
		explain: boolean,
		cursor: Document | null,
		collation: CollationOptions | null,
		comment: string | null,
		hint: unknown
	);
	constructor(
		diskUseOrAllow: boolean | DiskUse,
		explain: boolean,
		cursor: Document | null,
		collation: CollationOptions | null = null,
		comment: string | null = null,
		hint: unknown = null
	) {
		const diskUse = typeof diskUseOrAllow === 'boolean' ? DiskUse.of(diskUseOrAllow) : diskUseOrAllow;

		this.diskUse = diskUse;
		this.explain = explain;
		this.cursor = cursor ?? null;
		this.collation = collation ?? null;
		this.comment = comment ?? null;
		this.hint = hint ?? null;
	}

	static fromDocument(document: Document): AggregateOptions {
		Assert.notNull(document, 'Document must not be null');

		const allowDiskUseRaw = document[AggregateOptions.ALLOW_DISK_USE];
		const allowDiskUse = typeof allowDiskUseRaw === 'boolean' ? allowDiskUseRaw : null;

		const explainRaw = document[AggregateOptions.EXPLAIN];
		const explain = typeof explainRaw === 'boolean' ? explainRaw : false;

		const cursor = (document[AggregateOptions.CURSOR] as Document | undefined) ?? null;

		const collationRaw = document[AggregateOptions.COLLATION] as CollationOptions | Document | undefined;
		const collation =
			(collationRaw as CollationOptions | undefined) ??
			// nếu muốn giữ nguyên Document, làm rõ tại đây
			(collationRaw as CollationOptions | undefined) ??
			null;

		const commentRaw = document[AggregateOptions.COMMENT];
		const comment = typeof commentRaw === 'string' ? commentRaw : null;

		const hint = document[AggregateOptions.HINT] ?? null;

		const options = new AggregateOptions(DiskUse.of(allowDiskUse), explain, cursor, collation, comment, hint);

		const maxTimeRaw = document[AggregateOptions.MAX_TIME];
		if (typeof maxTimeRaw === 'number') {
			options['maxTime'] = maxTimeRaw;
		}

		return options;
	}

	static builder(): AggregateOptionsBuilder {
		return new AggregateOptionsBuilder();
	}

	isAllowDiskUse() {
		return this.diskUse === DiskUse.ALLOW;
	}

	isAllowDiskUseSet() {
		return this.diskUse !== DiskUse.DEFAULT;
	}

	isExplain() {
		return this.explain;
	}

	getCursorBatchSize(): number | null {
		if (this.cursor && Object.prototype.hasOwnProperty.call(this.cursor, AggregateOptions.BATCH_SIZE)) {
			const value = this.cursor[AggregateOptions.BATCH_SIZE];
			return typeof value === 'number' ? value : null;
		}
		return null;
	}

	getCursor() {
		return this.cursor;
	}

	getCollation() {
		return this.collation;
	}

	getComment() {
		return this.comment;
	}

	getHint(): Document | null {
		if (this.hint == null) {
			return null;
		}

		if (isDocument(this.hint)) {
			return this.hint;
		}

		if (typeof this.hint === 'string') {
			if (BsonUtils.isJsonDocument(this.hint)) {
				return BsonUtils.parse(this.hint);
			}
		}

		const typeName = typeof this.hint === 'object' && this.hint !== null ? this.hint.constructor?.name ?? 'Object' : typeof this.hint;

		throw new Error(`Unable to read hint of type ${typeName}`);
	}

	getMaxTime() {
		return this.maxTime;
	}

	isSkipResults() {
		return ResultOptions.SKIP === this.resultOptions;
	}

	getDomainTypeMapping() {
		return this.domainTypeMapping;
	}

	/**
	 * Returns a new potentially adjusted copy for the given {@code aggregationCommandObject} with the configuration
	 * applied.
	 *
	 * @param command the aggregation command.
	 * @return
	 */
	applyAndReturnPotentiallyChangedCommand(command: Document) {
		const result = Object.assign({}, command);

		if (this.isAllowDiskUseSet() && !containsKey(result, AggregateOptions.ALLOW_DISK_USE)) {
			result[AggregateOptions.ALLOW_DISK_USE] = this.isAllowDiskUse();
		}
        
        if (this.explain && !containsKey(result, AggregateOptions.EXPLAIN)) {
            result[AggregateOptions.EXPLAIN] = this.explain;
		}

		if (containsKey(result, AggregateOptions.HINT)) {
            ifPresent(this.hint, val => result[AggregateOptions.HINT] = val)
		}

		if (!containsKey(result, AggregateOptions.CURSOR)) {
			ifPresent(this.cursor, val => result[AggregateOptions.CURSOR] = val);
		}

		if (!containsKey(result, AggregateOptions.COLLATION)) {
            ifPresent(this.collation, val => {
                result[AggregateOptions.COLLATION] = val;
            });
		}

		if (this.hasExecutionTimeLimit() && !containsKey(result, AggregateOptions.MAX_TIME)) {
            result[AggregateOptions.MAX_TIME] = toMillis(this.maxTime);
		}

		return result;
	}

    toDocument() {
		const document: Document = {};

		if (this.isAllowDiskUseSet()) {
			document[AggregateOptions.ALLOW_DISK_USE] = this.isAllowDiskUse();
		}
		document[AggregateOptions.EXPLAIN] = this.explain;

        ifPresent(this.cursor, val => document[AggregateOptions.CURSOR] = val)
        ifPresent(this.collation, val => document[AggregateOptions.COLLATION] = val)
        ifPresent(this.comment, val => document[AggregateOptions.COMMENT] = val)
        ifPresent(this.hint, val => document[AggregateOptions.HINT] = val)

		if (this.hasExecutionTimeLimit()) {
			document[AggregateOptions.MAX_TIME], toMillis(this.maxTime);
		}

		return document;
	}

    toString() {
        return '';
    }

    public hasExecutionTimeLimit() {
		return this.maxTime !== 0 && this.maxTime >= 0;
	}

	getHintObject() {
		return this.hint;
	}

	hasReadPreference(): boolean {
		return isPresent(this.readPreference);
	}

	getReadPreference(): ReadPreference | null {
		return orElse(this.readPreference, null);
	}

	getReadConcern(): ReadConcern | null {
		return orElse(this.readConcern, null);
	}

	hasReadConcern(): boolean {
		return isPresent(this.readConcern);
	}
}

export class AggregateOptionsBuilder {
	private _diskUse = DiskUse.DEFAULT;
	private _explain: boolean = false;
	private _cursor: Document | null = null;
	private _collation: CollationOptions | null = null;
	private _comment: string | null = null;
	private _hint: any | null = null;
	private _readConcern: ReadConcern | null = null;
	private _readPreference: ReadPreference | null = null;
	private _maxTime: number | null = null;
	private _resultOptions: ResultOptions | null = null;
	private _domainTypeMapping: DomainTypeMapping | null = null;

	domainTypeMapping() {
		this._domainTypeMapping = DomainTypeMapping.RELAXED;
		return this;
	}

	noMapping() {
		this._domainTypeMapping = DomainTypeMapping.NONE;
		return this;
	}

	strictMapping() {
		this._domainTypeMapping = DomainTypeMapping.STRICT;
		return this;
	}

	allowDickUse(allowDickUse: boolean) {
		return this.diskUse(DiskUse.of(allowDickUse));
	}

	diskUse(diskUse: DiskUse) {
		Assert.notNull(diskUse, 'DiskUse must not be null');

		this._diskUse = diskUse;
		return this;
	}

	explain(explain: boolean) {
		this._explain = explain;
		return this;
	}

	cursor(cursor: Document) {
		this._cursor = cursor;

		return this;
	}

	cursorBatchSize(batchSize: number) {
		this._cursor = AggregateOptions.createCursor(batchSize);
		return this;
	}

	collation(collation: CollationOptions | null) {
		this._collation = collation;
		return this;
	}

	comment(cmt: string | null) {
		this._comment = cmt;
		return this;
	}

	hint(hint: Document | null): AggregateOptionsBuilder;
	hint(indexName: string | null): AggregateOptionsBuilder;
	hint(input: Document | string | null) {
		this._hint = input;
		return this;
	}

	readConcern(readConcern: null | ReadConcern) {
		this._readConcern = readConcern;
		return this;
	}

	readPreference(readPreference: null | ReadPreference) {
		this._readPreference = readPreference;
		return this;
	}

	maxTime(maxTime: number | null) {
		this._maxTime = maxTime;

		return this;
	}

	skipOutput() {
		this._resultOptions = ResultOptions.SKIP;
		return this;
	}

	build() {
		const options = new AggregateOptions(this._diskUse, this._explain, this._cursor, this._collation, this._comment, this._hint);
		if (this._maxTime != null) {
			options['maxTime'] = this._maxTime;
		}
		if (this._resultOptions != null) {
			options['resultOptions'] = this._resultOptions;
		}
		if (this._domainTypeMapping != null) {
			options['domainTypeMapping'] = this._domainTypeMapping;
		}
		if (this._readConcern != null) {
			options['readConcern'] = this._readConcern;
		}
		if (this._readPreference != null) {
			options['readPreference'] = this._readPreference;
		}

		return options;
	}
}
