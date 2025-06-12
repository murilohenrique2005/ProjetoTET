import { View, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { useClienteDataBase } from '@/database/useClienteDataBase';
import { useRouter } from 'expo-router';
import { Input } from '@/components/Input';
import { Texto } from '@/components/Texto';

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const clienteDataBase = useClienteDataBase();
  const rota = useRouter();

  async function create() {
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
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
      await clienteDataBase.create({ nome, email, senha });
      Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
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
      <Input placeholder="Confirmar Senha" onChangeText={setConfirmarSenha} value={confirmarSenha} secureTextEntry />

      <TouchableOpacity style={styles.botao} onPress={create}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.botao, styles.botaoVoltar]} onPress={() => rota.back()}>
        <Text style={styles.textoBotao}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  titulo: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  botao: {
    backgroundColor: '#764BA2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoVoltar: {
    marginTop: 12,
    backgroundColor: '#999',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
