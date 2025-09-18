import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackLista } from "../types";
import { useTheme } from "../contexts/ThemeContext";

type Props = NativeStackScreenProps<StackLista, "Perfil">;

export default function Perfil({ navigation }: Props) {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [mostrarNovoInputSenha, setMostrarNovoInputSenha] =
    useState<boolean>(false);
  const [novaSenha, setNovaSenha] = useState<string>("");
  const { colors } = useTheme();

  useEffect(() => {
    const carregarUsuario = async () => {
      const dadosUsuario = await AsyncStorage.getItem("user");
      if (dadosUsuario) {
        const usuario = JSON.parse(dadosUsuario);
        setNome(usuario.name || "");
        setEmail(usuario.email || "");
        setSenha(usuario.senha || "");
      }
    };
    carregarUsuario();
  }, []);

  const salvarAlteracoes = async () => {
    const usuarioAtualizado = {
      name: nome,
      email,
      senha: novaSenha.trim() !== "" ? novaSenha : senha,
    };
    await AsyncStorage.setItem("user", JSON.stringify(usuarioAtualizado));
    setSenha(usuarioAtualizado.senha);
    setNovaSenha("");
    setMostrarNovoInputSenha(false);
    Alert.alert("Sucesso", "Dados atualizados com sucesso!");
  };

  const excluirConta = async () => {
    await AsyncStorage.removeItem("user");
    Alert.alert("Conta excluída", "Você será desconectado.");
    navigation.replace("Login");
  };

  const voltar = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Meu Perfil</Text>

      <Text style={[styles.label, { color: colors.primary }]}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Digite seu nome"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.primary }]}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        keyboardType="email-address"
        placeholder="Digite seu email"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: colors.primary }]}>Senha</Text>

      {!mostrarNovoInputSenha && (
        <View style={styles.senhaContainer}>
          <Text style={[styles.senhaCensurada, { color: colors.text }]}>
            {"*".repeat(senha.length || 8)}
          </Text>

          <TouchableOpacity
            onPress={() => setMostrarNovoInputSenha(true)}
            style={[
              styles.alterarSenhaButton,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.alterarSenhaText}>Alterar Senha</Text>
          </TouchableOpacity>
        </View>
      )}

      {mostrarNovoInputSenha && (
        <TextInput
          value={novaSenha}
          onChangeText={setNovaSenha}
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          secureTextEntry
          placeholder="Digite a nova senha"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Salvar Alterações"
          onPress={salvarAlteracoes}
          color={colors.success}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Excluir Conta"
          onPress={excluirConta}
          color={colors.error}
        />
      </View>

      <TouchableOpacity
        style={[styles.botaoVoltar, { backgroundColor: colors.primary }]}
        onPress={voltar}
      >
        <Text style={styles.textoBotaoVoltar}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 40,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  senhaCensurada: {
    fontSize: 18,
    letterSpacing: 4,
  },
  alterarSenhaButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  alterarSenhaText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  botaoVoltar: {
    position: "absolute",
    bottom: 30,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  textoBotaoVoltar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
