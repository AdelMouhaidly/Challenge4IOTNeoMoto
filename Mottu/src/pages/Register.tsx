import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";

export default function Cadastro({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { colors } = useTheme();

  const cadastrar = async () => {
    if (nome === "" || email === "" || senha === "") {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const usuario = {
      name: nome,
      email: email,
      senha: senha,
    };

    await AsyncStorage.setItem("user", JSON.stringify(usuario));
    Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
    navigation.replace("Login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.primary }]}>
        Crie sua conta
      </Text>

      <Text style={[styles.rotulo, { color: colors.primary }]}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={[
          styles.entrada,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Digite seu nome"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="words"
      />

      <Text style={[styles.rotulo, { color: colors.primary }]}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={[
          styles.entrada,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Digite seu e-mail"
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={[styles.rotulo, { color: colors.primary }]}>Senha</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry={true}
        style={[
          styles.entrada,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Digite sua senha"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.botaoPrincipal, { backgroundColor: colors.success }]}
        onPress={cadastrar}
      >
        <Text style={styles.textoBotaoPrincipal}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.botaoPrincipal,
          styles.botaoSecundario,
          {
            backgroundColor: colors.surface,
            borderColor: colors.success,
          },
        ]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.textoBotaoSecundario, { color: colors.success }]}>
          Voltar para login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  rotulo: {
    fontSize: 18,
    marginBottom: 8,
  },
  entrada: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  botaoPrincipal: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  textoBotaoPrincipal: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
  },
  botaoSecundario: {
    borderWidth: 1,
  },
  textoBotaoSecundario: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
  },
});
