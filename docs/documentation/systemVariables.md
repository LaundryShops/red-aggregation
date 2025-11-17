# System Variables

Module `systemVariables` gom tất cả biến hệ thống mà MongoDB Aggregation Framework hỗ trợ để bạn thao tác an toàn trong TypeScript.

## Enum `SystemVariables`

| Enum | Literal MongoDB | Công dụng |
| --- | --- | --- |
| `NOW` | `$$NOW` | Thời điểm hiện tại dưới dạng `Date`, cố định trong mỗi pipeline run. |
| `ROOT` | `$$ROOT` | Tài liệu gốc trước khi biến đổi bởi các stage. |
| `CURRENT` | `$$CURRENT` | Tài liệu ở trạng thái hiện tại tại stage đang thực thi. |
| `REMOVE` | `$$REMOVE` | Giá trị đặc biệt dùng để xóa field trong `$addFields`, `$set`, … |

## Lớp `SystemVariablesImpl`

- Kế thừa `AggregationVariable`, lưu trữ tên biến và trả về chuỗi với tiền tố `$$`.
- `getRaw()` trả về tên enum (không có `$$`), `getTarget()` hoặc `toString()` trả về literal hoàn chỉnh (`$$ROOT`).
- Thuộc tính `PREFIX` cố định là `$$`, giúp bảo đảm chuỗi hợp lệ.

```ts
const rootVar = new SystemVariablesImpl(SystemVariables.ROOT);
rootVar.toString(); // "$$ROOT"
```

## Hàm tiện ích

- `SystemVariablesImpl.variableNameFrom(field: string | null)`: Rút trích tên biến từ chuỗi như `$$NOW.createdAt`. Nếu không hợp lệ trả về `null`.
- `SystemVariablesImpl.isReferingToSystemVariable(field: string)`: Kiểm tra chuỗi có tham chiếu tới enum đã khai báo hay không.

```ts
SystemVariablesImpl.isReferingToSystemVariable("$$CURRENT") // true
SystemVariablesImpl.variableNameFrom("$$NOW.createdAt")     // "NOW"
```

## Sử dụng trong pipeline

```ts
import { SystemVariables, SystemVariablesImpl } from "@/systemVariables";

pipeline.addFields({
  generatedAt: new SystemVariablesImpl(SystemVariables.NOW).getTarget(),
  rawDocument: new SystemVariablesImpl(SystemVariables.ROOT).toString(),
});
```

Trong đa số builder, bạn có thể truyền trực tiếp instance `SystemVariablesImpl` vì chúng tự chuyển thành chuỗi khi cần. Ưu tiên enum thay vì tự gõ literal để tránh sai chính tả và đồng bộ với phiên bản MongoDB được hỗ trợ.
