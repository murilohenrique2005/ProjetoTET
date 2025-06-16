import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';

export default function Proposta() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [proposta, setProposta] = useState('');
  const [valor, setValor] = useState('');

  const enviarProposta = () => {
    if (!nome || !telefone || !proposta || !valor) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    Alert.alert(
      'Proposta enviada',
      `Nome: ${nome}\nTelefone: ${telefone}\nProposta: ${proposta}\nValor: R$ ${valor}`
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tela de Proposta</Text>

      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Telefone:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o telefone"
        keyboardType="phone-pad"
        value={telefone}
        onChangeText={setTelefone}
      />

      <Text style={styles.label}>Proposta de Valor:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a proposta"
        value={proposta}
        onChangeText={setProposta}
      />

     

      <Button title="Enviar Proposta" onPress={enviarProposta} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
});
