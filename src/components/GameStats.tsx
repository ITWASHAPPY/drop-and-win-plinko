import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

interface GameStatsProps {
  balance: number;
  totalWins: number;
  totalBets: number;
}

export const GameStats = ({ balance, totalWins, totalBets }: GameStatsProps) => {
  const netProfit = totalWins - totalBets;
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Balance Card */}
      <Card className="bg-gradient-primary/10 border-primary/20 shadow-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${balance.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Net Profit */}
        <Card className={`${
          netProfit >= 0 
            ? 'bg-success/10 border-success/20' 
            : 'bg-destructive/10 border-destructive/20'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-xs font-medium flex items-center gap-1 ${
              netProfit >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {netProfit >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${
              netProfit >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="bg-accent/10 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-accent flex items-center gap-1">
              <Target className="h-3 w-3" />
              Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-accent">
              {winRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Session Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Bets:</span>
            <span className="font-medium">${totalBets.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Wins:</span>
            <span className="font-medium text-success">${totalWins.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Games Played:</span>
            <span className="font-medium">{Math.floor(totalBets)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};