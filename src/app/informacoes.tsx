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

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userNome');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userSenha');
    router.push('/'); // Vai para a página inicial após logout
  };

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
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sair Da Conta</Text>
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
    color: '#764BA2',
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
    color: '#764BA2',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#764BA2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#ff0000', // Vermelho para o botão de logout para diferenciar
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
