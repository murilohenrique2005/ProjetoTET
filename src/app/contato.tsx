import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Texto } from '@/components/Texto';

export default function Contato() {
  const [nome, setNome] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [telefone, setTelefone] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function carregarDados() {
      try {
        const nomeSalvo = await AsyncStorage.getItem('userNome');
        const emailSalvo = await AsyncStorage.getItem('userEmail');
        const telefoneSalvo = await AsyncStorage.getItem('userTelefone');

        setNome(nomeSalvo || "Não informado");
        setEmail(emailSalvo || "Não informado");
        setTelefone(telefoneSalvo || "Não informado");
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
      }
    }

    carregarDados();
  }, []);

  return (
    <View style={styles.container}>
      <Texto style={styles.titulo}>Contato do Cadastrante</Texto>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.valor}>{nome}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.valor}>{email}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Telefone:</Text>
        <Text style={styles.valor}>{telefone}</Text>
      </View>

      <TouchableOpacity style={styles.botao} onPress={() => router.back()}>
        <Text style={styles.textoBotao}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  infoContainer: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
  },
  valor: {
    fontSize: 18,
    color: '#000',
    marginTop: 4,
  },
  botao: {
    backgroundColor: '#764BA2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 40,
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
