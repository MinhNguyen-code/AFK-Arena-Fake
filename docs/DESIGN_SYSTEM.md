# DESIGN SYSTEM — AFK Arena: Companions UI Tokens & Component Contracts

## 1. Bảng Màu Hệ Thống (Original Fantasy RPG Tokens)
- `--parchment`: `#F3DEB1` (Nền giấy da chính trên màn hình Tướng & Hộp thoại)
- `--parchment-shadow`: `#D5B47F` (Viền trong & dải phân cách giấy da)
- `--bronze`: `#AD7F46` (Khung đồng chạm khắc)
- `--dark-brown`: `#513724` (Nền thanh công cụ, huy hiệu cấp độ, nút phụ)
- `--gold`: `#D9A84E` (Viền vàng kim & ngôi sao đột phá)
- `--navy`: `#243241` (Nền rừng tinh thể trang chi tiết tướng)
- `--epic`: `#7943A8` (Khung phẩm chất Tím Epic)
- `--mythic`: `#A94456` (Khung phẩm chất Đỏ Mythic)
- `--ascended`: `#D4AB60` / `#E2E8F0` (Khung phẩm chất Bạch Kim Ascended)
- `--teal`: `#28B7B3` (Nút hành động chính Tăng Cấp / Xuất Trận)
- `--text-primary`: `#4D3424` (Chữ nâu đậm trên nền giấy da)
- `--text-light`: `#FFF2D7` (Chữ sáng trên nền tối)

## 2. Quy Chuẩn Thẻ Tướng (`HeroPortraitCard` — Ảnh `03` & `18`)
- **Tỷ lệ & Hình học**: Lưới đúng **5 cột** (`grid-cols-5 gap-2`), tỷ lệ `aspect-[1/1.06]`, 3 góc bo nhẹ `6px` và **góc dưới bên phải bo cong lớn `18px` (`rounded-br-[18px]`)**.
- **5 Bậc Viền Phẩm Chất**:
  1. `Ascended` (Bạch Kim ánh vàng + cánh bạc ôm huy hiệu Hệ Tộc góc trên trái + tối đa 5 sao vàng `★★★★★`).
  2. `Mythic` (Đỏ hồng ngọc phân đốt + viền chỉ vàng bên trong).
  3. `Legendary` (Vàng hoàng kim phân đốt).
  4. `Epic` (Tím thạch anh phân đốt).
  5. `Rare` (Xanh lam / xanh lục).
- **Lớp Thông Tin Trên Thẻ**:
  - Góc trên trái: `FactionMedallion` (`22px`).
  - Góc trên phải: Nhãn cấp độ `230级` / `Lv.230` chữ trắng viền tối + chấm đỏ thông báo `!` khi đủ điều kiện nâng cấp.
  - Cạnh dưới: Hàng ngôi sao vàng (`★`–`★★★★★`).
