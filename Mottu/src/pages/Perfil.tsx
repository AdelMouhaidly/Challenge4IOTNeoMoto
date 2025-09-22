import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
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
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mostrarSenha, setMostrarSenha] = useState<boolean>(false);
  const { colors, isDark } = useTheme();

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
    if (!nome.trim() || !email.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setCarregando(true);
    try {
      const usuarioAtualizado = {
        name: nome,
        email,
        senha: novaSenha.trim() !== "" ? novaSenha : senha,
      };
      await AsyncStorage.setItem("user", JSON.stringify(usuarioAtualizado));
      setSenha(usuarioAtualizado.senha);
      setNovaSenha("");
      setMostrarNovoInputSenha(false);
      Alert.alert("Sucesso", "Seus dados foram atualizados com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setCarregando(false);
    }
  };

  const excluirConta = async () => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("user");
            Alert.alert(
              "Conta Excluída",
              "Sua conta foi excluída com sucesso."
            );
            navigation.replace("Login");
          },
        },
      ]
    );
  };

  const voltar = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: colors.header }]}>
        <View
          style={[styles.avatarContainer, { backgroundColor: colors.surface }]}
        >
          <Image
            source={require("../assets/avatar.jpg")}
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.welcomeText, { color: "#fff" }]}>
          Olá, {nome || "Usuário"}!
        </Text>
        <Text style={[styles.subtitleText, { color: "#E0E0E0" }]}>
          Gerencie suas informações pessoais
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            shadowColor: isDark ? "#000" : "#000",
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.primary }]}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />{" "}
          Informações Pessoais
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            <Ionicons name="person" size={16} color={colors.primary} /> Nome
            Completo
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              value={nome}
              onChangeText={setNome}
              style={[styles.input, { color: colors.text }]}
              placeholder="Digite seu nome completo"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            <Ionicons name="mail" size={16} color={colors.primary} /> Email
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { color: colors.text }]}
              keyboardType="email-address"
              placeholder="Digite seu email"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>
            <Ionicons name="lock-closed" size={16} color={colors.primary} />{" "}
            Senha
          </Text>

          {!mostrarNovoInputSenha ? (
            <View
              style={[
                styles.senhaContainer,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.senhaCensurada, { color: colors.text }]}>
                {"●".repeat(senha.length || 8)}
              </Text>
              <TouchableOpacity
                onPress={() => setMostrarNovoInputSenha(true)}
                style={[
                  styles.alterarSenhaButton,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
                <Text style={styles.alterarSenhaText}>Alterar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={novaSenha}
                onChangeText={setNovaSenha}
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!mostrarSenha}
                placeholder="Digite a nova senha"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={mostrarSenha ? "eye-off" : "eye"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.success }]}
          onPress={salvarAlteracoes}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: colors.error }]}
          onPress={excluirConta}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.dangerButtonText}>Excluir Conta</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={voltar}
      >
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[styles.backButtonText, { color: colors.primary }]}>
          Voltar
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
  },
  card: {
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 15,
    paddingHorizontal: 15,
    minHeight: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
  },
  eyeButton: {
    padding: 5,
  },
  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    minHeight: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  senhaCensurada: {
    fontSize: 18,
    letterSpacing: 3,
    flex: 1,
  },
  alterarSenhaButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  alterarSenhaText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    gap: 15,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 15,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 15,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
