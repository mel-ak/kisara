import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Title, IconButton, useTheme, Surface } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSecurityStore } from '../store/useSecurityStore';
import { Fingerprint, Delete, Lock, ShieldCheck } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LockScreen = () => {
    const theme = useTheme();
    const { isSetupComplete, setPin, authenticate, isBiometricEnabled } = useSecurityStore();
    const [pin, setPinInput] = React.useState('');
    const [confirmPin, setConfirmPin] = React.useState('');
    const [step, setStep] = React.useState(isSetupComplete ? 'ENTER' : 'SET');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (isSetupComplete && isBiometricEnabled) {
            handleBiometrics();
        }
    }, [isSetupComplete, isBiometricEnabled]);

    const handleBiometrics = async () => {
        setError('');
        try {
            const success = await authenticate();
            if (!success && isBiometricEnabled) {
                // Check if it was a real failure vs a cancel
                const level = await LocalAuthentication.getEnrolledLevelAsync();
                if (level === LocalAuthentication.SecurityLevel.NONE) {
                    // Not actually enrolled/available anymore
                }
            }
        } catch (e) {
            console.error('[security] prompt error:', e);
        }
    };

    const handlePress = (num: string) => {
        setError('');
        if (pin.length < 4) {
            const newPin = pin + num;
            setPinInput(newPin);
            
            if (newPin.length === 4) {
                if (step === 'ENTER') {
                    handleUnlock(newPin);
                } else if (step === 'SET') {
                    setPinInput('');
                    setConfirmPin(newPin);
                    setStep('CONFIRM');
                } else if (step === 'CONFIRM') {
                    if (newPin === confirmPin) {
                        setPin(newPin);
                    } else {
                        setError('PINs do not match');
                        setPinInput('');
                        setStep('SET');
                    }
                }
            }
        }
    };

    const handleUnlock = async (enteredPin: string) => {
        const success = await authenticate(enteredPin);
        if (!success) {
            setError('Incorrect PIN');
            setPinInput('');
        }
    };

    const handleDelete = () => {
        setPinInput(pin.slice(0, -1));
    };

    const renderDot = (index: number) => {
        const isActive = pin.length > index;
        return (
            <View 
                key={index} 
                style={[
                    styles.dot, 
                    isActive ? { backgroundColor: theme.colors.primary, transform: [{ scale: 1.2 }] } : { backgroundColor: '#ddd' }
                ]} 
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Surface style={styles.iconCircle} elevation={1}>
                    {step === 'ENTER' ? <Lock color={theme.colors.primary} size={32} /> : <ShieldCheck color={theme.colors.primary} size={32} />}
                </Surface>
                <Title style={styles.title}>
                    {step === 'ENTER' ? 'Welcome Back' : step === 'SET' ? 'Set Secure PIN' : 'Confirm PIN'}
                </Title>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    {step === 'ENTER' ? 'Enter your 4-digit PIN to unlock' : 'Create a PIN to protect your data'}
                </Text>
            </View>

            <View style={styles.dotContainer}>
                {[0, 1, 2, 3].map(renderDot)}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <TouchableOpacity key={num} style={styles.key} onPress={() => handlePress(num.toString())}>
                        <Text style={styles.keyText}>{num}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.key} onPress={handleBiometrics} disabled={!isBiometricEnabled || step !== 'ENTER'}>
                    {isBiometricEnabled && step === 'ENTER' ? <Fingerprint color={theme.colors.primary} size={28} /> : null}
                </TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
                    <Text style={styles.keyText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={handleDelete}>
                    <Delete color="#666" size={28} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f3e5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#666',
        marginTop: 8,
    },
    dotContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
        height: 40,
        alignItems: 'center',
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    errorText: {
        color: '#f44336',
        marginBottom: 20,
        fontWeight: '600',
    },
    keypad: {
        width: width * 0.8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    key: {
        width: '30%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1.5%',
        borderRadius: 50,
    },
    keyText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
    }
});

export default LockScreen;
