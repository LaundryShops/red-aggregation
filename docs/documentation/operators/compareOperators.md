# Compare Operators

Đối tượng `ComparisonOperation` đại diện cho nhóm toán tử so sánh của MongoDB (`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$cmp`). Nó cung cấp các static method và builder giúp bạn tạo biểu thức so sánh từ `AggregationExpression`, `field`, `literal` và trả về instance toán tử có thể sử dụng trong các stage như `$match`, `$project`, `$addFields` mà không cần tự viết BSON thủ công.

```ts
import { ComparisonOperation } from 'red-aggregation/operator/compareOperators/comparisonOperators';
```

## Phương thức

- [ComparisonOperation.valueOf()](/documentation/operators/compareOperators.html#comparisonoperationvalueof)
- [ComparisonOperation.eq()](/documentation/operators/compareOperators.html#comparisonoperationeq)
- [ComparisonOperation.ne()](/documentation/operators/compareOperators.html#comparisonoperationne)
- [ComparisonOperation.gt()](/documentation/operators/compareOperators.html#comparisonoperationgt)
- [ComparisonOperation.gte()](/documentation/operators/compareOperators.html#comparisonoperationgte)
- [ComparisonOperation.lt()](/documentation/operators/compareOperators.html#comparisonoperationlt)
- [ComparisonOperation.lte()](/documentation/operators/compareOperators.html#comparisonoperationlte)
- [factory.compareTo()](/documentation/operators/compareOperators.html#factorycompareto)

### ComparisonOperation.valueOf()

Chuẩn hóa field hoặc `AggregationExpression` để khởi tạo một factory, sau đó chain các phép so sánh tương ứng.

```ts
const factoryFromField = ComparisonOperation.valueOf('price');              // field reference
const factoryFromExpr = ComparisonOperation.valueOf({ $add: ['$a', '$b'] });// AggregationExpression
```

### ComparisonOperation.eq()

Tạo builder `$eq` từ field, literal hoặc expression.

```ts
// Field + literal
const eqDoc = ComparisonOperation.eq('price')
  .equalTo('discount')
  .equalToValue(100)
  .toDocument(context);
// => { $eq: ['$price', '$discount', 100] }
```

Hoặc:

```ts
// Expression
ComparisonOperation.eq({ $abs: '$amount' })
  .equalTo({ $add: ['$fee', '$tax'] })
  .toDocument(context);
// => { $eq: [{ $abs: '$amount' }, { $add: ['$fee', '$tax'] }] }
```

### ComparisonOperation.gt()

Tạo builder `$gt` để so sánh lớn hơn.

```ts
const gtDoc = ComparisonOperation.gt('price')
  .greaterThan('cost')
  .greaterThanValue(50)
  .toDocument(context);
// => { $gt: ['$price', '$cost', 50] }
```

Hoặc:

```ts
ComparisonOperation.gt({ $sum: '$scores' })
  .greaterThan({ $avg: '$scores' })
  .toDocument(context);
// => { $gt: [{ $sum: '$scores' }, { $avg: '$scores' }] }
```

### ComparisonOperation.gte()

```ts
ComparisonOperation.gte('price')
  .greaterThanEqualTo('floorPrice')
  .greaterThanEqualToValue(100)
  .toDocument(context);
// => { $gte: ['$price', '$floorPrice', 100] }
```

Hoặc:

```ts
ComparisonOperation.gte({ $sum: ['$a', '$b'] })
  .greaterThanEqualTo({ $multiply: ['$baseline', 2] })
  .toDocument(context);
// => { $gte: [{ $sum: ['$a', '$b'] }, { $multiply: ['$baseline', 2] }] }
```

### ComparisonOperation.lt()

```ts
ComparisonOperation.lt('discount')
  .lessThanTo('ceiling')
  .lessThanToValue(10)
  .toDocument(context);
// => { $lt: ['$discount', '$ceiling', 10] }
```

Hoặc:

```ts
ComparisonOperation.lt({ $abs: '$variance' })
  .lessThanTo({ $add: ['$threshold', 5] })
  .toDocument(context);
// => { $lt: [{ $abs: '$variance' }, { $add: ['$threshold', 5] }] }
```

### ComparisonOperation.lte()

```ts
ComparisonOperation.lte('discount')
  .lessThanEqualTo('limit')
  .lessThanEqualToValue(5)
  .toDocument(context);
// => { $lte: ['$discount', '$limit', 5] }
```

Hoặc:

```ts
ComparisonOperation.lte({ $ceil: '$score' })
  .lessThanEqualTo({ $multiply: ['$cap', 2] })
  .toDocument(context);
// => { $lte: [{ $ceil: '$score' }, { $multiply: ['$cap', 2] }] }
```

### ComparisonOperation.ne()

```ts
ComparisonOperation.ne('status')
  .notEqualTo('previousStatus')
  .notEqualToValue('ARCHIVED')
  .toDocument(context);
// => { $ne: ['$status', '$previousStatus', 'ARCHIVED'] }
```

Hoặc:

```ts
ComparisonOperation.ne({ $substr: ['$code', 0, 3] })
  .notEqualTo({ $literal: 'ERR' })
  .toDocument(context);
// => { $ne: [{ $substr: ['$code', 0, 3] }, { $literal: 'ERR' }] }
```

### factory.compareTo()

Sinh `$cmp` để so sánh hai toán hạng.

```ts
const cmpField = ComparisonOperation.valueOf('price')
  .compareTo('discount')
  .compareToValue(50)
  .toDocument(context);
// => { $cmp: ['$price', '$discount', 50] }
```

Hoặc:

```ts
const cmpExpr = ComparisonOperation.valueOf({ $sum: ['$qty', '$bonus'] })
  .compareTo({ $abs: '$discount' })
  .toDocument(context);
// => { $cmp: [{ $sum: ['$qty', '$bonus'] }, { $abs: '$discount' }] }
```

### Lưu ý sử dụng

- `ComparisonOperation.valueOf` nhận field reference (có/không `$`) và `AggregationExpression`; literal nên truyền qua các phương thức `...Value`.
- Các builder (`Eq`, `Gt`, `Lt`, `Lte`, `Gte`, `Ne`, `Cmp`) duy trì một mảng toán hạng; mỗi lần gọi `.equalTo()`, `.greaterThan()`… sẽ bổ sung phần tử theo đúng thứ tự chain.
- Khi cần so sánh nhiều biến thể trên cùng một nguồn dữ liệu, ưu tiên khởi tạo một factory từ `ComparisonOperation.valueOf(...)` để tái sử dụng chuẩn hóa đầu vào.
