# Group Operation

`GroupOperation` đại diện cho stage `$group` của MongoDB. Nó cho phép nhóm dữ liệu theo một hoặc nhiều field và tính toán các số liệu tổng hợp như `$sum`, `$avg`, `$min`, `$max`, `$first`, `$last`, `$push`, `$addToSet`, `$stdDevPop`, `$stdDevSamp`… bằng cú pháp builder mạch lạc.

```ts
import { GroupOperation } from 'red-aggregation/operations';
import { Fields } from 'red-aggregation/aggregate/field';
```

## Phương thức

- [new GroupOperation(Fields.fields(...))](/documentation/operations/groupOperation.html#new-groupoperation)
- [sum()/avg()/min()/max()/first()/last()/push()/addToSet()/stdDevPop()/stdDevSamp()/count()](/documentation/operations/groupOperation.html#group-aggregators)
- [builder.as(alias)](/documentation/operations/groupOperation.html#builderasalias)
- [and(fieldName, expression)](/documentation/operations/groupOperation.html#andfieldname-expression)

### new GroupOperation()

Khởi tạo `$group` với key `_id` là danh sách field.

```ts
// Không có field -> _id: null
new GroupOperation(Fields.fields())
  .toDocument(context);
// => { $group: { _id: null } }

// Một field -> _id là chuỗi tham chiếu
new GroupOperation(Fields.fields('category'))
  .toDocument(context);
// => { $group: { _id: '$category' } }

// Nhiều field -> _id là object
new GroupOperation(Fields.fields('category', 'status'))
  .toDocument(context);
// => { $group: { _id: { category: '$category', status: '$status' } } }
```

### Group aggregators

Các aggregator trả về builder; gọi `.as(alias)` để đặt tên field kết quả.

```ts
// Tổng hợp nhiều phép trong một group
const op = new GroupOperation(Fields.fields('category'))
  .sum('price').as('total')
  .avg('price').as('avgPrice');

op.toDocument(context);
// => { $group: { _id: '$category', total: { $sum: '$price' }, avgPrice: { $avg: '$price' } } }
```

Đếm số phần tử bằng `.count()` (mapping về `{ $sum: 1 }`):

```ts
new GroupOperation(Fields.fields('category'))
  .count().as('count')
  .toDocument(context);
// => { $group: { _id: '$category', count: { $sum: 1 } } }
```

Ví dụ tổng hợp:

```ts
new GroupOperation(Fields.fields('department'))
  .sum('salary').as('totalSalary')
  .avg('salary').as('avgSalary')
  .min('salary').as('minSalary')
  .max('salary').as('maxSalary')
  .count().as('employeeCount')
  .push('name').as('employeeNames')
  .addToSet('skill').as('uniqueSkills')
  .toDocument(context);
// => {
//   $group: {
//     _id: '$department',
//     totalSalary: { $sum: '$salary' },
//     avgSalary: { $avg: '$salary' },
//     minSalary: { $min: '$salary' },
//     maxSalary: { $max: '$salary' },
//     employeeCount: { $sum: 1 },
//     employeeNames: { $push: '$name' },
//     uniqueSkills: { $addToSet: '$skill' },
//   }
// }
```

### builder.as(alias)

Mọi aggregator/builder yêu cầu `.as(alias)` để đặt tên field đầu ra.

```ts
new GroupOperation(Fields.fields('category'))
  .sum('price').as('total');
```

### and(fieldName, expression)

Thêm một phép nhóm trực tiếp từ tên field + biểu thức (bỏ qua helper aggregator).

```ts
new GroupOperation(Fields.fields('category'))
  .and('totalPrice', { $multiply: ['$price', 1.1] });
```

### Lưu ý sử dụng

- `_id` được thiết lập dựa trên danh sách field: rỗng -> `null`, một field -> `'$field'`, nhiều field -> object.
- `.count()` tương đương thêm `{ $sum: 1 }` với alias bạn chỉ định.
- `.as(alias)` là bắt buộc cho mỗi phép tổng hợp, nếu không sẽ ném lỗi khi render.
- Hỗ trợ truyền reference dạng string, `AggregationExpression` hoặc BSON object cho từng aggregator.
