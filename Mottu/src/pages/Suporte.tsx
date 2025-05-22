import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function Suporte() {
  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [tipoDeSuporte, setTipoDeSuporte] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");

  const enviarTicket = async (): Promise<void> => {
    if (!nome || !email || !tipoDeSuporte || !mensagem) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    const endpoint = "https://formspree.io/f/xqaqjpvy";

    const dados = {
      nome: nome,
      email: email,
      tipo_de_suporte: tipoDeSuporte,
      mensagem: mensagem,
    };

    try {
      const resposta = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      });

      if (resposta.ok) {
        Alert.alert("Sucesso", "Seu ticket foi enviado com sucesso!");
        setNome("");
        setEmail("");
        setTipoDeSuporte("");
        setMensagem("");
      } else {
        const erro = await resposta.json();
        Alert.alert(
          "Erro",
          `Falha no envio: ${erro?.message || "Erro desconhecido"}`
        );
      }
    } catch {
      Alert.alert("Erro", "Erro de conexão. Verifique sua internet.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suporte</Text>
      <Text style={styles.description}>
        Preencha os campos abaixo e nos envie sua dúvida ou problema.
      </Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholder="Seu nome"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="seu@email.com"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Tipo de Suporte</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoDeSuporte}
          onValueChange={(itemValue: string) => setTipoDeSuporte(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione um tipo..." value="" />
          <Picker.Item label="Problema técnico" value="Problema técnico" />
          <Picker.Item label="Pagamento" value="Pagamento" />
          <Picker.Item label="Envio" value="Envio" />
          <Picker.Item label="Outros" value="Outros" />
        </Picker>
      </View>

      <Text style={styles.label}>Mensagem</Text>
      <TextInput
        value={mensagem}
        onChangeText={setMensagem}
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="Descreva seu problema ou dúvida..."
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={enviarTicket}>
        <Text style={styles.buttonText}>Enviar Ticket</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FDF4",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#228B22",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    color: "#228B22",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A0D6A0",
    padding: 14,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A0D6A0",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#228B22",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
