# ReplaceRoot Operation

`ReplaceRootOperation` đại diện cho stage `$replaceRoot` của MongoDB. Nó thay thế toàn bộ document hiện tại bằng một document mới (newRoot), có thể là:
- Tham chiếu tới một field trong document gốc
- Một `AggregationExpression` (ví dụ tổ hợp `$add`, `$concat`, …)
- Một raw BSON document
- Hoặc một document được xây dựng dần (composable) bằng builder

Khuyến nghị dùng builder `ReplaceRootOperation.builder()` để tạo `newRoot` linh hoạt.

```ts
import { ReplaceRootOperation } from 'red-aggregation/operations/replaceRootOperation';
import { ReplaceRootOperationBuilder } from 'red-aggregation/operations/replaceRootOperation/replaceRootOperationBuilder';
import { ArithmeticOperators } from 'red-aggregation/operator/arithmeticOperators/arithmeticOperators';
```

## Phương thức

- [ReplaceRootOperation.builder().withValueOf(field|expression|document)](/documentation/operations/replaceRootOperation.html#withvalueof)
- [ReplaceRootOperation.builder().withDocument().and(...).as(...)](/documentation/operations/replaceRootOperation.html#withdocument)
- [new ReplaceRootOperation(field|expression|document)](/documentation/operations/replaceRootOperation.html#constructor)

### withValueOf (builder) — thay newRoot bằng một giá trị duy nhất

```ts
// newRoot là một field reference
ReplaceRootOperation
  .builder()
  .withValueOf('profile')
  .toDocument(context);
// => { $replaceRoot: { newRoot: '$profile' } }

// newRoot là một AggregationExpression
const expr = ArithmeticOperators.add('price').add('tax');
ReplaceRootOperation
  .builder()
  .withValueOf(expr)
  .toDocument(context);
// => { $replaceRoot: { newRoot: { $add: ['$price', '$tax'] } } }

// newRoot là raw BSON document
ReplaceRootOperation
  .builder()
  .withValueOf({ firstName: '$name', location: '$city' })
  .toDocument(context);
// => { $replaceRoot: { newRoot: { firstName: '$name', location: '$city' } } }
```

### withDocument (builder) — xây dựng `newRoot` kiểu composable

```ts
// Bắt đầu với document trống rồi thêm từng cặp khóa/giá trị
const expr = ArithmeticOperators.add('$price').add('$tax');
ReplaceRootOperation
  .builder()
  .withDocument()
  .and(expr).as('total')    // total: { $add: ['$price', '$tax'] }
  .andValue('$name').as('name')
  .toDocument(context);
// => {
//   $replaceRoot: { newRoot: { total: { $add: ['$price', '$tax'] }, name: '$name' } }
// }

// Bắt đầu từ một document có sẵn, rồi mở rộng thêm khóa/giá trị
ReplaceRootOperation
  .builder()
  .withDocument()
  .andValue('$userProfile').as('profile')
  .andValuesOf({ profile: '$userProfile' })
  .andValue('$settings').as('settings')
  .toDocument(context);
// => { $replaceRoot: { newRoot: { profile: '$userProfile', settings: '$settings' } } }
```

### Constructor (có thể dùng trực tiếp khi cần đơn giản)

```ts
// Field reference
new ReplaceRootOperation(Fields.field('item')).toDocument(context);
// => { $replaceRoot: { newRoot: '$item' } }

// AggregationExpression
const expr = ArithmeticOperators.add('price').add('tax');
new ReplaceRootOperation(expr).toDocument(context);
// => { $replaceRoot: { newRoot: { $add: ['$price', '$tax'] } } }

// Raw document
new ReplaceRootOperation({ firstName: '$name', location: '$city' }).toDocument(context);
// => { $replaceRoot: { newRoot: { firstName: '$name', location: '$city' } } }
```

### Lưu ý sử dụng

- `newRoot` phải là một document hợp lệ; khi dùng field reference sẽ được ánh xạ thành `'$field'` qua `Fields.field`/`context`.
- Builder `withDocument()` trả về `ReplaceRootDocumentOperation` cho phép `and()/andValue()/andValuesOf()` và cuối cùng `.as(name)` để gắn key vào document mới.
- `ReplaceRootOperation` không expose thêm field mới (`getFields()` rỗng), vì root được thay thế toàn bộ.
- Ưu tiên dùng builder `ReplaceRootOperation.builder()` để tránh tự thao tác BSON và dễ mở rộng `newRoot` theo từng phần.
