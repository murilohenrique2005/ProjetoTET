import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  valor: string;
  data: string;
  userNome?: string;
  numeroPessoas?: string;
  telefone?: string; // <-- Novo campo adicionado
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCadastroSuccess: (projeto: Projeto) => void;
  userNome: string;
}

export default function CadastrarProjeto({ visible, onClose, onCadastroSuccess, userNome }: Props) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState('');
  const [telefone, setTelefone] = useState(''); // <-- Novo estado para telefone

  const limparCampos = () => {
    setNome('');
    setDescricao('');
    setValor('');
    setNumeroPessoas('');
    setTelefone('');
  };

  const salvarProjeto = () => {
    if (!nome.trim() || !descricao.trim() || !valor.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novoProjeto: Projeto = {
      id: Date.now().toString(),
      nome,
      descricao,
      valor,
      data: new Date().toLocaleDateString('pt-BR'),
      userNome,
      numeroPessoas,
      telefone, // <-- Incluído no objeto
    };

    onCadastroSuccess(novoProjeto);
    limparCampos();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Cadastrar Projeto</Text>

          <TextInput
            placeholder="Nome do Projeto"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder="Descrição"
            value={descricao}
            onChangeText={setDescricao}
            style={[styles.input, { height: 80 }]}
            multiline
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder="Valor (R$)"
            value={valor}
            onChangeText={setValor}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder="Número de Pessoas (opcional)"
            value={numeroPessoas}
            onChangeText={setNumeroPessoas}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder="Telefone para Contato"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#aaa"
          />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={salvarProjeto} style={[styles.button, styles.saveButton]}>
              <Text style={[styles.buttonText, { color: '#fff' }]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#764BA2',
    marginBottom: 15,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#764BA2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
    color: '#764BA2',
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  cancelButton: {
    backgroundColor: '#ddd',
  },

  saveButton: {
    backgroundColor: '#764BA2',
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#764BA2',
  },
});
