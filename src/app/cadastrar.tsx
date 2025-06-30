import { View, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Input } from '@/components/Input';
import { Texto } from '@/components/Texto';
import { TextInputMask } from 'react-native-masked-text';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Cadastrar() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [telefone, setTelefone] = useState("");

  const [nomeErro, setNomeErro] = useState("");
  const [emailErro, setEmailErro] = useState("");
  const [senhaErro, setSenhaErro] = useState("");
  const [confirmarSenhaErro, setConfirmarSenhaErro] = useState("");
  const [telefoneErro, setTelefoneErro] = useState("");

  const rota = useRouter();

  useEffect(() => {
    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,}$/;
    setNomeErro(nome && !nomeRegex.test(nome) ? "Nome inválido. Use apenas letras." : "");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailErro(email && !emailRegex.test(email) ? "Email inválido." : "");

    const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    setSenhaErro(senha && !senhaRegex.test(senha) ? "A senha deve conter ao menos 6 caracteres, letras e números." : "");

    setConfirmarSenhaErro(confirmarSenha && senha !== confirmarSenha ? "As senhas não coincidem." : "");

    const telefoneRegex = /^\(\d{2}\)\d{5}-\d{4}$/;
    setTelefoneErro(telefone && !telefoneRegex.test(telefone) ? "Telefone inválido. Use o formato (00)00000-0000." : "");
  }, [nome, email, senha, confirmarSenha, telefone]);

  async function create() {
    if (nomeErro || emailErro || senhaErro || confirmarSenhaErro || telefoneErro) {
      Alert.alert("Erro", "Corrija os campos antes de continuar.");
      return;
    }

    if (!nome || !email || !senha || !confirmarSenha || !telefone) {
      Alert.alert("Erro", "Todos os campos devem ser preenchidos.");
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3000/logins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha, telefone }),
      });

      const data = await response.json();

      if (response.status === 201) {
        await AsyncStorage.setItem('userNome', nome);
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userTelefone', telefone);

        Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");

        setNome("");
        setEmail("");
        setSenha("");
        setConfirmarSenha("");
        setTelefone("");

        rota.push('/'); // voltar para Home
      } else {
        Alert.alert("Erro", data.message || "Erro ao cadastrar cliente.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  }

  return (
    <View style={styles.container}>
      <Texto style={styles.titulo}>Cadastrar Cliente</Texto>

      <Input placeholder="Nome" onChangeText={setNome} value={nome} />
      {nomeErro ? <Text style={styles.erro}>{nomeErro}</Text> : null}

      <Input placeholder="Email" onChangeText={setEmail} value={email} keyboardType="email-address" />
      {emailErro ? <Text style={styles.erro}>{emailErro}</Text> : null}

      <Input placeholder="Senha" onChangeText={setSenha} value={senha} secureTextEntry />
      {senhaErro ? <Text style={styles.erro}>{senhaErro}</Text> : null}

      <Input placeholder="Confirmar Senha" onChangeText={setConfirmarSenha} value={confirmarSenha} secureTextEntry />
      {confirmarSenhaErro ? <Text style={styles.erro}>{confirmarSenhaErro}</Text> : null}

      <TextInputMask
        type={'custom'}
        options={{ mask: '(99)99999-9999' }}
        placeholder="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        style={styles.inputMask}
        keyboardType="phone-pad"
      />
      {telefoneErro ? <Text style={styles.erro}>{telefoneErro}</Text> : null}

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
  container: { flex: 1, padding: 10, justifyContent: 'center', backgroundColor: '#FFF' },
  titulo: { fontSize: 24, textAlign: 'center', marginBottom: 20, fontWeight: 'bold', color: '#333' },
  botao: { backgroundColor: '#764BA2', paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  botaoVoltar: { marginTop: 12, backgroundColor: '#999' },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inputMask: {
    borderWidth: 1, borderColor: '#CCC', borderRadius: 6, padding: 12, marginBottom: 4, fontSize: 16, color: '#333'
  },
  erro: { color: 'red', marginBottom: 6, fontSize: 13 },
});
