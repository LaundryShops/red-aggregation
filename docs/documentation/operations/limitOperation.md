# Limit Operation

`LimitOperation` đại diện cho stage `$limit` của MongoDB. Dùng để giới hạn số lượng tài liệu trả về trong pipeline.

```ts
import { Limit } from 'red-aggregation/operations'; // alias/export của LimitOperation (nếu dùng trực tiếp class thì: import { LimitOperation } ...)
```

## Phương thức

- [new Limit(number)](/documentation/operations/limitOperation.html#new-limit)

### new Limit(count)

Khởi tạo stage `$limit` với số lượng phần tử tối đa cần lấy. Giá trị phải là số không âm.

```ts
new Limit(0).to然; // hoặc: new LimitOperation(0).toDocument(context)
// => { $limit: 0 }

new Limit(1).toDocument(context);
// => { $limit: 1 }

new Limit(25).toDocument(context);
// => { $limit: 25 }
```

### Lưu ý sử dụng

- `count` phải là số nguyên không âm; nếu nhỏ hơn 0 sẽ ném lỗi: "Maximum number of elements must be greater or equal to 0".
- `Limit` không thay đổi cấu trúc tài liệu, chỉ cắt số lượng bản ghi đi qua stage.
