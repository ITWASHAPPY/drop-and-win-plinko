import { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Body, Events, Runner } from "matter-js";
import { BettingControls } from "./BettingControls";
import { GameStats } from "./GameStats";
import { toast } from "sonner";

interface Ball {
  id: string;
  body: Body;
  bet: number;
}

const MULTIPLIERS = [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16];
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;
const PEG_RADIUS = 4;
const BALL_RADIUS = 8;

export const PlinkoGame = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine>();
  const renderRef = useRef<Render>();
  const runnerRef = useRef<Runner>();
  const [balance, setBalance] = useState(1000);
  const [currentBet, setCurrentBet] = useState(1);
  const [isDropping, setIsDropping] = useState(false);
  const [activeBalls, setActiveBalls] = useState<Ball[]>([]);
  const [totalWins, setTotalWins] = useState(0);
  const [totalBets, setTotalBets] = useState(0);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.8;
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false,
        showVelocity: false,
      }
    });
    renderRef.current = render;

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;

    // Create boundaries
    const boundaries = [
      Bodies.rectangle(BOARD_WIDTH / 2, BOARD_HEIGHT + 30, BOARD_WIDTH, 60, { 
        isStatic: true,
        render: { fillStyle: 'transparent' }
      }),
      Bodies.rectangle(-30, BOARD_HEIGHT / 2, 60, BOARD_HEIGHT, { 
        isStatic: true,
        render: { fillStyle: 'transparent' }
      }),
      Bodies.rectangle(BOARD_WIDTH + 30, BOARD_HEIGHT / 2, 60, BOARD_HEIGHT, { 
        isStatic: true,
        render: { fillStyle: 'transparent' }
      }),
    ];

    // Create pegs in triangular formation
    const pegs = [];
    const rows = 12;
    const pegSpacing = 50;
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * pegSpacing;
      const startX = (BOARD_WIDTH - rowWidth) / 2;
      const y = 80 + row * 40;
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = startX + col * pegSpacing;
        const peg = Bodies.circle(x, y, PEG_RADIUS, {
          isStatic: true,
          render: {
            fillStyle: '#8B5CF6',
            strokeStyle: '#A78BFA',
            lineWidth: 1
          },
          restitution: 0.8,
        });
        pegs.push(peg);
      }
    }

    // Create multiplier slots at bottom
    const slotWidth = BOARD_WIDTH / MULTIPLIERS.length;
    const slots = [];
    
    for (let i = 0; i < MULTIPLIERS.length; i++) {
      const x = i * slotWidth + slotWidth / 2;
      const slot = Bodies.rectangle(x, BOARD_HEIGHT - 40, slotWidth - 2, 80, {
        isStatic: true,
        isSensor: true,
        render: {
          fillStyle: MULTIPLIERS[i] >= 2 ? '#10B981' : MULTIPLIERS[i] === 1 ? '#6B7280' : '#EF4444',
          strokeStyle: '#374151',
          lineWidth: 1
        },
        label: `slot-${i}`,
      });
      slots.push(slot);
    }

    // Add all bodies to world
    World.add(engine.world, [...boundaries, ...pegs, ...slots]);

    // Handle collisions with slots
    Events.on(engine, 'afterUpdate', () => {
      const ballsToRemove: Ball[] = [];
      
      activeBalls.forEach(ball => {
        if (ball.body.position.y > BOARD_HEIGHT - 80) {
          const slotIndex = Math.floor(ball.body.position.x / slotWidth);
          const clampedIndex = Math.max(0, Math.min(MULTIPLIERS.length - 1, slotIndex));
          const multiplier = MULTIPLIERS[clampedIndex];
          const winAmount = ball.bet * multiplier;
          
          setBalance(prev => prev + winAmount);
          setTotalWins(prev => prev + winAmount);
          
          if (multiplier > 1) {
            toast.success(`🎉 Win! ${multiplier}x = $${winAmount.toFixed(2)}`);
          } else {
            toast.error(`💔 ${multiplier}x = $${winAmount.toFixed(2)}`);
          }
          
          ballsToRemove.push(ball);
          World.remove(engine.world, ball.body);
        }
      });
      
      if (ballsToRemove.length > 0) {
        setActiveBalls(prev => prev.filter(ball => !ballsToRemove.includes(ball)));
        if (activeBalls.length - ballsToRemove.length === 0) {
          setIsDropping(false);
        }
      }
    });

    // Start engine and renderer
    Render.run(render);
    Runner.run(runner, engine);

    return () => {
      if (renderRef.current) {
        Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
      }
      if (runnerRef.current && engineRef.current) {
        Runner.stop(runnerRef.current);
        Engine.clear(engineRef.current);
      }
    };
  }, []);

  const dropBall = () => {
    if (!engineRef.current || isDropping || balance < currentBet) return;
    
    setBalance(prev => prev - currentBet);
    setTotalBets(prev => prev + currentBet);
    setIsDropping(true);
    
    const ballId = `ball-${Date.now()}`;
    const startX = BOARD_WIDTH / 2 + (Math.random() - 0.5) * 20;
    
    const ball = Bodies.circle(startX, 20, BALL_RADIUS, {
      render: {
        fillStyle: '#F59E0B',
        strokeStyle: '#FBBF24',
        lineWidth: 2
      },
      restitution: 0.6,
      friction: 0.005,
      frictionAir: 0.01,
      label: ballId,
    });
    
    const newBall: Ball = {
      id: ballId,
      body: ball,
      bet: currentBet,
    };
    
    setActiveBalls(prev => [...prev, newBall]);
    World.add(engineRef.current!.world, ball);
    
    toast.info(`🎯 Ball dropped! Bet: $${currentBet}`);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            PLINKO
          </h1>
          <p className="text-muted-foreground">Drop the ball and watch it bounce to win!</p>
        </header>
        
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <GameStats 
              balance={balance}
              totalWins={totalWins}
              totalBets={totalBets}
            />
            <BettingControls
              currentBet={currentBet}
              setCurrentBet={setCurrentBet}
              balance={balance}
              onDrop={dropBall}
              isDropping={isDropping}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="relative">
              {/* Multiplier labels */}
              <div className="flex justify-between mb-2 px-2">
                {MULTIPLIERS.map((mult, index) => (
                  <div 
                    key={index}
                    className={`text-xs font-bold px-1 py-1 rounded ${
                      mult >= 2 ? 'text-success' : mult === 1 ? 'text-muted-foreground' : 'text-destructive'
                    }`}
                  >
                    {mult}x
                  </div>
                ))}
              </div>
              
              {/* Game board */}
              <div 
                ref={sceneRef}
                className="bg-gradient-board rounded-lg border border-border shadow-glow"
                style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
              />
              
              {/* Bottom multiplier slots visual */}
              <div className="flex mt-2">
                {MULTIPLIERS.map((mult, index) => (
                  <div 
                    key={index}
                    className={`flex-1 py-2 text-center text-xs font-bold border-l border-border first:border-l-0 ${
                      mult >= 2 ? 'bg-success/20 text-success' : 
                      mult === 1 ? 'bg-muted/20 text-muted-foreground' : 
                      'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {mult}x
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};