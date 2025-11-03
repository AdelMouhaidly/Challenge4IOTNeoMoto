import { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";

const getApiUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/detectar-moto";
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000/detectar-moto";
  }
  return "http://192.168.15.5:8000/detectar-moto";
};

export default function DetectarMoto() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocalization();

  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("detection.errorTitle"), t("detection.errorPermission"));
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
      Alert.alert(t("detection.errorTitle"), t("detection.errorNoImage"));
      return;
    }

    setLoading(true);
    setResultado(null);

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "foto.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(getApiUrl(), {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erro da API:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResultado(data);
    } catch (error: any) {
      console.error("Erro ao enviar imagem:", error);
      if (error.name === "AbortError") {
        Alert.alert(t("detection.errorTitle"), t("detection.errorTimeout"));
      } else {
        Alert.alert(t("detection.errorTitle"), t("detection.errorDetection"));
      }
    } finally {
      setLoading(false);
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
        {t("detection.title")}
      </Text>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: colors.primary }]}
        onPress={selecionarImagem}
      >
        <Text style={styles.textoBotao}>{t("detection.selectImage")}</Text>
      </TouchableOpacity>

      {imageUri && (
        <>
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { borderColor: colors.border }]}
          />

          <TouchableOpacity
            style={[
              styles.botao,
              {
                backgroundColor: loading
                  ? colors.textSecondary
                  : colors.success,
              },
            ]}
            onPress={enviarImagem}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoBotao}>{t("detection.detect")}</Text>
            )}
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
            {t("detection.detectionResult")}:
          </Text>

          {resultado.motos_detectadas.length > 0 ? (
            <Text style={[styles.mensagemSucesso, { color: colors.success }]}>
              {t("detection.bikeDetected")}
            </Text>
          ) : (
            <Text style={[styles.mensagemErro, { color: colors.error }]}>
              {t("detection.noBikesDetected")}
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
