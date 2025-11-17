# Match Operation

`MatchOperation` đại diện cho stage `$match` của MongoDB. Dùng để lọc tài liệu theo điều kiện (criteria) hoặc theo một `AggregationExpression` (ví dụ `$expr`).

```ts
import { MatchOperation } from 'red-aggregation/operations/matchOperation';
```

## Phương thức

- [new MatchOperation(criteria: Document)](/documentation/operations/matchOperation.html#new-matchoperation-voi-criteria)
- [new MatchOperation(expression: AggregationExpression)](/documentation/operations/matchOperation.html#new-matchoperation-voi-aggregationexpression)
- [new MatchOperation(ClauseDefinition)](/documentation/operations/matchOperation.html#new-matchoperation-voi-criteriadefinition)

### new MatchOperation (với raw BSON)

Tạo `$match` trực tiếp từ một raw BSON điều kiện.

```ts
const criteria = { status: 'ACTIVE' };
new MatchOperation(criteria).toDocument(context);
// => { $match: { status: 'ACTIVE' } }
```

### new MatchOperation (với AggregationExpression)

Truyền vào một `AggregationExpression` (ví dụ biểu thức `$expr` được dựng sẵn) để tạo nội dung của `$match`.

```ts
const expr = new StubAggregationExpression({ score: { $gt: 10 } });
new MatchOperation(expr).toDocument(context);
// => { $match: { score: { $gt: 10 } } }
```

### new MatchOperation (với CriteriaDefinition)

Có thể dùng `ClauseDefinition` (Criteria DSL) để tạo `$match`.

```ts
const def = new ClauseDefinition(/* ... */); // ví dụ: trả về { role: { $eq: 'admin' } }
new MatchOperation(def).toDocument(context);
// => { $match: { role: { $eq: 'admin' } } }
```

### Lưu ý sử dụng

- Tham số truyền vào constructor bắt buộc không được `null`/`undefined`, vi phạm sẽ ném lỗi: \"Expression must not be null\".
- Khi truyền `AggregationExpression`, `toDocument(context)` của biểu thức sẽ được gọi để lấy nội dung `$match`.
- Khi truyền `Document` (criteria thô), đối tượng sẽ được map qua `context.getMappedObject(...)` trước khi đưa vào `$match`.
