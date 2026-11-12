import { CampaignStageDefinition, StageEnemyUnitSpec } from '../types/game';

const CHAPTER_METADATA: Record<
  number,
  {
    title: string;
    theme: CampaignStageDefinition['theme'];
    stageNames: string[];
    descriptions: string[];
  }
> = {
  1: {
    title: 'Chương 1: Thung Lũng Bình Minh',
    theme: 'dawn_valley',
    stageNames: [
      'Cổng Thành Aethelgard',
      'Đồi Gió Tinh Linh',
      'Tiền Đồn Ánh Sáng',
      'Hẻm Núi Rừng Già',
      'Trạm Gác Thạch Môn (Boss Nhỏ)',
      'Bờ Suối Pha Lê',
      'Phế Tích Cổ Ngữ',
      'Đường Mòn Sương Mù',
      'Đài Quan Sát Thái Dương',
      'Điện Thờ Bình Minh (Thủ Lĩnh Chương 1)',
    ],
    descriptions: [
      'Đội tuần tra đầu tiên bị tha hóa bởi năng lượng vết nứt.',
      'Cung thủ rừng già phục kích từ hàng hậu phương.',
      'Đội hình địch có đỡ đòn che chắn cho xạ thủ.',
      'Chiến binh cuồng huyết áp sát tiền tuyến cực nhanh.',
      'Thủ lĩnh Bram Ironhorn trấn giữ cổng đá với lớp giáp dày.',
      'Pháp sư lửa kết hợp cùng đỡ đòn tiền tuyến.',
      'Đội hình địch bắt đầu sử dụng kỹ năng hồi máu.',
      'Hai đỡ đòn tiền tuyến bảo vệ pháp sư hủy diệt.',
      'Đội cận vệ tinh nhuệ trước thánh điện.',
      'Trận quyết chiến với thống lĩnh Valerius bị khống chế bởi tà thuật.',
    ],
  },
  2: {
    title: 'Chương 2: Pháo Đài Thiết Huyết',
    theme: 'iron_citadel',
    stageNames: [
      'Cầu Treo Dung Nham',
      'Lò Rèn Hắc Ám',
      'Hành Lang Sắt Nung',
      'Trại Quân Thiết Huyết',
      'Đấu Trường Lửa Đỏ (Boss Nhỏ)',
      'Tháp Canh Hỏa Long',
      'Kho Vũ Khí Cổ Đại',
      'Đại Sảnh Cuồng Chiến',
      'Cổng Nội Thành Thiết Huyết',
      'Ngai Vàng Dung Nham (Thủ Lĩnh Chương 2)',
    ],
    descriptions: [
      'Chiến binh Thiết Huyết có sát thương bạo kích cao.',
      'Đội hình địch có Hỗ Trợ liên tục hồi máu cho Tiền Tuyến.',
      'Sát thủ Draven nhắm thẳng vào tướng ít máu nhất của bạn.',
      'Song Tank Tiền Tuyến kết hợp Pháp Sư Hỏa Cầu.',
      'Hỏa Long Pháp Vương Pyra thiêu đốt toàn bộ chiến trường.',
      'Đội hình địch kết hợp làm chậm và dồn sát thương.',
      'Phù thủy bóng đêm gây Câm Lặng hàng sau.',
      'Đội hình phòng thủ phản công với lượng khiên dày.',
      'Cận vệ hoàng gia Thiết Huyết với trang bị Sử Thi.',
      'Đại chiến Thủ Lĩnh Draven Bloodfang & Pyra Cinderheart.',
    ],
  },
  3: {
    title: 'Chương 3: Vết Nứt Hư Không',
    theme: 'void_rift',
    stageNames: [
      'Ranh Giới Bóng Tối',
      'Rừng Gai Minh Giới',
      'Đầm Lầy Linh Hồn',
      'Tháp Chuông Câm Lặng',
      'Tế Đàn Tử Thần (Boss Nhỏ)',
      'Hành Lang Trọng Lực',
      'Cổng Tinh Vân Vỡ Nát',
      'Vực Thẳm Không Gian',
      'Thánh Điện Thực Thể',
      'Trái Tim Hư Không (Thủ Lĩnh Chương 3)',
    ],
    descriptions: [
      'Kẻ địch Minh Giới có khả năng hút máu mạnh.',
      'Sylas trói chân làm choáng tiền tuyến liên tục.',
      'Đội hình địch vừa hồi máu vừa rút năng lượng.',
      'Vespera khóa kỹ năng bằng ấn chú Câm Lặng diện rộng.',
      'Tử Thần Morvane gặt hái những mục tiêu suy yếu.',
      'Sự kết hợp giữa Thiên Thần Sa Ngã và Pháp Sư Hư Không.',
      'Đội hình địch có tới 2 tướng Khống Chế cứng (CC).',
      'Lá chắn kép kết hợp mưa tên ngân hà.',
      'Hộ pháp tối cao của Chúa Tể Hư Không.',
      'Trận chiến cuối cùng chống lại Chúa Tể Hư Không Malakor Voidlord!',
    ],
  },
};

function buildEnemyComposition(chapter: number, stageInChapter: number): StageEnemyUnitSpec[] {
  const globalStage = (chapter - 1) * 10 + stageInChapter;
  const isBossStage = stageInChapter === 5 || stageInChapter === 10;

  const baseLevel =
    globalStage === 1
      ? 1
      : globalStage === 2
        ? 2
        : Math.round(globalStage * 2.2 + (chapter - 1) * 4);
  const stars = Math.min(5, 1 + Math.floor(globalStage / 7));
  const ascensionRank = Math.min(5, Math.floor(globalStage / 6));

  const templatesByStage: string[][] = [
    ['bram_ironhorn', 'garrick_stormblade', 'elowen_starleaf'],
    ['bram_ironhorn', 'thorgar_boneguard', 'elowen_starleaf', 'pyra_cinderheart'],
    ['valerius_dawn', 'garrick_stormblade', 'elowen_starleaf', 'lyra_sunweaver', 'pyra_cinderheart'],
    ['bram_ironhorn', 'draven_bloodfang', 'faelan_windrunner', 'elowen_starleaf', 'sylas_thornwarden'],
    ['bram_ironhorn', 'valerius_dawn', 'draven_bloodfang', 'pyra_cinderheart', 'lyra_sunweaver'],
    ['thorgar_boneguard', 'garrick_stormblade', 'pyra_cinderheart', 'lyra_sunweaver', 'elowen_starleaf'],
    ['valerius_dawn', 'bram_ironhorn', 'lyra_sunweaver', 'sylas_thornwarden', 'elowen_starleaf'],
    ['thorgar_boneguard', 'valerius_dawn', 'pyra_cinderheart', 'vespera_nightveil', 'lyra_sunweaver'],
    ['valerius_dawn', 'garrick_stormblade', 'draven_bloodfang', 'elowen_starleaf', 'seraphiel_astralwing'],
    ['valerius_dawn', 'garrick_stormblade', 'lyra_sunweaver', 'elowen_starleaf', 'pyra_cinderheart'],

    ['bram_ironhorn', 'draven_bloodfang', 'pyra_cinderheart', 'lyra_sunweaver', 'elowen_starleaf'],
    ['bram_ironhorn', 'thorgar_boneguard', 'lyra_sunweaver', 'seraphiel_astralwing', 'draven_bloodfang'],
    ['garrick_stormblade', 'draven_bloodfang', 'morvane_soulreaper', 'pyra_cinderheart', 'lyra_sunweaver'],
    ['valerius_dawn', 'bram_ironhorn', 'pyra_cinderheart', 'elowen_starleaf', 'lyra_sunweaver'],
    ['bram_ironhorn', 'draven_bloodfang', 'pyra_cinderheart', 'vespera_nightveil', 'lyra_sunweaver'],
    ['thorgar_boneguard', 'faelan_windrunner', 'pyra_cinderheart', 'sylas_thornwarden', 'seraphiel_astralwing'],
    ['valerius_dawn', 'thorgar_boneguard', 'vespera_nightveil', 'morvane_soulreaper', 'lyra_sunweaver'],
    ['bram_ironhorn', 'valerius_dawn', 'garrick_stormblade', 'seraphiel_astralwing', 'pyra_cinderheart'],
    ['bram_ironhorn', 'draven_bloodfang', 'morvane_soulreaper', 'vespera_nightveil', 'seraphiel_astralwing'],
    ['bram_ironhorn', 'draven_bloodfang', 'pyra_cinderheart', 'seraphiel_astralwing', 'malakor_voidlord'],

    ['thorgar_boneguard', 'morvane_soulreaper', 'vespera_nightveil', 'sylas_thornwarden', 'lyra_sunweaver'],
    ['valerius_dawn', 'faelan_windrunner', 'sylas_thornwarden', 'elowen_starleaf', 'seraphiel_astralwing'],
    ['thorgar_boneguard', 'bram_ironhorn', 'morvane_soulreaper', 'vespera_nightveil', 'seraphiel_astralwing'],
    ['valerius_dawn', 'garrick_stormblade', 'vespera_nightveil', 'malakor_voidlord', 'lyra_sunweaver'],
    ['thorgar_boneguard', 'morvane_soulreaper', 'vespera_nightveil', 'pyra_cinderheart', 'seraphiel_astralwing'],
    ['valerius_dawn', 'faelan_windrunner', 'malakor_voidlord', 'seraphiel_astralwing', 'elowen_starleaf'],
    ['bram_ironhorn', 'thorgar_boneguard', 'sylas_thornwarden', 'vespera_nightveil', 'malakor_voidlord'],
    ['valerius_dawn', 'garrick_stormblade', 'elowen_starleaf', 'seraphiel_astralwing', 'malakor_voidlord'],
    ['thorgar_boneguard', 'draven_bloodfang', 'morvane_soulreaper', 'vespera_nightveil', 'malakor_voidlord'],
    ['valerius_dawn', 'thorgar_boneguard', 'seraphiel_astralwing', 'vespera_nightveil', 'malakor_voidlord'],
  ];

  const lineup = templatesByStage[globalStage - 1] || templatesByStage[0];

  return lineup.map((heroId, idx) => ({
    heroId,
    slotIndex: idx,
    level: isBossStage && idx === lineup.length - 1 ? baseLevel + 2 : baseLevel,
    stars: isBossStage && idx === lineup.length - 1 ? Math.min(5, stars + 1) : stars,
    ascensionRank,
    isBoss: isBossStage && idx === lineup.length - 1,
  }));
}

const EQUIPMENT_DROP_POOL = [
  'wpn_knight_claymore',
  'arm_solar_plate',
  'bts_wind_striders',
  'acc_emerald_pendant',
  'wpn_crimson_reaver',
  'arm_sylvan_aegis',
  'bts_shadow_treads',
  'acc_nether_signet',
  'wpn_astral_sovereign',
  'arm_void_carapace',
];

export const CAMPAIGN_STAGES: CampaignStageDefinition[] = [];

for (let chapter = 1; chapter <= 3; chapter++) {
  const meta = CHAPTER_METADATA[chapter];
  for (let s = 1; s <= 10; s++) {
    const stageNumber = (chapter - 1) * 10 + s;
    const isBoss = s === 5 || s === 10;
    const scale = Math.pow(1.16, stageNumber - 1);

    CAMPAIGN_STAGES.push({
      id: `${chapter}-${s}`,
      stageNumber,
      chapter,
      stageInChapter: s,
      name: meta.stageNames[s - 1],
      chapterTitle: meta.title,
      description: meta.descriptions[s - 1],
      theme: meta.theme,
      enemies: buildEnemyComposition(chapter, s),
      firstClearReward: {
        gold: Math.round(1200 * scale * (isBoss ? 1.6 : 1)),
        heroExp: Math.round(950 * scale * (isBoss ? 1.6 : 1)),
        astralGems: isBoss ? 600 : 250,
        summonScrolls: isBoss ? 3 : s % 2 === 0 ? 1 : 0,
        equipmentTemplateId: isBoss
          ? EQUIPMENT_DROP_POOL[Math.min(EQUIPMENT_DROP_POOL.length - 1, Math.floor(stageNumber / 3))]
          : undefined,
      },
      repeatReward: {
        gold: Math.round(550 * scale),
        heroExp: Math.round(450 * scale),
        arcaneEssence: Math.round(25 * scale),
      },
    });
  }
}

export const STAGE_MAP: Record<string, CampaignStageDefinition> = Object.fromEntries(
  CAMPAIGN_STAGES.map((st) => [st.id, st])
);

export function getCampaignStage(stageId: string): CampaignStageDefinition {
  return STAGE_MAP[stageId] || CAMPAIGN_STAGES[0];
}
