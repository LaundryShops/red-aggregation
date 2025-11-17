# UnionWith Operation

`UnionWithOperation` đại diện cho stage `$unionWith` của MongoDB (từ 4.4). Stage này hợp nhất dữ liệu từ collection khác (và tuỳ chọn áp dụng pipeline) vào luồng hiện tại.

```ts
import { UnionWithOperation } from 'red-aggregation/operations/unionWithOperation';
import { AggregationPipeline } from 'red-aggregation/aggregationPipeline';
import { AggregateOperation } from 'red-aggregation/aggregateOperation';
```

## Phương thức

- [UnionWithOperation.unionWith(collection)](/documentation/operations/unionWithOperation.html#unionwith)
- [union.pipeline(AggregationPipeline|...AggregateOperation)](/documentation/operations/unionWithOperation.html#pipeline)

### unionWith(collection)

Tạo `$unionWith` tối giản, chỉ chỉ định collection đích.

```ts
UnionWithOperation
  .unionWith('archivedOrders')
  .toDocument(context);
// => { $unionWith: { coll: 'archivedOrders' } }
```

### unionWith + pipeline

Có thể bổ sung pipeline để biến đổi dữ liệu của collection ghép vào.

```ts
// Truyền sẵn một AggregationPipeline
const pipeline = AggregationPipeline.of(new MatchOp({ $match: { status: 'ACTIVE' } }));
new UnionWithOperation('archivedOrders', pipeline).toDocument(context);
// => {
//   $unionWith: {
//     coll: 'archivedOrders',
//     pipeline: [[ { $match: { status: 'ACTIVE' } } ]]
//   }
// }

// Hoặc dùng overload variadic để truyền trực tiếp các stage
UnionWithOperation
  .unionWith('archivedOrders')
  .pipeline(
    new MatchOp({ $match: { type: 'A' } }),
    new ProjectOp({ $project: { type: 1 } })
  )
  .toDocument(context);
// => {
//   $unionWith: {
//     coll: 'archivedOrders',
//     pipeline: [ [{ $match: { type: 'A' }}], [{ $project: { type: 1 }}] ]
//   }
// }
```

### Lưu ý sử dụng

- `collection` là bắt buộc và không được `null`.
- Nếu không truyền pipeline hoặc pipeline rỗng, chỉ có `{ coll: <collection> }` trong `$unionWith`.
- Khi truyền pipeline, các stage sẽ được render bằng `toDocument(context)` theo `AggregationPipeline`; mỗi stage được bọc trong một mảng con.
- Nếu context hiện tại là `ExposedFieldsAggregationOperationContext`, `UnionWithOperation` sẽ sử dụng root-context nội bộ khi render pipeline để tránh tác động của ánh xạ field tạm thời.
