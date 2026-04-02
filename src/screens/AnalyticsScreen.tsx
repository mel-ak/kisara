import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Title, Card, useTheme, ProgressBar, Button, Portal, Modal, TextInput, IconButton, List, Divider } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { TrendingUp, Target } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useFinanceStore } from '../store/useFinanceStore';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
    const theme = useTheme();
    const { categoryStats, monthlyStats, goals, deleteGoal, addGoal, updateGoal, fetchData } = useFinanceStore();
    const [goalModalVisible, setGoalModalVisible] = React.useState(false);
    const [goalName, setGoalName] = React.useState('');
    const [goalTarget, setGoalTarget] = React.useState('');

    useFocusEffect(
      React.useCallback(() => {
        fetchData();
      }, [])
    );

    const handleAddGoal = async () => {
      if (!goalName || !goalTarget) return;
      await addGoal({
        name: goalName,
        targetAmount: parseFloat(goalTarget),
        currentAmount: 0
      });
      setGoalModalVisible(false);
      setGoalName('');
      setGoalTarget('');
    };

    const chartData = categoryStats.map(stat => ({
      name: stat.name,
      population: stat.amount,
      color: stat.color,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Spending Breakdown</Title>
            {chartData.length > 0 ? (
              <PieChart
                data={chartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            ) : (
              <View style={styles.empty}>
                <TrendingUp size={48} color="#ccc" style={{ marginBottom: 12 }} />
                <Text variant="bodyMedium" style={{ color: '#666' }}>No spending data yet.</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {categoryStats.length > 0 && (
            <Card style={styles.card}>
                <Card.Content>
                <Title>Top Categories</Title>
                {categoryStats.sort((a,b) => b.amount - a.amount).map((cat, index) => (
                    <View key={index}>
                    <List.Item
                        title={cat.name}
                        right={() => <Text style={styles.amount}>{cat.amount.toLocaleString()} ETB</Text>}
                        left={() => <View style={[styles.colorDot, { backgroundColor: cat.color }]} />}
                    />
                    {index < categoryStats.length - 1 && <Divider />}
                    </View>
                ))}
                </Card.Content>
            </Card>
        )}
        
        {/* Savings Summary */}
        <Title style={styles.title}>Savings Power</Title>
        <Card style={[styles.card, { backgroundColor: '#e8f5e9' }]}>
            <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text variant="labelMedium" style={{ color: '#2e7d32' }}>Monthly Savings</Text>
                        <Title style={{ color: '#1b5e20', fontSize: 24, fontWeight: '900' }}>
                           {(monthlyStats.income - monthlyStats.expense).toLocaleString()} ETB
                        </Title>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="labelMedium" style={{ color: '#2e7d32' }}>Savings Rate</Text>
                        <Title style={{ color: '#1b5e20', fontSize: 24, fontWeight: '900' }}>
                            {Math.round(((monthlyStats.income - monthlyStats.expense) / Math.max(monthlyStats.income, 1)) * 100)}%
                        </Title>
                    </View>
                </View>
                <View style={styles.savingsTip}>
                    <TrendingUp size={16} color="#2e7d32" />
                    <Text variant="bodySmall" style={{ color: '#2e7d32', flex: 1, marginLeft: 8 }}>
                        {((monthlyStats.income - monthlyStats.expense) / Math.max(monthlyStats.income, 1)) > 0.2 
                            ? "Excellent! You're saving over 20% of your income." 
                            : "Try to aim for a 20% savings rate for long-term security."}
                    </Text>
                </View>
            </Card.Content>
        </Card>
        
        <Title style={[styles.title, { marginTop: 8 }]}>Saving Goals</Title>
        {goals.length === 0 ? (
            <Card style={styles.card}>
                <Card.Content style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <Target size={48} color="#ccc" style={{ marginBottom: 12 }} />
                    <Text variant="bodyLarge" style={{ fontWeight: '600', color: '#666' }}>No Goals Active</Text>
                    <Text variant="bodySmall" style={{ color: '#999', textAlign: 'center', marginTop: 4 }}>
                        Save for your future. Start by adding a goal!
                    </Text>
                    <Button mode="contained" style={{ marginTop: 20, borderRadius: 12 }} onPress={() => setGoalModalVisible(true)}>
                        Add Your First Goal
                    </Button>
                </Card.Content>
            </Card>
        ) : (
            <>
                {goals.map(goal => {
                    const left = goal.targetAmount - goal.currentAmount;
                    const monthlySavings = Math.max(monthlyStats.income - monthlyStats.expense, 0);
                    const monthsToReach = monthlySavings > 0 ? Math.ceil(left / monthlySavings) : null;
                    const progress = goal.currentAmount / goal.targetAmount;

                    return (
                        <Card key={goal.id} style={[styles.card, { marginBottom: 16 }]}>
                            <Card.Content>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View>
                                        <Title style={{ fontSize: 18, marginBottom: 0 }}>{goal.name}</Title>
                                        <Text variant="labelSmall" style={{ color: '#666' }}>
                                            {left <= 0 ? 'Goal Achieved! 🎉' : `${left.toLocaleString()} ETB remaining`}
                                        </Text>
                                    </View>
                                    <IconButton icon="delete-outline" iconColor="#f44336" size={20} onPress={() => deleteGoal(goal.id)} />
                                </View>

                                <View style={styles.progressHeader}>
                                    <Text variant="bodySmall" style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                                    <Text variant="bodySmall" style={styles.targetDate}>
                                        {left > 0 && monthsToReach ? `Est. reach in ${monthsToReach} month(s)` : ''}
                                    </Text>
                                </View>
                                
                                <ProgressBar progress={Math.min(progress, 1)} color={progress >= 1 ? '#4caf50' : '#6200ee'} style={{ height: 10, borderRadius: 5 }} />
                                
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
                                    <Button 
                                        compact 
                                        mode="contained-tonal"
                                        labelStyle={{ fontSize: 10 }}
                                        onPress={() => updateGoal(goal.id, { currentAmount: goal.currentAmount + 100 })}
                                    >
                                        +100
                                    </Button>
                                    <Button 
                                        compact 
                                        mode="contained-tonal"
                                        labelStyle={{ fontSize: 10 }}
                                        onPress={() => updateGoal(goal.id, { currentAmount: goal.currentAmount + 500 })}
                                    >
                                        +500
                                    </Button>
                                    <Button 
                                        compact 
                                        mode="contained"
                                        labelStyle={{ fontSize: 10 }}
                                        onPress={() => updateGoal(goal.id, { currentAmount: goal.targetAmount })}
                                    >
                                        Full
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    );
                })}
                <Button icon="plus" mode="contained" style={{ marginVertical: 10, borderRadius: 12 }} onPress={() => setGoalModalVisible(true)}>
                    New Saving Goal
                </Button>
            </>
        )}

      <Portal>
          <Modal visible={goalModalVisible} onDismiss={() => setGoalModalVisible(false)} contentContainerStyle={styles.modal}>
              <Title>New Saving Goal</Title>
              <TextInput
                  label="Goal Name (e.g. New Phone)"
                  value={goalName}
                  onChangeText={setGoalName}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
              />
              <TextInput
                  label="Target Amount (ETB)"
                  value={goalTarget}
                  onChangeText={setGoalTarget}
                  keyboardType="numeric"
                  mode="outlined"
                  style={{ marginBottom: 20 }}
              />
              <Button mode="contained" onPress={handleAddGoal}>
                  Establish Goal
              </Button>
          </Modal>
      </Portal>
    </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 24,
  },
  empty: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
    marginRight: 10,
  },
  savingsTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
    marginTop: 12,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  targetDate: {
    color: '#666',
    fontStyle: 'italic',
  }
});

export default AnalyticsScreen;
