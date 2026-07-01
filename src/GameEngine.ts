import {
  Enemy,
  EnemyType,
  Bullet,
  ShieldBullet,
  EnemyBullet,
  Explosion,
  GameParticle,
  PLAYER_MULTISHOT_FIRE_ANIMS,
  GameState,
  SOUNDS,
  SHOP_SOUNDS,
  MUSIC_TRACKS,
  PLAYER_ANIMS,
  BULLET_ANIMS,
  DEFAULT_BULLET_SPRITE,
  PLAYER_SPRITES,
  LIFE_IMAGES,
  COIN_ICON_URL,
  CURSOR_URL,
  MAGIC_BULLET_SPRITE,
  ARMORED_BULLET_SPRITE,
  SHOOTER_BULLET_SPRITE,
  BOMBER_SPRITES,
  BOMBER_EXPLOSION_FRAMES,
  DOOR_ANIM_FRAMES,
  ARROW_FRAMES,
  DEFAULTS,
  DEV_STAT_LIMITS,
  HIT_COOLDOWN,
  PLAYER_HITBOX_SIZE,
  PLAYER_MUZZLE_DISTANCE,
  SHOP_SPRITE_SIZE,
  SHOP_AREA_X,
  SHOP_AREA_Y,
  CLONE_FINAL_RADIUS,
  CLONE_ANIMATION_DURATION,
  SHOP_FADE_DURATION,
  SHOP_SCREEN_WIDEN_FACTOR,
  SHOP_ARROW_BEEP_INTERVAL,
  BOMBER_TRIGGER_RADIUS,
  BOMBER_EXPLOSION_RADIUS,
  BOMBER_EXPLOSION_FRAME_TIME,
  ENEMY_TYPES,
  MISSION_DATABASE,
  ENCHANTMENTS,
  getEnchantmentPrice,
  clamp,
  roundToStep,
  isEnchantmentMaxedForValues,
  SHOP_ITEM_WIDTH,
  SHOP_ITEM_HEIGHT,
  SHOP_ITEM_GAP,
  SHOP_ITEM_ROW_GAP,
  SHOP_ITEM_COLUMNS,
  DEV_PASSWORD
} from "./types";

export class GameEngine {
  public container: HTMLDivElement;
  public onStateChange: (state: GameState) => void;

  public playerEl: HTMLImageElement;
  public testBoxEl: HTMLDivElement;

  private missionPopupTimer: any = null;
  private deathTimeout: any = null;
  private hitFlashTimeout: any = null;
  private playingSounds: { url: string; audio: HTMLAudioElement }[] = [];
  private animationId: number = 0;

  // Cache door frame images
  private _doorFrameCache: HTMLImageElement[];
  private _explosionFrameCache: HTMLImageElement[];
  private _multishotFireFrameCache: HTMLImageElement[];

  public state: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    mouseX: number;
    mouseY: number;
    keys: Record<string, boolean>;
    bullets: Bullet[];
    enemyBullets: EnemyBullet[];
    enemies: Enemy[];
    shieldBullets: ShieldBullet[];
    explosions: Explosion[];
    particles: GameParticle[];
    acceleration: number;
    friction: number;
    bulletSpeed: number;
    bulletSize: number;
    fireRate: number;
    fireDelay: number;
    bulletPierce: number;
    multishot: number;
    fireshot: number;
    shield: number;
    lastShot: number;
    shieldRespawnTimer: number;
    centerOffsetX: number;
    centerOffsetY: number;
    cameraX: number;
    cameraY: number;
    coins: number;
    lives: number;
    maxLives: number;
    lastHitTime: number;
    playerAnimTimer: number;
    playerAnimFrame: number;
    activePlaytime: number;
    lastTimestamp: number;
    lastFrameTime: number;
    gameSessionId: number;
    activeMissions: any[];
    completedMissions: string[];
    inShop: boolean;
    enteringShop: boolean;
    shopVisits: number;
    shopItemEls: { el: HTMLDivElement; enchantId: string; x: number; y: number }[];
    shopTitleEl: HTMLDivElement | null;
    shopEntranceActive: boolean;
    shopEntranceEl: HTMLImageElement | null;
    shopExitEl: HTMLImageElement | null;
    shopEnterTime: number;
    shopFade: number;
    lastShopArrowBeepTime: number;
    missionProgress: { visible: boolean; text: string; progress: number; target: number };
    shopArrowEl: HTMLImageElement | null;
    shopArrowTextEl: HTMLDivElement | null;
    shopArrowFade: number;
    shopArrowAnimFrame: number;
    shopArrowAnimTimer: number;
    entranceDoorAnimFrame: number;
    entranceDoorAnimPlayed: boolean;
    entranceDoorAnimTimer: number;
    exitDoorAnimFrame: number;
    exitDoorAnimPlayed: boolean;
    exitDoorAnimTimer: number;
    postShopSpawnDelay: boolean;
    shopEntranceX: number;
    shopEntranceY: number;
    shopExitX: number;
    shopExitY: number;
    preShopX: number;
    preShopY: number;
    shopUnlockMissions: { id: string; desc: string; target: number }[];
    shopMissionCounter: number;
    shopMissionTier: number;
    usedMissionIds: Record<number, string[]>;
    enchantmentLevels: Record<string, number>;
    shopOverlayVisible: boolean;
    shopMusic: HTMLAudioElement | null;
    lastSpawnTime: number;
    nextSpawnInterval: number;
    currentMusic: HTMLAudioElement | null;
    worldMusicVolume: number;
    shopMusicVolume: number;
    sfxVolume: number;
    maxParticles: number;
    screenScale: number;
    gameStarted: boolean;
    isDead: boolean;
    isPaused: boolean;
    devUnlocked: boolean;
    showDevPassword: boolean;
    missionPopup: { title: string; desc: string; visible: boolean };
    hitFlash: boolean;
    showDeathScreen: boolean;
    deathMessage: string;
    scoreMessage: string;
    mobKills: Record<string, number>;
    enemiesPopupVisible: boolean;
  };

  constructor(container: HTMLDivElement, onStateChange: (state: GameState) => void) {
    this.container = container;
    this.onStateChange = onStateChange;

    this.state = {
      x: 900, y: 400, vx: 0, vy: 0, mouseX: 0, mouseY: 0, keys: {},
      bullets: [], enemyBullets: [], enemies: [], shieldBullets: [], explosions: [], particles: [],
      acceleration: DEFAULTS.ACCELERATION, friction: DEFAULTS.FRICTION,
      bulletSpeed: DEFAULTS.BULLET_SPEED, bulletSize: DEFAULTS.BULLET_SIZE,
      fireRate: DEFAULTS.FIRE_RATE, fireDelay: 1000 / DEFAULTS.FIRE_RATE,
      bulletPierce: DEFAULTS.PIERCE, multishot: DEFAULTS.MULTISHOT,
      fireshot: DEFAULTS.FIRESHOT, shield: DEFAULTS.SHIELD,
      lastShot: 0, shieldRespawnTimer: 0,
      centerOffsetX: 36, centerOffsetY: 21, cameraX: 0, cameraY: 0,
      coins: 0, lives: DEFAULTS.LIVES, maxLives: DEFAULTS.MAX_LIVES, lastHitTime: 0,
      playerAnimTimer: 0, playerAnimFrame: 0,
      activePlaytime: 0, lastTimestamp: Date.now(), lastFrameTime: performance.now(),
      gameSessionId: 0,
      activeMissions: [], completedMissions: [],
      inShop: false, enteringShop: false, shopVisits: 0, shopItemEls: [], shopTitleEl: null,
      shopEntranceActive: false, shopEntranceEl: null, shopExitEl: null, shopEnterTime: 0, shopFade: 0, lastShopArrowBeepTime: 0,
      missionProgress: { visible: false, text: '', progress: 0, target: 0 },
      shopArrowEl: null, shopArrowTextEl: null, shopArrowFade: 0, shopArrowAnimFrame: 0, shopArrowAnimTimer: 0,
      entranceDoorAnimFrame: 0, entranceDoorAnimPlayed: false, entranceDoorAnimTimer: 0,
      exitDoorAnimFrame: 0, exitDoorAnimPlayed: false, exitDoorAnimTimer: 0,
      postShopSpawnDelay: false,
      shopEntranceX: 0, shopEntranceY: 0, shopExitX: 0, shopExitY: 0, preShopX: 0, preShopY: 0,
      shopUnlockMissions: [], shopMissionCounter: 0,
      shopMissionTier: 1, usedMissionIds: { 1: [], 2: [], 3: [], 4: [] },
      enchantmentLevels: {}, shopOverlayVisible: false, shopMusic: null,
      lastSpawnTime: 0, nextSpawnInterval: 2500,
      currentMusic: null, worldMusicVolume: 0.3, shopMusicVolume: 0.3, sfxVolume: 0.5, maxParticles: DEFAULTS.MAX_PARTICLES,
      screenScale: 1,
      gameStarted: false, isDead: false, isPaused: false,
      devUnlocked: false, showDevPassword: false,
      missionPopup: { title: '', desc: '', visible: false },
      hitFlash: false, showDeathScreen: false, deathMessage: '', scoreMessage: '',
      mobKills: {}, enemiesPopupVisible: false,
    };

    this.playerEl = document.createElement('img');
    this.playerEl.src = PLAYER_SPRITES[0];
    this.playerEl.style.cssText = 'width:72px;height:42px;position:absolute;transform-origin:center;visibility:hidden;z-index:9999;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;';
    this.playerEl.draggable = false;
    this.playerEl.setAttribute('draggable', 'false');
    this.playerEl.addEventListener('dragstart', e => e.preventDefault());
    this.container.appendChild(this.playerEl);

    this._doorFrameCache = DOOR_ANIM_FRAMES.map(url => { const img = new Image(); img.src = url; return img; });
    this._explosionFrameCache = BOMBER_EXPLOSION_FRAMES.map(url => { const img = new Image(); img.src = url; return img; });
    this._multishotFireFrameCache = [];
    Object.values(PLAYER_MULTISHOT_FIRE_ANIMS).forEach(frames => {
      frames.forEach(url => {
        const img = new Image();
        img.src = url;
        this._multishotFireFrameCache.push(img);
      });
    });

    this.testBoxEl = document.createElement('div');
    this.testBoxEl.style.cssText = 'width:50px;height:50px;background:gold;position:absolute;visibility:hidden;pointer-events:none;';
    this.container.appendChild(this.testBoxEl);
    this.applyScreenScale();

    this.update = this.update.bind(this);
    this.resumeMusic = this.resumeMusic.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.preventNativeDrag = this.preventNativeDrag.bind(this);
    this.preventBrowserZoom = this.preventBrowserZoom.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.animationId = requestAnimationFrame(this.update);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('click', this.resumeMusic);
    document.addEventListener('contextmenu', this.handleContextMenu, true);
    document.addEventListener('dragstart', this.preventNativeDrag, true);
    document.addEventListener('selectstart', this.preventNativeDrag, true);
    document.addEventListener('wheel', this.preventBrowserZoom, { capture: true, passive: false });
    document.addEventListener('keydown', this.preventBrowserZoom, true);
    document.addEventListener('gesturestart', this.preventBrowserZoom, true);
    document.addEventListener('gesturechange', this.preventBrowserZoom, true);
    document.addEventListener('gestureend', this.preventBrowserZoom, true);
    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('resize', this.handleResize);
    this.emitState();
  }

  public emitState() {
    const s = this.state;
    this.onStateChange({
      gameStarted: s.gameStarted, isPaused: s.isPaused, isDead: s.isDead,
      devUnlocked: s.devUnlocked, showDevPassword: s.showDevPassword,
      lives: s.lives, maxLives: s.maxLives, coins: s.coins,
      worldMusicVolume: Math.round(s.worldMusicVolume * 100), shopMusicVolume: Math.round(s.shopMusicVolume * 100), sfxVolume: Math.round(s.sfxVolume * 100), maxParticles: s.maxParticles,
      deathMessage: s.deathMessage, scoreMessage: s.scoreMessage,
      hitFlash: s.hitFlash, showDeathScreen: s.showDeathScreen, shopFade: s.shopFade,
      inShop: s.inShop, shopOverlayVisible: s.shopOverlayVisible,
      enchantmentLevels: { ...s.enchantmentLevels },
      missionProgress: { ...s.missionProgress }, missionPopup: { ...s.missionPopup },
      shopMissions: s.shopUnlockMissions.map(sm => ({ desc: sm.desc, target: sm.target, progress: s.activeMissions.find(m => m.id === sm.id)?.progress || 0, done: s.completedMissions.includes(sm.id) })),
      devValues: { acceleration: s.acceleration, friction: s.friction, bulletSpeed: s.bulletSpeed, bulletSize: s.bulletSize, fireRate: s.fireRate, bulletPierce: s.bulletPierce, multishot: s.multishot, fireshot: s.fireshot, shield: s.shield, maxLives: s.maxLives, lives: s.lives, coins: s.coins },
      mobKills: { ...s.mobKills },
      enemiesPopupVisible: s.enemiesPopupVisible,
    });
  }

  public playSound(url: string, volume?: number) {
    if (!url) return;
    const vol = volume !== undefined ? volume : this.state.sfxVolume;
    const audio = new Audio(url);
    audio.volume = vol;
    audio.play().catch(() => { });
    this.playingSounds.push({ url, audio });
    audio.addEventListener('ended', () => {
      this.playingSounds = this.playingSounds.filter(item => item.audio !== audio);
    });
  }

  public stopSound(url: string) {
    this.playingSounds.forEach(item => {
      if (item.url === url) {
        item.audio.pause();
      }
    });
    this.playingSounds = this.playingSounds.filter(item => item.url !== url);
  }

  public playRandomMusic() {
    if (this.state.currentMusic) { this.state.currentMusic.pause(); this.state.currentMusic = null; }
    const track = MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];
    const music = new Audio(track);
    music.volume = this.state.worldMusicVolume; music.loop = false;
    music.play().catch(() => { });
    music.addEventListener('ended', () => { if (!this.state.inShop && !this.state.isPaused) this.playRandomMusic(); });
    this.state.currentMusic = music;
  }

  public playShopMusic() {
    const s = this.state;
    if (!SHOP_SOUNDS.SHOP_MUSIC) return;
    if (s.currentMusic) s.currentMusic.pause();
    if (s.shopMusic) { s.shopMusic.pause(); s.shopMusic = null; }
    const music = new Audio(SHOP_SOUNDS.SHOP_MUSIC);
    music.volume = s.shopMusicVolume; music.loop = true;
    music.play().catch(() => { });
    s.shopMusic = music;
  }

  public resumeMusic() {
    const s = this.state;
    if (!s.gameStarted || s.isPaused || s.isDead) return;
    if (s.inShop) {
      if (s.shopMusic && s.shopMusic.paused) {
        s.shopMusic.play().catch(() => {});
      }
    } else {
      if (s.currentMusic && s.currentMusic.paused) {
        s.currentMusic.play().catch(() => {});
      }
    }
  }

  public setWorldMusicVolume(v: number) { this.state.worldMusicVolume = v / 100; if (this.state.currentMusic) this.state.currentMusic.volume = this.state.worldMusicVolume; this.resumeMusic(); this.emitState(); }
  public setShopMusicVolume(v: number) { this.state.shopMusicVolume = v / 100; if (this.state.shopMusic) this.state.shopMusic.volume = this.state.shopMusicVolume; this.resumeMusic(); this.emitState(); }
  public setMusicVolume(v: number) { this.setWorldMusicVolume(v); }
  public setSfxVolume(v: number) { this.state.sfxVolume = v / 100; this.emitState(); }
  public setMaxParticles(v: number) {
    this.state.maxParticles = v;
    if (v === 0) {
      this.state.particles.forEach(p => p.el.remove());
      this.state.particles = [];
    }
    this.emitState();
  }

  public updatePlayerSprite() {
    const s = this.state;
    if (s.multishot === 1) {
      if (s.fireshot > 0) {
        const frames = PLAYER_MULTISHOT_FIRE_ANIMS[1];
        this.playerEl.src = frames[s.playerAnimFrame % frames.length];
      } else {
        this.playerEl.src = PLAYER_SPRITES[1];
      }
      this.playerEl.style.width = '69px';
      this.playerEl.style.height = '72px';
      s.centerOffsetX = 34.5;
      s.centerOffsetY = 36;
    } else if (s.multishot > 1) {
      const level = Math.min(s.multishot, 3);
      if (s.fireshot > 0) {
        const frames = PLAYER_MULTISHOT_FIRE_ANIMS[level] || PLAYER_MULTISHOT_FIRE_ANIMS[2];
        this.playerEl.src = frames[s.playerAnimFrame % frames.length];
      } else {
        this.playerEl.src = PLAYER_SPRITES[level];
      }
      this.playerEl.style.width = '72px';
      this.playerEl.style.height = '72px';
      s.centerOffsetX = 36;
      s.centerOffsetY = 36;
    } else {
      if (s.fireshot > 0) {
        this.playerEl.src = PLAYER_ANIMS[s.playerAnimFrame % PLAYER_ANIMS.length];
        this.playerEl.style.width = '72px';
        this.playerEl.style.height = '42px';
        s.centerOffsetX = 36;
        s.centerOffsetY = 21;
      } else {
        this.playerEl.src = PLAYER_SPRITES[0];
        this.playerEl.style.width = '72px';
        this.playerEl.style.height = '42px';
        s.centerOffsetX = 36;
        s.centerOffsetY = 21;
      }
    }
  }

  public clearShieldElements() { this.state.shieldBullets.forEach(sb => sb.el.remove()); this.state.shieldBullets = []; }

  public rebuildShieldSystem() {
    const s = this.state; this.clearShieldElements(); if (s.shield <= 0) return;
    let count, hits; if (s.shield <= 5) { count = 3 + s.shield; hits = 2 + s.shield; } else { count = 4 + s.shield; hits = 4 + s.shield; }
    const baseSize = (s.fireshot > 0) ? Math.max(s.bulletSize * 1.5, 32) : s.bulletSize;
    for (let i = 0; i < count; i++) {
      const offsetAngle = (i * Math.PI * 2) / count;
      const el = document.createElement('img');
      el.src = (s.fireshot > 0) ? BULLET_ANIMS[0] : DEFAULT_BULLET_SPRITE;
      el.style.cssText = `width:${baseSize}px;position:absolute;transform-origin:center;opacity:1;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:9998;`;
      this.container.appendChild(el);
      s.shieldBullets.push({ el, ring: 'inner', offset: offsetAngle, maxPierce: hits, pierceLeft: hits, hitEnemies: [], animTimer: 0, animFrame: 0, spinDir: 1, size: baseSize });
    }
    if (s.shield >= 6) {
      const outerSize = baseSize * 1.5;
      for (let i = 0; i < count; i++) {
        const offsetAngle = (i * Math.PI * 2) / count;
        const el = document.createElement('img');
        el.src = (s.fireshot > 0) ? BULLET_ANIMS[0] : DEFAULT_BULLET_SPRITE;
        el.style.cssText = `width:${outerSize}px;position:absolute;transform-origin:center;opacity:1;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:9998;`;
        this.container.appendChild(el);
        s.shieldBullets.push({ el, ring: 'outer', offset: offsetAngle, maxPierce: hits, pierceLeft: hits, hitEnemies: [], animTimer: 0, animFrame: 0, spinDir: -1, size: outerSize });
      }
    }
  }

  public isCollision(ax: number, ay: number, aSize: number, bx: number, by: number, bSize: number) {
    const halfA = aSize / 2, halfB = bSize / 2;
    return ax + halfA > bx - halfB && ax - halfA < bx + halfB && ay + halfA > by - halfB && ay - halfA < by + halfB;
  }

  public getSpawnScreenWidth() { return window.innerWidth * this.state.screenScale; }
  public getSpawnScreenHeight() { return window.innerHeight * this.state.screenScale; }

  public applyScreenScale() {
    const scale = this.state.screenScale;
    this.container.style.width = (window.innerWidth * scale) + 'px';
    this.container.style.height = (window.innerHeight * scale) + 'px';
    this.container.style.left = (-(scale - 1) * window.innerWidth / 2) + 'px';
    this.container.style.top = (-(scale - 1) * window.innerHeight / 2) + 'px';
    this.container.style.transform = `scale(${1 / scale})`;
    this.container.style.transformOrigin = 'center center';
  }

  public isOnScreen(x: number, y: number, padding = 80) {
    const s = this.state;
    return x >= s.cameraX - padding && x <= s.cameraX + this.getSpawnScreenWidth() + padding && y >= s.cameraY - padding && y <= s.cameraY + this.getSpawnScreenHeight() + padding;
  }

  public getCurrentShopMission() {
    const s = this.state;
    for (const sm of s.shopUnlockMissions) {
      if (s.completedMissions.includes(sm.id)) continue;
      const mission = s.activeMissions.find(m => m.id === sm.id);
      if (mission) return mission;
    }
    return null;
  }

  public getStatValues() {
    const s = this.state;
    return { acceleration: s.acceleration, bulletSpeed: s.bulletSpeed, bulletSize: s.bulletSize, fireRate: s.fireRate, bulletPierce: s.bulletPierce, multishot: s.multishot, fireshot: s.fireshot, shield: s.shield, maxLives: s.maxLives, lives: s.lives };
  }

  public isEnchantmentMaxed(id: string) { return isEnchantmentMaxedForValues(id, this.getStatValues(), this.state.enchantmentLevels); }

  public playMobSound(url: string, x: number, y: number, size?: number, volFactor?: number) {
    if (this.isOnScreen(x, y, Math.max(80, size || 0))) {
      const vol = (volFactor !== undefined) ? this.state.sfxVolume * volFactor : this.state.sfxVolume;
      this.playSound(url, vol);
    }
  }

  public shootBullet() {
    const s = this.state; const now = performance.now(); if (now - s.lastShot < s.fireDelay) return; s.lastShot = now; this.playSound(SOUNDS.SHOOT);
    const px = s.x + s.centerOffsetX, py = s.y + s.centerOffsetY;
    const worldMouseX = s.mouseX + s.cameraX, worldMouseY = s.mouseY + s.cameraY;
    const dx = worldMouseX - px, dy = worldMouseY - py; const baseAng = Math.atan2(dy, dx);
    const totalBullets = 1 + (s.multishot * 2); this.triggerMissionEvent('shoot', totalBullets);
    const angleStep = Math.PI / 12; // 15 degrees, completely equal angles apart for all levels of multishot
    const startAngle = baseAng - ((totalBullets - 1) * angleStep) / 2;
    const dynamicSpawnSize = (s.fireshot > 0) ? Math.max(s.bulletSize * 1.5, 32) : s.bulletSize;
    for (let i = 0; i < totalBullets; i++) {
      const currentAng = startAngle + (angleStep * i);
      const muzzleDistance = Math.max(8, PLAYER_MUZZLE_DISTANCE - (dynamicSpawnSize * 0.15));
      const sx = px + Math.cos(currentAng) * muzzleDistance, sy = py + Math.sin(currentAng) * muzzleDistance;
      const el = document.createElement('img'); el.src = (s.fireshot > 0) ? BULLET_ANIMS[0] : DEFAULT_BULLET_SPRITE;
      el.style.cssText = `width:${dynamicSpawnSize}px;height:${dynamicSpawnSize}px;object-fit:contain;position:absolute;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:9998;`;
      el.style.left = (sx - (dynamicSpawnSize / 2) - s.cameraX) + 'px'; el.style.top = (sy - (dynamicSpawnSize / 2) - s.cameraY) + 'px'; el.style.transform = `rotate(${currentAng}rad)`;
      this.container.appendChild(el);
      s.bullets.push({ id: Math.random().toString(36).substr(2, 9), x: sx, y: sy, vx: Math.cos(currentAng) * s.bulletSpeed, vy: Math.sin(currentAng) * s.bulletSpeed, el, angle: currentAng, pierceLeft: s.bulletPierce, hitEnemies: [], animTimer: 0, animFrame: 0, isFireSplit: false, sessionKills: 0 });
    }
  }

  public triggerFireshotSplit(enemyX: number, enemyY: number, enemySize: number) {
    const s = this.state; if (s.fireshot <= 0) return;
    if (s.bullets.length >= 60) return;
    this.triggerMissionEvent('fireshot_split', s.fireshot);
    const px = s.x + s.centerOffsetX, py = s.y + s.centerOffsetY;
    const baseAwayAngle = Math.atan2(enemyY - py, enemyX - px);
    const fireBulletSize = Math.max(s.bulletSize * 1.5, 32);
    const splitCount = Math.min(s.fireshot, 3);
    for (let i = 0; i < splitCount; i++) {
      const randomAngleOffset = (Math.random() * Math.PI) - (Math.PI / 2); const splitAngle = baseAwayAngle + randomAngleOffset;
      const spawnKickbackRadius = (enemySize / 2) + (fireBulletSize / 2) + 5;
      const spawnX = enemyX + Math.cos(splitAngle) * spawnKickbackRadius, spawnY = enemyY + Math.sin(splitAngle) * spawnKickbackRadius;
      const el = document.createElement('img'); el.src = BULLET_ANIMS[0];
      el.style.cssText = `width:${fireBulletSize}px;position:absolute;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:9998;`;
      el.style.left = (spawnX - (fireBulletSize / 2) - s.cameraX) + 'px'; el.style.top = (spawnY - (fireBulletSize / 2) - s.cameraY) + 'px'; el.style.transform = `rotate(${splitAngle}rad)`;
      this.container.appendChild(el);
      s.bullets.push({ id: Math.random().toString(36).substr(2, 9), x: spawnX, y: spawnY, vx: Math.cos(splitAngle) * s.bulletSpeed, vy: Math.sin(splitAngle) * s.bulletSpeed, el, angle: splitAngle, pierceLeft: Math.min(s.bulletPierce, 2), hitEnemies: [], animTimer: 0, animFrame: 0, isFireSplit: true, sessionKills: 0 });
    }
  }

  public getEnemyType(): EnemyType {
    const s = this.state; const elapsedMs = s.activePlaytime * 0.5 * 1.6; const elapsedSec = elapsedMs / 1000;
    const available = ENEMY_TYPES.filter(e => elapsedMs >= e.unlock); let totalWeight = 0;
    const weightedList = available.map(e => {
      let growthFactor = 1; if (elapsedMs > e.unlock) { const timeSinceUnlock = (elapsedMs - e.unlock) / 1000; growthFactor = 1 + (timeSinceUnlock * e.weightGrowth / 100); }
      if (e.name === 'Fast Mob' && elapsedSec > 40) growthFactor *= 2.5;
      if (e.name === 'Magic Mob' && elapsedSec > 40) growthFactor *= 3;
      if (e.name === 'Beefy Mob' && elapsedSec > 120) growthFactor *= 2;
      if (e.name === 'Shooter Mob' && elapsedSec > 95) growthFactor *= 1.4;
      if (e.name === 'Armored Mob') {
        const timeSinceUnlock = (elapsedMs - e.unlock) / 1000;
        const progress = Math.min(1, Math.max(0, timeSinceUnlock / 90)); // Ramps faster over 1.5 mins
        const rampScale = 0.3 + progress * 0.7; // Starts at 30%, ramps up to 100%
        growthFactor *= rampScale;
      }
      if (e.name === 'Mimic Mob' && elapsedSec > 130) growthFactor *= 1.25;
      const finalWeight = e.weight * growthFactor; totalWeight += finalWeight; return { ...e, finalWeight };
    });
    if (elapsedSec >= 20 && elapsedSec < 40) {
      const basic = weightedList.find(e => e.name === 'Basic Mob');
      const fast = weightedList.find(e => e.name === 'Fast Mob');
      const tank = weightedList.find(e => e.name === 'Big Mob');
      if (basic && fast && tank) { basic.finalWeight = 50; fast.finalWeight = 25; tank.finalWeight = 25; totalWeight = 100; }
    }
    if (s.shopVisits >= 4 && s.shopVisits <= 7) {
      const basic = weightedList.find(e => e.name === 'Basic Mob');
      const big = weightedList.find(e => e.name === 'Big Mob');
      if (basic) basic.finalWeight *= 2; if (big) big.finalWeight *= 2; totalWeight = weightedList.reduce((sum, e) => sum + e.finalWeight, 0);
    }
    let r = Math.random() * totalWeight; for (const e of weightedList) { r -= e.finalWeight; if (r <= 0) return e; } return weightedList[0];
  }

  public getSpawnInterval() {
    const elapsedSec = (this.state.activePlaytime * 0.5 * 1.6) / 1000; let baseRate;
    if (elapsedSec < 60) { baseRate = 2500 - (elapsedSec / 60) * 500; }
    else if (elapsedSec < 90) { const t = (elapsedSec - 60) / 30; baseRate = 2000 - t * 1200; }
    else if (elapsedSec < 120) { const t = (elapsedSec - 90) / 30; baseRate = 800 - t * 400; }
    else { baseRate = Math.max(150, 400 - (elapsedSec - 120) * 1.2); }
    const variance = baseRate * 0.2 * (Math.random() * 2 - 1);
    let interval = Math.max(150, (baseRate + variance) / Math.sqrt(this.state.screenScale));
    if (this.state.shopVisits >= 4) { interval = Math.max(75, interval / 2); }
    return interval;
  }

  public doSpawn() {
    const s = this.state;
    const totalEnemies = s.enemies.length;
    const onScreenEnemies = s.enemies.filter(e => !e.isUnloaded).length;
    if (totalEnemies >= 55 || onScreenEnemies >= 35) {
      return; // Skip spawning to limit loaded mobs and prevent lag
    }
    const side = Math.floor(Math.random() * 4); let ex = 0, ey = 0;
    const spawnWidth = this.getSpawnScreenWidth(), spawnHeight = this.getSpawnScreenHeight();
    const camLeft = s.x - spawnWidth / 2, camRight = s.x + spawnWidth / 2;
    const camTop = s.y - spawnHeight / 2, camBottom = s.y + spawnHeight / 2;
    if (side === 0) { ex = camLeft - 100; ey = camTop + Math.random() * spawnHeight; }
    if (side === 1) { ex = camRight+ 100; ey = camTop + Math.random() * spawnHeight; }
    if (side === 2) { ex = camLeft + Math.random() * spawnWidth; ey = camTop - 100; }
    if (side === 3) { ex = camLeft + Math.random() * spawnWidth; ey = camBottom + 100; }
    const type = this.getEnemyType();
    s.enemies.push(this.createEnemy(type, ex, ey));
  }

  public createEnemy(type: EnemyType, x: number, y: number): Enemy {
    const enemy: Enemy = {
      x, y, vx: 0, vy: 0, el: null, type,
      health: this.getEnemySpawnHealth(type),
      lastShot: 0,
      nextShotAt: Date.now() + this.getEnemyInitialShotDelay(type),
      hasSplit: false, isClone: false, originalId: null,
      id: Math.random().toString(36).substr(2, 9), isUnloaded: true,
      shieldBullets: [], activeShieldSignature: '', animTimer: 0, animFrame: 0
    };
    if (type.name === 'Magic Mob') {
      enemy.shootInterval = 1800 + Math.random() * 2200; // Slowed and matched with clones
    }
    if (type.canHaveShield) enemy.shieldLevel = Math.random() < 0.75 ? 1 + Math.floor(Math.random() * 4) : 0;
    if (type.canHaveMultishot) enemy.multishotLevel = Math.random() < 0.5 ? 1 : 0;
    
    // Only create DOM elements if spawned on screen
    if (this.isOnScreen(x, y, 200)) {
      enemy.isUnloaded = false;
      enemy.el = this.createEnemyElement(enemy);
      this.syncEnemyShieldSystem(enemy);
    }
    return enemy;
  }

  public createEnemyElement(enemy: Enemy) {
    const el = document.createElement('img'); el.src = this.getEnemySprite(enemy);
    const size = this.getEnemySize(enemy);
    el.style.cssText = `width:${size}px;position:absolute;transform-origin:center;visibility:visible;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:600;`;
    el.style.left = (enemy.x - this.state.cameraX) + 'px'; el.style.top = (enemy.y - this.state.cameraY) + 'px';
    this.container.appendChild(el);
    return el;
  }

  public getEnemySpawnHealth(type: EnemyType) { return type.health === 'player' ? Math.max(1, this.state.maxLives) : type.health; }
  public getEnemySize(enemy: Enemy) { return enemy.type.size === 'player' ? 72 : enemy.type.size; }
  public getMimicSprite() { const s = this.state; if (s.multishot > 0) return PLAYER_SPRITES[Math.min(Math.floor(s.multishot), 3)]; return s.fireshot > 0 ? PLAYER_ANIMS[s.playerAnimFrame] : PLAYER_SPRITES[0]; }
  public getEnemySprite(enemy: Enemy) { if (enemy.type.isBomber) return BOMBER_SPRITES[enemy.animFrame || 0]; if (enemy.type.isMimic) return this.getMimicSprite(); return enemy.type.sprite; }
  public getEnemySpeed(enemy: Enemy) { return enemy.type.speed === 'player' ? Math.max(2, this.state.acceleration * 5) : enemy.type.speed; }
  public getEnemyFireRate(enemy: Enemy) {
    if (enemy.type.isMimic) {
      const baseRate = enemy.type.fireRate === 'player' ? this.state.fireRate : enemy.type.fireRate;
      return baseRate * 0.45;
    }
    return enemy.type.fireRate === 'player' ? this.state.fireRate : enemy.type.fireRate;
  }
  public getEnemyBulletSpeed(enemy: Enemy) { if (enemy.type.isMimic) return this.state.bulletSpeed; if (enemy.type.shooterPattern === 'parallel') return 6; if (enemy.type.shooterPattern === 'spread') return 4.8; return 4; }
  public getEnemyBulletSize(enemy: Enemy) { if (enemy.type.isMimic) return this.state.fireshot > 0 ? Math.max(this.state.bulletSize * 1.5, 32) : this.state.bulletSize; if (enemy.type.shooterPattern === 'parallel') return 18; return 20; }
  public getEnemyBulletSprite(enemy: Enemy) { if (enemy.type.isMimic) return this.state.fireshot > 0 ? BULLET_ANIMS[0] : DEFAULT_BULLET_SPRITE; return enemy.type.bullet || MAGIC_BULLET_SPRITE; }
  public getEnemyFireshot(enemy: Enemy) { return enemy.type.isMimic ? Math.floor(this.state.fireshot) : 0; }
  public getEnemyMultishot(enemy: Enemy) { return enemy.type.isMimic ? Math.floor(this.state.multishot) : (enemy.multishotLevel || 0); }
  public getEnemyShieldLevel(enemy: Enemy) { return enemy.type.isMimic ? Math.floor(this.state.shield) : (enemy.shieldLevel || 0); }
  public getEnemyInitialShotDelay(type: EnemyType) { if (!type.isShooter) return 0; const rate = type.fireRate === 'player' ? this.state.fireRate : type.fireRate; return (1000 / Math.max(1, rate)) * (0.6 + Math.random() * 1.8); }

  public clearEnemyShieldElements(enemy: Enemy) { if (!enemy.shieldBullets) return; enemy.shieldBullets.forEach(sb => { if (sb.el) sb.el.remove(); }); enemy.shieldBullets = []; enemy.activeShieldSignature = ''; }

  public syncEnemyShieldSystem(enemy: Enemy) {
    const level = this.getEnemyShieldLevel(enemy);
    const fireshot = this.getEnemyFireshot(enemy);
    const baseSize = fireshot > 0 ? Math.max(this.state.bulletSize * 1.5, 32) : this.getEnemyBulletSize(enemy);
    const signature = `${level}:${fireshot}:${Math.round(baseSize)}`;
    if (level <= 0 || enemy.isUnloaded) { this.clearEnemyShieldElements(enemy); return; }
    if (enemy.activeShieldSignature === signature && enemy.shieldBullets && enemy.shieldBullets.length > 0) return;
    this.clearEnemyShieldElements(enemy);
    let count, hits; if (level <= 5) { count = 3 + level; hits = 2 + level; } else { count = 4 + level; hits = 4 + level; }
    const makeShield = (ring: "inner" | "outer", size: number, spinDir: number) => {
      for (let i = 0; i < count; i++) {
        const offsetAngle = (i * Math.PI * 2) / count;
        const el = document.createElement('img'); el.src = fireshot > 0 ? BULLET_ANIMS[0] : this.getEnemyBulletSprite(enemy);
        el.style.cssText = `width:${size}px;position:absolute;transform-origin:center;opacity:1;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:9997;`;
        this.container.appendChild(el);
        enemy.shieldBullets.push({ el, ring, offset: offsetAngle, maxPierce: hits, pierceLeft: hits, hitProjectiles: [], animTimer: 0, animFrame: 0, spinDir, size, worldX: enemy.x, worldY: enemy.y });
      }
    };
    makeShield('inner', baseSize, 1);
    if (level >= 6) makeShield('outer', baseSize * 1.5, -1);
    enemy.activeShieldSignature = signature;
  }

  public damageEnemyShield(enemy: Enemy, x: number, y: number, size: number, projectileId: string) {
    if (!enemy.shieldBullets || enemy.shieldBullets.length === 0) return false;
    for (let i = enemy.shieldBullets.length - 1; i >= 0; i--) {
      const sb = enemy.shieldBullets[i];
      if (projectileId && sb.hitProjectiles.includes(projectileId)) continue;
      if (this.isCollision(x, y, size, sb.worldX, sb.worldY, sb.size)) {
        if (projectileId) sb.hitProjectiles.push(projectileId);
        sb.pierceLeft--;
        if (sb.el) sb.el.style.opacity = Math.max(0, sb.pierceLeft / sb.maxPierce).toString();
        if (sb.pierceLeft <= 0) { if (sb.el) sb.el.remove(); enemy.shieldBullets.splice(i, 1); if (enemy.shieldBullets.length === 0) enemy.activeShieldSignature = ''; }
        return true;
      }
    }
    return false;
  }

  public updateEnemyShields(enemy: Enemy, dt: number, px: number, py: number) {
    if (enemy.isUnloaded) return;
    this.syncEnemyShieldSystem(enemy);
    if (!enemy.shieldBullets || enemy.shieldBullets.length === 0) return;
    const orbitSpeed = 0.03;
    const fireshot = this.getEnemyFireshot(enemy);
    // FIXED: Centre shields correctly using enemy's centre instead of top-left!
    const eSize = this.getEnemySize(enemy);
    const cx = enemy.x + eSize / 2;
    const cy = enemy.y + eSize / 2;

    for (let i = enemy.shieldBullets.length - 1; i >= 0; i--) {
      const sb = enemy.shieldBullets[i]; sb.offset += orbitSpeed * sb.spinDir;
      const orbitRadius = sb.ring === 'inner' ? 75 : 135;
      sb.worldX = cx + Math.cos(sb.offset) * orbitRadius;
      sb.worldY = cy + Math.sin(sb.offset) * orbitRadius;
      if (fireshot > 0) { sb.animTimer += dt; if (sb.animTimer >= 200) { sb.animTimer = 0; sb.animFrame = (sb.animFrame + 1) % BULLET_ANIMS.length; if (sb.el) sb.el.src = BULLET_ANIMS[sb.animFrame]; } }
      if (sb.el) { sb.el.style.left = (sb.worldX - (sb.size / 2) - this.state.cameraX) + 'px'; sb.el.style.top = (sb.worldY - (sb.size / 2) - this.state.cameraY) + 'px'; const bulletFacingAngle = sb.spinDir === 1 ? sb.offset + Math.PI / 2 : sb.offset - Math.PI / 2; sb.el.style.transform = `rotate(${bulletFacingAngle}rad)`; }
      if (this.isCollision(px, py, PLAYER_HITBOX_SIZE, sb.worldX, sb.worldY, sb.size)) { this.takeDamage(`${enemy.type.name} Shield`); sb.pierceLeft--; if (sb.el) sb.el.style.opacity = Math.max(0, sb.pierceLeft / sb.maxPierce).toString(); if (sb.pierceLeft <= 0) { if (sb.el) sb.el.remove(); enemy.shieldBullets.splice(i, 1); } }
    }
  }

  public createEnemyBullet(x: number, y: number, angle: number, enemy: Enemy, options: any = {}) {
    const size = options.size || this.getEnemyBulletSize(enemy);
    const speed = options.speed || this.getEnemyBulletSpeed(enemy);
    const sprite = options.sprite || this.getEnemyBulletSprite(enemy);
    const el = document.createElement('img'); el.src = sprite;
    // Lower z-layer: 400, which is below enemy elements (z-index: 600)
    el.style.cssText = `width:${size}px;position:absolute;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:400;`;
    el.style.left = (x - (size / 2) - this.state.cameraX) + 'px'; el.style.top = (y - (size / 2) - this.state.cameraY) + 'px'; el.style.transform = `rotate(${angle}rad)`;
    this.container.appendChild(el);
    
    const isShooterBullet = enemy.type.isShooter || enemy.type.name === 'Magic Mob';
    const isMimicFireshot = enemy.type.isMimic && this.getEnemyFireshot(enemy) > 0;
    const spinAngle = (isShooterBullet && !isMimicFireshot) ? Math.random() * Math.PI * 2 : undefined;
    const spinSpeed = (isShooterBullet && !isMimicFireshot) ? (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * 0.004) : undefined;

    this.state.enemyBullets.push({ 
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, el, size, angle, 
      source: enemy.type.name, animTimer: 0, animFrame: 0, 
      animFrames: options.animFrames || null,
      spinAngle, spinSpeed
    });
  }

  public shootEnemySpread(enemy: Enemy, baseAng: number) {
    // Symmetrical spread bullet spawning from enemy's centre
    const eSize = this.getEnemySize(enemy);
    const cx = enemy.x + eSize / 2;
    const cy = enemy.y + eSize / 2;

    const multishot = this.getEnemyMultishot(enemy);
    const totalBullets = 1 + (multishot * 2);
    const angleStep = Math.PI / 12; // 15 degrees, completely equal angles apart for all levels of multishot
    const startAngle = baseAng - ((totalBullets - 1) * angleStep) / 2;
    const muzzleDistance = Math.max(10, eSize * 0.25);
    
    // Apply a single random offset to the whole spray so they stay symmetrical
    const spreadOffset = (Math.random() * 0.08 - 0.04);

    for (let i = 0; i < totalBullets; i++) {
      const ang = startAngle + (angleStep * i) + spreadOffset;
      const sx = cx + Math.cos(ang) * muzzleDistance;
      const sy = cy + Math.sin(ang) * muzzleDistance;
      this.createEnemyBullet(sx, sy, ang, enemy, { animFrames: this.getEnemyFireshot(enemy) > 0 ? BULLET_ANIMS : null });
    }
  }

  public shootEnemyParallel(enemy: Enemy, baseAng: number) {
    // Symmetrical parallel bullet spawning from enemy's centre
    const eSize = this.getEnemySize(enemy);
    const cx = enemy.x + eSize / 2;
    const cy = enemy.y + eSize / 2;

    const perp = baseAng + Math.PI / 2;
    const muzzleDistance = Math.max(12, eSize * 0.25);
    // Rows closer together (reduced offset from 13 to 10 for a tighter, cleaner symmetric alignment)
    const rowOffset = 10; 
    
    // Symmetrical shooting logic: Use the exact same base angle offset for both sides
    // Perfectly parallel: no random angle offset
    const finalAngle = baseAng;

    for (const side of [-1, 1]) {
      const sx = cx + Math.cos(finalAngle) * muzzleDistance + Math.cos(perp) * rowOffset * side;
      const sy = cy + Math.sin(finalAngle) * muzzleDistance + Math.sin(perp) * rowOffset * side;
      this.createEnemyBullet(sx, sy, finalAngle, enemy);
    }
  }

  public updateEnemyShooting(enemy: Enemy) {
    if (!enemy.type.isShooter || enemy.cloneAnimating) return;
    const now = Date.now(); if (now < enemy.nextShotAt) return;
    const rate = Math.max(0.1, this.getEnemyFireRate(enemy));
    const baseDelay = 1000 / rate;
    
    const eSize = this.getEnemySize(enemy);
    const ecx = enemy.x + eSize / 2;
    const ecy = enemy.y + eSize / 2;
    const pcx = this.state.x + this.state.centerOffsetX;
    const pcy = this.state.y + this.state.centerOffsetY;
    const baseAng = Math.atan2(pcy - ecy, pcx - ecx);
    
    let chance = 0.65, delayScale = 0.8 + Math.random() * 1.2;

    if (enemy.type.name === 'Armored Mob') {
      // FIXED: Increased armed mob's shot rate and accuracy significantly
      chance = 0.85;
      delayScale = 0.4 + Math.random() * 0.6;
    }
    if (enemy.type.name === 'Shooter Mob') { chance = 0.9; delayScale = 0.75 + Math.random() * 0.6; }
    if (enemy.type.isMimic) { chance = 0.72; delayScale = 0.85 + Math.random() * 1.1; }
    if (Math.random() < chance) {
      let soundUrl = SOUNDS.SHOOT_SHOOTER;
      if (enemy.type.name === 'Armored Mob') {
        soundUrl = SOUNDS.SHOOT_ARMORED;
      } else if (enemy.type.isMimic) {
        soundUrl = SOUNDS.SHOOT_MIMIC;
      } else if (enemy.type.name === 'Shooter Mob') {
        soundUrl = SOUNDS.SHOOT_SHOOTER;
      }
      this.playMobSound(soundUrl, enemy.x, enemy.y, this.getEnemySize(enemy));

      if (enemy.type.shooterPattern === 'parallel') this.shootEnemyParallel(enemy, baseAng);
      else this.shootEnemySpread(enemy, baseAng);
    }
    enemy.nextShotAt = now + baseDelay * delayScale;
  }

  public startExplosion(x: number, y: number) {
    const size = BOMBER_EXPLOSION_RADIUS * 2;
    const el = document.createElement('img');
    el.referrerPolicy = "no-referrer";
    if (this._explosionFrameCache && this._explosionFrameCache[0]) {
      el.src = this._explosionFrameCache[0].src;
    } else {
      el.src = BOMBER_EXPLOSION_FRAMES[0];
    }
    el.style.cssText = `width:${size}px;height:${size}px;position:absolute;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:10002;`;
    el.style.left = (x - size / 2 - this.state.cameraX) + 'px'; el.style.top = (y - size / 2 - this.state.cameraY) + 'px';
    this.container.appendChild(el);
    this.state.explosions.push({ x, y, size, el, frame: 0, startTime: Date.now() });
  }

  public updateExplosions() {
    const s = this.state;
    const now = Date.now();
    for (let i = s.explosions.length - 1; i >= 0; i--) {
      const ex = s.explosions[i];
      const elapsed = now - ex.startTime;
      const frame = Math.floor(elapsed / BOMBER_EXPLOSION_FRAME_TIME);
      if (frame >= BOMBER_EXPLOSION_FRAMES.length) {
        ex.el.remove();
        s.explosions.splice(i, 1);
        continue;
      }
      if (ex.frame !== frame) {
        ex.frame = frame;
        if (this._explosionFrameCache && this._explosionFrameCache[frame]) {
          ex.el.src = this._explosionFrameCache[frame].src;
        } else {
          ex.el.src = BOMBER_EXPLOSION_FRAMES[frame];
        }
      }
      ex.el.style.left = (ex.x - ex.size / 2 - s.cameraX) + 'px';
      ex.el.style.top = (ex.y - ex.size / 2 - s.cameraY) + 'px';
    }
  }

  public spawnPlayerParticle() {
    const s = this.state;
    if (s.particles.length >= s.maxParticles) return;
    const size = 5 + Math.random() * 8;
    const el = document.createElement('img');
    el.src = "https://codehs.com/uploads/28fa6fa755aabb395f685d97bd917e86";
    const px = s.x + s.centerOffsetX;
    const py = s.y + s.centerOffsetY;
    const x = px + (Math.random() - 0.5) * 16 - (s.vx * 1.5);
    const y = py + (Math.random() - 0.5) * 16 - (s.vy * 1.5);
    el.style.cssText = `width:${size}px;height:${size}px;position:absolute;left:0;top:0;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:300;opacity:0.95;`;
    const tx = x - size / 2 - s.cameraX;
    const ty = y - size / 2 - s.cameraY;
    el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    this.container.appendChild(el);
    s.particles.push({ x, y, size, el, startTime: Date.now(), duration: 500, isFireshot: false });
  }

  public spawnBulletParticle(bx: number, by: number) {
    const s = this.state;
    if (s.particles.length >= s.maxParticles) return;
    const size = 12 + Math.random() * 12;
    const el = document.createElement('img');
    el.src = "https://codehs.com/uploads/28fa6fa755aabb395f685d97bd917e86";
    el.style.cssText = `width:${size}px;height:${size}px;position:absolute;left:0;top:0;transform-origin:center;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:300;opacity:0.9;filter:brightness(0.35) saturate(1.8);`;
    const tx = bx - size / 2 - s.cameraX;
    const ty = by - size / 2 - s.cameraY;
    el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    this.container.appendChild(el);
    s.particles.push({ x: bx, y: by, size, el, startTime: Date.now(), duration: 500, isFireshot: true });
  }

  public updateParticles() {
    const s = this.state;
    const now = Date.now();
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      const elapsed = now - p.startTime;
      if (elapsed >= p.duration) {
        p.el.remove();
        s.particles.splice(i, 1);
        continue;
      }
      const ratio = elapsed / p.duration;
      const opacity = Math.max(0, 0.95 * (1 - ratio));
      p.el.style.opacity = opacity.toString();
      const scale = 1 - ratio * 0.3;
      const tx = p.x - p.size / 2 - s.cameraX;
      const ty = p.y - p.size / 2 - s.cameraY;
      p.el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    }
  }

  public explodeBomber(enemy: Enemy) {
    const s = this.state;
    this.stopSound(SOUNDS.BOMBER_FUSE);
    this.playSound(SOUNDS.BOMBER_EXPLODE, s.sfxVolume * 1.4);

    // FIXED: Find index and completely remove from active simulation array FIRST
    const idx = s.enemies.indexOf(enemy);
    if (idx !== -1) {
      s.enemies.splice(idx, 1);
    }
    if (enemy.el) {
      enemy.el.remove();
    }
    this.clearEnemyShieldElements(enemy);

    // Trigger visual explosion at central position
    const eSize = this.getEnemySize(enemy);
    const ex = enemy.x + eSize / 2;
    const ey = enemy.y + eSize / 2;
    this.startExplosion(ex, ey);

    const px = s.x + s.centerOffsetX;
    const py = s.y + s.centerOffsetY;
    const playerDist = Math.hypot(px - ex, py - ey);
    if (playerDist <= BOMBER_EXPLOSION_RADIUS * 0.85) {
      this.takeDamage('Bomber Explosion');
    }

    // Damage all other enemies within explosion radius
    const victims = s.enemies.filter(e => {
      const size = this.getEnemySize(e);
      const cx = e.x + size / 2;
      const cy = e.y + size / 2;
      return Math.hypot(cx - ex, cy - ey) <= BOMBER_EXPLOSION_RADIUS * 0.85;
    });

    victims.forEach(victim => {
      const vIdx = s.enemies.indexOf(victim);
      if (vIdx !== -1) {
        this._killEnemy(victim, vIdx, 'explosion');
      }
    });

    // Destroy all player bullets in blast radius
    for (let i = s.bullets.length - 1; i >= 0; i--) {
      const b = s.bullets[i];
      const dist = Math.hypot(b.x - ex, b.y - ey);
      if (dist <= BOMBER_EXPLOSION_RADIUS * 0.85) {
        if (b.el) b.el.remove();
        s.bullets.splice(i, 1);
      }
    }

    // Destroy all enemy bullets in blast radius
    for (let i = s.enemyBullets.length - 1; i >= 0; i--) {
      const eb = s.enemyBullets[i];
      const dist = Math.hypot(eb.x - ex, eb.y - ey);
      if (dist <= BOMBER_EXPLOSION_RADIUS * 0.85) {
        if (eb.el) eb.el.remove();
        s.enemyBullets.splice(i, 1);
      }
    }
  }

  public spawnMagicClones(originalEnemy: Enemy) {
    const s = this.state; const eSize = this.getEnemySize(originalEnemy); this.playMobSound(SOUNDS.MAGIC_CLONE, originalEnemy.x, originalEnemy.y, eSize);
    const cloneAngles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3]; const spawnTime = Date.now();
    cloneAngles.forEach(angle => {
      const cloneEl = document.createElement('img'); cloneEl.src = originalEnemy.type.sprite;
      cloneEl.style.cssText = `width:${eSize}px;position:absolute;transform-origin:center;visibility:visible;pointer-events:none;user-select:none;-webkit-user-drag:none;z-index:600;`;
      this.container.appendChild(cloneEl);
      s.enemies.push({
        x: originalEnemy.x, y: originalEnemy.y, vx: 0, vy: 0, el: cloneEl, type: originalEnemy.type,
        health: 7, // FIXED: Clones also get 7 health!
        lastShot: Date.now() + Math.random() * 2000,
        nextShotAt: Date.now() + 1000,
        shootInterval: 1800 + Math.random() * 2200, // FIXED: Deceased shoot rate and matched with original
        hasSplit: false,
        isClone: true, originalId: originalEnemy.el, cloneAngle: angle, cloneStartX: originalEnemy.x, cloneStartY: originalEnemy.y, cloneSpawnTime: spawnTime, cloneAnimating: true, id: Math.random().toString(36).substr(2, 9), isUnloaded: false, shieldBullets: [], activeShieldSignature: '', animTimer: 0, animFrame: 0
      });
    });
  }

  public damageMagicClones(originalEnemy: Enemy) {
    const s = this.state;
    s.enemies.forEach(clone => {
      if (clone.isClone && clone.originalId === originalEnemy.el) {
        clone.health -= 1;
        clone.lastDamageTime = Date.now();
      }
    });
  }

  public shootMagicBullet(enemy: Enemy) {
    const s = this.state; this.playMobSound(SOUNDS.MAGIC_SHOOT, enemy.x, enemy.y, this.getEnemySize(enemy));
    const ang = Math.atan2(s.y - enemy.y, s.x - enemy.x); const bSize = 20, bSpeed = 4;
    // FIXED: Spawns from center instead of top-left!
    const eSize = this.getEnemySize(enemy);
    const bx = enemy.x + eSize / 2;
    const by = enemy.y + eSize / 2;
    this.createEnemyBullet(bx, by, ang, enemy, { size: bSize, speed: bSpeed, sprite: MAGIC_BULLET_SPRITE });
  }

  public triggerHitFlash() { this.state.hitFlash = true; this.emitState(); clearTimeout(this.hitFlashTimeout); this.hitFlashTimeout = setTimeout(() => { this.state.hitFlash = false; this.emitState(); }, 200); }

  public takeDamage(cause: string) {
    const s = this.state; const now = Date.now();
    if (now - s.lastHitTime < HIT_COOLDOWN || s.isDead) return;
    if (s.shopEntranceActive && s.shopEntranceEl) { const px = s.x + s.centerOffsetX, py = s.y + s.centerOffsetY; if (this.isCollision(px, py, PLAYER_HITBOX_SIZE, s.shopEntranceX, s.shopEntranceY, SHOP_SPRITE_SIZE)) return; }
    s.lastHitTime = now; s.lives--; this.playSound(SOUNDS.DAMAGE); this.triggerHitFlash(); this.emitState();
    if (s.lives <= 0) this.playerDied(cause);
  }

  public playerDied(cause: string) {
    const s = this.state; s.isDead = true; this.playSound(SOUNDS.DEATH, 0.7); if (s.currentMusic) s.currentMusic.pause();
    if (s.shopMusic) s.shopMusic.pause();
    const secondsSurvived = Math.floor(s.activePlaytime / 1000); const finalScore = secondsSurvived * s.coins;
    s.deathMessage = `Died by: ${cause || 'Unknown'}`; s.scoreMessage = `SCORE: ${finalScore}`; this.emitState();
    clearTimeout(this.deathTimeout); this.deathTimeout = setTimeout(() => { if (this.state.isDead) { this.state.showDeathScreen = true; this.emitState(); } }, 2000);
  }

  public updateActiveMissions() {
    const s = this.state;
    MISSION_DATABASE.forEach(mission => {
      if (s.activeMissions.find(m => m.id === mission.id) || s.completedMissions.includes(mission.id)) return;
      let meetsReqs = true;
      if (mission.req) { if (mission.req.bulletPierce && s.bulletPierce < mission.req.bulletPierce) meetsReqs = false; if (mission.req.fireshot && s.fireshot < mission.req.fireshot) meetsReqs = false; if (mission.req.shield && s.shield < mission.req.shield) meetsReqs = false; if (mission.req.multishot && s.multishot < mission.req.multishot) meetsReqs = false; }
      if (meetsReqs) s.activeMissions.push({ ...mission, progress: 0 });
    });
  }

  public triggerMissionEvent(eventType: string, amount?: number, eventData?: any) {
    const s = this.state;
    if (s.shopEntranceActive || s.inShop || s.enteringShop) return;
    const amt = amount || 1; const data = eventData || {};
    const currentShopMission = this.getCurrentShopMission();
    const missionsToUpdate = currentShopMission ? [currentShopMission] : s.activeMissions;
    missionsToUpdate.forEach(mission => {
      if (mission.type !== eventType) return; let match = true;
      if (mission.type === 'kill_mob' && mission.targetId !== data.mobType) match = false;
      if (mission.type === 'bullet_multikill') { if (data.killCount >= mission.target) { mission.progress = mission.target; } else { match = false; } }
      if (match && mission.type !== 'bullet_multikill') { mission.progress += amt; }
      if (mission.progress >= mission.target && !s.completedMissions.includes(mission.id)) { s.completedMissions.push(mission.id); if (SHOP_SOUNDS.TASK_COMPLETE) this.playSound(SHOP_SOUNDS.TASK_COMPLETE); }
    });
    s.activeMissions = s.activeMissions.filter(m => m.progress < m.target);
    this.updateMissionProgressPopup(); this.checkShopUnlockComplete();
  }

  public updateMissionProgressPopup() {
    const s = this.state; const mission = this.getCurrentShopMission();
    const ratio = mission ? mission.progress / mission.target : 0;
    const newState = mission && ratio >= 0.8 && ratio < 1 ? { visible: true, text: mission.desc, progress: mission.progress, target: mission.target } : { visible: false, text: '', progress: 0, target: 0 };
    const changed = s.missionProgress.visible !== newState.visible || Math.floor(s.missionProgress.progress) !== Math.floor(newState.progress) || s.missionProgress.target !== newState.target;
    s.missionProgress = newState; if (changed) this.emitState();
  }

  public getGenericPoolByDifficulty(diff: number) { return MISSION_DATABASE.filter(m => m.difficulty === diff && !m.statCategory); }
  public getAvailableStatMissions() {
    const s = this.state; return MISSION_DATABASE.filter(m => {
      if (!m.statCategory) return false;
      if (m.statCategory === 'pierce') return s.bulletPierce >= (m.req?.bulletPierce || 1);
      if (m.statCategory === 'fireshot') return s.fireshot >= (m.req?.fireshot || 1);
      if (m.statCategory === 'shield') return s.shield >= (m.req?.shield || 1);
      if (m.statCategory === 'multishot') return s.multishot >= (m.req?.multishot || 1);
      return false;
    });
  }
  public pickRandomMissionDef(pool: any[], excludeIds: string[]) { const filtered = pool.filter(m => !excludeIds.includes(m.id)); if (filtered.length === 0) return null; return filtered[Math.floor(Math.random() * filtered.length)]; }

  public pickNextMissionFromTier(excludeIds: string[]) {
    const s = this.state; const minTier = Math.min(4, Math.max(1, s.shopVisits)); let tier = Math.max(minTier, s.shopMissionTier);
    while (tier <= 4) {
      const pool = this.getGenericPoolByDifficulty(tier);
      const available = pool.filter(m => !s.usedMissionIds[tier].includes(m.id) && !excludeIds.includes(m.id));
      if (available.length > 0) { const picked = available[Math.floor(Math.random() * available.length)]; s.usedMissionIds[tier].push(picked.id); s.shopMissionTier = tier; return picked; }
      tier++;
    }
    s.usedMissionIds = { 1: [], 2: [], 3: [], 4: [] };
    const allGeneric = MISSION_DATABASE.filter(m => !m.statCategory && !excludeIds.includes(m.id));
    if (allGeneric.length === 0) return null;
    const picked = allGeneric[Math.floor(Math.random() * allGeneric.length)];
    s.usedMissionIds[picked.difficulty] = s.usedMissionIds[picked.difficulty] || [];
    s.usedMissionIds[picked.difficulty].push(picked.id);
    return picked;
  }

  public getShopMissionPackage(visitNumber: number) {
    let comboChance = 0, statChance = 0;
    if (visitNumber <= 3) { statChance = 0; } else if (visitNumber <= 6) { statChance = 0.15; } else if (visitNumber <= 12) { statChance = 0.3; comboChance = 0.4; } else { statChance = 0.5; comboChance = 0.7; }
    const chosen = []; const first = this.pickNextMissionFromTier([]); if (first) chosen.push(first);
    if (Math.random() < comboChance) { const extra = this.pickNextMissionFromTier(chosen.map(m => m.id)); if (extra) chosen.push(extra); }
    if (Math.random() < statChance) { const statPool = this.getAvailableStatMissions(); const extra = this.pickRandomMissionDef(statPool, chosen.map(m => m.id)); if (extra) chosen.push(extra); }
    return chosen;
  }

  public assignShopUnlockMissions() {
    const s = this.state; const visitNumber = s.shopVisits + 1;
    let chosenDefs = this.getShopMissionPackage(visitNumber);
    if (chosenDefs.length === 0) { const fallback = MISSION_DATABASE.filter(m => !m.statCategory); if (fallback.length > 0) { chosenDefs = [fallback[Math.floor(Math.random() * fallback.length)]]; } }
    s.shopUnlockMissions = [];
    chosenDefs.forEach(def => { s.shopMissionCounter++; const instanceId = def.id + '_shopinst' + s.shopMissionCounter; s.activeMissions.push({ ...def, id: instanceId, progress: 0, isShopUnlock: true }); s.shopUnlockMissions.push({ id: instanceId, desc: def.desc, target: def.target }); });
    if (chosenDefs.length > 0) { this.showPopupMessage(chosenDefs.length > 1 ? 'NEW MISSIONS' : 'NEW MISSION', chosenDefs.map(d => d.desc).join('   +   ')); }
    this.emitState();
  }

  public showPopupMessage(title: string, desc: string) { const s = this.state; s.missionPopup = { title, desc, visible: true }; this.emitState(); clearTimeout(this.missionPopupTimer); this.missionPopupTimer = setTimeout(() => { s.missionPopup = { ...s.missionPopup, visible: false }; this.emitState(); }, 10000); }

  public checkShopUnlockComplete() { const s = this.state; if (s.inShop || s.shopEntranceActive || s.shopUnlockMissions.length === 0) return; const allDone = s.shopUnlockMissions.every(sm => s.completedMissions.includes(sm.id)); if (allDone) this.spawnShopEntrance(); }

  public spawnShopEntrance() {
    const s = this.state; s.shopEntranceActive = true;
    const angle = Math.random() * Math.PI * 2; const distance = 2500;
    s.shopEntranceX = s.x + Math.cos(angle) * distance; s.shopEntranceY = s.y + Math.sin(angle) * distance;
    const el = document.createElement('img'); el.src = DOOR_ANIM_FRAMES[0];
    el.style.cssText = `width:${SHOP_SPRITE_SIZE}px;position:absolute;z-index:500;pointer-events:none;user-select:none;-webkit-user-drag:none;`;
    el.style.left = (s.shopEntranceX - s.cameraX) + 'px'; el.style.top = (s.shopEntranceY - s.cameraY) + 'px'; this.container.appendChild(el);
    s.shopEntranceEl = el; s.entranceDoorAnimFrame = 0; s.entranceDoorAnimPlayed = false; s.entranceDoorAnimTimer = 0;
    const arrowEl = document.createElement('img'); arrowEl.src = "https://codehs.com/uploads/47d2aecdb1c143d3e23af2901a76dd7f";
    arrowEl.style.cssText = `width:40px;position:fixed;z-index:100004;pointer-events:none;user-select:none;-webkit-user-drag:none;transform-origin:center;opacity:0;`; this.container.appendChild(arrowEl); s.shopArrowEl = arrowEl;
    const textEl = document.createElement('div'); textEl.textContent = 'SHOP HAS OPENED';
    textEl.style.cssText = `position:fixed;z-index:100004;pointer-events:none;font-family:'Press Start 2P',monospace;font-size:14px;color:#ffcc00;text-shadow:2px 2px 0 #000;white-space:nowrap;opacity:0;`; this.container.appendChild(textEl); s.shopArrowTextEl = textEl;
    s.shopArrowAnimFrame = 0; s.shopArrowAnimTimer = 0; s.lastShopArrowBeepTime = 0; this.emitState();
  }

  public clearPhysicalShopItems() {
    const s = this.state;
    s.shopItemEls.forEach(item => { if (item.el) item.el.remove(); });
    s.shopItemEls = [];
    if (s.shopTitleEl) { s.shopTitleEl.remove(); s.shopTitleEl = null; }
  }

  public createPhysicalShopItems() {
    const s = this.state; this.clearPhysicalShopItems();
    const rows = Math.ceil(ENCHANTMENTS.length / SHOP_ITEM_COLUMNS);

    const scaledWidth = SHOP_ITEM_WIDTH * s.screenScale;
    const scaledHeight = SHOP_ITEM_HEIGHT * s.screenScale;
    const scaledGap = SHOP_ITEM_GAP * s.screenScale;
    const scaledRowGap = SHOP_ITEM_ROW_GAP * s.screenScale;

    const totalWidth = (SHOP_ITEM_COLUMNS * scaledWidth) + ((SHOP_ITEM_COLUMNS - 1) * scaledGap);
    const totalHeight = (rows * scaledHeight) + ((rows - 1) * scaledRowGap);
    const startX = SHOP_AREA_X - (totalWidth / 2);
    const startY = SHOP_AREA_Y - (totalHeight / 2) - (35 * s.screenScale);

    // Create yellow 'THE SHOP' big text
    const titleEl = document.createElement('div');
    titleEl.textContent = 'THE SHOP';
    const titleFontSize = 40 * s.screenScale;
    titleEl.style.cssText = `position:absolute;font-family:'Press Start 2P',monospace;font-size:${titleFontSize}px;color:#ffcc00;text-shadow:${4 * s.screenScale}px ${4 * s.screenScale}px 0 #000;white-space:nowrap;z-index:10000;pointer-events:none;transform:translate(-50%, -50%);`;
    const titleX = SHOP_AREA_X;
    const titleY = startY - 80 * s.screenScale;
    titleEl.style.left = (titleX - s.cameraX) + 'px';
    titleEl.style.top = (titleY - s.cameraY) + 'px';
    this.container.appendChild(titleEl);
    s.shopTitleEl = titleEl;

    ENCHANTMENTS.forEach((enchant, index) => {
      const col = index % SHOP_ITEM_COLUMNS, row = Math.floor(index / SHOP_ITEM_COLUMNS);
      const x = startX + col * (scaledWidth + scaledGap), y = startY + row * (scaledHeight + scaledRowGap);
      const box = document.createElement('div'); box.setAttribute('data-ui', ''); box.dataset.enchantId = enchant.id;

      box.style.cssText = `position:absolute;width:${scaledWidth}px;height:${scaledHeight}px;background:rgba(45,45,45,0.95);border:${3 * s.screenScale}px solid #ffcc00;box-shadow:${4 * s.screenScale}px ${4 * s.screenScale}px 0 #000;padding:${8 * s.screenScale}px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${5 * s.screenScale}px;z-index:10000;pointer-events:auto;transition:transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;`;

      const scaledIconSize = 110 * s.screenScale;
      const nameFontSize = 8 * s.screenScale;
      const priceFontSize = 10 * s.screenScale;
      const levelFontSize = 8 * s.screenScale;

      box.innerHTML = `<img src="${enchant.icon}" draggable="false" style="width:${scaledIconSize}px;height:${scaledIconSize}px;object-fit:contain;image-rendering:pixelated;pointer-events:none;-webkit-user-drag:none;" /><p style="color:#fff;font-family:'Press Start 2P',monospace;font-size:${nameFontSize}px;text-align:center;margin:0;line-height:1.35;">${enchant.name}</p><p class="price" style="color:#ffcc00;font-family:'Press Start 2P',monospace;font-size:${priceFontSize}px;margin:0;">0</p><p class="level" style="color:#aaa;font-family:'Press Start 2P',monospace;font-size:${levelFontSize}px;margin:0;">LV 0</p>`;

      // Hover Tooltip Box
      const tooltip = document.createElement('div');
      tooltip.style.cssText = `position:absolute;bottom:104%;left:-${3 * s.screenScale}px;width:${scaledWidth}px;background:rgba(15,15,15,0.98);border:${2 * s.screenScale}px solid #ffcc00;box-shadow:${3 * s.screenScale}px ${3 * s.screenScale}px 0 #000;padding:${6 * s.screenScale}px;font-family:'Press Start 2P',monospace;font-size:${6 * s.screenScale}px;color:#fff;line-height:1.4;pointer-events:none;z-index:10001;opacity:0;transform:scale(0.85);transform-origin:bottom center;transition:opacity 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);text-align:center;word-break:break-word;`;
      tooltip.textContent = enchant.description;
      box.appendChild(tooltip);

      box.addEventListener('mouseenter', () => {
        const level = s.enchantmentLevels[enchant.id] || 0;
        const price = getEnchantmentPrice(enchant, level);
        const isMaxed = this.isEnchantmentMaxed(enchant.id);
        const canAfford = !isMaxed && s.coins >= price;

        if (canAfford) {
          box.style.transform = 'scale(1.06)';
          box.style.borderColor = '#ffffff';
          box.style.boxShadow = `${6 * s.screenScale}px ${6 * s.screenScale}px 0 #000`;
        } else {
          box.style.borderColor = '#555';
        }
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'scale(1)';
      });
      box.addEventListener('mouseleave', () => {
        const level = s.enchantmentLevels[enchant.id] || 0;
        const price = getEnchantmentPrice(enchant, level);
        const isMaxed = this.isEnchantmentMaxed(enchant.id);
        const canAfford = !isMaxed && s.coins >= price;

        box.style.transform = 'scale(1)';
        box.style.borderColor = canAfford ? '#ffcc00' : '#555';
        box.style.boxShadow = `${4 * s.screenScale}px ${4 * s.screenScale}px 0 #000`;
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'scale(0.85)';
      });
      box.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this.buyEnchantment(enchant.id); });
      this.container.appendChild(box);
      s.shopItemEls.push({ el: box, enchantId: enchant.id, x, y });
    });

    // Render the Enemies Button (Pretty big, located to the left of the upgrades)
    const enemiesButtonX = startX - scaledWidth - (70 * s.screenScale);
    const enemiesButtonY = startY + (totalHeight - scaledHeight) / 2;

    const enemiesBtn = document.createElement('div');
    enemiesBtn.setAttribute('data-ui', '');
    enemiesBtn.style.cssText = `position:absolute;width:${scaledWidth}px;height:${scaledHeight}px;background:rgba(20,20,20,0.95);border:${3 * s.screenScale}px solid #ff4444;box-shadow:${4 * s.screenScale}px ${4 * s.screenScale}px 0 #000;padding:${8 * s.screenScale}px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${10 * s.screenScale}px;z-index:10000;pointer-events:auto;transition:transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.25s ease, box-shadow 0.25s ease;`;

    const iconSize = 95 * s.screenScale;
    const labelFontSize = 10 * s.screenScale;

    enemiesBtn.innerHTML = `
      <img src="https://codehs.com/uploads/c1f80496c09b22885b7c5363c5a39f61" draggable="false" style="width:${iconSize}px;height:${iconSize}px;object-fit:contain;image-rendering:pixelated;pointer-events:none;" />
      <p style="color:#ff4444;font-family:'Press Start 2P',monospace;font-size:${labelFontSize}px;text-align:center;margin:0;line-height:1.4;font-weight:bold;">ENEMIES</p>
    `;

    enemiesBtn.addEventListener('mouseenter', () => {
      enemiesBtn.style.transform = 'scale(1.06)';
      enemiesBtn.style.borderColor = '#ff6666';
      enemiesBtn.style.boxShadow = `${6 * s.screenScale}px ${6 * s.screenScale}px 0 #000`;
    });
    enemiesBtn.addEventListener('mouseleave', () => {
      enemiesBtn.style.transform = 'scale(1)';
      enemiesBtn.style.borderColor = '#ff4444';
      enemiesBtn.style.boxShadow = `${4 * s.screenScale}px ${4 * s.screenScale}px 0 #000`;
    });
    enemiesBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.playSound(SOUNDS.BUTTON_CLICK);
      s.enemiesPopupVisible = true;
      this.emitState();
    });

    this.container.appendChild(enemiesBtn);
    s.shopItemEls.push({ el: enemiesBtn, enchantId: 'enemies', x: enemiesButtonX, y: enemiesButtonY });

    s.shopExitX = startX + totalWidth + (130 * s.screenScale); s.shopExitY = startY + (totalHeight - SHOP_SPRITE_SIZE * s.screenScale) / 2;
    this.refreshPhysicalShopItems();
    this.positionPhysicalShopItems();
  }

  public refreshPhysicalShopItems() {
    const s = this.state;
    s.shopItemEls.forEach(item => {
      const enchant = ENCHANTMENTS.find(e => e.id === item.enchantId); if (!enchant) return;
      const level = s.enchantmentLevels[enchant.id] || 0; const price = getEnchantmentPrice(enchant, level); const isMaxed = this.isEnchantmentMaxed(enchant.id); const canAfford = !isMaxed && s.coins >= price;
      const priceEl = item.el.querySelector('.price');
      const levelEl = item.el.querySelector('.level');
      if (priceEl) priceEl.textContent = isMaxed ? 'MAX' : price.toString();
      if (levelEl) levelEl.textContent = `LV ${level}`;
      item.el.style.borderColor = canAfford ? '#ffcc00' : '#555'; item.el.style.background = canAfford ? 'rgba(45,45,45,0.95)' : 'rgba(28,28,28,0.85)';
      item.el.style.borderWidth = `${3 * s.screenScale}px`;
      if (priceEl) {
        (priceEl as HTMLElement).style.color = isMaxed ? '#66ff99' : (canAfford ? '#ffcc00' : '#ff6666');
      }
      item.el.style.cursor = canAfford ? 'pointer' : 'not-allowed';
    });
  }

  public positionPhysicalShopItems() {
    const s = this.state;
    s.shopItemEls.forEach(item => { item.el.style.left = (item.x - s.cameraX) + 'px'; item.el.style.top = (item.y - s.cameraY) + 'px'; });
    if (s.shopTitleEl) {
      const rows = Math.ceil(ENCHANTMENTS.length / SHOP_ITEM_COLUMNS);
      const scaledHeight = SHOP_ITEM_HEIGHT * s.screenScale;
      const scaledRowGap = SHOP_ITEM_ROW_GAP * s.screenScale;
      const totalHeight = (rows * scaledHeight) + ((rows - 1) * scaledRowGap);
      const startY = SHOP_AREA_Y - (totalHeight / 2) - (35 * s.screenScale);
      const titleY = startY - 80 * s.screenScale;
      s.shopTitleEl.style.left = (SHOP_AREA_X - s.cameraX) + 'px';
      s.shopTitleEl.style.top = (titleY - s.cameraY) + 'px';
    }
  }

  public enterShop() {
    const s = this.state; if (s.inShop || s.enteringShop) return; s.enteringShop = true; s.shopEntranceActive = false;
    s.shopUnlockMissions = [];
    s.activeMissions = s.activeMissions.filter(m => !m.isShopUnlock);
    this.stopSound(SHOP_SOUNDS.SHOP_ARROW_BEEP);
    this.stopSound(SHOP_SOUNDS.TASK_COMPLETE);
    this.stopSound(SHOP_SOUNDS.SHOP_ENTER);
    if (SHOP_SOUNDS.SHOP_ENTER) this.playSound(SHOP_SOUNDS.SHOP_ENTER);

    if (s.shopEntranceEl) { s.shopEntranceEl.remove(); s.shopEntranceEl = null; }
    if (s.shopArrowEl) { s.shopArrowEl.remove(); s.shopArrowEl = null; }
    if (s.shopArrowTextEl) { s.shopArrowTextEl.remove(); s.shopArrowTextEl = null; }
    s.shopArrowFade = 0;
    s.shopFade = 1; this.emitState();
    const sessionId = s.gameSessionId;
    setTimeout(() => {
      if (this.state.gameSessionId !== sessionId) return;
      this.stopSound(SHOP_SOUNDS.SHOP_ARROW_BEEP);
      this.stopSound(SHOP_SOUNDS.SHOP_ENTER);
      s.enteringShop = false;
      s.inShop = true; s.shopVisits++;
      s.enemies.forEach(e => { this.clearEnemyShieldElements(e); if (e.el) e.el.remove(); }); s.enemies = [];
      s.enemyBullets.forEach(b => b.el.remove()); s.enemyBullets = [];
      s.bullets.forEach(b => b.el.remove()); s.bullets = [];
      s.preShopX = s.x; s.preShopY = s.y; s.x = SHOP_AREA_X; s.y = SHOP_AREA_Y; s.vx = 0; s.vy = 0; s.keys = {};
      s.cameraX = s.x - this.getSpawnScreenWidth() / 2; s.cameraY = s.y - this.getSpawnScreenHeight() / 2; s.shopEnterTime = Date.now();
      this.createPhysicalShopItems();
      const el = document.createElement('img'); el.src = DOOR_ANIM_FRAMES[0];
      el.style.cssText = `width:${SHOP_SPRITE_SIZE}px;position:absolute;z-index:500;pointer-events:none;user-select:none;-webkit-user-drag:none;`; this.container.appendChild(el); s.shopExitEl = el;
      s.exitDoorAnimFrame = 0; s.exitDoorAnimPlayed = false; s.exitDoorAnimTimer = 0;
      s.shopFade = 0; s.shopOverlayVisible = false;
      this.playShopMusic(); this.emitState();
    }, SHOP_FADE_DURATION);
  }

  public buyEnchantment(id: string) {
    const s = this.state; if (!s.inShop) return;
    const enchant = ENCHANTMENTS.find(e => e.id === id); if (!enchant) return;
    if (this.isEnchantmentMaxed(id)) return;
    const level = s.enchantmentLevels[id] || 0; const price = getEnchantmentPrice(enchant, level);
    if (s.coins < price) return; s.coins -= price; s.enchantmentLevels[id] = level + 1;
    switch (id) {
      case 'bulletSize': s.bulletSize = clamp(roundToStep(DEFAULTS.BULLET_SIZE + s.enchantmentLevels[id] * 2, 0.01), DEV_STAT_LIMITS.bulletSize.min, DEV_STAT_LIMITS.bulletSize.max); this.rebuildShieldSystem(); break;
      case 'bulletSpeed': s.bulletSpeed = clamp(roundToStep(DEFAULTS.BULLET_SPEED + s.enchantmentLevels[id] * 2.2, 0.01), DEV_STAT_LIMITS.bulletSpeed.min, DEV_STAT_LIMITS.bulletSpeed.max); break;
      case 'fireRate': s.fireRate = clamp(roundToStep(DEFAULTS.FIRE_RATE + s.enchantmentLevels[id] * 5.4, 0.01), DEV_STAT_LIMITS.fireRate.min, DEV_STAT_LIMITS.fireRate.max); s.fireDelay = 1000 / s.fireRate; break;
      case 'playerSpeed': s.acceleration = clamp(roundToStep(DEFAULTS.ACCELERATION + s.enchantmentLevels[id] * 0.29, 0.01), DEV_STAT_LIMITS.acceleration.min, DEV_STAT_LIMITS.acceleration.max); break;
      case 'multishot': s.multishot = clamp(DEFAULTS.MULTISHOT + s.enchantmentLevels[id] * 1, DEV_STAT_LIMITS.multishot.min, DEV_STAT_LIMITS.multishot.max); this.updatePlayerSprite(); this.rebuildShieldSystem(); break;
      case 'fireshot': s.fireshot = clamp(DEFAULTS.FIRESHOT + s.enchantmentLevels[id] * 1, DEV_STAT_LIMITS.fireshot.min, DEV_STAT_LIMITS.fireshot.max); this.updatePlayerSprite(); this.rebuildShieldSystem(); break;
      case 'piercing': s.bulletPierce = clamp(DEFAULTS.PIERCE + s.enchantmentLevels[id] * 1, DEV_STAT_LIMITS.bulletPierce.min, DEV_STAT_LIMITS.bulletPierce.max); break;
      case 'shield': s.shield = clamp(DEFAULTS.SHIELD + s.enchantmentLevels[id] * 1, DEV_STAT_LIMITS.shield.min, DEV_STAT_LIMITS.shield.max); this.rebuildShieldSystem(); break;
      case 'maxLives': s.maxLives = clamp(s.maxLives + 1, DEV_STAT_LIMITS.maxLives.min, DEV_STAT_LIMITS.maxLives.max); s.lives = clamp(s.lives + 1, 0, s.maxLives); break;
      case 'life': s.lives = clamp(s.lives + 1, 0, s.maxLives); break;
    }
    if (SHOP_SOUNDS.BUY_ITEM) this.playSound(SHOP_SOUNDS.BUY_ITEM);
    this.refreshPhysicalShopItems();
    this.emitState();
  }

  public exitShop() {
    const s = this.state;
    if (SHOP_SOUNDS.SHOP_EXIT) this.playSound(SHOP_SOUNDS.SHOP_EXIT);
    s.shopFade = 1; this.emitState();
    s.postShopSpawnDelay = true;
    if (s.shopMusic) { s.shopMusic.pause(); s.shopMusic = null; }
    const sessionId = s.gameSessionId;
    setTimeout(() => {
      if (this.state.gameSessionId !== sessionId) return;
      s.inShop = false; s.shopOverlayVisible = false;
      if (s.shopExitEl) { s.shopExitEl.remove(); s.shopExitEl = null; }
      this.clearPhysicalShopItems();
      s.screenScale *= SHOP_SCREEN_WIDEN_FACTOR;
      this.applyScreenScale();
      s.x = s.preShopX; s.y = s.preShopY; s.vx = 0; s.vy = 0; s.keys = {};
      s.cameraX = s.x - this.getSpawnScreenWidth() / 2; s.cameraY = s.y - this.getSpawnScreenHeight() / 2;
      this.assignShopUnlockMissions(); this.emitState();
      requestAnimationFrame(() => { if (this.state.gameSessionId !== sessionId) return; s.shopFade = 0; this.emitState(); });
      this.playRandomMusic();
      setTimeout(() => { if (this.state.gameSessionId !== sessionId) return; s.postShopSpawnDelay = false; s.lastSpawnTime = Date.now(); s.nextSpawnInterval = this.getSpawnInterval(); }, 2000);
    }, SHOP_FADE_DURATION);
  }

  public cleanUpOldGameSession() {
    const s = this.state;
    s.enemies.forEach(e => { this.clearEnemyShieldElements(e); if (e.el) e.el.remove(); }); s.bullets.forEach(b => b.el.remove()); s.enemyBullets.forEach(eb => eb.el.remove()); s.explosions.forEach(ex => ex.el.remove()); s.particles.forEach(p => p.el.remove()); this.clearShieldElements();
    s.enemies = []; s.bullets = []; s.enemyBullets = []; s.explosions = []; s.particles = []; s.gameSessionId++;
    s.inShop = false; s.enteringShop = false; s.shopEntranceActive = false; s.shopVisits = 0; s.screenScale = 1; s.lastShopArrowBeepTime = 0; this.applyScreenScale(); this.clearPhysicalShopItems();
    s.shopUnlockMissions = []; s.shopMissionTier = 1; s.usedMissionIds = { 1: [], 2: [], 3: [], 4: [] };
    if (s.shopEntranceEl) { s.shopEntranceEl.remove(); s.shopEntranceEl = null; }
    if (s.shopExitEl) { s.shopExitEl.remove(); s.shopExitEl = null; }
    if (s.shopArrowEl) { s.shopArrowEl.remove(); s.shopArrowEl = null; }
    if (s.shopArrowTextEl) { s.shopArrowTextEl.remove(); s.shopArrowTextEl = null; }
    if (s.shopTitleEl) { s.shopTitleEl.remove(); s.shopTitleEl = null; }
    s.shopFade = 0; s.postShopSpawnDelay = false; s.shopOverlayVisible = false; s.enchantmentLevels = {};
    s.lastSpawnTime = 0; s.nextSpawnInterval = 2500;
    if (s.shopMusic) { s.shopMusic.pause(); s.shopMusic = null; }
    s.entranceDoorAnimFrame = 0; s.entranceDoorAnimPlayed = false; s.exitDoorAnimFrame = 0; s.exitDoorAnimPlayed = false;
    s.missionProgress = { visible: false, text: '', progress: 0, target: 0 }; clearTimeout(this.missionPopupTimer); s.missionPopup = { title: '', desc: '', visible: false };
    s.acceleration = DEFAULTS.ACCELERATION; s.friction = DEFAULTS.FRICTION; s.bulletSpeed = DEFAULTS.BULLET_SPEED; s.bulletSize = DEFAULTS.BULLET_SIZE;
    s.fireRate = DEFAULTS.FIRE_RATE; s.bulletPierce = DEFAULTS.PIERCE; s.multishot = DEFAULTS.MULTISHOT; s.fireshot = DEFAULTS.FIRESHOT; s.shield = DEFAULTS.SHIELD;
    s.fireDelay = 1000 / s.fireRate; s.coins = 0; s.maxLives = DEFAULTS.MAX_LIVES; s.lives = DEFAULTS.LIVES;
    s.vx = 0; s.vy = 0; s.keys = {}; s.x = 900; s.y = 400; s.cameraX = 0; s.cameraY = 0;
    s.activePlaytime = 0; s.lastTimestamp = Date.now(); s.playerAnimTimer = 0; s.playerAnimFrame = 0; s.shieldRespawnTimer = 0;
    s.devUnlocked = false; s.showDevPassword = false; s.activeMissions = []; s.completedMissions = [];
    this.updatePlayerSprite(); s.isDead = false; s.isPaused = false; s.showDeathScreen = false;
    s.deathMessage = ''; s.scoreMessage = ''; s.hitFlash = false;
    this.stopSound(SHOP_SOUNDS.SHOP_ARROW_BEEP); this.stopSound(SHOP_SOUNDS.SHOP_ENTER);
    this.playingSounds = [];
    if (s.currentMusic) { s.currentMusic.pause(); s.currentMusic = null; }
    this.emitState();
  }

  public startGame() {
    const s = this.state; if (s.gameStarted) return;
    this.playSound(SOUNDS.BUTTON_CLICK); this.cleanUpOldGameSession(); this.updateActiveMissions(); this.assignShopUnlockMissions();
    s.gameStarted = true; this.playerEl.style.visibility = 'visible'; this.testBoxEl.style.visibility = 'visible';
    this.playSound(SOUNDS.STARTUP, 0.6);
    setTimeout(() => this.playRandomMusic(), 800);
    s.lastSpawnTime = Date.now(); s.nextSpawnInterval = this.getSpawnInterval();
    this.emitState();
  }

  public restart() {
    const s = this.state; this.playSound(SOUNDS.BUTTON_CLICK); this.cleanUpOldGameSession();
    s.gameStarted = false; this.playerEl.style.visibility = 'hidden'; this.testBoxEl.style.visibility = 'hidden'; this.emitState();
  }

  public togglePause() {
    const s = this.state; if (!s.gameStarted || s.isDead || s.showDevPassword) return;
    this.playSound(SOUNDS.BUTTON_CLICK); s.isPaused = !s.isPaused;
    if (s.isPaused) { if (s.currentMusic) s.currentMusic.pause(); if (s.shopMusic) s.shopMusic.pause(); }
    else { s.lastTimestamp = Date.now(); s.lastFrameTime = performance.now(); s.lastSpawnTime = Date.now(); if (s.inShop && s.shopMusic) s.shopMusic.play().catch(() => { }); else if (s.currentMusic) s.currentMusic.play().catch(() => { }); }
    this.emitState();
  }

  public openDevPassword() { const s = this.state; if (s.devUnlocked) return; this.playSound(SOUNDS.BUTTON_CLICK); s.showDevPassword = true; this.emitState(); }
  public cancelDevPassword() { const s = this.state; this.playSound(SOUNDS.BUTTON_CLICK); s.showDevPassword = false; s.isPaused = true; this.emitState(); }
  public checkDevPassword(password: string) { const s = this.state; this.playSound(SOUNDS.BUTTON_CLICK); if (password === DEV_PASSWORD) { s.devUnlocked = true; s.showDevPassword = false; s.isPaused = true; this.emitState(); return true; } return false; }

  public closeEnemiesPopup() {
    this.playSound(SOUNDS.BUTTON_CLICK);
    this.state.enemiesPopupVisible = false;
    this.emitState();
  }

  public setDevValue(key: string, value: number) {
    const s = this.state; const limit = (DEV_STAT_LIMITS as any)[key]; if (limit) value = clamp(roundToStep(value, limit.step), limit.min, limit.max);
    switch (key) {
      case 'acceleration': s.acceleration = value; break;
      case 'friction': s.friction = value; break;
      case 'bulletSpeed': s.bulletSpeed = value; break;
      case 'bulletSize': s.bulletSize = value; this.rebuildShieldSystem(); break;
      case 'fireRate': s.fireRate = value; s.fireDelay = 1000 / value; break;
      case 'bulletPierce': s.bulletPierce = value; break;
      case 'multishot': s.multishot = value; this.updatePlayerSprite(); this.rebuildShieldSystem(); break;
      case 'fireshot': s.fireshot = value; this.updatePlayerSprite(); this.rebuildShieldSystem(); break;
      case 'shield': s.shield = value; this.rebuildShieldSystem(); break;
      case 'maxLives': s.maxLives = value; if (s.lives > s.maxLives) s.lives = s.maxLives; break;
      case 'lives': s.lives = clamp(roundToStep(value, 1), 0, s.maxLives); break;
      case 'coins': s.coins = value; break;
    }
    this.emitState();
  }

  public skipMission() { const s = this.state; if (!s.devUnlocked) return; this.playSound(SOUNDS.BUTTON_CLICK); s.shopUnlockMissions.forEach(sm => { if (!s.completedMissions.includes(sm.id)) { s.completedMissions.push(sm.id); } }); s.activeMissions = s.activeMissions.filter(m => !s.shopUnlockMissions.some(sm => sm.id === m.id)); s.shopUnlockMissions = []; this.spawnShopEntrance(); }

  public handleKeyDown(e: KeyboardEvent) { const s = this.state; this.resumeMusic(); if (!s.gameStarted || s.isDead || s.showDevPassword) return; if (e.key.toLowerCase() === 'p' || e.key === 'Escape') { this.togglePause(); return; } if (s.isPaused) return; s.keys[e.key] = true; if (e.key === ' ') { this.shootBullet(); e.preventDefault(); } }
  public handleKeyUp(e: KeyboardEvent) { const s = this.state; if (!s.gameStarted || s.isPaused || s.isDead || s.showDevPassword) return; s.keys[e.key] = false; }
  public handleMouseMove(e: MouseEvent) { const s = this.state; if (!s.gameStarted || s.isPaused || s.isDead || s.showDevPassword) return; s.mouseX = e.clientX * s.screenScale; s.mouseY = e.clientY * s.screenScale; }
  public handleMouseDown(e: MouseEvent) { if (e.button === 2) { e.preventDefault(); e.stopPropagation(); return; } this.resumeMusic(); const s = this.state; if (!s.gameStarted || s.isPaused || s.isDead || s.showDevPassword) return; s.mouseX = e.clientX * s.screenScale; s.mouseY = e.clientY * s.screenScale; const target = e.target as HTMLElement; if (target.closest('button') || target.closest('input') || target.closest('[data-ui]')) return; e.preventDefault(); this.shootBullet(); }
  public handleContextMenu(e: MouseEvent) { e.preventDefault(); e.stopPropagation(); return false; }
  public preventNativeDrag(e: DragEvent) { const target = e.target as HTMLElement; if (target.closest && target.closest('input')) return; e.preventDefault(); }
  public preventBrowserZoom(e: any) { const key = (e.key || '').toLowerCase(); const isZoomKey = e.type === 'keydown' && (e.ctrlKey || e.metaKey) && ['+', '=', '-', '_', '0'].includes(key); const isZoomWheel = e.type === 'wheel' && (e.ctrlKey || e.metaKey); const isGesture = e.type && e.type.startsWith('gesture'); if (isZoomKey || isZoomWheel || isGesture) { e.preventDefault(); e.stopPropagation(); } }
  public handleBlur() { const s = this.state; if (!s.isPaused && s.gameStarted && !s.isDead && !s.showDevPassword) this.togglePause(); }
  public handleResize() {
    this.applyScreenScale();
    const s = this.state;
    if (!s.gameStarted || s.isDead || s.isPaused) {
      const viewWidth = this.getSpawnScreenWidth(), viewHeight = this.getSpawnScreenHeight();
      s.cameraX = s.x - viewWidth / 2;
      s.cameraY = s.y - viewHeight / 2;
      this.playerEl.style.left = (s.x - s.cameraX) + 'px';
      this.playerEl.style.top = (s.y - s.cameraY) + 'px';
      if (s.shopEntranceActive && s.shopEntranceEl) {
        s.shopEntranceEl.style.left = (s.shopEntranceX - s.cameraX) + 'px';
        s.shopEntranceEl.style.top = (s.shopEntranceY - s.cameraY) + 'px';
      }
      if (s.inShop && s.shopExitEl) {
        s.shopExitEl.style.left = (s.shopExitX - s.cameraX) + 'px';
        s.shopExitEl.style.top = (s.shopExitY - s.cameraY) + 'px';
      }
      s.enemies.forEach(e => {
        if (e.el) {
          const offset = e.isElite ? (e.eliteOffset || 0) : 0;
          e.el.style.left = (e.x - offset - s.cameraX) + 'px';
          e.el.style.top = (e.y - offset - s.cameraY) + 'px';
        }
      });
      s.bullets.forEach(b => {
        if (b.el) {
          b.el.style.left = (b.x - (b.size / 2) - s.cameraX) + 'px';
          b.el.style.top = (b.y - (b.size / 2) - s.cameraY) + 'px';
        }
      });
      s.enemyBullets.forEach(b => {
        if (b.el) {
          b.el.style.left = (b.x - (b.size / 2) - s.cameraX) + 'px';
          b.el.style.top = (b.y - (b.size / 2) - s.cameraY) + 'px';
        }
      });
      if (s.inShop) {
        s.shopItemEls.forEach(item => {
          if (item.el) {
            item.el.style.left = (item.x - s.cameraX) + 'px';
            item.el.style.top = (item.y - s.cameraY) + 'px';
          }
        });
      }
    }
  }

  public update() {
    const s = this.state; const currentInstant = Date.now(); const perfNow = performance.now(); const dt = perfNow - s.lastFrameTime; s.lastFrameTime = perfNow;
    if (s.gameStarted && !s.isDead && !s.isPaused) { const delta = currentInstant - s.lastTimestamp; if (!s.inShop) s.activePlaytime += delta; if (s.fireshot > 0) { s.playerAnimTimer += dt; if (s.playerAnimTimer >= 250) { s.playerAnimTimer = 0; s.playerAnimFrame = (s.playerAnimFrame + 1) % 4; this.updatePlayerSprite(); } } }
    s.lastTimestamp = currentInstant;
    if (s.gameStarted) {
      this.updateExplosions();
      this.updateParticles();
    }
    if (!s.gameStarted || s.isDead || s.isPaused || s.shopFade > 0) { this.animationId = requestAnimationFrame(this.update); return; }
    this.testBoxEl.style.left = (1200 - s.cameraX) + 'px'; this.testBoxEl.style.top = (400 - s.cameraY) + 'px';

    if (!s.inShop && !s.postShopSpawnDelay) { const now = Date.now(); if (now - s.lastSpawnTime >= s.nextSpawnInterval) { s.lastSpawnTime = now; s.nextSpawnInterval = this.getSpawnInterval(); this.doSpawn(); } }
    if (s.keys['w'] || s.keys['ArrowUp']) s.vy -= s.acceleration;
    if (s.keys['s'] || s.keys['ArrowDown']) s.vy += s.acceleration;
    if (s.keys['a'] || s.keys['ArrowLeft']) s.vx -= s.acceleration;
    if (s.keys['d'] || s.keys['ArrowRight']) s.vx += s.acceleration;
    s.vx *= s.friction; s.vy *= s.friction; s.x += s.vx; s.y += s.vy;
    if (Math.hypot(s.vx, s.vy) > 0.3 && !s.inShop && s.maxParticles > 0) {
      const pSpawnProb = (s.maxParticles / 80) * 0.45;
      if (Math.random() < pSpawnProb) {
        this.spawnPlayerParticle();
      }
    }
    const viewWidth = this.getSpawnScreenWidth(), viewHeight = this.getSpawnScreenHeight();
    s.cameraX += (s.x - s.cameraX - viewWidth / 2) * 0.1; s.cameraY += (s.y - s.cameraY - viewHeight / 2) * 0.1;
    this.playerEl.style.left = (s.x - s.cameraX) + 'px'; this.playerEl.style.top = (s.y - s.cameraY) + 'px';
    const mouseAng = Math.atan2(s.mouseY - (s.y - s.cameraY + s.centerOffsetY), s.mouseX - (s.x - s.cameraX + s.centerOffsetX));
    this.playerEl.style.transform = `rotate(${mouseAng}rad)`;
    const px = s.x + s.centerOffsetX, py = s.y + s.centerOffsetY;
    if (s.shopEntranceActive && s.shopEntranceEl) {
      s.shopEntranceEl.style.left = (s.shopEntranceX - s.cameraX) + 'px'; s.shopEntranceEl.style.top = (s.shopEntranceY - s.cameraY) + 'px';
      const distToDoor = Math.hypot(px - s.shopEntranceX, py - s.shopEntranceY); const openThreshold = 500;
      s.entranceDoorAnimTimer += dt;
      if (s.entranceDoorAnimTimer >= 80) { s.entranceDoorAnimTimer -= 80; if (distToDoor < openThreshold && s.entranceDoorAnimFrame < DOOR_ANIM_FRAMES.length - 1) { s.entranceDoorAnimFrame++; s.shopEntranceEl.src = DOOR_ANIM_FRAMES[s.entranceDoorAnimFrame]; } else if (distToDoor >= openThreshold && s.entranceDoorAnimFrame > 0) { s.entranceDoorAnimFrame--; s.shopEntranceEl.src = DOOR_ANIM_FRAMES[s.entranceDoorAnimFrame]; } }
      if (this.isCollision(px, py, PLAYER_HITBOX_SIZE, s.shopEntranceX, s.shopEntranceY, SHOP_SPRITE_SIZE)) { this.enterShop(); }
    }
    if (s.inShop && s.shopExitEl) {
      s.shopExitEl.style.left = (s.shopExitX - s.cameraX) + 'px'; s.shopExitEl.style.top = (s.shopExitY - s.cameraY) + 'px';
      const exitCenterX = s.shopExitX + SHOP_SPRITE_SIZE / 2, exitCenterY = s.shopExitY + SHOP_SPRITE_SIZE / 2;
      const distToExit = Math.hypot(px - exitCenterX, py - exitCenterY); const exitThreshold = 250;
      s.exitDoorAnimTimer += dt;
      if (s.exitDoorAnimTimer >= 80) { s.exitDoorAnimTimer -= 80; if (distToExit < exitThreshold && s.exitDoorAnimFrame < DOOR_ANIM_FRAMES.length - 1) { s.exitDoorAnimFrame++; s.shopExitEl.src = DOOR_ANIM_FRAMES[s.exitDoorAnimFrame]; } else if (distToExit >= exitThreshold && s.exitDoorAnimFrame > 0) { s.exitDoorAnimFrame--; s.shopExitEl.src = DOOR_ANIM_FRAMES[s.exitDoorAnimFrame]; } }
      if (Date.now() - s.shopEnterTime > 1500 && this.isCollision(px, py, PLAYER_HITBOX_SIZE, exitCenterX, exitCenterY, SHOP_SPRITE_SIZE)) { this.exitShop(); }
    }
    if (s.inShop && s.shopItemEls.length > 0) this.positionPhysicalShopItems();
    if (s.shopEntranceActive && !s.enteringShop && !s.inShop && s.shopArrowEl && s.shopArrowTextEl) {
      const distToDoor = Math.hypot(px - s.shopEntranceX, py - s.shopEntranceY);
      const showArrow = distToDoor > 600;
      if (showArrow) {
        s.shopArrowFade = Math.min(1.0, (s.shopArrowFade || 0) + dt / 300);
      } else {
        s.shopArrowFade = Math.max(0.0, (s.shopArrowFade || 0) - dt / 300);
      }
      if (s.shopArrowFade > 0) {
        const pulseOpacity = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(Date.now() / 250));
        const finalOpacity = s.shopArrowFade * pulseOpacity;
        s.shopArrowEl.style.opacity = String(finalOpacity);
        s.shopArrowTextEl.style.opacity = String(finalOpacity);
        const ang = Math.atan2(s.shopEntranceY - s.y, s.shopEntranceX - s.x);
        const cx = viewWidth / 2, cy = viewHeight / 2;
        const arrowDist = 250;
        const ax = cx + Math.cos(ang) * arrowDist, ay = cy + Math.sin(ang) * arrowDist;
        s.shopArrowEl.style.left = (ax - 20) + 'px'; s.shopArrowEl.style.top = (ay - 20) + 'px'; s.shopArrowEl.style.transform = `rotate(${ang}rad)`;
        s.shopArrowTextEl.style.left = (ax - 80) + 'px'; s.shopArrowTextEl.style.top = (ay + 30) + 'px';
        if (showArrow && SHOP_SOUNDS.SHOP_ARROW_BEEP && Date.now() - s.lastShopArrowBeepTime >= SHOP_ARROW_BEEP_INTERVAL) { s.lastShopArrowBeepTime = Date.now(); this.playSound(SHOP_SOUNDS.SHOP_ARROW_BEEP); }
      } else {
        s.shopArrowEl.style.opacity = '0';
        s.shopArrowTextEl.style.opacity = '0';
      }
    }
    const currentActiveSize = (s.fireshot > 0) ? Math.max(s.bulletSize * 1.5, 32) : s.bulletSize;
    if (s.shield > 0 && s.shieldBullets.length === 0) { s.shieldRespawnTimer += dt; if (s.shieldRespawnTimer >= 3000) { s.shieldRespawnTimer = 0; this.rebuildShieldSystem(); } } else { s.shieldRespawnTimer = 0; }
    const orbitSpeed = 0.03;
    for (const e of s.enemies) { if (!e.isUnloaded && this.isOnScreen(e.x, e.y, 220)) this.updateEnemyShields(e, dt, px, py); }

    for (let i = s.shieldBullets.length - 1; i >= 0; i--) {
      const sb = s.shieldBullets[i]; sb.offset += orbitSpeed * sb.spinDir;
      const orbitRadius = (sb.ring === 'inner') ? 75 : 135; const sbWorldX = px + Math.cos(sb.offset) * orbitRadius, sbWorldY = py + Math.sin(sb.offset) * orbitRadius;
      if (s.fireshot > 0) { sb.animTimer += dt; if (sb.animTimer >= 200) { sb.animTimer = 0; sb.animFrame = (sb.animFrame + 1) % BULLET_ANIMS.length; sb.el.src = BULLET_ANIMS[sb.animFrame]; } } else { if (sb.el.src !== DEFAULT_BULLET_SPRITE) sb.el.src = DEFAULT_BULLET_SPRITE; }
      sb.el.style.left = (sbWorldX - (sb.size / 2) - this.state.cameraX) + 'px'; sb.el.style.top = (sbWorldY - (sb.size / 2) - this.state.cameraY) + 'px';

      const bulletFacingAngle = (sb.spinDir === 1) ? (sb.offset + Math.PI / 2) : (sb.offset - Math.PI / 2);
      sb.el.style.transform = `rotate(${bulletFacingAngle}rad)`;

      let isDestroyed = false;
      for (let j = s.enemies.length - 1; j >= 0; j--) {
        const e = s.enemies[j]; if (!e) continue; const eSize = this.getEnemySize(e); if (sb.hitEnemies.includes(e.id)) continue;
        if (this.isCollision(sbWorldX, sbWorldY, sb.size, e.x, e.y, eSize)) {
          // Mimic Cooldown handling for shield hit
          if (e.type.isMimic) {
            const now = Date.now();
            if (now - (e.lastHitTime || 0) < HIT_COOLDOWN) {
              continue;
            }
            e.lastHitTime = now;
          }

          e.health -= 1; e.lastDamageTime = Date.now(); sb.hitEnemies.push(e.id);
          if (s.fireshot > 0) this.triggerFireshotSplit(e.x, e.y, eSize);
          if (e.type.name === 'Magic Mob' && !e.isClone) {
            if (!e.hasSplit) {
              e.hasSplit = true;
              this.spawnMagicClones(e);
            } else {
              this.damageMagicClones(e);
            }
          }
          if (e.health <= 0) { this._killEnemy(e, j, 'shield'); }
          sb.pierceLeft--;
          this.triggerMissionEvent('shield_block', 1);
          sb.el.style.opacity = (sb.pierceLeft / sb.maxPierce).toString();
          if (sb.pierceLeft <= 0) {
            sb.el.remove();
            s.shieldBullets.splice(i, 1);
            isDestroyed = true;
            if (s.shieldBullets.length === 0) {
              s.shield = 0;
              this.emitState();
            }
            break;
          }
        }
      }
      if (isDestroyed) continue;
      for (let k = s.enemyBullets.length - 1; k >= 0; k--) { const mb = s.enemyBullets[k]; const mbSize = mb.size || 20; if (this.isCollision(sbWorldX, sbWorldY, sb.size, mb.x, mb.y, mbSize)) { mb.el.remove(); s.enemyBullets.splice(k, 1); sb.pierceLeft--; this.triggerMissionEvent('shield_block', 1); this.triggerMissionEvent('shield_magic', 1); sb.el.style.opacity = (sb.pierceLeft / sb.maxPierce).toString(); if (sb.pierceLeft <= 0) { sb.el.remove(); s.shieldBullets.splice(i, 1); if (s.shieldBullets.length === 0) { s.shield = 0; this.emitState(); } break; } } }
    }

    // 1. Move all bullets
    for (const b of s.bullets) {
      b.x += b.vx;
      b.y += b.vy;
      if (s.fireshot > 0 && s.maxParticles > 0) {
        const bSpawnChance = (s.maxParticles / 80) * 0.25;
        if (Math.random() < bSpawnChance) {
          this.spawnBulletParticle(b.x, b.y);
        }
      }
    }
    for (const eb of s.enemyBullets) {
      eb.x += eb.vx;
      eb.y += eb.vy;
    }

    // 2. Resolve bullet-bullet collisions with accurate physics (mass proportional to size squared)
    const resolveBulletBounce = (b1: any, b2: any, size1: number, size2: number, isB1PiercingPlayer: boolean = false, isB2PiercingPlayer: boolean = false) => {
      const minDist = (size1 + size2) / 2;
      const dx = b1.x - b2.x;
      if (Math.abs(dx) >= minDist) return;
      const dy = b1.y - b2.y;
      if (Math.abs(dy) >= minDist) return;

      const distSq = dx * dx + dy * dy;
      const minDistSq = minDist * minDist;

      if (distSq < minDistSq && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        // Resolve overlap
        const overlap = minDist - dist;
        const pushX = (dx / dist) * overlap;
        const pushY = (dy / dist) * overlap;

        if (isB1PiercingPlayer && !isB2PiercingPlayer) {
          // b1 is piercing: b2 gets pushed away, b1 stays unaffected
          b2.x -= pushX;
          b2.y -= pushY;
        } else if (isB2PiercingPlayer && !isB1PiercingPlayer) {
          // b2 is piercing: b1 gets pushed away, b2 stays unaffected
          b1.x += pushX;
          b1.y += pushY;
        } else {
          // Both are piercing or neither are: standard 50-50 split push
          b1.x += pushX * 0.5;
          b1.y += pushY * 0.5;
          b2.x -= pushX * 0.5;
          b2.y -= pushY * 0.5;
        }

        // Mass based on area
        const m1 = size1 * size1;
        const m2 = size2 * size2;

        const dvx = b1.vx - b2.vx;
        const dvy = b1.vy - b2.vy;
        const dotProduct = dvx * dx + dvy * dy;

        // Only bounce if they are moving towards each other
        if (dotProduct < 0) {
          if (isB1PiercingPlayer && !isB2PiercingPlayer) {
            // b1 is piercing: b1 is unaffected. b2 absorbs all kinetic transfer (infinite mass approximation for b1)
            const factor2 = (2 * dotProduct) / distSq;
            b2.vx += factor2 * dx;
            b2.vy += factor2 * dy;
          } else if (isB2PiercingPlayer && !isB1PiercingPlayer) {
            // b2 is piercing: b2 is unaffected. b1 absorbs all kinetic transfer
            const factor1 = (2 * dotProduct) / distSq;
            b1.vx -= factor1 * dx;
            b1.vy -= factor1 * dy;
          } else {
            // Standard elastic collision
            const factor = (2 * dotProduct) / (distSq * (m1 + m2));
            b1.vx -= factor * m2 * dx;
            b1.vy -= factor * m2 * dy;
            b2.vx += factor * m1 * dx;
            b2.vy += factor * m1 * dy;
          }

          // Re-align drawing angles to match new velocity vectors
          b1.angle = Math.atan2(b1.vy, b1.vx);
          b2.angle = Math.atan2(b2.vy, b2.vx);
        }
      }
    };

    // Cross bounces (player vs enemy bullets)
    for (let i = 0; i < s.bullets.length; i++) {
      const pb = s.bullets[i];
      const s1 = pb.isFireSplit ? Math.max(s.bulletSize * 1.5, 32) : currentActiveSize;
      const pbIsPierce = pb.pierceLeft > 0;
      for (let j = 0; j < s.enemyBullets.length; j++) {
        const eb = s.enemyBullets[j];
        const s2 = eb.size || 20;
        resolveBulletBounce(pb, eb, s1, s2, pbIsPierce, false);
      }
    }

    bulletLoop:
    for (let i = s.bullets.length - 1; i >= 0; i--) {
      const b = s.bullets[i];
      const currentSize = b.isFireSplit ? Math.max(s.bulletSize * 1.5, 32) : currentActiveSize;
      if (b.x < s.cameraX - 300 || b.x > s.cameraX + viewWidth + 300 || b.y < s.cameraY - 300 || b.y > s.cameraY + viewHeight + 300) { b.el.remove(); s.bullets.splice(i, 1); continue; }
      if (s.fireshot > 0) {
        b.animTimer += dt;
        if (b.animTimer >= 200) {
          b.animTimer = 0;
          b.animFrame = (b.animFrame + 1) % BULLET_ANIMS.length;
          b.el.src = BULLET_ANIMS[b.animFrame];
        }
      } else {
        if (b.el.src !== DEFAULT_BULLET_SPRITE) b.el.src = DEFAULT_BULLET_SPRITE;
        b.angle += 0.008 * dt;
      }
      b.el.style.left = (b.x - (currentSize / 2) - s.cameraX) + 'px'; b.el.style.top = (b.y - (currentSize / 2) - s.cameraY) + 'px'; b.el.style.transform = `rotate(${b.angle}rad)`;
      for (let j = s.enemies.length - 1; j >= 0; j--) {
        const e = s.enemies[j]; if (!e) continue; const eSize = this.getEnemySize(e);
        if (b.hitEnemies.includes(e.id)) continue;
        if (this.damageEnemyShield(e, b.x, b.y, currentSize, b.id)) {
          if (b.pierceLeft > 0) { b.pierceLeft--; } else { b.el.remove(); s.bullets.splice(i, 1); continue bulletLoop; }
          continue;
        }
        if (this.isCollision(b.x, b.y, currentSize, e.x, e.y, eSize)) {
          // Mimic Cooldown handling for bullet hit
          if (e.type.isMimic) {
            const now = Date.now();
            if (now - (e.lastHitTime || 0) < HIT_COOLDOWN) {
              continue;
            }
            e.lastHitTime = now;
          }

          e.health -= 1; e.lastDamageTime = Date.now(); b.hitEnemies.push(e.id);
          if (!b.isFireSplit) this.triggerFireshotSplit(e.x, e.y, eSize);
          if (e.type.name === 'Magic Mob' && !e.isClone) {
            if (!e.hasSplit) {
              e.hasSplit = true;
              this.spawnMagicClones(e);
            } else {
              this.damageMagicClones(e);
            }
          }
          if (e.health <= 0) { this._killEnemy(e, j, 'bullet', b); }
          if (b.pierceLeft > 0) { b.pierceLeft--; } else { b.el.remove(); s.bullets.splice(i, 1); continue bulletLoop; }
        }
      }
    }

    for (let i = s.enemyBullets.length - 1; i >= 0; i--) {
      const b = s.enemyBullets[i]; const bSize = b.size || 20;
      if (b.animFrames) { b.animTimer += dt; if (b.animTimer >= 200) { b.animTimer = 0; b.animFrame = (b.animFrame + 1) % b.animFrames.length; b.el.src = b.animFrames[b.animFrame]; } }
      if (this.isCollision(b.x, b.y, bSize, px, py, PLAYER_HITBOX_SIZE)) { this.takeDamage(b.source || 'Enemy Projectile'); b.el.remove(); s.enemyBullets.splice(i, 1); continue; }
      
      if (b.spinAngle !== undefined && b.spinSpeed !== undefined) {
        b.spinAngle += b.spinSpeed * dt;
      }
      const rotVal = b.spinAngle !== undefined ? b.spinAngle : (b.angle || Math.atan2(b.vy, b.vx));
      b.el.style.left = (b.x - (bSize / 2) - this.state.cameraX) + 'px'; b.el.style.top = (b.y - (bSize / 2) - this.state.cameraY) + 'px'; b.el.style.transform = `rotate(${rotVal}rad)`;
      if (b.x < s.cameraX - 200 || b.x > s.cameraX + viewWidth + 200 || b.y < s.cameraY - 200 || b.y > s.cameraY + viewHeight + 200) { b.el.remove(); s.enemyBullets.splice(i, 1); }
    }

    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const e = s.enemies[i];
      if (!e) continue;

      if (e.health <= 0) {
        this._killEnemy(e, i, 'bullet');
        continue;
      }

      const visible = this.isOnScreen(e.x, e.y, 200);

      if (visible) {
        if (e.isUnloaded) {
          e.el = this.createEnemyElement(e);
          e.isUnloaded = false;
          this.syncEnemyShieldSystem(e);
        }

        if (e.isClone && e.cloneAnimating) {
          const elapsed = Date.now() - (e.cloneSpawnTime || 0);
          const progress = Math.min(elapsed / CLONE_ANIMATION_DURATION, 1);
          const eased = progress * (2 - progress);
          const targetX = (e.cloneStartX || 0) + Math.cos(e.cloneAngle || 0) * CLONE_FINAL_RADIUS;
          const targetY = (e.cloneStartY || 0) + Math.sin(e.cloneAngle || 0) * CLONE_FINAL_RADIUS;
          e.x = (e.cloneStartX || 0) + (targetX - (e.cloneStartX || 0)) * eased;
          e.y = (e.cloneStartY || 0) + (targetY - (e.cloneStartY || 0)) * eased;
          if (progress >= 1) e.cloneAnimating = false;
        } else {
          const dx = s.x - e.x, dy = s.y - e.y;
          const dist = Math.hypot(dx, dy) || 1;
          const enemySpeed = e.isPrimed ? 0 : this.getEnemySpeed(e);
          e.x += (dx / dist) * enemySpeed;
          e.y += (dy / dist) * enemySpeed;
        }

        const eSize = this.getEnemySize(e);
        if (e.type.isBomber) {
          let flashInterval = 150;
          if (e.isPrimed) {
            const progress = Math.min((e.primedTimer || 0) / 2000, 1);
            flashInterval = 150 - progress * 110; // speeds up from 150ms down to 40ms!
          }
          const frame = Math.floor(Date.now() / flashInterval) % BOMBER_SPRITES.length;
          if (e.animFrame !== frame) {
            e.animFrame = frame;
            if (e.el) e.el.src = BOMBER_SPRITES[frame];
          }
          
          const cx = e.x + eSize / 2;
          const cy = e.y + eSize / 2;
          const distToPlayer = Math.hypot(px - cx, py - cy);

          // Once within 300px, prime the explosion!
          if (distToPlayer <= 300 && !e.isPrimed) {
            e.isPrimed = true;
            e.primedTimer = 0;
            this.playSound(SOUNDS.BOMBER_FUSE);
          }

          if (e.isPrimed) {
            e.primedTimer = (e.primedTimer || 0) + dt;
            if (e.primedTimer >= 2000) {
              this.explodeBomber(e);
              continue;
            }
          }
        }
        if (e.type.isMimic && e.el) {
          e.el.src = this.getEnemySprite(e);
          e.el.style.width = eSize + 'px';
          // FIXED: Flashes translucent when mimic is in hits-cooldown state
          const inCooldown = Date.now() - (e.lastHitTime || 0) < HIT_COOLDOWN;
          e.el.style.opacity = inCooldown ? (Math.floor(Date.now() / 100) % 2 === 0 ? '0.3' : '0.8') : '1.0';
        }
        if (e.el) {
          if (e.type.isBomber && e.isPrimed && e.primedTimer !== undefined) {
            const progress = Math.min(e.primedTimer / 2000, 1);
            // Dynamic linear growth + rapid, high-frequency pulsation to simulate boiling/bubbling
            const scale = 1.0 + progress * 0.9 + Math.abs(Math.sin(e.primedTimer * 0.025)) * 0.25;
            const displaySize = eSize * scale;
            e.el.style.width = displaySize + 'px';
            const offset = (displaySize - eSize) / 2;
            e.el.style.left = (e.x - offset - s.cameraX) + 'px';
            e.el.style.top = (e.y - offset - s.cameraY) + 'px';
          } else {
            e.el.style.width = eSize + 'px';
            e.el.style.left = (e.x - s.cameraX) + 'px';
            e.el.style.top = (e.y - s.cameraY) + 'px';
          }
          const ecx = e.x + eSize / 2;
          const ecy = e.y + eSize / 2;
          const dxTotal = px - ecx, dyTotal = py - ecy;
          e.el.style.transform = `rotate(${Math.atan2(dyTotal, dxTotal)}rad)`;

          const isHitFlashing = Date.now() - (e.lastDamageTime || 0) < 150;
          if (isHitFlashing) {
            e.el.style.filter = 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(15) brightness(1.8)';
          } else {
            e.el.style.filter = 'none';
          }
        }
        if (e.type.name === 'Magic Mob') {
          // FIXED: Both original and clones use e.shootInterval to slow down and match perfectly!
          if (!e.isClone && Date.now() - e.lastShot > (e.shootInterval || 2000)) {
            e.lastShot = Date.now();
            this.shootMagicBullet(e);
            e.shootInterval = 1800 + Math.random() * 2200;
          }
          if (e.isClone && !e.cloneAnimating && Date.now() - e.lastShot > (e.shootInterval || 2000)) {
            e.lastShot = Date.now();
            this.shootMagicBullet(e);
            e.shootInterval = 1800 + Math.random() * 2200;
          }
        } else {
          this.updateEnemyShooting(e);
        }
        if (this.isCollision(px, py, PLAYER_HITBOX_SIZE, e.x, e.y, eSize)) { this.takeDamage(e.isClone ? 'Magic Clone' : e.type.name); }
      } else {
        const dx = s.x - e.x, dy = s.y - e.y;
        const dist = Math.hypot(dx, dy) || 1;
        const enemySpeed = this.getEnemySpeed(e);
        e.x += (dx / dist) * enemySpeed;
        e.y += (dy / dist) * enemySpeed;

        if (!e.isUnloaded) {
          if (e.el) e.el.remove();
          this.clearEnemyShieldElements(e);
          e.isUnloaded = true;
        }
      }
    }
    this.animationId = requestAnimationFrame(this.update);
  }

  public _killEnemy(e: Enemy, j: number, source: string, bullet?: Bullet) {
    const s = this.state;
    const coinReward = e.type.coins;
    s.coins += coinReward;
    if (!s.mobKills) s.mobKills = {};
    s.mobKills[e.type.name] = (s.mobKills[e.type.name] || 0) + 1;
    this.triggerMissionEvent('kill_mob', 1, { mobType: e.type.name }); this.triggerMissionEvent('kill_any', 1); this.triggerMissionEvent('collect_coins', e.type.coins);
    if (s.multishot > 0) this.triggerMissionEvent('multishot_kill', 1);
    if (s.bulletPierce > 0 && source === 'bullet') this.triggerMissionEvent('pierce_kill', 1);
    this.emitState();

    // FIXED: Play quieter Fast Mob death sound!
    switch (e.type.name) {
      case 'Basic Mob': this.playMobSound(SOUNDS.KILL_BASIC, e.x, e.y, this.getEnemySize(e)); break;
      case 'Fast Mob': this.playMobSound(SOUNDS.KILL_FAST, e.x, e.y, this.getEnemySize(e), 0.25); break;
      case 'Big Mob': this.playMobSound(SOUNDS.KILL_BIG, e.x, e.y, this.getEnemySize(e)); break;
      case 'Beefy Mob': this.playMobSound(SOUNDS.KILL_BEEFY, e.x, e.y, this.getEnemySize(e)); break;
      case 'Magic Mob': this.playMobSound(SOUNDS.KILL_SHOOTER, e.x, e.y, this.getEnemySize(e)); break;
      case 'Shooter Mob': this.playMobSound(SOUNDS.KILL_SHOOTER, e.x, e.y, this.getEnemySize(e)); break;
      case 'Armored Mob': this.playMobSound(SOUNDS.KILL_ARMORED, e.x, e.y, this.getEnemySize(e)); break;
      case 'Mimic Mob': this.playMobSound(SOUNDS.KILL_MIMIC, e.x, e.y, this.getEnemySize(e)); break;
      case 'Bomber Mob':
        this.stopSound(SOUNDS.BOMBER_FUSE);
        this.playMobSound(SOUNDS.BOMBER_KILL, e.x, e.y, this.getEnemySize(e), 0.7);
        break;
    }
    if (e.type.name === 'Magic Mob' && !e.isClone) {
      s.enemies.forEach(enemy => {
        if (enemy.isClone && enemy.originalId === e.el) {
          if (enemy.el) enemy.el.remove();
        }
      });
      s.enemies = s.enemies.filter(enemy => !(enemy.isClone && enemy.originalId === e.el));
      if (bullet) { bullet.sessionKills = (bullet.sessionKills || 0) + 1; this.triggerMissionEvent('bullet_multikill', 1, { killCount: bullet.sessionKills }); }
    }
    this.clearEnemyShieldElements(e);
    if (e.el) e.el.remove();
    const actualIdx = s.enemies.indexOf(e);
    if (actualIdx !== -1) {
      s.enemies.splice(actualIdx, 1);
    }
  }

  public destroy() {
    cancelAnimationFrame(this.animationId);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('click', this.resumeMusic);
    document.removeEventListener('contextmenu', this.handleContextMenu, true);
    document.removeEventListener('dragstart', this.preventNativeDrag, true);
    document.removeEventListener('selectstart', this.preventNativeDrag, true);
    document.removeEventListener('wheel', this.preventBrowserZoom, true);
    document.removeEventListener('keydown', this.preventBrowserZoom, true);
    document.removeEventListener('gesturestart', this.preventBrowserZoom, true);
    document.removeEventListener('gesturechange', this.preventBrowserZoom, true);
    document.removeEventListener('gestureend', this.preventBrowserZoom, true);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('resize', this.handleResize);
    clearTimeout(this.missionPopupTimer); clearTimeout(this.deathTimeout); clearTimeout(this.hitFlashTimeout);
    if (this.state.currentMusic) this.state.currentMusic.pause();
    if (this.state.shopMusic) this.state.shopMusic.pause();
    this.clearPhysicalShopItems();
    this.clearShieldElements();
    this.state.enemies.forEach(e => { this.clearEnemyShieldElements(e); if (e.el) e.el.remove(); });
    this.state.bullets.forEach(b => b.el.remove());
    this.state.enemyBullets.forEach(b => b.el.remove());
    this.state.explosions.forEach(ex => ex.el.remove());
    this.state.particles.forEach(p => p.el.remove());
    if (this.state.shopEntranceEl) this.state.shopEntranceEl.remove();
    if (this.state.shopExitEl) this.state.shopExitEl.remove();
    if (this.state.shopArrowEl) this.state.shopArrowEl.remove();
    if (this.state.shopArrowTextEl) this.state.shopArrowTextEl.remove();
    if (this.playerEl) this.playerEl.remove();
    if (this.testBoxEl) this.testBoxEl.remove();
  }
}
