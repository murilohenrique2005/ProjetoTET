import React, { useState, useRef } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  valor: string;
  data: string;
  userNome?: string;
  numeroPessoas?: string;
  telefone?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCadastroSuccess: (projeto: Projeto) => void;
  userNome: string;
  // userEmail removido daqui
}

export default function CadastrarProjeto({ visible, onClose, onCadastroSuccess, userNome }: Props) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState('');
  const [telefone, setTelefone] = useState('');

  const telefoneRef = useRef<any>(null);

  const limparCampos = () => {
    setNome('');
    setDescricao('');
    setValor('');
    setNumeroPessoas('');
    setTelefone('');
  };

  const salvarProjeto = async () => {
    if (!nome.trim() || !descricao.trim() || !valor.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const valorNumerico = parseFloat(valor.replace(/\./g, '').replace(',', '.'));

    if (isNaN(valorNumerico)) {
      Alert.alert('Erro', 'Valor inválido.');
      return;
    }

    if (!telefone.trim()) {
      Alert.alert('Erro', 'Por favor, informe o telefone.');
      return;
    }

    if (telefoneRef.current && !telefoneRef.current.isValid()) {
      Alert.alert('Erro', 'Telefone inválido. Use o formato (00)00000-0000.');
      return;
    }

    const projeto: Projeto = {
      id: Date.now().toString(),
      nome,
      descricao,
      valor,
      data: new Date().toLocaleDateString('pt-BR'),
      userNome,
      numeroPessoas,
      telefone,
    };

    try {
      const response = await fetch('http://10.133.47.48:3000/cadastrar-projeto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: projeto.nome,
          descricao: projeto.descricao,
          valor: projeto.valor,
          telefone: projeto.telefone,
          // userEmail removido daqui
          numeroPessoas: projeto.numeroPessoas,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cadastrar projeto.');
      }

      Alert.alert('Sucesso', data.message || 'Projeto cadastrado com sucesso!');
      onCadastroSuccess(projeto);
      limparCampos();
      onClose();
    } catch (error: any) {
      console.error('Erro ao cadastrar projeto:', error);
      Alert.alert('Erro', error.message || 'Erro ao cadastrar projeto.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
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

          <TextInputMask
            type={'cel-phone'}
            options={{
              maskType: 'BRL',
              withDDD: true,
              dddMask: '(99) ',
            }}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="(00)00000-0000"
            style={styles.input}
            placeholderTextColor="#aaa"
            ref={telefoneRef}
          />

          <TextInput
            placeholder="Número de Pessoas (opcional)"
            value={numeroPessoas}
            onChangeText={setNumeroPessoas}
            keyboardType="numeric"
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
