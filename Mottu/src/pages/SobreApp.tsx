import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { Info, GitCommit, Users, Github, List, Code } from "lucide-react-native";
import Constants from "expo-constants";
import { useTheme } from "../contexts/ThemeContext";
import { useLocalization } from "../contexts/LocalizationContext";

export default function SobreApp() {
  const { colors } = useTheme();
  const { t } = useLocalization();

  const appInfo = {
    name: Constants.expoConfig?.name || "Mottu",
    version: Constants.expoConfig?.version || "1.0.0",
    description: t("about.appDescription"),
  };

  const commitHash =
    Constants.expoConfig?.extra?.commitHash ||
    Constants.manifest?.revisionId ||
    Constants.manifest2?.extra?.expoGo?.revisionId ||
    "challenge4";

  const integrantes = [
    {
      nome: "Adel Mouhaidly",
      rm: "RM557705",
      github: "AdelMouhaidly",
      githubUrl: "https://github.com/AdelMouhaidly",
    },
    {
      nome: "Afonso Correia Pereira",
      rm: "RM557863",
      github: "afonsocp",
      githubUrl: "https://github.com/afonsocp",
    },
    {
      nome: "Tiago Ferro",
      rm: "RM556955",
      github: "Ferro333",
      githubUrl: "https://github.com/Ferro333",
    },
  ];

  const funcionalidades = [
    t("about.featuresList.auth"),
    t("about.featuresList.bikesCrud"),
    t("about.featuresList.driversCrud"),
    t("about.featuresList.map"),
    t("about.featuresList.alerts"),
    t("about.featuresList.detection"),
    t("about.featuresList.notifications"),
    t("about.featuresList.i18n"),
    t("about.featuresList.theme"),
    t("about.featuresList.api"),
  ];

  const abrirLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image
          source={require("../assets/Mottu.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: colors.primary }]}>
          {appInfo.name}
        </Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          {t("about.version")} {appInfo.version}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Info size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.aboutApp")}
          </Text>
        </View>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {appInfo.description}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <GitCommit size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.buildInfo")}
          </Text>
        </View>
        <View
          style={[
            styles.commitContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.commitLabel, { color: colors.textSecondary }]}>
            {t("about.commitHash")}
          </Text>
          <Text style={[styles.commitHash, { color: colors.primary }]}>
            {commitHash}
          </Text>
        </View>
        <View
          style={[
            styles.commitContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.commitLabel, { color: colors.textSecondary }]}>
            {t("about.expoSdk")}
          </Text>
          <Text style={[styles.commitHash, { color: colors.primary }]}>
            {Constants.expoConfig?.sdkVersion ||
              Constants.manifest?.sdkVersion ||
              "53.0.0"}
          </Text>
        </View>
        <View
          style={[
            styles.commitContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.commitLabel, { color: colors.textSecondary }]}>
            {t("about.platform")}
          </Text>
          <Text style={[styles.commitHash, { color: colors.primary }]}>
            {Constants.platform?.ios ? "iOS" : "Android"} -{" "}
            {Constants.deviceName || t("about.device")}
          </Text>
        </View>
        <Text style={[styles.commitNote, { color: colors.textSecondary }]}>
          {t("about.commitNote")}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Users size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.projectMembers")}
          </Text>
        </View>
        {integrantes.map((integrante, index) => (
          <View key={index} style={styles.integranteCard}>
            <View style={styles.integranteInfo}>
              <Text style={[styles.integranteNome, { color: colors.text }]}>
                {integrante.nome}
              </Text>
              <Text
                style={[styles.integranteRM, { color: colors.textSecondary }]}
              >
                {integrante.rm}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => abrirLink(integrante.githubUrl)}
              style={[styles.githubButton, { backgroundColor: colors.primary }]}
            >
              <Github size={20} color="#FFFFFF" />
              <Text style={styles.githubText}>{integrante.github}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <List size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.features")}
          </Text>
        </View>
        {funcionalidades.map((funcionalidade, index) => (
          <View key={index} style={styles.funcionalidadeItem}>
            <Info
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.funcionalidadeText, { color: colors.text }]}>
              {funcionalidade}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Code size={24} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("about.technologies")}
          </Text>
        </View>
        <View style={styles.techGrid}>
          <View
            style={[styles.techBadge, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.techText, { color: colors.primary }]}>
              React Native
            </Text>
          </View>
          <View
            style={[styles.techBadge, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.techText, { color: colors.primary }]}>
              Expo SDK 53
            </Text>
          </View>
          <View
            style={[styles.techBadge, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.techText, { color: colors.primary }]}>
              TypeScript
            </Text>
          </View>
          <View
            style={[styles.techBadge, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.techText, { color: colors.primary }]}>
              React Navigation
            </Text>
          </View>
          <View
            style={[styles.techBadge, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.techText, { color: colors.primary }]}>
              Spring Boot
            </Text>
          </View>
          <View
            style={[styles.techBadge, { backgroundColor: colors.background }]}
          >
            <Text style={[styles.techText, { color: colors.primary }]}>
              YOLOv8
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {t("about.footer")}
        </Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {t("about.developedFor")}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  commitContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  commitLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 5,
  },
  commitHash: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  commitNote: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 5,
  },
  integranteCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  integranteInfo: {
    flex: 1,
  },
  integranteNome: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
  },
  integranteRM: {
    fontSize: 14,
  },
  githubButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  githubText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 5,
  },
  funcionalidadeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  funcionalidadeText: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
  },
  techGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  techBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  techText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 5,
  },
});
