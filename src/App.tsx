import { useState, useEffect, useRef } from 'react';
import { GameMap } from './components/GameMap';
import { MessageBox } from './components/MessageBox';
import { NPCEditor } from './components/NPCEditor';
import { AudioManager } from './components/AudioManager';
import { Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from './components/ui/button';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface NPC {
  id: number;
  name: string;
  position: Position;
  message: string;
  color: string;
  direction: Direction;
}

type GamePhase = 'title' | 'intro1' | 'intro2' | 'play';

// マップの障害物データ（1=障害物あり、0=通行可能）
const MAP_OBSTACLES = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export default function App() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 5, y: 5 });
  const [playerDirection, setPlayerDirection] = useState<Direction>('down');
  const [walkFrame, setWalkFrame] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('title');
  const [npcs, setNpcs] = useState<NPC[]>([
    {
      id: 1,
      name: 'フィナ王',
      position: { x: 8, y: 4 },
      message: 'おーワカナよ\n吐いてしまうとはなさけない',
      color: '#4a9eff',
      direction: 'down'
    },
    {
      id: 2,
      name: 'ハルテック',
      position: { x: 12, y: 7 },
      message: 'ワカナさんは当時取引先だった旦那さまと出会って\n1ヶ月で付き合ったんだって！',
      color: '#ff6b6b',
      direction: 'left'
    },
    {
      id: 3,
      name: 'レイゾウ',
      position: { x: 3, y: 9 },
      message: 'ここだけの話...\nわかなさんは学生は結構クソだったらしい。\nバイトも１年続いたことないわ、飛ぶわ。\n\n前職のTOTOで９年も続いたことがびっくりされたそうだよ。',
      color: '#95e1d3',
      direction: 'right'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef<{ playWalk: () => void; playTalk: () => void; playMenuOpen: () => void } | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef(0);
  const introMessageShownRef = useRef(false);
  const pendingIntroTalkRef = useRef(false);

  useEffect(() => {
    setGamePhase('title');
    setCurrentMessage(null);
    introMessageShownRef.current = false;
    pendingIntroTalkRef.current = false;
    keysPressed.current.clear();
    setPlayerPos({ x: 5, y: 5 });
    setPlayerDirection('down');
    setWalkFrame(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (gamePhase === 'title') {
          e.preventDefault();
          setGamePhase('intro1');
          return;
        }

        if (gamePhase === 'intro1') {
          e.preventDefault();
          setGamePhase('intro2');
          return;
        }

        if (gamePhase === 'intro2') {
          e.preventDefault();
          setPlayerPos({ x: 8, y: 5 });
          setPlayerDirection('up');
          setWalkFrame(0);
          lastMoveTime.current = Date.now();
          setGamePhase('play');
          return;
        }
      }

      if (gamePhase !== 'play') {
        return;
      }

      keysPressed.current.add(e.key);

      // スペースキーでNPCに話しかける
      if (e.key === ' ' && !currentMessage) {
        const nearbyNPC = npcs.find((npc) =>
          Math.abs(npc.position.x - playerPos.x) <= 1 &&
          Math.abs(npc.position.y - playerPos.y) <= 1
        );
        if (nearbyNPC) {
          setCurrentMessage(nearbyNPC.message);
          if (soundEnabled && soundRef.current) {
            soundRef.current.playTalk();
          }
        }
      }

      // Enterキーでメッセージを閉じる
      if (e.key === 'Enter' && currentMessage) {
        setCurrentMessage(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gamePhase !== 'play') {
        return;
      }
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gamePhase, npcs, playerPos, currentMessage, soundEnabled]);

  useEffect(() => {
    if (gamePhase !== 'play') {
      return;
    }

    const moveInterval = setInterval(() => {
      if (currentMessage) return; // メッセージ表示中は移動不可

      const now = Date.now();
      if (now - lastMoveTime.current < 150) return;

      let newX = playerPos.x;
      let newY = playerPos.y;
      let newDirection = playerDirection;
      let moved = false;

      if (keysPressed.current.has('ArrowUp')) {
        newY -= 1;
        newDirection = 'up';
        moved = true;
        lastMoveTime.current = now;
      } else if (keysPressed.current.has('ArrowDown')) {
        newY += 1;
        newDirection = 'down';
        moved = true;
        lastMoveTime.current = now;
      } else if (keysPressed.current.has('ArrowLeft')) {
        newX -= 1;
        newDirection = 'left';
        moved = true;
        lastMoveTime.current = now;
      } else if (keysPressed.current.has('ArrowRight')) {
        newX += 1;
        newDirection = 'right';
        moved = true;
        lastMoveTime.current = now;
      }

      // 向きだけ変更
      if (moved) {
        setPlayerDirection(newDirection);
      }

      // マップの境界チェック
      if (newX >= 0 && newX < 16 && newY >= 0 && newY < 12) {
        // 障害物チェック
        if (MAP_OBSTACLES[newY][newX] === 1) {
          return;
        }
        
        // NPCとの衝突チェック
        const collision = npcs.some(npc => 
          npc.position.x === newX && npc.position.y === newY
        );
        if (!collision && moved) {
          setPlayerPos({ x: newX, y: newY });
          setWalkFrame((prev) => (prev + 1) % 2);
          if (soundEnabled && soundRef.current) {
            soundRef.current.playWalk();
          }
        }
      }
    }, 50);

    return () => clearInterval(moveInterval);
  }, [playerPos, playerDirection, npcs, currentMessage, soundEnabled, gamePhase]);

  useEffect(() => {
    if (gamePhase !== 'play') {
      keysPressed.current.clear();
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase !== 'play' || introMessageShownRef.current) {
      return;
    }

    introMessageShownRef.current = true;
    const finaKing = npcs.find((npc) => npc.name === 'フィナ王');
    if (finaKing) {
      setCurrentMessage(finaKing.message);
      if (soundEnabled) {
        if (soundRef.current) {
          soundRef.current.playTalk();
        } else {
          pendingIntroTalkRef.current = true;
        }
      }
    }
  }, [gamePhase, npcs, soundEnabled]);

  const updateNPC = (id: number, message: string) => {
    setNpcs(npcs.map(npc => 
      npc.id === id ? { ...npc, message } : npc
    ));
  };

  const handleEditorToggle = () => {
    setShowEditor(!showEditor);
    if (soundEnabled && soundRef.current) {
      soundRef.current.playMenuOpen();
    }
  };

  const renderOverlay = () => {
    if (gamePhase === 'title') {
      return (
        <div className=" inset-0 bg-black text-white flex flex-col items-center justify-center gap-6">
          <div className="text-3xl font-bold tracking-[0.4em]">INTRO QUEST</div>
          <div className="text-sm text-white/70">Enterで始める</div>
        </div>
      );
    }

    if (gamePhase === 'intro1' || gamePhase === 'intro2') {
      const introText = gamePhase === 'intro1' ? '...く...い' : '…くるしい…';
      return (
        <div className=" inset-0 bg-black text-white flex flex-col items-center justify-center gap-6">
          <div className="text-lg whitespace-pre text-center">{introText}</div>
          <div className="text-xs text-white/60">Enterで進む</div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative">
        {/* BGM & 効果音 */}
        {soundEnabled && (
          <AudioManager onPlaySound={(sound) => { soundRef.current = sound; }} />
        )}
        
        {/* ゲーム画面 */}
        <div className="relative border-8 border-[#2c2c2c] rounded-lg overflow-hidden shadow-2xl w-[512px] h-[384px]">
          {gamePhase === 'play' && (
            <>
              <GameMap 
                playerPos={playerPos} 
                playerDirection={playerDirection}
                walkFrame={walkFrame}
                npcs={npcs} 
                obstacles={MAP_OBSTACLES}
              />
              {currentMessage && <MessageBox message={currentMessage} />}

              {/* 操作説明 */}
              <div className="absolute top-2 left-2 bg-black/80 text-white px-3 py-2 rounded text-xs font-mono">
                <div>矢印キー: 移動</div>
                <div>スペース: 話しかける</div>
                <div>Enter: メッセージを閉じる</div>
              </div>
            </>
          )}

          {renderOverlay()}
        </div>

        {/* コントロールボタン */}
        <div className="hidden absolute -top-12 right-0 flex gap-2">
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="icon"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            onClick={handleEditorToggle}
            className="gap-2"
            variant={showEditor ? "default" : "outline"}
          >
            <Settings className="w-4 h-4" />
            NPC編集
          </Button>
        </div>

        {/* NPC編集パネル */}
        {showEditor && (
          <div className="absolute -right-80 top-0 w-72">
            <NPCEditor npcs={npcs} onUpdateNPC={updateNPC} />
          </div>
        )}
      </div>
    </div>
  );
}
