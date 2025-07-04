import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function Informacoes() {
  const [userNome, setUserNome] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSenha, setUserSenha] = useState('');
  const [userTelefone, setUserTelefone] = useState('');
  const [userFoto, setUserFoto] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const nome = await AsyncStorage.getItem('userNome');
      const email = await AsyncStorage.getItem('userEmail');
      const senha = await AsyncStorage.getItem('userSenha');
      const telefone = await AsyncStorage.getItem('userTelefone');

      if (nome) setUserNome(nome);
      if (email) setUserEmail(email);
      if (senha) setUserSenha('*'.repeat(senha.length));
      if (telefone) setUserTelefone(telefone);

      // Carregar foto específica do usuário
      if (email) {
        const foto = await AsyncStorage.getItem(`userFoto_${email}`);
        if (foto) setUserFoto(foto);
      }
    };

    loadUserData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar fotos é necessária!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setUserFoto(uri);
      if (userEmail) {
        await AsyncStorage.setItem(`userFoto_${userEmail}`, uri);
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userNome');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userSenha');
    await AsyncStorage.removeItem('userTelefone');
    if (userEmail) {
      await AsyncStorage.removeItem(`userFoto_${userEmail}`);
    }
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Gerenciamento de Conta </Text>

      <View style={styles.card}>
        <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
          {userFoto ? (
            <Image source={{ uri: userFoto }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={{ color: '#764BA2' }}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nome</Text>
        <Text style={styles.value}>{userNome}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userEmail}</Text>

        <Text style={styles.label}>Senha</Text>
        <Text style={styles.value}>{userSenha}</Text>

        <Text style={styles.label}>Telefone</Text>
        <Text style={styles.value}>{userTelefone}</Text>
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
  container: { flex: 1, padding: 24, backgroundColor: '#F8F9FA', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#764BA2' },
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
    alignItems: 'center',
  },
  photoContainer: { marginBottom: 20 },
  photo: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: {
    borderWidth: 2,
    borderColor: '#764BA2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: 16, fontWeight: '600', color: '#764BA2', marginTop: 10, alignSelf: 'flex-start' },
  value: { fontSize: 16, color: '#000', marginTop: 4, alignSelf: 'flex-start' },
  button: {
    backgroundColor: '#764BA2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: { backgroundColor: '#ff0000' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
