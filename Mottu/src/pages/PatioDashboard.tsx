import { useState } from "react";
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
      status: statusPossiveis[Math.floor(Math.random() * statusPossiveis.length)],
      marca: marcas[Math.floor(Math.random() * marcas.length)],
      configuracoes:
        configuracoes[Math.floor(Math.random() * configuracoes.length)],
    });
  }

  return motos;
}

export default function PatioDashboard() {
  const [motos, setMotos] = useState<Moto[]>(gerarMotos(15));
  const [motoSelecionada, setMotoSelecionada] = useState<Moto | null>(null);
  const [mostrarModalDetalhes, setMostrarModalDetalhes] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.titulo}>Mapa Digital do Pátio</Text>

      <MapView
        style={styles.patio}
        initialRegion={{
          latitude: (LAT_MIN + LAT_MAX) / 2,
          longitude: (LNG_MIN + LNG_MAX) / 2,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}
      >
        {motos.map((moto) => (
          <Marker
            key={moto.id}
            coordinate={{
              latitude: paraLatitude(moto.y),
              longitude: paraLongitude(moto.x),
            }}
            pinColor={corDoMarcador(moto.status)}
            onPress={() => {
              setMotoSelecionada(moto);
              setMostrarModalDetalhes(false);
            }}
          >
            <Icon name="motorcycle" size={20} color="#000000" />
          </Marker>
        ))}
      </MapView>

      <View style={styles.painelInfo}>
        {motoSelecionada ? (
          <>
            <Text style={styles.tituloInfo}>
              Detalhes da Moto {motoSelecionada.id}
            </Text>
            <Text>Nome: {motoSelecionada.name}</Text>
            <Text>Status: {motoSelecionada.status}</Text>
            <Text>
              Localização (lat/lng): {paraLatitude(motoSelecionada.y).toFixed(6)},{" "}
              {paraLongitude(motoSelecionada.x).toFixed(6)}
            </Text>

            <View style={styles.linhaBotoes}>
              <TouchableOpacity
                style={styles.botaoDetalhes}
                onPress={() => setMostrarModalDetalhes(true)}
              >
                <Text style={styles.textoBotaoDetalhes}>Ver Detalhes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoFechar}
                onPress={() => {
                  setMotoSelecionada(null);
                  setMostrarModalDetalhes(false);
                }}
              >
                <Text style={styles.textoBotaoFechar}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.textoInfo}>
            Toque em uma moto para ver detalhes
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
          <View style={styles.containerModal}>
            <Text style={styles.tituloModal}>Informações da Moto</Text>
            <Text>Marca: {motoSelecionada?.marca}</Text>
            <Text>Configurações: {motoSelecionada?.configuracoes}</Text>

            <TouchableOpacity
              onPress={() => setMostrarModalDetalhes(false)}
              style={[styles.botaoFechar, { alignSelf: "center", marginTop: 20 }]}
            >
              <Text style={styles.textoBotaoFechar}>Fechar Detalhes</Text>
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
    backgroundColor: "#eef2f5",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  patio: {
    width: LARGURA_PATIO,
    height: ALTURA_PATIO,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  painelInfo: {
    backgroundColor: "#fff",
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
    color: "#666",
  },
  linhaBotoes: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botaoDetalhes: {
    backgroundColor: "#006400",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  textoBotaoDetalhes: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoFechar: {
    backgroundColor: "#28A745",
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
    backgroundColor: "#fff",
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
