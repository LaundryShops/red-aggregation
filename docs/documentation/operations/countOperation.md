# Count Operation

`CountOperation` đại diện cho stage `$count` của MongoDB. Nó giúp bạn khởi tạo stage đếm số lượng document khớp pipeline mà không cần viết BSON thủ công.

```ts
import { CountOperation, CountOperationBuilder } from 'red-aggregation/operations';
```

## Phương thức

- [new CountOperation()](/documentation/operations/countOperation.html#new-countoperation)
- [CountOperationBuilder.as()](/documentation/operations/countOperation.html#countoperationbuilderas)

### new CountOperation()

Tạo trực tiếp một stage `$count` với tên field đầu ra.

```ts
const operation = new CountOperation('total');
const doc = operation.toDocument(context);

// => { $count: 'total' }
```

Hoặc với tên field khác:

```ts
const operation = new CountOperation('productCount');
const doc = operation.toDocument(context);

// => { $count: 'productCount' }
```

### CountOperationBuilder.as()

Sử dụng builder để đặt tên field kết quả.

```ts
const operation = new CountOperationBuilder().as('total');
const doc = operation.toDocument(context);

// => { $count: 'total' }
```

Hoặc:

```ts
const operation = new CountOperationBuilder().as('productCount');
const doc = operation.toDocument(context);

// => { $count: 'productCount' }
```

### Lưu ý sử dụng

- Tên field bắt buộc, không được null/undefined/chuỗi rỗng; vi phạm sẽ ném lỗi "Field name must not be null".
- `CountOperation` không kế thừa field từ các stage trước đó; đầu ra là một document duy nhất có field bằng tên đã chỉ định.
