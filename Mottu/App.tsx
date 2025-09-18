import { Image, TouchableOpacity, StyleSheet } from "react-native";
import {
  NavigationContainer,
  DrawerActions,
  useNavigation,
  ParamListBase,
  NavigationProp,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Home from "./src/pages/Home";
import Patio from "./src/pages/PatioDashboard";
import MottuLogo from "./src/assets/mottu-branca.png";
import MenuPersonalizado from "./src/components/DrawerContent";
import CadastroDeMotos from "./src/pages/CadastroDeMotos";
import Perfil from "./src/pages/Perfil";
import { StackLista, DrawerLista } from "./src/types/index";
import DashboardAlertas from "./src/pages/DashboardAlertas";
import DetectarMoto from "./src/pages/DetectarMoto";
import GestaoMotoristas from "./src/pages/GestaoMotoristas";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";

const Stack = createNativeStackNavigator<StackLista>();
const Drawer = createDrawerNavigator<DrawerLista>();

function BotaoMenuHamburguer() {
  const navegacao = useNavigation<NavigationProp<ParamListBase>>();

  const alternarMenuLateral = () => {
    navegacao.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <TouchableOpacity onPress={alternarMenuLateral} style={estilos.botaoMenu}>
      <Ionicons name="menu" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

function BotaoPerfilUsuario() {
  const navegacao = useNavigation<NavigationProp<ParamListBase>>();

  const navegarParaPerfil = () => {
    navegacao.navigate("Perfil" as never);
  };

  return (
    <TouchableOpacity onPress={navegarParaPerfil} style={estilos.botaoAvatar}>
      <Image
        source={require("./src/assets/avatar.jpg")}
        style={estilos.imagemAvatar}
      />
    </TouchableOpacity>
  );
}

function NavegadorComMenuLateral() {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <MenuPersonalizado {...props} />}
      screenOptions={{
        headerLeft: () => <BotaoMenuHamburguer />,
        headerRight: () => <BotaoPerfilUsuario />,
        headerTitle: () => (
          <Image
            source={MottuLogo}
            style={{ width: 100, height: 30, resizeMode: "contain" }}
          />
        ),
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        drawerStyle: {
          backgroundColor: colors.background,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        drawerActiveBackgroundColor: colors.surface,
        drawerLabelStyle: {
          color: colors.text,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          title: "Início",
          drawerIcon: ({ focused }) => (
            <Ionicons
              name="home-outline"
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
      <Drawer.Screen
        name="Patio"
        component={Patio}
        options={{
          title: "Mapa do Pátio",
          drawerIcon: ({ focused }) => (
            <Ionicons
              name="map-outline"
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
      <Drawer.Screen
        name="Cadastro"
        component={CadastroDeMotos}
        options={{
          title: "Gerenciar Motos",
          drawerIcon: ({ focused }) => (
            <Ionicons
              name="bicycle-outline"
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
      <Drawer.Screen
        name="GestaoMotoristas"
        component={GestaoMotoristas}
        options={{
          title: "Gerenciar Motoristas",
          drawerIcon: ({ focused }) => (
            <Ionicons
              name="people-outline"
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
      <Drawer.Screen
        name="Alertas"
        component={DashboardAlertas}
        options={{
          title: "Alertas e Monitoramento",
          drawerIcon: ({ focused }) => (
            <Ionicons
              name="warning-outline"
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
      <Drawer.Screen
        name="DetectarMoto"
        component={DetectarMoto}
        options={{
          title: "Detecção IA",
          drawerIcon: ({ focused }) => (
            <Ionicons
              name="camera-outline"
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AplicativoMottu() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="DrawerRoot" component={NavegadorComMenuLateral} />
          <Stack.Screen name="Cadastro" component={CadastroDeMotos} />
          <Stack.Screen name="Alertas" component={DashboardAlertas} />
          <Stack.Screen name="Perfil" component={Perfil} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const estilos = StyleSheet.create({
  botaoMenu: {
    marginLeft: 15,
  },
  botaoAvatar: {
    marginRight: 15,
  },
  imagemAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
