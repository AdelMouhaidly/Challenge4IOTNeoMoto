import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Veiculo {
  id: string; 
  modelo: string;
  placa: string;
  historico: string;
}

export default function DetalhesVeiculo() {
  const [veiculo, setVeiculo] = useState<Veiculo>({
    id: "",
    modelo: "",
    placa: "",
    historico: "",
  });
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    carregarVeiculos();
  }, []);

  async function carregarVeiculos() {
    const json = await AsyncStorage.getItem("veiculos");
    if (json) {
      setVeiculos(JSON.parse(json));
    }
  }

  async function salvarVeiculosStorage(lista: Veiculo[]) {
    await AsyncStorage.setItem("veiculos", JSON.stringify(lista));
  }

  const salvarDados = async () => {
    if (!veiculo.modelo || !veiculo.placa) {
      Alert.alert("Erro", "Modelo e placa são obrigatórios.");
      return;
    }

    let novaLista = [...veiculos];

    if (editando) {
      novaLista = novaLista.map((v) => (v.id === veiculo.id ? veiculo : v));
      Alert.alert("Sucesso", "Veículo editado com sucesso!");
    } else {
      const novoVeiculo = { ...veiculo, id: Date.now().toString() };
      novaLista.push(novoVeiculo);
      Alert.alert("Sucesso", "Veículo adicionado com sucesso!");
    }

    setVeiculos(novaLista);
    await salvarVeiculosStorage(novaLista);

    setVeiculo({ id: "", modelo: "", placa: "", historico: "" });
    setEditando(false);
  };

  const editarVeiculo = (item: Veiculo) => {
    setVeiculo(item);
    setEditando(true);
    setModalVisible(false);
  };

  const deletarVeiculo = (id: string) => {
    Alert.alert("Deletar veículo?", "Deseja deletar este veículo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          const novaLista = veiculos.filter((v) => v.id !== id);
          setVeiculos(novaLista);
          await salvarVeiculosStorage(novaLista);
          if (veiculo.id === id) {
            setVeiculo({
              id: "",
              modelo: "",
              placa: "",
              historico: "",
            });
            setEditando(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.botaoMeusVeiculos}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.textoBotaoMeusVeiculos}>Meus Veículos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Modelo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Honda Civic"
          value={veiculo.modelo}
          onChangeText={(text) => setVeiculo({ ...veiculo, modelo: text })}
        />

        <Text style={styles.label}>Placa</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: ABC-1234"
          value={veiculo.placa}
          onChangeText={(text) =>
            setVeiculo({ ...veiculo, placa: text.toUpperCase() })
          }
          maxLength={8}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Histórico de Manutenção</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Descreva o histórico de manutenção..."
          multiline
          value={veiculo.historico}
          onChangeText={(text) => setVeiculo({ ...veiculo, historico: text })}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarDados}>
          <Text style={styles.textoBotaoSalvar}>
            {editando ? "Salvar Alterações" : "Salvar Moto"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Veículos Salvos</Text>
            {veiculos.length === 0 ? (
              <Text
                style={{
                  textAlign: "center",
                  marginVertical: 20,
                  color: "#666",
                }}
              >
                Nenhum veículo salvo.
              </Text>
            ) : (
              <FlatList
                data={veiculos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.itemVeiculo}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemModelo}>{item.modelo}</Text>
                      <Text style={styles.itemPlaca}>{item.placa}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.botaoEditar}
                      onPress={() => editarVeiculo(item)}
                    >
                      <Text style={styles.textoBotaoEditar}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.botaoDeletar}
                      onPress={() => deletarVeiculo(item.id)}
                    >
                      <Text style={styles.textoBotaoDeletar}>Deletar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.botaoFecharModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoBotaoFecharModal}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: "#F0FFF0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomColor: "#A0D6A0",
    borderBottomWidth: 1,
  },
  botaoMeusVeiculos: {
    backgroundColor: "#28A745",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotaoMeusVeiculos: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: "#F0FFF0",
  },
  label: {
    fontSize: 16,
    color: "#228B22",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#A0D6A0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#222",
    marginBottom: 18,
  },
  botaoSalvar: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotaoSalvar: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalFundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#F0FFF0",
    borderRadius: 14,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#228B22",
    marginBottom: 12,
    textAlign: "center",
  },
  itemVeiculo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d4f0d4",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemModelo: {
    fontWeight: "700",
    fontSize: 16,
    color: "#155724",
  },
  itemPlaca: {
    fontSize: 14,
    color: "#155724",
  },
  botaoEditar: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
  },
  textoBotaoEditar: {
    color: "#fff",
    fontWeight: "600",
  },
  botaoDeletar: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  textoBotaoDeletar: {
    color: "#fff",
    fontWeight: "600",
  },
  botaoFecharModal: {
    backgroundColor: "#28A745",
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBotaoFecharModal: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
