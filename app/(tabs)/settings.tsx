import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAppState } from '@/store/AppStateProvider';
import { Card } from '@/components/Card';
import { Moon, Sun, Trash2, Download } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const { userProfile, settings, updateSettings, resetData } = useAppState();
  const colors = Colors[settings.theme];

  const handleThemeToggle = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };

  const handleBackupData = () => {
    const backupData = {
      userProfile,
      settings,
      timestamp: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(backupData, null, 2);

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mintmind-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Backup downloaded successfully!');
      } catch (error) {
        console.error('Backup error:', error);
        Alert.alert('Error', 'Failed to create backup');
      }
    } else {
      Alert.alert(
        'Backup Data',
        `Copy this backup data and save it securely:\n\n${jsonString.substring(0, 100)}...`,
        [
          { text: 'OK' },
        ]
      );
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to reset all your data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetData();
            Alert.alert('Success', 'All data has been reset');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleThemeToggle}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              {settings.theme === 'light' ? (
                <Sun size={24} color={colors.text} />
              ) : (
                <Moon size={24} color={colors.text} />
              )}
              <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {settings.theme === 'light' ? 'Light' : 'Dark'}
            </Text>
          </TouchableOpacity>
        </Card>

        {userProfile.hasCompletedOnboarding && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Your Profile</Text>

            <View style={styles.profileContainer}>
              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Monthly Income
                </Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>
                  ₹{userProfile.monthlyIncome.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Monthly Expenses
                </Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>
                  ₹{userProfile.monthlyExpenses.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  SIP Goal
                </Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>
                  ₹{userProfile.sipGoal.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={[styles.profileLabel, { color: colors.textSecondary }]}>
                  Risk Level
                </Text>
                <Text style={[styles.profileValue, { color: colors.text }]}>
                  {userProfile.riskLevel.charAt(0).toUpperCase() + userProfile.riskLevel.slice(1)}
                </Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Data Management</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={handleBackupData}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Download size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Backup Data</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleResetData}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Trash2 size={24} color={colors.error} />
              <Text style={[styles.settingLabel, { color: colors.error }]}>Reset All Data</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            MintMind v1.0.0
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Your personal financial planning companion
          </Text>
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
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  settingValue: {
    fontSize: 14,
  },
  profileContainer: {
    gap: 16,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLabel: {
    fontSize: 14,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 4,
  },
});
