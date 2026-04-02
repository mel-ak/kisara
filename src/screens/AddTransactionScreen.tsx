import React from 'react';
import { View, StyleSheet, ScrollView, Platform as RNPlatform } from 'react-native';
import { TextInput, Button, SegmentedButtons, Title, List, useTheme, Portal, Modal, Text } from 'react-native-paper';
import { useFinanceStore } from '../store/useFinanceStore';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTransactionScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { categories, accounts, addTransaction } = useFinanceStore();

  const [amount, setAmount] = React.useState('');
  const [type, setType] = React.useState('EXPENSE');
  const [note, setNote] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [accountId, setAccountId] = React.useState<number | null>(null);
  const [date, setDate] = React.useState(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const [catModalVisible, setCatModalVisible] = React.useState(false);
  const [accModalVisible, setAccModalVisible] = React.useState(false);

  const handleSubmit = async () => {
    if (!amount || !categoryId || !accountId) return;

    await addTransaction({
      amount: parseFloat(amount),
      type: type as 'INCOME' | 'EXPENSE',
      note,
      categoryId,
      accountId,
      date,
    });

    navigation.goBack();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedAccount = accounts.find(a => a.id === accountId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SegmentedButtons
          value={type}
          onValueChange={setType}
          buttons={[
            { value: 'EXPENSE', label: 'Expense', checkedColor: '#f44336' },
            { value: 'INCOME', label: 'Income', checkedColor: '#4caf50' },
          ]}
          style={styles.segmented}
        />

        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          mode="outlined"
          left={<TextInput.Affix text="ETB" />}
        />

        <List.Item
          title={selectedCategory ? selectedCategory.name : 'Select Category'}
          left={props => <List.Icon {...props} icon="tag" />}
          onPress={() => setCatModalVisible(true)}
          style={styles.listItem}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title={selectedAccount ? selectedAccount.name : 'Select Account'}
          left={props => <List.Icon {...props} icon="wallet" />}
          onPress={() => setAccModalVisible(true)}
          style={styles.listItem}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />

        <List.Item
          title={date.toLocaleDateString()}
          left={props => <List.Icon {...props} icon="calendar" />}
          onPress={() => setShowDatePicker(true)}
          style={styles.listItem}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />

        <TextInput
          label="Note (Optional)"
          value={note}
          onChangeText={setNote}
          style={styles.input}
          mode="outlined"
          multiline
        />

        <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.submitBtn}
            disabled={!amount || !categoryId || !accountId}
        >
          Save Transaction
        </Button>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            onChange={onDateChange}
          />
        )}
      </ScrollView>

      {/* Category Modal */}
      <Portal>
        <Modal visible={catModalVisible} onDismiss={() => setCatModalVisible(false)} contentContainerStyle={styles.modal}>
          <Title>Select Category</Title>
          <ScrollView>
            {categories.filter(c => c.type === type).map(cat => (
              <List.Item
                key={cat.id}
                title={cat.name}
                onPress={() => {
                  setCategoryId(cat.id);
                  setCatModalVisible(false);
                }}
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Account Modal */}
      <Portal>
        <Modal visible={accModalVisible} onDismiss={() => setAccModalVisible(false)} contentContainerStyle={styles.modal}>
          <Title>Select Account</Title>
          <ScrollView>
            {accounts.map(acc => (
              <List.Item
                key={acc.id}
                title={acc.name}
                description={`${acc.balance.toLocaleString()} ETB`}
                onPress={() => {
                  setAccountId(acc.id);
                  setAccModalVisible(false);
                }}
              />
            ))}
          </ScrollView>
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
  },
  segmented: {
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderRadius: 12,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    paddingVertical: 4,
  },
  submitBtn: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 12,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    maxHeight: '60%',
    borderRadius: 20,
  }
});

export default AddTransactionScreen;
