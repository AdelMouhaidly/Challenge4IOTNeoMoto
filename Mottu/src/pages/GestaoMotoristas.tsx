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
      const motoristaData = {
        nome,
        cpf,
        telefone,
        email,
        cnh,
        endereco,
        status,
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
        const motoristaSalvo = await response.json();

        if (motoSelecionada) {
          await fetch(
            `${API_BASE_URL}/motoristas/${motoristaSalvo.id}/moto/${motoSelecionada}`,
            {
              method: "POST",
            }
          );
        }

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
                Alert.alert("Sucesso", "Motorista excluído!");
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
    <View style={styles.cartao}>
      <View style={{ flex: 1 }}>
        <Text style={styles.tituloCartao}>{item.nome}</Text>
        <Text style={styles.descricaoCartao}>CPF: {item.cpf}</Text>
        <Text style={styles.descricaoCartao}>Email: {item.email}</Text>
        <Text style={styles.descricaoCartao}>CNH: {item.cnh}</Text>
        <Text style={styles.descricaoCartao}>Status: {item.status}</Text>
        {item.moto && (
          <Text style={styles.descricaoCartao}>
            Moto: {item.moto.name} ({item.moto.marca})
          </Text>
        )}
      </View>
      <View style={styles.botoesAcao}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => abrirModalEdicao(item)}
        >
          <Text style={styles.textoBotaoAcao}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoExcluir}
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
        style={styles.botaoCadastrar}
        onPress={abrirModalCadastro}
      >
        <Text style={styles.textoBotaoCadastrar}>Cadastrar Novo Motorista</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.botaoCadastrar,
          { backgroundColor: "#fff", borderWidth: 2, borderColor: "#228B22" },
        ]}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={[styles.textoBotaoCadastrar, { color: "#228B22" }]}>
          Ver Todos os Motoristas
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.containerModal}>
          <Text style={styles.tituloModal}>Motoristas Cadastrados</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#228B22"
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={motoristas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderizarMotorista}
              ItemSeparatorComponent={() => <View style={styles.separador} />}
              ListEmptyComponent={
                <Text style={styles.nenhumItem}>
                  Nenhum motorista cadastrado.
                </Text>
              }
            />
          )}

          <TouchableOpacity
            style={[styles.botaoCadastrar, { marginTop: 20 }]}
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
        <View style={styles.containerModal}>
          <Text style={styles.tituloModal}>
            {motoristaEditando ? "Editar Motorista" : "Cadastrar Motorista"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
          />

          <TextInput
            style={styles.input}
            placeholder="CPF"
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
            editable={!motoristaEditando}
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="CNH"
            value={cnh}
            onChangeText={setCnh}
          />

          <TextInput
            style={styles.input}
            placeholder="Endereço"
            value={endereco}
            onChangeText={setEndereco}
            multiline
          />

          <Text style={styles.label}>Status:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={styles.picker}
            >
              <Picker.Item label="Ativo" value="ativo" />
              <Picker.Item label="Inativo" value="inativo" />
              <Picker.Item label="Suspenso" value="suspenso" />
            </Picker>
          </View>

          <Text style={styles.label}>Moto (opcional):</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={motoSelecionada}
              onValueChange={setMotoSelecionada}
              style={styles.picker}
            >
              <Picker.Item label="Nenhuma moto selecionada" value={null} />
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
              style={[styles.botaoCadastrar, { flex: 1, marginRight: 10 }]}
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
                { flex: 1, backgroundColor: "#666" },
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
    backgroundColor: "#F4FDF4",
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#228B22",
    textAlign: "center",
    marginBottom: 20,
  },
  botaoCadastrar: {
    backgroundColor: "#228B22",
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
    backgroundColor: "#F4FDF4",
    padding: 20,
  },
  tituloModal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#228B22",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: {
    fontSize: 16,
    color: "#228B22",
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  cartao: {
    backgroundColor: "#fff",
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
    color: "#228B22",
    marginBottom: 4,
  },
  descricaoCartao: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
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
  botaoExcluir: {
    backgroundColor: "#FF4C4C",
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
    color: "#666",
    marginTop: 20,
  },
});
