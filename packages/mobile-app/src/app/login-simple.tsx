import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Text from 'src/ui/Text.tsx';
import useViewerContext from 'src/user/useViewerContext.tsx';
import type { LoginData, RegistrationData } from 'src/auth/index.js';

export default function Login() {
  const router = useRouter();
  const { login, register, isLoading, authError, isAuthenticated } = useViewerContext();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.replace('/');
    return null;
  }

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const loginData: LoginData = {
      email: email.trim(),
      password: password
    };

    const result = await login(loginData);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Unable to sign in');
    }
  }, [email, password, login]);

  const handleRegister = useCallback(async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const registrationData: RegistrationData = {
      email: email.trim(),
      password: password,
      confirmPassword: confirmPassword
    };

    const result = await register(registrationData);
    
    if (result.success) {
      Alert.alert(
        'Registration Successful', 
        result.message || 'Please check your email to confirm your account',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsRegistering(false);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }
          }
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'Unable to create account');
    }
  }, [email, password, confirmPassword, register]);

  const toggleMode = useCallback(() => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [isRegistering]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-center text-3xl font-bold text-gray-900 mb-2">
            <fbt desc="App name">ClientSync</fbt>
          </Text>
          <Text className="text-center text-gray-600">
            <fbt desc="Login subtitle">
              {isRegistering ? 'Create your account' : 'Sign in to your account'}
            </fbt>
          </Text>
        </View>

        <View className="space-y-4 mb-6">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              <fbt desc="Email label">Email</fbt>
            </Text>
            <TextInput
              className="w-full p-4 border border-gray-300 rounded-lg bg-white"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              <fbt desc="Password label">Password</fbt>
            </Text>
            <TextInput
              className="w-full p-4 border border-gray-300 rounded-lg bg-white"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {isRegistering && (
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                <fbt desc="Confirm password label">Confirm Password</fbt>
              </Text>
              <TextInput
                className="w-full p-4 border border-gray-300 rounded-lg bg-white"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          )}
        </View>

        {authError && (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-700 text-sm">{authError}</Text>
          </View>
        )}

        <TouchableOpacity
          className={`w-full p-4 rounded-lg mb-4 ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600'
          }`}
          onPress={isRegistering ? handleRegister : handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white font-semibold">
              <fbt desc="Auth button">
                {isRegistering ? 'Create Account' : 'Sign In'}
              </fbt>
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full p-2"
          onPress={toggleMode}
          disabled={isLoading}
        >
          <Text className="text-center text-blue-600">
            <fbt desc="Toggle auth mode">
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </fbt>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
