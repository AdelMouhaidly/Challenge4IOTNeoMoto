import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackLista } from '../types';

type Props = NativeStackScreenProps<StackLista, 'Perfil'>;

export default function Perfil({ navigation }: Props) {
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [mostrarNovoInputSenha, setMostrarNovoInputSenha] = useState<boolean>(false);
  const [novaSenha, setNovaSenha] = useState<string>('');

  useEffect(() => {
    const carregarUsuario = async () => {
      const dadosUsuario = await AsyncStorage.getItem('user');
      if (dadosUsuario) {
        const usuario = JSON.parse(dadosUsuario);
        setNome(usuario.name || '');
        setEmail(usuario.email || '');
        setSenha(usuario.senha || '');
      }
    };
    carregarUsuario();
  }, []);

  const salvarAlteracoes = async () => {
    const usuarioAtualizado = {
      name: nome,
      email,
      senha: novaSenha.trim() !== '' ? novaSenha : senha,
    };
    await AsyncStorage.setItem('user', JSON.stringify(usuarioAtualizado));
    setSenha(usuarioAtualizado.senha);
    setNovaSenha('');
    setMostrarNovoInputSenha(false);
    Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
  };

  const excluirConta = async () => {
    await AsyncStorage.removeItem('user');
    Alert.alert('Conta excluída', 'Você será desconectado.');
    navigation.replace('Login');
  };

  const voltar = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholder="Digite seu nome"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        placeholder="Digite seu email"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha</Text>

      {!mostrarNovoInputSenha && (
        <View style={styles.senhaContainer}>
          <Text style={styles.senhaCensurada}>{'*'.repeat(senha.length || 8)}</Text>

          <TouchableOpacity
            onPress={() => setMostrarNovoInputSenha(true)}
            style={styles.alterarSenhaButton}
          >
            <Text style={styles.alterarSenhaText}>Alterar Senha</Text>
          </TouchableOpacity>
        </View>
      )}

      {mostrarNovoInputSenha && (
        <TextInput
          value={novaSenha}
          onChangeText={setNovaSenha}
          style={styles.input}
          secureTextEntry
          placeholder="Digite a nova senha"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Salvar Alterações" onPress={salvarAlteracoes} color="#228B22" />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Excluir Conta" onPress={excluirConta} color="#B22222" />
      </View>

      <TouchableOpacity style={styles.botaoVoltar} onPress={voltar}>
        <Text style={styles.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFF0",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 30,
    marginTop: 40,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#228B22',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#228B22',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    shadowColor: '#228B22',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  senhaCensurada: {
    fontSize: 18,
    letterSpacing: 4,
    color: '#333',
  },
  alterarSenhaButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  alterarSenhaText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  botaoVoltar: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#228B22',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  textoBotaoVoltar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
