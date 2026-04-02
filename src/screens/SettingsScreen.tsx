import React from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput as RNTextInput } from 'react-native';
import { List, Title, Switch, Divider, Button, Avatar, Card, Text, Portal, Modal, TextInput, IconButton, SegmentedButtons } from 'react-native-paper';
import { ChevronRight, Wallet, User, Bell, Shield, Info, LogOut, Plus, Trash2, Edit2, Share2 } from 'lucide-react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useSecurityStore } from '../store/useSecurityStore';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { generateCsv, escapeCsvField } from '../utils/csvExport';

const SettingsScreen = () => {
    const { accounts, categories, transactions, addAccount, updateAccount, deleteAccount, addCategory, deleteCategory, clearAllData, fetchData, getAllTransactions, getBackupData, importBackup } = useFinanceStore();
    const { isBiometricEnabled, toggleBiometrics, lock, setPin } = useSecurityStore();

    useFocusEffect(
      React.useCallback(() => {
          fetchData();
      }, [])
    );
    
    const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Modals state
  const [accountModalVisible, setAccountModalVisible] = React.useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = React.useState(false);
  
  // Form state
  const [editingAccount, setEditingAccount] = React.useState<any>(null);
  const [newAccName, setNewAccName] = React.useState('');
  const [newAccType, setNewAccType] = React.useState('CASH');
  const [newAccBalance, setNewAccBalance] = React.useState('0');

  const [newCatName, setNewCatName] = React.useState('');
  const [newCatType, setNewCatType] = React.useState('EXPENSE');

  const handleSaveAccount = async () => {
    if (!newAccName) return;
    const data = {
        name: newAccName,
        type: newAccType,
        balance: parseFloat(newAccBalance) || 0
    };

    if (editingAccount) {
        await updateAccount(editingAccount.id, data);
    } else {
        await addAccount(data);
    }
    
    closeAccountModal();
  };

  const openEditAccount = (acc: any) => {
    setEditingAccount(acc);
    setNewAccName(acc.name);
    setNewAccType(acc.type);
    setNewAccBalance(acc.balance.toString());
    setAccountModalVisible(true);
  };

  const closeAccountModal = () => {
    setAccountModalVisible(false);
    setEditingAccount(null);
    setNewAccName('');
    setNewAccType('CASH');
    setNewAccBalance('0');
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    await addCategory({
        name: newCatName,
        type: newCatType as 'INCOME' | 'EXPENSE',
        icon: 'plus'
    });
    setCategoryModalVisible(false);
    setNewCatName('');
  };

  const handleExport = async () => {
    const allTransactions = await getAllTransactions();
    if (allTransactions.length === 0) {
        Alert.alert('No Data', 'You have no transactions to export.');
        return;
    }
    
    try {
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Account', 'Note'];
        const csv = generateCsv(allTransactions, headers, (t: any) => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.category?.name || 'Uncategorized',
            t.amount,
            t.account?.name || 'No Account',
            t.note || ''
        ]);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `kisara_export_${timestamp}.csv`;
        const fileUri = (FileSystem as any).documentDirectory + fileName;
        
        await FileSystem.writeAsStringAsync(fileUri, csv, { 
            encoding: (FileSystem as any)?.EncodingType?.UTF8 || 'utf8'
        });
        
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            Alert.alert('Export Failed', 'Sharing is not available on this device.');
        }
    } catch (e) {
        console.error('Export Error:', e);
        Alert.alert('Error', 'Failed to export data.');
    }
  };
  
  const handleExportAll = async () => {
    try {
        const backupData = await getBackupData();
        const json = JSON.stringify(backupData, null, 2);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `kisara_backup_all_${timestamp}.json`;
        const fileUri = (FileSystem as any).documentDirectory + fileName;
        
        await FileSystem.writeAsStringAsync(fileUri, json, { 
            encoding: (FileSystem as any)?.EncodingType?.UTF8 || 'utf8'
        });
        
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            Alert.alert('Backup Failed', 'Sharing is not available on this device.');
        }
    } catch (e) {
        console.error('Backup Error:', e);
        Alert.alert('Error', 'Failed to backup all data.');
    }
  };

  const handleImportData = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        });
        
        if (result.canceled) return;
        
        const file = result.assets[0];
        const content = await FileSystem.readAsStringAsync(file.uri);
        const data = JSON.parse(content);
        
        // Simple validation
        if (!data.transactions || !data.accounts || !data.categories) {
            Alert.alert('Invalid Backup', 'The selected file is not a valid Kisara backup.');
            return;
        }
        
        Alert.alert(
            'Import Data',
            'This will replace all your current data with the backup contents. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Import', style: 'destructive', onPress: async () => {
                    try {
                        await importBackup(data);
                        Alert.alert('Success', 'Data imported successfully.');
                    } catch (err) {
                        console.error('Import process error:', err);
                        Alert.alert('Import Failed', 'An error occurred during data restoration.');
                    }
                }}
            ]
        );
    } catch (e) {
        console.error('Import Picking Error:', e);
        Alert.alert('Error', 'Failed to select or parse backup file.');
    }
  };

  const handleClearData = () => {
    Alert.alert(
        'Clear All Data',
        'Are you sure you want to delete everything? This cannot be undone.',
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete Everything', style: 'destructive', onPress: async () => await clearAllData() }
        ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
            <Avatar.Text size={64} label="PM" style={styles.avatar} />
            <Title>Personal Finance User</Title>
            <Text variant="bodyMedium">Local Storage Mode</Text>
        </View>

        <Title style={styles.sectionTitle}>Manage Assets</Title>
        <Card style={styles.card}>
            <List.Section>
                <List.Subheader>Accounts</List.Subheader>
                {accounts.map(acc => (
                    <List.Item
                        key={acc.id}
                        title={acc.name}
                        description={`${acc.balance.toLocaleString()} ETB • ${acc.type}`}
                        left={props => <List.Icon {...props} icon="wallet" />}
                        right={() => (
                            <View style={{ flexDirection: 'row' }}>
                                <IconButton icon="pencil" iconColor="#6200ee" onPress={() => openEditAccount(acc)} />
                                <IconButton icon="delete" iconColor="#f44336" onPress={() => deleteAccount(acc.id)} />
                            </View>
                        )}
                    />
                ))}
                <Divider />
                <List.Item
                    title="Add New Account"
                    left={props => <List.Icon {...props} icon="plus" />}
                    onPress={() => {
                        setEditingAccount(null);
                        setAccountModalVisible(true);
                    }}
                />
            </List.Section>
        </Card>

        <Title style={styles.sectionTitle}>Customization</Title>
        <Card style={styles.card}>
            <List.Section>
                <List.Subheader>Categories</List.Subheader>
                <ScrollView style={{ maxHeight: 200 }}>
                    {categories.map(cat => (
                        <List.Item
                            key={cat.id}
                            title={cat.name}
                            description={cat.type}
                            left={props => <List.Icon {...props} icon="tag" />}
                            right={() => (
                                <IconButton icon="delete" iconColor="#f44336" onPress={() => deleteCategory(cat.id)} />
                            )}
                        />
                    ))}
                </ScrollView>
                <Divider />
                <List.Item
                    title="Add New Category"
                    left={props => <List.Icon {...props} icon="plus" />}
                    onPress={() => setCategoryModalVisible(true)}
                />
            </List.Section>
        </Card>

        <Title style={styles.sectionTitle}>Data & Security</Title>
        <Card style={styles.card}>
            <List.Item
                title="Export Transactions (CSV)"
                left={props => <List.Icon {...props} icon="file-delimited" />}
                onPress={handleExport}
                right={() => <Share2 size={20} color="#6200ee" style={styles.shareIcon} />}
            />
            <Divider />
            <List.Item
                title="Backup Everything (JSON)"
                description="Export all accounts, categories, and history"
                left={props => <List.Icon {...props} icon="database-export" />}
                onPress={handleExportAll}
                right={() => <Share2 size={20} color="#6200ee" style={styles.shareIcon} />}
            />
            <Divider />
            <List.Item
                title="Import Data (JSON)"
                description="Restore from a previous backup"
                left={props => <List.Icon {...props} icon="database-import" />}
                onPress={handleImportData}
            />
            <Divider />
            <List.Item
                title="Clear All Data"
                titleStyle={{ color: '#f44336' }}
                left={props => <List.Icon {...props} icon="delete-forever" color="#f44336" />}
                onPress={handleClearData}
            />
        </Card>
        
        <Title style={styles.sectionTitle}>Privacy Info</Title>
        <Card style={[styles.card, { backgroundColor: '#e3f2fd' }]}>
            <Card.Content>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <Shield size={20} color="#1565c0" />
                    <Text variant="labelMedium" style={{ color: '#1565c0', fontWeight: 'bold' }}>Local Data Residency</Text>
                </View>
                <Text variant="bodySmall" style={{ color: '#455a64', marginTop: 8 }}>
                    Kisara stores all your financial data locally on this device. We do not use cloud servers, ensuring your privacy remains 100% yours.
                </Text>
            </Card.Content>
        </Card>

        <Title style={styles.sectionTitle}>Security</Title>
        <Card style={styles.card}>
            <List.Item
                title="Biometric Unlock"
                description="Use Fingerprint or FaceID"
                left={props => <List.Icon {...props} icon="fingerprint" />}
                right={() => <Switch value={isBiometricEnabled} onValueChange={toggleBiometrics} />}
            />
            <Divider />
            <List.Item
                title="Change PIN"
                left={props => <List.Icon {...props} icon="lock-reset" />}
                onPress={() => {
                    Alert.alert('Change PIN', 'Your app will lock and you will be asked to set a new PIN.', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Reset & Lock', onPress: () => lock() }
                    ]);
                }}
            />
            <Divider />
            <List.Item
                title="Lock App Now"
                left={props => <List.Icon {...props} icon="lock" />}
                onPress={() => lock()}
            />
        </Card>

        <Title style={styles.sectionTitle}>Preferences</Title>
        <Card style={styles.card}>
            <List.Item
                title="Dark Mode"
                left={props => <List.Icon {...props} icon="brightness-6" />}
                right={() => <Switch value={isDarkMode} onValueChange={setIsDarkMode} />}
            />
        </Card>
        
        <View style={styles.footer}>
            <Text variant="labelSmall">Kisara Finance v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <Portal>
        {/* Add/Edit Account Modal */}
        <Modal visible={accountModalVisible} onDismiss={closeAccountModal} contentContainerStyle={styles.modal}>
            <Title>{editingAccount ? 'Edit Account' : 'Add New Account'}</Title>
            <TextInput
                label="Account Name (e.g. Telebirr)"
                value={newAccName}
                onChangeText={setNewAccName}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Current Balance"
                value={newAccBalance}
                onChangeText={setNewAccBalance}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
            />
            <SegmentedButtons
                value={newAccType}
                onValueChange={setNewAccType}
                buttons={[
                    { value: 'CASH', label: 'Cash' },
                    { value: 'BANK', label: 'Bank' },
                    { value: 'WALLET', label: 'Wallet' },
                ]}
                style={styles.input}
            />
            <Button mode="contained" onPress={handleSaveAccount} style={styles.button}>
                {editingAccount ? 'Update Account' : 'Save Account'}
            </Button>
        </Modal>

        {/* Add Category Modal */}
        <Modal visible={categoryModalVisible} onDismiss={() => setCategoryModalVisible(false)} contentContainerStyle={styles.modal}>
            <Title>Add New Category</Title>
            <TextInput
                label="Category Name"
                value={newCatName}
                onChangeText={setNewCatName}
                mode="outlined"
                style={styles.input}
            />
            <SegmentedButtons
                value={newCatType}
                onValueChange={setNewCatType}
                buttons={[
                    { value: 'EXPENSE', label: 'Expense' },
                    { value: 'INCOME', label: 'Income' },
                ]}
                style={styles.input}
            />
            <Button mode="contained" onPress={handleAddCategory} style={styles.button}>
                Save Category
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginBottom: 12,
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  shareIcon: {
    alignSelf: 'center',
    marginRight: 10,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  }
});

export default SettingsScreen;
