// home.tsx
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CadastrarProjeto from './cadastrarprojeto';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  valor: string;
  data: string;
  userNome: string;
  userFoto: string | null;
  userEmail: string;
  numeroPessoas?: string;
  telefone: string;
}

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userNome, setUserNome] = useState('');
  const [userFoto, setUserFoto] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [cadastroModalVisible, setCadastroModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState('maisRecente');
  const [userProjectsModalVisible, setUserProjectsModalVisible] = useState(false);
  const [projetosDoUsuario, setProjetosDoUsuario] = useState<Projeto[]>([]);

  const rota = useRouter();

  const carregarUsuario = async () => {
    try {
      const nome = await AsyncStorage.getItem('userNome');
      const foto = await AsyncStorage.getItem('userFoto');
      const savedProjetos = await AsyncStorage.getItem('projetos');

      if (nome) setUserNome(nome);
      if (foto) setUserFoto(foto);
      if (savedProjetos) setProjetos(JSON.parse(savedProjetos));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarUsuario();
    }, [])
  );

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      'userNome',
      'userEmail',
      'userSenha',
      'userTelefone',
      'userFoto',
    ]);
    rota.push('/');
  };

  const handleNovoProjeto = async (novoProjeto: Omit<Projeto, 'userNome' | 'userFoto' | 'userEmail'>) => {
    const userEmail = await AsyncStorage.getItem('userEmail') || 'Não informado';

    const projetoCompleto: Projeto = {
      ...novoProjeto,
      userNome: userNome || 'Anônimo',
      userFoto: userFoto,
      userEmail: userEmail,
    };

    const novosProjetos = [...projetos, projetoCompleto];
    setProjetos(novosProjetos);
    await AsyncStorage.setItem('projetos', JSON.stringify(novosProjetos));
  };

  const removerProjeto = async (idProjeto: string) => {
    Alert.alert('Excluir Projeto', 'Tem certeza que deseja excluir este projeto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          const novosProjetos = projetos.filter(p => p.id !== idProjeto);
          setProjetos(novosProjetos);
          setProjetosDoUsuario(novosProjetos.filter(p => p.userNome === userNome));
          await AsyncStorage.setItem('projetos', JSON.stringify(novosProjetos));
        },
      },
    ]);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
  };

  const projetosFiltrados = [...projetos]
    .filter(projeto =>
      projeto.nome?.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      switch (filterType) {
        case 'maisRecente':
          return (parseInt(b.id) || 0) - (parseInt(a.id) || 0);
        case 'maiorValor':
          return (parseFloat(b.valor) || 0) - (parseFloat(a.valor) || 0);
        case 'menorValor':
          return (parseFloat(a.valor) || 0) - (parseFloat(b.valor) || 0);
        default:
          return 0;
      }
    });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#764BA2" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar"
              placeholderTextColor="rgba(118, 75, 162, 0.5)"
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity 
            onPress={() => setFilterModalVisible(true)} 
            style={styles.filterButton}
          >
            <Ionicons name="filter-outline" size={24} color="#764BA2" style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setMenuVisible(!menuVisible)} 
            style={styles.userIcon}
          >
            {userFoto ? (
              <Image source={{ uri: userFoto }} style={styles.userPhoto} />
            ) : (
              <Ionicons name="person-circle-outline" size={32} color="#764BA2" style={styles.icon} />
            )}
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <View style={styles.dropdown}>
            <Text style={styles.userName}>{userNome}</Text>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setProjetosDoUsuario(projetos.filter(p => p.userNome === userNome));
                setUserProjectsModalVisible(true);
              }}
              style={styles.dropdownButton}
            >
              <Text style={styles.dropdownButtonText}>Meus Projetos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                rota.push('/informacoes');
              }}
              style={styles.dropdownButton}
            >
              <Text style={styles.dropdownButtonText}>Gerenciar Conta</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            {userNome ? `Olá, ${userNome}!` : 'Olá!'}
          </Text>
          <Text style={styles.welcomeText}>Seja bem-vindo!</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setCadastroModalVisible(true)} 
          style={styles.cadastrarButton}
        >
          <Text style={styles.cadastrarButtonText}>Cadastrar Projeto</Text>
        </TouchableOpacity>

        <ScrollView style={styles.projetosContainer} keyboardShouldPersistTaps="handled">
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map((projeto) => (
              <View key={projeto.id} style={styles.projetoCard}>
                <View style={styles.cardHeader}>
                  {projeto.userFoto ? (
                    <Image source={{ uri: projeto.userFoto }} style={styles.userIconSmall} />
                  ) : (
                    <Ionicons name="person-circle-outline" size={32} color="#764BA2" />
                  )}
                  <Text style={styles.projetoUser}>{projeto.userNome}</Text>
                </View>
                <Text style={styles.projetoTitle}>{projeto.nome}</Text>
                <Text style={styles.projetoText}>{projeto.descricao}</Text>
                <Text style={styles.projetoValue}>Valor: R$ {projeto.valor}</Text>
                {projeto.numeroPessoas && <Text style={styles.projetoValue}>Pessoas: {projeto.numeroPessoas}</Text>}
                <Text style={styles.projetoDate}>Cadastrado em: {projeto.data}</Text>

                <TouchableOpacity
                  style={styles.contatoButton}
                  onPress={() => rota.push({
                    pathname: '/contato',
                    params: { email: projeto.userEmail, nome: projeto.userNome, telefone: projeto.telefone }
                  })}
                >
                  <Text style={styles.contatoButtonText}>Contato</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noProjetosText}>Nenhum projeto encontrado</Text>
          )}
        </ScrollView>
      </View>

      {/* Modais */}
      <CadastrarProjeto
        visible={cadastroModalVisible}
        onClose={() => setCadastroModalVisible(false)}
        onCadastroSuccess={handleNovoProjeto}
        userNome={userNome}
        userFoto={userFoto}
      />

      {/* Modal de Filtro */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Projetos</Text>

            {['maisRecente', 'maiorValor', 'menorValor'].map(type => (
              <TouchableOpacity key={type} onPress={() => setFilterType(type)} style={styles.radioOption}>
                <Ionicons 
                  name={filterType === type ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color="#764BA2" 
                />
                <Text style={styles.radioText}>
                  {type === 'maisRecente' ? 'Mais recentes' : type === 'maiorValor' ? 'Maior valor' : 'Menor valor'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Meus Projetos */}
      <Modal visible={userProjectsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>Meus Projetos</Text>
            <ScrollView style={{ flex: 1 }}>
              {projetosDoUsuario.length > 0 ? (
                projetosDoUsuario.map(projeto => (
                  <View key={projeto.id} style={styles.projetoCard}>
                    <Text style={styles.projetoTitle}>{projeto.nome}</Text>
                    <Text style={styles.projetoText}>{projeto.descricao}</Text>
                    <Text style={styles.projetoValue}>Valor: R$ {projeto.valor}</Text>
                    <Text style={styles.projetoDate}>Cadastrado em: {projeto.data}</Text>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removerProjeto(projeto.id)}
                    >
                      <Text style={styles.deleteButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noProjetosText}>Você não possui projetos cadastrados.</Text>
              )}
            </ScrollView>

            <TouchableOpacity 
              onPress={() => setUserProjectsModalVisible(false)} 
              style={styles.closeModalButton}
            >
              <Text style={styles.closeModalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#764BA2',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E6FF',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#764BA2',
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  userIcon: {
    padding: 4,
  },
  icon: {
    width: 24,
    height: 24,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dropdown: {
    backgroundColor: '#F1E6FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#764BA2',
  },
  dropdownButton: {
    paddingVertical: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#764BA2',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  greetingContainer: {
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#764BA2',
  },
  welcomeText: {
    fontSize: 14,
    color: '#764BA2',
  },
  cadastrarButton: {
    backgroundColor: '#764BA2',
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  cadastrarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  projetosContainer: {
    flex: 1,
  },
  projetoCard: {
    backgroundColor: '#F1E6FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  projetoUser: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#764BA2',
  },
  projetoTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#764BA2',
    marginBottom: 4,
  },
  projetoText: {
    color: '#764BA2',
    marginBottom: 4,
  },
  projetoValue: {
    fontWeight: 'bold',
    color: '#764BA2',
  },
  projetoDate: {
    fontSize: 12,
    color: '#764BA2',
    marginBottom: 8,
  },
  contatoButton: {
    backgroundColor: '#764BA2',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  contatoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noProjetosText: {
    textAlign: 'center',
    color: '#764BA2',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalContentLarge: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    height: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#764BA2',
    marginBottom: 16,
    textAlign: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#764BA2',
  },
  applyButton: {
    backgroundColor: '#764BA2',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff5555',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeModalButton: {
    backgroundColor: '#764BA2',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});