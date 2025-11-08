import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/FontAwesome5";
import { MotoStatus } from "../types/index";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { getPythonApiUrl } from "../config/api";

interface MotoIoT {
  moto_id: string;
  estado?: string;
  gps?: string;
  temperatura?: string;
  placa?: string;
  marca?: string;
  monitoramento_iot: boolean;
  status_monitoramento?: string;
  tempo_offline?: number;
  ultima_atualizacao?: string;
}

interface MotoMapa extends MotoIoT {
  latitude: number;
  longitude: number;
  status: MotoStatus;
}

const LARGURA_PATIO = Dimensions.get("window").width - 40;
const ALTURA_PATIO = 400;

export default function PatioDashboard() {
  const { colors } = useTheme();
  const { t } = useLocalization();
  const mapRef = useRef<MapView>(null);
  
  const [motos, setMotos] = useState<MotoMapa[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [motoSelecionada, setMotoSelecionada] = useState<MotoMapa | null>(null);
  const [mostrarModalDetalhes, setMostrarModalDetalhes] = useState(false);
  
  const [regiao, setRegiao] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  useEffect(() => {
    carregarMotos();
    const interval = setInterval(carregarMotos, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarMotos = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const apiUrl = getPythonApiUrl();
      const response = await fetch(`${apiUrl}/motos-estado`);
      
      if (response.ok) {
        const motosIoT: MotoIoT[] = await response.json();
        
        const motosComLocalizacao: MotoMapa[] = motosIoT
          .filter(moto => moto.gps && moto.gps.trim() !== "")
          .map(moto => {
            let lat, lng;
            
            try {
              const coords = moto.gps!.split(',');
              if (coords.length !== 2) {
                return null;
              }
              
              lat = parseFloat(coords[0].trim());
              lng = parseFloat(coords[1].trim());
              
              if (isNaN(lat) || isNaN(lng)) {
                return null;
              }
              
              if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return null;
              }
            } catch (error) {
              return null;
            }
            
            let status: MotoStatus = "parada";
            
            if (moto.status_monitoramento === "desaparecida") {
              status = "aguardando";
            } else if (moto.estado) {
              const estadoLower = moto.estado.toLowerCase();
              if (estadoLower.includes("desaparecida")) status = "aguardando";
              else if (estadoLower.includes("uso")) status = "em uso";
              else if (estadoLower.includes("aguardando")) status = "aguardando";
              else if (estadoLower.includes("parada")) status = "parada";
            }
            
            return {
              ...moto,
              latitude: lat,
              longitude: lng,
              status
            };
          })
          .filter(moto => moto !== null) as MotoMapa[];
        
        if (motosComLocalizacao.length === 0) {
          setMotos([]);
          setMotoSelecionada(null);
        } else {
          setMotos(motosComLocalizacao);
        }
        
        if (motosComLocalizacao.length > 0) {
          const lats = motosComLocalizacao.map(m => m.latitude);
          const lngs = motosComLocalizacao.map(m => m.longitude);
          
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          
          setRegiao({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
            longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
          });
        }
      } else {
        setMotos([]);
        setMotoSelecionada(null);
      }
    } catch (error) {
      console.error("Erro ao carregar motos:", error);
      setMotos([]);
      setMotoSelecionada(null);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarMotos(true);
  };

  const contagemStatus = {
    parada: motos.filter((m) => m.status === "parada").length,
    "em uso": motos.filter((m) => m.status === "em uso").length,
    aguardando: motos.filter((m) => m.status === "aguardando").length,
  };

  function corDoMarcador(status: MotoStatus, statusMonitoramento?: string) {
    if (statusMonitoramento === "desaparecida") return "#FF0000";
    if (statusMonitoramento === "offline") return "#FF6B6B";
    
    if (status === "em uso") return "#f39c12";
    if (status === "parada") return "#27ae60";
    if (status === "aguardando") return "#c0392b";
    return "#34495e";
  }

  function obterTextoStatus(moto: MotoMapa) {
    if (moto.status_monitoramento === "desaparecida") {
      const minutos = moto.tempo_offline ? Math.floor(moto.tempo_offline / 60) : 0;
      return `DESAPARECIDA - ${minutos} minutos sem sinal`;
    }
    if (moto.status_monitoramento === "offline") {
      const minutos = moto.tempo_offline ? Math.floor(moto.tempo_offline / 60) : 0;
      return `OFFLINE - ${minutos} minutos sem sinal`;
    }
    return moto.estado || moto.status;
  }

  const centralizarNoMapa = (moto: MotoMapa) => {
    const newRegion = {
      latitude: moto.latitude,
      longitude: moto.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
    
    setRegiao(newRegion);
    setMotoSelecionada(moto);
  };

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return "N/A";
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
          {t("patio.title")}
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
            <View style={[styles.legendaCor, { backgroundColor: "#FF0000" }]} />
            <Text style={[styles.legendaTexto, { color: colors.text }]}>
              Desaparecida ({motos.filter(m => m.status_monitoramento === "desaparecida").length})
            </Text>
          </View>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando motos...
          </Text>
        </View>
      ) : motos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="motorcycle" size={60} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhuma moto detectada
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Use a tela "Detectar Moto" para adicionar motos ao sistema
          </Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.patio}
          region={regiao}
          onRegionChangeComplete={setRegiao}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {motos.map((moto) => (
            <Marker
              key={moto.moto_id}
              coordinate={{
                latitude: moto.latitude,
                longitude: moto.longitude,
              }}
              onPress={() => {
                setMotoSelecionada(moto);
                setMostrarModalDetalhes(false);
              }}
            >
            <View
              style={[
                styles.marcadorMoto,
                { 
                  backgroundColor: corDoMarcador(moto.status, moto.status_monitoramento),
                  borderWidth: moto.status_monitoramento === "desaparecida" ? 3 : 2,
                  borderColor: moto.status_monitoramento === "desaparecida" ? "#FFFFFF" : "#FFFFFF",
                },
              ]}
            >
              <Icon 
                name={moto.status_monitoramento === "desaparecida" ? "exclamation-triangle" : "motorcycle"} 
                size={20} 
                color="#FFFFFF" 
              />
            </View>
            </Marker>
          ))}
        </MapView>
      )}

      {motos.length > 0 && (
        <ScrollView 
          style={styles.scrollInfo}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={[styles.painelInfo, { backgroundColor: colors.surface }]}>
            {motoSelecionada ? (
            <>
              <View style={styles.motoHeaderInfo}>
                <Text style={[styles.tituloInfo, { color: colors.primary }]}>
                  {motoSelecionada.moto_id}
                </Text>
                {motoSelecionada.monitoramento_iot && (
                  <View style={[styles.iotBadgeSmall, { backgroundColor: "#4ECDC4" }]}>
                    <Icon name="wifi" size={10} color="#fff" />
                    <Text style={styles.iotTextSmall}>IoT</Text>
                  </View>
                )}
              </View>

              {motoSelecionada.status_monitoramento && (
                <View style={[
                  styles.statusMonitoramentoBanner,
                  {
                    backgroundColor:
                      motoSelecionada.status_monitoramento === "desaparecida" ? "#FFE6E6" :
                      motoSelecionada.status_monitoramento === "offline" ? "#FFF9E6" :
                      "#F0FFF4"
                  }
                ]}>
                  <Text style={[
                    styles.statusMonitoramentoBannerText,
                    {
                      color:
                        motoSelecionada.status_monitoramento === "desaparecida" ? "#FF0000" :
                        motoSelecionada.status_monitoramento === "offline" ? "#FF6B6B" :
                        "#4ECDC4"
                    }
                  ]}>
                    {obterTextoStatus(motoSelecionada)}
                  </Text>
                </View>
              )}
              
              <View style={styles.infoDestaque}>
                {motoSelecionada.placa && (
                  <View style={[styles.placaBadge, { backgroundColor: colors.primary }]}>
                    <Icon name="id-card" size={12} color="#fff" />
                    <Text style={styles.placaText}>{motoSelecionada.placa}</Text>
                  </View>
                )}
                {motoSelecionada.marca && (
                  <View style={[styles.marcaBadge, { backgroundColor: "#4ECDC4" }]}>
                    <Icon name="motorcycle" size={12} color="#fff" />
                    <Text style={styles.marcaText}>{motoSelecionada.marca}</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoRow}>
                <Icon name="circle" size={12} color={corDoMarcador(motoSelecionada.status, motoSelecionada.status_monitoramento)} />
                <Text style={{ color: colors.text, marginLeft: 8 }}>
                  {t("patio.status")}: {obterTextoStatus(motoSelecionada)}
                </Text>
              </View>
              {motoSelecionada.temperatura && (
                <View style={styles.infoRow}>
                  <Icon name="thermometer-half" size={12} color="#FF6B6B" />
                  <Text style={{ color: colors.text, marginLeft: 8 }}>
                    Temperatura: {motoSelecionada.temperatura}
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Icon name="map-marker-alt" size={12} color="#4ECDC4" />
                <Text style={{ color: colors.text, marginLeft: 8 }}>
                  {t("patio.location")}: {motoSelecionada.latitude.toFixed(6)}, {motoSelecionada.longitude.toFixed(6)}
                </Text>
              </View>
              {motoSelecionada.ultima_atualizacao && (
                <View style={styles.infoRow}>
                  <Icon name="clock" size={12} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 11 }}>
                    Última atualização: {formatarData(motoSelecionada.ultima_atualizacao)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.botaoVerMapa, { backgroundColor: colors.primary }]}
                onPress={() => centralizarNoMapa(motoSelecionada)}
              >
                <Icon name="map-marked-alt" size={16} color="#fff" />
                <Text style={styles.textoBotaoVerMapa}>Ver no Mapa</Text>
              </TouchableOpacity>

              <View style={styles.linhaBotoes}>
                <TouchableOpacity
                  style={[
                    styles.botaoDetalhes,
                    { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setMostrarModalDetalhes(true)}
                >
                  <Text style={[styles.textoBotaoDetalhes, { color: colors.primary }]}>
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
        </ScrollView>
      )}

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
            <View style={styles.modalContent}>
              <View style={styles.modalDestaque}>
                {motoSelecionada?.placa && (
                  <View style={styles.modalPlacaContainer}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Placa</Text>
                    <View style={[styles.modalPlacaBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.modalPlacaText}>{motoSelecionada.placa}</Text>
                    </View>
                  </View>
                )}
                {motoSelecionada?.marca && (
                  <View style={styles.modalMarcaContainer}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Marca</Text>
                    <View style={[styles.modalMarcaBadge, { backgroundColor: "#4ECDC4" }]}>
                      <Text style={styles.modalMarcaText}>{motoSelecionada.marca}</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.modalDivider} />

              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>ID:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>
                  {motoSelecionada?.moto_id}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Estado:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>
                  {motoSelecionada?.estado || "N/A"}
                </Text>
              </View>
              {motoSelecionada?.temperatura && (
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Temperatura:</Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>
                    {motoSelecionada.temperatura}
                  </Text>
                </View>
              )}
              <View style={styles.modalRow}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>GPS:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>
                  {motoSelecionada?.gps}
                </Text>
              </View>
              {motoSelecionada?.ultima_atualizacao && (
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                    Última atualização:
                  </Text>
                  <Text style={[styles.modalValue, { color: colors.text }]}>
                    {formatarData(motoSelecionada.ultima_atualizacao)}
                  </Text>
                </View>
              )}
            </View>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    height: ALTURA_PATIO,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    height: ALTURA_PATIO,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  rotating: {
    transform: [{ rotate: "180deg" }],
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
    marginBottom: 10,
  },
  scrollInfo: {
    flex: 1,
  },
  painelInfo: {
    borderRadius: 8,
    padding: 15,
    minHeight: 120,
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  motoHeaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  iotBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  iotTextSmall: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  statusMonitoramentoBanner: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 3,
  },
  statusMonitoramentoBannerText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  infoDestaque: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  placaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  placaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  marcaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  marcaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  tituloInfo: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  textoInfo: {
    fontStyle: "italic",
  },
  botaoVerMapa: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  textoBotaoVerMapa: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  linhaBotoes: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  botaoDetalhes: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  textoBotaoDetalhes: {
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
  modalContent: {
    gap: 12,
  },
  modalDestaque: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  modalPlacaContainer: {
    alignItems: "center",
    gap: 6,
  },
  modalMarcaContainer: {
    alignItems: "center",
    gap: 6,
  },
  modalPlacaBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalPlacaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  modalMarcaBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalMarcaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  modalRow: {
    gap: 4,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalValue: {
    fontSize: 14,
  },
});
