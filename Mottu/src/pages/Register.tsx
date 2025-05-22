import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Cadastro({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const cadastrar = async () => {
    if (nome === '' || email === '' || senha === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const usuario = {
      name: nome,
      email: email,
      senha: senha,
    };

    await AsyncStorage.setItem('user', JSON.stringify(usuario));
    Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua conta</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholder="Digite seu nome"
        placeholderTextColor="#9BBF9B"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#9BBF9B"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={true}
        style={styles.input}
        placeholder="Digite sua senha"
        placeholderTextColor="#9BBF9B"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={cadastrar}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryButtonText}>Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FDF4',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    color: '#228B22',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#A0D6A0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#28A745',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: '#DFF6DD',
    borderWidth: 1,
    borderColor: '#28A745',
  },
  secondaryButtonText: {
    color: '#28A745',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
});
