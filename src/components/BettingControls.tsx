import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, DollarSign } from "lucide-react";

interface BettingControlsProps {
  currentBet: number;
  setCurrentBet: (bet: number) => void;
  balance: number;
  onDrop: () => void;
  isDropping: boolean;
}

const QUICK_BETS = [1, 5, 10, 25, 50, 100];

export const BettingControls = ({ 
  currentBet, 
  setCurrentBet, 
  balance, 
  onDrop, 
  isDropping 
}: BettingControlsProps) => {
  
  const handleBetChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0.1 && numValue <= balance) {
      setCurrentBet(numValue);
    }
  };

  const adjustBet = (multiplier: number) => {
    const newBet = Math.max(0.1, Math.min(balance, currentBet * multiplier));
    setCurrentBet(Math.round(newBet * 100) / 100);
  };

  const setBetAmount = (amount: number) => {
    if (amount <= balance) {
      setCurrentBet(amount);
    }
  };

  const canDrop = balance >= currentBet && !isDropping;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">
          Betting Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bet Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Bet Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="0.1"
              max={balance}
              step="0.1"
              value={currentBet}
              onChange={(e) => handleBetChange(e.target.value)}
              className="pl-10 bg-input/50 border-border/50 focus:ring-primary"
              disabled={isDropping}
            />
          </div>
        </div>

        {/* Bet Adjustment Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustBet(0.5)}
            disabled={isDropping || currentBet <= 0.1}
            className="flex-1 hover:bg-destructive/10 hover:border-destructive/30"
          >
            <Minus className="h-3 w-3 mr-1" />
            1/2
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustBet(2)}
            disabled={isDropping || currentBet * 2 > balance}
            className="flex-1 hover:bg-success/10 hover:border-success/30"
          >
            <Plus className="h-3 w-3 mr-1" />
            2x
          </Button>
        </div>

        {/* Quick Bet Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Quick Bets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_BETS.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setBetAmount(amount)}
                disabled={isDropping || amount > balance}
                className={`hover:bg-primary/10 hover:border-primary/30 ${
                  currentBet === amount ? 'bg-primary/20 border-primary/50' : ''
                }`}
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Max Bet Button */}
        <Button
          variant="outline"
          onClick={() => setBetAmount(balance)}
          disabled={isDropping || balance === 0}
          className="w-full hover:bg-accent/10 hover:border-accent/30"
        >
          Max Bet (${balance.toFixed(2)})
        </Button>

        {/* Drop Ball Button */}
        <Button
          onClick={onDrop}
          disabled={!canDrop}
          variant="gaming"
          className={`w-full h-12 text-lg font-bold ${
            !canDrop && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none'
          }`}
        >
          {isDropping ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Dropping...
            </span>
          ) : balance < currentBet ? (
            'Insufficient Balance'
          ) : (
            `Drop Ball - $${currentBet.toFixed(2)}`
          )}
        </Button>

        {/* Bet Info */}
        <div className="text-xs text-muted-foreground text-center">
          {canDrop && (
            <p>Potential win: ${(currentBet * 16).toFixed(2)} (16x max)</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};