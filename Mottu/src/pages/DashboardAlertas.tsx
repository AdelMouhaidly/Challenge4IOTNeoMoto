import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

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
  const { colors } = useTheme();

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.primary }]}>
        Alertas de Veículos
      </Text>

      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface },
              item.tipo === "Desaparecido"
                ? styles.cardDesaparecido
                : styles.cardManutencao,
            ]}
          >
            <TouchableOpacity onPress={() => exibirDetalhes(item)}>
              <Text style={[styles.modelo, { color: colors.primary }]}>
                {item.modelo}
              </Text>
              <Text style={[styles.placa, { color: colors.text }]}>
                {item.placa}
              </Text>
              <Text style={[styles.tipo, { color: colors.text }]}>
                {item.tipo}
              </Text>
              <Text style={[styles.data, { color: colors.textSecondary }]}>
                {item.data}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoLocalizacao,
                { backgroundColor: colors.success },
              ]}
              onPress={gerarCoordenadasAleatorias}
            >
              <Text style={styles.textoBotao}>Consultar Localização </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: colors.textSecondary,
            }}
          >
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
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardDesaparecido: {
    borderLeftColor: "#dc3545",
    borderLeftWidth: 6,
  },
  cardManutencao: {
    borderLeftColor: "#ffc107",
    borderLeftWidth: 6,
  },
  modelo: {
    fontSize: 18,
    fontWeight: "700",
  },
  placa: {
    fontSize: 16,
    fontWeight: "600",
  },
  tipo: {
    marginTop: 4,
    fontSize: 14,
  },
  data: {
    fontSize: 12,
  },
  botaoLocalizacao: {
    marginTop: 10,
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
