# Sort Operation

`SortOperation` đại diện cho stage `$sort` của MongoDB. Nó sắp xếp tập kết quả theo một hoặc nhiều trường với thứ tự tăng (`ASC`) hoặc giảm (`DESC`). `SortOperation` nhận vào một `Sort` mô tả danh sách các `Order`.

```ts
import { SortOperation } from 'red-aggregation/operations/sortOperation';
import { Sort } from 'red-aggregation/domain/sort';
import { Direction, Order } from 'red-aggregation/domain/order';
```

## Phương thức

- [new SortOperation(sort: Sort)](/documentation/operations/sortOperation.html#new-sortoperation)
- [Sort.by(property) / Sort.by(Direction, ...properties) / Sort.by(Order, ...)](/documentation/operations/sortOperation.html#sortby)
- [Sort.thenBy(prop) / thenByDescending(prop)](/documentation/operations/sortOperation.html#thenby)
- [Sort.unsorted() / Sort.fromOrder(...)](/documentation/operations/sortOperation.html#helpers)
- [SortOperation.and(sort) / and(Direction, ...fields)](/documentation/operations/sortOperation.html#and)

### new SortOperation(sort)

```ts
// Sắp xếp tăng theo name
new SortOperation(Sort.by('name')).toDocument(context);
// => { $sort: { name: 1 } }

// Sắp xếp giảm theo price
new SortOperation(Sort.by(Direction.DESC, 'price')).toDocument(context);
// => { $sort: { price: -1 } }
```

### Sort.by(...)

```ts
// Một trường, mặc định ASC
const s1 = Sort.by('name');                     // ORDER: name ASC

// Nhiều trường với cùng direction
const s2 = Sort.by(Direction.ASC, 'category', 'name');
// yields $sort: { category: 1, name: 1 }

// Kết hợp nhiều Order
const s3 = Sort.by(
  Order.asc('category'),
  Order.desc('price')
);
// yields $sort: { category: 1, price: -1 }
```

### Kết hợp nhiều tiêu chí sort

```ts
// Kết hợp nhiều Sort
const base = Sort.by('name');
const combined = base.and(Sort.by(Direction.DESC, 'price'));
new SortOperation(combined).toDocument(context);
// => { $sort: { name: 1, price: -1 } }

// Hoặc dùng SortOperation.and(...)
new SortOperation(Sort.by('name'))
  .and(Direction.DESC, 'price', 'amount')
  .toDocument(context);
// => { $sort: { name: 1, price: -1, amount: -1 } }
```

### Helpers khác trên Sort

```ts
// Không sắp xếp
new SortOperation(Sort.unsorted()).toDocument(context);
// => { $sort: {} }

// thenBy / thenByDescending
const s = Sort.by('status').thenByDescending('createdAt').thenBy('name');
new SortOperation(s).toDocument(context);
// => { $sort: { status: 1, createdAt: -1, name: 1 } }

// Ép tất cả về tăng/giảm
Sort.by(Direction.DESC, 'price').ascending(); // -> tất cả ASC
Sort.by('price').descending();                 // -> tất cả DESC

// Tạo từ các Order
const s4 = Sort.fromOrder(
  Order.asc('name'),
  Order.desc('age')
);
new SortOperation(s4).toDocument(context);
// => { $sort: { name: 1, age: -1 } }
```

### Lưu ý sử dụng

- `SortOperation` chỉ nhận một `Sort`; luôn khởi tạo `Sort` bằng các helper `Sort.by(...)`, `Order.asc/desc(...)`.
- `Direction.ASC` ↔ 1, `Direction.DESC` ↔ -1 trong `$sort`.
- Tên field được map qua `context.getReference(property).getRaw()`; truyền đúng tên field theo schema.
