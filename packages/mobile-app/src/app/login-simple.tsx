import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { LoginData, RegistrationData } from 'src/auth/index.js';
import Text from 'src/ui/Text.tsx';
import useViewerContext from 'src/user/useViewerContext.tsx';

export default function Login() {
  const router = useRouter();
  const { authError, isAuthenticated, isLoading, login, register } =
    useViewerContext();

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
      password,
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
      confirmPassword,
      email: email.trim(),
      password,
    };

    const result = await register(registrationData);

    if (result.success) {
      Alert.alert(
        'Registration Successful',
        result.message || 'Please check your email to confirm your account',
        [
          {
            onPress: () => {
              setIsRegistering(false);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            },
            text: 'OK',
          },
        ],
      );
    } else {
      Alert.alert(
        'Registration Failed',
        result.error || 'Unable to create account',
      );
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
          <Text className="text-gray-900 mb-2 text-center text-3xl font-bold">
            <fbt desc="App name">ClientSync</fbt>
          </Text>
          <Text className="text-gray-600 text-center">
            <fbt desc="Login subtitle">
              {isRegistering
                ? 'Create your account'
                : 'Sign in to your account'}
            </fbt>
          </Text>
        </View>

        <View className="mb-6 space-y-4">
          <View>
            <Text className="text-gray-700 mb-1 text-sm font-medium">
              <fbt desc="Email label">Email</fbt>
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              className="border-gray-300 w-full rounded-lg border bg-white p-4"
              editable={!isLoading}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Enter your email"
              value={email}
            />
          </View>

          <View>
            <Text className="text-gray-700 mb-1 text-sm font-medium">
              <fbt desc="Password label">Password</fbt>
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              className="border-gray-300 w-full rounded-lg border bg-white p-4"
              editable={!isLoading}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
            />
          </View>

          {isRegistering && (
            <View>
              <Text className="text-gray-700 mb-1 text-sm font-medium">
                <fbt desc="Confirm password label">Confirm Password</fbt>
              </Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                className="border-gray-300 w-full rounded-lg border bg-white p-4"
                editable={!isLoading}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                value={confirmPassword}
              />
            </View>
          )}
        </View>

        {authError && (
          <View className="bg-red-50 border-red-200 mb-4 rounded-lg border p-3">
            <Text className="text-red-700 text-sm">{authError}</Text>
          </View>
        )}

        <TouchableOpacity
          className={`mb-4 w-full rounded-lg p-4 ${
            isLoading ? 'bg-gray-400' : 'bg-blue-600'
          }`}
          disabled={isLoading}
          onPress={isRegistering ? handleRegister : handleLogin}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center font-semibold text-white">
              <fbt desc="Auth button">
                {isRegistering ? 'Create Account' : 'Sign In'}
              </fbt>
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full p-2"
          disabled={isLoading}
          onPress={toggleMode}
        >
          <Text className="text-blue-600 text-center">
            <fbt desc="Toggle auth mode">
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </fbt>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
