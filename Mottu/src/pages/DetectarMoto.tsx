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
  const [tentativa, setTentativa] = useState(0);
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

  const enviarImagem = async (isRetry = false) => {
    if (!imageUri) {
      Alert.alert(t("detection.errorTitle"), t("detection.errorNoImage"));
      return;
    }

    setLoading(true);
    if (!isRetry) {
      setResultado(null);
      setTentativa(0);
    }

    const formData = new FormData();
    const uri = Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri;
    
    formData.append("file", {
      uri: uri,
      name: "moto.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const controller = new AbortController();
      const timeout = isRetry ? 60000 : 180000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const apiUrl = getApiUrl();
      console.log(`Enviando imagem (tentativa ${tentativa + 1}):`, apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
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
      setTentativa(0);

      if (data.motos_detectadas && data.motos_detectadas.length > 0) {
        console.log("Motos detectadas e registradas automaticamente!");
        Alert.alert(
          "Sucesso!",
          `${data.motos_detectadas.length} moto(s) detectada(s) e registrada(s) automaticamente no sistema!`,
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("Erro ao enviar imagem:", error);
      
      if (!isRetry && tentativa < 1 && error.message?.includes("Network request failed")) {
        console.log("Tentando novamente automaticamente...");
        setTentativa(1);
        setTimeout(() => enviarImagem(true), 1000);
        return;
      }
      
      if (error.name === "AbortError" || error.message?.includes("Aborted")) {
        Alert.alert(
          t("detection.errorTitle"),
          t("detection.errorTimeout") + "\n\n" + t("detection.coldStartMessage"),
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Tentar Novamente", onPress: () => enviarImagem(true) }
          ]
        );
      } else if (error.message?.includes("Network request failed")) {
        Alert.alert(
          t("detection.errorTitle"),
          t("detection.errorConnection") + "\n\nVerifique se o backend Python está rodando.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Tentar Novamente", onPress: () => enviarImagem(true) }
          ]
        );
      } else {
        Alert.alert(
          t("detection.errorTitle"), 
          t("detection.errorDetection"),
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Tentar Novamente", onPress: () => enviarImagem(true) }
          ]
        );
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

      <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Os IDs das motos serão gerados automaticamente quando detectadas!
        </Text>
        <Text style={[styles.infoSubtext, { color: colors.textSecondary }]}>
          As motos detectadas serão registradas no sistema IoT com GPS, placa e marca.
        </Text>
      </View>

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
            onPress={() => enviarImagem(false)}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>
                  {tentativa > 0 ? "Tentando novamente..." : "Detectando motos..."}
                </Text>
              </View>
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

          {resultado.motos_detectadas && resultado.motos_detectadas.length > 0 ? (
            <>
              <Text style={[styles.mensagemSucesso, { color: colors.success }]}>
                {resultado.mensagem || t("detection.bikeDetected")}
              </Text>
              
              {resultado.estatisticas && (
                <View style={styles.estatisticasContainer}>
                  <Text style={[styles.estatisticasTitulo, { color: colors.text }]}>
                    Estatísticas:
                  </Text>
                  {resultado.temperatura_ambiente && (
                    <Text style={[styles.estatisticasTexto, { color: colors.text }]}>
                      Temperatura Ambiente: {resultado.temperatura_ambiente}
                    </Text>
                  )}
                  <Text style={[styles.estatisticasTexto, { color: colors.text }]}>
                    Total: {resultado.estatisticas.total_motos} moto(s)
                  </Text>
                  <Text style={[styles.estatisticasTexto, { color: colors.text }]}>
                    Área ocupada: {resultado.estatisticas.area_total_ocupada_percent}%
                  </Text>
                  <Text style={[styles.estatisticasTexto, { color: colors.text }]}>
                    Densidade: {resultado.estatisticas.densidade}
                  </Text>
                </View>
              )}

              {resultado.motos_detectadas.map((moto: any, index: number) => (
                <View key={index} style={styles.motoDetalhes}>
                  <Text style={[styles.motoTitulo, { color: colors.primary }]}>
                    {moto.moto_id || `Moto ${index + 1}`}
                  </Text>
                  <Text style={[styles.motoInfo, { color: colors.text }]}>
                    Confiança: {(moto.confianca * 100).toFixed(1)}%
                  </Text>
                  {moto.gps && (
                    <Text style={[styles.motoInfo, { color: colors.text }]}>
                      GPS: {moto.gps.latitude.toFixed(6)}, {moto.gps.longitude.toFixed(6)}
                    </Text>
                  )}
                  {moto.posicao_percentual && (
                    <Text style={[styles.motoInfo, { color: colors.text }]}>
                      Posição: {moto.posicao_percentual.x}%, {moto.posicao_percentual.y}%
                    </Text>
                  )}
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.mensagemErro, { color: colors.error }]}>
              {t("detection.noBikesDetected")}
            </Text>
          )}
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
  estatisticasContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
  },
  estatisticasTitulo: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 6,
  },
  estatisticasTexto: {
    fontSize: 13,
    marginBottom: 4,
  },
  motoDetalhes: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
  },
  motoTitulo: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 6,
  },
  motoInfo: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoBox: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  infoSubtext: {
    fontSize: 12,
    lineHeight: 18,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
