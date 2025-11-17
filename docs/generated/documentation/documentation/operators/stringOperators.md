# String Operators

`StringOperators` gom nhóm các toán tử chuỗi của MongoDB: nối chuỗi, cắt/ký tự đầu-cuối, chuyển hoa/thường, tách chuỗi và các phép regex. Bắt đầu từ một field hoặc `AggregationExpression`, bạn dùng factory để dựng biểu thức thay vì viết BSON thủ công.

```ts
import { StringOperators } from 'red-aggregation/operator/stringOperators/stringOperator';
```

## Phương thức

- [StringOperators.valueOf()](/documentation/operators/stringOperators.html#stringoperatorsvalueof)
- [factory.concat()/concatValueOf()](/documentation/operators/stringOperators.html#factoryconcatconcatvalueof)
- [factory.toUpper()/toLower()](/documentation/operators/stringOperators.html#factorytouppertolower)
- [factory.trim()/ltrim()/rtrim()](/documentation/operators/stringOperators.html#factorytrimltrimrtrim)
- [factory.split()](/documentation/operators/stringOperators.html#factorysplit)
- [factory.replaceOne()/replaceAll()](/documentation/operators/stringOperators.html#factoryreplaceonereplaceall)
- [factory.regexMatch()/regexFind()/regexFindAll()](/documentation/operators/stringOperators.html#factoryregexmatchregexfindregexfindall)
- [IndexOfBytes.valueOf().indexOf()](/documentation/operators/stringOperators.html#indexofbytes)

### StringOperators.valueOf()

Khởi tạo factory từ field hoặc biểu thức chuỗi.

```ts
const fromField = StringOperators.valueOf('name');
const fromExpr  = StringOperators.valueOf({ $toString: '$age' });
```

### factory.concat() / concatValueOf()

```ts
// Nối literal
fromField.concat(' (VIP)').toDocument(context);
// => { $concat: ['$name', ' (VIP)'] }

// Nối giá trị từ field/expression khác
fromField.concatValueOf('suffix').toDocument(context);
// => { $concat: ['$name', '$suffix'] }
```

### factory.toUpper() / toLower()

```ts
StringOperators.valueOf('code').toUpper().toDocument(context);
// => { $toUpper: '$code' }

StringOperators.valueOf({ $substr: ['$sku', 0, 3] }).toLower().toDocument(context);
// => { $toLower: { $substr: ['$sku', 0, 3] } }
```

### factory.trim() / ltrim() / rtrim()

```ts
// Trim mặc định (khoảng trắng)
StringOperators.valueOf('title').trim().toDocument(context);
// => { $trim: { input: '$title' } }

// Trim ký tự tuỳ chọn
StringOperators.valueOf('title').trim(':').toDocument(context);
// => { $trim: { input: '$title', chars: ':' } }

// Left/Right trim
StringOperators.valueOf('path').ltrim('/').toDocument(context);
// => { $ltrim: { input: '$path', chars: '/' } }

StringOperators.valueOf('path').rtrim('/').toDocument(context);
// => { $rtrim: { input: '$path', chars: '/' } }
```

### factory.split()

```ts
StringOperators.valueOf('tags').split(',').toDocument(context);
// => { $split: ['$tags', ','] }

StringOperators.valueOf({ $toString: '$payload' }).split('-').toDocument(context);
// => { $split: [{ $toString: '$payload' }, '-'] }
```

### factory.replaceOne() / replaceAll()

```ts
StringOperators.valueOf('text').replaceOne('foo', 'bar').toDocument(context);
// => { $replaceOne: { input: '$text', find: 'foo', replacement: 'bar' } }

StringOperators.valueOf('text').replaceAll(' ', '_').toDocument(context);
// => { $replaceAll: { input: '$text', find: ' ', replacement: '_' } }
```

### factory.regexMatch() / regexFind() / regexFindAll()

```ts
// regexMatch: trả boolean
StringOperators.valueOf('email')
  .regexMatch('^.+@example\\.com$')
  .options('i')
  .toDocument(context);
// => { $regexMatch: { input: '$email', regex: '^.+@example\\.com$', options: 'i' } }

// regexFind: trả kết quả khớp đầu tiên
StringOperators.valueOf('text')
  .regexFind('foo', 'i')
  .toDocument(context);
// => { $regexFind: { input: '$text', regex: 'foo', options: 'i' } }

// regexFindAll: trả tất cả kết quả khớp
StringOperators.valueOf('text')
  .regexFindAll('foo', 'g')
  .toDocument(context);
// => { $regexFindAll: { input: '$text', regex: 'foo', options: 'g' } }
```

### IndexOfBytes

```ts
import { IndexOfBytes } from 'red-aggregation/operator/stringOperators/indexOfBytesOperator';

IndexOfBytes.valueOf('text').indexOf('sub').toDocument(context);
// => { $indexOfBytes: ['$text', 'sub'] }
```

### Lưu ý sử dụng

- Factory và builders ném lỗi khi input/null không hợp lệ (`Assert.notNull`).
- Với tham số string đại diện field, thư viện sẽ chuẩn hóa thành field reference (`'$field'`).
- `trim/ltrim/rtrim` cho phép truyền `chars` dạng literal hoặc expression (`.charsOf(...)`).
- Regex APIs chấp nhận pattern dạng literal string, `RegExp`, hoặc biểu thức; có thể chỉ định `options` qua literal hoặc `.optionsOf(...)`.
