import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

interface Alerta {
  id: string;
  tipo: "Desaparecido" | "Manutenção";
  modelo: string;
  placa: string;
  data: string;
  descricao: string;
}

const alertasMockados: Alerta[] = [
  {
    id: "1",
    tipo: "Desaparecido",
    modelo: "Honda Biz 125",
    placa: "ABC-1234",
    data: "2025-05-15",
    descricao: "Última localização conhecida: Pátio Zona Sul.",
  },
  {
    id: "2",
    tipo: "Manutenção",
    modelo: "Yamaha Fazer 250",
    placa: "XYZ-5678",
    data: "2025-05-22",
    descricao: "Troca de óleo e revisão atrasadas há 15 dias.",
  },
  {
    id: "3",
    tipo: "Desaparecido",
    modelo: "Honda CG 160",
    placa: "MOT-2025",
    data: "2025-05-10",
    descricao: "Sumiu após entrega em Santo Amaro.",
  },
];

export default function DashboardAlertas({ navigation }: any) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  useEffect(() => {
    setAlertas(alertasMockados);
  }, []);

  const exibirDetalhes = (alerta: Alerta) => {
    Alert.alert(
      `Alerta de ${alerta.tipo}`,
      `${alerta.modelo} (${alerta.placa})\n\n${alerta.descricao}\n\nData: ${alerta.data}`
    );
  };

  const gerarCoordenadasAleatorias = () => {
    const latitude = (-23.5 + Math.random()).toFixed(6); 
    const longitude = (-46.6 + Math.random()).toFixed(6);
    Alert.alert(
      "Localização Atual do Veículo",
      `Latitude: ${latitude}\nLongitude: ${longitude}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Alertas de Veículos</Text>

      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.tipo === "Desaparecido"
                ? styles.cardDesaparecido
                : styles.cardManutencao,
            ]}
          >
            <TouchableOpacity onPress={() => exibirDetalhes(item)}>
              <Text style={styles.modelo}>{item.modelo}</Text>
              <Text style={styles.placa}>{item.placa}</Text>
              <Text style={styles.tipo}>{item.tipo}</Text>
              <Text style={styles.data}>{item.data}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoLocalizacao}
              onPress={gerarCoordenadasAleatorias}
            >
              <Text style={styles.textoBotao}>Consultar Localização </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Nenhum alerta no momento.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFF0",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#228B22",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardDesaparecido: {
    backgroundColor: "#f8d7da",
    borderLeftColor: "#dc3545",
    borderLeftWidth: 6,
  },
  cardManutencao: {
    backgroundColor: "#fff3cd",
    borderLeftColor: "#ffc107",
    borderLeftWidth: 6,
  },
  modelo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#155724",
  },
  placa: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  tipo: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
  },
  data: {
    fontSize: 12,
    color: "#777",
  },
  botaoLocalizacao: {
    marginTop: 10,
    backgroundColor: "#28a745",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
