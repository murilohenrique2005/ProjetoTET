import { View, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
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
        await AsyncStorage.setItem('userNome', cliente.nome);
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userSenha', senha);

        Alert.alert("Bem-vindo", `Olá, ${cliente.nome}!`);
        rota.push('/home');
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

      <Input
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
      />
      <Input
        placeholder="Senha"
        onChangeText={setSenha}
        value={senha}
        secureTextEntry
      />

      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, { marginTop: 20 }]} onPress={() => rota.push('/cadastrar')}>
        <Text style={styles.textoBotao}>Criar Conta</Text>
      </TouchableOpacity>
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
  botao: {
    backgroundColor: '#764BA2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
