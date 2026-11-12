# KIẾN TRÚC KỸ THUẬT (TECHNICAL ARCHITECTURE)

Dự án: **Eternal Realms — 2D/2.5D Idle RPG**

---

## 1. Sơ Đồ Phân Tách Kiến Trúc (Separation of Concerns)

```text
+-----------------------------------------------------------------------+
|                        GIAO DIỆN REACT 19 + TAILWIND                  |
|  HomeScreen | HeroesScreen | FormationScreen | Campaign | Summon      |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                    QUẢN LÝ TRẠNG THÁI (ZUSTAND STORE)                 |
|  src/stores/useGameStore.ts <---> IndexedDB (src/services/storage.ts) |
+-----------------+-----------------------------------+-----------------+
                  |                                   |
                  v                                   v
+-----------------------------------+   +-------------------------------+
|   HỆ THỐNG TÍNH TOÁN & DỮ LIỆU    |   |  BỘ MÔ PHỎNG CHIẾN ĐẤU 5v5    |
|  src/game/systems/statCalculator  |   |  src/game/combat/engine.ts    |
|  src/data/{heroes,stages,equip}   |   |  Fixed Timestep: dt = 0.05s   |
|                                   |   |  Seeded PRNG (Mulberry32)     |
+-----------------------------------+   +---------------+---------------+
                                                        |
                                                        | (CombatEvent[])
                                                        v
                                        +-------------------------------+
                                        |  PHASER 3 2D/2.5D RENDERER    |
                                        |  BattlePhaserScene.ts         |
                                        |  WebGL / Canvas Fallback      |
                                        +-------------------------------+
```

---

## 2. Nguyên Tắc Thiết Kế Cốt Lõi

1. **Deterministic Combat Simulation (`src/game/combat/engine.ts`):**
   - Bộ máy chiến đấu hoạt động độc lập 100% với Phaser và React.
   - Sử dụng bước thời gian cố định `FIXED_TIMESTEP_SEC = 0.05s` (20 ticks/giây) và bộ sinh số giả ngẫu nhiên có hạt giống `SeededRng` (`src/game/core/rng.ts`).
   - Cùng một đội hình, trang bị và `seed` luôn tạo ra kết quả trận đấu (`CombatResultSummary`) giống hệt nhau, cho phép kiểm thử đơn vị (Unit Test) và tính năng **Kết Quả Nhanh (Instant Skip)** chạy tức thì mà không phụ thuộc tốc độ khung hình (FPS).
2. **Phaser 3 2D/2.5D Visual Pipeline (`src/game/renderer/BattlePhaserScene.ts`):**
   - Khởi tạo với `type: Phaser.AUTO` (tự động dùng WebGL và chuyển về Canvas khi cần).
   - Tạo chiều sâu 2.5D bằng mặt sàn đấu trường hình thang phối cảnh, bóng đổ elip dưới chân, vòng hào quang hệ phái, sắp xếp lớp vẽ theo tọa độ Y (`container.setDepth(Math.round(unit.y))`), chữ sát thương bay (Floating Combat Text) và hiệu ứng rung camera khi tung Tuyệt Kỹ (tự động tắt khi người dùng bật **Giảm Hiệu Ứng / Reduced Motion**).
3. **Lưu Trữ Bền Vững IndexedDB (`src/services/storage.ts`):**
   - Lưu trữ toàn bộ `GameSaveData` vào cơ sở dữ liệu IndexedDB `eternal_realms_db` (object store `saves`), đồng thời ghi bản sao dự phòng vào `localStorage` để đảm bảo an toàn dữ liệu tuyệt đối khi tải lại trang.
