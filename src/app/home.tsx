// IMPORTS
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  numeroPessoas?: string;
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const nome = await AsyncStorage.getItem('userNome');
        const foto = await AsyncStorage.getItem('userFoto');
        const savedProjetos = await AsyncStorage.getItem('projetos');

        if (nome) setUserNome(nome);
        if (foto) setUserFoto(foto);
        if (savedProjetos) setProjetos(JSON.parse(savedProjetos));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userNome');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userSenha');
    await AsyncStorage.removeItem('userFoto');
    rota.push('/');
  };

  const openCadastroModal = () => setCadastroModalVisible(true);
  const closeCadastroModal = () => setCadastroModalVisible(false);
  const openFilterModal = () => setFilterModalVisible(true);
  const closeFilterModal = () => setFilterModalVisible(false);

  const handleNovoProjeto = async (novoProjeto: Omit<Projeto, 'userNome' | 'userFoto'>) => {
    try {
      const projetoCompleto: Projeto = {
        ...novoProjeto,
        userNome: userNome || 'Anônimo',
        userFoto: userFoto
      };

      const novosProjetos = [...projetos, projetoCompleto];
      setProjetos(novosProjetos);
      await AsyncStorage.setItem('projetos', JSON.stringify(novosProjetos));
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o projeto');
    }
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
    let projetosFiltrados = [...projetos];
    switch (filterType) {
      case 'maisRecente':
        projetosFiltrados.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case 'maiorValor':
        projetosFiltrados.sort((a, b) => parseFloat(b.valor) - parseFloat(a.valor));
        break;
      case 'menorValor':
        projetosFiltrados.sort((a, b) => parseFloat(a.valor) - parseFloat(b.valor));
        break;
    }
    setProjetos(projetosFiltrados);
    closeFilterModal();
  };

  const projetosFiltrados = projetos.filter(projeto =>
    projeto.nome?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#764BA2" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar por Projetos"
              placeholderTextColor="rgba(118, 75, 162, 0.5)"
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
              autoCapitalize="none"
              selectionColor="#764BA2"
            />
          </View>

          <TouchableOpacity onPress={openFilterModal} style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="#764BA2" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.userIcon}>
            {userFoto ? (
              <Image source={{ uri: userFoto }} style={styles.userPhoto} />
            ) : (
              <Ionicons name="person-circle-outline" size={32} color="#764BA2" />
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

            <TouchableOpacity onPress={() => {
              setMenuVisible(false);
              rota.push('/informacoes');
            }} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>GERENCIAR SUA CONTA</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{userNome ? `Olá, ${userNome}!` : 'Olá!'}</Text>
          <Text style={styles.welcomeText}>Seja bem-vindo!</Text>
        </View>

        <TouchableOpacity onPress={openCadastroModal} style={styles.cadastrarButton}>
          <Text style={styles.cadastrarButtonText}>Cadastrar Projeto</Text>
        </TouchableOpacity>

        <ScrollView style={styles.projetosContainer}>
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map((projeto) => (
              <View key={projeto.id} style={styles.projetoCard}>
                <View style={styles.cardHeader}>
                  {projeto.userFoto ? (
                    <Image 
                      source={{ uri: projeto.userFoto }} 
                      style={styles.userIconSmall} 
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person-circle-outline" size={32} color="#764BA2" />
                  )}
                  <Text style={styles.projetoUser}>{projeto.userNome}</Text>
                </View>
                
                <Text style={styles.projetoTitle}>{projeto.nome}</Text>
                <Text style={styles.projetoText}>{projeto.descricao}</Text>
                <Text style={styles.projetoValue}>Valor: R$ {projeto.valor}</Text>
                {projeto.numeroPessoas && (
                  <Text style={styles.projetoValue}>Pessoas: {projeto.numeroPessoas}</Text>
                )}
                <Text style={styles.projetoDate}>Cadastrado em: {projeto.data}</Text>

                <TouchableOpacity
                  onPress={() => rota.push({ pathname: '/contato', params: { id: projeto.id } })}
                  style={styles.propostaButton}
                >
                  <Text style={styles.propostaButtonText}>Contato</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noProjetosText}>Nenhum projeto encontrado</Text>
          )}
        </ScrollView>
      </View>

      {/* MODAIS */}
      <CadastrarProjeto
        visible={cadastroModalVisible}
        onClose={closeCadastroModal}
        onCadastroSuccess={handleNovoProjeto}
        userNome={userNome}
        userFoto={userFoto}
      />

      {/* Modal de Filtro */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true} onRequestClose={closeFilterModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por</Text>
            {['maisRecente', 'maiorValor', 'menorValor'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.filterOption, filterType === type && styles.selectedOption]}
                onPress={() => setFilterType(type)}
              >
                <Text style={[styles.filterOptionText, filterType === type && styles.selectedOptionText]}>
                  {type === 'maisRecente' ? 'Mais Recente' : type === 'maiorValor' ? 'Maior Valor' : 'Menor Valor'}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeFilterModal} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} style={[styles.modalButton, styles.applyButton]}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Meus Projetos */}
      <Modal visible={userProjectsModalVisible} animationType="slide" transparent={false} onRequestClose={() => setUserProjectsModalVisible(false)}>
        <View style={styles.userProjectsContainer}>
          <Text style={styles.userProjectsTitle}>Meus Projetos</Text>
          <ScrollView>
            {projetosDoUsuario.length > 0 ? (
              projetosDoUsuario.map(projeto => (
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
                  {projeto.numeroPessoas && (
                    <Text style={styles.projetoValue}>Pessoas: {projeto.numeroPessoas}</Text>
                  )}
                  <Text style={styles.projetoDate}>Cadastrado em: {projeto.data}</Text>

                  <TouchableOpacity
                    onPress={() => removerProjeto(projeto.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Excluir Projeto</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noProjectsText}>Você não possui projetos cadastrados.</Text>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setUserProjectsModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: '#e6e6e6',
    borderRadius: 30,
    paddingLeft: 40,
    height: 40,
    color: '#764BA2',
  },
  filterButton: {
    marginLeft: 10,
  },
  userIcon: {
    marginLeft: 10,
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 1000,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#764BA2',
  },
  dropdownButton: {
    paddingVertical: 10,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#764BA2',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#764BA2',
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
  },
  cadastrarButton: {
    backgroundColor: '#764BA2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  cadastrarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  projetosContainer: {
    flex: 1,
  },
  projetoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#764BA2',
  },
  projetoUser: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  projetoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#764BA2',
  },
  projetoText: {
    marginTop: 8,
    fontSize: 16,
    color: '#444',
  },
  projetoValue: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  projetoDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  propostaButton: {
    marginTop: 10,
    backgroundColor: '#764BA2',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  propostaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noProjetosText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#764BA2',
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: 10,
  },
  filterOptionText: {
    fontSize: 18,
    color: '#764BA2',
    textAlign: 'center',
  },
  selectedOption: {
    backgroundColor: '#764BA2',
    borderRadius: 8,
  },
  selectedOptionText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#764BA2',
    alignItems: 'center',
  },
  cancelButton: {},
  applyButton: {
    backgroundColor: '#764BA2',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#764BA2',
    textAlign: 'center',
  },
  userProjectsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  userProjectsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#764BA2',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noProjectsText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#764BA2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});