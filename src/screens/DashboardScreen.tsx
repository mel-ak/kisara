import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { List, Card, Title, Text, FAB, useTheme, ProgressBar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Utensils, Bus, Home, Banknote, Briefcase, Plus } from 'lucide-react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useSecurityStore } from '../store/useSecurityStore';
import { useFocusEffect } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { totalBalance, transactions, monthlyStats, budgets, insights, fetchData } = useFinanceStore();
  const { lock } = useSecurityStore();

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const [isBalanceVisible, setIsBalanceVisible] = React.useState(false);

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'food': return <Utensils size={24} color={theme.colors.primary} />;
      case 'transport': return <Bus size={24} color={theme.colors.primary} />;
      case 'rent': return <Home size={24} color={theme.colors.primary} />;
      case 'salary': return <Banknote size={24} color="#4caf50" />;
      case 'business': return <Briefcase size={24} color="#4caf50" />;
      default: return <Plus size={24} color={theme.colors.primary} />;
    }
  };

  const expenseRatio = monthlyStats.income > 0 ? monthlyStats.expense / monthlyStats.income : 1;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header with Quick Lock */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={{ width: 32, height: 32, borderRadius: 8 }} 
              resizeMode="contain"
            />
            <Title style={styles.appTitle}>Kisara</Title>
          </View>
          <IconButton
            icon="lock"
            mode="contained-tonal"
            containerColor="#f3e5f5"
            iconColor="#6200ee"
            size={20}
            onPress={() => lock()}
          />
        </View>

        {/* AI Insights */}
        {insights.length > 0 && (
          <Card style={styles.insightCard}>
            <Card.Content style={styles.insightContent}>
              <View style={styles.insightIcon}>
                <TrendingUp color="#6200ee" size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightTitle}>Financial Insight</Text>
                <Text variant="bodyMedium">{insights[0]}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="labelLarge" style={{ color: '#fff', opacity: 0.8 }}>Total Balance</Text>
              <IconButton
                icon={isBalanceVisible ? "eye-off" : "eye"}
                iconColor="#fff"
                size={20}
                onPress={() => setIsBalanceVisible(!isBalanceVisible)}
                style={{ margin: 0 }}
              />
            </View>
            <Title style={styles.balanceAmount}>
              {isBalanceVisible ? `${totalBalance.toLocaleString()} ETB` : '•••• ETB'}
            </Title>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ArrowUpRight size={20} color="#4caf50" />
                <View>
                  <Text variant="labelSmall" style={styles.statLabel}>Monthly Income</Text>
                  <Text variant="bodyMedium" style={styles.statValue}>
                    {isBalanceVisible ? `${monthlyStats.income.toLocaleString()} ETB` : '•••• ETB'}
                  </Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <ArrowDownLeft size={20} color="#f44336" />
                <View>
                  <Text variant="labelSmall" style={styles.statLabel}>Monthly Expense</Text>
                  <Text variant="bodyMedium" style={styles.statValue}>
                    {isBalanceVisible ? `${monthlyStats.expense.toLocaleString()} ETB` : '•••• ETB'}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('AddTransaction', { type: 'INCOME' })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#e8f5e9' }]}>
              <ArrowUpRight color="#2e7d32" size={24} />
            </View>
            <Text style={styles.actionText}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('AddTransaction', { type: 'EXPENSE' })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#ffebee' }]}>
              <ArrowDownLeft color="#c62828" size={24} />
            </View>
            <Text style={styles.actionText}>Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('History')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#e3f2fd' }]}>
              <Wallet color="#1565c0" size={24} />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Watch */}
        {budgets.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Budget Watch</Title>
              {budgets.slice(0, 2).map((b: any) => (
                <View key={b.id} style={{ marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="labelMedium">{b.category?.name}</Text>
                    <Text variant="labelMedium" style={{ color: b.progress >= 1 ? '#f44336' : '#666' }}>
                      {Math.round(b.progress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar progress={Math.min(b.progress, 1)} color={b.progress >= 1 ? '#f44336' : '#6200ee'} style={{ height: 6, borderRadius: 3, marginTop: 4 }} />
                </View>
              ))}
            </Card.Content>
          </Card>
        )}



        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Recent Transactions</Title>
          <Text variant="labelLarge" style={styles.viewAll} onPress={() => navigation.navigate('History')}>View All</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Wallet size={48} color="#ccc" style={{ marginBottom: 12 }} />
            <Text variant="bodyLarge" style={{ color: '#666', fontWeight: '600' }}>No Transactions Yet</Text>
            <Text variant="bodySmall" style={{ color: '#999', textAlign: 'center', marginTop: 4 }}>
              Tap the + button to add your first expense or income.
            </Text>
          </View>
        ) : (
          transactions.map((item: any) => (
            <List.Item
              key={item.id}
              title={item.note || item.category?.name || 'Transaction'}
              description={`${new Date(item.date).toLocaleDateString()} • ${item.account?.name}`}
              left={() => <View style={styles.iconContainer}>{getIcon(item.category?.name || '')}</View>}
              right={() => (
                <Text style={[styles.amount, { color: item.type === 'INCOME' ? '#4caf50' : '#f44336' }]}>
                  {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString()}
                </Text>
              )}
              style={styles.listItem}
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        label="Add"
        onPress={() => navigation.navigate('AddTransaction')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  scroll: {
    padding: 16,
    paddingBottom: 100,
  },
  insightCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
    elevation: 2,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  insightIcon: {
    backgroundColor: '#f3e5f5',
    padding: 8,
    borderRadius: 12,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6200ee',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  balanceCard: {
    backgroundColor: '#6200ee',
    marginBottom: 16,
    borderRadius: 20,
    elevation: 8,
    paddingVertical: 10,
  },
  balanceTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    elevation: 2,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 10,
  },
  statValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginBottom: 24,
    borderRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAll: {
    color: '#6200ee',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  iconContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'center',
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
    borderRadius: 16,
  },
});

export default DashboardScreen;
