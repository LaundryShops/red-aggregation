# Projection Operation

`ProjectionOperation` đại diện cho stage `$project` của MongoDB. Nó cho phép chọn/bỏ cột, đặt bí danh, và xây dựng các biểu thức số học, chuỗi, mảng, so sánh, điều kiện, cũng như lồng biến `let` trong phần chiếu.

```ts
import { ProjectionOperation } from 'red-aggregation/operations/projectionOperation';
import { Fields } from 'red-aggregation/aggregate/field';
import { ArithmeticOperators } from 'red-aggregation/operator/arithmeticOperators/arithmeticOperators';
import { Cond, IfNull } from 'red-aggregation/operator/conditionalOperators';
import { ExpressionVariable } from 'red-aggregation/operator/variableOperators/let';
import { ArrayOperator } from 'red-aggregation/operator/arrayOperators/arrayOperator';
import { ToUpper } from 'red-aggregation/operator/stringOperators/toUppercase';
```

## Phương thức

- [new ProjectionOperation()](/documentation/operations/projectionOperation.html#new-projectionoperation)
- [andInclude(...fields)](/documentation/operations/projectionOperation.html#andincludefields)
- [andExclude(...fields)](/documentation/operators/projectionOperation.html#andexcludefields)
- [and(name|expression|document).as(alias)](/documentation/operations/projectionOperation.html#and--as)
- [and(name).plus/minus/multiply/divide/mod/eq/gt/gte/lt/lte/ne](/documentation/operations/projectionOperation.html#helpers-so-hocva-so-sanh)
- [Array helpers: arrayElementAt/slice/concatArrays/isArray/asArray/andArrayOf](/documentation/operations/projectionOperation.html#helpers-mang)
- [Điều kiện: applyCondition(Cond|IfNull)](/documentation/operations/projectionOperation.html#dieu-kien)
- [nested(fields)](/documentation/operations/projectionOperation.html#nested)
- [previousOperation()](/documentation/operations/projectionOperation.html#previousoperation)
- [lets(...) với $let](/documentation/operations/projectionOperation.html#lets)

### new ProjectionOperation

```ts
new ProjectionOperation().toDocument(context);
// => { $project: {} }
```

### andInclude(...fields)

```ts
new ProjectionOperation()
  .andInclude('firstName')
  .andInclude('lastName')
  .toDocument(context);
// => { $project: { firstName: 1, lastName: 1 } }
```

### andExclude(...fields)

```ts
new ProjectionOperation()
  .andExclude('password', 'secret')
  .toDocument(context);
// => { $project: { password: 0, secret: 0 } }
```

### and(...).as(alias)

Alias field hoặc gán biểu thức/literal cho trường mới.

```ts
// Alias trường
new ProjectionOperation().and('fullName').as('displayName').toDocument(context);
// => { $project: { displayName: '$fullName' } }

// Gán biểu thức số học
new ProjectionOperation()
  .and(ArithmeticOperators.add('$foo').add(41))
  .as('bar')
  .toDocument(context);
// => { $project: { bar: { $add: ['$foo', 41] } } }

// Gán biểu thức chuỗi (AggregationExpression)
new ProjectionOperation()
  .and(ToUpper.valueOf('item'))
  .as('upperItem')
  .toDocument(context);
// => { $project: { upperItem: { $toUpper: '$item' } } }

// Kết hợp include + biểu thức
new ProjectionOperation()
  .andInclude('firstName')
  .and('firstName').toUpper().as('firstNameUpper')
  .toDocument(context);
// => { $project: { firstName: 1, firstNameUpper: { $toUpper: '$firstName' } } }
```

### Helpers số học/so sánh (qua and('field').…​).as('alias')

```ts
new ProjectionOperation()
  .and('price').minus(5).as('discounted')   // { $subtract: ['$price', 5] }
  .and('price').multiply(2).as('double')    // { $multiply: ['$price', 2] }
  .and('price').divide(2).as('half')        // { $divide: ['$price', 2] }
  .and('price').mod(3).as('modulus')        // { $mod: ['$price', 3] }
  .and('price').plus(10).as('total')        // { $add: ['$price', 10] }
  .and('score').eq(10).as('eq')             // { $eq:  ['$score', 10] }
  .and('score').gt(10).as('gt')             // { $gt:  ['$score', 10] }
  .and('score').gte(10).as('gte')           // { $gte: ['$score', 10] }
  .and('score').lt(10).as('lt')             // { $lt:  ['$score', 10] }
  .and('score').lte(10).as('lte')           // { $lte: ['$score', 10] }
  .and('score').ne(10).as('ne')             // { $ne:  ['$score', 10] }
  .toDocument(context);
```

### Helpers mảng

```ts
new ProjectionOperation()
  .and('favorites').arrayElementAt(0).as('first')      // { $arrayElemAt: ['$favorites', 0] }
  .and('favorites').slice(3).as('firstThree')          // { $slice: ['$favorites', 3] }
  .and('favorites').slice(3, 1).as('offsetSlice')      // { $slice: ['$favorites', 1, 3] }
  .and('favorites').concatArrays('others').as('all')   // { $concatArrays: ['$favorites', '$others'] }
  .and('favorites').isArray().as('isArray')            // { $isArray: '$favorites' }
  .toDocument(context);

// Biến các projection hiện tại thành một mảng
new ProjectionOperation()
  .andInclude('firstName').andInclude('lastName')
  .asArray('fullNameParts')
  .toDocument(context);
// => { $project: { fullNameParts: ['$firstName', '$lastName'] } }

// Tạo mảng từ danh sách phần tử (field/expression/literal)
new ProjectionOperation()
  .andArrayOf([Fields.field('city'), { $literal: 'VN' }, 42])
  .as('details')
  .toDocument(context);
// => { $project: { details: ['$city', { $literal: 'VN' }, 42] } }
```

### Điều kiện

```ts
const condExpr = Cond.newBuilder().when({ $gt: ['$score', 90] }).then('honors').otherwise('standard');
const ifNullExpr = IfNull.ifNull('nickname').orIfNull('alias').then('unknown');

new ProjectionOperation()
  .and('grade').applyCondition(condExpr)
  .and('displayName').applyCondition(ifNullExpr)
  .toDocument(context);
// => {
//   $project: {
//     grade: { $cond: { if: { $gt: ['$score', 90] }, then: 'honors', else: 'standard' } },
//     displayName: { $ifNull: ['$nickname', '$alias', 'unknown'] }
//   }
// }
```

### nested(fields)

```ts
new ProjectionOperation()
  .and('profile').nested(Fields.fields('name', 'email'))
  .toDocument(context);
// => { $project: { profile: { name: '$name', email: '$email' } } }
```

### previousOperation()

Tham chiếu kết quả của stage trước đó qua `$_id` và ẩn `_id` hiện tại.

```ts
new ProjectionOperation().and('prop').previousOperation().toDocument(context);
// => { $project: { prop: '$_id', _id: 0 } }
```

### lets(...) (nhúng `$let` trong projection)

```ts
// Dạng (valueExpression, variableName, inExpression)
const total = ArithmeticOperators.add('price').add('tax');
const inExpr = ArithmeticOperators.multiply('$$total').multiplyBy(2);
new ProjectionOperation()
  .and('finalPrice').lets(total, 'total', inExpr).as('finalPrice')
  .toDocument(context);
// => {
//   $project: {
//     finalPrice: {
//       $let: { vars: { total: { $add: ['$price', '$tax'] } }, in: { $multiply: ['$$total', 2] } }
//     }
//   }
// }

// Dạng (variables[], inExpression)
const vars = [
  ExpressionVariable
    .newVariable('discount')
    .forExpression(ArithmeticOperators.multiply('price').multiplyBy(0.1))
];
const apply = ArithmeticOperators.subtract('price').subtract('discount');
new ProjectionOperation()
  .and('finalPrice').lets(vars, apply).as('finalPrice')
  .toDocument(context);
// => {
//   $project: {
//     finalPrice: {
//       $let: { vars: { discount: { $multiply: ['$price', 0.1] } }, in: { $subtract: ['$price', '$$discount'] } }
//     }
//   }
// }
```

### Lưu ý sử dụng

- Không trộn include và exclude trong cùng một `$project` ("Mixing inclusion and exclusion in projection is not allowed.").
- `and(name)` trả về builder; cần `.as(alias)` để chốt projection khi dùng các helper.
- Có thể khởi tạo từ `Fields.fields(...)` để include/alias nhiều field một lượt.
- Một số helper nhận `field`/`expression`/document/literal theo đúng overload (xem ví dụ).
