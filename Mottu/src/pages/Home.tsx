import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";

const larguraTela = Dimensions.get("window").width;

export default function PaginaInicial() {
  const { colors } = useTheme();
  const { t } = useLocalization();

  const servicos = [
    {
      titulo: t("home.service1Title"),
      descricao: t("home.service1Description"),
      image: require("../assets/mapa-digital.jpg"),
    },
    {
      titulo: t("home.service2Title"),
      descricao: t("home.service2Description"),
      image: require("../assets/cadastro.png"),
    },
    {
      titulo: t("home.service3Title"),
      descricao: t("home.service3Description"),
      image: require("../assets/reserva.png"),
    },
    {
      titulo: t("home.service4Title"),
      descricao: t("home.service4Description"),
      image: require("../assets/busca-e-filtro.png"),
    },
  ];

  return (
    <ScrollView
      style={[estilos.container, { backgroundColor: colors.background }]}
      contentContainerStyle={estilos.conteudoContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={require("../assets/BgMotos.jpeg")}
        style={estilos.imagemCabecalho}
        resizeMode="cover"
      />
      <Text style={[estilos.logo, { color: colors.primary }]}>
        {t("home.welcome")}
      </Text>
      <Text style={[estilos.subtitulo, { color: colors.primary }]}>
        {t("home.subtitle")}
      </Text>
      <View style={{ marginHorizontal: 20 }}>
        <Text style={[estilos.paragrafo, { color: colors.text }]}>
          {t("home.description")}
        </Text>
      </View>

      <Text style={[estilos.tituloSecao, { color: colors.primary }]}>
        {t("home.services")}
      </Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.carrossel}
      >
        {servicos.map((item, indice) => (
          <View
            key={indice}
            style={[estilos.cartao, { backgroundColor: colors.surface }]}
          >
            <Image
              source={item.image}
              style={estilos.imagemCartao}
              resizeMode="cover"
            />
            <View style={estilos.containerTexto}>
              <Text style={[estilos.tituloCartao, { color: colors.primary }]}>
                {item.titulo}
              </Text>
              <Text style={[estilos.descricaoCartao, { color: colors.text }]}>
                {item.descricao}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  paragrafo: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  negrito: {
    fontWeight: "bold",
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: "bold",
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
    fontWeight: "bold",
    marginBottom: 8,
  },
  descricaoCartao: {
    fontSize: 15,
    lineHeight: 20,
  },
});
