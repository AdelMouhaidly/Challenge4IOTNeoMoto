import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import * as Notifications from 'expo-notifications';
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { getPythonApiUrl } from "../config/api";
import notificationService from "../services/notificationService";

interface Alerta {
  id: string;
  tipo: string;
  moto_id: string;
  severidade: "baixa" | "media" | "alta";
  mensagem: string;
  timestamp: string;
}

interface Estatistica {
  total_motos: number;
  motos_em_uso: number;
  motos_paradas: number;
  motos_manutencao: number;
  alertas_ativos: number;
  temperatura_media?: number;
  ultima_atualizacao: string;
}

export default function DashboardAlertas({ navigation }: any) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatistica | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [permissaoNotificacao, setPermissaoNotificacao] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocalization();
  const alertasAnteriores = useRef<Set<string>>(new Set());
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    solicitarPermissoes();
    
    carregarDados();
    
    const interval = setInterval(() => {
      carregarDados(true);
    }, 30000);

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação tocada:', response);
      const data = response.notification.request.content.data;
      if (data && data.moto_id) {
        Alert.alert(
          'Detalhes do Alerta',
          `Moto: ${data.moto_id}\n${data.mensagem}`
        );
      }
    });

    return () => {
      clearInterval(interval);
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const solicitarPermissoes = async () => {
    const granted = await notificationService.requestPermissions();
    setPermissaoNotificacao(granted);
    if (!granted) {
      Alert.alert(
        'Permissão Necessária',
        'Por favor, habilite as notificações para receber alertas críticos de motos.'
      );
    }
  };

  const carregarDados = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const apiUrl = getPythonApiUrl();
      
      const responseAlertas = await fetch(`${apiUrl}/alertas?criticos_apenas=true`);
      if (responseAlertas.ok) {
        const dadosAlertas: Alerta[] = await responseAlertas.json();
        setAlertas(dadosAlertas);

        if (permissaoNotificacao) {
          for (const alerta of dadosAlertas) {
            if (!alertasAnteriores.current.has(alerta.id)) {
              await notificationService.enviarNotificacaoAlerta({
                id: alerta.id,
                tipo: alerta.tipo,
                moto_id: alerta.moto_id,
                severidade: alerta.severidade,
                mensagem: alerta.mensagem,
              });
              alertasAnteriores.current.add(alerta.id);
            }
          }
        }
      }

      const responseEstatisticas = await fetch(`${apiUrl}/estatisticas`);
      if (responseEstatisticas.ok) {
        const dadosEstatisticas: Estatistica = await responseEstatisticas.json();
        setEstatisticas(dadosEstatisticas);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados(true);
  };

  const exibirDetalhes = (alerta: Alerta) => {
    const data = formatarData(alerta.timestamp);
    Alert.alert(
      `${alerta.moto_id} - ${getTipoAlertaTraduzido(alerta.tipo)}`,
      `${alerta.mensagem}\n\nSeveridade: ${getSeveridadeTraduzida(alerta.severidade)}\n\nData: ${data}`
    );
  };

  const getTipoAlertaTraduzido = (tipo: string) => {
    switch (tipo) {
      case "temperatura_alta": return "Temperatura Alta";
      case "gps_offline": return "GPS Offline";
      case "moto_inativa": return "Moto Inativa";
      case "manutencao": return "Manutenção";
      case "moto_desaparecida": return "MOTO DESAPARECIDA";
      default: return tipo;
    }
  };

  const getSeveridadeTraduzida = (severidade: string) => {
    switch (severidade) {
      case "baixa": return "Baixa";
      case "media": return "Média";
      case "alta": return "Alta";
      default: return severidade;
    }
  };

  const getIconeAlerta = (tipo: string) => {
    switch (tipo) {
      case "temperatura_alta": return "thermometer-full";
      case "gps_offline": return "map-marker-alt";
      case "moto_inativa": return "exclamation-circle";
      case "manutencao": return "wrench";
      case "moto_desaparecida": return "exclamation-triangle";
      default: return "bell";
    }
  };

  const formatarData = (dataStr: string) => {
    try {
      const data = new Date(dataStr);
      return data.toLocaleString("pt-BR");
    } catch {
      return dataStr;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.titulo, { color: colors.primary }]}>
          {t("alerts.title")}
        </Text>
        <TouchableOpacity onPress={onRefresh} disabled={loading}>
          <Icon 
            name="sync" 
            size={20} 
            color={colors.primary}
            style={loading ? styles.rotating : undefined}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.headerAlertas}>
        <Text style={[styles.secaoTitulo, { color: colors.text }]}>
          Alertas Críticos ({alertas.length})
        </Text>
        {permissaoNotificacao && (
          <View style={[styles.notificationBadge, { backgroundColor: "#4ECDC4" }]}>
            <Icon name="bell" size={12} color="#fff" />
            <Text style={styles.notificationText}>Ativo</Text>
          </View>
        )}
      </View>

      {loading && alertas.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando alertas...
          </Text>
        </View>
      ) : (
        <FlatList
          data={alertas}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface },
                item.severidade === "alta" && styles.cardAlta,
                item.severidade === "media" && styles.cardMedia,
                item.severidade === "baixa" && styles.cardBaixa,
              ]}
            >
              <TouchableOpacity onPress={() => exibirDetalhes(item)}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Icon 
                      name={getIconeAlerta(item.tipo)} 
                      size={20} 
                      color={
                        item.severidade === "alta" ? "#dc3545" :
                        item.severidade === "media" ? "#ffc107" :
                        "#17a2b8"
                      }
                    />
                    <Text style={[styles.motoId, { color: colors.primary }]}>
                      {item.moto_id}
                    </Text>
                  </View>
                  <View style={[
                    styles.severidadeBadge,
                    { 
                      backgroundColor: 
                        item.severidade === "alta" ? "#dc3545" :
                        item.severidade === "media" ? "#ffc107" :
                        "#17a2b8"
                    }
                  ]}>
                    <Text style={styles.severidadeText}>
                      {getSeveridadeTraduzida(item.severidade)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tipoAlerta, { color: colors.text }]}>
                  {getTipoAlertaTraduzido(item.tipo)}
                </Text>
                <Text style={[styles.mensagem, { color: colors.text }]}>
                  {item.mensagem}
                </Text>
                <Text style={[styles.data, { color: colors.textSecondary }]}>
                  {formatarData(item.timestamp)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="check-circle" size={60} color={colors.success} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Nenhum alerta crítico
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Todas as motos estão operando normalmente
            </Text>
            {permissaoNotificacao && (
              <View style={[styles.notificationInfo, { backgroundColor: colors.surface }]}>
                <Icon name="bell" size={16} color="#4ECDC4" />
                <Text style={[styles.notificationInfoText, { color: colors.text }]}>
                  Você será notificado caso ocorra algum problema crítico
                </Text>
              </View>
            )}
          </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  rotating: {
    transform: [{ rotate: "180deg" }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  headerAlertas: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: "600",
  },
  notificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notificationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  notificationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
  notificationInfoText: {
    fontSize: 13,
    flex: 1,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardAlta: {
    borderLeftColor: "#dc3545",
    borderLeftWidth: 4,
  },
  cardMedia: {
    borderLeftColor: "#ffc107",
    borderLeftWidth: 4,
  },
  cardBaixa: {
    borderLeftColor: "#17a2b8",
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  motoId: {
    fontSize: 16,
    fontWeight: "700",
  },
  severidadeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severidadeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  tipoAlerta: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  mensagem: {
    fontSize: 14,
    marginBottom: 8,
  },
  data: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

