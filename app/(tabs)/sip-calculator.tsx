import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppState } from '@/store/AppStateProvider';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { BarChart } from '@/components/BarChart';
import { PieChart } from '@/components/PieChart';
import Colors from '@/constants/colors';
import { calculateSIP } from '@/lib/finance/sip';

export default function SIPCalculatorScreen() {
  const { settings } = useAppState();
  const colors = Colors[settings.theme];

  const [monthlyInvestment, setMonthlyInvestment] = useState('10000');
  const [expectedReturn, setExpectedReturn] = useState('12');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState(calculateSIP(10000, 12, 10));

  const handleCalculate = () => {
    const investment = parseFloat(monthlyInvestment) || 0;
    const returns = parseFloat(expectedReturn) || 0;
    const timeYears = parseFloat(years) || 0;

    if (investment > 0 && returns > 0 && timeYears > 0) {
      const sipResult = calculateSIP(investment, returns, timeYears);
      setResult(sipResult);
    }
  };

  const chartData = result.yearlyBreakdown.filter((_, index) => index % Math.ceil(result.yearlyBreakdown.length / 6) === 0 || index === result.yearlyBreakdown.length - 1).map((item) => ({
    label: `Y${item.year}`,
    value: item.total,
  }));

  const pieData = [
    { label: 'Invested', value: result.totalInvested, color: colors.chart1 },
    { label: 'Returns', value: result.totalReturns, color: colors.chart2 },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Calculate SIP</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            See how your investments grow over time
          </Text>

          <Input
            label="Monthly Investment"
            value={monthlyInvestment}
            onChangeText={setMonthlyInvestment}
            placeholder="10000"
            keyboardType="numeric"
            prefix="₹"
          />

          <Input
            label="Expected Annual Return"
            value={expectedReturn}
            onChangeText={setExpectedReturn}
            placeholder="12"
            keyboardType="numeric"
            suffix="%"
          />

          <Input
            label="Investment Period"
            value={years}
            onChangeText={setYears}
            placeholder="10"
            keyboardType="numeric"
            suffix="years"
          />

          <Button title="Calculate" onPress={handleCalculate} />
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Results</Text>

          <View style={styles.resultContainer}>
            <View style={styles.resultItem}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                Total Invested
              </Text>
              <Text style={[styles.resultValue, { color: colors.chart1 }]}>
                ₹{result.totalInvested.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.resultItem}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                Expected Returns
              </Text>
              <Text style={[styles.resultValue, { color: colors.chart2 }]}>
                ₹{result.totalReturns.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.resultItem, styles.totalItem]}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                Final Value
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                ₹{result.finalValue.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Investment vs Returns</Text>
            <PieChart data={pieData} size={180} />
          </View>

          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Growth Over {result.years} Years
            </Text>
            <BarChart data={chartData} height={180} />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  resultContainer: {
    gap: 16,
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalItem: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  chartContainer: {
    marginTop: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
});
