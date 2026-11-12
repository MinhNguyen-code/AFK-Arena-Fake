import { FactionId, HeroRole } from '../types/game';

export interface FactionMeta {
  id: FactionId;
  name: string;
  englishName: string;
  color: string;
  bgTint: string;
  borderTint: string;
  description: string;
  synergyBonusDesc: string;
}

export const FACTIONS: Record<FactionId, FactionMeta> = {
  solar_order: {
    id: 'solar_order',
    name: 'Thái Dương Điện',
    englishName: 'Solar Order',
    color: '#F59E0B',
    bgTint: 'rgba(245, 158, 11, 0.14)',
    borderTint: 'rgba(245, 158, 11, 0.45)',
    description: 'Những hiệp sĩ và thánh chức mang hào quang mặt trời bảo hộ thành trì Aethelgard.',
    synergyBonusDesc: '+12% Phòng Thủ & Khiên Chắn khi có từ 2 tướng cùng hệ.',
  },
  ironclad_clan: {
    id: 'ironclad_clan',
    name: 'Thiết Huyết Bộ Tộc',
    englishName: 'Ironclad Clan',
    color: '#EF4444',
    bgTint: 'rgba(239, 68, 68, 0.14)',
    borderTint: 'rgba(239, 68, 68, 0.45)',
    description: 'Chiến binh vùng núi lửa rèn giáp sắt và chiến đấu với sát thương bạo kích dữ dội.',
    synergyBonusDesc: '+12% Tấn Công & Tỷ Lệ Chí Mạng khi có từ 2 tướng cùng hệ.',
  },
  sylvan_glade: {
    id: 'sylvan_glade',
    name: 'Tinh Linh Rừng Cổ',
    englishName: 'Sylvan Glade',
    color: '#10B981',
    bgTint: 'rgba(16, 185, 129, 0.14)',
    borderTint: 'rgba(16, 185, 129, 0.45)',
    description: 'Các cung thủ và hiền giả rừng già làm chủ tốc độ gió và dây leo khống chế.',
    synergyBonusDesc: '+10% Tốc Đánh & Hồi Phục khi có từ 2 tướng cùng hệ.',
  },
  nether_pact: {
    id: 'nether_pact',
    name: 'Minh Giới Thực Thể',
    englishName: 'Nether Pact',
    color: '#8B5CF6',
    bgTint: 'rgba(139, 92, 246, 0.14)',
    borderTint: 'rgba(139, 92, 246, 0.45)',
    description: 'Quân đoàn bóng đêm sử dụng ma thuật linh hồn, hút máu và nguyền rủa kẻ địch.',
    synergyBonusDesc: '+12% Sát Thương Kỹ Năng & Hút Máu khi có từ 2 tướng cùng hệ.',
  },
  astral_choir: {
    id: 'astral_choir',
    name: 'Thiên Giới Tinh Tú',
    englishName: 'Astral Choir',
    color: '#38BDF8',
    bgTint: 'rgba(56, 189, 248, 0.14)',
    borderTint: 'rgba(56, 189, 248, 0.45)',
    description: 'Sứ giả tinh vân có khả năng kết nối cộng hưởng với mọi hệ tộc đồng minh.',
    synergyBonusDesc: 'Được tính như một tướng đa hệ để kích hoạt hào quang đội hình.',
  },
  abyssal_void: {
    id: 'abyssal_void',
    name: 'Hư Không Vực Thẳm',
    englishName: 'Abyssal Void',
    color: '#EC4899',
    bgTint: 'rgba(236, 72, 153, 0.14)',
    borderTint: 'rgba(236, 72, 153, 0.45)',
    description: 'Thực thể cổ đại từ vết nứt không gian gây khống chế diện rộng và sát thương hủy diệt.',
    synergyBonusDesc: '+15% Sát Thương Tuyệt Kỹ & Năng Lượng khởi đầu.',
  },
};

export interface RoleMeta {
  id: HeroRole;
  name: string;
  shortLabel: string;
  color: string;
  description: string;
}

export const ROLES: Record<HeroRole, RoleMeta> = {
  TANK: {
    id: 'TANK',
    name: 'Đỡ Đòn (Tank)',
    shortLabel: 'TANK',
    color: '#38BDF8',
    description: 'Đứng Tiền Tuyến bảo vệ đồng đội, hấp thụ sát thương và tạo Khiên chắn.',
  },
  DPS: {
    id: 'DPS',
    name: 'Sát Thương (DPS)',
    shortLabel: 'DPS',
    color: '#F43F5E',
    description: 'Gây sát thương duy trì hoặc dồn sát thương kết liễu mục tiêu trọng yếu.',
  },
  SUPPORT: {
    id: 'SUPPORT',
    name: 'Hỗ Trợ (Support)',
    shortLabel: 'SUP',
    color: '#10B981',
    description: 'Hồi máu, cường hóa chỉ số và nạp Năng Lượng cho đồng minh.',
  },
  CC: {
    id: 'CC',
    name: 'Khống Chế (Control)',
    shortLabel: 'CC',
    color: '#A855F7',
    description: 'Làm Choáng, Câm Lặng hoặc Làm Chậm để khóa chặt đội hình địch.',
  },
  HYBRID: {
    id: 'HYBRID',
    name: 'Đa Dụng (Hybrid)',
    shortLabel: 'HYB',
    color: '#F59E0B',
    description: 'Kết hợp khả năng gây sát thương mạnh mẽ với tự tạo khiên hoặc hỗ trợ.',
  },
};
