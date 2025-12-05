## Red Aggregate

**Red Aggregate** là một thư viện hỗ trợ xây dựng MongoDB Aggregation Pipeline bằng TypeScript với API kiểu fluent, giúp bạn tái sử dụng và chia sẻ các pipeline phức tạp một cách nhất quán.

- **GitHub**: [LaundryShops/red-aggregation](https://github.com/LaundryShops/red-aggregation)

### Cài đặt

```bash
npm install red-aggregate
# hoặc
yarn add red-aggregate
```

### Sử dụng cơ bản

```ts
import Aggregation, {
  AggregationUpdate,
  AggregationExpression,
} from 'red-aggregate';

// Ví dụ aggregation pipeline đơn giản
const agg = Aggregation.newAggregation([
  Aggregation.match({ status: 'ACTIVE' }),
  Aggregation.sortByCount('category'),
]);

// Hoặc dùng các helper static
const pipeline = Aggregation.newAggregation(
  Aggregation.match({ status: 'ACTIVE' }),
  Aggregation.sortByCount('category'),
);
```

### Aggregation Update

```ts
import { AggregationUpdate } from 'red-aggregate';

const update = AggregationUpdate
  .update()
  .set(
    Aggregation.set().field('status').toValue('INACTIVE'),
  )
  .unset('deprecatedField');
```

### Scripts & Workflow

- **Build TypeScript**: `npm run build` (output vào thư mục `dist/`)
- **Test**: `npm test` (sử dụng Jest)

### Tài liệu

- Toàn bộ tài liệu chi tiết được build bằng MkDocs từ thư mục `docs/`.
- Bạn có thể xem bản render trên GitHub Pages tại: [Red Aggregation Docs](https://laundryshops.github.io/red-aggregation/documentation/aggregation.html)

```bash
cd docs
make generate-site
```

Site tĩnh sau khi build sẽ nằm trong `docs/generated/site`.

### Đóng góp

1. Fork repo & tạo branch mới từ `develop`.
2. Cài đặt dependencies: `npm install`.
3. Viết code + test: `npm test`.
4. Gửi Pull Request vào `develop`.

### License

Thư viện được phát hành dưới giấy phép **ISC** (xem trong `package.json`).
