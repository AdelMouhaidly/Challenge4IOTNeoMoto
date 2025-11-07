import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Moto, MotoStatus } from "../types/index";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";

const LARGURA_PATIO = Dimensions.get("window").width - 40;
const ALTURA_PATIO = 400;

const LAT_MIN = -23.551;
const LAT_MAX = -23.549;
const LNG_MIN = -46.634;
const LNG_MAX = -46.632;

function gerarMotos(quantidade: number): Moto[] {
  const statusPossiveis: MotoStatus[] = ["parada", "em uso", "aguardando"];
  const marcas = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Ducati"];
  const configuracoes = [
    "Motor 150cc, freios ABS",
    "Motor 250cc, suspensão ajustável",
    "Motor 500cc, painel digital",
    "Motor 1000cc, escapamento esportivo",
    "Motor 750cc, controle de tração",
  ];

  const motos: Moto[] = [];

  for (let i = 1; i <= quantidade; i++) {
    motos.push({
      id: i.toString(),
      name: `Moto ${i}`,
      x: Math.random(),
      y: Math.random(),
      status:
        statusPossiveis[Math.floor(Math.random() * statusPossiveis.length)],
      marca: marcas[Math.floor(Math.random() * marcas.length)],
      configuracoes:
        configuracoes[Math.floor(Math.random() * configuracoes.length)],
    });
  }

  return motos;
}

export default function PatioDashboard() {
  const { colors } = useTheme();
  const { t } = useLocalization();
  
  const motos = useMemo(() => gerarMotos(15), []);
  
  const [motoSelecionada, setMotoSelecionada] = useState<Moto | null>(null);
  const [mostrarModalDetalhes, setMostrarModalDetalhes] = useState(false);

  const contagemStatus = useMemo(() => ({
    parada: motos.filter((m) => m.status === "parada").length,
    "em uso": motos.filter((m) => m.status === "em uso").length,
    aguardando: motos.filter((m) => m.status === "aguardando").length,
  }), [motos]);

  function corDoMarcador(status: MotoStatus) {
    if (status === "em uso") return "#f39c12";
    if (status === "parada") return "#27ae60";
    if (status === "aguardando") return "#c0392b";
    return "#34495e";
  }

  function paraLatitude(y: number) {
    return LAT_MAX - (LAT_MAX - LAT_MIN) * y;
  }

  function paraLongitude(x: number) {
    return LNG_MIN + (LNG_MAX - LNG_MIN) * x;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.primary }]}>
        {t("patio.title")}
      </Text>

      <View style={[styles.legendaContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.legendaTitulo, { color: colors.text }]}>
          {t("patio.legend")}:
        </Text>
        <View style={styles.legendaItens}>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: "#27ae60" }]} />
            <Text style={[styles.legendaTexto, { color: colors.text }]}>
              {t("patio.stopped")} ({contagemStatus.parada})
            </Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: "#f39c12" }]} />
            <Text style={[styles.legendaTexto, { color: colors.text }]}>
              {t("patio.inUse")} ({contagemStatus["em uso"]})
            </Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: "#c0392b" }]} />
            <Text style={[styles.legendaTexto, { color: colors.text }]}>
              {t("patio.waiting")} ({contagemStatus.aguardando})
            </Text>
          </View>
        </View>
      </View>

      <MapView
        style={styles.patio}
        initialRegion={{
          latitude: (LAT_MIN + LAT_MAX) / 2,
          longitude: (LNG_MIN + LNG_MAX) / 2,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        {motos.map((moto) => (
          <Marker
            key={moto.id}
            coordinate={{
              latitude: paraLatitude(moto.y),
              longitude: paraLongitude(moto.x),
            }}
            onPress={() => {
              setMotoSelecionada(moto);
              setMostrarModalDetalhes(false);
            }}
          >
            <View
              style={[
                styles.marcadorMoto,
                { backgroundColor: corDoMarcador(moto.status) },
              ]}
            >
              <Icon name="motorcycle" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.painelInfo, { backgroundColor: colors.surface }]}>
        {motoSelecionada ? (
          <>
            <Text style={[styles.tituloInfo, { color: colors.primary }]}>
              {t("patio.detailsTitle")} {motoSelecionada.id}
            </Text>
            <Text style={{ color: colors.text }}>
              {t("patio.name")}: {motoSelecionada.name}
            </Text>
            <Text style={{ color: colors.text }}>
              {t("patio.status")}: {motoSelecionada.status}
            </Text>
            <Text style={{ color: colors.text }}>
              {t("patio.location")}:{" "}
              {paraLatitude(motoSelecionada.y).toFixed(6)},{" "}
              {paraLongitude(motoSelecionada.x).toFixed(6)}
            </Text>

            <View style={styles.linhaBotoes}>
              <TouchableOpacity
                style={[
                  styles.botaoDetalhes,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setMostrarModalDetalhes(true)}
              >
                <Text style={styles.textoBotaoDetalhes}>
                  {t("common.viewDetails")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoFechar,
                  { backgroundColor: colors.success },
                ]}
                onPress={() => {
                  setMotoSelecionada(null);
                  setMostrarModalDetalhes(false);
                }}
              >
                <Text style={styles.textoBotaoFechar}>{t("common.close")}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={[styles.textoInfo, { color: colors.textSecondary }]}>
            {t("patio.tapForDetails")}
          </Text>
        )}
      </View>

      <Modal
        visible={mostrarModalDetalhes}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarModalDetalhes(false)}
      >
        <View style={styles.fundoModal}>
          <View
            style={[styles.containerModal, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.tituloModal, { color: colors.primary }]}>
              {t("patio.bikeInfo")}
            </Text>
            <Text style={{ color: colors.text }}>
              {t("patio.brand")}: {motoSelecionada?.marca}
            </Text>
            <Text style={{ color: colors.text }}>
              {t("patio.configurations")}: {motoSelecionada?.configuracoes}
            </Text>
            <TouchableOpacity
              onPress={() => setMostrarModalDetalhes(false)}
              style={[
                styles.botaoFechar,
                {
                  backgroundColor: colors.success,
                  alignSelf: "center",
                  marginTop: 20,
                },
              ]}
            >
              <Text style={styles.textoBotaoFechar}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  legendaContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  legendaTitulo: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  legendaItens: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendaCor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  legendaTexto: {
    fontSize: 12,
  },
  marcadorMoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  patio: {
    width: LARGURA_PATIO,
    height: ALTURA_PATIO,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  painelInfo: {
    borderRadius: 8,
    padding: 15,
    minHeight: 120,
    justifyContent: "center",
  },
  tituloInfo: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  textoInfo: {
    fontStyle: "italic",
  },
  linhaBotoes: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botaoDetalhes: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  textoBotaoDetalhes: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoFechar: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  textoBotaoFechar: {
    color: "#fff",
    fontWeight: "bold",
  },
  fundoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  containerModal: {
    borderRadius: 8,
    padding: 20,
    width: "90%",
  },
  tituloModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
});
