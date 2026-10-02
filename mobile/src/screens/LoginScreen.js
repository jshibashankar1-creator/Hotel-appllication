import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { mobileApi } from '../services/api';

export default function LoginScreen({ route, navigation }) {
  const returnTo = route.params?.returnTo;
  const bookingState = route.params?.bookingState;
  const { theme, isDark } = useTheme();

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
      if (returnTo) {
        navigation.replace(returnTo, bookingState);
      } else {
        navigation.replace('MainTabs');
      }
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.primaryDark },
    container: { flex: 1, position: 'relative', backgroundColor: theme.background },
    topBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 350, backgroundColor: theme.primaryDark },
    bottomBackground: { position: 'absolute', top: 350, left: 0, right: 0, bottom: 0, backgroundColor: theme.background },
    content: { flex: 1, zIndex: 1, paddingHorizontal: 20, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginBottom: 8 },
    subtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 32 },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 24,
      padding: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.45 : 0.1,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    label: { fontSize: 12, fontWeight: '800', color: theme.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: theme.inputText,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    loginButton: { backgroundColor: theme.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    registerText: { color: theme.textSecondary, fontSize: 14 },
    registerLink: { color: theme.primary, fontSize: 14, fontWeight: '800' },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={theme.primaryDark} />
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
              placeholderTextColor={theme.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.placeholder}
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

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register', { returnTo, bookingState })}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
