import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";

const larguraTela = Dimensions.get("window").width;

const servicos = [
  {
    titulo: "Mapa Digital do Pátio",
    descricao:
      "Visualize em tempo real a ocupação do pátio, status das motos e movimentações para um controle eficiente.",
    image: require("../assets/mapa-digital.jpg"),
  },
  {
    titulo: "Cadastro de Motos",
    descricao:
      "Registre novas motos no sistema com informações completas para facilitar a gestão da frota.",
    image: require("../assets/cadastro.png"),
  },
  {
  titulo: "Alerta de Motos",
  descricao:
    "Monitore e visualize rapidamente motos desaparecidas ou em manutenção. Acompanhe ocorrências e consulte localizações em tempo real.",
  image: require("../assets/reserva.png"),
  },
  {
    titulo: "Detector de Motos",
    descricao:
      "Detecte motos em imagens com precisão e acompanhe seu histórico para manter total controle e segurança.",
    image: require("../assets/busca-e-filtro.png"),
  },
];

export default function Inicio() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudoContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require("../assets/BgMotos.jpeg")}
        style={styles.imagemCabecalho}
        resizeMode="cover"
      />
      <Text style={styles.logo}>Mottu</Text>
      <View style={{ marginHorizontal: 20 }}>
        <Text style={styles.paragrafo}>
          A <Text style={styles.negrito}>Mottu</Text> é uma startup brasileira
          fundada em 2020 com o propósito de democratizar o acesso ao trabalho
          por meio do aluguel acessível de motocicletas para entregadores
          autônomos. Com foco em inclusão, a empresa busca transformar a vida de
          profissionais do delivery, oferecendo planos desburocratizados que
          permitem trabalhar mesmo sem possuir um veículo próprio.
        </Text>

        <Text style={styles.paragrafo}>
          Atualmente, a Mottu atua em diversas cidades no Brasil e no México,
          com uma frota ativa de mais de{" "}
          <Text style={styles.negrito}>10 mil motos</Text>. Entre os principais
          serviços estão o aluguel de motos a partir de R$18 por dia, manutenção
          preventiva, assistência 24h, seguro contra roubo e proteção contra
          terceiros.
        </Text>

        <Text style={styles.paragrafo}>
          A empresa também oferece soluções como a{" "}
          <Text style={styles.negrito}>Mottu Entregas</Text>, que conecta
          entregadores a empresas, e a{" "}
          <Text style={styles.negrito}>Mottu Store</Text>, loja com peças e
          acessórios para motociclistas. Outro destaque é a{" "}
          <Text style={styles.negrito}>Mottu Sport</Text>, modelo de moto próprio,
          feito para o dia a dia do delivery com conforto e economia.
        </Text>

        <Text style={styles.paragrafo}>
          Com foco em tecnologia, a Mottu investe em inovação. Seu aplicativo
          permite que o entregador gerencie contratos, acompanhe entregas,
          controle manutenções e acesse dados importantes com facilidade.
        </Text>

        <Text style={styles.paragrafo}>
          Com um modelo de negócio voltado para o{" "}
          <Text style={styles.negrito}>impacto social</Text>, a Mottu se posiciona
          como uma parceira dos entregadores, promovendo inclusão, mobilidade e
          geração de renda com infraestrutura e suporte adequados.
        </Text>
      </View>

      <Text style={styles.tituloSecao}>Nossos Serviços</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carrossel}
      >
        {servicos.map((item, indice) => (
          <View key={indice} style={styles.cartao}>
            <Image
              source={item.image}
              style={styles.imagemCartao}
              resizeMode="cover"
            />
            <View style={styles.containerTexto}>
              <Text style={styles.tituloCartao}>{item.titulo}</Text>
              <Text style={styles.descricaoCartao}>{item.descricao}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FDF4",
  },
  conteudoContainer: {
    paddingBottom: 80,
  },
  imagemCabecalho: {
    width: "100%",
    height: 180,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#228B22",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  paragrafo: {
    fontSize: 15,
    color: "#333",
    lineHeight: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  negrito: {
    fontWeight: "bold",
    color: "#228B22",
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#228B22",
    marginLeft: 20,
    marginBottom: 10,
  },
  carrossel: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  cartao: {
    width: larguraTela * 0.8,
    marginRight: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  imagemCartao: {
    width: "100%",
    height: 150,
  },
  containerTexto: {
    padding: 16,
  },
  tituloCartao: {
    fontSize: 18,
    color: "#228B22",
    fontWeight: "bold",
    marginBottom: 8,
  },
  descricaoCartao: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
});
