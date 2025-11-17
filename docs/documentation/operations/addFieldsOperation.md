# AddFields Operation

`AddFieldsOperation` đại diện cho toán tử `$addFields` của mongoDB. Nó có các method giúp bạn khởi tạo stage `$addFields` thay vì phải viết BSON thủ công.

```ts
import { AddFieldsOperation } from 'red-aggregation/operations';
```

## Phương thức

- [AddFieldsOperation.addField()](/documentation/operations/addFieldsOperation.html#addfieldoperationaddfield)
- [AddFieldsOperation.builder()](/documentation/operations/addFieldsOperation.html#addfieldoperationbuilder)

### AddFieldsOperation.addField()

```ts
const operation = AddFieldsOperation.addField('name', 'John');
const doc = operation.toDocument(context);

// => { $addFields: { name: "John" } }
```

Hoặc:

```ts
const operation = AddFieldsOperation.addField('fullName', Fields.field('firstName'));
const doc = operation.toDocument(context);

// => { $addFields: { fullName: "$firstName" } }
```

Hoặc:

```ts
const operation = AddFieldsOperation.addField('total', ArithmeticOperators.add('$price').add('$tax'));
const doc = operation.toDocument(context);

// => { $addFields: { total: { $add: ["$price", "$tax"] } } }
```

### AddFieldsOperation.builder()

```ts
const operation = AddFieldsOperation.builder()
    .addField("name").withValue("John")
    .addField("age").withValue(25)
    .build();

const doc = operation.toDocument(context);

// => { $addFields: { name: "$John", age: 25 } }
```

```ts
const operation = AddFieldsOperation.builder()
    .addFieldWithValueOf('name', 'John')
    .addFieldWithValueOf('age', 25)
    .build();
const doc = operation.toDocument(context);

// => { $addFields: { name: "$John", age: 25 } }
```

```ts
const operation = AddFieldsOperation.builder()
 .addField('fullName')
 .withValueOf(ArithmeticOperators.add('$firstName').add('$lastName'))
 .addField('discount')
 .withValueOf(ArithmeticOperators.multiply('$price').multiplyBy(0.1))
 .build();

const doc = operation.toDocument(context);

// => {
//      $addFields: {
//          fullName: { $add: ["$firstName", "$lastName"] },
//          discount: { $multiply: ["$price", 0.1] }
//      }
//    }
```
