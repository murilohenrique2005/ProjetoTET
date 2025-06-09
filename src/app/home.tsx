import { View, Text, StyleSheet, TouchableOpacity, Button, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userNome, setUserNome] = useState('');
  const [searchText, setSearchText] = useState('');
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
        {/* Barra de pesquisa com ícone de lupa */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#764BA2" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar por Freelancers"
            placeholderTextColor="rgba(118, 75, 162, 0.5)"
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor="#764BA2"
          />
        </View>

        {/* Ícone usuário à direita */}
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.userIcon}>
          <Ionicons name="person-circle-outline" size={32} color="#764BA2" />
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
  <Text style={styles.greetingText}>
    {userNome ? `Olá, ${userNome}!` : 'Olá!'}
  </Text>
  <Text style={styles.welcomeText}>Seja bem-vindo!</Text>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#764BA2', // borda com cor roxa
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 40,
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    paddingVertical: 0,
  },
  userIcon: {
    marginLeft: 12,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#764BA2',
  },
  welcomeText: {
    fontSize: 20,
    marginTop: 4,
    color: '#764BA2',
  },
});
