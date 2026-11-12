# TÀI LIỆU THIẾT KẾ TRÒ CHƠI (GAME DESIGN DOCUMENT — GDD)

Tên dự án: **Eternal Realms (Cõi Vĩnh Hằng)**  
Thể loại: **2D/2.5D Tactical Idle RPG / Auto-Battler**  
Nền tảng: **Trình duyệt Web (Desktop & Mobile Responsive)**

---

## 1. Bối Cảnh Thế Giới & Cốt Truyện Nguyên Bản

Sau sự kiện **Đại Phân Li Tinh Tú**, Lục Địa Aethelgard bị chia cắt bởi các Khe Nứt Hư Không. Người chơi vào vai **Thủ Lĩnh Liên Minh Tinh Tú**, chiêu mộ các Anh Hùng từ **6 Hệ Phái** để trấn giữ Thung Lũng Bình Minh, vượt qua Pháo Đài Sắt Nung và phong ấn Khe Nứt Hư Không.

### 6 Hệ Phái Nguyên Bản (Factions)
1. **Thánh Điện Thái Dương (`solar_order`)**: Các hiệp sĩ và pháp sư ánh sáng bảo hộ chính nghĩa.
2. **Thiết Tộc Sơn Cước (`ironclad_clan`)**: Chiến binh rèn lửa sở hữu sức công phá vật lý và thể lực vượt trội.
3. **Rừng Cổ Nguyên Sinh (`sylvan_glade`)**: Cung thủ và hiền giả thiên nhiên tinh thông tốc độ, trói chân và hồi phục.
4. **Giao Ước Minh Giới (`nether_pact`)**: Pháp sư bóng tối sử dụng lời nguyền thiêu đốt linh hồn và hút sinh lực.
5. **Thiên Thể Tinh Tú (`astral_choir`)**: Thực thể vũ trụ có khả năng cộng hưởng với mọi hệ phái trong đội hình.
6. **Vực Thẳm Hư Không (`abyssal_void`)**: Sát thủ và chiến tướng không gian với sát thương bùng nổ chí mạng.

---

## 2. Hệ Thống 5 Vai Trò Chiến Thuật & 14 Anh Hùng Nguyên Bản

Trò chơi sở hữu **14 Anh Hùng nguyên bản** phân bổ đầy đủ vào 5 vai trò bắt buộc:
- **TANK (Đỡ Đòn)**: *Valerius*, *Tharok*, *Gorath* — Đứng Tiền Tuyến (Ô 1–2), tạo khiên chắn hấp thụ sát thương và bảo vệ đồng đội.
- **DPS (Sát Thương)**: *Lyra*, *Brynjar*, *Kaelen*, *Zephyra*, *Ignis*, *Nyxara* — Gây sát thương dồn đơn mục tiêu hoặc diện rộng (AoE).
- **SUPPORT (Hỗ Trợ)**: *Seraphina*, *Aurelia* — Hồi máu toàn đội, tăng Tấn Công/Tốc Đánh và nạp Năng Lượng.
- **CC (Khống Chế)**: *Sylas*, *Malakor* — Gây Choáng (`stun`), Câm Lặng (`silence`) và Làm Chậm (`slow`).
- **HYBRID (Đa Dụng / Công Thủ)**: *Vespera* — Kết hợp khả năng chống chịu cận chiến, hồi năng lượng và sát thương chuẩn.

---

## 3. Công Thức Chiến Đấu & Tiến Trình (Formulas)

1. **Tăng Trưởng Chỉ Số Anh Hùng (`computeHeroCombatStats`):**
   - `levelGrowth = 1 + (level - 1) * 0.095`
   - `starMultiplier = 1 + (stars - 1) * 0.14`
   - `ascensionMultiplier = 1 + ascensionRank * 0.12`
   - Cộng trực tiếp phần trăm Nội Tại (`passiveSkill`) và chỉ số từ 4 ô Trang Bị (`weapon`, `armor`, `boots`, `accessory`) đã nhân hệ số cường hóa `1 + itemLevel * 0.12`.
2. **Công Thức Sát Thương & Giảm Trừ Phòng Thủ:**
   - `mitigation = 1000 / (1000 + DEF * defenseWeight * 2.2)` (với `defenseWeight = 1.0` cho Vật Lý và `0.78` cho Phép Thuật).
   - `damage = round(ATK * skillMultiplier * mitigation * critMultiplier)`.
   - Khiên chắn (`shield`) luôn hấp thụ sát thương trước khi trừ vào `HP`.
3. **Năng Lượng & Tuyệt Kỹ (Energy & Ultimate):**
   - Tối đa `100 Năng Lượng`. Đánh thường hồi `+18`, Kỹ năng chủ động hồi `+24`, nhận sát thương hồi `+8`.
   - Khi đạt `100 Năng Lượng`, Anh Hùng kích hoạt **Tuyệt Kỹ** (tự động nếu bật `Auto Kỹ Năng` hoặc bấm thủ công trên thanh điều khiển).
4. **Phần Thưởng Treo Máy Offline (`calculateOfflineRewards`):**
   - Tích lũy tối đa **12 giờ (`43.200 giây`)**, tỷ lệ thuận với số ải Chiến Dịch đã vượt qua.
5. **Hệ Thống Triệu Hồi Miễn Phí (`executeWeightedSummons`):**
   - Sử dụng **Cuộn Triệu Hồi** hoặc **Đá Tinh Tú** kiếm miễn phí trong game.
   - Tỷ lệ minh bạch: **15% Thần Thoại (Ascended)**, **30% Huyền Thoại (Legendary)**, **55% Tinh Anh (Elite)**, kèm bảo hiểm **Pity 20 lượt** chắc chắn nhận tướng Thần Thoại.
