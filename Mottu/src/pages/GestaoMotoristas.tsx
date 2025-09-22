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

const API_BASE_URL = "http://10.0.2.2:8080/api";

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
        Alert.alert("Erro", "Não foi possível carregar os motoristas");
      }
    } catch (error) {
      console.error("Erro ao carregar motoristas:", error);
      Alert.alert("Erro", "Erro de conexão com a API");
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
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
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
          "Sucesso",
          motoristaEditando ? "Motorista atualizado!" : "Motorista cadastrado!"
        );
        setModalCadastroVisivel(false);
        limparFormulario();
        carregarMotoristas();
      } else {
        Alert.alert("Erro", "Não foi possível salvar o motorista");
      }
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);
      Alert.alert("Erro", "Erro de conexão com a API");
    } finally {
      setLoading(false);
    }
  };

  const excluirMotorista = async (id: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente excluir este motorista?",
      [
        { text: "Cancelar", style: "cancel" },
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
                Alert.alert("Sucesso", "Motorista excluído com sucesso!");
                carregarMotoristas();
              } else {
                Alert.alert("Erro", "Não foi possível excluir o motorista");
              }
            } catch (error) {
              console.error("Erro ao excluir motorista:", error);
              Alert.alert("Erro", "Erro de conexão com a API");
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
          Email: {item.email}
        </Text>
        <Text style={[styles.descricaoCartao, { color: colors.text }]}>
          CNH: {item.cnh}
        </Text>
        <Text style={[styles.descricaoCartao, { color: colors.text }]}>
          Status: {item.status}
        </Text>
        {item.moto && (
          <Text style={[styles.descricaoCartao, { color: colors.text }]}>
            Moto: {item.moto.name} ({item.moto.marca})
            {item.moto.status && ` - Status: ${item.moto.status}`}
          </Text>
        )}
      </View>
      <View style={styles.botoesAcao}>
        <TouchableOpacity
          style={[styles.botaoEditar, { backgroundColor: colors.primary }]}
          onPress={() => abrirModalEdicao(item)}
        >
          <Text style={styles.textoBotaoAcao}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botaoExcluir, { backgroundColor: colors.error }]}
          onPress={() => excluirMotorista(item.id)}
        >
          <Text style={styles.textoBotaoAcao}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.titulo, { color: colors.primary }]}>
        Gestão de Motoristas
      </Text>

      <TouchableOpacity
        style={[styles.botaoCadastrar, { backgroundColor: colors.success }]}
        onPress={abrirModalCadastro}
      >
        <Text style={styles.textoBotaoCadastrar}>Cadastrar Novo Motorista</Text>
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
          Ver Todos os Motoristas
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
            Motoristas Cadastrados
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
                  Nenhum motorista cadastrado.
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
            <Text style={styles.textoBotaoCadastrar}>Fechar</Text>
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
            {motoristaEditando ? "Editar Motorista" : "Cadastrar Motorista"}
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
            placeholder="Nome completo"
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
            placeholder="CPF"
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
            placeholder="Telefone"
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
            placeholder="Email"
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
            placeholder="CNH"
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
            placeholder="Endereço"
            placeholderTextColor={colors.textSecondary}
            value={endereco}
            onChangeText={setEndereco}
            multiline
          />

          <Text style={[styles.label, { color: colors.primary }]}>Status:</Text>
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
              <Picker.Item label="Ativo" value="ativo" />
              <Picker.Item label="Inativo" value="inativo" />
              <Picker.Item label="Suspenso" value="suspenso" />
            </Picker>
          </View>

          <Text style={[styles.label, { color: colors.primary }]}>
            Moto (opcional):
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
              <Picker.Item label="Nenhuma moto selecionada" value={null} />
              {motoristaEditando &&
                motoristaEditando.moto &&
                !motos.find((m) => m.id === motoristaEditando.moto?.id) && (
                  <Picker.Item
                    key={`current-${motoristaEditando.moto.id}`}
                    label={`${motoristaEditando.moto.name} (${motoristaEditando.moto.marca}) - [EXCLUÍDA]`}
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
                  {motoristaEditando ? "Atualizar" : "Cadastrar"}
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
              <Text style={styles.textoBotaoCadastrar}>Cancelar</Text>
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
