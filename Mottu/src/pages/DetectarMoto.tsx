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
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";

import { getPythonApiUrl } from "../config/api";

const getApiUrl = () => {
  return `${getPythonApiUrl()}/detectar-moto`;
};

export default function DetectarMoto() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocalization();

  const selecionarImagem = async () => {
    try {
      console.log("Verificando permissões existentes...");
      
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log("Status da permissão existente:", existingStatus);
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== "granted") {
        console.log("Permissão não concedida, solicitando...");
        const { status: requestedStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Status após solicitação:", requestedStatus);
        finalStatus = requestedStatus;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          t("detection.errorTitle"),
          t("detection.errorPermission") + "\n\nPor favor, permita o acesso às fotos nas configurações do dispositivo.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir Configurações",
              onPress: () => {
                if (Platform.OS === "android") {
                  Linking.openSettings();
                } else {
                  Linking.openURL("app-settings:");
                }
              },
            },
          ]
        );
        return;
      }

      console.log("Permissão concedida, abrindo seletor de imagens...");
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        base64: false,
        allowsMultipleSelection: false,
      });

      console.log("Resultado do ImagePicker:", JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        console.log("Imagem selecionada, URI:", uri);
        setImageUri(uri);
        setResultado(null);
      } else if (result.canceled) {
        console.log("Usuário cancelou a seleção");
      } else {
        console.log("Nenhuma imagem selecionada ou assets vazio");
        Alert.alert(
          t("detection.errorTitle"),
          "Nenhuma imagem foi selecionada. Tente novamente."
        );
      }
    } catch (error: any) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert(
        t("detection.errorTitle"),
        "Erro ao acessar a galeria: " + (error.message || "Erro desconhecido") + "\n\nVerifique as permissões do app nas configurações."
      );
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
    const uri = Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri;
    
    formData.append("file", {
      uri: uri,
      name: "foto.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const apiUrl = getApiUrl();
      console.log("Enviando imagem para:", apiUrl);
      console.log("URI da imagem:", imageUri);
      console.log("URI processada:", uri);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erro da API:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Resposta da API:", data);
      setResultado(data);
    } catch (error: any) {
      console.error("Erro ao enviar imagem:", error);
      if (error.name === "AbortError" || error.message?.includes("Aborted")) {
        Alert.alert(
          t("detection.errorTitle"),
          t("detection.errorTimeout") + " " + t("detection.coldStartMessage")
        );
      } else if (error.message?.includes("Network request failed")) {
        Alert.alert(
          t("detection.errorTitle"),
          t("detection.errorConnection")
        );
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={[styles.image, { borderColor: colors.border }]}
              resizeMode="contain"
              onError={(error) => {
                console.error("Erro ao carregar imagem:", error);
                Alert.alert(
                  t("detection.errorTitle"),
                  "Erro ao carregar a imagem. Tente selecionar novamente."
                );
              }}
              onLoad={() => {
                console.log("Imagem carregada com sucesso");
              }}
            />
          </View>

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
  imageContainer: {
    width: 320,
    height: 320,
    marginVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: "#f0f0f0",
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
