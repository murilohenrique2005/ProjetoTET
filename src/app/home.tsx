import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userNome, setUserNome] = useState('');
  const rota = useRouter();

  useEffect(() => {
    const loadNome = async () => {
      const nome = await AsyncStorage.getItem('userNome');
      if (nome) setUserNome(nome);
    };
    loadNome();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userNome');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userSenha');
    rota.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Ionicons name="person-circle-outline" size={32} color="black" />
        </TouchableOpacity>

        {menuVisible && (
          <View style={styles.dropdown}>
            <Text style={styles.userName}>{userNome}</Text>

            <Button
              title="GERENCIAR SUA CONTA TET"
              onPress={() => {
                setMenuVisible(false);
                rota.push('/informacoes');
              }}
            />

            <Button title="Sair" onPress={handleLogout} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Bem-vindo à página inicial!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    padding: 16,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 5,
    zIndex: 1,
  },
  userName: {
    fontSize: 16,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
