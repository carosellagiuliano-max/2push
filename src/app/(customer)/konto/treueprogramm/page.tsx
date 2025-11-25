'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Gift,
  Star,
  ArrowUp,
  TrendingUp,
  Clock,
  Award,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  getMyLoyaltyAccount,
  getMyLoyaltyTransactions,
  enrollInLoyaltyProgram,
  type LoyaltyAccountSummary,
  type LoyaltyTransaction,
} from '@/features/customer'
import { formatPoints } from '@/lib/domain/loyalty'

const TIER_COLORS: Record<string, string> = {
  bronze: 'bg-amber-700',
  silver: 'bg-slate-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-600',
}

const TIER_BADGE_COLORS: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800 border-amber-200',
  silver: 'bg-slate-100 text-slate-800 border-slate-200',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  platinum: 'bg-purple-100 text-purple-800 border-purple-200',
}

export default function TreueprogrammPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isEnrolling, setIsEnrolling] = React.useState(false)
  const [account, setAccount] = React.useState<LoyaltyAccountSummary | null>(null)
  const [transactions, setTransactions] = React.useState<LoyaltyTransaction[]>([])

  // Load loyalty data
  React.useEffect(() => {
    const loadData = async () => {
      const [accountData, transactionData] = await Promise.all([
        getMyLoyaltyAccount(),
        getMyLoyaltyTransactions(10),
      ])
      setAccount(accountData)
      setTransactions(transactionData)
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Handle enrollment
  const handleEnroll = async () => {
    setIsEnrolling(true)
    const result = await enrollInLoyaltyProgram()

    if (result.success) {
      toast({
        title: 'Willkommen im Treueprogramm!',
        description: 'Sie können jetzt Punkte sammeln und tolle Prämien erhalten.',
      })
      // Reload data
      const accountData = await getMyLoyaltyAccount()
      setAccount(accountData)
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Anmeldung fehlgeschlagen.',
        variant: 'destructive',
      })
    }
    setIsEnrolling(false)
  }

  // Format transaction description
  const getTransactionIcon = (sourceType: string, pointsDelta: number) => {
    if (pointsDelta < 0) return <ArrowUp className="h-4 w-4 text-red-500 rotate-180" />
    switch (sourceType) {
      case 'order':
        return <Gift className="h-4 w-4 text-green-500" />
      case 'appointment':
        return <Star className="h-4 w-4 text-green-500" />
      case 'promotion':
        return <Sparkles className="h-4 w-4 text-yellow-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-green-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not enrolled state
  if (!account?.isEnrolled) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Treueprogramm</h1>
          <p className="text-muted-foreground mt-1">Sammeln Sie Punkte und erhalten Sie exklusive Vorteile</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
              <Gift className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Werden Sie Mitglied</CardTitle>
            <CardDescription className="text-base">
              Melden Sie sich für unser Treueprogramm an und profitieren Sie von vielen Vorteilen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Punkte sammeln</div>
                  <div className="text-sm text-muted-foreground">1 Punkt pro CHF Umsatz</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Punkte einlösen</div>
                  <div className="text-sm text-muted-foreground">100 Punkte = CHF 1 Rabatt</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Status aufsteigen</div>
                  <div className="text-sm text-muted-foreground">Bis zu 100% Bonuspunkte</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium">Exklusive Angebote</div>
                  <div className="text-sm text-muted-foreground">Zugang zu VIP-Aktionen</div>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isEnrolling}>
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird angemeldet...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Jetzt kostenlos anmelden
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Enrolled state
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Treueprogramm</h1>
        <p className="text-muted-foreground mt-1">Verwalten Sie Ihre Punkte und Prämien</p>
      </div>

      {/* Points Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Points */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verfügbare Punkte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPoints(account.currentPoints)}</div>
            <p className="text-sm text-muted-foreground">
              = CHF {account.redemptionValue.toFixed(2)} Guthaben
            </p>
          </CardContent>
        </Card>

        {/* Lifetime Points */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesammelte Punkte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPoints(account.lifetimePoints)}</div>
            <p className="text-sm text-muted-foreground">Insgesamt verdient</p>
          </CardContent>
        </Card>

        {/* Current Tier */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ihr Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={`${TIER_BADGE_COLORS[account.currentTier.id] || 'bg-muted'} text-lg px-3 py-1`}>
                <Award className="h-4 w-4 mr-1" />
                {account.currentTier.name}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {account.currentTier.pointsMultiplier > 1
                ? `${Math.round((account.currentTier.pointsMultiplier - 1) * 100)}% Bonuspunkte`
                : 'Basispunkte'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      {account.nextTier && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fortschritt zum nächsten Status
            </CardTitle>
            <CardDescription>
              Noch {formatPoints(account.pointsToNextTier)} Punkte bis {account.nextTier.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${TIER_COLORS[account.currentTier.id]} flex items-center justify-center`}>
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${account.tierProgress}%` }}
                />
              </div>
              <div className={`w-12 h-12 rounded-full ${TIER_COLORS[account.nextTier.id]} flex items-center justify-center opacity-50`}>
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{account.currentTier.name}</span>
              <span>{Math.round(account.tierProgress)}%</span>
              <span>{account.nextTier.name}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Ihre Vorteile als {account.currentTier.name}-Mitglied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {account.currentTier.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Letzte Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Noch keine Aktivitäten. Sammeln Sie Punkte bei Ihrem nächsten Besuch!
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.sourceType, transaction.pointsDelta)}
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(transaction.createdAt), 'dd. MMM yyyy, HH:mm', { locale: de })}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${transaction.pointsDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.pointsDelta >= 0 ? '+' : ''}
                    {formatPoints(transaction.pointsDelta)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Tiers Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Statusstufen</CardTitle>
          <CardDescription>Sammeln Sie Punkte und steigen Sie auf</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['bronze', 'silver', 'gold', 'platinum'].map((tierId) => {
              const tierInfo = {
                bronze: { name: 'Bronze', min: 0, multiplier: '1x', icon: '🥉' },
                silver: { name: 'Silber', min: 500, multiplier: '1.25x', icon: '🥈' },
                gold: { name: 'Gold', min: 1500, multiplier: '1.5x', icon: '🥇' },
                platinum: { name: 'Platin', min: 5000, multiplier: '2x', icon: '💎' },
              }[tierId]!
              const isCurrentTier = account.currentTier.id === tierId

              return (
                <div
                  key={tierId}
                  className={`p-4 rounded-lg border-2 ${isCurrentTier ? 'border-primary bg-primary/5' : 'border-muted'}`}
                >
                  <div className="text-2xl mb-2">{tierInfo.icon}</div>
                  <div className="font-semibold">{tierInfo.name}</div>
                  <div className="text-sm text-muted-foreground">ab {formatPoints(tierInfo.min)} Punkte</div>
                  <div className="text-sm font-medium mt-2">{tierInfo.multiplier} Punkte</div>
                  {isCurrentTier && (
                    <Badge variant="secondary" className="mt-2">
                      Ihr Status
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
