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
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";
import { useNotification } from "../contexts/NotificationContext";
import { getJavaApiUrl } from "../config/api";

export type Motorista = {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cnh: string;
  endereco: string;
  status: string;
  moto?: {
    id: number;
    name: string;
    marca: string;
    configuracoes?: string;
    status?: string;
  };
};

export type Moto = {
  id: number;
  name: string;
  marca: string;
  configuracoes: string;
  status: string;
  x: number;
  y: number;
};

const API_BASE_URL = getJavaApiUrl();

export default function GestaoMotoristas() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [motos, setMotos] = useState<Moto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalCadastroVisivel, setModalCadastroVisivel] = useState(false);
  const [motoristaEditando, setMotoristaEditando] = useState<Motorista | null>(
    null
  );
  const { colors } = useTheme();
  const { t } = useLocalization();
  const { sendLocalNotification } = useNotification();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cnh, setCnh] = useState("");
  const [endereco, setEndereco] = useState("");
  const [status, setStatus] = useState("ativo");
  const [motoSelecionada, setMotoSelecionada] = useState<number | null>(null);

  useEffect(() => {
    carregarMotoristas();
    carregarMotos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      carregarMotos();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const carregarMotoristas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/motoristas`);
      if (response.ok) {
        const data = await response.json();
        setMotoristas(data);
      } else {
        Alert.alert(t("drivers.errorTitle"), t("drivers.errorLoad"));
      }
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);
      Alert.alert(t("drivers.errorTitle"), t("drivers.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const carregarMotos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/motos`);
      if (response.ok) {
        const data = await response.json();
        setMotos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar motos:", error);
    }
  };

  const limparFormulario = () => {
    setNome("");
    setCpf("");
    setTelefone("");
    setEmail("");
    setCnh("");
    setEndereco("");
    setStatus("ativo");
    setMotoSelecionada(null);
    setMotoristaEditando(null);
  };

  const abrirModalCadastro = () => {
    limparFormulario();
    carregarMotos();
    setModalCadastroVisivel(true);
  };

  const abrirModalEdicao = (motorista: Motorista) => {
    setMotoristaEditando(motorista);
    setNome(motorista.nome);
    setCpf(motorista.cpf);
    setTelefone(motorista.telefone);
    setEmail(motorista.email);
    setCnh(motorista.cnh);
    setEndereco(motorista.endereco);
    setStatus(motorista.status);
    setMotoSelecionada(motorista.moto?.id || null);
    setModalCadastroVisivel(true);
  };

  const salvarMotorista = async () => {
    if (!nome || !cpf || !telefone || !email || !cnh || !endereco) {
      Alert.alert(t("drivers.errorTitle"), t("drivers.errorEmptyFields"));
      return;
    }

    setLoading(true);
    try {
      let motoCompleta = null;
      if (motoSelecionada) {
        const motoEncontrada = motos.find(
          (moto) => moto.id === motoSelecionada
        );
        if (motoEncontrada) {
          motoCompleta = {
            id: motoEncontrada.id,
            name: motoEncontrada.name,
            marca: motoEncontrada.marca,
            configuracoes: motoEncontrada.configuracoes,
            status: motoEncontrada.status,
          };
        }
      }

      const motoristaData = {
        nome,
        cpf,
        telefone,
        email,
        cnh,
        endereco,
        status,
        moto: motoCompleta,
      };

      let response;
      if (motoristaEditando) {
        response = await fetch(
          `${API_BASE_URL}/motoristas/${motoristaEditando.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(motoristaData),
          }
        );
      } else {
        response = await fetch(`${API_BASE_URL}/motoristas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(motoristaData),
        });
      }

      if (response.ok) {
        Alert.alert(
          t("common.success"),
          motoristaEditando ? t("drivers.successUpdate") : t("drivers.successCreate")
        );
        await sendLocalNotification(
          motoristaEditando ? t("notifications.driverUpdated") : t("notifications.newDriver"),
          `${nome} ${motoristaEditando ? t("notifications.driverUpdatedBody") : t("notifications.newDriverBody")}`
        );
        setModalCadastroVisivel(false);
        limparFormulario();
        carregarMotoristas();
      } else {
        Alert.alert(t("drivers.errorTitle"), motorista ? t("drivers.errorUpdate") : t("drivers.errorCreate"));
      }
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);
      Alert.alert(t("drivers.errorTitle"), t("drivers.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const excluirMotorista = async (id: number) => {
    const motoristaParaExcluir = motoristas.find((m) => m.id === id);
    const nomeMotorista = motoristaParaExcluir?.nome || "Motorista";
    
    Alert.alert(
      t("drivers.confirmDelete"),
      t("drivers.confirmDeleteMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${API_BASE_URL}/motoristas/${id}`, {
                method: "DELETE",
              });

              if (response.ok) {
                Alert.alert(t("common.success"), t("drivers.successDelete"));
                await sendLocalNotification(
                  t("notifications.driverDeleted"),
                  `${nomeMotorista} ${t("notifications.driverDeletedBody")}`
                );
                carregarMotoristas();
              } else {
                Alert.alert(t("drivers.errorTitle"), t("drivers.errorDelete"));
              }
            } catch (error) {
              console.error("Erro ao excluir motorista:", error);
              Alert.alert(t("drivers.errorTitle"), t("drivers.errorLoad"));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderizarMotorista = ({ item }: { item: Motorista }) => (
    <View style={[styles.cartao, { backgroundColor: colors.surface }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.tituloCartao, { color: colors.primary }]}>
          {item.nome}
        </Text>
        <Text style={[styles.descricaoCartao, { color: colors.text }]}>
          CPF: {item.cpf}
        </Text>
        <Text style={[styles.descricaoCartao, { color: colors.text }]}>
          {t("drivers.email")}: {item.email}
        </Text>
        <Text style={[styles.descricaoCartao, { color: colors.text }]}>
          {t("drivers.cnh")}: {item.cnh}
        </Text>
        <Text style={[styles.descricaoCartao, { color: colors.text }]}>
          {t("drivers.status")}: {item.status}
        </Text>
        {item.moto && (
          <Text style={[styles.descricaoCartao, { color: colors.text }]}>
            {t("drivers.bike")}: {item.moto.name} ({item.moto.marca})
            {item.moto.status && ` - ${t("drivers.status")}: ${item.moto.status}`}
          </Text>
        )}
      </View>
      <View style={styles.botoesAcao}>
        <TouchableOpacity
          style={[styles.botaoEditar, { backgroundColor: colors.primary }]}
          onPress={() => abrirModalEdicao(item)}
        >
          <Text style={styles.textoBotaoAcao}>{t("common.edit")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botaoExcluir, { backgroundColor: colors.error }]}
          onPress={() => excluirMotorista(item.id)}
        >
          <Text style={styles.textoBotaoAcao}>{t("common.delete")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.primary }]}>
        {t("drivers.title")}
      </Text>

      <TouchableOpacity
        style={[styles.botaoCadastrar, { backgroundColor: colors.success }]}
        onPress={abrirModalCadastro}
      >
        <Text style={styles.textoBotaoCadastrar}>{t("drivers.addDriver")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.botaoCadastrar,
          {
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderColor: colors.success,
          },
        ]}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={[styles.textoBotaoCadastrar, { color: colors.success }]}>
          {t("drivers.viewAll")}
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
            {t("drivers.registeredDrivers")}
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={motoristas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderizarMotorista}
              ItemSeparatorComponent={() => <View style={styles.separador} />}
              ListEmptyComponent={
                <Text
                  style={[styles.nenhumItem, { color: colors.textSecondary }]}
                >
                  {t("drivers.noDrivers")}
                </Text>
              }
            />
          )}

          <TouchableOpacity
            style={[
              styles.botaoCadastrar,
              { marginTop: 20, backgroundColor: colors.success },
            ]}
            onPress={() => setModalVisivel(false)}
          >
            <Text style={styles.textoBotaoCadastrar}>{t("common.close")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        visible={modalCadastroVisivel}
        animationType="slide"
        onRequestClose={() => setModalCadastroVisivel(false)}
      >
        <View
          style={[
            styles.containerModal,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.tituloModal, { color: colors.primary }]}>
            {motoristaEditando ? t("drivers.editDriver") : t("drivers.addDriver")}
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
            placeholder={t("drivers.namePlaceholder")}
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
            placeholder={t("drivers.cpfPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
            editable={!motoristaEditando}
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
            placeholder={t("drivers.phonePlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
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
            placeholder={t("drivers.emailPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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
            placeholder={t("drivers.cnhPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={cnh}
            onChangeText={setCnh}
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
            placeholder={t("drivers.addressPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={endereco}
            onChangeText={setEndereco}
            multiline
          />

          <Text style={[styles.label, { color: colors.primary }]}>{t("drivers.status")}:</Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label={t("drivers.active")} value="ativo" />
              <Picker.Item label={t("drivers.inactive")} value="inativo" />
              <Picker.Item label={t("drivers.suspended")} value="suspenso" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.primary }]}>
            {t("drivers.bikeOptional")}:
          </Text>
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Picker
              selectedValue={motoSelecionada}
              onValueChange={setMotoSelecionada}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label={t("drivers.noBikeSelected")} value={null} />
              {motoristaEditando &&
                motoristaEditando.moto &&
                !motos.find((m) => m.id === motoristaEditando.moto?.id) && (
                  <Picker.Item
                    key={`current-${motoristaEditando.moto.id}`}
                    label={`${motoristaEditando.moto.name} (${motoristaEditando.moto.marca}) - [${t("drivers.deleted")}]`}
                    value={motoristaEditando.moto.id}
                  />
                )}
              {motos.map((moto) => (
                <Picker.Item
                  key={moto.id}
                  label={`${moto.name} (${moto.marca})`}
                  value={moto.id}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.botoesModal}>
            <TouchableOpacity
              style={[
                styles.botaoCadastrar,
                { flex: 1, marginRight: 10, backgroundColor: colors.success },
              ]}
              onPress={salvarMotorista}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textoBotaoCadastrar}>
                  {motoristaEditando ? t("common.update") : t("common.add")}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoCadastrar,
                { flex: 1, backgroundColor: colors.textSecondary },
              ]}
              onPress={() => {
                setModalCadastroVisivel(false);
                limparFormulario();
              }}
            >
              <Text style={styles.textoBotaoCadastrar}>{t("common.cancel")}</Text>
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
  botaoCadastrar: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  textoBotaoCadastrar: {
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
  input: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },
  pickerContainer: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  picker: {
    height: 50,
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
    marginBottom: 2,
  },
  botoesAcao: {
    flexDirection: "column",
  },
  botaoEditar: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 5,
  },
  botaoExcluir: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  separador: {
    height: 10,
  },
  nenhumItem: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
});
