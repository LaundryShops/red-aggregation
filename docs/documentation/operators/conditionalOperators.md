# Conditional Operators

Đối tượng `ConditionOperator` đại diện cho nhóm toán tử điều kiện, giúp bạn rẽ nhánh dữ liệu trong MongoDB Aggregation. Nó có các static method giúp bạn khởi tạo toán tử điều kiện như: `$cond`, `$ifNull`, `$switch` thay vì viết BSON thủ công. Các toán tử này sẽ nhận vào dữ liệu thuộc `AggregationExpression`, `field`, `literal` và sẽ trả ra instance của toán tử. Các instance này là một phần để có thể tạo dựng được stage trong MongoDB Aggregation.

```ts
import { ConditionOperator } from 'red-aggregation/operator/conditionalOperators/conditionOperators';
...
```

## Phương thức

- [ConditionOperator.when()](/documentation/operators/conditionalOperators.html#conditionoperatorwhen)
- [ConditionOperator.switchCases()](/documentation/operators/conditionalOperators.html#conditionoperatorswitchcases)
- [ConditionOperator.ifNull()](/documentation/operators/conditionalOperators.html#conditionoperatorifnull)

### ConditionOperator.when()

Khởi tạo builder `$cond` từ field, literal hoặc expression. Toán tử `$cond` được sử dụng để đánh
giá một biểu thức boolean để trả về một trong hai biểu thức trả về đã chỉ định.

```ts
// Literal boolean
const conditionOperator = ConditionOperator.when('isActive')
  .then(true)
  .otherwise(false)
  .toDocument(context);
// => { $cond: { if: '$isActive', then: true, else: false } }
```

Hoặc:

```ts
// Field reference
const condField = ConditionOperator.when('score')
  .thenValueOf('maxScore')                   // field reference
  .otherwise(Fields.field('minScore'))       // Field object
  .toDocument(context);
// => { $cond: { if: '$score', then: '$maxScore', else: '$minScore' } }
```

Hoặc:

```ts
// Expression
const condExpr = ConditionOperator.when({ $gte: ['$age', 18] }) // AggregationExpression
  .thenValueOf({ $multiply: ['$salary', 1.1] })                 // expression as value
  .otherwise({ $multiply: ['$salary', 0.8] })
  .toDocument(context);
// => { $cond: { 
//      if: { $gte: ['$age', 18] },
//      then: { $multiply: ... },
//      else: { $multiply: ... } 
//    }}
```

### ConditionOperator.switchCases()

Tạo `$switch` từ danh sách case. Toán tử `$switch` được sử đụng để đánh giá một loạt các biểu thức trường hợp.
Khi tìm thấy một biểu thức được đánh giá là đúng, `$switch` sẽ thực thi một biểu thức đã chỉ định và thoát ra khỏi luồng điều khiển.

Các đối tượng trong `branches` chỉ được chứa một trường `case` và một trường `then`.

```ts
import { CaseOperator } from 'red-aggregation/switch';
const caseA = CaseOperator.thenBuilder(ComparisonOperation.eq('$type').equalToValue('A'))
  .then('Tier A');
const caseB = CaseOperator.thenBuilder({ $gte: ['$score', 80] }).then('Tier B');

const switch = ConditionOperator.switchCases(caseA, caseB)
  .defaultTo('Tier C')
  .toDocument(context);
// => {
//   $switch: {
//     branches: [
//       { case: { $eq: ['$type', 'A'] }, then: 'Tier A' },
//       { case: { $gte: ['$score', 80] }, then: 'Tier B' }
//     ],
//     default: 'Tier C'
//   }
// }
```

Hoặc:

```ts
import { CaseOperator } from 'red-aggregation/switch';
const caseA = CaseOperator.thenBuilder(ComparisonOperation.eq('$type').equalToValue('A'))
  .then('Tier A');
const caseB = CaseOperator.thenBuilder({ $gte: ['$score', 80] }).then('Tier B');

const switch = ConditionOperator.switchCases([caseA, caseB])
  .defaultTo('Tier C')
  .toDocument(context);
// => {
//   $switch: {
//     branches: [
//       { case: { $eq: ['$type', 'A'] }, then: 'Tier A' },
//       { case: { $gte: ['$score', 80] }, then: 'Tier B' }
//     ],
//     default: 'Tier C'
//   }
// }
```

### ConditionOperator.ifNull()

Tạo builder `$ifNull`. Toán tử `$ifNull` được sử dụng để đánh giá các biểu thức đầu vào cho các giá trị null và trả về:

- Đã tìm thấy giá trị biểu thức đầu vào không null đầu tiên.
- Giá trị biểu thức thay thế nếu tất cả biểu thức đầu vào có giá trị rỗng.

`$ifNull` coi các giá trị không xác định và các trường bị thiếu là null.

```ts
const ifNull = ConditionOperator.ifNull('nickname')
  .then('N/A')
  .toDocument(context);
// => { $ifNull: ['$nickname', 'N/A'] }
```

Hoặc:

```ts
const ifNullWithExpr = ConditionOperator.ifNUll({ $toString: '$age' })
  .thenValueOf({ $multiply: ['$weight', 10] })
  .toDocument(context);
// => { $ifNull: [{ $toString: '$age' }, { $multiply: ['$weight', 10] }] }
```

Hoặc:

```ts
const ifNullChained = ConditionOperator.ifNUll('primaryEmail') // first condition
  .orIfNull('secondaryEmail')                                  // additional condition
  .thenValueOf('backupEmail')
  .toDocument(context);
// => { $ifNull: ['$primaryEmail', '$secondaryEmail', '$backupEmail'] }
```

### Lưu ý sử dụng
