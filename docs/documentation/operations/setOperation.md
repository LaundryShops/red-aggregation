# Set Operation

`SetOperation` đại diện cho stage `$set` của MongoDB. Dùng để thêm/cập nhật một hoặc nhiều trường trong document hiện tại bằng literal, tham chiếu field, hoặc `AggregationExpression`.

```ts
import { SetOperation } from 'red-aggregation/operations/setOperation';
import { Fields } from 'red-aggregation/aggregate/field';
import { ArithmeticOperators } from 'red-aggregation/operator/arithmeticOperators/arithmeticOperators';
```

## Phương thức

- [SetOperation.createSetOperation(field, value)](/documentation/operations/setOperation.html#createsetoperation)
- [set(field).toValue(value) / set(field).toValueOf(exprOrField)](/documentation/operations/setOperation.html#settoValue)
- [set(field, value)](/documentation/operations/setOperation.html#set-truc-tiep)
- [and().set(...)](/documentation/operations/setOperation.html#and)

### Tạo nhanh với createSetOperation

```ts
SetOperation.createSetOperation('name', 'John').toDocument(context);
// => { $set: { name: 'John' } }

// Chaining tiếp tục bổ sung trường
SetOperation.createSetOperation('age', 30)
  .set('status', 'active')
  .toDocument(context);
// => { $set: { age: 30, status: 'active' } }
```

### Builder: set(field).toValue(...) / toValueOf(...)

```ts
// Gán literal
new SetOperation(new Map())
  .set('score').toValue(10)
  .toDocument(context);
// => { $set: { score: 10 } }

// Gán theo field khác
new SetOperation(new Map())
  .set('total').toValueOf('amount')
  .toDocument(context);
// => { $set: { total: '$amount' } }

// Gán theo AggregationExpression
const expr =  ArithmeticOperators.add('$price').add('$tax');
new SetOperation(new Map())
  .set('total').toValueOf(expr)
  .toDocument(context);
// => { $set: { total: { $add: ['$price', '$tax'] } } }
```

### Gán trực tiếp: set(field, value)

```ts
SetOperation.createSetOperation('name', 'Alice')
  .set('age', 28)
  .set('city', 'Hanoi')
  .toDocument(context);
// => { $set: { name: 'Alice', age: 28, city: 'Hanoi' } }
```

### Gán nhiều trường với and()

```ts
new SetOperation(new Map())
  .set('firstName').toValue('John')
  .and()
  .set('lastName').toValue('Doe')
  .toDocument(context);
// => { $set: { firstName: 'John', lastName: 'Doe' } }
```

### Lưu ý sử dụng

- `set(field).toValueOf('otherField')` sẽ tự map string thành `'$otherField'` qua `Fields.field`/`context`.
- `toValueOf` chấp nhận `Field` hoặc `AggregationExpression` và sẽ gọi `toDocument(context)` khi cần.
- `and()` dùng để tiếp tục thêm các trường mới vào cùng một `$set` mà không làm mất các trường đã có.
- `SetOperation.builder()` trả về `FieldAppender` giúp gọi `.set(...).toValue()/toValueOf()` theo chuỗi.
