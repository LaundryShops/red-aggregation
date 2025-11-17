# Facet Operation

`FacetOperation` đại diện cho stage `$facet` của MongoDB. Nó cho phép chạy nhiều pipeline song song và gom kết quả vào một document theo các key định danh, giúp bạn tạo báo cáo/tổng hợp đa chiều trong một lần quét dữ liệu.

```ts
import { FacetOperation } from 'red-aggregation/operations';
```

## Phương thức

- [FacetOperation.EMPTY](/documentation/operations/facetOperation.html#facetoperationempty)
- [FacetOperation.newFacet()](/documentation/operations/facetOperation.html#facetoperationnewfacet)
- [FacetOperation.and().as()](/documentation/operations/facetOperation.html#facetoperationandas)

### FacetOperation.EMPTY

Khởi tạo `$facet` rỗng.

```ts
const doc = FacetOperation.EMPTY.toDocument(context);

// => { $facet: {} }
```

### FacetOperation.and().as()

Thêm một pipeline và đặt tên facet bằng `.as(name)`.

```ts
// Ví dụ với stage giả lập
const stage = new RecordingOperation({ $match: { status: 'ACTIVE' } });
const operation = FacetOperation.EMPTY.and(stage).as('activeOrders');
const document = operation.toDocument(context);

// => {
//   $facet: {
//     activeOrders: [[{ $match: { status: 'ACTIVE' } }]]
//   }
// }
```

Thêm nhiều facet liên tiếp:

```ts
const matchStage = new RecordingOperation({ $match: { status: 'ACTIVE' } });
const sortStage = new RecordingOperation({ $sort: { createdAt: -1 } });

const operation = FacetOperation.EMPTY
  .and(matchStage).as('active')
  .and(sortStage).as('recent');
const document = operation.toDocument(context);

// => {
//   $facet: {
//     active: [[{ $match: { status: 'ACTIVE' } }]],
//     recent: [[{ $sort: { createdAt: -1 } }]]
//   }
// }
```

### FacetOperation.newFacet()

Khởi tạo từ `Facets` có sẵn.

```ts
const stage = new RecordingOperation({ $count: 'total' });
const facets = Facets.EMPTY.and('counts', [stage]);

const operation = FacetOperation.newFacet(facets);
const document = operation.toDocument(context);

// => {
//   $facet: {
//     counts: [[{ $count: 'total' }]]
//   }
// }
```

### Lưu ý sử dụng

- `.and(...operations)` yêu cầu truyền ít nhất một stage; name trong `.as(name)` phải không rỗng (được kiểm tra bởi `Assert`).
- `getFields()` trả về các field được expose tương ứng với mỗi facet, hữu ích cho hệ thống gợi ý ở các bước sau của pipeline.
- Kết quả `$facet` là một document chứa mỗi key là tên facet, giá trị là một mảng các pipeline (theo đúng format MongoDB).
