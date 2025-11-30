import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/store/AppStateProvider';
import Colors from '@/constants/colors';

interface BarChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  height?: number;
}

export function BarChart({ data, maxValue, height = 200 }: BarChartProps) {
  const theme = useTheme();
  const colors = Colors[theme];
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;

  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <View style={styles.container}>
      <View style={[styles.chart, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * height;
          const barWidth = (chartWidth - (data.length - 1) * 8) / data.length;

          return (
            <View key={index} style={[styles.barContainer, { width: barWidth }]}>
              <View style={styles.valueContainer}>
                <Text style={[styles.valueText, { color: colors.textSecondary }]}>
                  {item.value.toLocaleString('en-IN')}
                </Text>
              </View>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <Text style={[styles.labelText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barContainer: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  valueContainer: {
    height: 20,
    justifyContent: 'flex-end',
  },
  valueText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500' as const,
    marginTop: 4,
  },
});
