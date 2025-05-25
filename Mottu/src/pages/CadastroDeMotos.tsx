import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";

export type MotoStatus = "parada" | "em uso" | "aguardando";

export type Moto = {
  id: string;
  name: string;
  x: number;
  y: number;
  status: MotoStatus;
  marca: string;
  configuracoes: string;
};

export default function TelaCadastroMoto() {
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [configuracoes, setConfiguracoes] = useState("");
  const [motos, setMotos] = useState<Moto[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);

  const gerarId = () => `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  function cadastrarMoto() {
    if (!nome || !marca || !configuracoes) {
      Alert.alert("Preencha todos os campos!");
      return;
    }

    const novaMoto: Moto = {
      id: gerarId(),
      name: nome,
      x: Math.random() * 100,
      y: Math.random() * 100,
      status: "parada",
      marca,
      configuracoes,
    };

    setMotos((prev) => [...prev, novaMoto]);
    setNome("");
    setMarca("");
    setConfiguracoes("");
    Alert.alert("Moto cadastrada com sucesso!");
  }

  function excluirMoto(id: string) {
    Alert.alert("Excluir", "Deseja excluir essa moto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () =>
          setMotos((prev) => prev.filter((moto) => moto.id !== id)),
      },
    ]);
  }

  function renderizarMoto({ item }: { item: Moto }) {
    return (
      <View style={styles.cartao}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tituloCartao}>{item.name}</Text>
          <Text style={styles.descricaoCartao}>
            Marca: {item.marca} | Status: {item.status}
          </Text>
          <Text style={styles.descricaoCartao}>
            Configurações: {item.configuracoes}
          </Text>
          <Text style={styles.descricaoCartao}>
            Coordenadas: x={item.x.toFixed(1)} / y={item.y.toFixed(1)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={() => excluirMoto(item.id)}
        >
          <Text style={styles.textoBotaoExcluir}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Moto</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da moto"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Marca"
        value={marca}
        onChangeText={setMarca}
      />
      <TextInput
        style={styles.input}
        placeholder="Configurações"
        value={configuracoes}
        onChangeText={setConfiguracoes}
      />

      <TouchableOpacity style={styles.botao} onPress={cadastrarMoto}>
        <Text style={styles.textoBotao}>Cadastrar Moto</Text>
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
          Ver Histórico
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.containerModal}>
          <Text style={styles.tituloModal}>Histórico de Motos Cadastradas</Text>
          {motos.length === 0 ? (
            <Text style={styles.nenhumaReserva}>Nenhuma moto cadastrada.</Text>
          ) : (
            <FlatList
              data={motos}
              keyExtractor={(item) => item.id}
              renderItem={renderizarMoto}
              ItemSeparatorComponent={() => <View style={styles.separador} />}
            />
          )}
          <TouchableOpacity
            style={[styles.botao, { marginTop: 20 }]}
            onPress={() => setModalVisivel(false)}
          >
            <Text style={styles.textoBotao}>Fechar</Text>
          </TouchableOpacity>
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
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  botao: {
    backgroundColor: "#228B22",
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
  nenhumaReserva: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
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
});
