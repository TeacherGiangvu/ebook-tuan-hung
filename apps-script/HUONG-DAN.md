# Cài sổ điểm chung bằng Google Sheet (khoảng 5 phút)

Sau khi cài xong, Hưng, phụ huynh và giáo viên đăng nhập trang ebook bằng mã riêng. Mọi kết quả của Hưng được lưu vào Google Sheet của bạn, nên ai đăng nhập ở máy nào cũng thấy cùng một sổ điểm.

## 1. Tạo Google Sheet
1. Mở https://sheets.new (đăng nhập bằng tài khoản Google của bạn).
2. Đặt tên bảng tính, ví dụ: **Ebook Tuấn Hưng – Sổ điểm**.

## 2. Dán script
1. Trong bảng tính, chọn **Tiện ích mở rộng → Apps Script**.
2. Xoá hết đoạn code mẫu `function myFunction() {...}`.
3. Mở https://raw.githubusercontent.com/TeacherGiangvu/ebook-tuan-hung/main/apps-script/Code.gs, bấm Ctrl+A rồi Ctrl+C để chép toàn bộ, dán vào Apps Script.
4. Bấm biểu tượng **Lưu** (hình đĩa mềm).

## 3. Triển khai thành ứng dụng web
1. Bấm **Triển khai → Tùy chọn triển khai mới**.
2. Bấm biểu tượng bánh răng cạnh "Chọn loại", chọn **Ứng dụng web**.
3. Điền:
   - **Thực thi với tư cách:** Tôi
   - **Người có quyền truy cập:** Bất kỳ ai
4. Bấm **Triển khai**, rồi **Cấp quyền truy cập** và chọn tài khoản Google của bạn.
5. Google sẽ báo "Google chưa xác minh ứng dụng này", vì đây là script bạn tự tạo. Bấm **Nâng cao → Đi tới … (không an toàn) → Cho phép**. Script chỉ đọc và ghi vào chính bảng tính này.
6. Sao chép **URL ứng dụng web** (có dạng `https://script.google.com/macros/s/…/exec`) và gửi cho Claude để gắn vào trang ebook.

## 4. Đổi mã đăng nhập (bắt buộc)
Mã mặc định nằm trong mã nguồn công khai trên GitHub, nên **phải đổi** trước khi gửi link cho Hưng.

1. Mở trang ebook và đăng nhập thử một lần bằng mã `giaovien123`. Script sẽ tự tạo 3 trang tính: **Mã đăng nhập**, **Dữ liệu**, **Nhật ký**.
2. Mở trang tính **Mã đăng nhập** và sửa cột **Mã**: một mã cho Hưng, một cho phụ huynh, một cho giáo viên. Mã ngắn, dễ nhớ, không phân biệt chữ hoa và chữ thường.
3. Không sửa cột "Vai trò".

| Vai trò | Được làm gì |
|---|---|
| Hưng | Học, làm bài, chọn ngày bắt đầu. Mọi kết quả được lưu vào Sheet |
| Phụ huynh | Chỉ xem Sổ điểm |
| Giáo viên | Xem Sổ điểm, viết nhận xét từng tuần, sửa ngày bắt đầu |

## Các trang tính trong Sheet
- **Nhật ký:** từng việc Hưng làm, viết bằng tiếng Việt (học xong ngày nào, điểm bài kiểm tra, bài nói đã gửi).
- **Dữ liệu:** dữ liệu để trang ebook đọc. Không sửa tay.
- **Mã đăng nhập:** mã của từng người.

## Khi sửa script về sau
Vào **Triển khai → Quản lý việc triển khai → biểu tượng bút chì → Phiên bản: Phiên bản mới → Triển khai**. Link ứng dụng web giữ nguyên.
