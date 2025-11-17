# Array Operators

`ArrayOperator` đại diện cho nhóm toán tử thao tác mảng của MongoDB. Nó cung cấp các static method và builder để tạo biểu thức từ `AggregationExpression`, `field`, hoặc literal array và trả về instance toán tử, giúp bạn không phải tự viết BSON thủ công.

```ts
import { ArrayOperator } from 'red-aggregation/operator/arrayOperators/arrayOperator';
```

## Phương thức

- [ArrayOperator.arrayOf()](/documentation/operators/arrayOperators.html#arrayoperatorarrayof)
- [first() / last()](/documentation/operators/arrayOperators.html#first--last)
- [elementAt()](/documentation/operators/arrayOperators.html#elementat)
- [indexOf().within()](/documentation/operators/arrayOperators.html#indexofvaluewithin)
- [slice().offset().itemCount()](/documentation/operators/arrayOperators.html#sliceoffsetitemcount)
- [size() / isArray() / reverse()](/documentation/operators/arrayOperators.html#size-isarray-reverse)
- [filter().as().by()](/documentation/operators/arrayOperators.html#filterasby)
- [reduce(...).startingWith()](/documentation/operators/arrayOperators.html#reducestartingwith)
- [concat()](/documentation/operators/arrayOperators.html#concat)
- [ArrayToObject](/documentation/operators/arrayOperators.html#arraytoobject)
- [In](/documentation/operators/arrayOperators.html#in)

### ArrayOperator.arrayOf()

Chuẩn hóa field, `AggregationExpression` hoặc literal array để khởi tạo một factory.

```ts
const factoryFromField = ArrayOperator.arrayOf('items');               // '$items'
const factoryFromExpr  = ArrayOperator.arrayOf({ $split: ['$t', ','] });
const factoryFromArray = ArrayOperator.arrayOf([1, 2, 3]);
```

### first() / last()

```ts
ArrayOperator.arrayOf('price').first().toDocument(context);
// => { $first: '$price' }

ArrayOperator.arrayOf([1, 2, 3]).last().toDocument(context);
// => { $last: [1, 2, 3] }
```

Hoặc:

```ts
ArrayOperator.arrayOf({ $map: { input: '$items', in: '$$this.price' } })
  .last()
  .toDocument(context);
// => { $last: { $map: ... } }
```

### elementAt()

```ts
ArrayOperator.arrayOf('values').elementAt(5)
// => { $arrayElemAt: ['$values', 5] }

ArrayOperator.arrayOf('values').elementAt('indexField')
// => { $arrayElemAt: ['$values', '$indexField'] }
```

Hoặc:

```ts
ArrayOperator.arrayOf('values').elementAt({ $add: ['$idx', 1] })
// => { $arrayElemAt: ['$values', { $add: ['$idx', 1] }] }

ArrayOperator.arrayOf({ $split: ['$tags', ','] }).elementAt(1)
// => { $arrayElemAt: [{ $split: ['$tags', ','] }, 1] }
```

### indexOf(value).within(...)

```ts
ArrayOperator.arrayOf('tags').indexOf('sale')
// => { $indexOfArray: ['$tags', 'sale'] }
```

Hoặc:

```ts
ArrayOperator.arrayOf({ $map: { input: '$items', as: 'i', in: '$$i.price' } }).indexOf(100)
// => { $indexOfArray: [{ $map: ... }, 100] }

ArrayOperator.arrayOf(['a', 'b', 'c']).indexOf('b').within(1, 2)
// => { $indexOfArray: [['a', 'b', 'c'], 'b', 1, 2] }
```

### slice().offset().itemCount()

```ts
ArrayOperator.arrayOf('items').slice().itemCount(3)
// => { $slice: ['$items', 3] }
```

Hoặc:

```ts
ArrayOperator.arrayOf([1, 2, 3, 4]).slice().offset(1).itemCount(2)
// => { $slice: [[1, 2, 3, 4], 1, 2] }
```

Thêm ví dụ:

```ts
ArrayOperator.arrayOf([10, 20, 30]).slice().offset({ $add: ['$skip', 1] }).itemCount(1)
// => { $slice: [[10, 20, 30], { $add: ['$skip', 1] }, 1] }
```

### size() / isArray() / reverse()

```ts
ArrayOperator.arrayOf('items').size()
// => { $size: '$items' }

ArrayOperator.arrayOf('$payload').isArray()
// => { $isArray: '$payload' }

ArrayOperator.arrayOf([1, 2, 3]).reverse()
// => { $reverseArray: [1, 2, 3] }
```

Hoặc:

```ts
ArrayOperator.arrayOf({ $filter: { input: '$items', as: 'i', cond: { $gt: ['$$i', 0] } } })
  .size()
// => { $size: { $filter: ... } }
```

### filter().as().by(...)

```ts
const filterDoc = ArrayOperator.arrayOf('prices')
  .filter()
  .as('p')
  .by({ $gt: ['$$p', 5] })
  .toDocument(context);
// {
//   $filter: { input: '$prices', as: 'p', cond: { $gt: ['$$p', 5] } }
// }
```

### reduce(...).startingWith(initial)

```ts
const reduceDoc = ArrayOperator.arrayOf('scores')
  .reduce({ $add: ['$$value', '$$this'] })
  .startingWith(0)
  .toDocument(context);
// {
//   $reduce: { input: '$scores', initialValue: 0, in: { $add: ['$$value', '$$this'] } }
// }
```

### concat()

```ts
ArrayOperator.arrayOf('arrA')
  .concat('arrB')
  .concat({ $range: [0, 5] })
// => { $concatArrays: ['$arrA', '$arrB', { $range: [0, 5] }] }
```

### ArrayToObject

```ts
ArrayToObject.arrayValueOfToObject('pairs')
// => { $arrayToObject: '$pairs' }

ArrayToObject.arrayToObject([{ k: 'name', v: 'Alice' }])
// => { $arrayToObject: [[{ k: 'name', v: 'Alice' }]] }
```

### In

```ts
In.arrayOf('categories').containsValue('Electronics')
// => { $in: ['Electronics', '$categories'] }

In.arrayOf([1, 2, 3]).containsValue(0)
// => { $in: [0, [1, 2, 3]] }
```

Hoặc:

```ts
In.arrayOf({ $size: '$tags' }).containsValue(5)
// => { $in: [5, { $size: '$tags' }] }
```

### Lưu ý sử dụng

- `ArrayOperator.arrayOf(...)`, `ArrayElemAt.arrayOf(...)`, `ConcatArrays.arrayOf(...)`, `In.arrayOf(...)`… ném lỗi khi truyền `null`.
- `ArrayOperatorFactory.isArray()` chỉ cho phép field reference hoặc biểu thức; khởi tạo từ literal array sẽ ném lỗi.
- Khi áp dụng nhiều toán tử cho cùng một input, nên khởi tạo một factory từ `ArrayOperator.arrayOf(input)` để tái sử dụng chuẩn hóa đầu vào.
