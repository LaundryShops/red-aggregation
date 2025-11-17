# Skip Operation

`SkipOperation` đại diện cho stage `$skip` của MongoDB. Dùng để bỏ qua (không lấy) một số lượng bản ghi đầu tiên trong pipeline.

```ts
import { Skip } from 'red-aggregation/operations'; // alias/export của SkipOperation (hoặc import { SkipOperation } ...)
```

## Phương thức

- [new Skip(count)](/documentation/operations/skipOperation.html#new-skip)

### new Skip(count)

Khởi tạo stage `$skip` với số lượng bản ghi cần bỏ qua. Giá trị phải là số dương (> 0).

```ts
new Skip(5).toDocument(context);      // hoặc: new SkipOperation(5).toDocument(context)
// => { $skip: 5 }

new Skip(1).toDocument(context);
// => { $skip: 1 }
```

### Lưu ý sử dụng

- `count` phải lớn hơn 0; nếu `count <= 0` sẽ ném lỗi: "Skip count must not be negative".
- `$skip` thường được dùng kết hợp với `$limit` để phân trang.

