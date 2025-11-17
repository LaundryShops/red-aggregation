# Variable Operators

`VariableOperators` hỗ trợ tạo biến cục bộ trong biểu thức MongoDB bằng `$let`. Bạn định nghĩa danh sách biến từ `field` hoặc `AggregationExpression` rồi áp dụng vào một biểu thức "in" mà không cần tự viết BSON thủ công.

```ts
import { VariableOperators } from 'red-aggregation/operator/variableOperators';
import { ExpressionVariable } from 'red-aggregation/operator/variableOperators/let';
```

## Phương thức

- [VariableOperators.define()](/documentation/operators/variableOperators.html#variableoperatorsdefine)
- [ExpressionVariable.newVariable().forField()/forExpression()](/documentation/operators/variableOperators.html#expressionvariablenewvariable)

### VariableOperators.define()

Nhận một hoặc nhiều `ExpressionVariable`, trả về builder để chỉ định biểu thức áp dụng qua `.andApply(...)`.

```ts
const vars = [
  ExpressionVariable.newVariable('x').forField('price'),
  ExpressionVariable.newVariable('y').forExpression({ $multiply: ['$qty', '$unit'] })
];

VariableOperators.define(vars)
  .andApply({ $add: ['$$x', '$$y'] })
  .toDocument(context);
// => { $let: { vars: { x: '$price', y: { $multiply: ['$qty', '$unit'] } }, in: { $add: ['$$x', '$$y'] } } }
```

Hoặc truyền biến rải rác (không cần gói mảng):

```ts
VariableOperators.define(
  ExpressionVariable.newVariable('first').forField('a'),
  ExpressionVariable.newVariable('second').forExpression({ $toString: '$b' })
).andApply({ $concat: ['$$first', '$$second'] }).toDocument(context);
// => { $let: { vars: { first: '$a', second: { $toString: '$b' } }, in: { $concat: ['$$first', '$$second'] } } }
```

### ExpressionVariable.newVariable()

Tạo biến và gán nguồn giá trị cho biến đó.

```ts
const v1 = ExpressionVariable.newVariable('total').forExpression({ $add: ['$a', '$b'] });
const v2 = ExpressionVariable.newVariable('lower').forField('title');

VariableOperators.define(v1, v2)
  .andApply({ $toLower: '$$lower' })
  .toDocument(context);
// => { $let: { vars: { total: { $add: ['$a', '$b'] }, lower: '$title' }, in: { $toLower: '$$lower' } } }
```

### Lưu ý sử dụng

- Tên biến phải không null; truyền null cho biến hoặc biểu thức sẽ ném lỗi (`Assert.notNull`).
- Trong phần `in`, tham chiếu biến dùng cú pháp `$$varName` và context thực thi sẽ được mở rộng để nhìn thấy các biến đã định nghĩa.
- `forField('name')` tự chuẩn hóa thành field reference (`'$name'`); `forExpression(...)` nhận `AggregationExpression` hoặc BSON expression.
