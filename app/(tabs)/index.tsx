import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppState } from '@/store/AppStateProvider';
import { useTransactions, useRemainingBudget } from '@/store/TransactionProvider';
import { Card, StatCard } from '@/components/Card';
import { PieChart } from '@/components/PieChart';
import { BarChart } from '@/components/BarChart';
import { TrendingUp, Wallet, Target, PiggyBank, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { calculateSIP } from '@/lib/finance/sip';
import { calculateMaxEMI } from '@/lib/finance/emi';

export default function DashboardScreen() {
  const { userProfile, budget, recommendedSIP, monthlySurplus, settings } = useAppState();
  const { expenseCategoryBreakdown, dailyExpenseData } = useTransactions();
  const colors = Colors[settings.theme];

  const dailyLimit = budget?.dailyLimit || 0;
  const weeklyLimit = budget?.weeklyLimit || 0;
  const monthlyLimit = budget?.monthlyLimit || 0;
  const remaining = useRemainingBudget(dailyLimit, weeklyLimit, monthlyLimit);

  if (!userProfile.hasCompletedOnboarding) return null;

  const projectionData = calculateSIP(recommendedSIP, 12, 5);
  const maxEMI = calculateMaxEMI(userProfile.monthlyIncome);

  const budgetChartData = budget
    ? [
        { label: 'Needs', value: budget.needs, color: colors.chart1 },
        { label: 'Wants', value: budget.wants, color: colors.chart2 },
        { label: 'Savings', value: budget.savings, color: colors.chart3 },
      ]
    : [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Your Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Financial overview at a glance
          </Text>
        </View>

        {/* Alerts */}
        {remaining && (
          <>
            {remaining.dailyRemaining < 0 && (
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

            {remaining.weeklyRemaining < 0 && remaining.dailyRemaining >= 0 && (
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
          </>
        )}

        {/* Income + Surplus */}
        <View style={styles.statsRow}>
          <StatCard
            title="Monthly Income"
            value={`₹${userProfile.monthlyIncome.toLocaleString('en-IN')}`}
            icon={<Wallet size={20} color={colors.primary} />}
            color={colors.text}
          />
          <StatCard
            title="Surplus"
            value={`₹${monthlySurplus.toLocaleString('en-IN')}`}
            icon={<TrendingUp size={20} color={colors.success} />}
            color={monthlySurplus > 0 ? colors.success : colors.error}
          />
        </View>

        {/* SIP + EMI */}
        <View style={styles.statsRow}>
          <StatCard
            title="Recommended SIP"
            value={`₹${recommendedSIP.toLocaleString('en-IN')}`}
            subtitle="Monthly"
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

        {/* Budget Status */}
        {remaining && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Real-Time Budget Status</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Track your spending against limits
            </Text>

            <View style={styles.budgetStatusContainer}>
              {/* Day */}
              <View style={styles.budgetStatusItem}>
                <Text style={[styles.budgetStatusLabel, { color: colors.textSecondary }]}>Today</Text>
                <Text style={[styles.budgetStatusValue, { color: remaining.dailyRemaining >= 0 ? colors.success : colors.error }]}>
                  ₹{remaining.dailyRemaining.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.budgetStatusSpent, { color: colors.textSecondary }]}>
                  ₹{remaining.dailySpent.toLocaleString('en-IN')} spent
                </Text>
              </View>

              {/* Week */}
              <View style={styles.budgetStatusItem}>
                <Text style={[styles.budgetStatusLabel, { color: colors.textSecondary }]}>This Week</Text>
                <Text style={[styles.budgetStatusValue, { color: remaining.weeklyRemaining >= 0 ? colors.success : colors.error }]}>
                  ₹{remaining.weeklyRemaining.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.budgetStatusSpent, { color: colors.textSecondary }]}>
                  ₹{remaining.weeklySpent.toLocaleString('en-IN')} spent
                </Text>
              </View>

              {/* Month */}
              <View style={styles.budgetStatusItem}>
                <Text style={[styles.budgetStatusLabel, { color: colors.textSecondary }]}>This Month</Text>
                <Text style={[styles.budgetStatusValue, { color: remaining.monthlyRemaining >= 0 ? colors.success : colors.error }]}>
                  ₹{remaining.monthlyRemaining.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.budgetStatusSpent, { color: colors.textSecondary }]}>
                  ₹{remaining.monthlySpent.toLocaleString('en-IN')} spent
                </Text>
              </View>
            </View>
          </Card>
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
                    {item.percentage.toFixed(0)}%
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

        {/* ⭐ BUDGET SECTION MERGED FROM budget.tsx ⭐ */}
        {budget && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>50-30-20 Budget Rule</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Based on your income of ₹{userProfile.monthlyIncome.toLocaleString('en-IN')}
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

  budgetStatusContainer: { flexDirection: 'row', gap: 12 },
  budgetStatusItem: { flex: 1, alignItems: 'center' },
  budgetStatusLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  budgetStatusValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  budgetStatusSpent: { fontSize: 11 },

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
});
