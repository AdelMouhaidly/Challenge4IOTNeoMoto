import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { getPythonApiUrl } from "../config/api";
import { Activity, MapPin, Thermometer, Eye, Send, RefreshCw, Edit, Trash2 } from "lucide-react-native";

interface Leitura {
  id: number;
  moto_id: string;
  tipo: "estado" | "moto" | "temperatura" | "gps";
  valor: string;
  timestamp: string;
}

interface MotoResumo {
  moto_id: string;
  estado?: string;
  gps?: string;
  temperatura?: string;
  ultima_atualizacao?: string;
}

export default function MonitoramentoIoT() {
  const { colors } = useTheme();
  const { t } = useLocalization();
  const [motos, setMotos] = useState<MotoResumo[]>([]);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "leituras" | "teste">("dashboard");

  // Formulário de teste
  const [motoId, setMotoId] = useState("");
  const [tipoLeitura, setTipoLeitura] = useState<"estado" | "moto" | "temperatura" | "gps">("estado");
  const [valorLeitura, setValorLeitura] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Filtros
  const [filtroMoto, setFiltroMoto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | "estado" | "moto" | "temperatura" | "gps">("");

  // Edição
  const [editandoLeitura, setEditandoLeitura] = useState<number | string | null>(null);
  const [editMotoId, setEditMotoId] = useState("");
  const [editTipo, setEditTipo] = useState<"estado" | "moto" | "temperatura" | "gps">("estado");
  const [editValor, setEditValor] = useState("");
  const [editLeituraId, setEditLeituraId] = useState<number | null>(null);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(() => {
      carregarDados();
    }, 10000); // Atualiza a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const apiUrl = getPythonApiUrl();
      
      // Carregar estado das motos
      const responseMotos = await fetch(`${apiUrl}/motos-estado`);
      if (responseMotos.ok) {
        const dadosMotos = await responseMotos.json();
        setMotos(dadosMotos);
      }

      // Carregar leituras
      let urlLeituras = `${apiUrl}/leituras`;
      const params = new URLSearchParams();
      if (filtroMoto) params.append("moto_id", filtroMoto);
      if (filtroTipo) params.append("tipo", filtroTipo);
      if (params.toString()) urlLeituras += `?${params.toString()}`;

      const responseLeituras = await fetch(urlLeituras);
      if (responseLeituras.ok) {
        const dadosLeituras = await responseLeituras.json();
        setLeituras(dadosLeituras.reverse()); // Mais recentes primeiro
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const enviarLeitura = async () => {
    if (!motoId.trim() || !valorLeitura.trim()) {
      Alert.alert(t("iot.errorTitle"), t("iot.errorEmptyFields"));
      return;
    }

    try {
      setEnviando(true);
      const apiUrl = getPythonApiUrl();
      const response = await fetch(`${apiUrl}/leituras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moto_id: motoId.trim(),
          tipo: tipoLeitura,
          valor: valorLeitura.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert(t("iot.successTitle"), t("iot.successSend"));
        setMotoId("");
        setValorLeitura("");
        carregarDados();
      } else {
        throw new Error("Erro ao enviar leitura");
      }
    } catch (error) {
      Alert.alert(t("iot.errorTitle"), t("iot.errorSend"));
    } finally {
      setEnviando(false);
    }
  };

  const iniciarEdicao = (leitura: Leitura) => {
    setEditandoLeitura(leitura.id);
    setEditLeituraId(leitura.id);
    setEditMotoId(leitura.moto_id);
    setEditTipo(leitura.tipo);
    setEditValor(leitura.valor);
  };

  const iniciarEdicaoMoto = async (motoId: string, tipo: "estado" | "temperatura" | "gps", valor: string) => {
    // Buscar a leitura mais recente deste tipo para esta moto
    try {
      const apiUrl = getPythonApiUrl();
      const response = await fetch(`${apiUrl}/leituras?moto_id=${motoId}&tipo=${tipo}`);
      if (response.ok) {
        const leituras: Leitura[] = await response.json();
        if (leituras.length > 0) {
          const leituraMaisRecente = leituras[leituras.length - 1];
          setEditandoLeitura(`${motoId}-${tipo}`);
          setEditLeituraId(leituraMaisRecente.id);
          setEditMotoId(motoId);
          setEditTipo(tipo);
          setEditValor(valor);
        } else {
          // Se não existe, criar nova
          setEditandoLeitura(`${motoId}-${tipo}`);
          setEditLeituraId(null);
          setEditMotoId(motoId);
          setEditTipo(tipo);
          setEditValor(valor);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar leitura:", error);
      setEditandoLeitura(`${motoId}-${tipo}`);
      setEditLeituraId(null);
      setEditMotoId(motoId);
      setEditTipo(tipo);
      setEditValor(valor);
    }
  };

  const cancelarEdicao = () => {
    setEditandoLeitura(null);
    setEditLeituraId(null);
    setEditMotoId("");
    setEditTipo("estado");
    setEditValor("");
  };

  const salvarEdicao = async () => {
    if (!editMotoId.trim() || !editValor.trim()) {
      Alert.alert(t("iot.errorTitle"), t("iot.errorEmptyFields"));
      return;
    }

    try {
      const apiUrl = getPythonApiUrl();
      
      // Se tem ID, atualiza. Se não, cria nova
      if (editLeituraId !== null) {
        const response = await fetch(`${apiUrl}/leituras/${editLeituraId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moto_id: editMotoId.trim(),
            tipo: editTipo,
            valor: editValor.trim(),
          }),
        });

        if (response.ok) {
          Alert.alert(t("iot.successTitle"), "Leitura atualizada com sucesso!");
          cancelarEdicao();
          carregarDados();
        } else {
          throw new Error("Erro ao atualizar leitura");
        }
      } else {
        // Criar nova leitura
        const response = await fetch(`${apiUrl}/leituras`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moto_id: editMotoId.trim(),
            tipo: editTipo,
            valor: editValor.trim(),
          }),
        });

        if (response.ok) {
          Alert.alert(t("iot.successTitle"), "Leitura criada com sucesso!");
          cancelarEdicao();
          carregarDados();
        } else {
          throw new Error("Erro ao criar leitura");
        }
      }
    } catch (error) {
      Alert.alert(t("iot.errorTitle"), "Erro ao salvar leitura");
    }
  };

  const deletarLeitura = (leituraId: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente excluir esta leitura?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const apiUrl = getPythonApiUrl();
              const response = await fetch(`${apiUrl}/leituras/${leituraId}`, {
                method: "DELETE",
              });

              if (response.ok) {
                Alert.alert(t("iot.successTitle"), "Leitura excluída com sucesso!");
                carregarDados();
              } else {
                throw new Error("Erro ao excluir leitura");
              }
            } catch (error) {
              Alert.alert(t("iot.errorTitle"), "Erro ao excluir leitura");
            }
          },
        },
      ]
    );
  };

  const formatarData = (dataStr: string) => {
    try {
      const data = new Date(dataStr);
      return data.toLocaleString("pt-BR");
    } catch {
      return dataStr;
    }
  };

  const obterIconeTipo = (tipo: string) => {
    switch (tipo) {
      case "estado":
      case "moto":
        return <Activity size={20} color={colors.primary} />;
      case "temperatura":
        return <Thermometer size={20} color="#FF6B6B" />;
      case "gps":
        return <MapPin size={20} color="#4ECDC4" />;
      default:
        return <Eye size={20} color={colors.primary} />;
    }
  };

  const obterCorEstado = (estado?: string) => {
    if (!estado) return colors.textSecondary;
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes("em uso") || estadoLower.includes("uso")) return "#4ECDC4";
    if (estadoLower.includes("parada") || estadoLower.includes("disponível")) return "#95E1D3";
    if (estadoLower.includes("manutenção") || estadoLower.includes("manutencao")) return "#FF6B6B";
    return colors.textSecondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: colors.primary }]}>
          {t("iot.title")}
        </Text>
        <TouchableOpacity onPress={onRefresh} disabled={loading}>
          <RefreshCw
            size={24}
            color={colors.primary}
            style={loading && styles.rotating}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "dashboard" && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setActiveTab("dashboard")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "dashboard" ? colors.primary : colors.textSecondary },
            ]}
          >
            {t("iot.dashboard")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "leituras" && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setActiveTab("leituras")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "leituras" ? colors.primary : colors.textSecondary },
            ]}
          >
            {t("iot.readings")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "teste" && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setActiveTab("teste")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "teste" ? colors.primary : colors.textSecondary },
            ]}
          >
            {t("iot.test")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing && (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        )}

        {/* Tab Dashboard */}
        {activeTab === "dashboard" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("iot.motosStatus")}
            </Text>
            {motos.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t("iot.noMotos")}
                </Text>
              </View>
            ) : (
              motos.map((moto) => {
                const motoEditandoEstado = editandoLeitura === `${moto.moto_id}-estado`;
                const motoEditandoTemp = editandoLeitura === `${moto.moto_id}-temperatura`;
                const motoEditandoGps = editandoLeitura === `${moto.moto_id}-gps`;
                const qualquerEdicao = motoEditandoEstado || motoEditandoTemp || motoEditandoGps;
                return (
                  <View
                    key={moto.moto_id}
                    style={[styles.motoCard, { backgroundColor: colors.surface }]}
                  >
                    {qualquerEdicao ? (
                      <View>
                        <Text style={[styles.label, { color: colors.text }]}>
                          ID da Moto
                        </Text>
                        <TextInput
                          style={[
                            styles.editInput,
                            { backgroundColor: colors.background, color: colors.text },
                          ]}
                          placeholder="ID da Moto"
                          placeholderTextColor={colors.textSecondary}
                          value={editMotoId}
                          onChangeText={setEditMotoId}
                        />

                        <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>
                          Tipo de Leitura
                        </Text>
                        <View style={styles.typeButtons}>
                          {(["estado", "temperatura", "gps", "moto"] as const).map((tipo) => (
                            <TouchableOpacity
                              key={tipo}
                              style={[
                                styles.typeButton,
                                editTipo === tipo && { backgroundColor: colors.primary },
                              ]}
                              onPress={() => setEditTipo(tipo)}
                            >
                              <Text
                                style={[
                                  styles.typeButtonText,
                                  {
                                    color: editTipo === tipo ? "#fff" : colors.text,
                                  },
                                ]}
                              >
                                {tipo}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>
                          Valor
                        </Text>
                        <TextInput
                          style={[
                            styles.editInput,
                            { backgroundColor: colors.background, color: colors.text },
                          ]}
                          placeholder={
                            editTipo === "estado" ? "Ex: em uso, parada" :
                            editTipo === "temperatura" ? "Ex: 25.5 ºC" :
                            editTipo === "gps" ? "Ex: -23.55, -46.63" :
                            "Ex: detectada"
                          }
                          placeholderTextColor={colors.textSecondary}
                          value={editValor}
                          onChangeText={setEditValor}
                          multiline
                        />

                        <View style={styles.editButtons}>
                          <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: colors.primary }]}
                            onPress={salvarEdicao}
                          >
                            <Text style={styles.editButtonText}>Salvar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editButton, { backgroundColor: colors.textSecondary }]}
                            onPress={cancelarEdicao}
                          >
                            <Text style={styles.editButtonText}>Cancelar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <>
                        <View style={styles.motoHeader}>
                          <Text style={[styles.motoId, { color: colors.primary }]}>
                            {moto.moto_id}
                          </Text>
                          <View style={styles.motoHeaderRight}>
                            {moto.estado && (
                              <View
                                style={[
                                  styles.estadoBadge,
                                  { backgroundColor: obterCorEstado(moto.estado) },
                                ]}
                              >
                                <Text style={styles.estadoText}>{moto.estado}</Text>
                              </View>
                            )}
                            <TouchableOpacity
                              onPress={() => iniciarEdicaoMoto(moto.moto_id, "estado", moto.estado || "")}
                              style={styles.actionButton}
                            >
                              <Edit size={18} color={colors.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.motoInfo}>
                          {moto.temperatura && (
                            <View style={styles.infoRow}>
                              <Thermometer size={16} color="#FF6B6B" />
                              <Text style={[styles.infoText, { color: colors.text }]}>
                                {moto.temperatura}
                              </Text>
                              <TouchableOpacity
                                onPress={() => iniciarEdicaoMoto(moto.moto_id, "temperatura", moto.temperatura || "")}
                                style={styles.actionButton}
                              >
                                <Edit size={14} color={colors.primary} />
                              </TouchableOpacity>
                            </View>
                          )}
                          {moto.gps && (
                            <View style={styles.infoRow}>
                              <MapPin size={16} color="#4ECDC4" />
                              <Text style={[styles.infoText, { color: colors.text }]}>
                                {moto.gps}
                              </Text>
                              <TouchableOpacity
                                onPress={() => iniciarEdicaoMoto(moto.moto_id, "gps", moto.gps || "")}
                                style={styles.actionButton}
                              >
                                <Edit size={14} color={colors.primary} />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        {moto.ultima_atualizacao && (
                          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                            {t("iot.lastUpdate")}: {formatarData(moto.ultima_atualizacao)}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Tab Leituras */}
        {activeTab === "leituras" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("iot.readingsHistory")}
            </Text>

            {/* Filtros */}
            <View style={styles.filters}>
              <TextInput
                style={[
                  styles.filterInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                placeholder={t("iot.filterMoto")}
                placeholderTextColor={colors.textSecondary}
                value={filtroMoto}
                onChangeText={setFiltroMoto}
              />
              <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: colors.primary }]}
                onPress={carregarDados}
              >
                <Text style={styles.filterButtonText}>{t("common.search")}</Text>
              </TouchableOpacity>
            </View>

            {leituras.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t("iot.noReadings")}
                </Text>
              </View>
            ) : (
              leituras.map((leitura) => (
                <View
                  key={leitura.id}
                  style={[styles.leituraCard, { backgroundColor: colors.surface }]}
                >
                  {editandoLeitura === leitura.id ? (
                    <View>
                      <TextInput
                        style={[
                          styles.editInput,
                          { backgroundColor: colors.background, color: colors.text },
                        ]}
                        placeholder="ID da Moto"
                        placeholderTextColor={colors.textSecondary}
                        value={editMotoId}
                        onChangeText={setEditMotoId}
                      />
                      <View style={styles.typeButtons}>
                        {(["estado", "temperatura", "gps", "moto"] as const).map((tipo) => (
                          <TouchableOpacity
                            key={tipo}
                            style={[
                              styles.typeButton,
                              editTipo === tipo && { backgroundColor: colors.primary },
                            ]}
                            onPress={() => setEditTipo(tipo)}
                          >
                            <Text
                              style={[
                                styles.typeButtonText,
                                {
                                  color: editTipo === tipo ? "#fff" : colors.text,
                                },
                              ]}
                            >
                              {tipo}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TextInput
                        style={[
                          styles.editInput,
                          { backgroundColor: colors.background, color: colors.text },
                        ]}
                        placeholder="Valor"
                        placeholderTextColor={colors.textSecondary}
                        value={editValor}
                        onChangeText={setEditValor}
                        multiline
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity
                          style={[styles.editButton, { backgroundColor: colors.primary }]}
                          onPress={salvarEdicao}
                        >
                          <Text style={styles.editButtonText}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.editButton, { backgroundColor: colors.textSecondary }]}
                          onPress={cancelarEdicao}
                        >
                          <Text style={styles.editButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.leituraHeader}>
                        <View style={styles.leituraHeaderLeft}>
                          {obterIconeTipo(leitura.tipo)}
                          <Text style={[styles.leituraTipo, { color: colors.primary }]}>
                            {leitura.tipo.toUpperCase()}
                          </Text>
                          <Text style={[styles.leituraMoto, { color: colors.textSecondary }]}>
                            {leitura.moto_id}
                          </Text>
                        </View>
                        <View style={styles.leituraActions}>
                          <TouchableOpacity
                            onPress={() => iniciarEdicao(leitura)}
                            style={styles.actionButton}
                          >
                            <Edit size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deletarLeitura(leitura.id)}
                            style={styles.actionButton}
                          >
                            <Trash2 size={18} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={[styles.leituraValor, { color: colors.text }]}>
                        {leitura.valor}
                      </Text>
                      <Text style={[styles.leituraTimestamp, { color: colors.textSecondary }]}>
                        {formatarData(leitura.timestamp)}
                      </Text>
                    </>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab Teste */}
        {activeTab === "teste" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("iot.sendTest")}
            </Text>

            <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("iot.motoId")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                placeholder="Ex: MOT-01"
                placeholderTextColor={colors.textSecondary}
                value={motoId}
                onChangeText={setMotoId}
              />

              <Text style={[styles.label, { color: colors.text }]}>
                {t("iot.readingType")}
              </Text>
              <View style={styles.typeButtons}>
                {(["estado", "temperatura", "gps", "moto"] as const).map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.typeButton,
                      tipoLeitura === tipo && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setTipoLeitura(tipo)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color:
                            tipoLeitura === tipo ? "#fff" : colors.text,
                        },
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>
                {t("iot.value")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                placeholder={t("iot.valuePlaceholder")}
                placeholderTextColor={colors.textSecondary}
                value={valorLeitura}
                onChangeText={setValorLeitura}
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: colors.primary },
                  enviando && styles.sendButtonDisabled,
                ]}
                onPress={enviarLeitura}
                disabled={enviando}
              >
                {enviando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Send size={20} color="#fff" />
                    <Text style={styles.sendButtonText}>{t("iot.send")}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 8,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loader: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  motoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  motoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  motoHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  motoId: {
    fontSize: 18,
    fontWeight: "bold",
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  motoInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  leituraCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leituraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  leituraHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  leituraActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  leituraTipo: {
    fontSize: 14,
    fontWeight: "600",
  },
  leituraMoto: {
    fontSize: 12,
    marginLeft: "auto",
  },
  leituraValor: {
    fontSize: 16,
    marginBottom: 4,
  },
  leituraTimestamp: {
    fontSize: 12,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 4,
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  rotating: {
    transform: [{ rotate: "180deg" }],
  },
  editInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  editButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

