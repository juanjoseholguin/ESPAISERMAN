import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    // Aquí iría la lógica de autenticación
    Alert.alert('Éxito', 'Inicio de sesión exitoso');
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground 
        source={require('../assets/fondo-amarillo.png')} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.content}>
          {/* Logo Espaiserman */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/espaiserman-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Formulario de Login */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={goToRegister}>
              <Text style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: 120,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default LoginScreen;

