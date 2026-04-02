import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Title, ProgressBar, FAB, List, IconButton, Portal, Modal, TextInput, Button, useTheme, Divider } from 'react-native-paper';
import { useFinanceStore } from '../store/useFinanceStore';
import { Plus, Trash2, Edit2, Target, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const BudgetScreen = () => {
  const theme = useTheme();
  const { budgets, categories, addBudget, updateBudget, deleteBudget, fetchData } = useFinanceStore();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const handleSave = async () => {
    if (!amount || !categoryId) return;
    const budgetData = {
      amount: parseFloat(amount),
      categoryId: categoryId,
      period: 'MONTHLY'
    };

    if (editingId) {
      await updateBudget(editingId, budgetData);
    } else {
      await addBudget(budgetData);
    }
    
    closeModal();
  };

  const openEdit = (budget: any) => {
    setEditingId(budget.id);
    setAmount(budget.amount.toString());
    setCategoryId(budget.categoryId);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setAmount('');
    setCategoryId(null);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 1) return '#f44336'; // Red
    if (progress >= 0.8) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallProgress = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Overall Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryHeader}>
              <Target color="#6200ee" size={24} />
              <View>
                <Text style={styles.summaryLabel}>Total Monthly Budget</Text>
                <Title style={styles.summaryValue}>{totalBudgeted.toLocaleString()} ETB</Title>
              </View>
            </View>
            <View style={styles.summaryStats}>
              <View>
                <Text variant="labelSmall">Total Spent</Text>
                <Text variant="bodyLarge" style={{ color: '#f44336', fontWeight: 'bold' }}>
                  {totalSpent.toLocaleString()} ETB
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="labelSmall">Remaining</Text>
                <Text variant="bodyLarge" style={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {(totalBudgeted - totalSpent).toLocaleString()} ETB
                </Text>
              </View>
            </View>
            <ProgressBar 
              progress={Math.min(overallProgress, 1)} 
              color={getProgressColor(overallProgress)} 
              style={styles.summaryProgress} 
            />
          </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Category Budgets</Title>

        {budgets.length === 0 ? (
          <View style={styles.empty}>
            <Target size={64} color="#ccc" style={{ marginBottom: 16 }} />
            <Title style={{ color: '#666' }}>No Budgets Set</Title>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#999', marginTop: 8 }}>
                Track your spending by setting limits for categories like Food or Transport.
            </Text>
            <Button mode="contained" style={{ marginTop: 24, borderRadius: 12 }} onPress={() => setModalVisible(true)}>
                Create First Budget
            </Button>
          </View>
        ) : (
          budgets.map(budget => (
            <Card key={budget.id} style={styles.budgetCard}>
              <Card.Content>
                <View style={styles.budgetHeader}>
                  <View style={{ flex: 1 }}>
                    <Title style={styles.categoryName}>{budget.category?.name}</Title>
                    <Text variant="labelSmall" style={styles.periodLabel}>Monthly Period</Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <IconButton 
                        icon="pencil" 
                        iconColor="#6200ee" 
                        size={20} 
                        onPress={() => openEdit(budget)} 
                    />
                    <IconButton 
                        icon="delete" 
                        iconColor="#f44336" 
                        size={20} 
                        onPress={() => deleteBudget(budget.id)} 
                    />
                  </View>
                </View>
                
                <View style={styles.amountRow}>
                  <View>
                    <Text variant="labelSmall">Spent</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{budget.spent.toLocaleString()} ETB</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="labelSmall">Budget</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{budget.amount.toLocaleString()} ETB</Text>
                  </View>
                </View>

                <ProgressBar 
                    progress={Math.min(budget.progress, 1)} 
                    color={getProgressColor(budget.progress)} 
                    style={styles.progressBar} 
                />
                
                <View style={styles.statusRow}>
                  {budget.progress >= 1 ? (
                    <View style={styles.badge}>
                        <AlertTriangle size={14} color="#f44336" />
                        <Text style={[styles.statusText, { color: '#f44336' }]}>Over Budget</Text>
                    </View>
                  ) : (
                    <View style={styles.badge}>
                        <CheckCircle2 size={14} color="#4caf50" />
                        <Text style={[styles.statusText, { color: '#4caf50' }]}>
                            {Math.round((1 - budget.progress) * 100)}% Left
                        </Text>
                    </View>
                  )}
                  <Text variant="labelSmall" style={{ color: '#666' }}>
                    {Math.round(budget.progress * 100)}% Used
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Add Budget"
        color="#fff"
      />

      <Portal>
        <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modal}>
          <Title>{editingId ? 'Edit' : 'Set'} Category Budget</Title>
          <TextInput
            label="Monthly Limit (ETB)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.label}>Select Category</Text>
          <ScrollView style={styles.catPicker}>
            {categories.filter(c => c.type === 'EXPENSE').map(cat => (
              <List.Item
                key={cat.id}
                title={cat.name}
                onPress={() => setCategoryId(cat.id)}
                style={[
                    styles.catItem, 
                    categoryId === cat.id && { backgroundColor: theme.colors.primaryContainer }
                ]}
                left={props => <List.Icon {...props} icon="tag" />}
              />
            ))}
          </ScrollView>
          <Button mode="contained" onPress={handleSave} style={styles.button} disabled={!amount || !categoryId}>
            {editingId ? 'Update Budget' : 'Save Budget'}
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    padding: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 24,
    color: '#6200ee',
    lineHeight: 28,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryProgress: {
    height: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: '#333',
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  budgetCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryName: {
    fontSize: 20,
  },
  periodLabel: {
    color: '#666',
    marginTop: -4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 24,
    maxHeight: '80%',
  },
  input: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  catPicker: {
    maxHeight: 200,
    marginBottom: 20,
  },
  catItem: {
    borderRadius: 12,
    marginBottom: 4,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 4,
  }
});

export default BudgetScreen;
