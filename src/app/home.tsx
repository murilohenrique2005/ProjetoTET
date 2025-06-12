import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
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
  userNome?: string;
  numeroPessoas?: string;
}

export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userNome, setUserNome] = useState('');
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
      const nome = await AsyncStorage.getItem('userNome');
      if (nome) setUserNome(nome);

      const savedProjetos = await AsyncStorage.getItem('projetos');
      if (savedProjetos) setProjetos(JSON.parse(savedProjetos));
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userNome');
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userSenha');
    rota.push('/');
  };

  const openCadastroModal = () => setCadastroModalVisible(true);
  const closeCadastroModal = () => setCadastroModalVisible(false);
  const openFilterModal = () => setFilterModalVisible(true);
  const closeFilterModal = () => setFilterModalVisible(false);

  const handleNovoProjeto = async (novoProjeto: Projeto) => {
    const novosProjetos = [...projetos, novoProjeto];
    setProjetos(novosProjetos);
    await AsyncStorage.setItem('projetos', JSON.stringify(novosProjetos));
  };

  const removerProjeto = async (idProjeto: string) => {
    Alert.alert(
      'Excluir Projeto',
      'Tem certeza que deseja excluir este projeto?',
      [
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
      ],
      { cancelable: true }
    );
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

  const projetosFiltrados = projetos.filter((projeto) =>
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
            <Ionicons name="person-circle-outline" size={32} color="#764BA2" />
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
          <Text style={styles.greetingText}>
            {userNome ? `Olá, ${userNome}!` : 'Olá!'}
          </Text>
          <Text style={styles.welcomeText}>Seja bem-vindo!</Text>
        </View>

        <TouchableOpacity onPress={openCadastroModal} style={styles.cadastrarButton}>
          <Text style={styles.cadastrarButtonText}>Cadastrar Projeto</Text>
        </TouchableOpacity>

        <ScrollView style={styles.projetosContainer}>
          {projetosFiltrados.length > 0 ? (
            projetosFiltrados.map((projeto) => (
              <View key={projeto.id} style={styles.projetoCard}>
                <Text style={styles.projetoTitle}>{projeto.nome}</Text>
                <Text style={styles.projetoText}>{projeto.descricao}</Text>
                <Text style={styles.projetoValue}>Valor: R$ {projeto.valor}</Text>
                {projeto.numeroPessoas && (
                  <Text style={styles.projetoValue}>Pessoas: {projeto.numeroPessoas}</Text>
                )}
                <Text style={styles.projetoDate}>Cadastrado em: {projeto.data}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noProjetosText}>Nenhum projeto encontrado</Text>
          )}
        </ScrollView>
      </View>

      {/* MODAL: Cadastro */}
      <CadastrarProjeto
        visible={cadastroModalVisible}
        onClose={closeCadastroModal}
        onCadastroSuccess={handleNovoProjeto}
        userNome={userNome}
      />

      {/* MODAL: Filtro */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFilterModal}
      >
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

      {/* MODAL: Meus Projetos */}
      <Modal
        visible={userProjectsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setUserProjectsModalVisible(false)}
      >
        <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#764BA2', marginBottom: 20 }}>
            Meus Projetos
          </Text>

          <ScrollView>
            {projetosDoUsuario.length > 0 ? (
              projetosDoUsuario.map(projeto => (
                <View key={projeto.id} style={styles.projetoCard}>
                  <Text style={styles.projetoTitle}>{projeto.nome}</Text>
                  <Text style={styles.projetoText}>{projeto.descricao}</Text>
                  <Text style={styles.projetoValue}>Valor: R$ {projeto.valor}</Text>
                  {projeto.numeroPessoas && (
                    <Text style={styles.projetoValue}>Pessoas: {projeto.numeroPessoas}</Text>
                  )}
                  <Text style={styles.projetoDate}>Cadastrado em: {projeto.data}</Text>

                  <TouchableOpacity
                    onPress={() => removerProjeto(projeto.id)}
                    style={{
                      marginTop: 10,
                      backgroundColor: '#ff4d4d',
                      paddingVertical: 8,
                      borderRadius: 6,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Excluir Projeto</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noProjetosText}>Você não cadastrou nenhum projeto.</Text>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={() => setUserProjectsModalVisible(false)}
            style={[styles.cadastrarButton, { marginTop: 20 }]}
          >
            <Text style={styles.cadastrarButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// Os styles continuam os mesmos — você pode manter os que já tinha.



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 15, paddingTop: 35, backgroundColor: '#F6F6F6' },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: { marginRight: 5 },
  searchInput: { flex: 1, fontSize: 14, color: '#764BA2' },
  filterButton: { marginLeft: 10 },
  userIcon: { marginLeft: 10 },

  dropdown: {
    position: 'absolute',
    top: 65,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
    width: 180,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#764BA2',
    marginBottom: 10,
  },
  dropdownButton: {
    paddingVertical: 8,
  },
  dropdownButtonText: {
    color: '#764BA2',
    fontWeight: '600',
    fontSize: 16,
  },

  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  greetingContainer: {
    marginBottom: 15,
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
    marginBottom: 15,
    alignItems: 'center',
  },
  cadastrarButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  projetosContainer: {
    flex: 1,
  },
  projetoCard: {
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  projetoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#764BA2',
  },
  projetoText: {
    fontSize: 14,
    marginVertical: 6,
    color: '#764BA2',
  },
  projetoValue: {
    fontSize: 14,
    color: '#764BA2',
  },
  projetoDate: {
    fontSize: 12,
    color: '#764BA2',
    marginTop: 4,
  },
  noProjetosText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#764BA2',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: '#764BA2',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterOption: {
    paddingVertical: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#764BA2',
  },
  selectedOption: {
    backgroundColor: '#764BA2',
    borderRadius: 5,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25,
  },
  modalButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginLeft: 10,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  applyButton: {
    backgroundColor: '#764BA2',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#764BA2',
  },
});
