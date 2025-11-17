# Arithmetic Operators

`ArithmeticOperators` đại diện cho nhóm toán tử số học của MongoDB. Nó cung cấp các static method và builder để tạo biểu thức từ `AggregationExpression`, `field` hoặc literal, trả về instance toán tử tương ứng mà không cần tự viết BSON thủ công.

```ts
import { ArithmeticOperators } from 'red-aggregation/operator/arithmeticOperators/arithmeticOperators';
```

## Phương thức

- [ArithmeticOperators.abs()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsabs)
- [ArithmeticOperators.add()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsadd)
- [ArithmeticOperators.divide()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsdivide)
- [ArithmeticOperators.ceil()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsceil)
- [ArithmeticOperators.floor()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsfloor)
- [ArithmeticOperators.exp()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsexp)
- [ArithmeticOperators.log() / log10() / ln()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorslog--log10--ln)
- [ArithmeticOperators.mod()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsmod)
- [ArithmeticOperators.multiply()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsmultiply)
- [ArithmeticOperators.pow()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorspow)
- [ArithmeticOperators.round()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorsround)
- [ArithmeticOperators.sqrt()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorssqrt)
- [ArithmeticOperators.subtract()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorssubtract)
- [ArithmeticOperators.trunc()](/documentation/operators/arithmeticOperators.html#arithmeticoperatorstrunc)

### ArithmeticOperators.abs()

```ts
ArithmeticOperators.abs('price').toDocument(context);
// => { $abs: '$price' }
```

Hoặc:

```ts
ArithmeticOperators.abs(-10).toDocument(context);
// => { $abs: -10 }
```

### ArithmeticOperators.add()

```ts
ArithmeticOperators.add('price')
  .add(5)
  .add('discount')
  .toDocument(context);
// => { $add: ['$price', 5, '$discount'] }
```

### ArithmeticOperators.divide()

```ts
ArithmeticOperators.divide('total')
  .divideBy(10)
  .divideBy('count')
  .toDocument(context);
// => { $divide: ['$total', 10, '$count'] }
```

### ArithmeticOperators.ceil() / floor()

```ts
ArithmeticOperators.ceil({ $divide: ['$total', '$count'] }).toDocument(context);
// => { $ceil: { $divide: ['$total', '$count'] } }

ArithmeticOperators.floor('price').toDocument(context);
// => { $floor: '$price' }
```

### ArithmeticOperators.exp()

```ts
ArithmeticOperators.exp({ $add: [1, 2] }).toDocument(context);
// => { $exp: { $add: [1, 2] } }
```

### ArithmeticOperators.log() / log10() / ln()

```ts
ArithmeticOperators.log('value').log(2);
// => { $log: ['$value', 2] }

ArithmeticOperators.log10(100);
// => { $log10: 100 }

ArithmeticOperators.ln('$value');
// => { $ln: '$value' }
```

### ArithmeticOperators.mod()

```ts
ArithmeticOperators.mod('amount').mod(3);
// => { $mod: ['$amount', 3] }
```

### ArithmeticOperators.multiply()

```ts
ArithmeticOperators.multiply('price')
  .multiplyBy(2)
  .multiplyBy('$tax')
  .toDocument(context);
// => { $multiply: ['$price', 2, '$tax'] }
```

### ArithmeticOperators.pow()

```ts
ArithmeticOperators.pow('$value').pow(3);
// => { $pow: ['$value', 3] }
```

### ArithmeticOperators.round()

```ts
ArithmeticOperators.round('price').place(2).toDocument(context);
// => { $round: ['$price', 2] }
```

### ArithmeticOperators.sqrt()

```ts
ArithmeticOperators.sqrt('$variance');
// => { $sqrt: '$variance' }
```

### ArithmeticOperators.subtract()

```ts
ArithmeticOperators.subtract('total')
  .subtract('$discount')
  .subtract(5)
  .toDocument(context);
// => { $subtract: ['$total', '$discount', 5] }
```

### ArithmeticOperators.trunc()

```ts
ArithmeticOperators.trunc('$value');
// => { $trunc: '$value' }
```

### Lưu ý sử dụng

- Các builder hỗ trợ chain nhiều toán hạng theo thứ tự gọi (`.add()`, `.divideBy()`, `.multiplyBy()`, `.subtract()`…).
- `round().place(n)` chỉ định số chữ số thập phân; nếu không gọi, MongoDB mặc định 0.
- Khi cần xây dựng nhiều phép toán dựa trên cùng một input, nên tái sử dụng cùng một builder được khởi tạo từ `ArithmeticOperators.*(...)` thay vì lặp lại chuẩn hóa đầu vào.
