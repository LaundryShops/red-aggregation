# Unset Operation

`UnsetOperation` đại diện cho stage `$unset` của MongoDB. Dùng để xoá một hoặc nhiều trường khỏi document hiện tại. Có thể truyền tên trường dạng string, `Field` (để map theo tên thật trong DB) hoặc `AggregationExpression` trả về tên trường cần xoá.

```ts
import { UnsetOperation } from 'red-aggregation/operations/unsetOperation';
import { Fields } from 'red-aggregation/aggregate/field';
```

## Phương thức

- [UnsetOperation.unset(...fields)](/documentation/operations/unsetOperation.html#unset)
- [and(...fields)](/documentation/operations/unsetOperation.html#and)
- [removedFieldNames()](/documentation/operations/unsetOperation.html#removedfieldnames)

### Xoá một hoặc nhiều trường

```ts
// Xoá 1 trường
UnsetOperation.unset('deprecatedField').toDocument(context);
// => { $unset: 'deprecatedField' }

// Xoá nhiều trường (mảng tên)
UnsetOperation.unset('fieldA', 'fieldB').toDocument(context);
// => { $unset: ['fieldA', 'fieldB'] }
```

### Hỗ trợ Field và AggregationExpression

```ts
// Truyền Field để map về tên thật trong DB
const field = Fields.field('aliasField', 'actualField');
new UnsetOperation([field]).toDocument(context);
// => { $unset: 'actualField' }

// Truyền AggregationExpression trả về tên trường cần xoá
const expr = { $concat: ['$first', '-', '$second'] }; // ví dụ expression
new UnsetOperation([expr as any]).toDocument(context);
// => { $unset: { $concat: ['$first', '-', '$second'] } }
```

### Chain thêm trường với and(...)

```ts
UnsetOperation.unset('first')
  .and('second')
  .toDocument(context);
// => { $unset: ['first', 'second'] }
```

### Lấy danh sách tên trường đã cấu hình xoá

```ts
const op = UnsetOperation.unset('first').and(Fields.field('alias', 'real'));
op.removedFieldNames();
// => ['first', 'real']
```

### Lưu ý sử dụng

- Mảng `fields` không được `null` và không chứa phần tử `null`.
- Khi chỉ có 1 phần tử, `$unset` nhận string hoặc expression; khi nhiều phần tử, `$unset` nhận mảng.
- Với `Field` hoặc string, tên field sẽ được map sang `raw` (ví dụ `'user.name'` → `'user.name'`) bởi `context`.
