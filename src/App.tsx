import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameEngine } from "./GameEngine";
import { GameState, LIFE_IMAGES, COIN_ICON_URL, CURSOR_URL, ENCHANTMENTS, getEnchantmentPrice, DEV_STAT_LIMITS, ENEMY_TYPES } from "./types";

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [uiState, setUiState] = useState<GameState>({
    gameStarted: false,
    isPaused: false,
    isDead: false,
    devUnlocked: false,
    showDevPassword: false,
    lives: 3,
    maxLives: 3,
    coins: 0,
    worldMusicVolume: 30,
    shopMusicVolume: 30,
    sfxVolume: 50,
    deathMessage: "",
    scoreMessage: "",
    hitFlash: false,
    showDeathScreen: false,
    shopFade: 0,
    inShop: false,
    shopOverlayVisible: false,
    enchantmentLevels: {},
    missionProgress: { visible: false, text: "", progress: 0, target: 0 },
    missionPopup: { title: "", desc: "", visible: false },
    shopMissions: [],
    devValues: {
      acceleration: 0.6,
      friction: 0.9,
      bulletSpeed: 8,
      bulletSize: 20,
      fireRate: 6,
      bulletPierce: 0,
      multishot: 0,
      fireshot: 0,
      shield: 0,
      maxLives: 3,
      lives: 3,
      coins: 0,
    },
    mobKills: {},
    enemiesPopupVisible: false,
  });

  const [devPasswordInput, setDevPasswordInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (uiState.enemiesPopupVisible && scrollContainerRef.current) {
      let lastKilledIdx = 0;
      for (let i = ENEMY_TYPES.length - 1; i >= 0; i--) {
        const mob = ENEMY_TYPES[i];
        const kills = uiState.mobKills?.[mob.name] || 0;
        if (kills > 0) {
          lastKilledIdx = i;
          break;
        }
      }
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const cardElement = scrollContainerRef.current.children[lastKilledIdx] as HTMLElement;
          if (cardElement) {
            scrollContainerRef.current.scrollTo({
              left: cardElement.offsetLeft - 30,
              behavior: "smooth"
            });
          }
        }
      }, 150);
    }
  }, [uiState.enemiesPopupVisible, uiState.mobKills]);

  const getMobExtraInfo = (name: string) => {
    switch (name) {
      case "Basic Mob": return "Just a normal drone that slowly runs at you. Super easy to kill.";
      case "Fast Mob": return "Really fast but dies in one hit. Watch out so it doesn't sneak up on you!";
      case "Big Mob": return "Very slow but has a lot of health. Takes a few extra hits to destroy.";
      case "Bomber Mob": return "Gets close and blows up! Run away before it triggers its explosion.";
      case "Beefy Mob": return "A giant block of steel with massive health. Keep shooting until it drops.";
      case "Shooter Mob": return "Stops every few seconds to shoot two lasers at you. Dodge them!";
      case "Magic Mob": return "Splits into tiny clones when you hit it! Clear them out fast.";
      case "Mimic Mob": return "This one copies your own upgrades! It shoots just like you and has a shield.";
      case "Armored Mob": return "Spins strong shields and shoots bullets in all directions. Hard to defeat!";
      default: return "A generic bad guy.";
    }
  };
  const [devPasswordError, setDevPasswordError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Instantiate high-performance game engine
    const gameInstance = new GameEngine(containerRef.current, (state) => {
      setUiState(state);
    });

    setEngine(gameInstance);

    return () => {
      gameInstance.destroy();
    };
  }, []);

  // Determine life display height
  let lifeHeight = "h-10";
  if (uiState.maxLives === 4) lifeHeight = "h-9";
  if (uiState.maxLives === 5) lifeHeight = "h-8";
  if (uiState.maxLives >= 6) lifeHeight = "h-7";

  const currentLifeKey = `${uiState.lives}/${uiState.maxLives}`;
  const lifeImageSrc = LIFE_IMAGES[currentLifeKey] || LIFE_IMAGES["0/3"];

  const handleStartGame = () => {
    if (engine) engine.startGame();
  };

  const handlePauseToggle = () => {
    if (engine) engine.togglePause();
  };

  const handleRestart = () => {
    if (engine) engine.restart();
  };

  const handleDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engine) return;
    const isCorrect = engine.checkDevPassword(devPasswordInput);
    if (!isCorrect) {
      setDevPasswordError(true);
      setTimeout(() => setDevPasswordError(false), 1500);
    }
    setDevPasswordInput("");
  };

  const handleDevCancel = () => {
    if (engine) engine.cancelDevPassword();
  };

  const handleDevValueChange = (key: string, val: number) => {
    if (engine) engine.setDevValue(key, val);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-white font-press-start">
      {/* Game Canvas Container */}
      <div
        id="game-container"
        ref={containerRef}
        className="absolute inset-0 z-0 overflow-hidden"
        style={{
          cursor: `url("${CURSOR_URL}") 16 16, auto`,
        }}
      />

      {/* Hit Flash overlay */}
      {uiState.hitFlash && (
        <div className="fixed inset-0 bg-red-600/30 pointer-events-none z-10 transition-opacity duration-75" />
      )}

      {/* Black Fade Overlay for Shop transitions */}
      <div
        className="fixed inset-0 bg-black pointer-events-none z-50 transition-opacity duration-300"
        style={{
          opacity: uiState.shopFade,
        }}
      />

      {/* HUD - Top Left Lives & Coins */}
      {uiState.gameStarted && (
        <div className="fixed top-5 left-5 z-20 flex flex-col gap-3 pointer-events-none">
          {/* Heart Health bar */}
          <img
            src={lifeImageSrc}
            alt="Lives Indicator"
            className={`${lifeHeight} w-auto object-contain drop-shadow-[2px_2px_0px_#000]`}
          />

          {/* Coin balance panel */}
          <div className="flex items-center gap-2 drop-shadow-[2px_2px_0px_#000]">
            <img src={COIN_ICON_URL} alt="Coins" className="h-16 w-auto object-contain" />
            <span className="text-2xl text-yellow-400">x{uiState.coins}</span>
          </div>
        </div>
      )}

      {/* Pause Button - Top Right */}
      {uiState.gameStarted && !uiState.isDead && (
        <button
          onClick={handlePauseToggle}
          className="fixed top-5 right-5 z-20 px-6 py-3 bg-neutral-900/85 border-2 border-white text-white hover:bg-neutral-800 active:translate-y-0.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-xs cursor-pointer"
        >
          {uiState.isPaused ? "RESUME" : "PAUSE"}
        </button>
      )}

      {/* Mission Progress HUD Indicator (Compact fraction under the Pause button) */}
      <AnimatePresence>
        {uiState.gameStarted && uiState.missionProgress.visible && (
          <motion.div
            key="mission-progress-hud"
            initial={{ opacity: 0, scale: 0.5, y: -20, x: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20, x: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="fixed top-[72px] right-5 z-20 p-2 bg-green-600/95 border-2 border-green-900 rounded-none shadow-[2px_2px_0px_#000] pointer-events-none text-center flex items-center justify-center min-w-[70px]"
          >
            <motion.span
              key={uiState.missionProgress.progress}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-[10px] font-bold text-white whitespace-nowrap font-press-start tracking-tight"
            >
              {uiState.missionProgress.progress}/{uiState.missionProgress.target}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-up message overlays (Spawned and kept at top center, with spring animate entry/exit) */}
      <AnimatePresence>
        {uiState.missionPopup.visible && (
          <motion.div
            key={`${uiState.missionPopup.title}-${uiState.missionPopup.desc}`}
            initial={{ opacity: 0, scale: 0.6, x: "-50%", y: -50, top: "20px", left: "50%" }}
            animate={{
              opacity: 1,
              scale: 1,
              x: "-50%",
              top: "20px",
              y: 0,
              left: "50%",
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              y: -80,
              transition: { duration: 0.3, ease: "easeIn" }
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 15,
              mass: 1,
            }}
            className="fixed z-30 flex flex-col items-center gap-2 w-[calc(100%-32px)] sm:w-auto sm:max-w-md bg-neutral-900/95 border-4 border-yellow-400 p-4 rounded-none shadow-[4px_4px_0px_#000] pointer-events-none text-center"
          >
            <p className="text-yellow-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">{uiState.missionPopup.title}</p>
            <p className="text-white text-[9px] sm:text-[10px] leading-relaxed max-w-sm">{uiState.missionPopup.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STARTUP MENU */}
      {!uiState.gameStarted && (
        <div className="fixed inset-0 bg-radial from-neutral-100 to-neutral-300 z-40 flex flex-col items-center justify-center gap-10">
          <h1 className="text-yellow-400 text-3xl md:text-5xl lg:text-6xl text-center select-none tracking-wider drop-shadow-[5px_5px_0px_#000] leading-snug">
            THE GRINDULATOR
          </h1>
          {/* Start button has explicit cursor and works flawlessly */}
          <button
            onClick={handleStartGame}
            className="px-12 py-6 bg-white border-4 border-neutral-900 text-neutral-900 text-xl md:text-2xl hover:bg-neutral-100 active:translate-y-1 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            START GAME
          </button>
          <p className="absolute right-5 bottom-5 text-neutral-800 text-[10px]">
            Made by Alexander Newton
          </p>
        </div>
      )}

      {/* PAUSE MENU OVERLAY */}
      {uiState.isPaused && !uiState.showDevPassword && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center">
          <div className="w-[460px] max-w-[90vw] bg-neutral-900/95 border-4 border-white shadow-[8px_8px_0px_#000] p-5 flex flex-col items-center gap-3.5 max-h-[85vh] overflow-y-auto">
            <h2 className="text-white text-xl text-center tracking-wide mb-1 drop-shadow-[2px_2px_0px_#000]">
              YOU ARE PAUSED
            </h2>

            {/* World Music volume control */}
            <div className="w-full flex flex-col gap-1 items-center">
              <span className="text-[9px] text-white">WORLD MUSIC: {uiState.worldMusicVolume}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={uiState.worldMusicVolume}
                onChange={(e) => {
                  if (engine) engine.setWorldMusicVolume(parseInt(e.target.value));
                }}
                className="w-4/5 h-2.5 bg-neutral-800 border-2 border-white rounded-none accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* Shop Music volume control */}
            <div className="w-full flex flex-col gap-1 items-center">
              <span className="text-[9px] text-white">SHOP MUSIC: {uiState.shopMusicVolume}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={uiState.shopMusicVolume}
                onChange={(e) => {
                  if (engine) engine.setShopMusicVolume(parseInt(e.target.value));
                }}
                className="w-4/5 h-2.5 bg-neutral-800 border-2 border-white rounded-none accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* Sound FX volume control */}
            <div className="w-full flex flex-col gap-1 items-center">
              <span className="text-[9px] text-white">SOUND EFFECTS: {uiState.sfxVolume}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={uiState.sfxVolume}
                onChange={(e) => {
                  if (engine) engine.setSfxVolume(parseInt(e.target.value));
                }}
                className="w-4/5 h-2.5 bg-neutral-800 border-2 border-white rounded-none accent-yellow-400 cursor-pointer"
              />
            </div>

            {/* Current Active Mission status */}
            <div className="w-full flex flex-col gap-1 items-center border-t border-neutral-700 pt-3">
              <span className="text-[9px] text-neutral-400">CURRENT MISSION</span>
              <div className="max-h-20 overflow-y-auto w-full text-center">
                {uiState.shopMissions.length === 0 ? (
                  <p className="text-[8px] text-yellow-400">NONE ACTIVE</p>
                ) : (
                  uiState.shopMissions.map((sm, idx) => (
                    <p
                      key={idx}
                      className={`text-[8px] leading-relaxed mb-0.5 ${
                        sm.done ? "text-green-400" : "text-yellow-400"
                      }`}
                    >
                      {sm.done ? "[DONE] " : ""}
                      {sm.desc} ({sm.progress}/{sm.target})
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* DEV TESTS unlocking gate */}
            <button
              onClick={() => {
                if (engine) engine.openDevPassword();
              }}
              disabled={uiState.devUnlocked}
              className={`px-3 py-1.5 border-2 border-white text-white hover:bg-neutral-800 text-[10px] shadow-[2px_2px_0px_#000] cursor-pointer mt-1 ${
                uiState.devUnlocked ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              DEV TESTS
            </button>

            {/* Expanded Real-time Developer controls panel once unlocked */}
            {uiState.devUnlocked && (
              <div className="w-full flex flex-col gap-4 border-t-2 border-dashed border-white pt-5 mt-2 overflow-y-visible">
                <button
                  onClick={() => {
                    if (engine) engine.skipMission();
                  }}
                  className="w-4/5 self-center py-3 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/20 text-[10px] shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  SKIP MISSION
                </button>

                {/* Developer Tweak Sliders */}
                <div className="flex flex-col gap-4">
                  {[
                    { label: "ACCEL", key: "acceleration", format: (v: number) => v.toFixed(1) },
                    { label: "FRICTION", key: "friction", format: (v: number) => v.toFixed(2) },
                    { label: "BULLET SPEED", key: "bulletSpeed", format: (v: number) => v.toFixed(1) },
                    { label: "BULLET SIZE", key: "bulletSize", format: (v: number) => Math.round(v) },
                    { label: "FIRE RATE", key: "fireRate", format: (v: number) => v.toFixed(1) },
                    { label: "BULLET PIERCE", key: "bulletPierce", format: (v: number) => Math.round(v) },
                    { label: "MULTISHOT", key: "multishot", format: (v: number) => Math.round(v) },
                    { label: "FIRESHOT", key: "fireshot", format: (v: number) => Math.round(v) },
                    { label: "SHIELD", key: "shield", format: (v: number) => Math.round(v) },
                    { label: "MAX LIVES", key: "maxLives", format: (v: number) => Math.round(v) },
                    {
                      label: "LIVES",
                      key: "lives",
                      min: 0,
                      max: uiState.devValues.maxLives,
                      step: 1,
                      format: (v: number) => Math.round(v),
                    },
                    { label: "COINS", key: "coins", format: (v: number) => Math.round(v) },
                  ].map((s) => {
                    const devVal = (uiState.devValues as any)[s.key];
                    return (
                      <div key={s.key} className="flex flex-col gap-1 items-center">
                        <span className="text-[9px] text-white text-center">
                          {s.label}: {s.format(devVal)}
                        </span>
                        <input
                          type="range"
                          min={s.min !== undefined ? s.min : (DEV_STAT_LIMITS as any)[s.key]?.min}
                          max={s.max !== undefined ? s.max : (DEV_STAT_LIMITS as any)[s.key]?.max}
                          step={s.step !== undefined ? s.step : (DEV_STAT_LIMITS as any)[s.key]?.step}
                          value={devVal}
                          onChange={(e) => handleDevValueChange(s.key, parseFloat(e.target.value))}
                          className="w-4/5 h-2 bg-neutral-800 border border-white rounded-none accent-yellow-400 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RESUME BUTTON */}
            <button
              onClick={handlePauseToggle}
              className="w-3/5 py-2 bg-neutral-800 border-2 border-white text-white hover:bg-neutral-700 active:translate-y-0.5 text-[11px] shadow-[2px_2px_0px_#000] cursor-pointer mt-1"
            >
              RESUME
            </button>
          </div>
        </div>
      )}

      {/* DEV PASSWORD ENTRY SCREEN */}
      {uiState.showDevPassword && (
        <div className="fixed inset-0 bg-black/75 z-40 flex items-center justify-center">
          <div className="w-[380px] bg-neutral-900 border-4 border-yellow-400 shadow-[6px_6px_0px_#000] p-6 flex flex-col items-center gap-4 text-center">
            <p className="text-white text-xs">ENTER ACCESS CODE:</p>
            <form onSubmit={handleDevSubmit} className="w-full flex flex-col items-center gap-4">
              <input
                type="password"
                placeholder="******"
                value={devPasswordInput}
                onChange={(e) => setDevPasswordInput(e.target.value)}
                style={{
                  borderColor: devPasswordError ? "red" : "#fff",
                }}
                className="w-4/5 p-2 font-press-start text-xs text-center border-2 bg-black text-yellow-400 outline-none transition-colors duration-150"
              />
              <div className="flex gap-3 w-4/5">
                <button
                  type="button"
                  onClick={handleDevCancel}
                  className="flex-1 py-2 border-2 border-white bg-neutral-800 text-white text-[10px] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 border-2 border-yellow-400 bg-neutral-800 text-yellow-400 text-[10px] cursor-pointer"
                >
                  ENTER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GAME OVER / DEATH SCREEN */}
      {uiState.showDeathScreen && (
        <div className="fixed inset-0 bg-black/90 z-45 flex flex-col items-center justify-center gap-6">
          <p className="text-white text-xl md:text-2xl text-center leading-relaxed drop-shadow-[2px_2px_0px_#000]">
            {uiState.deathMessage}
          </p>
          <p className="text-yellow-400 text-lg md:text-xl text-center tracking-widest drop-shadow-[2px_2px_0px_#000]">
            {uiState.scoreMessage}
          </p>
          <button
            onClick={handleRestart}
            className="px-10 py-5 border-4 border-white bg-neutral-800 text-white text-xl hover:bg-neutral-700 active:translate-y-1 shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
          >
            RESTART
          </button>
        </div>
      )}

      {/* ENEMIES DATABASE POPUP */}
      {uiState.enemiesPopupVisible && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-[90vw] max-w-5xl bg-neutral-900 border-4 border-red-600 shadow-[8px_8px_0px_#000] p-6 flex flex-col gap-4 relative">
            <div className="flex justify-between items-center border-b-2 border-dashed border-red-600 pb-3">
              <h2 className="text-red-500 text-lg md:text-xl font-bold tracking-wider">
                ENEMIES
              </h2>
              <button
                onClick={() => {
                  if (engine) engine.closeEnemiesPopup();
                }}
                className="px-3 py-1.5 bg-red-600 text-white text-[10px] hover:bg-red-500 active:translate-y-0.5 shadow-[2px_2px_0px_#000] border border-white cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            {/* Horizontal Scrolling Row */}
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-x-auto py-6 px-3 snap-x scroll-smooth custom-scrollbar"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#e02424 #171717",
              }}
            >
              {ENEMY_TYPES.map((mob, index) => {
                const kills = uiState.mobKills?.[mob.name] || 0;
                const isDiscovered = kills > 0;
                
                // Determine icons / badges
                const canShoot = mob.isShooter || mob.bullet || mob.isMimic;
                const canHaveShield = mob.canHaveShield || mob.isMimic;

                // For the silhouette image:
                const displaySprite = mob.sprite === "player" 
                  ? "https://codehs.com/uploads/c1f80496c09b22885b7c5363c5a39f61" 
                  : mob.sprite;

                return (
                  <div
                    key={mob.name}
                    className={`min-w-[240px] max-w-[240px] snap-center p-4 border-2 flex flex-col items-center gap-3 shadow-[4px_4px_0px_#000] ${
                      isDiscovered
                        ? "bg-neutral-800 border-yellow-400"
                        : "bg-neutral-950 border-neutral-800 opacity-60"
                    }`}
                  >
                    {/* Silhouette or real picture */}
                    <div className="w-24 h-24 flex items-center justify-center bg-black/40 border border-neutral-700/50 p-2 relative">
                      <img
                        src={displaySprite}
                        alt={mob.name}
                        draggable="false"
                        className="max-w-full max-h-full object-contain image-rendering-pixelated"
                        style={{
                          filter: isDiscovered ? "none" : "brightness(0) contrast(0) grayscale(100%)",
                        }}
                      />
                    </div>

                    {/* Mob Name */}
                    <h3 className={`text-[10px] text-center font-bold tracking-tight uppercase ${
                      isDiscovered ? "text-yellow-400" : "text-neutral-500"
                    }`}>
                      {isDiscovered ? mob.name : "UNIDENTIFIED"}
                    </h3>

                    {/* Kills Counter */}
                    <p className="text-[8px] text-neutral-400 font-bold">
                      KILLS: <span className={isDiscovered ? "text-red-500" : "text-neutral-600"}>{kills}</span>
                    </p>

                    {/* Stats */}
                    <div className="w-full flex flex-col gap-1.5 border-t border-neutral-700 pt-2 text-[7px] text-left">
                      <p className="text-white">
                        HP: <span className="text-green-400">{isDiscovered ? (mob.health === "player" ? "SAME AS YOU" : mob.health) : "???"}</span>
                      </p>
                      <p className="text-white">
                        COINS: <span className="text-yellow-400">{isDiscovered ? mob.coins : "???"}</span>
                      </p>
                      <p className="text-neutral-400 text-[6.5px] leading-relaxed mt-1 border-t border-neutral-800 pt-1.5 min-h-[40px]">
                        {isDiscovered ? getMobExtraInfo(mob.name) : "Beat this enemy once to unlock its stats and details!"}
                      </p>
                    </div>

                    {/* Features Badges (bullets and shields) */}
                    <div className="flex gap-2 mt-auto pt-1 w-full justify-center">
                      {isDiscovered && canShoot && (
                        <span className="px-1.5 py-0.5 bg-red-600/30 border border-red-500 text-red-500 text-[6px] font-bold tracking-wider flex items-center gap-1 rounded-none">
                          🔫 SHOOTS
                        </span>
                      )}
                      {isDiscovered && canHaveShield && (
                        <span className="px-1.5 py-0.5 bg-blue-600/30 border border-blue-500 text-blue-500 text-[6px] font-bold tracking-wider flex items-center gap-1 rounded-none">
                          🛡️ SHIELDS
                        </span>
                      )}
                      {!isDiscovered && (
                        <span className="px-1.5 py-0.5 bg-neutral-800 text-neutral-600 text-[6px] font-bold border border-neutral-700">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
