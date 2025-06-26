import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert, Image } from 'react-native';
import { useState } from 'react';
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
  userEmail: string;  // <---- Adicionado email do usuário
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

  // Carrega dados do usuário e projetos do AsyncStorage
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

  useFocusEffect(() => {
    carregarUsuario();
  });

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

  const closeFilterModal = () => setFilterModalVisible(false);

  const applyFilters = () => {
    let projetosFiltrados = [...projetos];
    switch (filterType) {
      case 'maisRecente':
        projetosFiltrados.sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
        break;
      case 'maiorValor':
        projetosFiltrados.sort((a, b) => (parseFloat(b.valor) || 0) - (parseFloat(a.valor) || 0));
        break;
      case 'menorValor':
        projetosFiltrados.sort((a, b) => (parseFloat(a.valor) || 0) - (parseFloat(b.valor) || 0));
        break;
    }
    setProjetos(projetosFiltrados);
    setFilterModalVisible(false);
  };

  const projetosFiltrados = projetos.filter(projeto =>
    projeto.nome?.toLowerCase().includes(searchText.toLowerCase())
  );

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

          <TouchableOpacity onPress={() => setFilterModalVisible(true)} style={styles.filterButton}>
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
          <Text style={styles.greetingText}>{userNome ? `Olá, ${userNome}!` : 'Olá!'}</Text>
          <Text style={styles.welcomeText}>Seja bem-vindo!</Text>
        </View>

        <TouchableOpacity onPress={() => setCadastroModalVisible(true)} style={styles.cadastrarButton}>
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

                {/* Botão Contato - agora envia email via rota */}
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

      {/* Modal de cadastro */}
      <CadastrarProjeto
        visible={cadastroModalVisible}
        onClose={() => setCadastroModalVisible(false)}
        onCadastroSuccess={handleNovoProjeto}
        userNome={userNome}
        userFoto={userFoto}
      />

      {/* Modal de Filtro */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true} onRequestClose={closeFilterModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Projetos</Text>

            <TouchableOpacity onPress={() => setFilterType('maisRecente')} style={styles.radioOption}>
              <Ionicons name={filterType === 'maisRecente' ? 'radio-button-on' : 'radio-button-off'} size={24} color="#764BA2" />
              <Text style={styles.radioText}>Mais recentes</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFilterType('maiorValor')} style={styles.radioOption}>
              <Ionicons name={filterType === 'maiorValor' ? 'radio-button-on' : 'radio-button-off'} size={24} color="#764BA2" />
              <Text style={styles.radioText}>Maior valor</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setFilterType('menorValor')} style={styles.radioOption}>
              <Ionicons name={filterType === 'menorValor' ? 'radio-button-on' : 'radio-button-off'} size={24} color="#764BA2" />
              <Text style={styles.radioText}>Menor valor</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeFilterModal} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilters} style={[styles.modalButton, styles.applyButton]}>
                <Text style={styles.modalButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Meus Projetos */}
      <Modal visible={userProjectsModalVisible} animationType="slide" transparent={false}>
        <View style={styles.userProjectsContainer}>
          <Text style={styles.userProjectsTitle}>Meus Projetos</Text>
          <ScrollView>
            {projetosDoUsuario.length > 0 ? (
              projetosDoUsuario.map((projeto) => (
                <View key={projeto.id} style={styles.projetoCard}>
                  <Text style={styles.projetoTitle}>{projeto.nome}</Text>
                  <Text style={styles.projetoText}>{projeto.descricao}</Text>
                  <Text style={styles.projetoValue}>Valor: R$ {projeto.valor}</Text>
                  <Text style={styles.projetoDate}>Cadastrado em: {projeto.data}</Text>
                  <TouchableOpacity
                    onPress={() => removerProjeto(projeto.id)}
                    style={styles.removerButton}
                  >
                    <Text style={styles.removerButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noProjetosText}>Você não possui projetos cadastrados.</Text>
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={() => setUserProjectsModalVisible(false)}
            style={styles.fecharModalButton}
          >
            <Text style={styles.fecharModalButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

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
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3EDF7',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  searchIcon: {
    marginRight: 6,
  },

  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#764BA2',
  },

  filterButton: {
    marginLeft: 12,
    padding: 6,
  },

  userIcon: {
    marginLeft: 12,
  },

  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  dropdown: {
    marginTop: 10,
    backgroundColor: '#764BA2',
    padding: 12,
    borderRadius: 8,
  },

  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  dropdownButton: {
    paddingVertical: 8,
  },

  dropdownButtonText: {
    color: '#fff',
    fontSize: 14,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
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
    fontSize: 16,
    color: '#764BA2',
  },

  cadastrarButton: {
    backgroundColor: '#764BA2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },

  cadastrarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  projetosContainer: {
    flex: 1,
  },

  projetoCard: {
    backgroundColor: '#F3EDF7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  userIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },

  projetoUser: {
    fontSize: 14,
    color: '#764BA2',
    fontWeight: 'bold',
  },

  projetoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 6,
  },

  projetoText: {
    fontSize: 14,
    color: '#4B0082',
    marginBottom: 6,
  },

  projetoValue: {
    fontSize: 14,
    color: '#4B0082',
    marginBottom: 6,
  },

  projetoDate: {
    fontSize: 12,
    color: '#7B68EE',
    marginBottom: 8,
  },

  contatoButton: {
    backgroundColor: '#764BA2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },

  contatoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  noProjetosText: {
    fontSize: 16,
    color: '#764BA2',
    textAlign: 'center',
    marginTop: 40,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 20,
    borderRadius: 10,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#764BA2',
    marginBottom: 20,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  radioText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#764BA2',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  cancelButton: {
    backgroundColor: '#D3D3D3',
  },

  applyButton: {
    backgroundColor: '#764BA2',
  },

  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },

  userProjectsContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },

  userProjectsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#764BA2',
    marginBottom: 12,
  },

  removerButton: {
    marginTop: 8,
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },

  removerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  fecharModalButton: {
    marginTop: 20,
    backgroundColor: '#764BA2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  fecharModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
