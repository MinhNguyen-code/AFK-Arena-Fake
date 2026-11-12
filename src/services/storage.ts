import { GameSaveData } from '../types/game';

const DB_NAME = 'eternal_realms_db';
const DB_VERSION = 1;
const STORE_NAME = 'saves';
const PRIMARY_KEY = 'eternal_realms_save_v1';
const LOCAL_STORAGE_FALLBACK_KEY = 'eternal_realms_save_backup_v1';

export function createInitialSaveData(): GameSaveData {
  return {
    version: 1,
    gold: 18500,
    heroExp: 14000,
    arcaneEssence: 450,
    astralGems: 5400,
    summonScrolls: 12,
    pityCounter: 0,
    totalSummons: 0,
    currentStageId: '1-1',
    clearedStageIds: [],
    lastOfflineClaimTimestamp: Date.now() - 45 * 60 * 1000, // 45 mins accumulated ready to claim
    ownedHeroes: {
      valerius_dawnblade: {
        heroId: 'valerius_dawnblade',
        level: 5,
        ascensionRank: 2,
        stars: 2,
        shards: 2,
        equipment: {
          weapon: 'eq_init_weapon_1',
          armor: 'eq_init_armor_1',
          boots: null,
          accessory: null,
        },
      },
      lyra_sunweaver: {
        heroId: 'lyra_sunweaver',
        level: 5,
        ascensionRank: 2,
        stars: 2,
        shards: 2,
        equipment: {
          weapon: 'eq_init_weapon_2',
          armor: null,
          boots: null,
          accessory: 'eq_init_acc_1',
        },
      },
      brynjar_ironbreaker: {
        heroId: 'brynjar_ironbreaker',
        level: 4,
        ascensionRank: 2,
        stars: 2,
        shards: 1,
        equipment: {
          weapon: null,
          armor: 'eq_init_armor_2',
          boots: 'eq_init_boots_1',
          accessory: null,
        },
      },
      kaelen_thornshot: {
        heroId: 'kaelen_thornshot',
        level: 4,
        ascensionRank: 1,
        stars: 1,
        shards: 3,
        equipment: {
          weapon: 'eq_init_weapon_3',
          armor: null,
          boots: null,
          accessory: null,
        },
      },
      seraphina_lumina: {
        heroId: 'seraphina_lumina',
        level: 4,
        ascensionRank: 0,
        stars: 1,
        shards: 3,
        equipment: {
          weapon: null,
          armor: null,
          boots: null,
          accessory: null,
        },
      },
      sylas_frostroot: {
        heroId: 'sylas_frostroot',
        level: 3,
        ascensionRank: 1,
        stars: 1,
        shards: 2,
        equipment: {
          weapon: null,
          armor: null,
          boots: null,
          accessory: null,
        },
      },
    },
    formation: [
      'valerius_dawnblade',
      'brynjar_ironbreaker',
      'lyra_sunweaver',
      'kaelen_thornshot',
      'seraphina_lumina',
    ],
    presets: [
      {
        id: 'preset_default_1',
        name: 'Đội Hình Ánh Dương Công Thủ',
        slots: [
          'valerius_dawnblade',
          'brynjar_ironbreaker',
          'lyra_sunweaver',
          'kaelen_thornshot',
          'seraphina_lumina',
        ],
      },
      {
        id: 'preset_cc_2',
        name: 'Đội Hình Khống Chế Rừng Già',
        slots: [
          'valerius_dawnblade',
          'sylas_frostroot',
          'kaelen_thornshot',
          'lyra_sunweaver',
          'seraphina_lumina',
        ],
      },
    ],
    inventory: [
      {
        instanceId: 'eq_init_weapon_1',
        templateId: 'wpn_sun_blade',
        level: 2,
        equippedHeroId: 'valerius_dawnblade',
      },
      {
        instanceId: 'eq_init_armor_1',
        templateId: 'arm_solar_plate',
        level: 2,
        equippedHeroId: 'valerius_dawnblade',
      },
      {
        instanceId: 'eq_init_weapon_2',
        templateId: 'wpn_iron_cleaver',
        level: 1,
        equippedHeroId: 'lyra_sunweaver',
      },
      {
        instanceId: 'eq_init_armor_2',
        templateId: 'arm_chainmail',
        level: 1,
        equippedHeroId: 'brynjar_ironbreaker',
      },
      {
        instanceId: 'eq_init_boots_1',
        templateId: 'bts_wind_striders',
        level: 1,
        equippedHeroId: 'brynjar_ironbreaker',
      },
      {
        instanceId: 'eq_init_acc_1',
        templateId: 'acc_sun_sigil',
        level: 1,
        equippedHeroId: 'lyra_sunweaver',
      },
      {
        instanceId: 'eq_init_weapon_3',
        templateId: 'wpn_recruit_sword',
        level: 1,
        equippedHeroId: 'kaelen_thornshot',
      },
      {
        instanceId: 'eq_init_spare_1',
        templateId: 'acc_copper_ring',
        level: 0,
        equippedHeroId: null,
      },
    ],
    settings: {
      battleSpeed: 1,
      autoSkill: true,
      reducedMotion: false,
      soundEnabled: true,
    },
  };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

export async function saveGameToStorage(data: GameSaveData): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        LOCAL_STORAGE_FALLBACK_KEY,
        JSON.stringify(data)
      );
    }
  } catch {
    // Ignore localStorage quota errors
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(data, PRIMARY_KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Fallback already saved in localStorage
  }
}

export async function loadGameFromStorage(): Promise<GameSaveData> {
  try {
    const db = await openDatabase();
    const record = await new Promise<GameSaveData | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(PRIMARY_KEY);
        req.onsuccess = () => {
          db.close();
          resolve(req.result as GameSaveData | undefined);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      }
    );

    if (record && record.version === 1 && record.ownedHeroes) {
      return record;
    }
  } catch {
    // Fallback to localStorage below
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameSaveData;
        if (parsed && parsed.version === 1 && parsed.ownedHeroes) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore parse error
  }

  const initial = createInitialSaveData();
  await saveGameToStorage(initial);
  return initial;
}
