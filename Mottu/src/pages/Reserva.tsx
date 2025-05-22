import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";

import type { MotoReserva } from "../types/index";

const listaMotosDisponiveis: MotoReserva[] = [
  {
    id: "1",
    nome: "Moto Honda 150cc",
    descricao: "Confortável, econômica e ágil para entregas rápidas.",
    precoDiaria: 18,
  },
  {
    id: "2",
    nome: "Moto Yamaha 250cc",
    descricao: "Mais potência para trajetos mais longos e pesados.",
    precoDiaria: 25,
  },
  {
    id: "3",
    nome: "Moto Ducati 1000cc",
    descricao: "Para quem quer mais performance e estilo.",
    precoDiaria: 45,
  },
  {
    id: "4",
    nome: "Moto Honda Biz 110i",
    descricao: "Compacta, ideal para uso urbano e muito econômica.",
    precoDiaria: 15,
  },
  {
    id: "5",
    nome: "Moto Suzuki V-Strom 650",
    descricao: "Perfeita para longas distâncias e terrenos variados.",
    precoDiaria: 35,
  },
  {
    id: "6",
    nome: "Moto Royal Enfield Meteor 350",
    descricao: "Estilo clássico com boa estabilidade e conforto.",
    precoDiaria: 28,
  },
  {
    id: "7",
    nome: "Moto BMW G 310 R",
    descricao: "Tecnologia e design alemão para o dia a dia.",
    precoDiaria: 30,
  },
  {
    id: "8",
    nome: "Moto KTM Duke 390",
    descricao: "Ágil, esportiva e ideal para quem busca adrenalina.",
    precoDiaria: 32,
  },
  {
    id: "9",
    nome: "Moto Harley-Davidson Iron 883",
    descricao: "Custom robusta, ideal para quem busca presença e potência.",
    precoDiaria: 50,
  },
  {
    id: "10",
    nome: "Moto Yamaha Neo 125",
    descricao: "Scooter prática e econômica para deslocamentos urbanos.",
    precoDiaria: 17,
  },
];

export default function TelaReserva() {
  const [motoSelecionada, setMotoSelecionada] = useState<string | null>(null);
  const [reservas, setReservas] = useState<MotoReserva[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);

  function confirmarReserva() {
    if (!motoSelecionada) {
      Alert.alert("Selecione uma moto para reservar.");
      return;
    }

    const moto = listaMotosDisponiveis.find((m) => m.id === motoSelecionada);

    if (moto) {
      const jaReservada = reservas.some((m) => m.id === moto.id);

      if (jaReservada) {
        Alert.alert("Você já reservou essa moto.");
      } else {
        setReservas([...reservas, moto]);
        Alert.alert(
          "Reserva realizada!",
          `Você reservou a ${moto.nome} por R$${moto.precoDiaria}/dia.`
        );
      }
    }
  }

  function excluirReserva(id: string) {
    Alert.alert(
      "Excluir Reserva",
      "Tem certeza que deseja excluir esta reserva?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setReservas((prev) => prev.filter((reserva) => reserva.id !== id));
          },
        },
      ]
    );
  }

  function renderizarMoto({ item }: { item: MotoReserva }) {
    const selecionada = motoSelecionada === item.id;
    return (
      <TouchableOpacity
        style={[styles.card, selecionada && styles.cardSelecionada]}
        onPress={() => setMotoSelecionada(item.id)}
      >
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <Text style={styles.cardDescription}>{item.descricao}</Text>
        <Text style={styles.preco}>R$ {item.precoDiaria} / dia</Text>
      </TouchableOpacity>
    );
  }

  function renderizarReserva({ item }: { item: MotoReserva }) {
    return (
      <View
        style={[
          styles.card,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDescription}>{item.descricao}</Text>
          <Text style={styles.preco}>R$ {item.precoDiaria} / dia</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => excluirReserva(item.id)}
        >
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reserva de Moto</Text>
      <Text style={styles.description}>
        Escolha a moto que deseja reservar.
      </Text>

      <FlatList
        data={listaMotosDisponiveis}
        keyExtractor={(item) => item.id}
        renderItem={renderizarMoto}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: "#fff",
            borderWidth: 2,
            borderColor: "#228B22",
            marginTop: 20,
          },
        ]}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={[styles.buttonText, { color: "#228B22" }]}>
          Ver Minhas Reservas
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={confirmarReserva}>
        <Text style={styles.buttonText}>Confirmar Reserva</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Minhas Reservas</Text>
          {reservas.length === 0 ? (
            <Text style={styles.semReservas}>Nenhuma reserva realizada.</Text>
          ) : (
            <FlatList
              data={reservas}
              keyExtractor={(item) => item.id}
              renderItem={renderizarReserva}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          <TouchableOpacity
            style={[styles.button, { marginTop: 20 }]}
            onPress={() => setModalVisivel(false)}
          >
            <Text style={styles.buttonText}>Fechar</Text>
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
  content: {
    paddingBottom: 40,
  },
  separator: {
    height: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#228B22",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  cardSelecionada: {
    borderWidth: 2,
    borderColor: "#228B22",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#228B22",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
  preco: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#228B22",
  },
  button: {
    backgroundColor: "#228B22",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F4FDF4",
    padding: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#228B22",
    marginBottom: 20,
    textAlign: "center",
  },
  semReservas: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#FF4C4C",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
