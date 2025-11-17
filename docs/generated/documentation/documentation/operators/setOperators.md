# Set Operators

`SetOperators` đại diện cho các toán tử tập hợp của MongoDB cho mảng: `$setEquals`, `$setUnion`, `$setIsSubset`. Bắt đầu từ một mảng (field hoặc expression), bạn khởi tạo factory và chain các phép so sánh/tổ hợp giữa nhiều tập.

```ts
import { SetOperators } from 'red-aggregation/operator/setOperators';
```

## Phương thức

- [SetOperators.arrayAsSet()](/documentation/operators/setOperators.html#setoperatorsarrayasset)
- [factory.isEqualTo()](/documentation/operators/setOperators.html#factoryisequalto)
- [factory.union()](/documentation/operators/setOperators.html#factoryunion)
- [factory.isSubsetOf()](/documentation/operators/setOperators.html#factoryissubsetof)

### SetOperators.arrayAsSet()

Khởi tạo factory từ field reference hoặc `AggregationExpression` đại diện cho một mảng.

```ts
const fromField = SetOperators.arrayAsSet('tags');      // '$tags'
const fromExpr  = SetOperators.arrayAsSet({ $split: ['$raw', ','] });
```

### factory.isEqualTo()

Sinh `$setEquals` để kiểm tra hai hay nhiều tập hợp bằng nhau (không xét thứ tự, bỏ trùng lặp).

```ts
SetOperators.arrayAsSet('a')
  .isEqualTo('b')
  .toDocument(context);
// => { $setEquals: ['$a', '$b'] }

SetOperators.arrayAsSet({ $map: { input: '$items', as: 'i', in: '$$i.id' } })
  .isEqualTo({ $range: [0, 10] })
  .toDocument(context);
// => { $setEquals: [{ $map: ... }, { $range: [0, 10] }] }
```

### factory.union()

Hợp nhất nhiều tập thông qua `$setUnion`.

```ts
SetOperators.arrayAsSet('roles')
  .union('defaultRoles', ['guest'])
  .toDocument(context);
// => { $setUnion: ['$roles', '$defaultRoles', ['guest']] }
```

### factory.isSubsetOf()

Kiểm tra tập khởi tạo là tập con của các tập còn lại bằng `$setIsSubset`.

```ts
SetOperators.arrayAsSet('selected')
  .isSubsetOf('allowed')
  .toDocument(context);
// => { $setIsSubset: ['$selected', '$allowed'] }

SetOperators.arrayAsSet({ $setUnion: ['$a', '$b'] })
  .isSubsetOf({ $range: [0, 100] })
  .toDocument(context);
// => { $setIsSubset: [{ $setUnion: ['$a', '$b'] }, { $range: [0, 100] }] }
```

### Lưu ý sử dụng

- `arrayAsSet(...)` và các phương thức factory ném lỗi khi input `null` (kiểm tra `Assert.notNull`).
- Mọi tham số có thể là field reference, `AggregationExpression` hoặc literal mảng (khi phù hợp). Khi truyền string, thư viện tự chuẩn hóa thành field reference (thêm `$`).
- `$setEquals`, `$setUnion`, `$setIsSubset` hoạt động trên tập hợp (loại bỏ phần tử trùng, không xét thứ tự).
