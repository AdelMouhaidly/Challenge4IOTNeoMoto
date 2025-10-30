import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackLista } from "../types/index";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";

export default function MenuPersonalizado(props: any) {
  const [dadosUsuario, setDadosUsuario] = useState({ nome: "", email: "" });
  const { colors, toggleTheme, isDark } = useTheme();
  const { t, locale, setLocale } = useLocalization();

  const navegacao = useNavigation<NativeStackNavigationProp<StackLista>>();

  const carregarDadosUsuario = async () => {
    try {
      const usuarioArmazenado = await AsyncStorage.getItem("user");
      if (usuarioArmazenado) {
        const usuario = JSON.parse(usuarioArmazenado);
        setDadosUsuario({
          nome: usuario.name ?? "",
          email: usuario.email ?? "",
        });
      }
    } catch (erro) {
      console.log("Erro ao carregar usuário:", erro);
    }
  };

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const realizarLogout = () => {
    navegacao.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.cabecalho, { backgroundColor: colors.header }]}>
        <Image source={require("../assets/avatar.jpg")} style={styles.avatar} />
        <Text
          style={[
            styles.nomeUsuario,
            { color: isDark ? "#FFFFFF" : "#FFFFFF" },
          ]}
        >
          {dadosUsuario.nome}
        </Text>
        <Text
          style={[
            styles.emailUsuario,
            { color: isDark ? "#CCCCCC" : "#F0F0F0" },
          ]}
        >
          {dadosUsuario.email}
        </Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: colors.background }}
      >
        <View
          style={[styles.cabecalhoSecao, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.tituloSecao, { color: colors.textSecondary }]}>
            {t("drawer.home").toUpperCase()}
          </Text>
        </View>
        <DrawerItemList {...props} />

        <View
          style={[styles.divisorSecao, { backgroundColor: colors.border }]}
        />

        <DrawerItem
          label={t("drawer.theme")}
          onPress={toggleTheme}
          inactiveTintColor={colors.text}
          activeTintColor={colors.primary}
          style={[styles.botaoTema, { backgroundColor: colors.surface }]}
          labelStyle={{ color: colors.text }}
          icon={() => (
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={22}
              color={colors.primary}
            />
          )}
        />

        <DrawerItem
          label={`${t("profile.language")}: ${locale === "pt-BR" ? "Português" : "Español"}`}
          onPress={() => setLocale(locale === "pt-BR" ? "es" : "pt-BR")}
          inactiveTintColor={colors.text}
          activeTintColor={colors.primary}
          style={[styles.botaoTema, { backgroundColor: colors.surface }]}
          labelStyle={{ color: colors.text }}
          icon={() => (
            <Ionicons
              name="language"
              size={22}
              color={colors.primary}
            />
          )}
        />

        <View style={{ flex: 1 }} />

        <DrawerItem
          label={t("drawer.logout")}
          onPress={realizarLogout}
          inactiveTintColor={colors.error}
          activeTintColor={colors.error}
          style={[styles.botaoSair, { borderTopColor: colors.border }]}
          labelStyle={{ color: colors.error }}
          icon={() => (
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
          )}
        />
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  nomeUsuario: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emailUsuario: {
    fontSize: 14,
  },
  botaoSair: {
    borderTopWidth: 1,
    marginTop: "auto",
  },
  botaoTema: {
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  cabecalhoSecao: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  tituloSecao: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  divisorSecao: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
