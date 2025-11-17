# SortByCount Operation

`SortByCountOperation` đại diện cho stage `$sortByCount` của MongoDB. Stage này nhóm các document theo một biểu thức/field và trả về số lượng mỗi nhóm, đồng thời tự động sắp xếp giảm dần theo `count`.

```ts
import { SortByCountOperation } from 'red-aggregation/operations/sortByCountOperation';
import { Fields } from 'red-aggregation/aggregate/field';
```

## Phương thức

- [new SortByCountOperation(fieldRef: Field)](/documentation/operations/sortByCountOperation.html#group-theo-field)
- [new SortByCountOperation(expression: AggregationExpression)](/documentation/operations/sortByCountOperation.html#group-theo-expression)
- [new SortByCountOperation(document: BSON)](/documentation/operations/sortByCountOperation.html#group-theo-raw-bson)

### Group theo field

```ts
new SortByCountOperation(Fields.field('category')).toDocument(context);
// => { $sortByCount: '$category' }
```

### Group theo AggregationExpression

```ts
const expr = { $concat: ['$brand', '-', '$category'] };
new SortByCountOperation(expr).toDocument(context);
// => { $sortByCount: { $concat: ['$brand', '-', '$category'] } }
```

### Group theo raw BSON

```ts
new SortByCountOperation({ $substr: ['$name', 0, 3] }).toDocument(context);
// => { $sortByCount: { $substr: ['$name', 0, 3] } }
```

### Lưu ý sử dụng

- Tham số truyền cho constructor phải hợp lệ (không `null`/`undefined`).
- Khi truyền `Field`, giá trị sẽ được ánh xạ thành `'$field'` thông qua `context`.
- Khi truyền `AggregationExpression`, nội dung sẽ được lấy qua `expression.toDocument(context)`.
- `$sortByCount` tương đương với `{$group: { _id: <expr>, count: {$sum: 1} } }` rồi `{$sort: { count: -1 } }`, nhưng gọn hơn trong một stage.
