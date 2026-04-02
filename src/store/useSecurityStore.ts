import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

interface SecurityState {
  isLocked: boolean;
  isBiometricEnabled: boolean;
  hasPin: boolean;
  isSetupComplete: boolean;
  checkSecurityStatus: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  authenticate: (pin?: string) => Promise<boolean>;
  lock: () => void;
  unlock: () => void;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  isLocked: true,
  isBiometricEnabled: false,
  hasPin: false,
  isSetupComplete: false,

  checkSecurityStatus: async () => {
    const pin = await SecureStore.getItemAsync('user_pin');
    const bEnabled = await SecureStore.getItemAsync('biometric_enabled');
    const setupComp = await SecureStore.getItemAsync('security_setup_complete');
    
    set({ 
        hasPin: !!pin, 
        isBiometricEnabled: bEnabled === 'true',
        isSetupComplete: setupComp === 'true',
        isLocked: setupComp === 'true' // Lock only if setup is done
    });
  },

  setPin: async (pin) => {
    await SecureStore.setItemAsync('user_pin', pin);
    await SecureStore.setItemAsync('security_setup_complete', 'true');
    set({ hasPin: true, isSetupComplete: true, isLocked: false });
  },

  toggleBiometrics: async (enabled) => {
    await SecureStore.setItemAsync('biometric_enabled', enabled ? 'true' : 'false');
    set({ isBiometricEnabled: enabled });
  },

  authenticate: async (pin) => {
    // 1. PIN Authentication
    if (pin !== undefined) {
        const storedPin = await SecureStore.getItemAsync('user_pin');
        if (pin === storedPin) {
            set({ isLocked: false });
            return true;
        }
        return false; // Stop here if PIN was provided but incorrect
    }

    // 2. Biometric Authentication
    if (get().isBiometricEnabled) {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Unlock Kisara',
                    fallbackLabel: 'Use PIN',
                    disableDeviceFallback: false,
                });
                
                if (result.success) {
                    set({ isLocked: false });
                    return true;
                }
            }
        } catch (error) {
            console.error('[security] Biometric error:', error);
        }
    }

    return false;
  },

  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
}));
