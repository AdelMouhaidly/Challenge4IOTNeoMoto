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

const { width } = Dimensions.get("window");

export default function Login({ navigation }: NativeStackScreenProps<any>) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

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
    <View style={styles.container}>
      <Image
        source={require("../assets/Mottu.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.titulo}>Bem-vindo de volta!</Text>

      <Text style={styles.etiqueta}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.entrada}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#9BBF9B"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.etiqueta}>Senha</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        placeholder="Digite sua senha"
        placeholderTextColor="#9BBF9B"
        style={styles.entrada}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.botao} onPress={realizarLogin}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, styles.botaoSecundario]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.textoBotaoSecundario}>Criar conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FDF4",
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
    color: "#228B22",
    marginBottom: 30,
    textAlign: "center",
  },
  etiqueta: {
    fontSize: 18,
    color: "#228B22",
    marginBottom: 8,
  },
  entrada: {
    borderWidth: 1,
    borderColor: "#A0D6A0",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#000",
  },
  botao: {
    backgroundColor: "#28A745",
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
    backgroundColor: "#DFF6DD",
    borderWidth: 1,
    borderColor: "#28A745",
  },
  textoBotaoSecundario: {
    color: "#28A745",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 18,
  },
});
