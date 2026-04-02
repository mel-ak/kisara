import React from 'react';
import { View, StyleSheet, FlatList, TextInput as RNTextInput, Alert } from 'react-native';
import { Text, List, Searchbar, SegmentedButtons, Chip, useTheme, IconButton } from 'react-native-paper';
import { useFinanceStore } from '../store/useFinanceStore';
import { Utensils, Bus, Home, Plus, Briefcase, Banknote, Search } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

const HistoryScreen = () => {
  const theme = useTheme();
  const { transactions, deleteTransaction, fetchData } = useFinanceStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState('ALL');

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = (t.note || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'ALL' || t.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'food': return <Utensils size={20} color={theme.colors.primary} />;
      case 'transport': return <Bus size={20} color={theme.colors.primary} />;
      case 'rent': return <Home size={20} color={theme.colors.primary} />;
      case 'salary': return <Banknote size={20} color="#4caf50" />;
      case 'business': return <Briefcase size={20} color="#4caf50" />;
      default: return <Plus size={20} color={theme.colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search transactions..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        elevation={0}
      />
      
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'ALL', label: 'All' },
            { value: 'EXPENSE', label: 'Expenses' },
            { value: 'INCOME', label: 'Income' },
          ]}
          style={styles.segmented}
          density="medium"
        />
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.note || item.category?.name || 'Transaction'}
            description={`${new Date(item.date).toLocaleDateString()} • ${item.account?.name}`}
            left={() => <View style={styles.iconContainer}>{getIcon(item.category?.name || '')}</View>}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.amount, { color: item.type === 'INCOME' ? '#4caf50' : '#f44336' }]}>
                  {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString()}
                </Text>
                <IconButton 
                    icon="delete-outline" 
                    iconColor="#ccc" 
                    size={20} 
                    onPress={() => {
                        Alert.alert(
                            'Delete Transaction',
                            'Are you sure you want to delete this record?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(item.id) }
                            ]
                        );
                    }} 
                />
              </View>
            )}
            style={styles.listItem}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Search size={48} color="#ccc" style={{ marginBottom: 12 }} />
            <Text variant="bodyLarge" style={{ color: '#666', fontWeight: '600' }}>No Transactions Found</Text>
            <Text variant="bodySmall" style={{ color: '#999', marginTop: 4 }}>
                Try adjusting your filters or search query.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchbar: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmented: {
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  iconContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'center',
    marginRight: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  }
});

export default HistoryScreen;
