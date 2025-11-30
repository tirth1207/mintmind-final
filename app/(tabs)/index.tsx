import { BarChart } from '@/components/BarChart';
import { Card, StatCard } from '@/components/Card';
import { PieChart } from '@/components/PieChart';
import Colors from '@/constants/colors';
import { calculateMaxEMI } from '@/lib/finance/emi';
import { calculateSIP } from '@/lib/finance/sip';
import { useAppState } from '@/store/AppStateProvider';
import { useTransactions } from '@/store/TransactionProvider';
import { AlertTriangle, PiggyBank, Target, Wallet } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const { userProfile, budget, recommendedSIP, settings } = useAppState();
  const {
    expenseCategoryBreakdown,
    dailyExpenseData,
    monthlyIncome,
    monthlyExpenses,
    remainingMonthlyBudget,
    burnRate,
    projectedMonthEnd,
    getRemainingBudget,
  } = useTransactions();
  const colors = Colors[settings.theme];

  if (!userProfile.hasCompletedOnboarding) return null;

  // 🆕 Get real budget status with limits
  const remaining = getRemainingBudget(
    budget?.dailyLimit || 0,
    budget?.weeklyLimit || 0,
    budget?.monthlyLimit || 0
  );

  const maxEMI = calculateMaxEMI(monthlyIncome);
  
  // Use recommended SIP or budget savings (20% of income) for projection
  const sipAmount = recommendedSIP > 0 ? recommendedSIP : (budget?.savings || 0);
  const projectionData = calculateSIP(sipAmount, 12, 5);

  const budgetChartData = budget
    ? [
        { label: 'Needs', value: budget.needs, color: colors.chart1 },
        { label: 'Wants', value: budget.wants, color: colors.chart2 },
        { label: 'Savings', value: budget.savings, color: colors.chart3 },
      ]
    : [];

  // 🆕 Determine alert status
  const hasOverspentDaily = remaining.dailyRemaining < 0;
  const hasOverspentWeekly = remaining.weeklyRemaining < 0 && !hasOverspentDaily;
  const hasOverspentMonthly = remaining.monthlyRemaining < 0 && !hasOverspentDaily && !hasOverspentWeekly;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Your Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Real-time financial overview
          </Text>
        </View>

        {/* 🆕 OVERSPEND ALERTS */}
        {hasOverspentDaily && (
          <Card style={[styles.alertCard, { backgroundColor: colors.errorLight, borderColor: colors.error }]}>
            <View style={styles.alertContent}>
              <AlertTriangle size={20} color={colors.error} />
              <View style={styles.alertText}>
                <Text style={[styles.alertTitle, { color: colors.error }]}>
                  Daily Budget Exceeded
                </Text>
                <Text style={[styles.alertMessage, { color: colors.error }]}>
                  You overspent by ₹{Math.abs(remaining.dailyRemaining).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {hasOverspentWeekly && (
          <Card style={[styles.alertCard, { backgroundColor: colors.errorLight, borderColor: colors.error }]}>
            <View style={styles.alertContent}>
              <AlertTriangle size={20} color={colors.error} />
              <View style={styles.alertText}>
                <Text style={[styles.alertTitle, { color: colors.error }]}>
                  Weekly Budget Exceeded
                </Text>
                <Text style={[styles.alertMessage, { color: colors.error }]}>
                  You overspent by ₹{Math.abs(remaining.weeklyRemaining).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {hasOverspentMonthly && (
          <Card style={[styles.alertCard, { backgroundColor: colors.errorLight, borderColor: colors.error }]}>
            <View style={styles.alertContent}>
              <AlertTriangle size={20} color={colors.error} />
              <View style={styles.alertText}>
                <Text style={[styles.alertTitle, { color: colors.error }]}>
                  Monthly Budget Exceeded
                </Text>
                <Text style={[styles.alertMessage, { color: colors.error }]}>
                  You overspent by ₹{Math.abs(remaining.monthlyRemaining).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* 🆕 KEY STATS - NOW FROM REAL TRANSACTIONS */}
        <View style={styles.statsRow}>
          <StatCard
            title="Monthly Income"
            value={`₹${monthlyIncome.toLocaleString('en-IN')}`}
            icon={<Wallet size={20} color={colors.primary} />}
            color={colors.text}
          />
          <StatCard
            title="Monthly Spent"
            value={`₹${monthlyExpenses.toLocaleString('en-IN')}`}
            icon={<Wallet size={20} color={colors.error} />}
            color={monthlyExpenses > 0 ? colors.error : colors.text}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Remaining"
            value={`₹${remainingMonthlyBudget.toLocaleString('en-IN')}`}
            subtitle={`Balance this month`}
            icon={<PiggyBank size={20} color={colors.primary} />}
            color={remainingMonthlyBudget >= 0 ? colors.success : colors.error}
          />
          <StatCard
            title="Burn Rate"
            value={`₹${burnRate.toLocaleString('en-IN')}`}
            subtitle="Avg daily spend"
            icon={<AlertTriangle size={20} color={colors.warning} />}
            color={colors.warning}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Recommended SIP"
            value={`₹${(recommendedSIP > 0 ? recommendedSIP : (budget?.savings || 0)).toLocaleString('en-IN')}`}
            subtitle={recommendedSIP > 0 ? "Based on surplus" : "20% of income"}
            icon={<Target size={20} color={colors.secondary} />}
            color={colors.secondary}
          />
          <StatCard
            title="Max EMI"
            value={`₹${maxEMI.toLocaleString('en-IN')}`}
            subtitle="40% of income"
            icon={<PiggyBank size={20} color={colors.accent} />}
            color={colors.accent}
          />
        </View>

        {/* 🆕 PROJECTED MONTH-END BALANCE */}
        {monthlyIncome > 0 && (
          <Card style={[styles.card, { borderColor: projectedMonthEnd >= 0 ? colors.successLight : colors.errorLight }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Month-End Projection</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Based on current burn rate of ₹{burnRate.toLocaleString('en-IN')}/day
            </Text>

            <View style={styles.projectionBox}>
              <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
                Projected Balance at Month End
              </Text>
              <Text
                style={[
                  styles.projectionValueLarge,
                  { color: projectedMonthEnd >= 0 ? colors.success : colors.error },
                ]}
              >
                ₹{projectedMonthEnd.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.projectionHint, { color: colors.textSecondary }]}>
                {projectedMonthEnd >= 0
                  ? `You'll save ₹${Math.abs(projectedMonthEnd).toLocaleString('en-IN')} if spending continues as usual`
                  : `You may overspend by ₹${Math.abs(projectedMonthEnd).toLocaleString('en-IN')} if spending continues as usual`}
              </Text>
            </View>
          </Card>
        )}

        {/* Real-Time Budget Status */}
        {remaining && budget && (
          <>
            {/* Planned Budget Overview */}
            <Card style={[styles.card, { backgroundColor: colors.primary + '08', borderColor: colors.primary }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Your Planned Budget</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Income - Expenses = Savings for SIP & Investments
              </Text>

              <View style={[styles.budgetFlowBox, { backgroundColor: colors.card }]}>
                <View style={styles.budgetFlowItem}>
                  <Text style={[styles.budgetFlowLabel, { color: colors.textSecondary }]}>Monthly Income</Text>
                  <Text style={[styles.budgetFlowValue, { color: colors.primary }]}>
                    ₹{userProfile.monthlyIncome.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={[styles.budgetFlowSeparator, { backgroundColor: colors.textSecondary }]} />

                <View style={styles.budgetFlowItem}>
                  <Text style={[styles.budgetFlowLabel, { color: colors.textSecondary }]}>Monthly Expenses (Limit)</Text>
                  <Text style={[styles.budgetFlowValue, { color: colors.error }]}>
                    ₹{userProfile.monthlyExpenses.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={[styles.budgetFlowSeparator, { backgroundColor: colors.textSecondary }]} />

                <View style={styles.budgetFlowItem}>
                  <Text style={[styles.budgetFlowLabel, { color: colors.success, fontWeight: '700' }]}>Monthly Savings (SIP)</Text>
                  <Text style={[styles.budgetFlowValue, { color: colors.success, fontSize: 24 }]}>
                    ₹{userProfile.monthlyIncome - userProfile.monthlyExpenses > 0 ? (userProfile.monthlyIncome - userProfile.monthlyExpenses).toLocaleString('en-IN') : '0'}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Smart Daily Budget</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Based on your 50-30-20 rule budget
            </Text>

            {/* Monthly Summary */}
            <View style={[styles.monthlyBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
              <View style={styles.monthlyBoxRow}>
                <View style={styles.monthlyBoxCol}>
                  <Text style={[styles.monthlyBoxLabel, { color: colors.textSecondary }]}>Monthly Limit</Text>
                  <Text style={[styles.monthlyBoxValue, { color: colors.primary }]}>
                    ₹{budget.monthlyLimit.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.monthlyBoxCaption, { color: colors.textSecondary }]}>50% Needs + 30% Wants</Text>
                </View>
                <View style={styles.monthlyBoxCol}>
                  <Text style={[styles.monthlyBoxLabel, { color: colors.textSecondary }]}>Already Spent</Text>
                  <Text style={[styles.monthlyBoxValue, { color: colors.error }]}>
                    ₹{remaining.monthlySpent.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.monthlyBoxCaption, { color: colors.textSecondary }]}>from transactions</Text>
                </View>
                <View style={styles.monthlyBoxCol}>
                  <Text style={[styles.monthlyBoxLabel, { color: colors.textSecondary }]}>Remaining</Text>
                  <Text style={[styles.monthlyBoxValue, { color: remaining.monthlyRemaining >= 0 ? colors.success : colors.error }]}>
                    ₹{remaining.monthlyRemaining.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.monthlyBoxCaption, { color: colors.textSecondary }]}>this month</Text>
                </View>
              </View>
            </View>

            {/* Daily Suggestion */}
            <View style={[styles.suggestionBox, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.suggestionTitle, { color: colors.success }]}>Daily Target</Text>
              <Text style={[styles.suggestionValue, { color: colors.success }]}>
                ₹{remaining.dailyRemaining.toLocaleString('en-IN')}/day
              </Text>
              <Text style={[styles.suggestionHint, { color: colors.textSecondary }]}>
                to stay within your ₹{budget.monthlyLimit.toLocaleString('en-IN')} monthly limit
              </Text>
              <View style={styles.suggestionDetails}>
                <Text style={[styles.suggestionDetail, { color: colors.textSecondary }]}>
                  Today spent: ₹{remaining.dailySpent.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.suggestionDetail, { color: colors.textSecondary }]}>
                  {remaining.dailySpent > remaining.dailyRemaining
                    ? `Save ₹${(remaining.dailySpent - remaining.dailyRemaining).toLocaleString('en-IN')} on other days`
                    : `Budget available: ₹${(remaining.dailyRemaining - remaining.dailySpent).toLocaleString('en-IN')}`}
                </Text>
              </View>
            </View>

            {/* Weekly Status */}
            <View style={[styles.statusGrid, { marginTop: 16 }]}>
              <View style={[styles.statusCard, { borderColor: remaining.weeklyRemaining >= 0 ? colors.success : colors.error }]}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Weekly</Text>
                <Text style={[styles.statusValue, { color: remaining.weeklyRemaining >= 0 ? colors.success : colors.error }]}>
                  ₹{remaining.weeklyRemaining.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
                  {remaining.weeklyRemaining >= 0 ? 'Remaining' : 'Overspent'}
                </Text>
              </View>

              <View style={[styles.statusCard, { borderColor: colors.primary }]}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>This Month</Text>
                <Text style={[styles.statusValue, { color: colors.primary }]}>
                  {((remaining.monthlySpent / (budget.monthlyLimit || 1)) * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.statusDetail, { color: colors.textSecondary }]}>
                  of budget used
                </Text>
              </View>
            </View>
          </Card>
          </>
        )}

        {/* 7-Day Expenses */}
        {dailyExpenseData.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Last 7 Days Expenses</Text>

            <View style={styles.chartContainer}>
              <BarChart
                data={dailyExpenseData.map((item) => ({
                  label: new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' }),
                  value: item.amount,
                }))}
                height={150}
              />
            </View>
          </Card>
        )}

        {/* Category Breakdown */}
        {expenseCategoryBreakdown.length > 0 && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Monthly Expense Breakdown</Text>

            <View style={styles.categoryList}>
              {expenseCategoryBreakdown.slice(0, 5).map((item, index) => (
                <View key={item.category} style={styles.categoryItem}>
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor:
                          [colors.chart1, colors.chart2, colors.chart3, colors.chart4, colors.accent][index % 5],
                      },
                    ]}
                  />
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {item.category}
                  </Text>
                  <View style={styles.categorySpacer} />
                  <Text style={[styles.categoryAmount, { color: colors.text }]}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.categoryPercentage, { color: colors.textSecondary }]}>
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* SIP Projection */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>5-Year SIP Projection</Text>

          <View style={styles.projectionContainer}>
            <View style={styles.projectionItem}>
              <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>Total Invested</Text>
              <Text style={[styles.projectionValue, { color: colors.chart1 }]}>
                ₹{projectionData.totalInvested.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.projectionItem}>
              <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>Expected Returns</Text>
              <Text style={[styles.projectionValue, { color: colors.chart2 }]}>
                ₹{projectionData.totalReturns.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.projectionItem}>
              <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>Final Value</Text>
              <Text style={[styles.projectionValue, { color: colors.primary }]}>
                ₹{projectionData.finalValue.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Card>

        {/* 50-30-20 Budget Rule */}
        {budget && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>50-30-20 Budget Rule</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Based on your income of ₹{monthlyIncome.toLocaleString('en-IN')}
            </Text>

            <View style={styles.chartContainer}>
              <PieChart data={budgetChartData} size={200} />
            </View>

            {/* Breakdown */}
            <View style={styles.breakdownContainer}>
              <View style={styles.breakdownItem}>
                <View style={[styles.colorDot, { backgroundColor: colors.chart1 }]} />
                <View style={styles.breakdownContent}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>Needs (50%)</Text>
                  <Text style={[styles.breakdownValue, { color: colors.chart1 }]}>
                    ₹{budget.needs.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.breakdownDesc, { color: colors.textSecondary }]}>
                    Rent, groceries, utilities, EMIs
                  </Text>
                </View>
              </View>

              <View style={styles.breakdownItem}>
                <View style={[styles.colorDot, { backgroundColor: colors.chart2 }]} />
                <View style={styles.breakdownContent}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>Wants (30%)</Text>
                  <Text style={[styles.breakdownValue, { color: colors.chart2 }]}>
                    ₹{budget.wants.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.breakdownDesc, { color: colors.textSecondary }]}>
                    Entertainment, shopping, outings
                  </Text>
                </View>
              </View>

              <View style={styles.breakdownItem}>
                <View style={[styles.colorDot, { backgroundColor: colors.chart3 }]} />
                <View style={styles.breakdownContent}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>Savings (20%)</Text>
                  <Text style={[styles.breakdownValue, { color: colors.chart3 }]}>
                    ₹{budget.savings.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.breakdownDesc, { color: colors.textSecondary }]}>
                    SIP, emergency fund, long-term goals
                  </Text>
                </View>
              </View>
            </View>

            {/* Limits */}
            <View style={styles.limitsContainer}>
              <View style={styles.limitItem}>
                <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>Daily</Text>
                <Text style={[styles.limitValue, { color: colors.primary }]}>
                  ₹{budget.dailyLimit.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.limitItem}>
                <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>Weekly</Text>
                <Text style={[styles.limitValue, { color: colors.primary }]}>
                  ₹{budget.weeklyLimit.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.limitItem}>
                <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>Monthly</Text>
                <Text style={[styles.limitValue, { color: colors.primary }]}>
                  ₹{budget.monthlyLimit.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

// ...existing styles (unchanged)...
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },

  alertCard: { marginBottom: 16, borderWidth: 2 },
  alertContent: { flexDirection: 'row', gap: 12 },
  alertText: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '700' },
  alertMessage: { fontSize: 14, fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },

  card: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, marginBottom: 16 },

  projectionBox: { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 12, padding: 16, marginBottom: 16 },
  projectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  projectionValueLarge: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  projectionHint: { fontSize: 12 },

  budgetStatusContainer: { flexDirection: 'row', gap: 12 },
  budgetStatusItem: { flex: 1, alignItems: 'center' },
  budgetStatusLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  budgetStatusValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  budgetStatusSpent: { fontSize: 11 },

  monthlyBox: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  monthlyBoxRow: { flexDirection: 'row', justifyContent: 'space-around' },
  monthlyBoxCol: { alignItems: 'center' },
  monthlyBoxLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  monthlyBoxValue: { fontSize: 18, fontWeight: '700' },
  monthlyBoxCaption: { fontSize: 10, marginTop: 4 },

  suggestionBox: { borderRadius: 12, padding: 16, marginBottom: 16 },
  suggestionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  suggestionValue: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  suggestionHint: { fontSize: 12, marginBottom: 12 },
  suggestionDetails: { borderTopWidth: 1, borderTopColor: '#0001', paddingTop: 12 },
  suggestionDetail: { fontSize: 12, fontWeight: '500', marginTop: 4 },

  statusGrid: { flexDirection: 'row', gap: 12 },
  statusCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center' },
  statusLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  statusValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statusDetail: { fontSize: 11 },

  chartContainer: { alignItems: 'center', marginVertical: 16 },

  categoryList: { gap: 12 },
  categoryItem: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  categoryDot: { width: 12, height: 12, borderRadius: 6 },
  categoryName: { fontSize: 14, fontWeight: '600' },
  categorySpacer: { flex: 1, height: 1, backgroundColor: '#0001', marginHorizontal: 8 },
  categoryAmount: { fontSize: 14, fontWeight: '700' },
  categoryPercentage: { fontSize: 12 },

  projectionContainer: { gap: 16 },
  projectionItem: { flexDirection: 'row', justifyContent: 'space-between' },
  projectionLabel: { fontSize: 14, fontWeight: '500' },
  projectionValue: { fontSize: 18, fontWeight: '700' },

  breakdownContainer: { marginTop: 20, gap: 20 },
  breakdownItem: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  breakdownContent: { flex: 1 },
  breakdownLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  breakdownValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  breakdownDesc: { fontSize: 13 },

  limitsContainer: { flexDirection: 'row', marginTop: 24, gap: 12 },
  limitItem: { flex: 1, alignItems: 'center' },
  limitLabel: { fontSize: 12, marginBottom: 4 },
  limitValue: { fontSize: 16, fontWeight: '700' },

  budgetFlowBox: { borderRadius: 12, padding: 16, marginBottom: 16 },
  budgetFlowItem: { alignItems: 'center', paddingVertical: 8 },
  budgetFlowLabel: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  budgetFlowValue: { fontSize: 20, fontWeight: '700' },
  budgetFlowSeparator: { height: 2, width: 30, alignSelf: 'center', marginVertical: 4 },
});