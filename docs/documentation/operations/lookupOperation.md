# Lookup Operation

`LookupOperation` đại diện cho stage `$lookup` của MongoDB. Nó cho phép join dữ liệu giữa các collection bằng `localField/foreignField` (lookup đơn giản) hoặc dùng `let` + `pipeline` (correlated subquery). Hãy sử dụng builder thay vì khởi tạo trực tiếp `new LookupOperation(...)`.

```ts
import { LookupOperationBuilder } from 'red-aggregation/operations/lookupOperation';
import { AggregationPipeline } from 'red-aggregation/aggregationPipeline';
import { ExpressionVariable } from 'red-aggregation/operator/variableOperators/let';
```

## Phương thức (Builder)

- [LookupOperationBuilder.from().localField().foreignField().as()](/documentation/operations/lookupOperation.html#builder-lookup-đơn-giản)
- [LookupOperationBuilder.from().let().pipeline().as()](/documentation/operations/lookupOperation.html#builder-lookup-có-let--pipeline)

### Builder: lookup đơn giản (localField/foreignField)

```ts
new LookupOperation(
  // KHÔNG khuyến nghị dùng trực tiếp constructor
); // ❌

// Nên dùng builder:
new LookupOperation(
  // ✅ Sử dụng builder thay cho constructor
);

// Ví dụ:
new LookupOperationBuilder()
  .from('orders')
  .localField('customerId')
  .foreignField('id')
  .as('customer')
  .toDocument(context);
// => {
//   $lookup: {
//     from: 'orders',
//     as: 'customer',
//     localField: 'customerId',
//     foreignField: 'id'
//   }
// }
```

### Builder: lookup có `let` + `pipeline` (correlated)

```ts
// Chuẩn bị biến đầu vào cho pipeline con
const varOrderId = ExpressionVariable
  .newVariable('orderId')
  .forField('orderId');

// Ví dụ 1: một stage trong pipeline
new LookupOperation(
  // KHÔNG khuyến nghị dùng trực tiếp constructor
); // ❌

// Nên dùng builder:
new LookupOperationBuilder()
  .from('orders')
  .let(varOrderId)
  // Có thể truyền một hoặc nhiều stage.
  .pipeline(
    /* một AggregateOperation tương đương { $match: { $expr: { $eq: ['$id', '$$orderId'] } } } */
  )
  .as('matchedOrders')
  .toDocument(context);
// => {
//   $lookup: {
//     from: 'orders',
//     as: 'matchedOrders',
//     let: { orderId: '$orderId' },
//     pipeline: [[ { $match: { $expr: { $eq: ['$id', '$$orderId'] } } } ]]
//   }
// }

// Ví dụ 2: nhiều stage trong pipeline
new LookupOperationBuilder()
  .from('orders')
  .let( ExpressionVariable.newVariable('customerId').forField('customerId') )
  .pipeline(
    /* stage 1: { $match: { status: 'ACTIVE' } } */,
    /* stage 2: { $project: { status: 1 } } */
  )
  .toDocument(context)
  .as('activeOrders');
// => {
//   $lookup: {
//     from: 'orders',
//     as: 'activeOrders',
//     let: { customerId: '$customerId' },
//     pipeline: [ [{ $match: { status: 'ACTIVE' }}], [{ $project: { status: 1 }}] ]
//   }
// }
```

### Lưu ý sử dụng

- Chỉ sử dụng `LookupOperationBuilder` (không khởi tạo `new LookupOperation(...)` trực tiếp).
- Lookup đơn giản yêu cầu `from`, `localField`, `foreignField`, `as`.
- Lookup correlated (pipeline) yêu cầu `from`, `let` (một hoặc nhiều `ExpressionVariable`) và `pipeline`; `as` là bắt buộc để tên trường kết quả.
- Trường `let` được ánh xạ thành `vars` bên trong `$lookup.pipeline`. Pipeline nhận một `AggregationPipeline` hoặc danh sách các `AggregateOperation` (mỗi stage được bao trong một mảng con trong đầu ra).
