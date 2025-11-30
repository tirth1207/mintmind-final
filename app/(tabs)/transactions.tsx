import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useTransactions } from '@/store/TransactionProvider';
import { useAppState } from '@/store/AppStateProvider';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Plus, X, TrendingUp, TrendingDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { TransactionType, ExpenseCategory, IncomeCategory } from '@/types';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Fuel',
  'Entertainment',
  'Medical',
  'Other',
];

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Gift',
  'Refund',
  'Interest',
  'Other',
];

export default function TransactionsScreen() {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    monthlyIncome, 
    monthlyExpenses,
    getRemainingBudget,
    // 🆕 NEW INTELLIGENCE
    getTransactionInsight,
  } = useTransactions();
  const { settings } = useAppState();
  const colors = Colors[settings.theme];

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const categories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleAddTransaction = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const fullDate = new Date(date);
    fullDate.setHours(12, 0, 0, 0);

    await addTransaction(transactionType, parsedAmount, category, fullDate.toISOString(), note);

    setModalVisible(false);
    setAmount('');
    setCategory('Other');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteTransaction = async () => {
    if (selectedTransactionId) {
      await deleteTransaction(selectedTransactionId);
      setDeleteModalVisible(false);
      setSelectedTransactionId(null);
    }
  };

  const openAddModal = () => {
    setTransactionType('expense');
    setAmount('');
    setCategory('Other');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const dateKey = formatDate(transaction.date);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your income and expenses
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={[styles.summaryLabel, { color: colors.success }]}>Income</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              ₹{monthlyIncome.toLocaleString('en-IN')}
            </Text>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: colors.errorLight }]}>
            <TrendingDown size={20} color={colors.error} />
            <Text style={[styles.summaryLabel, { color: colors.error }]}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: colors.error }]}>
              ₹{monthlyExpenses.toLocaleString('en-IN')}
            </Text>
          </Card>
        </View>

        <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Monthly Balance</Text>
          <Text style={styles.balanceValue}>
            ₹{(monthlyIncome - monthlyExpenses).toLocaleString('en-IN')}
          </Text>
        </Card>

        {Object.entries(groupedTransactions).map(([dateKey, items]) => (
          <View key={dateKey} style={styles.dateGroup}>
            <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>{dateKey}</Text>
            {items.map((transaction) => {
              // 🆕 GET TRANSACTION INSIGHT
              const insight = transaction.type === 'expense' ? getTransactionInsight(transaction.id) : null;
              
              return (
              <TouchableOpacity
                key={transaction.id}
                onLongPress={() => {
                  setSelectedTransactionId(transaction.id);
                  setDeleteModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Card style={styles.transactionCard}>
                  <View style={styles.transactionContent}>
                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor:
                            transaction.type === 'income'
                              ? colors.successLight
                              : colors.errorLight,
                        },
                      ]}
                    >
                      {transaction.type === 'income' ? (
                        <TrendingUp size={18} color={colors.success} />
                      ) : (
                        <TrendingDown size={18} color={colors.error} />
                      )}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={[styles.transactionCategory, { color: colors.text }]}>
                        {transaction.category}
                      </Text>
                      {transaction.note ? (
                        <Text
                          style={[styles.transactionNote, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {transaction.note}
                        </Text>
                      ) : null}
                      
                      {/* 🆕 SHOW TRANSACTION INSIGHT */}
                      {insight && (
                        <View style={styles.insightContainer}>
                          {insight.predictiveAlert && (
                            <Text style={[styles.insightPredictive, { color: colors.warning }]}>
                              {insight.predictiveAlert}
                            </Text>
                          )}
                          {insight.warningMessage && (
                            <Text style={[styles.insightWarning, { color: colors.error }]}>
                              {insight.warningMessage}
                            </Text>
                          )}
                          {insight.shouldSkip && (
                            <Text style={[styles.insightSuggestion, { color: colors.error }]}>
                              💡 Consider skipping this expense
                            </Text>
                          )}
                          <Text style={[styles.insightMoment, { color: colors.textSecondary }]}>
                            📊 {insight.momentAnalysis}
                          </Text>
                          <View style={styles.insightRow}>
                            <Text style={[styles.insightLabel, { color: colors.textSecondary }]}>
                              💾 Savings Index: {insight.savingsIndex}/10
                            </Text>
                            <Text style={[styles.insightImpact, { color: insight.monthEndImpact > 0 ? colors.success : colors.error }]}>
                              Impact: {insight.monthEndImpact > 0 ? '+' : ''}₹{insight.monthEndImpact.toLocaleString('en-IN')}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color: transaction.type === 'income' ? colors.success : colors.error,
                        },
                      ]}
                    >
                      {transaction.type === 'income' ? '+' : '-'}₹
                      {transaction.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
            })}
          </View>
        ))}

        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap the + button to add your first transaction
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'expense' && {
                    backgroundColor: colors.error,
                  },
                ]}
                onPress={() => {
                  setTransactionType('expense');
                  setCategory('Other');
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: transactionType === 'expense' ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  transactionType === 'income' && {
                    backgroundColor: colors.success,
                  },
                ]}
                onPress={() => {
                  setTransactionType('income');
                  setCategory('Other');
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: transactionType === 'income' ? '#FFFFFF' : colors.text,
                    },
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Amount</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
                <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: colors.background,
                        borderColor: category === cat ? colors.primary : colors.border,
                        borderWidth: category === cat ? 2 : 1,
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: category === cat ? colors.primary : colors.text,
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Note (Optional)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.noteInput,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor={colors.textSecondary}
                multiline
              />
            </View>

            <Button title="Add Transaction" onPress={handleAddTransaction} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModal, { backgroundColor: colors.card }]}>
            <Text style={[styles.deleteTitle, { color: colors.text }]}>Delete Transaction?</Text>
            <Text style={[styles.deleteMessage, { color: colors.textSecondary }]}>
              This action cannot be undone.
            </Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.background }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.deleteButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteTransaction}
              >
                <Text style={[styles.deleteButtonText, { color: '#FFFFFF' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  balanceCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 8,
    marginLeft: 4,
  },
  transactionCard: {
    marginBottom: 8,
    padding: 12,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  transactionNote: {
    fontSize: 13,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600' as const,
    paddingVertical: 16,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  deleteModal: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    marginBottom: 24,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  insightContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  insightPredictive: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  insightWarning: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  insightSuggestion: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  insightMoment: {
    fontSize: 11,
    marginBottom: 6,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  insightImpact: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
