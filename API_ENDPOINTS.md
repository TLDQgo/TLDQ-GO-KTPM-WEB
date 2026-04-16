# API Endpoints - User Service

Tài liệu này dùng để chia sẻ nhanh cho người khác cách gọi API của service.

## Base URL

- Production (EC2/Gateway): `http://18.143.172.207:3000/api`
- Local (Gateway): `http://localhost:3000/api`
- Prefix route (User Service qua Gateway): `/users`
- Ví dụ endpoint đầy đủ: `http://18.143.172.207:3000/api/users/register`

> User service chạy sau API Gateway, nên frontend nên gọi qua gateway (`/api/...`) thay vì gọi thẳng cổng service nội bộ.

## Authentication

Các endpoint cần đăng nhập phải truyền header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Danh sách endpoint

### 1) Public/Auth cơ bản

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/users/register` | Đăng ký nhanh (mặc định customer, nếu gửi `role: "seller"` thì tạo seller) | Không |
| POST | `/users/login` | Đăng nhập chung | Không |
| GET | `/users/me` | Lấy thông tin user hiện tại | Có |

### 2) Customer

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/users/user/register` | Đăng ký customer | Không |
| POST | `/users/user/login` | Đăng nhập customer | Không |
| POST | `/users/user/change-password` | Đổi mật khẩu customer | Có (role customer) |

### 3) Seller

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/users/seller/register` | Đăng ký seller | Không |
| POST | `/users/seller/login` | Đăng nhập seller | Không |
| POST | `/users/seller/change-password` | Đổi mật khẩu seller | Có (role seller) |

### 4) Admin

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/users/admin/login` | Đăng nhập admin | Không |
| GET | `/users/admin/users` | Danh sách user (có filter + phân trang) | Có (role admin) |
| GET | `/users/admin/users/:id` | Chi tiết user theo id | Có (role admin) |
| POST | `/users/admin/users` | Tạo user mới | Có (role admin) |
| PUT | `/users/admin/users/:id` | Cập nhật user | Có (role admin) |
| DELETE | `/users/admin/users/:id` | Xóa user | Có (role admin) |

## Request body mẫu

### Đăng ký

```json
{
  "email": "user@example.com",
  "password": "123456",
  "phone": "0900000000",
  "full_name": "Nguyen Van A"
}
```

### Đăng nhập

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

### Đổi mật khẩu

```json
{
  "currentPassword": "123456",
  "newPassword": "654321"
}
```

### Admin tạo user

```json
{
  "email": "newuser@example.com",
  "password": "123456",
  "phone": "0900000000",
  "full_name": "New User",
  "role": "customer",
  "status": "active",
  "avatar_url": "https://example.com/avatar.png"
}
```

## Query params cho endpoint admin list users

`GET /users/admin/users`

- `page` (mặc định 1)
- `limit` (mặc định 10, tối đa 100)
- `role` (`customer` | `seller` | `admin`)
- `status`
- `keyword` (tìm theo email, full_name, phone)

Ví dụ:

`/users/admin/users?page=1&limit=10&role=customer&keyword=nguyen`

## Mã lỗi thường gặp

- `400`: Thiếu dữ liệu hoặc dữ liệu không hợp lệ.
- `401`: Thiếu token / token sai / token hết hạn.
- `403`: Không đúng quyền role.
- `404`: Không tìm thấy user.
- `409`: Email đã tồn tại.
- `500`: Lỗi server.
