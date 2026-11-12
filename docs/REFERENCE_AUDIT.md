# BÁO CÁO KIỂM TOÁN KHO LƯU TRỮ THAM KHẢO (REFERENCE AUDIT)

Dự án: **Eternal Realms — 2D/2.5D Idle RPG**  
Ngày kiểm toán: 2026-11-11  
Trạng thái pháp lý: **TUÂN THỦ 100% (CLEAN-ROOM ORIGINAL IMPLEMENTATION)**

---

## 1. Tổng Quan 4 Kho Lưu Trữ Được Nghiên Cứu

| STT | Kho Lưu Trữ (Repository) | URL Nguồn | Giấy Phép (License) | Đánh Giá Pháp Lý & Phạm Vi Tái Sử Dụng |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `floofpire/cdn` | `https://github.com/floofpire/cdn` | **Không có giấy phép mở (All Rights Reserved)** | Chứa các tệp hình ảnh/biểu tượng tĩnh trích xuất từ trò chơi thương mại. **Tuyệt đối không sao chép bất kỳ hình ảnh, tên nhân vật hay biểu tượng nào.** Chỉ tham khảo cách phân loại thư mục theo `faction`, `class`, `rarity`. |
| 2 | `Santazma/AFKArenaCompanionsHub` | `https://github.com/Santazma/AFKArenaCompanionsHub` | **All Rights Reserved** (Ghi chú tại `README.md` dòng 215: *"No license chosen yet — the original code here is all rights reserved by default"*) | Không sao chép mã nguồn hoặc dữ liệu JSON. Chỉ học hỏi kiến trúc tổ chức giao diện người dùng (bộ lọc tướng theo Hệ/Vai trò, bố cục thẻ thông tin kỹ năng và chỉ số). |
| 3 | `Dae314/AFKBuilder` | `https://github.com/Dae314/AFKBuilder` | **MIT License** (`Copyright (c) 2021 Dae314`) | Giấy phép MIT cho phép tham khảo mô hình dữ liệu đội hình 5 vị trí (2 Tiền Tuyến / 3 Hậu Phương) và cơ chế lưu trữ cấu hình đội hình (Presets). Bản sao thông báo bản quyền MIT được lưu giữ đầy đủ tại `references/afk-builder/LICENSE.md`. |
| 4 | `Arbust908/AFK-sprite_scraper` | `https://github.com/Arbust908/AFK-sprite_scraper` | **Không có giấy phép mở** (Script Python cào dữ liệu bên thứ ba) | **Không thực thi script cào dữ liệu (scraping)** để tuân thủ nghiêm ngặt quy định pháp lý và điều khoản dịch vụ. Chỉ tham khảo quy ước đặt tên trạng thái hoạt ảnh (`idle`, `move`, `attack`, `skill`, `hit`, `defeat`, `ultimate`). |

---

## 2. Bài Học Kiến Trúc Độc Lập Đưa Vào *Eternal Realms*

1. **Phân tách hoàn toàn Dữ liệu Tướng và Logic Hiển Thị (Data-Driven Hero Schema):**
   - Mỗi Anh Hùng được định nghĩa bằng schema TypeScript chặt chẽ (`HeroDefinition`) tại `src/data/heroes.ts`, bao gồm: `id`, `name`, `title`, `faction`, `role`, `heroClass`, `baseRarity`, `damageType`, `baseStats`, và 4 kỹ năng riêng biệt (`basicAttack`, `activeSkill`, `ultimateSkill`, `passiveSkill`).
2. **Mô hình Đội Hình 5 Ô Chiến Thuật (5-Slot Formation Architecture):**
   - Bố cục chuẩn gồm **2 Ô Tiền Tuyến (Frontline: Ô 1, Ô 2)** và **3 Ô Hậu Phương (Backline: Ô 3, Ô 4, Ô 5)**.
   - Kiểm tra tính hợp lệ (`validateFormation`): Không cho phép trùng lặp Anh Hùng trong cùng đội hình và yêu cầu tối thiểu 1 Anh Hùng xuất trận.
3. **Quy ước 7 Trạng Thái Hoạt Ảnh 2D/2.5D (`CharacterAnimState`):**
   - Mọi đơn vị chiến đấu trong `BattlePhaserScene` đều hỗ trợ đủ 7 trạng thái: `idle`, `move`, `attack`, `skill`, `hit`, `defeat`, `ultimate` kết hợp bóng đổ phối cảnh 2.5D, hào quang hệ phái và sắp xếp chiều sâu theo trục Y (`depth = Math.round(unit.y)`).
4. **Cam Kết Bản Quyền Nguyên Bản (100% Original IP):**
   - Toàn bộ 14 Anh Hùng, 6 Hệ Phái, 16 Trang Bị, 30 Ải Chiến Dịch và đồ họa 2D/2.5D bằng Vector/Phaser Graphics trong **Eternal Realms** đều được sáng tạo mới hoàn toàn.
