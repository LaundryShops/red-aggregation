import { Document } from 'mongodb';
import { ProjectionOperation } from '../../../operations/projectionOperation';
import { NoOpAggregationOperationContext } from '../../../aggregate/aggregateOperationContext/noOpAggregationOperationContext';
import { Fields } from '../../../aggregate/field';
import { ArithmeticOperators } from '../../../operator/arithmeticOperators/arithmeticOperators';
import { ToUpper } from '../../../operator/stringOperators/toUppercase';
import { Concat } from '../../../operator/stringOperators/concat';
import { Cond } from '../../../operator/conditionalOperators/cond';
import { IfNull } from '../../../operator/conditionalOperators/ifNull';
import { ExpressionVariable } from '../../../operator/variableOperators/let';
import { ArrayOperator } from '../../../operator/arrayOperators/arrayOperator';

describe('ProjectionOperation MongoDB $project operator', () => {
	let context: NoOpAggregationOperationContext;

	beforeEach(() => {
		context = new NoOpAggregationOperationContext();
	});

	const getProjectClause = (doc: Document) => doc['$project'] as Document;

	describe('constructor validation', () => {
		it('should reject null fields input', () => {
			expect(() => new ProjectionOperation(null as unknown as Fields)).toThrow('Current projections must not be null');
		});
	});

	describe('basic projection building', () => {
		it('should render empty $project when no projections are defined', () => {
			const operation = new ProjectionOperation();
			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {},
			});
			expect(operation.getOperator()).toBe('$project');
			expect(operation.inheritsFields()).toBe(false);
			const fields = operation.getFields();
			expect(fields.exposesNoFields()).toBe(true);
		});

		it('should include fields using andInclude', () => {
			const operation = new ProjectionOperation().andInclude('firstName').andInclude('lastName');
			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					firstName: 1,
					lastName: 1,
				},
			});
			expect(operation.inheritsFields()).toBe(false);
		});

		it('should exclude fields using andExclude', () => {
			const operation = new ProjectionOperation().andExclude('password', 'secret');
			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					password: 0,
					secret: 0,
				},
			});
			expect(operation.inheritsFields()).toBe(true);
		});
	});

	describe('builder projections', () => {
		it('should alias a field using builder as()', () => {
			const operation = new ProjectionOperation().and('fullName').as('displayName');
			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					displayName: '$fullName',
				},
			});

			const fields = operation.getFields();
			expect(fields.getField('displayName')).not.toBeNull();
		});

		it('should alias arithmetic projection using aggregation expression', () => {
			const addExpression = ArithmeticOperators.add('$foo').add(41);
			const operation = new ProjectionOperation().and(addExpression).as('bar');
			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause).toEqual({
				bar: {
					$add: ['$foo', 41],
				},
			});
		});

		it('should apply aggregation expressions via builder methods', () => {
			const operation = new ProjectionOperation().and('name').toUpper().as('upperName');

			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					upperName: {
						$toUpper: '$name',
					},
				},
			});

			const fields = operation.getFields();
			expect(fields.getField('upperName')).not.toBeNull();
		});

		it('should project using explicit aggregation expression input', () => {
			const upperExpression = ToUpper.valueOf('item');
			const operation = new ProjectionOperation().and(upperExpression).as('upperItem');
			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause).toEqual({
				upperItem: {
					$toUpper: '$item',
				},
			});
		});

		it('should combine scalar inclusion and expression projections', () => {
			const operation = new ProjectionOperation().andInclude('firstName').and('firstName').toUpper().as('firstNameUpper');

			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					firstName: 1,
					firstNameUpper: {
						$toUpper: '$firstName',
					},
				},
			});
		});
	});

	describe('advanced projections', () => {
		it('should render arithmetic expressions via document input', () => {
			const operation = new ProjectionOperation().and({ $add: ['$subtotal', '$tax'] }).as('total');

			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause).toEqual({
				total: {
					$add: ['$subtotal', '$tax'],
				},
			});
		});

		it('should render arithmetic builder operations', () => {
			const operation = new ProjectionOperation()
				.and('price')
				.minus(5)
				.as('discounted')
				.and('price')
				.multiply(2)
				.as('duplicated')
				.and('price')
				.divide(2)
				.as('halved')
				.and('price')
				.mod(3)
				.as('modulus')
				.and('price')
				.plus(10)
				.as('total');

			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause.discounted).toEqual({ $subtract: ['$price', 5] });
			expect(projectClause.duplicated).toEqual({ $multiply: ['$price', 2] });
			expect(projectClause.halved).toEqual({ $divide: ['$price', 2] });
			expect(projectClause.modulus).toEqual({ $mod: ['$price', 3] });
			expect(projectClause.total).toEqual({ $add: ['$price', 10] });
		});

		it('should render comparison builder operations', () => {
			const operation = new ProjectionOperation()
				.and('score')
				.eq(10)
				.as('eq')
				.and('score')
				.gt(10)
				.as('gt')
				.and('score')
				.gte(10)
				.as('gte')
				.and('score')
				.lt(10)
				.as('lt')
				.and('score')
				.lte(10)
				.as('lte')
				.and('score')
				.ne(10)
				.as('ne');

			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause.eq).toEqual({ $eq: ['$score', 10] });
			expect(projectClause.gt).toEqual({ $gt: ['$score', 10] });
			expect(projectClause.gte).toEqual({ $gte: ['$score', 10] });
			expect(projectClause.lt).toEqual({ $lt: ['$score', 10] });
			expect(projectClause.lte).toEqual({ $lte: ['$score', 10] });
			expect(projectClause.ne).toEqual({ $ne: ['$score', 10] });
		});

		it('should render array helper builder operations', () => {
			const operation = new ProjectionOperation()
				.and('favorites')
				.arrayElementAt(0)
				.as('first')
				.and('favorites')
				.slice(3)
				.as('firstThree')
				.and('favorites')
				.slice(3, 1)
				.as('offsetSlice')
				.and('favorites')
				.concatArrays('others')
				.as('combined')
				.and('favorites')
				.isArray()
				.as('isArray');

			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause.first).toEqual({ $arrayElemAt: ['$favorites', 0] });
			expect(projectClause.firstThree).toEqual({ $slice: ['$favorites', 3] });
			expect(projectClause.offsetSlice).toEqual({ $slice: ['$favorites', 1, 3] });
			expect(projectClause.combined).toEqual({ $concatArrays: ['$favorites', '$others'] });
			expect(projectClause.isArray).toEqual({ $isArray: '$favorites' });
		});

		it('should render numeric helper builder operations', () => {
			const operation = new ProjectionOperation()
				.and('value')
				.pow(2)
				.as('powered')
				.and('value')
				.sqrt()
				.as('rooted')
				.and('value')
				.trunc()
				.as('truncated')
				.and('value')
				.toLower()
				.as('lowercased')
				.and('value')
				.toUpper()
				.as('uppercased');

			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause.powered).toEqual({ $pow: ['$value', 2] });
			expect(projectClause.rooted).toEqual({ $sqrt: '$value' });
			expect(projectClause.truncated).toEqual({ $trunc: '$value' });
			expect(projectClause.lowercased).toEqual({ $toLower: '$value' });
			expect(projectClause.uppercased).toEqual({ $toUpper: '$value' });
		});

		it('should render string builder operations', () => {
			const concatExpression = Concat.valueOf('item').concat(' - ').concatValueof('description');

			const operation = new ProjectionOperation()
				.and(concatExpression)
				.as('itemDescription')
				.and('item')
				.concat(' (', Fields.field('category'), ')')
				.as('itemDetails')
				.and('item')
				.substring(0, 2)
				.as('itemPrefix')
				.and('item')
				.substring(0)
				.as('itemSubstring')
				.and('item')
				.toLower()
				.as('itemLower')
				.and('item')
				.toUpper()
				.as('itemUpper');

			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					itemDescription: {
						$concat: ['$item', ' - ', '$description'],
					},
					itemDetails: {
						$concat: ['$item', ' (', '$category', ')'],
					},
					itemPrefix: { $substr: ['$item', 0, 2] },
					itemSubstring: { $substr: ['$item', 0, -1] },
					itemLower: { $toLower: '$item' },
					itemUpper: { $toUpper: '$item' },
				},
			});
		});

		it('should render condition builder operations', () => {
			const condExpression = Cond.newBuilder()
				.when({ $gt: ['$score', 90] })
				.then('honors')
				.otherwise('standard');

			const ifNullExpression = IfNull.ifNull('nickname').orIfNull('alias').then('unknown');

			const operation = new ProjectionOperation().and('grade').applyCondition(condExpression).and('displayName').applyCondition(ifNullExpression);

			const doc = operation.toDocument(context);
			expect(doc).toEqual({
				$project: {
					grade: {
						$cond: {
							if: { $gt: ['$score', 90] },
							then: 'honors',
							else: 'standard',
						},
					},
					displayName: {
						$ifNull: ['$nickname', '$alias', 'unknown'],
					},
				},
			});
		});

		it('should use previous operation reference via previousOperation()', () => {
			const operation = new ProjectionOperation().and('prop').previousOperation();
			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause).toMatchObject({
				prop: '$_id',
				_id: 0,
			});
		});

		it('should create projections from Fields with explicit targets', () => {
			const fields = Fields.fieldsField(Fields.field('foo'), Fields.field('bar', 'foobar'));
			const operation = new ProjectionOperation(fields);
			const doc = operation.toDocument(context);
			const projectClause = getProjectClause(doc);

			expect(projectClause).toEqual({
				foo: 1,
				bar: '$foobar',
			});
		});

		it('should transform existing projections into array via asArray', () => {
			const base = new ProjectionOperation().andInclude('firstName').andInclude('lastName');

			const arrayOperation = base.asArray('fullNameParts');
			const doc = arrayOperation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					fullNameParts: ['$firstName', '$lastName'],
				},
			});
		});

		it('should build array projection using andArrayOf', () => {
			const arrayOperation = new ProjectionOperation().andArrayOf([Fields.field('city'), { $literal: 'VN' }, 42]).as('details');

			const doc = arrayOperation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					details: ['$city', { $literal: 'VN' }, 42],
				},
			});
		});
	});

	describe('supplementary builder methods', () => {
		it('should project nested fields using nested()', () => {
			const operation = new ProjectionOperation().and('profile').nested(Fields.fields('name', 'email'));

			const doc = operation.toDocument(context);

			expect(doc).toEqual({
				$project: {
					profile: {
						name: '$name',
						email: '$email',
					},
				},
			});
		});

		it('should render size aggregations', () => {
			const sizeOperation = new ProjectionOperation().and('tags').size().as('tags_count');
			const sizeOperation2 = new ProjectionOperation().and(ArrayOperator.arrayOf('tags').size()).as('tags_count');

			expect(sizeOperation.toDocument(context)).toEqual({
				$project: {
					tags_count: { $size: ['$tags'] },
				},
			});
			expect(sizeOperation2.toDocument(context)).toEqual({
				$project: {
					tags_count: { $size: '$tags' },
				},
			});
		});

		it('should render cmp aggregations', () => {
			const sizeOperation = new ProjectionOperation().and('priority').cmp('5').as('tags_count');

			expect(sizeOperation.toDocument(context)).toEqual({
				$project: {
					tags_count: { $cmp: ['$priority', '5'] },
				},
			});
		});

		it('should render filter expressions', () => {
			const condition = Cond.newBuilder()
				.when({ $gt: ['$$item.price', 100] })
				.then(true)
				.otherwise(false);

			const operation = new ProjectionOperation().and('orders').filter('item', condition).as('orders');
            
			expect(operation.toDocument(context)).toEqual({
				$project: {
					orders: {
						$filter: {
							input: '$orders',
							as: 'item',
							cond: {
								$cond: {
									if: { $gt: ['$$item.price', 100] },
									then: true,
									else: false,
								},
							},
						},
					},
				},
			});
		});

		it('should render set comparison helpers', () => {
			const equalsOperation = new ProjectionOperation().and('tags').equalsArrays('expected', 'optional').as('tags');

			const intersectsOperation = new ProjectionOperation().and('tags').intersectsArrays('expected').as('intersection');

			const unionOperation = new ProjectionOperation().and('tags').unionArrays('a', 'b').as('unionResult');

			const differenceOperation = new ProjectionOperation().and('tags').differenceToArrays('other').as('differenceResult');

			const subsetOperation = new ProjectionOperation().and('tags').subsetOfArray('allowed').as('tags');

			expect(equalsOperation.toDocument(context)).toEqual({
				$project: {
					tags: {
						$setEquals: ['$tags', '$expected', '$optional'],
					},
				},
			});

			expect(intersectsOperation.toDocument(context)).toEqual({
				$project: {
					intersection: {
						$setIntersection: ['$tags', '$expected'],
					},
				},
			});

			expect(unionOperation.toDocument(context)).toEqual({
				$project: {
					unionResult: {
						$setUnion: ['$tags', '$a', '$b'],
					},
				},
			});

			expect(differenceOperation.toDocument(context)).toEqual({
				$project: {
					differenceResult: {
						$setDifference: ['$tags', '$other'],
					},
				},
			});

			expect(subsetOperation.toDocument(context)).toEqual({
				$project: {
					tags: {
						$setIsSubset: ['$tags', '$allowed'],
					},
				},
			});
		});

		it('should render numeric single-operand helpers', () => {
			const absOperation = new ProjectionOperation().and('metric').absoluteValue().as('metric');
			const ceilOperation = new ProjectionOperation().and('metric').ceil().as('metric');
			const expOperation = new ProjectionOperation().and('metric').exp().as('metric');
			const floorOperation = new ProjectionOperation().and('metric').floor().as('metric');
			const lnOperation = new ProjectionOperation().and('metric').ln().as('metric');
			const logOperation = new ProjectionOperation().and('metric').log(2).as('metric');
			const log10Operation = new ProjectionOperation().and('metric').log10().as('metric');
			const powOperation = new ProjectionOperation().and('metric').pow(2).as('metric');

			expect(absOperation.toDocument(context)).toEqual({
				$project: { metric: { $abs: '$metric' } },
			});
			expect(ceilOperation.toDocument(context)).toEqual({
				$project: { metric: { $ceil: '$metric' } },
			});
			expect(expOperation.toDocument(context)).toEqual({
				$project: { metric: { $exp: '$metric' } },
			});
			expect(floorOperation.toDocument(context)).toEqual({
				$project: { metric: { $floor: '$metric' } },
			});
			expect(lnOperation.toDocument(context)).toEqual({
				$project: { metric: { $ln: '$metric' } },
			});
			expect(logOperation.toDocument(context)).toEqual({
				$project: { metric: { $log: ['$metric', 2] } },
			});
			expect(log10Operation.toDocument(context)).toEqual({
				$project: { metric: { $log10: '$metric' } },
			});
			expect(powOperation.toDocument(context)).toEqual({
				$project: { metric: { $pow: ['$metric', 2] } },
			});
		});

		it('should render lets expressions', () => {
			const totalExpression = ArithmeticOperators.add('price').add('tax');
			const resultExpression = ArithmeticOperators.multiply('$$total').multiplyBy(2);

			const operation = new ProjectionOperation().and('finalPrice').lets(totalExpression, 'total', resultExpression).as('finalPrice');
			const docs = operation.toDocument(context)
			expect(docs).toEqual({
				$project: {
					finalPrice: {
						$let: {
							vars: {
								total: { $add: ['$price', '$tax'] },
							},
							in: { $multiply: ['$$total', 2] },
						},
					},
				},
			});
		});

		it('should render lets with variable array overload', () => {
			const variables = [ExpressionVariable.newVariable('discount').forExpression(ArithmeticOperators.multiply('price').multiplyBy(0.1))];
			const applyExpression = ArithmeticOperators.subtract('price').subtract('discount');

			const operation = new ProjectionOperation().and('finalPrice').lets(variables, applyExpression).as('finalPrice');

			expect(operation.toDocument(context)).toEqual({
				$project: {
					finalPrice: {
						$let: {
							vars: {
								discount: { $multiply: ['$price', 0.1] },
							},
							in: { $subtract: ['$price', '$$discount'] },
						},
					},
				},
			});
		});

		it('should proxy toDocument from builder', () => {
			const operation = new ProjectionOperation().andInclude('name');
			const builder = operation.and('score');

			expect(builder.toDocument(context)).toEqual(operation.toDocument(context));
		});
	});
});
