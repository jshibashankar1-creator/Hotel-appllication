import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, Alert } from 'react-native';
import { COLORS } from '../theme/colors';
import { mobileApi } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    try {
      setLoading(true);
      await mobileApi.login(email, password);
      // Navigate to Home upon success
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#160824" />
      <View style={styles.container}>
        <View style={styles.topBackground} />
        <View style={styles.bottomBackground} />
        
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to HotelHub</Text>
          <Text style={styles.subtitle}>Sign in to access VIP luxury stays.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#160824',
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  topBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 350,
    backgroundColor: '#160824',
  },
  bottomBackground: {
    position: 'absolute',
    top: 350, left: 0, right: 0, bottom: 0,
    backgroundColor: '#F5F6F8',
  },
  content: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#666666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#160824',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#7D143D', // Burgundy
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  }
});
