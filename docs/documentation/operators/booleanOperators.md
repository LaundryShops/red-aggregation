# Boolean Operators

Đối tượng `BooleanOperators` đại diện cho nhóm toán tử boolean trong MongoDB Aggregation giúp kết hợp/đảo điều kiện: `$and`, `$or`, `$not`. Nó cung cấp các static method và builder để tạo biểu thức từ `AggregationExpression`, `field`, `literal` và trả về instance toán tử, tránh phải viết BSON thủ công.

```ts
import { BooleanOperators } from 'red-aggregation/operator/booleanOperators/booleanOperators';
```

## Phương thức

- [BooleanOperators.valueOf()](/documentation/operators/booleanOperators.html#booleanoperatorsvalueof)
- [BooleanOperators.and()](/documentation/operators/booleanOperators.html#booleanoperatorsand)
- [BooleanOperators.or()](/documentation/operators/booleanOperators.html#booleanoperatorsor)
- [BooleanOperators.not()](/documentation/operators/booleanOperators.html#booleanoperatorsnot)

### BooleanOperators.valueOf()

Chuẩn hóa field hoặc `AggregationExpression` để khởi tạo một factory, sau đó chain các toán tử boolean tương ứng.

```ts
const factoryFromField = BooleanOperators.valueOf('isActive'); // field reference
const factoryFromExpr  = BooleanOperators.valueOf(
  { $gt: ['$score', 80] }                                      // AggregationExpression
);
```

### BooleanOperators.and()

Tạo builder `$and` từ field, literal hoặc expression.

```ts
const andDoc = BooleanOperators.valueOf('isActive')
  .and('isVerified')                   // field reference
  .and(true)                           // literal
  .and({ $gt: ['$score', 50] })        // expression
  .toDocument(context);
// => { $and: ['$isActive', '$isVerified', true, { $gt: ['$score', 50] }] }
```

Hoặc:

```ts
BooleanOperators.and(true, false).toDocument(context);
// => { $and: [true, false] }
```

### BooleanOperators.or()

```ts
const orDoc = BooleanOperators.valueOf('isTrial')
  .or('isSubscribed')
  .or(false)
  .or({ $eq: ['$region', 'APAC'] })
  .toDocument(context);
// => { $or: ['$isTrial', '$isSubscribed', false, { $eq: ['$region', 'APAC'] }] }
```

Hoặc:

```ts
BooleanOperators.or(true).orValue(false).orField('isDeleted').toDocument(context);
// => { $or: [true, false, '$isDeleted'] }
```

### BooleanOperators.not()

```ts
const notDoc = BooleanOperators.valueOf('isSuspended')
  .not('isDeleted')
  .not(true)
  .not({ $eq: ['$status', 'archived'] })
  .toDocument(context);
// => { $not: ['$isSuspended', '$isDeleted', true, { $eq: ['$status', 'archived'] }] }
```

Hoặc:

```ts
BooleanOperators.not(true).notValue(false).notField('isArchived').toDocument(context);
// => { $not: [true, false, '$isArchived'] }
```

### Lưu ý sử dụng

- `BooleanOperators.valueOf` nhận field reference (có/không `$`) và `AggregationExpression`; literal có thể truyền trực tiếp vào builder `.and()/.or()/.not()` hoặc qua phương thức `...Value`.
- Các builder (`And`, `Or`, `Not`) duy trì một mảng toán hạng; mỗi lần gọi `.and()/ .or()/ .not()` hoặc biến thể `...Field/ ...Value/ ...Expression` sẽ bổ sung phần tử theo thứ tự chain.
- Khi cần kết hợp nhiều điều kiện xoay quanh cùng một nguồn dữ liệu, khởi tạo một factory từ `BooleanOperators.valueOf(...)` để tái sử dụng chuẩn hóa đầu vào.
