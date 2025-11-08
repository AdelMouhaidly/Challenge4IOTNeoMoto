import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { useNotification } from "../contexts/NotificationContext";
import { getJavaApiUrl } from "../config/api";

export type MotoStatus = "parada" | "em uso" | "aguardando";

export type Moto = {
  id: number;
  name: string;
  x: number;
  y: number;
  status: MotoStatus;
  marca: string;
  configuracoes: string;
};

const API_BASE_URL = getJavaApiUrl();

export default function CadastroDeMotos() {
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [configuracoes, setConfiguracoes] = useState("");
  const [motos, setMotos] = useState<Moto[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalEdicaoVisivel, setModalEdicaoVisivel] = useState(false);
  const [motoEditando, setMotoEditando] = useState<Moto | null>(null);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const { t } = useLocalization();
  const { sendLocalNotification } = useNotification();

  useEffect(() => {
    carregarMotos();
  }, []);

  const carregarMotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/motos`);
      if (response.ok) {
        const data = await response.json();
        setMotos(data);
      } else {
        Alert.alert(t("bikes.errorTitle"), t("bikes.errorLoad"));
      }
    } catch (error) {
      console.error("Erro ao carregar motos:", error);
      Alert.alert(t("bikes.errorTitle"), t("bikes.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const cadastrarMoto = async () => {
    if (!nome || !marca || !configuracoes) {
      Alert.alert(t("bikes.errorTitle"), t("bikes.errorEmptyFields"));
      return;
    }

    setLoading(true);
    try {
      const novaMoto = {
        name: nome,
        marca,
        configuracoes,
        status: "parada",
        x: Math.random() * 100,
        y: Math.random() * 100,
      };

      const response = await fetch(`${API_BASE_URL}/motos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novaMoto),
      });

      if (response.ok) {
        const motoSalva = await response.json();
        setMotos((prev) => [...prev, motoSalva]);
        setNome("");
        setMarca("");
        setConfiguracoes("");
        Alert.alert(t("common.success"), t("bikes.successCreate"));
        await sendLocalNotification(
          t("notifications.newBike"),
          `${motoSalva.name} ${t("notifications.newBikeBody")}`
        );
      } else {
        const errorData = await response.text();
        console.error("Erro da API:", errorData);
        Alert.alert(t("bikes.errorTitle"), t("bikes.errorCreate"));
      }
    } catch (error) {
      console.error("Erro ao cadastrar moto:", error);
      Alert.alert(t("bikes.errorTitle"), t("bikes.errorCreate"));

      const motoLocal: Moto = {
        id: Date.now(),
        name: nome,
        x: Math.random() * 100,
        y: Math.random() * 100,
        status: "parada",
        marca,
        configuracoes,
      };
      setMotos((prev) => [...prev, motoLocal]);
      setNome("");
      setMarca("");
      setConfiguracoes("");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicao = (moto: Moto) => {
    setMotoEditando(moto);
    setNome(moto.name);
    setMarca(moto.marca);
    setConfiguracoes(moto.configuracoes);
    setModalEdicaoVisivel(true);
  };

  const limparFormulario = () => {
    setNome("");
    setMarca("");
    setConfiguracoes("");
    setMotoEditando(null);
  };

  const salvarEdicaoMoto = async () => {
    if (!nome || !marca || !configuracoes || !motoEditando) {
      Alert.alert(t("bikes.errorTitle"), t("bikes.errorEmptyFields"));
      return;
    }

    setLoading(true);
    try {
      const motoAtualizada = {
        name: nome,
        marca,
        configuracoes,
        status: motoEditando.status,
        x: motoEditando.x,
        y: motoEditando.y,
      };

      const response = await fetch(`${API_BASE_URL}/motos/${motoEditando.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(motoAtualizada),
      });

      if (response.ok) {
        const motoSalva = await response.json();
        setMotos((prev) =>
          prev.map((moto) => (moto.id === motoEditando.id ? motoSalva : moto))
        );
        setModalEdicaoVisivel(false);
        limparFormulario();
        Alert.alert(t("common.success"), t("bikes.successUpdate"));
        await sendLocalNotification(
          t("notifications.bikeUpdated"),
          `${motoSalva.name} ${t("notifications.bikeUpdatedBody")}`
        );
      } else {
        const errorData = await response.text();
        console.error("Erro da API:", errorData);
        Alert.alert(t("bikes.errorTitle"), t("bikes.errorUpdate"));
      }
    } catch (error) {
      console.error("Erro ao atualizar moto:", error);
      Alert.alert(t("bikes.errorTitle"), t("bikes.errorUpdate"));
    } finally {
      setLoading(false);
    }
  };

  const excluirMoto = async (id: number) => {
    const motoParaExcluir = motos.find((m) => m.id === id);
    const nomeMoto = motoParaExcluir?.name || "Moto";

    Alert.alert(t("bikes.confirmDelete"), t("bikes.confirmDeleteMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            const response = await fetch(`${API_BASE_URL}/motos/${id}`, {
              method: "DELETE",
            });

            if (response.ok) {
              setMotos((prev) => prev.filter((moto) => moto.id !== id));
              Alert.alert(t("common.success"), t("bikes.successDelete"));
              await sendLocalNotification(
                t("notifications.bikeDeleted"),
                `${nomeMoto} ${t("notifications.bikeDeletedBody")}`
              );
            } else {
              Alert.alert(t("bikes.errorTitle"), t("bikes.errorDelete"));
            }
          } catch (error) {
            console.error("Erro ao excluir moto:", error);
            Alert.alert(t("bikes.errorTitle"), t("bikes.errorDelete"));
            setMotos((prev) => prev.filter((moto) => moto.id !== id));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  function renderizarMoto({ item }: { item: Moto }) {
    return (
      <View style={[styles.cartao, { backgroundColor: colors.surface }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.tituloCartao, { color: colors.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.descricaoCartao, { color: colors.text }]}>
            {t("bikes.brand")}: {item.marca} | {t("bikes.status")}: {item.status}
          </Text>
          <Text style={[styles.descricaoCartao, { color: colors.text }]}>
            {t("bikes.settings")}: {item.configuracoes}
          </Text>
          <Text style={[styles.descricaoCartao, { color: colors.text }]}>
            {t("bikes.coordinates")}: x={item.x.toFixed(1)} / y={item.y.toFixed(1)}
          </Text>
        </View>
        <View style={styles.botoesAcao}>
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => abrirModalEdicao(item)}
            disabled={loading}
          >
            <Text style={styles.textoBotaoAcao}>{t("common.edit")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={() => excluirMoto(item.id)}
            disabled={loading}
          >
            <Text style={styles.textoBotaoExcluir}>
              {loading ? "..." : t("common.delete")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.primary }]}>
        {t("bikes.title")}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder={t("bikes.namePlaceholder")}
        placeholderTextColor={colors.textSecondary}
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder={t("bikes.brandPlaceholder")}
        placeholderTextColor={colors.textSecondary}
        value={marca}
        onChangeText={setMarca}
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder={t("bikes.settingsPlaceholder")}
        placeholderTextColor={colors.textSecondary}
        value={configuracoes}
        onChangeText={setConfiguracoes}
      />

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: colors.success }]}
        onPress={cadastrarMoto}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>{t("bikes.addBike")}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.botao,
          {
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: "#228B22",
            marginTop: 10,
          },
        ]}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={[styles.textoBotao, { color: "#228B22" }]}>
          {t("bikes.viewHistory")}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View
          style={[
            styles.containerModal,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.tituloModal, { color: colors.primary }]}>
            {t("bikes.history")}
          </Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#228B22"
              style={{ marginTop: 20 }}
            />
          ) : motos.length === 0 ? (
            <Text
              style={[styles.nenhumaReserva, { color: colors.textSecondary }]}
            >
              {t("bikes.noBikes")}
            </Text>
          ) : (
            <FlatList
              data={motos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderizarMoto}
              ItemSeparatorComponent={() => <View style={styles.separador} />}
            />
          )}
          <TouchableOpacity
            style={[
              styles.botao,
              { backgroundColor: colors.success, marginTop: 20 },
            ]}
            onPress={() => setModalVisivel(false)}
          >
            <Text style={styles.textoBotao}>{t("bikes.close")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={modalEdicaoVisivel}
        animationType="slide"
        onRequestClose={() => {
          setModalEdicaoVisivel(false);
          limparFormulario();
        }}
      >
        <View
          style={[
            styles.containerModal,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.tituloModal, { color: colors.primary }]}>
            {t("bikes.editBike")}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t("bikes.namePlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t("bikes.brandPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={marca}
            onChangeText={setMarca}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t("bikes.settingsPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={configuracoes}
            onChangeText={setConfiguracoes}
          />

          <View style={styles.botoesModal}>
            <TouchableOpacity
              style={[
                styles.botao,
                styles.botaoAtualizar,
                { 
                  flex: 1, 
                  marginRight: 10,
                  backgroundColor: colors.success 
                }
              ]}
              onPress={salvarEdicaoMoto}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotao}>{t("bikes.updateBike")}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botao,
                styles.botaoCancelar,
                { 
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => {
                setModalEdicaoVisivel(false);
                limparFormulario();
              }}
            >
              <Text style={[styles.textoBotaoCancelar, { color: colors.text }]}>
                {t("common.cancel")}
              </Text>
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
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  botao: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  containerModal: {
    flex: 1,
    padding: 20,
  },
  tituloModal: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  nenhumaReserva: {
    textAlign: "center",
    fontSize: 16,
  },
  cartao: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tituloCartao: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  descricaoCartao: {
    fontSize: 14,
  },
  botaoExcluir: {
    backgroundColor: "#FF4C4C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  textoBotaoExcluir: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  separador: {
    height: 10,
  },
  botoesAcao: {
    flexDirection: "column",
  },
  botaoEditar: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 5,
  },
  textoBotaoAcao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  botoesModal: {
    flexDirection: "row",
    marginTop: 20,
  },
  botaoAtualizar: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  botaoCancelar: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textoBotaoCancelar: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
