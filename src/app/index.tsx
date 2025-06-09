import { View, Alert, Button, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useClienteDataBase } from '@/database/useClienteDataBase';
import { Input } from '@/components/Input';
import { Texto } from '@/components/Texto';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const clienteDataBase = useClienteDataBase();
  const rota = useRouter();

  useEffect(() => {
    clienteDataBase.criarTabela().catch((e) => {
      console.error("Erro ao criar tabela:", e);
    });
  }, []);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha email e senha.");
      return;
    }

    try {
      const cliente = await clienteDataBase.findByEmailAndSenha(email, senha);

      if (cliente) {
        // Salva nome, email e senha no AsyncStorage
        await AsyncStorage.setItem('userNome', cliente.nome);
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userSenha', senha);

        Alert.alert("Bem-vindo", `Olá, ${cliente.nome}!`);
        rota.push('/home'); // Redireciona para Home após login
      } else {
        Alert.alert("Erro", "Email ou senha inválidos.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Erro ao realizar login.");
    }
  }

  return (
    <View style={styles.container}>
      <Texto style={styles.titulo}>Login</Texto>

      <Input placeholder="Email" onChangeText={setEmail} value={email} keyboardType="email-address" />
      <Input placeholder="Senha" onChangeText={setSenha} value={senha} secureTextEntry />

      <Button title="Entrar" onPress={handleLogin} />

      <View style={{ marginTop: 20 }}>
        <Button title="Criar Conta" onPress={() => rota.push('/cadastrar')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
});
