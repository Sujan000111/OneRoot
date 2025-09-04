import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { COLORS } from '../../theme/colors';
import Checkbox from '../../components/Checkbox';
import { authService } from '../../services/authService';
import { buildApiUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const BackArrowIcon = () => <Text style={styles.iconText}>←</Text>;

type OnboardingNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'OnboardingScreen1'
>;

const OnboardingScreen1 = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { completeOnboarding } = useAuth();
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taluk, setTaluk] = useState('');
  const [village, setVillage] = useState('');
  const [pincode, setPincode] = useState('');
  const [language, setLanguage] = useState('en');
  const [agreeToCalls, setAgreeToCalls] = useState(true);
  const [agreeToWhatsApp, setAgreeToWhatsApp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!name || !state || !district || !taluk || !village || !pincode) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get token from auth service
      const token = authService.getJwt();
      
      console.log('🔐 Onboarding - Token from authService:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('🔐 Onboarding - Token length:', token ? token.length : 0);
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please login first to continue.');
        return;
      }

      const requestBody = { 
        name, 
        state, 
        district, 
        taluk, 
        village, 
        pincode 
      };
      
      console.log('📤 Onboarding - Request body:', requestBody);
      console.log('📤 Onboarding - API URL:', buildApiUrl('/user/profile'));
      console.log('📤 Onboarding - Authorization header:', `Bearer ${token.substring(0, 20)}...`);

      const res = await fetch(buildApiUrl('/user/profile'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Onboarding - Response status:', res.status);
      console.log('📥 Onboarding - Response ok:', res.ok);

      const json = await res.json();
      console.log('📥 Onboarding - Response body:', json);
      
      if (!res.ok || !json.success) {
        console.error('❌ Onboarding - API Error:', json);
        throw new Error(json?.message || 'Failed to save profile');
      }

      // Store profile data in auth context
      await completeOnboarding({
        name,
        state,
        district,
        taluk,
        village,
        pincode,
        language
      });

      navigation.navigate('OnboardingScreen2');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save your details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <BackArrowIcon />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Enter your personal details</Text>
        <Text style={styles.subtitle}>
          We will use these details to create your account
        </Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>1 of 2 steps completed</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Name here"
            placeholderTextColor={COLORS.mediumGray}
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your State here"
            placeholderTextColor={COLORS.mediumGray}
            value={state}
            onChangeText={setState}
          />
          <Text style={styles.label}>District *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your District here"
            placeholderTextColor={COLORS.mediumGray}
            value={district}
            onChangeText={setDistrict}
          />
          <Text style={styles.label}>Taluk/Block *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Taluk/Block here"
            placeholderTextColor={COLORS.mediumGray}
            value={taluk}
            onChangeText={setTaluk}
          />
          <Text style={styles.label}>Village *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Village here"
            placeholderTextColor={COLORS.mediumGray}
            value={village}
            onChangeText={setVillage}
          />
          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 6-digit Pincode"
            placeholderTextColor={COLORS.mediumGray}
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={styles.label}>Language *</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.languageOptionSelected]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.languageText, language === 'en' && styles.languageTextSelected]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageOption, language === 'hi' && styles.languageOptionSelected]}
              onPress={() => setLanguage('hi')}
            >
              <Text style={[styles.languageText, language === 'hi' && styles.languageTextSelected]}>
                हिंदी
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageOption, language === 'kn' && styles.languageOptionSelected]}
              onPress={() => setLanguage('kn')}
            >
              <Text style={[styles.languageText, language === 'kn' && styles.languageTextSelected]}>
                ಕನ್ನಡ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.agreements}>
          <Text style={styles.agreementsTitle}>By signing up, you agree to:</Text>
          <Checkbox
            label="I agree to receive calls & SMS for important updates."
            checked={agreeToCalls}
            onChange={setAgreeToCalls}
          />
          <Checkbox
            label="I agree to receive WhatsApp updates."
            checked={agreeToWhatsApp}
            onChange={setAgreeToWhatsApp}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={isSubmitting}
        >
          <Text style={styles.nextButtonText}>
            {isSubmitting ? 'Saving...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 8,
    marginBottom: 20,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    width: '50%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: COLORS.secondary,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  languageOption: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: COLORS.secondary,
  },
  languageOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  languageText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  languageTextSelected: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  agreements: {
    marginTop: 30,
  },
  agreementsTitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: COLORS.secondary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
  nextButtonText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconText: {
    fontSize: 20,
    color: COLORS.darkGray,
  },
});

export default OnboardingScreen1;