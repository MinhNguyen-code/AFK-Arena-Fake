export type FactionId =
  | 'lightbearer'
  | 'mauler'
  | 'wilder'
  | 'graveborn'
  | 'celestial'
  | 'hypogean';
export type HeroRole = 'tank' | 'warrior' | 'ranger' | 'mage' | 'support';
export type RarityTier = 'rare' | 'elite' | 'epic' | 'ascended';
export type EnemyBehaviorPolicy =
  | 'vanguard_shield'
  | 'flanker_assassin'
  | 'arcane_kiter'
  | 'berserker_charger';

export type ModelArchetypeId =
  | 'paladin_wingshield'
  | 'duelist_twinblade'
  | 'archmage_sunhalo'
  | 'windranger_antlerbow'
  | 'phoenix_seraph'
  | 'lion_berserker'
  | 'necro_scythequeen'
  | 'valkyrie_sixwings'
  | 'undead_dreadking'
  | 'fae_butterfly'
  | 'pyro_dragonlord'
  | 'shadow_onikata'
  | 'treant_colossus'
  | 'void_archfiend'
  | 'frost_empress'
  | 'thunder_forgelord';

export type SkillVfxStyle =
  | 'solar_sanctuary'
  | 'tempest_slash'
  | 'heavens_judgment'
  | 'starlight_volley'
  | 'phoenix_supernova'
  | 'inferno_whirlwind'
  | 'soul_vortex'
  | 'celestial_dive'
  | 'dread_guillotine'
  | 'dream_butterflies'
  | 'dragon_firestorm'
  | 'bloodmoon_blink'
  | 'ancient_roots'
  | 'abyssal_singularity'
  | 'blizzard_lance'
  | 'thunder_forge';

export interface HeroTemplate {
  id: string;
  name: string;
  title: string;
  weaponName: string;
  modelArchetype: ModelArchetypeId;
  faction: FactionId;
  role: HeroRole;
  baseRarity: RarityTier;
  preferredRow: 'front' | 'back';
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  atkSpeed: number;
  moveSpeed: number;
  attackRange: number;
  ultimateName: string;
  ultimateDesc: string;
  ultimateMultiplier: number;
  ultimateType: 'aoe_damage' | 'single_nuke' | 'team_heal_shield' | 'execution_dash';
  activeSkillName: string;
  activeSkillDesc: string;
  activeSkillCooldown: number;
  passiveSkillName: string;
  passiveSkillDesc: string;
  vfxStyle: SkillVfxStyle;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface OwnedHero {
  templateId: string;
  level: number;
  stars: number; // 1 to 5
  shards: number;
  gearTier: number; // 1 to 10
  isDeployed: boolean;
  slotIndex: number; // 0, 1 = Frontline; 2, 3, 4 = Backline; -1 = Undeployed
}

export interface ArenaOpponent {
  id: string;
  name: string;
  guild: string;
  rankPoints: number;
  tierName: string;
  combatPower: number;
  level: number;
  lineup: {
    templateId: string;
    level: number;
    stars: number;
    slotIndex: number;
    policy: EnemyBehaviorPolicy;
  }[];
}

export interface PlayerState {
  gold: number;
  gems: number;
  heroExp: number;
  arcaneDust: number;
  summonScrolls: number;
  stageIndex: number; // 1-based campaign stage
  highestReachedStage: number;
  afkAccumulatedSeconds: number;
  autoUpgradeEnabled: boolean;
  autoUltimateEnabled: boolean;
  battleSpeed: 1 | 2;
  pityCounter: number; // 0 to 20 for guaranteed Ascended/Mythic
  totalSummons: number;
  arenaPoints: number;
  arenaTickets: number;
  arenaWins: number;
  heroes: Record<string, OwnedHero>;
}

export const FACTION_INFO: Record<FactionId, { name: string; color: string; bonusDesc: string }> = {
  lightbearer: {
    name: 'Ánh Sáng',
    color: '#38bdf8',
    bonusDesc: 'Khắc chế Rừng Rậm (+25% Sát thương)',
  },
  mauler: {
    name: 'Cuồng Huyết',
    color: '#f97316',
    bonusDesc: 'Khắc chế Vong Linh (+25% Sát thương)',
  },
  wilder: {
    name: 'Rừng Rậm',
    color: '#22c55e',
    bonusDesc: 'Khắc chế Cuồng Huyết (+25% Sát thương)',
  },
  graveborn: {
    name: 'Vong Linh',
    color: '#a855f7',
    bonusDesc: 'Khắc chế Ánh Sáng (+25% Sát thương)',
  },
  celestial: {
    name: 'Thần Thoại',
    color: '#eab308',
    bonusDesc: 'Cộng hưởng vạn giới (+15% Toàn chỉ số)',
  },
  hypogean: {
    name: 'Vực Thẳm',
    color: '#f43f5e',
    bonusDesc: 'Cường hóa bạo kích & xuyên giáp (+20% Công)',
  },
};

export const ROLE_INFO: Record<HeroRole, { label: string; effectClue: string }> = {
  tank: { label: 'Đỡ Đòn', effectClue: 'Khiên Chắn Tiền Tuyến · Giảm Sát Thương' },
  warrior: { label: 'Đấu Sĩ', effectClue: 'Đột Kích Cận Chiến · Hút Máu' },
  ranger: { label: 'Xạ Thủ', effectClue: 'Bắn Tỉa Tốc Độ Cao · Chí Mạng' },
  mage: { label: 'Pháp Sư', effectClue: 'Bão Phép Diện Rộng · Thiêu Đốt' },
  support: { label: 'Hỗ Trợ', effectClue: 'Hồi Phục Toàn Đội · Tăng Năng Lượng' },
};

export const HERO_CATALOG: HeroTemplate[] = [
  {
    id: 'lucius_paladin',
    name: 'Aldric Quang Khiên',
    title: 'Thánh Kỵ Sĩ Bình Minh',
    weaponName: 'Khiên Sư Tử & Kiếm Mặt Trời',
    modelArchetype: 'paladin_wingshield',
    faction: 'lightbearer',
    role: 'tank',
    baseRarity: 'ascended',
    preferredRow: 'front',
    baseHp: 2450,
    baseAtk: 175,
    baseDef: 92,
    atkSpeed: 0.95,
    moveSpeed: 2.3,
    attackRange: 2.1,
    ultimateName: 'Khiên Thánh Bất Diệt',
    ultimateDesc: 'Triệu hồi đại kết giới hoàng kim, tạo lá chắn 35% máu và hồi phục cho toàn đội.',
    ultimateMultiplier: 2.4,
    ultimateType: 'team_heal_shield',
    activeSkillName: 'Thập Tự Quang Trảm',
    activeSkillDesc: 'Phóng luồng kiếm khí ánh sáng làm choáng kẻ địch trước mặt và hồi máu bản thân.',
    activeSkillCooldown: 5.5,
    passiveSkillName: 'Thánh Giáp Hộ Mệnh',
    passiveSkillDesc: 'Giảm 22% sát thương nhận vào và phản lại hào quang thánh khi bị đánh.',
    vfxStyle: 'solar_sanctuary',
    primaryColor: '#d4af37',
    secondaryColor: '#1e3a8a',
    accentColor: '#38bdf8',
  },
  {
    id: 'thane_duelist',
    name: 'Vaelen Phong Kiếm',
    title: 'Kiếm Thánh Phong Lôi',
    weaponName: 'Song Kiếm Bão Tố',
    modelArchetype: 'duelist_twinblade',
    faction: 'lightbearer',
    role: 'warrior',
    baseRarity: 'epic',
    preferredRow: 'front',
    baseHp: 1850,
    baseAtk: 245,
    baseDef: 68,
    atkSpeed: 1.35,
    moveSpeed: 3.1,
    attackRange: 2.0,
    ultimateName: 'Thập Tự Trảm Ảnh',
    ultimateDesc: 'Hóa thành tia chớp lướt chém liên hoàn 5 nhát cực mạnh vào kẻ địch yếu máu nhất.',
    ultimateMultiplier: 3.3,
    ultimateType: 'execution_dash',
    activeSkillName: 'Phong Lôi Kiếm Khí',
    activeSkillDesc: 'Chém ra lưỡi kiếm gió xoáy xuyên thấu gây sát thương chí mạng.',
    activeSkillCooldown: 4.8,
    passiveSkillName: 'Tâm Nhãn Kiếm Thánh',
    passiveSkillDesc: 'Tăng +28% Tỷ lệ Bạo kích và hồi 15 Năng lượng mỗi khi né đòn.',
    vfxStyle: 'tempest_slash',
    primaryColor: '#cbd5e1',
    secondaryColor: '#0284c7',
    accentColor: '#bae6fd',
  },
  {
    id: 'belinda_archmage',
    name: 'Seraphina Quang Tinh',
    title: 'Nữ Tư Tế Quang Minh',
    weaponName: 'Quyền Trượng Thái Dương',
    modelArchetype: 'archmage_sunhalo',
    faction: 'lightbearer',
    role: 'mage',
    baseRarity: 'ascended',
    preferredRow: 'back',
    baseHp: 1520,
    baseAtk: 295,
    baseDef: 52,
    atkSpeed: 1.05,
    moveSpeed: 2.1,
    attackRange: 7.2,
    ultimateName: 'Thiên Phạt Phán Quyết',
    ultimateDesc: 'Triệu hồi mưa cột sáng thần thánh từ bầu trời thiêu đốt toàn bộ đội hình địch.',
    ultimateMultiplier: 2.9,
    ultimateType: 'aoe_damage',
    activeSkillName: 'Ấn Quang Tinh Tú',
    activeSkillDesc: 'Giáng cột sáng thái dương xuống mục tiêu gây nổ lan xung quanh.',
    activeSkillCooldown: 5.2,
    passiveSkillName: 'Chúc Phúc Ánh Sáng',
    passiveSkillDesc: 'Tăng +20% Công phép và +18% Tốc độ hồi Năng lượng cho hàng sau.',
    vfxStyle: 'heavens_judgment',
    primaryColor: '#f8fafc',
    secondaryColor: '#f59e0b',
    accentColor: '#fde047',
  },
  {
    id: 'lyca_windranger',
    name: 'Sylphie Lộc Tiễn',
    title: 'Cung Thủ Tinh Linh',
    weaponName: 'Thần Cung Nguyệt Lộc',
    modelArchetype: 'windranger_antlerbow',
    faction: 'wilder',
    role: 'ranger',
    baseRarity: 'epic',
    preferredRow: 'back',
    baseHp: 1480,
    baseAtk: 280,
    baseDef: 48,
    atkSpeed: 1.55,
    moveSpeed: 2.8,
    attackRange: 7.8,
    ultimateName: 'Mưa Tên Ngân Hà',
    ultimateDesc: 'Bắn hàng vạn mũi tên tinh tú xuyên phá hàng phòng ngự địch và phá 30% giáp.',
    ultimateMultiplier: 2.85,
    ultimateType: 'aoe_damage',
    activeSkillName: 'Tiễn Quang Xuyên Tâm',
    activeSkillDesc: 'Bắn mũi tên ngọc lục bảo tốc độ cao đẩy lùi và giảm giáp mục tiêu.',
    activeSkillCooldown: 4.5,
    passiveSkillName: 'Hơi Thở Rừng Xanh',
    passiveSkillDesc: 'Tăng +25% Tốc độ đánh cho bản thân và đồng minh cùng hàng.',
    vfxStyle: 'starlight_volley',
    primaryColor: '#10b981',
    secondaryColor: '#064e3b',
    accentColor: '#6ee7b7',
  },
  {
    id: 'rowan_alchemist',
    name: 'Aurelia Hỏa Phượng',
    title: 'Thánh Nữ Phượng Hoàng',
    weaponName: 'Trượng Lông Vũ Niết Bàn',
    modelArchetype: 'phoenix_seraph',
    faction: 'celestial',
    role: 'support',
    baseRarity: 'ascended',
    preferredRow: 'back',
    baseHp: 1760,
    baseAtk: 230,
    baseDef: 64,
    atkSpeed: 1.15,
    moveSpeed: 2.5,
    attackRange: 6.8,
    ultimateName: 'Khúc Ca Tái Sinh',
    ultimateDesc: 'Bùng nổ hào quang Phượng Hoàng hồi máu toàn đội, nạp +35 Năng lượng và đốt cháy địch.',
    ultimateMultiplier: 2.5,
    ultimateType: 'team_heal_shield',
    activeSkillName: 'Lông Vũ Niết Bàn',
    activeSkillDesc: 'Phóng 3 lông vũ lửa thiêng vừa chữa trị đồng minh vừa thiêu đốt kẻ thù.',
    activeSkillCooldown: 5.0,
    passiveSkillName: 'Thánh Hỏa Bất Tử',
    passiveSkillDesc: 'Tỏa vòng lửa ấm áp hồi 4% Máu mỗi giây cho đồng minh thấp máu nhất.',
    vfxStyle: 'phoenix_supernova',
    primaryColor: '#f59e0b',
    secondaryColor: '#991b1b',
    accentColor: '#fef08a',
  },
  {
    id: 'brutus_berserker',
    name: 'Kraghor Sư Vương',
    title: 'Chiến Thần Cuồng Huyết',
    weaponName: 'Đại Phủ Răng Nanh',
    modelArchetype: 'lion_berserker',
    faction: 'mauler',
    role: 'warrior',
    baseRarity: 'ascended',
    preferredRow: 'front',
    baseHp: 2280,
    baseAtk: 265,
    baseDef: 76,
    atkSpeed: 1.1,
    moveSpeed: 2.7,
    attackRange: 2.2,
    ultimateName: 'Cơn Lốc Cuồng Nộ',
    ultimateDesc: 'Xoay đại phủ tạo vòi rồng lửa càn quét tiền tuyến địch và hút 35% máu.',
    ultimateMultiplier: 3.0,
    ultimateType: 'aoe_damage',
    activeSkillName: 'Tiếng Gầm Sư Vương',
    activeSkillDesc: 'Chấn động mặt đất gây sát thương diện rộng và giảm 25% công kẻ địch.',
    activeSkillCooldown: 5.4,
    passiveSkillName: 'Bất Khuất Cuồng Nộ',
    passiveSkillDesc: 'Máu càng thấp sát thương càng cao (tối đa +45% Công và Hút máu).',
    vfxStyle: 'inferno_whirlwind',
    primaryColor: '#dc2626',
    secondaryColor: '#78350f',
    accentColor: '#fb923c',
  },
  {
    id: 'shemira_necromancer',
    name: 'Morrigan Tử Nguyệt',
    title: 'Nữ Hoàng Linh Hồn',
    weaponName: 'Lưỡi Hái Đoạt Mệnh',
    modelArchetype: 'necro_scythequeen',
    faction: 'graveborn',
    role: 'mage',
    baseRarity: 'ascended',
    preferredRow: 'back',
    baseHp: 1690,
    baseAtk: 310,
    baseDef: 56,
    atkSpeed: 1.0,
    moveSpeed: 2.2,
    attackRange: 6.9,
    ultimateName: 'Vong Hồn Thực Nguyệt',
    ultimateDesc: 'Giải phóng cơn bão linh hồn tím thẫm rút cạn sinh lực toàn bộ đội hình địch.',
    ultimateMultiplier: 3.1,
    ultimateType: 'aoe_damage',
    activeSkillName: 'Xiềng Xích Hắc Ám',
    activeSkillDesc: 'Bắn luồng ma khí trói buộc và hút máu mục tiêu có lực chiến cao nhất.',
    activeSkillCooldown: 5.2,
    passiveSkillName: 'Hấp Thụ Linh Hồn',
    passiveSkillDesc: 'Chuyển hóa 25% sát thương phép gây ra thành máu và lá chắn.',
    vfxStyle: 'soul_vortex',
    primaryColor: '#9333ea',
    secondaryColor: '#1e1b4b',
    accentColor: '#c084fc',
  },
  {
    id: 'athalia_valkyrie',
    name: 'Celestia Lục Dực',
    title: 'Thiên Sứ Phán Quyết',
    weaponName: 'Song Thương Thiên Giới',
    modelArchetype: 'valkyrie_sixwings',
    faction: 'celestial',
    role: 'ranger',
    baseRarity: 'ascended',
    preferredRow: 'back',
    baseHp: 1650,
    baseAtk: 325,
    baseDef: 60,
    atkSpeed: 1.45,
    moveSpeed: 3.3,
    attackRange: 6.5,
    ultimateName: 'Thiên Kiếm Giáng Trần',
    ultimateDesc: 'Bay vút lên tầng mây rồi lao xuống tạo vụ nổ ánh sáng chuẩn cực lớn lên chủ lực địch.',
    ultimateMultiplier: 3.5,
    ultimateType: 'single_nuke',
    activeSkillName: 'Lục Dực Quang Thương',
    activeSkillDesc: 'Phóng liên tiếp 2 mũi thương ánh sáng xuyên giáp gây chảy máu thánh.',
    activeSkillCooldown: 4.6,
    passiveSkillName: 'Uy Nghi Thiên Giới',
    passiveSkillDesc: 'Tăng +30% Xuyên giáp và miễn nhiễm khống chế trong 5 giây đầu trận.',
    vfxStyle: 'celestial_dive',
    primaryColor: '#eab308',
    secondaryColor: '#ffffff',
    accentColor: '#38bdf8',
  },
  {
    id: 'thoran_king',
    name: 'Malakor Hắc Đế',
    title: 'Đế Vương Bất Tử',
    weaponName: 'Trọng Kiếm Nguyền Rủa',
    modelArchetype: 'undead_dreadking',
    faction: 'graveborn',
    role: 'tank',
    baseRarity: 'epic',
    preferredRow: 'front',
    baseHp: 2620,
    baseAtk: 165,
    baseDef: 98,
    atkSpeed: 0.85,
    moveSpeed: 2.0,
    attackRange: 2.1,
    ultimateName: 'Lời Nguyền Phản Phệ',
    ultimateDesc: 'Tụ lực hắc ám hấp thụ sát thương rồi bổ nhát kiếm khổng lồ nghiền nát kẻ địch.',
    ultimateMultiplier: 2.8,
    ultimateType: 'single_nuke',
    activeSkillName: 'Trọng Kiếm Đoạt Hồn',
    activeSkillDesc: 'Nện trọng kiếm tạo sóng xung kích ngọc lục bảo hút máu kẻ địch.',
    activeSkillCooldown: 5.8,
    passiveSkillName: 'Vương Quyền Bất Diệt',
    passiveSkillDesc: 'Phản lại 25% sát thương cận chiến và tạo giáp xương khi máu dưới 50%.',
    vfxStyle: 'dread_guillotine',
    primaryColor: '#4c1d95',
    secondaryColor: '#0f172a',
    accentColor: '#34d399',
  },
  {
    id: 'tasi_dreamweaver',
    name: 'Elowen Hồ Điệp',
    title: 'Điệp Tiên Mộng Ảo',
    weaponName: 'Đũa Thần Tinh Mộng',
    modelArchetype: 'fae_butterfly',
    faction: 'wilder',
    role: 'support',
    baseRarity: 'elite',
    preferredRow: 'back',
    baseHp: 1590,
    baseAtk: 210,
    baseDef: 55,
    atkSpeed: 1.2,
    moveSpeed: 2.6,
    attackRange: 6.6,
    ultimateName: 'Giấc Mộng Vĩnh Hằng',
    ultimateDesc: 'Tung đàn bướm ánh sao chữa lành toàn bộ đồng minh và ru ngủ làm chậm kẻ địch.',
    ultimateMultiplier: 2.3,
    ultimateType: 'team_heal_shield',
    activeSkillName: 'Bụi Phấn Tinh Linh',
    activeSkillDesc: 'Tạo lốc xoáy hoa mộng ảo gây sát thương phép và nạp năng lượng cho đồng đội.',
    activeSkillCooldown: 4.9,
    passiveSkillName: 'Đôi Cánh Huyền Ảo',
    passiveSkillDesc: 'Tăng +20% Né tránh và tự động dịch chuyển thoát hiểm khi bị áp sát.',
    vfxStyle: 'dream_butterflies',
    primaryColor: '#14b8a6',
    secondaryColor: '#065f46',
    accentColor: '#f472b6',
  },
  {
    id: 'ignis_pyromancer',
    name: 'Ignis Viêm Long',
    title: 'Hỏa Long Pháp Vương',
    weaponName: 'Hỏa Luân Pháp Trượng',
    modelArchetype: 'pyro_dragonlord',
    faction: 'mauler',
    role: 'mage',
    baseRarity: 'ascended',
    preferredRow: 'back',
    baseHp: 1640,
    baseAtk: 318,
    baseDef: 58,
    atkSpeed: 1.1,
    moveSpeed: 2.3,
    attackRange: 7.0,
    ultimateName: 'Long Viêm Phần Thiên',
    ultimateDesc: 'Triệu hồi cột lửa Hỏa Long khổng lồ thiêu rụi toàn bộ chiến trường bằng bão dung nham.',
    ultimateMultiplier: 3.15,
    ultimateType: 'aoe_damage',
    activeSkillName: 'Cầu Lửa Dung Nham',
    activeSkillDesc: 'Phóng liên hoàn cầu lửa nổ tung dưới chân đội hình địch.',
    activeSkillCooldown: 4.8,
    passiveSkillName: 'Huyết Mạch Viêm Long',
    passiveSkillDesc: 'Đòn đánh và kỹ năng để lại hiệu ứng Thiêu Đốt rút máu liên tục.',
    vfxStyle: 'dragon_firestorm',
    primaryColor: '#ea580c',
    secondaryColor: '#451a03',
    accentColor: '#fde047',
  },
  {
    id: 'kael_shadowblade',
    name: 'Kael Huyết Ảnh',
    title: 'Sát Thủ Huyết Nguyệt',
    weaponName: 'Song Đao Quỷ Diện',
    modelArchetype: 'shadow_onikata',
    faction: 'graveborn',
    role: 'warrior',
    baseRarity: 'ascended',
    preferredRow: 'front',
    baseHp: 1790,
    baseAtk: 305,
    baseDef: 62,
    atkSpeed: 1.5,
    moveSpeed: 3.4,
    attackRange: 2.0,
    ultimateName: 'Huyết Nguyệt Nhất Trảm',
    ultimateDesc: 'Ẩn thân hóa bóng ma đỏ thẫm lướt qua kết liễu mục tiêu thấp máu nhất.',
    ultimateMultiplier: 3.55,
    ultimateType: 'execution_dash',
    activeSkillName: 'Quỷ Diện Song Đao',
    activeSkillDesc: 'Chém chữ X tốc độ siêu thanh gây sát thương bạo kích và hút máu.',
    activeSkillCooldown: 4.4,
    passiveSkillName: 'Khát Máu Đêm Trăng',
    passiveSkillDesc: 'Hạ gục hoặc gây bạo kích giúp tăng +35% Tốc chạy và hồi 25 Năng lượng.',
    vfxStyle: 'bloodmoon_blink',
    primaryColor: '#be123c',
    secondaryColor: '#111827',
    accentColor: '#fb7185',
  },
  {
    id: 'thorne_treant',
    name: 'Thorne Mộc Thần',
    title: 'Cổ Thụ Hộ Vệ Rừng Già',
    weaponName: 'Búa Đá Cổ Thụ & Khiên Rễ',
    modelArchetype: 'treant_colossus',
    faction: 'wilder',
    role: 'tank',
    baseRarity: 'epic',
    preferredRow: 'front',
    baseHp: 2780,
    baseAtk: 160,
    baseDef: 105,
    atkSpeed: 0.82,
    moveSpeed: 1.95,
    attackRange: 2.2,
    ultimateName: 'Rễ Cây Trói Buộc',
    ultimateDesc: 'Đập búa gọi rừng rễ cổ thụ trồi lên bảo vệ cả đội và hồi phục sinh lực bền bỉ.',
    ultimateMultiplier: 2.45,
    ultimateType: 'team_heal_shield',
    activeSkillName: 'Địa Chấn Đại Ngàn',
    activeSkillDesc: 'Giậm mạnh tạo vòng gai nhọn trói chân và gây sát thương lên tiền tuyến địch.',
    activeSkillCooldown: 5.6,
    passiveSkillName: 'Vỏ Cây Ngàn Năm',
    passiveSkillDesc: 'Tăng +30% Phòng thủ và tự động hồi 3% máu tối đa mỗi giây.',
    vfxStyle: 'ancient_roots',
    primaryColor: '#15803d',
    secondaryColor: '#3f2e21',
    accentColor: '#4ade80',
  },
  {
    id: 'nyx_voidweaver',
    name: 'Nyx Hư Không',
    title: 'Ác Quỷ Vực Thẳm',
    weaponName: 'Đinh Ba Hắc Ám',
    modelArchetype: 'void_archfiend',
    faction: 'hypogean',
    role: 'mage',
    baseRarity: 'ascended',
    preferredRow: 'back',
    baseHp: 1720,
    baseAtk: 335,
    baseDef: 60,
    atkSpeed: 1.15,
    moveSpeed: 2.5,
    attackRange: 7.1,
    ultimateName: 'Vực Thẳm Nuốt Chửng',
    ultimateDesc: 'Mở cổng hố đen hư không nghiền nát toàn bộ kẻ địch bằng sóng trọng lực đỏ thẫm.',
    ultimateMultiplier: 3.25,
    ultimateType: 'aoe_damage',
    activeSkillName: 'Mũi Đinh Ba Hủy Diệt',
    activeSkillDesc: 'Phóng luồng tia chớp vực thẳm xuyên qua đội hình địch gây nổ năng lượng.',
    activeSkillCooldown: 4.7,
    passiveSkillName: 'Khế Ước Hư Không',
    passiveSkillDesc: 'Tăng +25% Sát thương Tuyệt kỹ và đánh cắp 10 Năng lượng mỗi đòn đánh.',
    vfxStyle: 'abyssal_singularity',
    primaryColor: '#e11d48',
    secondaryColor: '#1f1235',
    accentColor: '#f43f5e',
  },
  {
    id: 'freya_frostvalkyrie',
    name: 'Freya Băng Vũ',
    title: 'Nữ Vũ Thần Băng Giá',
    weaponName: 'Băng Thương Vĩnh Cửu',
    modelArchetype: 'frost_empress',
    faction: 'lightbearer',
    role: 'ranger',
    baseRarity: 'epic',
    preferredRow: 'back',
    baseHp: 1580,
    baseAtk: 288,
    baseDef: 54,
    atkSpeed: 1.4,
    moveSpeed: 2.7,
    attackRange: 7.4,
    ultimateName: 'Bão Tuyết Tuyệt Đối',
    ultimateDesc: 'Triệu hồi mưa thương băng khổng lồ xuyên thấu và đóng băng tốc độ toàn bộ kẻ địch.',
    ultimateMultiplier: 2.95,
    ultimateType: 'aoe_damage',
    activeSkillName: 'Mũi Thương Hàn Băng',
    activeSkillDesc: 'Phóng lao băng tinh khiết nổ tung thành mảnh băng sắc nhọn.',
    activeSkillCooldown: 4.6,
    passiveSkillName: 'Trái Tim Băng Giá',
    passiveSkillDesc: 'Đòn đánh làm chậm kẻ địch và tăng +30% Sát thương lên mục tiêu bị đóng băng.',
    vfxStyle: 'blizzard_lance',
    primaryColor: '#0ea5e9',
    secondaryColor: '#0f172a',
    accentColor: '#7dd3fc',
  },
  {
    id: 'ornn_runesmith',
    name: 'Ornn Lôi Đỉnh',
    title: 'Thần Rèn Núi Lửa',
    weaponName: 'Song Chùy Lôi Hỏa',
    modelArchetype: 'thunder_forgelord',
    faction: 'mauler',
    role: 'tank',
    baseRarity: 'ascended',
    preferredRow: 'front',
    baseHp: 2680,
    baseAtk: 195,
    baseDef: 102,
    atkSpeed: 0.9,
    moveSpeed: 2.15,
    attackRange: 2.1,
    ultimateName: 'Búa Thần Giáng Thế',
    ultimateDesc: 'Nện song chùy gọi sét và dung nham chấn động mặt đất, cường hóa giáp và máu toàn đội.',
    ultimateMultiplier: 2.6,
    ultimateType: 'team_heal_shield',
    activeSkillName: 'Lôi Hỏa Chấn Kích',
    activeSkillDesc: 'Đập búa phóng tia sét vàng rực làm tê liệt kẻ địch tiền tuyến.',
    activeSkillCooldown: 5.3,
    passiveSkillName: 'Lò Rèn Bất Diệt',
    passiveSkillDesc: 'Cường hóa vũ khí cho toàn đội (+15% Công và +20% Giáp từ đầu trận).',
    vfxStyle: 'thunder_forge',
    primaryColor: '#b45309',
    secondaryColor: '#1e293b',
    accentColor: '#facc15',
  },
];

export function getHeroTemplate(templateId: string): HeroTemplate {
  return HERO_CATALOG.find((h) => h.id === templateId) || HERO_CATALOG[0];
}

export function calculateLevelUpCost(level: number): {
  gold: number;
  exp: number;
  dust: number;
} {
  const safeLevel = Math.max(1, level);
  const gold = Math.round(120 * Math.pow(1.14, safeLevel - 1));
  const exp = Math.round(85 * Math.pow(1.15, safeLevel - 1));
  const isBreakthrough = safeLevel % 10 === 0;
  const dust = isBreakthrough ? Math.round(25 * Math.pow(1.35, Math.floor(safeLevel / 10))) : 0;
  return { gold, exp, dust };
}

export function calculateHeroStats(template: HeroTemplate, owned: OwnedHero): {
  maxHp: number;
  atk: number;
  def: number;
  combatPower: number;
} {
  const levelMult = 1 + (owned.level - 1) * 0.135 + Math.floor(owned.level / 10) * 0.22;
  const starMult = 1 + (owned.stars - 1) * 0.24;
  const gearMult = 1 + (owned.gearTier - 1) * 0.09;
  const totalMult = levelMult * starMult * gearMult;

  const maxHp = Math.round(template.baseHp * totalMult);
  const atk = Math.round(template.baseAtk * totalMult);
  const def = Math.round(template.baseDef * totalMult);
  const combatPower = Math.round(maxHp * 0.35 + atk * 4.2 + def * 3.1 + owned.stars * 450);

  return { maxHp, atk, def, combatPower };
}

export function calculateFactionSynergyBonus(deployedHeroes: OwnedHero[]): {
  label: string;
  hpBonusPct: number;
  atkBonusPct: number;
} {
  const counts: Record<string, number> = {};
  let celestialCount = 0;
  let hypogeanCount = 0;

  for (const h of deployedHeroes) {
    const tmpl = getHeroTemplate(h.templateId);
    if (tmpl.faction === 'celestial') {
      celestialCount++;
    } else if (tmpl.faction === 'hypogean') {
      hypogeanCount++;
    } else {
      counts[tmpl.faction] = (counts[tmpl.faction] || 0) + 1;
    }
  }

  const maxSame = Math.max(0, ...Object.values(counts)) + celestialCount;
  const atkExtra = hypogeanCount * 6;
  if (maxSame >= 5) {
    return {
      label: 'Ngũ Hành Đồng Tâm (+25% Máu, +25% Công)',
      hpBonusPct: 25,
      atkBonusPct: 25 + atkExtra,
    };
  }
  if (maxSame === 4) {
    return {
      label: 'Tứ Trụ Liên Minh (+20% Máu, +18% Công)',
      hpBonusPct: 20,
      atkBonusPct: 18 + atkExtra,
    };
  }
  if (maxSame === 3) {
    return {
      label: 'Tam Tinh Cộng Hưởng (+15% Máu, +12% Công)',
      hpBonusPct: 15,
      atkBonusPct: 12 + atkExtra,
    };
  }
  if (deployedHeroes.length >= 3) {
    return {
      label: 'Hiệp Lực Chiến Tuyến (+8% Máu, +8% Công)',
      hpBonusPct: 8,
      atkBonusPct: 8 + atkExtra,
    };
  }
  return { label: 'Chưa kích hoạt cộng hưởng', hpBonusPct: 0, atkBonusPct: atkExtra };
}

export function calculateSquadCombatPower(heroes: Record<string, OwnedHero>): number {
  const deployed = Object.values(heroes).filter((h) => h.isDeployed);
  const synergy = calculateFactionSynergyBonus(deployed);
  const synergyMult = 1 + (synergy.hpBonusPct + synergy.atkBonusPct) / 200;

  let sum = 0;
  for (const h of deployed) {
    const tmpl = getHeroTemplate(h.templateId);
    sum += calculateHeroStats(tmpl, h).combatPower;
  }
  return Math.round(sum * synergyMult);
}

export function performAutoUpgradePass(state: PlayerState): {
  nextState: PlayerState;
  upgradesCount: number;
  ascensionsCount: number;
} {
  let gold = state.gold;
  let heroExp = state.heroExp;
  let arcaneDust = state.arcaneDust;
  const heroes: Record<string, OwnedHero> = {};
  for (const [k, v] of Object.entries(state.heroes)) {
    heroes[k] = { ...v };
  }

  let upgradesCount = 0;
  let ascensionsCount = 0;

  for (const hero of Object.values(heroes)) {
    while (hero.stars < 5) {
      const neededShards = hero.stars * 2;
      if (hero.shards >= neededShards) {
        hero.shards -= neededShards;
        hero.stars += 1;
        ascensionsCount += 1;
      } else {
        break;
      }
    }
  }

  let safety = 0;
  while (safety < 100) {
    safety++;
    const deployedList = Object.values(heroes)
      .filter((h) => h.isDeployed)
      .sort((a, b) => a.level - b.level);

    if (deployedList.length === 0) break;
    const target = deployedList[0];
    const cost = calculateLevelUpCost(target.level);

    if (gold >= cost.gold && heroExp >= cost.exp && arcaneDust >= cost.dust) {
      gold -= cost.gold;
      heroExp -= cost.exp;
      arcaneDust -= cost.dust;
      target.level += 1;
      upgradesCount += 1;
    } else {
      break;
    }
  }

  // Sync undeployed heroes to Resonating Crystal minimum deployed level
  const deployedLevels = Object.values(heroes)
    .filter((h) => h.isDeployed)
    .map((h) => h.level);
  if (deployedLevels.length > 0) {
    const crystalLevel = Math.min(...deployedLevels);
    for (const h of Object.values(heroes)) {
      if (!h.isDeployed && h.level < crystalLevel) {
        h.level = crystalLevel;
      }
    }
  }

  return {
    nextState: {
      ...state,
      gold,
      heroExp,
      arcaneDust,
      heroes,
    },
    upgradesCount,
    ascensionsCount,
  };
}

export function calculateAfkRewards(stageIndex: number, accumulatedSeconds: number): {
  gold: number;
  heroExp: number;
  arcaneDust: number;
  goldPerMin: number;
  expPerMin: number;
  dustPerHour: number;
} {
  const safeStage = Math.max(1, stageIndex);
  const clampedSeconds = Math.max(0, Math.min(accumulatedSeconds, 43200));
  const goldPerMin = Math.round(180 + safeStage * 65);
  const expPerMin = Math.round(140 + safeStage * 52);
  const dustPerHour = Math.round(35 + safeStage * 14);

  const minutes = clampedSeconds / 60;
  const gold = Math.round(minutes * goldPerMin);
  const heroExp = Math.round(minutes * expPerMin);
  const arcaneDust = Math.max(1, Math.round((clampedSeconds / 3600) * dustPerHour));

  return {
    gold,
    heroExp,
    arcaneDust,
    goldPerMin,
    expPerMin,
    dustPerHour,
  };
}

export interface SummonResultItem {
  template: HeroTemplate;
  isNew: boolean;
  shardsGranted: number;
  isPityTriggered: boolean;
}

export function executeGachaSummon(
  state: PlayerState,
  count: 1 | 10,
  rng: () => number = Math.random
): {
  nextState: PlayerState;
  results: SummonResultItem[];
  error?: string;
} {
  const gemCost = count === 10 ? 2700 : 300;
  let summonScrolls = state.summonScrolls;
  let gems = state.gems;

  if (summonScrolls >= count) {
    summonScrolls -= count;
  } else if (gems >= gemCost) {
    gems -= gemCost;
  } else {
    return {
      nextState: state,
      results: [],
      error: 'Không đủ Kim Cương hoặc Cuộn Triệu Hồi!',
    };
  }

  const heroes: Record<string, OwnedHero> = {};
  for (const [k, v] of Object.entries(state.heroes)) {
    heroes[k] = { ...v };
  }

  let pityCounter = state.pityCounter;
  const results: SummonResultItem[] = [];

  const ascendedPool = HERO_CATALOG.filter((h) => h.baseRarity === 'ascended');
  const standardPool = HERO_CATALOG.filter((h) => h.baseRarity !== 'ascended');

  for (let i = 0; i < count; i++) {
    pityCounter += 1;
    const isPity =
      pityCounter >= 20 ||
      (count === 10 && i === 9 && !results.some((r) => r.template.baseRarity === 'ascended'));
    const roll = rng();

    let chosen: HeroTemplate;
    if (isPity || roll < 0.22) {
      chosen = ascendedPool[Math.floor(rng() * ascendedPool.length)];
      if (pityCounter >= 20) pityCounter = 0;
    } else {
      chosen = standardPool[Math.floor(rng() * standardPool.length)];
    }

    const existing = heroes[chosen.id];
    if (existing) {
      const shardsGranted = chosen.baseRarity === 'ascended' ? 3 : 2;
      existing.shards += shardsGranted;
      results.push({
        template: chosen,
        isNew: false,
        shardsGranted,
        isPityTriggered: isPity,
      });
    } else {
      const deployedCount = Object.values(heroes).filter((h) => h.isDeployed).length;
      const shouldDeploy = deployedCount < 5;
      const usedSlots = new Set(
        Object.values(heroes)
          .filter((h) => h.isDeployed)
          .map((h) => h.slotIndex)
      );
      let freeSlot = -1;
      if (shouldDeploy) {
        for (let s = 0; s < 5; s++) {
          if (!usedSlots.has(s)) {
            freeSlot = s;
            break;
          }
        }
      }
      const minDeployedLevel = Math.max(
        1,
        Math.min(...Object.values(heroes).map((h) => h.level))
      );

      heroes[chosen.id] = {
        templateId: chosen.id,
        level: minDeployedLevel,
        stars: chosen.baseRarity === 'ascended' ? 2 : 1,
        shards: 0,
        gearTier: 1,
        isDeployed: freeSlot !== -1,
        slotIndex: freeSlot,
      };
      results.push({
        template: chosen,
        isNew: true,
        shardsGranted: 0,
        isPityTriggered: isPity,
      });
    }
  }

  return {
    nextState: {
      ...state,
      gems,
      summonScrolls,
      pityCounter,
      totalSummons: state.totalSummons + count,
      heroes,
    },
    results,
  };
}

export function getArenaRankTier(points: number): {
  tierName: string;
  tierColor: string;
  dailyGems: number;
} {
  if (points >= 2000) return { tierName: 'Đại Cao Thủ Tinh Anh', tierColor: '#facc15', dailyGems: 500 };
  if (points >= 1650) return { tierName: 'Kim Cương Vĩnh Cửu', tierColor: '#38bdf8', dailyGems: 350 };
  if (points >= 1350) return { tierName: 'Bạch Kim Hoàng Gia', tierColor: '#c084fc', dailyGems: 240 };
  if (points >= 1100) return { tierName: 'Vàng Vinh Quang', tierColor: '#fb923c', dailyGems: 160 };
  return { tierName: 'Bạc Khởi Nguyên', tierColor: '#94a3b8', dailyGems: 100 };
}

export function calculateEloDelta(
  playerPoints: number,
  opponentPoints: number,
  didWin: boolean
): number {
  const expected = 1 / (1 + Math.pow(10, (opponentPoints - playerPoints) / 400));
  const k = 36;
  const raw = Math.round(k * ((didWin ? 1 : 0) - expected));
  if (didWin) return Math.max(12, raw);
  return Math.min(-6, raw);
}

export function generateArenaOpponents(playerPoints: number, playerPower: number): ArenaOpponent[] {
  const presets = [
    { name: 'Sylas Vong Ảnh', guild: 'Hắc Nguyệt Hội', offsetPts: -90, powerRatio: 0.78 },
    { name: 'Helena Thánh Quang', guild: 'Thập Tự Chinh', offsetPts: -25, powerRatio: 0.92 },
    { name: 'Kaelen Long Huyết', guild: 'Bá Vương Điện', offsetPts: +35, powerRatio: 1.04 },
    { name: 'Lyra Tinh Tú', guild: 'Thiên Giới Minh', offsetPts: +110, powerRatio: 1.18 },
    { name: 'Valerius Tối Thượng', guild: 'Thần Điện Esperia', offsetPts: +230, powerRatio: 1.38 },
  ];

  const policies: EnemyBehaviorPolicy[] = [
    'vanguard_shield',
    'berserker_charger',
    'flanker_assassin',
    'arcane_kiter',
    'arcane_kiter',
  ];

  return presets.map((p, idx) => {
    const rankPoints = Math.max(900, playerPoints + p.offsetPts);
    const tierName = getArenaRankTier(rankPoints).tierName;
    const targetPower = Math.max(1200, Math.round(playerPower * p.powerRatio));
    const avgLevel = Math.max(1, Math.round(Math.pow(targetPower / 1800, 0.72) * 5));
    const stars = Math.min(5, Math.max(1, Math.floor(avgLevel / 8) + 1));

    const lineup = [0, 1, 2, 3, 4].map((slot) => {
      const template = HERO_CATALOG[(idx * 3 + slot * 2) % HERO_CATALOG.length];
      return {
        templateId: template.id,
        level: avgLevel + (slot === 0 ? 1 : 0),
        stars,
        slotIndex: slot,
        policy: policies[slot],
      };
    });

    return {
      id: `arena_opp_${idx}_${rankPoints}`,
      name: p.name,
      guild: p.guild,
      rankPoints,
      tierName,
      combatPower: targetPower,
      level: avgLevel,
      lineup,
    };
  });
}

export function generateCampaignStageEnemies(stageIndex: number): {
  stageName: string;
  isBossStage: boolean;
  recommendedPower: number;
  enemies: {
    templateId: string;
    level: number;
    stars: number;
    slotIndex: number;
    policy: EnemyBehaviorPolicy;
    isBoss: boolean;
  }[];
} {
  const safeStage = Math.max(1, stageIndex);
  const isBossStage = safeStage % 5 === 0;
  const baseLevel = Math.max(1, Math.round(safeStage * 2.2));
  const stars = Math.min(5, 1 + Math.floor(safeStage / 4));

  const chapterNum = Math.floor((safeStage - 1) / 5) + 1;
  const subStage = ((safeStage - 1) % 5) + 1;
  const chapterNames = [
    'Thánh Địa Esperia',
    'Rừng Tinh Linh Cổ Đại',
    'Pháo Đài Cuồng Huyết',
    'Thung Lũng Vong Linh',
    'Đỉnh Thiên Giới Vĩnh Hằng',
  ];
  const chapterTitle = chapterNames[(chapterNum - 1) % chapterNames.length];
  const stageName = `Chương ${chapterNum}-${subStage}: ${chapterTitle}`;

  const policies: EnemyBehaviorPolicy[] = [
    'vanguard_shield',
    'berserker_charger',
    'flanker_assassin',
    'arcane_kiter',
    'arcane_kiter',
  ];

  const enemies = [0, 1, 2, 3, 4].map((slot) => {
    const tmpl = HERO_CATALOG[(safeStage * 2 + slot * 3 + 5) % HERO_CATALOG.length];
    const isBoss = isBossStage && slot === 0;
    return {
      templateId: tmpl.id,
      level: isBoss ? baseLevel + 3 : baseLevel,
      stars: isBoss ? Math.min(5, stars + 1) : stars,
      slotIndex: slot,
      policy: policies[slot],
      isBoss,
    };
  });

  const recommendedPower = Math.round(2800 * Math.pow(1.22, safeStage - 1));
  return {
    stageName,
    isBossStage,
    recommendedPower,
    enemies,
  };
}

export function createInitialPlayerState(): PlayerState {
  const starterDeployedIds = [
    'lucius_paladin',
    'kael_shadowblade',
    'belinda_archmage',
    'lyca_windranger',
    'rowan_alchemist',
  ];
  const extraReserveIds = [
    'brutus_berserker',
    'shemira_necromancer',
    'ignis_pyromancer',
    'thorne_treant',
    'ornn_runesmith',
  ];

  const heroes: Record<string, OwnedHero> = {};
  starterDeployedIds.forEach((id, idx) => {
    const tmpl = getHeroTemplate(id);
    heroes[id] = {
      templateId: id,
      level: 5,
      stars: tmpl.baseRarity === 'ascended' ? 2 : 1,
      shards: 2,
      gearTier: 2,
      isDeployed: true,
      slotIndex: idx,
    };
  });

  extraReserveIds.forEach((id) => {
    const tmpl = getHeroTemplate(id);
    heroes[id] = {
      templateId: id,
      level: 5,
      stars: tmpl.baseRarity === 'ascended' ? 2 : 1,
      shards: 2,
      gearTier: 1,
      isDeployed: false,
      slotIndex: -1,
    };
  });

  return {
    gold: 18500,
    gems: 5400,
    heroExp: 14200,
    arcaneDust: 320,
    summonScrolls: 12,
    stageIndex: 1,
    highestReachedStage: 1,
    afkAccumulatedSeconds: 5400,
    autoUpgradeEnabled: true,
    autoUltimateEnabled: true,
    battleSpeed: 1,
    pityCounter: 14,
    totalSummons: 14,
    arenaPoints: 1250,
    arenaTickets: 10,
    arenaWins: 4,
    heroes,
  };
}
