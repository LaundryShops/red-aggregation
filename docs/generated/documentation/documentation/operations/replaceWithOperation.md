# ReplaceWith Operation

`ReplaceWithOperation` đại diện cho stage `$replaceWith` của MongoDB. Nó thay thế toàn bộ document hiện tại bằng một giá trị mới (có thể là literal, tham chiếu field, `AggregationExpression`, hoặc cấu trúc mảng/lồng nhau). API cung cấp các phương thức tĩnh để tạo nhanh `newRoot`.

```ts
import { ReplaceWithOperation } from 'red-aggregation/operations/replaceWithOperation';
import { Fields } from 'red-aggregation/aggregate/field';
import { ArithmeticOperators } from 'red-aggregation/operator/arithmeticOperators/arithmeticOperators';
```

## Phương thức

- [ReplaceWithOperation.replaceWithValue(value)](/documentation/operations/replaceWithOperation.html#replacewithvalue)
- [ReplaceWithOperation.replaceWithValueOf(field|Field|AggregationExpression|any)](/documentation/operations/replaceWithOperation.html#replacewithvalueof)

### replaceWithValue(value)

Thay toàn bộ document bằng một literal/raw value.

```ts
ReplaceWithOperation.replaceWithValue({ status: 'archived' }).
  toDocument(context);
// => { $replaceWith: { status: 'archived' } }
```

### replaceWithValueOf(input)

`input` có thể là:
- Tên field (string) → được map thành `'$field'`
- `Field` instance
- `AggregationExpression`
- Bất kỳ cấu trúc dữ liệu (bao gồm mảng lồng nhau), sẽ được resolve đệ quy

Ví dụ:

```ts
// Thay bằng field reference (string)
ReplaceWithOperation.replaceWithValueOf('profile').toDocument(context);
// => { $replaceWith: '$profile' }

// Thay bằng Field instance
ReplaceWithOperation.replaceWithValueOf(Fields.field('profile')).
  toDocument(context);
// => { $replaceWith: '$profile' }

// Thay bằng AggregationExpression
const expr = ArithmeticOperators.add('$price').add('$tax');
ReplaceWithOperation.replaceWithValueOf(expr).toDocument(context);
// => { $replaceWith: { $add: ['$price', '$tax'] } }

// Thay bằng mảng (hỗ trợ lồng nhau)
ReplaceWithOperation.replaceWithValueOf(['$first', ['$second', '$third']]).
  toDocument(context);
// => { $replaceWith: ['$first', ['$second', '$third']] }
```

### Lưu ý sử dụng

- `replaceWithValueOf(null)` sẽ ném lỗi: "Value must not be null".
- `replaceWithValueOf` tự động chuyển:
  - `string` → `Fields.field(string)` → `'$field'` qua `context`
  - `AggregationExpression` → `expression.toDocument(context)`
  - `Array` → duyệt đệ quy và map từng phần tử
- `ReplaceWithOperation` kế thừa logic từ `ReplaceRootOperation` nhưng xuất `$replaceWith` và trả về document mới tại `newRoot` dưới key `$replaceWith`.\n
