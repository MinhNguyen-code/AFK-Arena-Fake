# UI REFERENCE AUDIT — AFK Arena: Companions (剑与远征 组队服)

## 1. Mục Tiêu & Nguyên Tắc Đối Chiếu
Báo cáo này đối chiếu trực tiếp 18 ảnh chụp màn hình tham chiếu từ **AFK Arena: Companions (Tổ Đội / Duo Server)** với hệ thống component thực tế của ứng dụng. Toàn bộ ảnh tham chiếu chỉ được sử dụng làm **tư liệu phân tích bố cục, tỷ lệ, hình học khung viền, màu sắc và luồng tương tác (read-only visual reference)** — tuyệt đối không nhúng ảnh chụp làm giao diện giả.

---

## 2. Bảng Đối Chiếu Chi Tiết 18 Ảnh Tham Chiếu

| Mã Ảnh | Tên File | Màn Hình / Thành Phần | Trạng Thái | Chi Tiết Quan Sát & Áp Dụng UI |
|---|---|---|---|---|
| `01` | `01_hero_reveal_dracula.jpg` | Nhận Tướng Mới / Kỹ Năng (`新英雄`) | **VERIFIED** | Bố cục dọc 9:16, minh họa tướng lớn phía trên, mô hình đứng ở giữa kèm 4 biểu tượng kỹ năng tròn hai bên (`必杀技` góc trên trái), dải băng giấy da ghi danh hiệu + tên tướng, 4 huy hiệu tròn dưới cùng, nút quay lại `↩` và nút chia sẻ. |
| `02` | `02_roster_early.png` | Danh Sách Tướng Đầu Game (`英雄`) | **VERIFIED** | Lưới **5 cột chuẩn** trên nền giấy da `#F3DEB1`, thanh đầu trang có khiên cấp độ `110`, biểu tượng Pha Lê có mũi tên xanh, bộ đếm `53/400 [+]`, nút sắp xếp `⇅`. |
| `03` | `03_hero_icons_medusa_athena.png` | Cận Cảnh Thẻ Tướng (`HeroPortraitCard`) | **VERIFIED** | Khung viền phẩm chất Đỏ (Mythic) phân đốt đá quý, góc dưới bên phải bo tròn lớn (`rounded-br-[18px]`), huy hiệu Hệ Tộc ở góc trên trái, chữ cấp độ `80级` góc trên phải kèm chấm đỏ `!`. |
| `04` | `04_hero_detail_medusa.png` | Chi Tiết Tướng Medusa (`美杜莎`) | **VERIFIED** | Rừng tinh thể xanh tím phía sau, đỉnh màn hình có viên ngọc đỏ trong khung thoi đồng, 2 nút thoi bên trái (`故事`, `热度`), 2 nút bên phải (`发送`, `🔒`), 6 ô trang bị (3 trái, 3 phải) quanh nhân vật, mũi tên `<` `>` chuyển tướng, thanh Lực Chiến `✊ 25213`, hàng chỉ số `等级 80 · ❤️ 44,358 · ⚔️ 4019 · 🛡️ 454 · [!]`, ô `进化 4/2` phát sáng bên trái + nút lục giác `升级` ở giữa, thanh dưới có `↩` và 2 nút thoi `英雄` / `技能`. |
| `05` | `05_hero_detail_athena.png` | Chi Tiết Tướng Athena (`雅典娜`) | **VERIFIED** | Cùng cấu trúc với `04_hero_detail_medusa.png` cho tướng Hệ Sức Mạnh / Đỡ Đòn (`✊ 18986`, rìu + mũ giáp + thương khiên độc quyền). |
| `06` | `06_beast_select.png` | Chọn Linh Thú (`言灵 / Beasts`) | **VERIFIED** | Hàng 4 ô chân dung Linh Thú vuông vát góc trong khung đồng nâu đậm có họa tiết la bàn chìm. |
| `07` | `07_roster_lightbearers.png` | Lọc Tướng Ánh Sáng (`Lightbearer`) | **VERIFIED** | Lưới 5 cột lọc theo Hệ Ánh Sáng, hiển thị rõ sự khác biệt giữa viền Bạch Kim (Ascended), Đỏ (Mythic) và Tím (Epic). |
| `08` | `08_roster_maulers.png` | Lọc Tướng Dã Thú (`Mauler`) | **VERIFIED** | Thanh lọc Hệ Tộc hình viên thuốc nâu đậm ở dưới với biểu tượng Dã Thú phát sáng vòng vàng. |
| `09` | `09_roster_wilders.png` | Lọc Tướng Rừng Già (`Wilder`) | **VERIFIED** | Thẻ đầu tiên có viền Bạch Kim + 2 sao vàng `★★` ở cạnh dưới. |
| `10` | `10_roster_graveborn.png` | Lọc Tướng Vong Linh (`Graveborn`) | **VERIFIED** | Hàng cuối hiển thị thêm viền Xanh Lam (Rare+) và Xanh Lục (Rare). |
| `11` | `11_roster_celestials.png` | Lọc Tướng Thần Tộc (`Celestial`) | **VERIFIED** | Hiển thị rõ khoảng trống nền giấy da `#F3DEB1` khi số lượng tướng ít, giữ nguyên vị trí thanh lọc Hệ Tộc và 4 tab phụ bên dưới. |
| `12` | `12_roster_hypogeans.png` | Lọc Tướng Ác Ma (`Hypogean`) | **VERIFIED** | Huy hiệu Ác Ma phát sáng trên thanh lọc tròn. |
| `13` | `13_roster_dimensionals.png` | Lọc Tướng Dị Giới (`Dimensional`) | **VERIFIED** | Hàng đầu có 5 tướng Bạch Kim 5 sao (`★★★★★`) với đôi cánh bạc ôm quanh huy hiệu Dị Giới ở góc trên trái. |
| `14` | `14_duo_cooldown_2h44.png` | Cảnh Báo Chênh Lệch Chương Tổ Đội | **VERIFIED** | Hộp thoại giấy da thông báo thời gian chờ `2 giờ 44 phút` khi lập đội với người chơi chênh lệch tiến độ chương. |
| `15` | `15_duo_invite_settings.png` | Thiết Lập Lời Mời Tổ Đội (`设置`) | **VERIFIED** | Hộp thoại giấy da 2 lớp nghiêng nhẹ, 4 góc có hoa văn dây đan, tiêu đề nâu đậm `设置`, 3 công tắc gạt tròn màu đồng, 1 ô tích xanh lá, nút đóng hình lục giác nâu. |
| `16` | `16_duo_cooldown_37min.png` | Cảnh Báo Thời Gian Chờ 37 Phút | **VERIFIED** | Biến thể bộ đếm ngược `37 phút 12 giây` trên nền giấy da có chấm trang trí ở góc. |
| `17` | `17_item_tooltip_guild_wagon_screw.jpg` | Tooltip Vật Phẩm (`特制构件`) | **VERIFIED** | Popup giấy da 2 lớp có nút `X` tròn góc phải trên, vòng tròn ma thuật mờ quanh icon vật phẩm tím (`880`), nhãn loại vật phẩm, số lượng sở hữu và dải phân cách sáng màu. |
| `18` | `18_roster_late.jpg` | Toàn Cảnh Màn Hình Tướng Cuối Game | **VERIFIED** | Đối chiếu đầy đủ cả 5 tầng bố cục: Header Pha Lê -> Lưới 5 cột đủ 5 bậc viền -> Thanh lọc tròn 8 nút -> 4 Tab phụ (`编队`, `热度`, `英雄`, `图鉴`) -> Thanh điều hướng chính 5 mục (`领地`, `野外`, `战役`, `英雄`, `公会`). |
