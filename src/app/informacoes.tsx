import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Informacoes() {
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const nome = await AsyncStorage.getItem('userNome');
      const email = await AsyncStorage.getItem('userEmail');
      const senha = await AsyncStorage.getItem('userSenha');
      if (nome) setUserNome(nome);
      if (email) setUserEmail(email);
      if (senha) setUserSenha('*'.repeat(senha.length));
    };
    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Sua Conta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{userNome}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userEmail}</Text>

        <Text style={styles.label}>Senha</Text>
        <Text style={styles.value}>{userSenha}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>← Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
