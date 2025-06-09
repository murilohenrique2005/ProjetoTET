import { View, Alert, Button, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useClienteDataBase } from '@/database/useClienteDataBase';
import { useRouter } from 'expo-router';
import { Input } from '@/components/Input';
import { Texto } from '@/components/Texto';

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const clienteDataBase = useClienteDataBase();
  const rota = useRouter();

  async function create() {
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Erro", "Email inválido.");
      return;
    }

    const clienteExistente = await clienteDataBase.getByEmail(email);
    if (clienteExistente) {
      Alert.alert("Erro", "Este email já está cadastrado no sistema.");
      return;
    }

    try {
      const response = await clienteDataBase.create({ nome, email, senha });

      Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      rota.push("/");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      Alert.alert("Erro", "Não foi possível cadastrar o cliente.");
    }
  }

  return (
    <View style={styles.container}>
      <Texto style={styles.titulo}>Cadastrar Cliente</Texto>

      <Input placeholder="Nome" onChangeText={setNome} value={nome} />
      <Input placeholder="Email" onChangeText={setEmail} value={email} keyboardType="email-address" />
      <Input placeholder="Senha" onChangeText={setSenha} value={senha} secureTextEntry />

      <Button title="Cadastrar" onPress={create} />
      <Button title="Voltar" onPress={() => rota.back()} />
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
