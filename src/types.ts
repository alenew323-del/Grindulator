export interface EnemyType {
  name: string;
  speed: number | "player";
  health: number | "player";
  sprite: string;
  bullet?: string;
  unlock: number;
  size: number | "player";
  weight: number;
  weightGrowth: number;
  fireRate: number | "player";
  coins: number;
  isShooter?: boolean;
  isBomber?: boolean;
  isMimic?: boolean;
  canHaveShield?: boolean;
  canHaveMultishot?: boolean;
  shooterPattern?: "parallel" | "spread" | "mimic";
}

export interface Mission {
  id: string;
  desc: string;
  type: string;
  targetId?: string;
  target: number;
  difficulty: number;
  req?: {
    bulletPierce?: number;
    fireshot?: number;
    shield?: number;
    multishot?: number;
  };
  statCategory?: string;
  progress: number;
  isShopUnlock?: boolean;
}

export interface Enchantment {
  id: string;
  name: string;
  basePrice: number;
  growthFactor: number;
  icon: string;
  description: string;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  el: HTMLImageElement;
  angle: number;
  pierceLeft: number;
  hitEnemies: string[];
  animTimer: number;
  animFrame: number;
  isFireSplit: boolean;
  sessionKills: number;
  size?: number;
}

export interface ShieldBullet {
  el: HTMLImageElement;
  ring: "inner" | "outer";
  offset: number;
  maxPierce: number;
  pierceLeft: number;
  hitEnemies: string[];
  animTimer: number;
  animFrame: number;
  spinDir: number;
  size: number;
}

export interface EnemyShieldBullet {
  el: HTMLImageElement;
  ring: "inner" | "outer";
  offset: number;
  maxPierce: number;
  pierceLeft: number;
  hitProjectiles: string[];
  animTimer: number;
  animFrame: number;
  spinDir: number;
  size: number;
  worldX: number;
  worldY: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  el: HTMLImageElement | null;
  type: EnemyType;
  health: number;
  lastShot: number;
  nextShotAt: number;
  hasSplit: boolean;
  isClone: boolean;
  originalId: any;
  isUnloaded: boolean;
  shieldBullets: EnemyShieldBullet[];
  activeShieldSignature: string;
  animTimer: number;
  animFrame: number;
  shieldLevel?: number;
  multishotLevel?: number;
  cloneAngle?: number;
  cloneStartX?: number;
  cloneStartY?: number;
  cloneSpawnTime?: number;
  cloneAnimating?: boolean;
  shootInterval?: number;
  lastHitTime?: number; // For Mimic Hit Cooldown
  isPrimed?: boolean;
  primedTimer?: number;
  isElite?: boolean;
  eliteOffset?: number;
}

export interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  el: HTMLImageElement;
  size: number;
  angle: number;
  source: string;
  animTimer: number;
  animFrame: number;
  animFrames: string[] | null;
  spinAngle?: number;
  spinSpeed?: number;
}

export interface Explosion {
  x: number;
  y: number;
  size: number;
  el: HTMLImageElement;
  frame: number;
  startTime: number;
}

export interface GameParticle {
  x: number;
  y: number;
  size: number;
  el: HTMLImageElement;
  startTime: number;
  duration: number;
  isFireshot: boolean;
}

export interface GameState {
  gameStarted: boolean;
  isPaused: boolean;
  isDead: boolean;
  devUnlocked: boolean;
  showDevPassword: boolean;
  lives: number;
  maxLives: number;
  coins: number;
  worldMusicVolume: number;
  shopMusicVolume: number;
  sfxVolume: number;
  deathMessage: string;
  scoreMessage: string;
  hitFlash: boolean;
  showDeathScreen: boolean;
  shopFade: number;
  inShop: boolean;
  shopOverlayVisible: boolean;
  enchantmentLevels: Record<string, number>;
  missionProgress: {
    visible: boolean;
    text: string;
    progress: number;
    target: number;
  };
  missionPopup: {
    title: string;
    desc: string;
    visible: boolean;
  };
  shopMissions: {
    desc: string;
    target: number;
    progress: number;
    done: boolean;
  }[];
  devValues: {
    acceleration: number;
    friction: number;
    bulletSpeed: number;
    bulletSize: number;
    fireRate: number;
    bulletPierce: number;
    multishot: number;
    fireshot: number;
    shield: number;
    maxLives: number;
    lives: number;
    coins: number;
  };
  mobKills: Record<string, number>;
  enemiesPopupVisible: boolean;
}

export const SOUNDS = {
  SHOOT: "https://codehs.com/uploads/85d8073565d5608c8c80af885aeeed30",
  KILL_BASIC: "https://codehs.com/uploads/516d65ecf8dc3245994fd64e029a857d",
  KILL_FAST: "https://codehs.com/uploads/01a5d877c29ef678cafe17cc1b7d960e",
  KILL_BIG: "https://codehs.com/uploads/d8b079b320f0bc5c4e15bc40d180bded",
  KILL_BEEFY: "https://codehs.com/uploads/e16a2bcb6c1adbcff2abe04e8aedeae2",
  KILL_MAGIC: "https://codehs.com/uploads/a2245a155cf6955b3f2f44df8e8dda8d",
  MAGIC_SHOOT: "https://codehs.com/uploads/dc216ebe650715d16fb9c0d0b20d1e1b",
  MAGIC_CLONE: "https://codehs.com/uploads/520480bf16b2d270d45137990257b32a",
  DAMAGE: "https://codehs.com/uploads/887d10888d07db88692131b0d60c1f5b",
  DEATH: "https://codehs.com/uploads/0ac12b1333ca3df408a0332711bf600e",
  STARTUP: "https://codehs.com/uploads/040ba4fd8155d69772d75c763ebcfc23",
  BUTTON_CLICK: "https://codehs.com/uploads/a62c25d853be5fb056a74c41c8eb0827",
  SHOOT_ARMORED: "https://codehs.com/uploads/dc216ebe650715d16fb9c0d0b20d1e1b",
  KILL_ARMORED: "https://codehs.com/uploads/d8b079b320f0bc5c4e15bc40d180bded",
  SHOOT_MIMIC: "https://codehs.com/uploads/dc216ebe650715d16fb9c0d0b20d1e1b",
  KILL_MIMIC: "https://codehs.com/uploads/d8b079b320f0bc5c4e15bc40d180bded",
  SHOOT_SHOOTER: "https://codehs.com/uploads/5887caecb39d66653e592141fc19edb2",
  KILL_SHOOTER: "https://codehs.com/uploads/d8b079b320f0bc5c4e15bc40d180bded",
  BOMBER_EXPLODE: "https://codehs.com/uploads/2af95f25bdc6958a96d6593ac9a82180",
  BOMBER_FUSE: "https://codehs.com/uploads/7b935fb4b8c4aef2d180dc29e9e7f75a",
  BOMBER_KILL: "https://codehs.com/uploads/8a411a30411a29cb11e70e44444fea55",
};

export const SHOP_SOUNDS = {
  TASK_COMPLETE: "https://codehs.com/uploads/ade105ecf56eebc8194d152eaa1a25c8",
  SHOP_ARROW_BEEP: "https://codehs.com/uploads/12e371f7fa10d588854b1dfb77cc114a",
  SHOP_ENTER: "https://codehs.com/uploads/d8d97d26941dbcc1f84625798eb0aba2",
  SHOP_EXIT: "https://codehs.com/uploads/5e17e9354ba1df219b4d1d18b47582ee",
  SHOP_MUSIC: "https://codehs.com/uploads/3c82d29ef86e4f836a524a0cfbe1a513",
  BUY_ITEM: "https://codehs.com/uploads/3e96ec0798ed0f13b73b36678a6b39f6",
};

export const MUSIC_TRACKS = [
  "https://codehs.com/uploads/286763ecb6bc3d5a05ba46338cff4941",
  "https://codehs.com/uploads/e5ce3d699f4d918dcb51815373c73f14",
  "https://codehs.com/uploads/84d3322261a2b2ff002b689b45b7387a",
];

export const PLAYER_ANIMS = [
  "https://codehs.com/uploads/0a43f120557a83d5aaa3857a60285114",
  "https://codehs.com/uploads/4d528a3b5679f255d7ab41e70b2f3a5f",
  "https://codehs.com/uploads/b0c42540c26642f5d592dad5e01b7399",
  "https://codehs.com/uploads/fc02f0afbf65fe0ccec3627d0a77be86",
];

export const PLAYER_MULTISHOT_FIRE_ANIMS: Record<number, string[]> = {
  1: [
    "https://codehs.com/uploads/e6325b7f561f0e665ad2ecbe2fbd6c24",
    "https://codehs.com/uploads/236e63a9e9b306563076ed37cb41303c",
    "https://codehs.com/uploads/fc42fb1c7bd0bffb1205c79bb728733f",
    "https://codehs.com/uploads/bd760aadb97593f36d1d1a414c3a8f21"
  ],
  2: [
    "https://codehs.com/uploads/56f55eec1802194ce06e937aacc7ac7e",
    "https://codehs.com/uploads/82721ef48636fa30a6f1dc15388ae426",
    "https://codehs.com/uploads/724c5adf0db19fcf56857d07a52b22f0",
    "https://codehs.com/uploads/a0e254b2d50a8f886a21b90b2e60dd4a"
  ],
  3: [
    "https://codehs.com/uploads/126fa88e8fff21da3757b079f5e12909",
    "https://codehs.com/uploads/cf6b1c97487830fc0d352fa14e1a2f25",
    "https://codehs.com/uploads/1cff32e6594ba7aef5694ceb7124e3e9",
    "https://codehs.com/uploads/bf8a20b23c588141b799dfdaed41b0ab"
  ]
};

export const BULLET_ANIMS = [
  "https://codehs.com/uploads/d784e2846d1ee036a203c8015ba7e32d",
  "https://codehs.com/uploads/0c37378d1e86ddc0262ab9c60f2971be",
];

export const DEFAULT_BULLET_SPRITE = "https://codehs.com/uploads/caf977daf3bd7499bc2d345cd21a1dcf";

export const PLAYER_SPRITES: Record<number, string> = {
  0: "https://codehs.com/uploads/6900a62aeef66c8b69de44fb843b8f08",
  1: "https://codehs.com/uploads/ac45f7a61c25de62f25640c53003ec73",
  2: "https://codehs.com/uploads/f947bdb788da4561727cd69edd5a352c",
  3: "https://codehs.com/uploads/4e069d525ef6bb90c12219305de4f930",
};

export const LIFE_IMAGES: Record<string, string> = {
  "0/1": "https://codehs.com/uploads/d9b24ffe37b63fbbc66055a35ea5746d",
  "1/1": "https://codehs.com/uploads/05a264b7d6c7994f970e80e78850efc9",
  "0/2": "https://codehs.com/uploads/0bf4dfecc6d7213ef0f56f2dfb77b9af",
  "1/2": "https://codehs.com/uploads/231c9997673f52ea8b7c1433f3315ea4",
  "2/2": "https://codehs.com/uploads/17755df3e7f5dc6348014db4a8691e1e",
  "0/3": "https://codehs.com/uploads/b521d3389ca32cbf534867c9e1b1d9f5",
  "1/3": "https://codehs.com/uploads/469de40da616b5bf1d4296f5f431f5b3",
  "2/3": "https://codehs.com/uploads/161719affe9ebb2b7dbbff667a20bf16",
  "3/3": "https://codehs.com/uploads/362adea7c5e3abc83a622817fe5e6b50",
  "0/4": "https://codehs.com/uploads/e8a65ea35cc5b6f9e41d17e166bd0c31",
  "1/4": "https://codehs.com/uploads/692fa2b30529a66721a8904e963a68a3",
  "2/4": "https://codehs.com/uploads/10ca97fa960ed04339101900a69aaf25",
  "3/4": "https://codehs.com/uploads/d905d3c4c9eb58457d0aade2631edebb",
  "4/4": "https://codehs.com/uploads/a1cfb72c6e8d05dafcac2bd59534cf30",
  "0/5": "https://codehs.com/uploads/00578ccff56fb5bf2c31f63bc8d5b807",
  "1/5": "https://codehs.com/uploads/e2ee29823155180c6cc5ac1b1dc57468",
  "2/5": "https://codehs.com/uploads/d53005e06a851479836bdfe42784babf",
  "3/5": "https://codehs.com/uploads/c1936f210e4d4a377492c4dc689dc3c7",
  "4/5": "https://codehs.com/uploads/634e3f801e3fb1501690529b4016a35a",
  "5/5": "https://codehs.com/uploads/fa57d8ed9c0a24ee1d43a2cb66f4e5cc",
  "0/6": "https://codehs.com/uploads/732b96747bdf3e153a62e4c03a895bf0",
  "1/6": "https://codehs.com/uploads/39cddca729b2885611346f1630d9ec4f",
  "2/6": "https://codehs.com/uploads/8b2888010e575818bd04aa302c4f0528",
  "3/6": "https://codehs.com/uploads/ca949806ea4abb7536819feafa99e77b",
  "4/6": "https://codehs.com/uploads/13fa518bd1336bacc8f61eedf19d2a89",
  "5/6": "https://codehs.com/uploads/b84baaa5b630d69dacdc93f140acac92",
  "6/6": "https://codehs.com/uploads/0acb8f452e08b5527047f8383e1976cd",
};

export const COIN_ICON_URL = "https://codehs.com/uploads/337a3d6af8c7f3a18437bbce31fb7547";
export const CURSOR_URL = "https://codehs.com/uploads/cd314f11afde68de02dd1c12923b0065";
export const MAGIC_BULLET_SPRITE = "https://codehs.com/uploads/f6cd127fdf4133f5ee31af1487b717f0";
export const ARMORED_BULLET_SPRITE = "https://codehs.com/uploads/c82e53bb43989344dce38b61f5f892e2";
export const SHOOTER_BULLET_SPRITE = "https://codehs.com/uploads/16ad699b9c88ea31a0117a59235fef32";

export const BOMBER_SPRITES = [
  "https://codehs.com/uploads/61028e43012fb7493f9b204a337aa2d1",
  "https://codehs.com/uploads/2dad97e8d8fa633de32a5edb849a0f04",
];

export const BOMBER_EXPLOSION_FRAMES = [
  "https://codehs.com/uploads/1b89e810f08073b569538fecd387210a",
  "https://codehs.com/uploads/79e2da321c419529dea084dc1a0a507f",
  "https://codehs.com/uploads/f102c6ebf8516e8e2e76d04168d69a03",
  "https://codehs.com/uploads/2036ae06e2e8e3aa40aa9397d60cfc16",
  "https://codehs.com/uploads/0f6cdf86a73c1cdf976ce6705c23a564",
  "https://codehs.com/uploads/536d465b1e47d0426626dddfd162e09a",
  "https://codehs.com/uploads/a85a040cd7da04a65119de8b1291aae5",
  "https://codehs.com/uploads/cd93fe98ff6fd00d4ab7c4e4307bdcef",
  "https://codehs.com/uploads/a7d45fa9f7a894700d13d6231874ad5a",
  "https://codehs.com/uploads/97a66d6b7803dbeafed9a67c8c2a4cd8",
  "https://codehs.com/uploads/a9345312be7841813859f7a65877147c",
  "https://codehs.com/uploads/5ab2d926171e7db625dd1496d585e09d",
  "https://codehs.com/uploads/4461049d407dd4ea63bc4938d4d74d51",
  "https://codehs.com/uploads/5369d6b4ef4b865ea0a0275c7f55ce90",
  "https://codehs.com/uploads/b11ffdbd811029162829c2b0dfd38dc9"
];

export const DOOR_ANIM_FRAMES = [
  "https://codehs.com/uploads/3f56919ef42c7a3abb4138abb37aca2c",
  "https://codehs.com/uploads/3f04536704e17b41522efc405b2da906",
  "https://codehs.com/uploads/d7dfe78cdafcfef8d2aaaf88b4c818d3",
  "https://codehs.com/uploads/7beeda105816fb8a2de4220d0486562d",
  "https://codehs.com/uploads/a7b6c447492e71c64f201168e149a92f",
  "https://codehs.com/uploads/29fa9910c7e478c90ebb756521bd136d",
  "https://codehs.com/uploads/5352c0538a1417e498f8dbd2545be857",
  "https://codehs.com/uploads/5ad8952289feb0417c502856bbd80ffc",
  "https://codehs.com/uploads/f51390a269057641169d1235cff6e32e",
];

export const ARROW_FRAMES = [
  "https://codehs.com/uploads/0007b91a1afe1e8503aceb92220ee945",
  "https://codehs.com/uploads/4c3bc93aac03304c090ca079aac9f83d",
];

export const DEFAULTS = {
  ACCELERATION: 0.6,
  FRICTION: 0.9,
  BULLET_SPEED: 8,
  BULLET_SIZE: 20,
  FIRE_RATE: 6,
  PIERCE: 0,
  MULTISHOT: 0,
  FIRESHOT: 0,
  SHIELD: 0,
  LIVES: 3,
  MAX_LIVES: 3,
};

export const DEV_STAT_LIMITS = {
  acceleration: { min: 0.1, max: 3.5, step: 0.1 },
  friction: { min: 0.5, max: 1, step: 0.01 },
  bulletSpeed: { min: 2, max: 30, step: 0.1 },
  bulletSize: { min: 5, max: 40, step: 1 },
  fireRate: { min: 1, max: 60, step: 0.1 },
  bulletPierce: { min: 0, max: 10, step: 1 },
  multishot: { min: 0, max: 10, step: 1 },
  fireshot: { min: 0, max: 10, step: 1 },
  shield: { min: 0, max: 10, step: 1 },
  maxLives: { min: 1, max: 6, step: 1 },
  coins: { min: 0, max: 999999, step: 1 },
};

export const HIT_COOLDOWN = 1500;
export const PLAYER_HITBOX_SIZE = 24;
export const PLAYER_MUZZLE_DISTANCE = 28;
export const SHOP_SPRITE_SIZE = 90;
export const SHOP_AREA_X = 200000;
export const SHOP_AREA_Y = 200000;
export const CLONE_FINAL_RADIUS = 150;
export const CLONE_ANIMATION_DURATION = 600;
export const SHOP_FADE_DURATION = 650;
export const SHOP_SCREEN_WIDEN_FACTOR = 1.05;
export const SHOP_ARROW_BEEP_INTERVAL = 900;
export const BOMBER_TRIGGER_RADIUS = 300; // Fixed! Now blows up when <= 300px
export const BOMBER_EXPLOSION_RADIUS = 450;
export const BOMBER_EXPLOSION_FRAME_TIME = 60;

export const SHOP_ITEM_WIDTH = 195;
export const SHOP_ITEM_HEIGHT = 195;
export const SHOP_ITEM_GAP = 24;
export const SHOP_ITEM_ROW_GAP = 280;
export const SHOP_ITEM_COLUMNS = 5;
export const DEV_PASSWORD = "dev251106";

export const ENEMY_TYPES: EnemyType[] = [
  { name: "Basic Mob", speed: 2.5, health: 1, sprite: "https://codehs.com/uploads/c1f80496c09b22885b7c5363c5a39f61", unlock: 0, size: 70, weight: 50, weightGrowth: 4, fireRate: 0, coins: 1 },
  { name: "Fast Mob", speed: 5, health: 1, sprite: "https://codehs.com/uploads/f90e57af5395807dbe4331e547933f97", unlock: 20000, size: 45, weight: 6, weightGrowth: 15, fireRate: 0, coins: 2 },
  { name: "Big Mob", speed: 1.8, health: 3, sprite: "https://codehs.com/uploads/fb3ecf8b15c243670ee79c2f5fc4a1ee", unlock: 20000, size: 80, weight: 15, weightGrowth: 15, fireRate: 0, coins: 3 },
  // Bomber Mob: Increased spawn rate and weight growth, and introduced earlier at 25s
  { name: "Bomber Mob", speed: 3, health: 5, sprite: BOMBER_SPRITES[0], unlock: 25000, size: 55, weight: 15, weightGrowth: 12, fireRate: 0, coins: 15, isBomber: true },
  { name: "Beefy Mob", speed: 1.5, health: 50, sprite: "https://codehs.com/uploads/552b9a6928e6fc4ec63afdb3f001ad65", unlock: 55000, size: 100, weight: 1, weightGrowth: 8, fireRate: 0, coins: 50 },
  // FIXED Shooter Mob: Reduced spawn rate (weight decreased from 2.5 to 1.2, weightGrowth from 9 to 4)
  { name: "Shooter Mob", speed: 3, health: 10, sprite: "https://codehs.com/uploads/874cb3f4442820a144faf789633c16a9", bullet: SHOOTER_BULLET_SPRITE, unlock: 65000, size: 70, weight: 1.2, weightGrowth: 4, fireRate: 10, coins: 20, isShooter: true, shooterPattern: "parallel" },
  // FIXED Magic Mob: Health set to 7 lives
  { name: "Magic Mob", speed: 2.2, health: 7, sprite: "https://codehs.com/uploads/819a6f4f283715719dd1712ef1854afd", unlock: 75000, size: 70, weight: 2, weightGrowth: 10, fireRate: 2, isShooter: true, coins: 15 },
  // FIXED Armored Mob: Substantially reduced spawn rate to avoid lag! Reduced fireRate to 1.25.
  { name: "Armored Mob", speed: 2.5, health: 20, sprite: "https://codehs.com/uploads/4e3c28353f88ff04be4d4d828e7b2c3d", bullet: ARMORED_BULLET_SPRITE, unlock: 85000, size: 70, weight: 1.2, weightGrowth: 4, fireRate: 1.25, coins: 20, isShooter: true, canHaveShield: true, canHaveMultishot: true, shooterPattern: "spread" },
  // Mimic Mob: Delayed unlock to 100s, weight decreased to 0.15 and weightGrowth decreased to 1 so it spawns much less frequently!
  { name: "Mimic Mob", speed: "player", health: "player", sprite: "player", bullet: "player", unlock: 100000, size: "player", weight: 0.15, weightGrowth: 1, fireRate: "player", coins: 25, isShooter: true, isMimic: true, shooterPattern: "mimic" },
];

export const MISSION_DATABASE = [
  { id: "kill_basic_10", desc: "Defeat 10 Basic Mobs", type: "kill_mob", targetId: "Basic Mob", target: 10, difficulty: 1 },
  { id: "kill_basic_25", desc: "Defeat 25 Basic Mobs", type: "kill_mob", targetId: "Basic Mob", target: 25, difficulty: 1 },
  { id: "kill_basic_75", desc: "Defeat 75 Basic Mobs", type: "kill_mob", targetId: "Basic Mob", target: 75, difficulty: 2 },
  { id: "kill_basic_200", desc: "Defeat 200 Basic Mobs", type: "kill_mob", targetId: "Basic Mob", target: 200, difficulty: 3 },
  { id: "kill_fast_15", desc: "Defeat 15 Fast Mobs", type: "kill_mob", targetId: "Fast Mob", target: 15, difficulty: 1 },
  { id: "kill_fast_50", desc: "Defeat 50 Fast Mobs", type: "kill_mob", targetId: "Fast Mob", target: 50, difficulty: 2 },
  { id: "kill_fast_150", desc: "Defeat 150 Fast Mobs", type: "kill_mob", targetId: "Fast Mob", target: 150, difficulty: 3 },
  { id: "kill_fast_300", desc: "Defeat 300 Fast Mobs", type: "kill_mob", targetId: "Fast Mob", target: 300, difficulty: 4 },
  { id: "kill_big_10", desc: "Defeat 10 Big Mobs", type: "kill_mob", targetId: "Big Mob", target: 10, difficulty: 1 },
  { id: "kill_big_20", desc: "Defeat 20 Big Mobs", type: "kill_mob", targetId: "Big Mob", target: 20, difficulty: 2 },
  { id: "kill_big_60", desc: "Defeat 60 Big Mobs", type: "kill_mob", targetId: "Big Mob", target: 60, difficulty: 3 },
  { id: "kill_magic_5", desc: "Defeat 5 Magic Mobs", type: "kill_mob", targetId: "Magic Mob", target: 5, difficulty: 2 },
  { id: "kill_magic_15", desc: "Defeat 15 Magic Mobs", type: "kill_mob", targetId: "Magic Mob", target: 15, difficulty: 3 },
  { id: "kill_magic_40", desc: "Defeat 40 Magic Mobs", type: "kill_mob", targetId: "Magic Mob", target: 40, difficulty: 4 },
  { id: "kill_beefy_1", desc: "Defeat 1 Beefy Mob", type: "kill_mob", targetId: "Beefy Mob", target: 1, difficulty: 2 },
  { id: "kill_beefy_3", desc: "Defeat 3 Beefy Mobs", type: "kill_mob", targetId: "Beefy Mob", target: 3, difficulty: 3 },
  { id: "kill_beefy_10", desc: "Defeat 10 Beefy Mobs", type: "kill_mob", targetId: "Beefy Mob", target: 10, difficulty: 4 },
  { id: "kill_any_50", desc: "Defeat 50 enemies total", type: "kill_any", target: 50, difficulty: 1 },
  { id: "kill_any_150", desc: "Defeat 150 enemies total", type: "kill_any", target: 150, difficulty: 2 },
  { id: "kill_any_400", desc: "Defeat 400 enemies total", type: "kill_any", target: 400, difficulty: 3 },
  { id: "kill_any_1000", desc: "Defeat 1,000 enemies total", type: "kill_any", target: 1000, difficulty: 4 },
  { id: "shoot_50", desc: "Shoot 50 bullets", type: "shoot", target: 50, difficulty: 1 },
  { id: "shoot_200", desc: "Shoot 200 bullets", type: "shoot", target: 200, difficulty: 2 },
  { id: "shoot_750", desc: "Shoot 750 bullets", type: "shoot", target: 750, difficulty: 3 },
  { id: "shoot_3000", desc: "Shoot 3,000 bullets", type: "shoot", target: 3000, difficulty: 4 },
  { id: "collect_coins_20", desc: "Collect 20 coins", type: "collect_coins", target: 20, difficulty: 1 },
  { id: "collect_coins_75", desc: "Collect 75 coins", type: "collect_coins", target: 75, difficulty: 1 },
  { id: "collect_coins_200", desc: "Collect 200 coins", type: "collect_coins", target: 200, difficulty: 2 },
  { id: "collect_coins_500", desc: "Collect 500 coins", type: "collect_coins", target: 500, difficulty: 3 },
  { id: "collect_coins_1500", desc: "Collect 1,500 coins", type: "collect_coins", target: 1500, difficulty: 4 },
  { id: "collect_coins_5000", desc: "Collect 5,000 coins", type: "collect_coins", target: 5000, difficulty: 4 },
  { id: "pierce_2", desc: "Kill 2 enemies with a single bullet", type: "bullet_multikill", target: 2, difficulty: 2, req: { bulletPierce: 2 }, statCategory: "pierce" },
  { id: "pierce_3", desc: "Kill 3 enemies with a single bullet", type: "bullet_multikill", target: 3, difficulty: 3, req: { bulletPierce: 3 }, statCategory: "pierce" },
  { id: "pierce_5", desc: "Kill 5 enemies with a single bullet", type: "bullet_multikill", target: 5, difficulty: 4, req: { bulletPierce: 5 }, statCategory: "pierce" },
  { id: "pierce_kill_25", desc: "Get 25 kills using a piercing bullet", type: "pierce_kill", target: 25, difficulty: 2, req: { bulletPierce: 1 }, statCategory: "pierce" },
  { id: "pierce_kill_100", desc: "Get 100 kills using a piercing bullet", type: "pierce_kill", target: 100, difficulty: 3, req: { bulletPierce: 1 }, statCategory: "pierce" },
  { id: "pierce_kill_350", desc: "Get 350 kills using a piercing bullet", type: "pierce_kill", target: 350, difficulty: 4, req: { bulletPierce: 2 }, statCategory: "pierce" },
  { id: "fire_split_20", desc: "Trigger 20 Fireshot splits", type: "fireshot_split", target: 20, difficulty: 2, req: { fireshot: 1 }, statCategory: "fireshot" },
  { id: "fire_split_100", desc: "Trigger 100 Fireshot splits", type: "fireshot_split", target: 100, difficulty: 3, req: { fireshot: 1 }, statCategory: "fireshot" },
  { id: "fire_split_400", desc: "Trigger 400 Fireshot splits", type: "fireshot_split", target: 400, difficulty: 4, req: { fireshot: 2 }, statCategory: "fireshot" },
  { id: "shield_block_15", desc: "Block 15 hits with your shield", type: "shield_block", target: 15, difficulty: 2, req: { shield: 1 }, statCategory: "shield" },
  { id: "shield_block_75", desc: "Block 75 hits with your shield", type: "shield_block", target: 75, difficulty: 3, req: { shield: 2 }, statCategory: "shield" },
  { id: "shield_block_200", desc: "Block 200 hits with your shield", type: "shield_block", target: 200, difficulty: 4, req: { shield: 4 }, statCategory: "shield" },
  { id: "shield_magic_5", desc: "Destroy 5 Magic Bullets with your shield", type: "shield_magic", target: 5, difficulty: 2, req: { shield: 1 }, statCategory: "shield" },
  { id: "shield_magic_20", desc: "Destroy 20 Magic Bullets with your shield", type: "shield_magic", target: 20, difficulty: 3, req: { shield: 2 }, statCategory: "shield" },
  { id: "shield_magic_60", desc: "Destroy 60 Magic Bullets with your shield", type: "shield_magic", target: 60, difficulty: 4, req: { shield: 4 }, statCategory: "shield" },
  { id: "multishot_kill_20", desc: "Defeat 20 enemies while Multishot is active", type: "multishot_kill", target: 20, difficulty: 2, req: { multishot: 1 }, statCategory: "multishot" },
  { id: "multishot_kill_100", desc: "Defeat 100 enemies while Multishot is active", type: "multishot_kill", target: 100, difficulty: 3, req: { multishot: 1 }, statCategory: "multishot" },
  { id: "multishot_kill_400", desc: "Defeat 400 enemies while Multishot is active", type: "multishot_kill", target: 400, difficulty: 4, req: { multishot: 2 }, statCategory: "multishot" },
];

export const ENCHANTMENTS: Enchantment[] = [
  { id: 'bulletSize', name: 'BULLET SIZE', basePrice: 20, growthFactor: 1.8, icon: 'https://codehs.com/uploads/c6115dd4d710703b65fcec3d08f64956', description: 'Increases bullet size by 2 per level.' },
  { id: 'bulletSpeed', name: 'BULLET SPEED', basePrice: 30, growthFactor: 1.8, icon: 'https://codehs.com/uploads/383e4eebabde9571615d182fa0d41542', description: 'Increases bullet speed by 2.2 per level.' },
  { id: 'fireRate', name: 'FIRE RATE', basePrice: 40, growthFactor: 1.8, icon: 'https://codehs.com/uploads/d3157a5cdc2e97aea7bd31f9b022e86e', description: 'Increases fire rate by 5.4 shots/sec per level.' },
  { id: 'playerSpeed', name: 'PLAYER SPEED', basePrice: 30, growthFactor: 1.8, icon: 'https://codehs.com/uploads/adc37800b182916251a9ae7c1869acde', description: 'Increases player acceleration by 0.29 per level.' },
  { id: 'multishot', name: 'MULTISHOT', basePrice: 200, growthFactor: 1.8, icon: 'https://codehs.com/uploads/28df6c1ddaa4e84f986db63664a74ab7', description: 'Adds +1 extra bullet per shot per level.' },
  { id: 'fireshot', name: 'FIRESHOT', basePrice: 350, growthFactor: 1.8, icon: 'https://codehs.com/uploads/a761c93bc31f04b008476a2dfca86d9b', description: 'Adds +1 fire split bullet on hit per level.' },
  { id: 'piercing', name: 'PIERCING', basePrice: 50, growthFactor: 1.8, icon: 'https://codehs.com/uploads/fcd9be21114a1ba7394eacc5a7bf40db', description: 'Adds +1 enemy pierce per bullet per level.' },
  { id: 'shield', name: 'SHIELD', basePrice: 40, growthFactor: 1.8, icon: 'https://codehs.com/uploads/6dae2421744d2204f4652872d7abaee4', description: 'Adds +1 orbiting shield orb per level.' },
  { id: 'maxLives', name: 'MAX LIVES', basePrice: 60, growthFactor: 1.8, icon: 'https://codehs.com/uploads/153b5142fdbc1cc1afbe8776e2fc5ecf', description: 'Increases maximum lives by 1 per level.' },
  { id: 'life', name: 'LIFE', basePrice: 40, growthFactor: 1.8, icon: 'https://codehs.com/uploads/239b18dffc53381d858b3c7348fe1c78', description: 'Restores 1 life (up to maximum).' },
];

export function getEnchantmentPrice(enchantment: Enchantment, currentLevel: number): number {
  return Math.ceil(enchantment.basePrice * Math.pow(enchantment.growthFactor, currentLevel));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function roundToStep(value: number, step: number): number {
  if (!step) return value;
  const decimals = (step.toString().split('.')[1] || '').length;
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

export function isEnchantmentMaxedForValues(id: string, values: any, levels?: Record<string, number>): boolean {
  if (!values) return false;
  if (id === 'life') return values.lives >= values.maxLives;
  if (id === 'maxLives') return values.maxLives >= DEV_STAT_LIMITS.maxLives.max;
  
  // For other enchants, check if level is maxed (10)
  if (levels && levels[id] !== undefined && levels[id] >= 10) return true;

  switch (id) {
    case 'bulletSize': return values.bulletSize >= DEV_STAT_LIMITS.bulletSize.max;
    case 'bulletSpeed': return values.bulletSpeed >= DEV_STAT_LIMITS.bulletSpeed.max;
    case 'fireRate': return values.fireRate >= DEV_STAT_LIMITS.fireRate.max;
    case 'playerSpeed': return values.acceleration >= DEV_STAT_LIMITS.acceleration.max;
    case 'multishot': return values.multishot >= DEV_STAT_LIMITS.multishot.max;
    case 'fireshot': return values.fireshot >= DEV_STAT_LIMITS.fireshot.max;
    case 'piercing': return values.bulletPierce >= DEV_STAT_LIMITS.bulletPierce.max;
    case 'shield': return values.shield >= DEV_STAT_LIMITS.shield.max;
    default: return false;
  }
}
