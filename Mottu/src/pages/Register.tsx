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
import { useLocalization } from "../contexts/LocalizationContext";

export default function Cadastro({ navigation }: any) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const { colors } = useTheme();
  const { t } = useLocalization();

  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const cadastrar = async () => {
    if (!nome.trim()) {
      Alert.alert(t("register.errorTitle"), t("register.errorEmptyName"));
      return;
    }

    if (!email.trim()) {
      Alert.alert(t("register.errorTitle"), t("register.errorEmptyEmail"));
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert(t("register.errorTitle"), t("register.errorInvalidEmail"));
      return;
    }

    if (!senha.trim()) {
      Alert.alert(t("register.errorTitle"), t("register.errorEmptyPassword"));
      return;
    }

    if (senha.length < 6) {
      Alert.alert(t("register.errorTitle"), t("register.errorPasswordTooShort"));
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(t("register.errorTitle"), t("register.errorPasswordMismatch"));
      return;
    }

    const usuario = {
      name: nome,
      email: email,
      senha: senha,
    };

    await AsyncStorage.setItem("user", JSON.stringify(usuario));
    Alert.alert(t("register.successTitle"), t("register.successMessage"));
    navigation.replace("Login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.primary }]}>
        {t("register.title")}
      </Text>

      <Text style={[styles.rotulo, { color: colors.primary }]}>
        {t("register.name")}
      </Text>
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
        placeholder={t("register.namePlaceholder")}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="words"
      />

      <Text style={[styles.rotulo, { color: colors.primary }]}>
        {t("register.email")}
      </Text>
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
        placeholder={t("register.emailPlaceholder")}
        placeholderTextColor={colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={[styles.rotulo, { color: colors.primary }]}>
        {t("register.password")}
      </Text>
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
        placeholder={t("register.passwordPlaceholder")}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={[styles.rotulo, { color: colors.primary }]}>
        {t("register.confirmPassword")}
      </Text>
      <TextInput
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry={true}
        style={[
          styles.entrada,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder={t("register.confirmPasswordPlaceholder")}
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.botaoPrincipal, { backgroundColor: colors.success }]}
        onPress={cadastrar}
      >
        <Text style={styles.textoBotaoPrincipal}>
          {t("register.registerButton")}
        </Text>
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
          {t("register.login")}
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
