import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { COLORS } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/authService';
import { buildApiUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

// --- Simple Placeholder Icons ---
const ArrowIcon = () => <Text style={styles.arrowIcon}>→</Text>;
const EditIcon = () => <Text style={styles.editIcon}>✎</Text>;

// --- Navigation Type ---
type LoginNavigationProp = StackNavigationProp<AuthStackParamList, 'LoginScreen'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  // Animation values
  const otpOpacity = useRef(new Animated.Value(0)).current;
  const otpTranslateY = useRef(new Animated.Value(20)).current;
  const linkOpacity = useRef(new Animated.Value(1)).current;

  // Start OTP timer when step changes to 'otp'
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loginStep === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loginStep, timer]);

  const handlePhoneSubmit = async () => {
    if (phone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const generatedDeviceId = authService.generateDeviceId();
      setDeviceId(generatedDeviceId);

      const res = await fetch(buildApiUrl('/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || 'Failed to send OTP');

      Animated.parallel([
        Animated.timing(otpOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(otpTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(linkOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setLoginStep('otp');
      setTimer(60);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Enter the OTP sent to your number.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to initiate OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter a valid OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(buildApiUrl('/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}`, otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || 'Verification failed');

      const token: string | undefined = json?.data?.token;
      const userData = json?.data?.user;
      
      if (token && userData) {
        // Store user data and token in auth context
        await login(userData, token);
        
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OnboardingScreen1'),
          },
        ]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setIsLoading(true);
    try {
      const res = await fetch(buildApiUrl('/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || 'Failed to resend OTP');
      setTimer(60);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'OTP has been resent.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to go back to phone entry
  const editPhoneNumber = () => {
    Animated.parallel([
        Animated.timing(otpOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(otpTranslateY, { toValue: 20, duration: 300, useNativeDriver: true }),
        Animated.timing(linkOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    setLoginStep('phone');
    setOtp('');
    setTimer(0);
    setOtpSent(false);
  };

  return (
    <LinearGradient
      colors={['#347928', '#5DBB4E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.flexContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexContainer}
        >
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Markhet Farmer App</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Enter your Number to continue</Text>

              {/* --- Phone Input --- */}
              <View style={styles.inputContainer}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Phone Number"
                  placeholderTextColor="#FFFFFF80"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                  editable={loginStep === 'phone' && !isLoading}
                />
                {loginStep === 'phone' && phone.length === 10 && !isLoading && (
                  <TouchableOpacity style={styles.inputIcon} onPress={handlePhoneSubmit}>
                    <ArrowIcon />
                  </TouchableOpacity>
                )}
                {loginStep === 'otp' && !isLoading && (
                    <TouchableOpacity style={styles.inputIcon} onPress={editPhoneNumber}>
                        <EditIcon />
                    </TouchableOpacity>
                )}
                {isLoading && (
                  <ActivityIndicator size="small" color={COLORS.secondary} />
                )}
              </View>

              {/* --- OTP Input (Animated) --- */}
              <Animated.View
                style={{
                  opacity: otpOpacity,
                  transform: [{ translateY: otpTranslateY }],
                  width: '100%',
                }}
              >
                <View style={[styles.inputContainer, styles.otpInputContainer]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter OTP"
                      placeholderTextColor="#FFFFFF80"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={setOtp}
                      editable={loginStep === 'otp' && !isLoading}
                    />
                </View>
                <Text style={styles.timerText}>
                  {timer > 0 
                    ? `OTP will expire in ${timer} sec` 
                    : otpSent 
                      ? "Didn't receive? " 
                      : "OTP will be sent after phone verification"
                  }
                  {timer === 0 && otpSent && (
                    <TouchableOpacity onPress={handleResendOTP}>
                      <Text style={[styles.timerText, styles.resendText]}> Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </Text>
              </Animated.View>

              {/* Submit button appears after OTP is entered */}
              {loginStep === 'otp' && otp.length >= 4 && !isLoading && (
                <TouchableOpacity style={styles.submitButton} onPress={handleOtpSubmit}>
                    <Text style={styles.submitButtonText}>Verify & Proceed</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Debug Info - Remove in production */}
            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugText}>Device ID: {deviceId}</Text>
                <Text style={styles.debugText}>Auth Status: {authService.isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}</Text>
              </View>
            )}
            
            <Animated.View style={{ opacity: linkOpacity }}>
                <View style={styles.linkContainer}>
                    <Text style={styles.linkText}>Want to get Buyers App? </Text>
                    <TouchableOpacity>
                        <Text style={[styles.linkText, styles.linkAction]}>Click here</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    height: 55,
    width: '100%',
    paddingHorizontal: 15,
  },
  otpInputContainer: {
    marginTop: 15,
  },
  countryCode: {
    color: COLORS.secondary,
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 18,
  },
  inputIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    color: COLORS.secondary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  editIcon: {
      color: COLORS.secondary,
      fontSize: 16,
  },
  timerText: {
    color: COLORS.secondary,
    marginTop: 10,
    fontSize: 14,
  },
  resendText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
    borderWidth: 1,
    borderRadius: 12,
    height: 55,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  linkText: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  linkAction: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  debugText: {
    color: COLORS.secondary,
    fontSize: 12,
  },
});

export default LoginScreen;