import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { COLORS } from '../../theme/colors'; // <-- Import your global colors

// --- Data for the language buttons ---
const LANGUAGES = [
  { id: 'hi', name: 'हिंदी' },
  { id: 'ta', name: 'தமிழ்' },
  { id: 'kn', name: 'ಕನ್ನಡ' },
  { id: 'en', name: 'English' },
  { id: 'te', name: 'తెలుగు' },
];

// --- Navigation Type ---
type LanguageScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'LanguageSelection'
>;

// --- Screen Component ---
const LanguageSelectionScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('kn'); // Default to 'kn' as in the image
  const navigation = useNavigation<LanguageScreenNavigationProp>();

  const handleSubmit = () => {
    if (!selectedLanguage) {
      Alert.alert('Selection Required', 'Please select a language to continue.');
      return;
    }
    // Navigate to the next screen in your authentication flow
    navigation.navigate('LoginScreen');
  };

  // --- Render Function for each button in the list ---
  const renderLanguageButton = ({ item }: { item: { id: string; name: string } }) => {
    const isSelected = item.id === selectedLanguage;
    return (
      <TouchableOpacity
        style={[
          styles.languageButton,
          isSelected ? styles.selectedButton : styles.defaultButton,
        ]}
        onPress={() => setSelectedLanguage(item.id)}
      >
        <Text style={[styles.languageText, isSelected && styles.selectedText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Language</Text>
      </View>

      {/* --- Language Grid --- */}
      <FlatList
        data={LANGUAGES}
        renderItem={renderLanguageButton}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        // Disables vertical scroll if you don't want it
        scrollEnabled={false}
      />

      {/* --- Submit Button --- */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Styles ---
// Use Dimensions API to make styles responsive
const { width } = Dimensions.get('window');
const buttonMargin = 10;
const buttonWidth = width / 2 - buttonMargin * 3; // Calculate width for two columns with margins

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary, // Use secondary color for background
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // Margin for status bar
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.black,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: buttonMargin,
    marginTop: 20,
  },
  languageButton: {
    width: buttonWidth,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: buttonMargin,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.lightGray,
  },
  selectedButton: {
    backgroundColor: COLORS.primary, // Use primary color for selected state
    borderColor: COLORS.primary,
  },
  languageText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  selectedText: {
    color: COLORS.secondary, // White text on the primary background
  },
  submitButton: {
    backgroundColor: COLORS.primary, // Use primary color for the main button
    width: '90%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40, // Space from bottom
  },
  submitButtonText: {
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LanguageSelectionScreen;