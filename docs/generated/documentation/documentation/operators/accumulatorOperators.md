# Accumulator Operators

`AccumulatorOperators` đại diện cho nhóm toán tử tích lũy của MongoDB: `$sum`, `$avg`, `$min`, `$max` và biến thể `$minN`/`$maxN`. Từ `field`, `AggregationExpression` hoặc literal (với `$sum`), các builder giúp bạn tạo biểu thức mà không phải viết BSON thủ công.

```ts
import { AccumulatorOperators } from 'red-aggregation/operator/accumulatorOperators/accumulatorOperators';
```

## Phương thức

- [AccumulatorOperators.valueOf()](/documentation/operators/accumulatorOperators.html#accumulatoroperatorsvalueof)
- [Sum.sumOf()](/documentation/operators/accumulatorOperators.html#sumsumof)
- [Avg.avgOf()](/documentation/operators/accumulatorOperators.html#avgavgof)
- [Min.minOf()](/documentation/operators/accumulatorOperators.html#minminof)
- [Max.maxOf()](/documentation/operators/accumulatorOperators.html#maxmaxof)

### AccumulatorOperators.valueOf()

Khởi tạo factory từ field hoặc `AggregationExpression`, sau đó chain tới toán tử mong muốn.

```ts
AccumulatorOperators.valueOf('price').sum().and('$tax').toDocument(context);
// => { $sum: ['$price', '$tax'] }

AccumulatorOperators.valueOf({ $subtract: ['$x', '$y'] }).avg().and('$z').toDocument(context);
// => { $avg: [{ $subtract: ['$x', '$y'] }, '$z'] }
```

### Sum.sumOf()

```ts
Sum.sumOf('price').and('$tax').toDocument(context);
// => { $sum: ['$price', '$tax'] }
```

Hoặc:

```ts
Sum.sumOf('subtotal')
  .and('$discount')
  .and({ $multiply: ['$fee', 2] })
  .and(5)
  .toDocument(context);
// => { $sum: ['$subtotal', '$discount', { $multiply: ['$fee', 2] }, 5] }
```

### Avg.avgOf()

```ts
Avg.avgOf('score').and('$bonus').toDocument(context);
// => { $avg: ['$score', '$bonus'] }
```

Hoặc:

```ts
Avg.avgOf('total')
  .and({ $multiply: ['$price', '$quantity'] })
  .toDocument(context);
// => { $avg: ['$total', { $multiply: ['$price', '$quantity'] }] }
```

### Min.minOf()

```ts
Min.minOf('price').toDocument(context);
// => { $min: '$price' }
```

Hoặc:

```ts
Min.minOf('price').and('discount').toDocument(context);
// => { $min: ['$price', '$discount'] }
```

Giới hạn N phần tử nhỏ nhất:

```ts
Min.minOf('score').limit(3).toDocument(context);
// => { $minN: { input: '$score', n: 3 } }

Min.minOf('score').and('bonus').limit(5).toDocument(context);
// => { $minN: { input: ['$score', '$bonus'], n: 5 } }
```

### Max.maxOf()

```ts
Max.maxOf('price').toDocument(context);
// => { $max: '$price' }
```

Hoặc:

```ts
Max.maxOf('price').and('discount').toDocument(context);
// => { $max: ['$price', '$discount'] }
```

Giới hạn N phần tử lớn nhất:

```ts
Max.maxOf('score').limit(3).toDocument(context);
// => { $maxN: { input: '$score', n: 3 } }

Max.maxOf('score').and('bonus').limit(5).toDocument(context);
// => { $maxN: { input: ['$score', '$bonus'], n: 5 } }
```

### Lưu ý sử dụng

- Factory chỉ nhận field reference hoặc `AggregationExpression`. Giá trị không hợp lệ sẽ bị từ chối.
- `Sum.and(...)` cho phép literal số; `Avg`/`Min`/`Max` chấp nhận field hoặc expression.
- Gọi `limit(n)` trên `Min`/`Max` sẽ chuyển sang `$minN`/`$maxN`. Nếu chỉ cần một giá trị nhỏ/lớn nhất, không gọi `limit`.
