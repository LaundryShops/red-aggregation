import { Fields } from "../../../aggregate/field";
import { NoOpAggregationOperationContext } from "../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext";
import { GroupOperation } from "../../../operations/groupOperation";
import { GroupOps } from "../../../operations/groupOperation/enum";
import { Operation } from "../../../operations/groupOperation/operation";
import { AggregationExpression } from "../../../aggregationExpression";


describe('GroupOperation', () => {
	let context: NoOpAggregationOperationContext;

	beforeEach(() => {
		context = new NoOpAggregationOperationContext();
	});

	describe('constructor', () => {
		it('should create GroupOperation with Fields', () => {
			const fields = Fields.fields('category', 'status');
			const groupOp = new GroupOperation(fields);

			expect(groupOp.getOperator()).toBe('$group');
		});

		it('should create GroupOperation with Fields and operations', () => {
			const fields = Fields.fields('category');
			const operations = [
				new Operation(GroupOps.SUM, 'total', 'price', null),
			];
			const groupOp = new GroupOperation(fields as any, operations);

			expect(groupOp.getOperator()).toBe('$group');
		});

		it('should create GroupOperation from another GroupOperation', () => {
			const fields = Fields.fields('category');
			const originalGroupOp = new GroupOperation(fields);
			const nextOperations = [
				new Operation(GroupOps.AVG, 'avgPrice', 'price', null),
			];

			const newGroupOp = new GroupOperation(
				originalGroupOp,
				nextOperations
			);

			expect(newGroupOp.getOperator()).toBe('$group');
		});
	});

	describe('aggregation methods', () => {
		let groupOp: GroupOperation;

		beforeEach(() => {
			const fields = Fields.fields('category');
			groupOp = new GroupOperation(fields);
		});

		describe('sum()', () => {
			it('should create sum operation with string reference', () => {
				const builder = groupOp.sum('price');
				expect(builder).toBeDefined();
			});

			it('should create sum operation with AggregationExpression', () => {
				const expression = {
					$multiply: ['$price', 1.1],
				} as unknown as AggregationExpression;
				const builder = groupOp.sum(expression);
				expect(builder).toBeDefined();
			});

			it('should create sum operation with plain object', () => {
				const obj = { $add: ['$price', '$tax'] };
				const builder = groupOp.sum(obj);
				expect(builder).toBeDefined();
			});
		});

		describe('avg()', () => {
			it('should create avg operation with string reference', () => {
				const builder = groupOp.avg('price');
				expect(builder).toBeDefined();
			});

			it('should create avg operation with expression', () => {
				const expression = {
					$multiply: ['$price', 0.9],
				} as unknown as AggregationExpression;
				const builder = groupOp.avg(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('min()', () => {
			it('should create min operation with string reference', () => {
				const builder = groupOp.min('price');
				expect(builder).toBeDefined();
			});

			it('should create min operation with expression', () => {
				const expression = {
					$subtract: ['$price', '$discount'],
				} as unknown as AggregationExpression;
				const builder = groupOp.min(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('max()', () => {
			it('should create max operation with string reference', () => {
				const builder = groupOp.max('price');
				expect(builder).toBeDefined();
			});

			it('should create max operation with expression', () => {
				const expression = {
					$add: ['$price', '$tax'],
				} as unknown as AggregationExpression;
				const builder = groupOp.max(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('first()', () => {
			it('should create first operation with string reference', () => {
				const builder = groupOp.first('name');
				expect(builder).toBeDefined();
			});

			it('should create first operation with expression', () => {
				const expression = {
					$toUpper: '$name',
				} as unknown as AggregationExpression;
				const builder = groupOp.first(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('last()', () => {
			it('should create last operation with string reference', () => {
				const builder = groupOp.last('name');
				expect(builder).toBeDefined();
			});

			it('should create last operation with expression', () => {
				const expression = {
					$toLower: '$name',
				} as unknown as AggregationExpression;
				const builder = groupOp.last(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('push()', () => {
			it('should create push operation with string reference', () => {
				const builder = groupOp.push('item');
				expect(builder).toBeDefined();
			});

			it('should create push operation with expression', () => {
				const expression = {
					$concat: ['$item', ' - processed'],
				} as unknown as AggregationExpression;
				const builder = groupOp.push(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('addToSet()', () => {
			it('should create addToSet operation with string reference', () => {
				const builder = groupOp.addToSet('tag');
				expect(builder).toBeDefined();
			});

			it('should create addToSet operation with value', () => {
				const builder = groupOp.addToSet('defaultTag');
				expect(builder).toBeDefined();
			});
		});

		describe('stdDevPop()', () => {
			it('should create stdDevPop operation with string reference', () => {
				const builder = groupOp.stdDevPop('score');
				expect(builder).toBeDefined();
			});

			it('should create stdDevPop operation with expression', () => {
				const expression = {
					$multiply: ['$score', 1.2],
				} as unknown as AggregationExpression;
				const builder = groupOp.stdDevPop(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('stdDevSamp()', () => {
			it('should create stdDevSamp operation with string reference', () => {
				const builder = groupOp.stdDevSamp('score');
				expect(builder).toBeDefined();
			});

			it('should create stdDevSamp operation with expression', () => {
				const expression = {
					$divide: ['$score', 2],
				};
				const builder = groupOp.stdDevSamp(expression);
				expect(builder).toBeDefined();
			});
		});

		describe('count()', () => {
			it('should create count operation', () => {
				const builder = groupOp.count();
				expect(builder).toBeDefined();
			});
		});
	});

	describe('and()', () => {
		let groupOp: GroupOperation;

		beforeEach(() => {
			const fields = Fields.fields('category');
			groupOp = new GroupOperation(fields);
		});

		it('should add Operation to GroupOperation', () => {
			const operation = new Operation(
				GroupOps.SUM,
				'total',
				'price',
				null
			);
			const newGroupOp = groupOp.and(operation);

			expect(newGroupOp).toBeInstanceOf(GroupOperation);
			expect(newGroupOp.getOperator()).toBe('$group');
		});

		it('should add field and expression to GroupOperation', () => {
			const expression = {
				$multiply: ['$price', 1.1],
			} as unknown as AggregationExpression;
			const newGroupOp = groupOp.and('totalPrice', expression);

			expect(newGroupOp).toBeInstanceOf(GroupOperation);
		});
	});

	describe('getFields()', () => {
		it('should return exposed fields including _id', () => {
			const fields = Fields.fields('category', 'status');
			const groupOp = new GroupOperation(fields);

			const exposedFields = groupOp.getFields();
			expect(exposedFields).toBeDefined();
		});

		it('should include operation fields', () => {
			const fields = Fields.fields('category');
			const groupOp = new GroupOperation(fields);
			
			// Add operation using builder pattern
			const groupOpWithOps = groupOp.sum('price').as('total');

			const exposedFields = groupOpWithOps.getFields();
			expect(exposedFields).toBeDefined();
		});
	});

	describe('toDocument()', () => {
		it('should create $group document with null _id', () => {
			const fields = Fields.fields(); // Empty fields
			const groupOp = new GroupOperation(fields);

			const doc = groupOp.toDocument(context);

			expect(doc).toEqual({
				$group: {
					_id: null,
				},
			});
		});

		it('should create $group document with single field _id', () => {
			const fields = Fields.fields('category');
			const groupOp = new GroupOperation(fields);

			const doc = groupOp.toDocument(context);

			expect(doc).toEqual({
				$group: {
					_id: '$category',
				},
			});
		});

		it('should create $group document with multiple fields _id', () => {
			const fields = Fields.fields('category', 'status');
			const groupOp = new GroupOperation(fields);

			const doc = groupOp.toDocument(context);

			expect(doc).toEqual({
				$group: {
					_id: {
						category: '$category',
						status: '$status',
					},
				},
			});
		});

		it('should create $group document with operations', () => {
			const fields = Fields.fields('category');
			const groupOp = new GroupOperation(fields);
			
			// Add operations using builder pattern
			const groupOpWithOps = groupOp
				.sum('price').as('total')
				.avg('price').as('avgPrice');

			const doc = groupOpWithOps.toDocument(context);

			expect(doc).toEqual({
				$group: {
					_id: '$category',
					total: { $sum: '$price' },
					avgPrice: { $avg: '$price' },
				},
			});
		});

		it('should create $group document with count operation', () => {
			const fields = Fields.fields('category');
			const groupOp = new GroupOperation(fields);
			
			// Add count operation using builder pattern
			const groupOpWithCount = groupOp.count().as('count');

			const doc = groupOpWithCount.toDocument(context);

			expect(doc).toEqual({
				$group: {
					_id: '$category',
					count: { $sum: 1 },
				},
			});
		});
	});

	describe('getOperator()', () => {
		it('should return $group operator', () => {
			const fields = Fields.fields('category');
			const groupOp = new GroupOperation(fields);

			expect(groupOp.getOperator()).toBe('$group');
		});
	});

	describe('integration tests', () => {
		it('should create complex group operation', () => {
			const fields = Fields.fields('category', 'status');
			const groupOp = new GroupOperation(fields);

			// Add multiple operations
			const sumOp = groupOp.sum('price').as('totalPrice');
			const avgOp = sumOp.avg('price').as('avgPrice');
			const countOp = avgOp.count().as('itemCount');

			const doc = countOp.toDocument(context);
			expect(doc).toEqual({
				$group: {
					_id: {
						category: '$category',
						status: '$status',
					},
					totalPrice: { $sum: '$price' },
					avgPrice: { $avg: '$price' },
					itemCount: { $sum: 1 },
				},
			});
		});

		it('should handle mixed operation types', () => {
			const fields = Fields.fields('department');
			const groupOp = new GroupOperation(fields);

			const complexOp = groupOp
				.sum('salary').as('totalSalary')
				.avg('salary').as('avgSalary')
				.min('salary').as('minSalary')
				.max('salary').as('maxSalary')
				.count().as('employeeCount')
				.push('name').as('employeeNames')
				.addToSet('skill').as('uniqueSkills');

			const doc = complexOp.toDocument(context);

			expect(doc).toEqual({
				$group: {
					_id: '$department',
					totalSalary: { $sum: '$salary' },
					avgSalary: { $avg: '$salary' },
					minSalary: { $min: '$salary' },
					maxSalary: { $max: '$salary' },
					employeeCount: { $sum: 1 },
					employeeNames: { $push: '$name' },
					uniqueSkills: { $addToSet: '$skill' },
				},
			});
		});
	});
});

