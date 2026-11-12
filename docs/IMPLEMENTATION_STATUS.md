# IMPLEMENTATION STATUS & AUDIT CHECKLIST

| Hạng Mục Kiểm Tra (10 Tiêu Chí Audit) | Trạng Thái | Ghi Chú Triển Khai |
|---|---|---|
| 1. Tỷ lệ màn hình mobile dọc (`450 × 900` artboard) | **PASS** | Mặc định mở khung Mobile Portrait chuẩn `460px × 100vh` căn giữa trên desktop (kèm nút chuyển đổi Widescreen nếu muốn xem rộng). |
| 2. Vị trí và chiều cao thanh HUD | **PASS** | Thanh HUD trên cùng gọn gàng (`48px`), hiển thị Avatar, Cấp độ, Lực Chiến, Vàng, Kim Cương và nút mở Kho Đồ / Tổ Đội. |
| 3. Kích thước, khoảng cách và số cột thẻ tướng | **PASS** | Lưới đúng **5 cột (`grid-cols-5 gap-2`)** trên nền giấy da `#F3DEB1`, cuộn độc lập không che thanh lọc và thanh điều hướng. |
| 4. Màu sắc, viền phẩm chất, ngôi sao và icon phe | **PASS** | Đủ 5 bậc viền (`Ascended` Bạch Kim có cánh góc trái, `Mythic` Đỏ, `Legendary` Vàng, `Epic` Tím, `Rare` Lam), bo góc dưới phải `18px`, sao vàng và chấm đỏ `!`. |
| 5. Khung giấy cổ, họa tiết và hiệu ứng chiều sâu | **PASS** | Hộp thoại giấy da 2 lớp nghiêng nhẹ với hoa văn góc SVG, hoa văn mặt trời chìm đầu bảng Tướng. |
| 6. Vị trí thanh điều hướng phía dưới | **PASS** | Cố định ở đáy khung Mobile Portrait với đúng 5 mục (`Lãnh Địa`, `Dã Ngoại`, `Chiến Dịch`, `Anh Hùng`, `Công Hội`) + mũi tên xanh lá trên mục `Anh Hùng`. |
| 7. Bố cục trang chi tiết nhân vật | **PASS** | Đối chiếu 1:1 với ảnh `04_hero_detail_medusa.png`, `05_hero_detail_athena.png` và `01_hero_reveal_dracula.jpg`: 6 ô trang bị 2 bên, 4 kỹ năng tròn, thanh Lực Chiến `✊`, ô `Tiến Hóa 4/2` + nút lục giác `Tăng Cấp`. |
| 8. Animation mở trang, đóng popup và tương tác nút | **PASS** | Hiệu ứng chuyển tab, phóng nhẹ thẻ tướng khi chọn, đóng mở popup mượt mà và hỗ trợ phím `ESC`. |
| 9. Trạng thái chọn, khóa, nâng cấp và thông báo | **PASS** | Có nút Khóa tướng (`🔒`), chấm đỏ thông báo `!`, trạng thái Mượn tướng (`Borrowed`), Linh Thú (`06_beast_select.png`), Cài đặt Tổ Đội (`15_duo_invite_settings.png`) và Tooltip Vật Phẩm (`17_item_tooltip_guild_wagon_screw.jpg`). |
| 10. Khả năng hoạt động trên mobile và desktop | **PASS** | Đã kiểm thử trên cả kích thước mobile dọc (`390×844`, `430×932`) và desktop (`1440×900`). |
