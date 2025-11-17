import { BSONRegExp } from 'mongodb';
import { ClauseDefinition } from './standardDefinition';
import { Assert } from '../utils';
import { StringUtils } from '../utils/string';

type CriteriaValue = string | number | boolean | Date | RegExp | null | undefined | object;

export class Clause extends ClauseDefinition {
	static NOT_SET = Symbol('NOT_SET');
	protected key: string | null = null;
	protected criteriaChain: Set<Clause>;
	protected criteria: Map<string, any> = new Map();
	protected isValue: CriteriaValue | symbol = Clause.NOT_SET;

	static where(key: string) {
		return new Clause(key);
	}

	constructor(key?: string) {
		super();
		const chain = new Set<Clause>();

		this.criteriaChain = chain;

		if (key) {
			this.criteriaChain.add(this);
			this.key = key;
		}
	}

	and(...values: Clause[]): Clause;
	and(values: Clause[]): Clause;
	and(criteriaOrArray: Clause | Clause[], ...rest: Clause[]) {
		const criteria = Array.isArray(criteriaOrArray) ? criteriaOrArray : [criteriaOrArray, ...rest];

		const criteriaSet = new Set<Clause>(criteria);
		const bsonList = this.createQueryFilterList(criteriaSet);
		return this.registerCriteriaChainElement(new Clause('$and').is(bsonList));
	}

	elemMatch(criteria: Clause) {
		this.criteria.set('$elemMatch', criteria.getCriteriaObject());
		return this;
	}

	exists(value: boolean) {
		this.criteria.set('$exists', value);
		return this;
	}

	expr(expression: any) {
		Assert.notNull(expression, 'Expression must not be null');

		const criteria = new Clause();
		criteria.criteria.set('$expr', expression);
		return criteria;
	}

	gt(value: CriteriaValue) {
		this.criteria.set('$gt', value);
		return this;
	}

	gte(value: CriteriaValue) {
		this.criteria.set('$gte', value);
		return this;
	}

	in(...values: CriteriaValue[]) {
		this.criteria.set('$in', [...new Set(values)]);
		return this;
	}

	lt(value: CriteriaValue) {
		this.criteria.set('$lt', value);
		return this;
	}

	lte(value: CriteriaValue) {
		this.criteria.set('$lte', value);
		return this;
	}

	mod(value: number, remainder: number) {
		const l = [value, remainder];
		this.criteria.set('$mod', l);
		return this;
	}

	ne(value: CriteriaValue) {
		this.criteria.set('$ne', value);
		return this;
	}

	nin(...values: CriteriaValue[]) {
		this.criteria.set('$nin', [...new Set(values)]);
		return this;
	}

	nor(...criteria: Clause[]) {
		const criteriaSet = new Set<Clause>(criteria);
		const bsonList = this.createQueryFilterList(criteriaSet);
		return this.registerCriteriaChainElement(new Clause('$nor').is(bsonList));
	}

	not(value: CriteriaValue | null) {
		this.criteria.set('$not', value);
		return this;
	}

	or(...criteria: Clause[]) {
		const criteriaSet = new Set<Clause>(criteria);
		const bsonList = this.createQueryFilterList(criteriaSet);
		return this.registerCriteriaChainElement(new Clause('$or').is(bsonList));
	}

	regex(pattern: RegExp): Clause;
	regex(pattern: RegExp, options?: string): Clause;
	regex(pattern: RegExp, options?: string) {
		if (this.lastOperatorWasNot()) {
			return this.not(pattern);
		}
		const regex = new RegExp(pattern, options);
		this.isValue = regex;
		return this;
	}

	size(size: number) {
		this.criteria.set('$size', size);
		return this;
	}

	with(key: string): Clause {
		return new WithClause(key, this.criteriaChain);
	}

	is(value: CriteriaValue): Clause {
		if (this.isValue !== Clause.NOT_SET) {
			throw new Error(`Multiple 'is' values declared; You need to use 'and' with multiple criteria`);
		}

		if (this.lastOperatorWasNot()) {
			throw new Error(`Invalid query: 'not' can't be used with 'is' - use 'ne' instead`);
		}

		this.isValue = value;
		return this;
	}

	all(...values: CriteriaValue[]): Clause;
	all(values: Set<any>): Clause;
	all(values: Set<any> | CriteriaValue[]) {
		if (!(values instanceof Set)) {
			values = new Set(values);
		}
		this.criteria.set('$all', values);
		return this;
	}

	getCriteriaObject(): Record<string, any> {
		if (this.criteriaChain.size === 1) {
			return this.criteriaChain.values().next().value!.getSingleCriteriaObject();
		} else if (this.isEmpty(this.criteriaChain) && !this.isEmpty(this.criteria)) {
			return this.getSingleCriteriaObject();
		} else {
			const criteriaObject: Record<string, any> = {};

			for (const criteria of this.criteriaChain) {
				const document = criteria.getSingleCriteriaObject();
				for (const key of Object.keys(document)) {
					this.setValue(criteriaObject, key, document[key]);
				}
			}

			return criteriaObject;
		}
	}

	getKey() {
		return this.key;
	}

	protected getSingleCriteriaObject(): Record<string, any> {
		const document: Record<string, any> = {};
		let not = false;

		for (const [key, value] of this.criteria.entries()) {
			let processedValue = value;

			// if (this.requiresGeoJsonFormat(processedValue)) {
			//     processedValue = { $geometry: processedValue };
			// }

			if (not) {
				const notDocument: Record<string, any> = {};
				notDocument[key] = processedValue;
				document.$not = notDocument;
				not = false;
			} else {
				if (key === '$not' && processedValue === null) {
					not = true;
				} else {
					document[key] = processedValue;
				}
			}
		}

		if (!StringUtils.hasText(this.key)) {
			if (not) {
				return { $not: document };
			}
			return document;
		}

		const queryCriteria: Record<string, any> = {};

		if (this.isValue !== Clause.NOT_SET) {
			if (Object.keys(document).length === 0) {
				queryCriteria[this.key ?? ''] = this.isValue;
			} else {
				if (this.isValue instanceof RegExp || this.isValue instanceof BSONRegExp) {
					document.$regex = this.isValue;
				} else {
					document.$eq = this.isValue;
				}
				queryCriteria[this.key ?? ''] = document;
			}
		} else {
			queryCriteria[this.key ?? ''] = document;
		}

		return queryCriteria;
	}

	private registerCriteriaChainElement(criteria: Clause) {
		if (this.lastOperatorWasNot()) {
			throw new Error('operator $not is not allowed around criteria chain element: ' + criteria.getCriteriaObject());
		} else {
			this.criteriaChain.add(criteria);
		}
		return this;
	}

	private createQueryFilterList(queryFilter: Set<Clause>) {
		const bsonList = [];

		for (const c of queryFilter) {
			bsonList.push(c.getCriteriaObject());
		}

		return bsonList;
	}

	private setValue(document: Record<string, any>, key: string, value: any): void {
		const existing = document[key];

		if (existing === undefined) {
			document[key] = value;
		} else {
			throw new Error(
				`Due to limitations of the org.bson.Document, ` +
					`you can't add a second '${key}' expression specified as '${key} : ${value}';` +
					`Clause already contains '${key} : ${existing}'`
			);
		}
	}

	private lastOperatorWasNot() {
		const keys = this.criteria.keys();
		return this.criteria.size > 0 && Array.from(keys).at(-1) === '$not';
	}

	private isEmpty<K, T>(collection: Map<K, T>): boolean;
	private isEmpty<T>(collection: Set<T>): boolean;
	private isEmpty<K, T>(collection: Set<K> | Map<K, T>) {
		if (!collection) {
			return true;
		}

		if (collection instanceof Map) {
			return collection.size === 0;
		}

		if (collection instanceof Set) {
			return collection.size === 0;
		}
	}
}

class WithClause extends Clause {
	constructor(key: string, chain: Set<Clause>) {
		super(key);
		this.key = key;
		this.criteriaChain = chain;
		this.criteriaChain.add(this);
	}
}
