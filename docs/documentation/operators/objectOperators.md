# Object Operators

`ObjectOperators` đại diện cho nhóm toán tử thao tác object trong MongoDB: `$getField`, `$setField`, `$mergeObjects`, `$objectToArray`. Nó cung cấp các static method và builder giúp bạn tạo biểu thức từ `field`, `AggregationExpression` hoặc system variables (ví dụ: `$$CURRENT`), tránh phải viết BSON thủ công.

```ts
import { ObjectOperators } from 'red-aggregation/operator/objectOperators/objectOperators';
```

## Phương thức

- [ObjectOperators.valueOf()](/documentation/operators/objectOperators.html#objectoperatorsvalueof)
- [ObjectOperators.setValueTo()](/documentation/operators/objectOperators.html#objectoperatorssetvalueto)
- [ObjectOperators.mergeObject()](/documentation/operators/objectOperators.html#objectoperatorsmergeobject)
- [ObjectOperators.mergeValueOf()](/documentation/operators/objectOperators.html#objectoperatorsmergevalueof)
- [factory.merge()](/documentation/operators/objectOperators.html#factorymerge)
- [factory.mergeWith()](/documentation/operators/objectOperators.html#factorymergewith)
- [factory.mergeWithValuesOf()](/documentation/operators/objectOperators.html#factorymergewithvaluesof)
- [factory.toArray()](/documentation/operators/objectOperators.html#factorytoarray)
- [factory.getField()](/documentation/operators/objectOperators.html#factorygetfield)
- [factory.setField()/removeField()](/documentation/operators/objectOperators.html#factorysetfieldremovefield)

### ObjectOperators.valueOf()

Khởi tạo factory từ field reference hoặc system variable (ví dụ `$$CURRENT`), sau đó chain tới toán tử mong muốn.

```ts
// Field reference
ObjectOperators.valueOf('profile')
  .getField('name')
  .of('profile')
  .toDocument(context);
// => { $getField: { field: 'name', input: '$profile' } }
```

Hoặc (system variable):

```ts
ObjectOperators.valueOf('$$CURRENT')
  .setField('status')
  .toValue('active')
  .toDocument(context);
// => { $setField: { field: 'status', input: '$$CURRENT', value: 'active' } }
```

### ObjectOperators.setValueTo()

Shortcut để set một field vào `$$CURRENT`.

```ts
ObjectOperators.setValueTo('flag', true).toDocument(context);
// => { $setField: { field: 'flag', input: '$$CURRENT', value: true } }
```

### ObjectOperators.mergeObject()

Tạo `$mergeObjects` từ literal/object/expression.

```ts
ObjectOperators.mergeObject({ a: 1 }).mergeWith({ b: 2 }).toDocument(context);
// => { $mergeObjects: [{ a: 1 }, { b: 2 }] }
```

### ObjectOperators.mergeValueOf()

Ghép nhiều field hoặc expression vào `$mergeObjects`.

```ts
ObjectOperators.mergeValueOf('a', 'b').toDocument(context);
// => { $mergeObjects: ['$a', '$b'] }

ObjectOperators.mergeValueOf({ $toObjectId: '$id' }).toDocument(context);
// => { $mergeObjects: [{ $toObjectId: '$id' }] }
```

### factory.merge()

```ts
ObjectOperators.valueOf('base').merge().mergeWith({ extra: true }).toDocument(context);
// => { $mergeObjects: ['$base', { extra: true }] }
```

### factory.mergeWith() / mergeWithValuesOf()

```ts
ObjectOperators.valueOf('base')
  .mergeWith({ a: 1 })
  .mergeWith({ b: 2 })
  .toDocument(context);
// => { $mergeObjects: ['$base', { a: 1 }, { b: 2 }] }

ObjectOperators.valueOf('base')
  .mergeWithValuesOf('a', 'b')
  .toDocument(context);
// => { $mergeObjects: ['$base', '$a', '$b'] }
```

### factory.toArray()

Chuyển object thành mảng key/value (`$objectToArray`).

```ts
ObjectOperators.valueOf('doc').toArray().toDocument(context);
// => { $objectToArray: '$doc' }
```

### factory.getField()

Dựng `$getField` rồi chỉ định input bằng `.of(...)`.

```ts
ObjectOperators.valueOf('doc')
  .getField('name')
  .of('doc')
  .toDocument(context);
// => { $getField: { field: 'name', input: '$doc' } }
```

### factory.setField() / removeField()

Thêm hoặc xóa field bằng `$setField` (xóa dùng `$$REMOVE`).

```ts
// Set
ObjectOperators.valueOf('doc')
  .setField('age')
  .toValue(30)
  .toDocument(context);
// => { $setField: { field: 'age', input: '$doc', value: 30 } }

// Remove
ObjectOperators.valueOf('doc')
  .removeField('age')
  .toDocument(context);
// => { $setField: { field: 'age', input: '$doc', value: '$$REMOVE' } }
```

### Lưu ý sử dụng

- `ObjectOperators.valueOf(...)` chấp nhận field reference hoặc system variable hợp lệ (ví dụ `$$CURRENT`).
- `removeField(name)` sử dụng giá trị đặc biệt `$$REMOVE` để xóa field trong `$setField`.
- `ObjectToArray.valueOfToArray(...)`/`ObjectOperatorFactory.toArray()` ném lỗi khi input null (theo kiểm tra `Assert.notNull`).
- `mergeValueOf()` và `mergeWithValuesOf()` cho phép trộn field reference và expression; nếu có string, chúng được chuẩn hóa sang field reference trước khi merge.
