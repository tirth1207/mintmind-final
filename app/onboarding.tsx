import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppState } from '@/store/AppStateProvider';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateUserProfile, settings } = useAppState();
  const colors = Colors[settings.theme];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    travelCost: '',
    foodSnacks: '',
    randomExpenses: '',
    sipGoal: '',
    riskLevel: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    await updateUserProfile({
      monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
      monthlyExpenses: parseFloat(formData.monthlyExpenses) || 0,
      travelCost: parseFloat(formData.travelCost) || 0,
      foodSnacks: parseFloat(formData.foodSnacks) || 0,
      randomExpenses: parseFloat(formData.randomExpenses) || 0,
      sipGoal: parseFloat(formData.sipGoal) || 0,
      riskLevel: formData.riskLevel,
      hasCompletedOnboarding: true,
    });

    router.replace('/(tabs)');
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.monthlyIncome !== '' && formData.monthlyExpenses !== '';
      case 2:
        return (
          formData.travelCost !== '' &&
          formData.foodSnacks !== '' &&
          formData.randomExpenses !== ''
        );
      case 3:
        return formData.sipGoal !== '';
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.content,
          { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 24 : 24 }
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome to MintMind</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Let&apos;s set up your financial profile
          </Text>
          <View style={styles.progressContainer}>
            {[1, 2, 3].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: dot === step ? colors.primary : colors.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Income & Expenses
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Tell us about your monthly finances
            </Text>

            <Input
              label="Monthly Income"
              value={formData.monthlyIncome}
              onChangeText={(text) => setFormData({ ...formData, monthlyIncome: text })}
              placeholder="50000"
              keyboardType="numeric"
              prefix="₹"
            />

            <Input
              label="Monthly Expenses"
              value={formData.monthlyExpenses}
              onChangeText={(text) => setFormData({ ...formData, monthlyExpenses: text })}
              placeholder="30000"
              keyboardType="numeric"
              prefix="₹"
            />

            {/* Show automatic savings calculation */}
            {formData.monthlyIncome && formData.monthlyExpenses && (
              <View style={[styles.savingsBox, { backgroundColor: colors.successLight, borderColor: colors.success }]}>
                <Text style={[styles.savingsLabel, { color: colors.success }]}>Automatic Savings</Text>
                <Text style={[styles.savingsValue, { color: colors.success }]}>
                  ₹{Math.max(0, parseInt(formData.monthlyIncome) - parseInt(formData.monthlyExpenses)).toLocaleString('en-IN')}/month
                </Text>
                <Text style={[styles.savingsHint, { color: colors.textSecondary }]}>
                  This amount will be used for SIP & investments
                </Text>
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Expense Breakdown
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Help us understand your spending pattern
            </Text>

            <Input
              label="Travel Cost (Monthly)"
              value={formData.travelCost}
              onChangeText={(text) => setFormData({ ...formData, travelCost: text })}
              placeholder="3000"
              keyboardType="numeric"
              prefix="₹"
            />

            <Input
              label="Food & Snacks (Monthly)"
              value={formData.foodSnacks}
              onChangeText={(text) => setFormData({ ...formData, foodSnacks: text })}
              placeholder="5000"
              keyboardType="numeric"
              prefix="₹"
            />

            <Input
              label="Random Expenses (Monthly)"
              value={formData.randomExpenses}
              onChangeText={(text) => setFormData({ ...formData, randomExpenses: text })}
              placeholder="2000"
              keyboardType="numeric"
              prefix="₹"
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Investment Goals
            </Text>
            <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
              Set your SIP goal and risk preference
            </Text>

            <Input
              label="SIP Goal (Monthly Target)"
              value={formData.sipGoal}
              onChangeText={(text) => setFormData({ ...formData, sipGoal: text })}
              placeholder="10000"
              keyboardType="numeric"
              prefix="₹"
            />

            <Text style={[styles.label, { color: colors.text }]}>Risk Level</Text>
            <View style={styles.riskContainer}>
              {(['low', 'medium', 'high'] as const).map((risk) => (
                <TouchableOpacity
                  key={risk}
                  style={[
                    styles.riskOption,
                    {
                      backgroundColor:
                        formData.riskLevel === risk ? colors.primary : colors.surface,
                      borderColor: formData.riskLevel === risk ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, riskLevel: risk })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.riskText,
                      {
                        color: formData.riskLevel === risk ? '#FFFFFF' : colors.text,
                      },
                    ]}
                  >
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {step > 1 && (
          <Button title="Back" onPress={handleBack} variant="outline" style={styles.backButton} />
        )}
        <Button
          title={step === 3 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    marginBottom: 24,
  },
  savingsBox: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  savingsValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  savingsHint: {
    fontSize: 12,
    textAlign: 'center' as const,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  riskContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  riskOption: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
