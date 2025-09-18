import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

export default function Login({ navigation }: NativeStackScreenProps<any>) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { colors, toggleTheme, isDark } = useTheme();

  const realizarLogin = async () => {
    const usuarioArmazenado = await AsyncStorage.getItem("user");
    if (usuarioArmazenado) {
      const usuario = JSON.parse(usuarioArmazenado);
      if (usuario.email === email && usuario.senha === senha) {
        navigation.replace("DrawerRoot");
      } else {
        Alert.alert("Erro", "Email ou senha incorretos.");
      }
    } else {
      Alert.alert("Erro", "Usuário não encontrado.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require("../assets/Mottu.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={[styles.titulo, { color: colors.primary }]}>
        Bem-vindo de volta!
      </Text>

      <Text style={[styles.etiqueta, { color: colors.primary }]}>Email</Text>
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

      <Text style={[styles.etiqueta, { color: colors.primary }]}>Senha</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        placeholder="Digite sua senha"
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.entrada,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: colors.success }]}
        onPress={realizarLogin}
      >
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.botao,
          styles.botaoSecundario,
          {
            backgroundColor: colors.surface,
            borderColor: colors.success,
          },
        ]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={[styles.textoBotaoSecundario, { color: colors.success }]}>
          Criar conta
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.botaoTema,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        onPress={toggleTheme}
      >
        <Ionicons
          name={isDark ? "sunny" : "moon"}
          size={24}
          color={colors.primary}
        />
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
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: "center",
    marginBottom: 30,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  etiqueta: {
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
  botao: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  textoBotao: {
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
  botaoTema: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
});
