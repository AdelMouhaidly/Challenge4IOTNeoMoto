import { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../contexts/ThemeContext";

export default function DetectarMoto() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const { colors } = useTheme();

  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setResultado(null);
    }
  };

  const enviarImagem = async () => {
    if (!imageUri) {
      Alert.alert("Erro", "Por favor, selecione uma imagem antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "foto.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch("http://192.168.15.7:8000/detectar-moto", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      Alert.alert("Erro", "Não foi possível conectar à API.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[styles.titulo, { color: colors.primary }]}>
        Detecção de Motos
      </Text>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: colors.primary }]}
        onPress={selecionarImagem}
      >
        <Text style={styles.textoBotao}>Selecionar Imagem</Text>
      </TouchableOpacity>

      {imageUri && (
        <>
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderColor: colors.border }]}
          />

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: colors.success }]}
            onPress={enviarImagem}
          >
            <Text style={styles.textoBotao}>Enviar para API</Text>
          </TouchableOpacity>
        </>
      )}

      {resultado && (
        <View
          style={[
            styles.resultadoContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.resultadoTitulo, { color: colors.primary }]}>
            Resultado da Detecção:
          </Text>

          {resultado.motos_detectadas.length > 0 ? (
            <Text style={[styles.mensagemSucesso, { color: colors.success }]}>
              {" "}
              Moto detectada na imagem!
            </Text>
          ) : (
            <Text style={[styles.mensagemErro, { color: colors.error }]}>
              {" "}
              Nenhuma moto detectada na imagem.
            </Text>
          )}

          <Text style={[styles.resultadoTexto, { color: colors.text }]}>
            {JSON.stringify(resultado, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    flexGrow: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  textoBotao: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: 320,
    height: 320,
    marginVertical: 20,
    borderRadius: 15,
    borderWidth: 1,
  },
  resultadoContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    width: "100%",
    borderWidth: 1,
  },
  resultadoTitulo: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  resultadoTexto: {
    fontFamily: "monospace",
    fontSize: 14,
  },
  mensagemSucesso: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  mensagemErro: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
});
