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
import { Menu, Home as HomeIcon, MapPin, Bike, Users, AlertTriangle, Camera, Info, Radio } from "lucide-react-native";

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
import SobreApp from "./src/pages/SobreApp";
import MonitoramentoIoT from "./src/pages/MonitoramentoIoT";
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import {
  LocalizationProvider,
  useLocalization,
} from "./src/contexts/LocalizationContext";
import { NotificationProvider } from "./src/contexts/NotificationContext";
import { useAlertaMonitor } from "./src/hooks/useAlertaMonitor";

const Stack = createNativeStackNavigator<StackLista>();
const Drawer = createDrawerNavigator<DrawerLista>();

function BotaoMenuHamburguer() {
  const navegacao = useNavigation<NavigationProp<ParamListBase>>();

  const alternarMenuLateral = () => {
    navegacao.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <TouchableOpacity onPress={alternarMenuLateral} style={estilos.botaoMenu}>
      <Menu size={28} color="#fff" />
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
  const { t, locale } = useLocalization();

  return (
    <Drawer.Navigator
      key={locale}
      drawerContent={(props) => <MenuPersonalizado {...props} key={locale} />}
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
          title: t("drawer.home"),
          drawerIcon: ({ focused }) => (
            <HomeIcon
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
          title: t("drawer.patio"),
          drawerIcon: ({ focused }) => (
            <MapPin
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
          title: t("drawer.bikes"),
          drawerIcon: ({ focused }) => (
            <Bike
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
          title: t("drawer.drivers"),
          drawerIcon: ({ focused }) => (
            <Users
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
          title: t("drawer.alerts"),
          drawerIcon: ({ focused }) => (
            <AlertTriangle
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
          title: t("drawer.detection"),
          drawerIcon: ({ focused }) => (
            <Camera
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
      <Drawer.Screen
        name="MonitoramentoIoT"
        component={MonitoramentoIoT}
        options={{
          title: t("drawer.iot"),
          drawerIcon: ({ focused }) => (
            <Radio
              size={24}
              color={focused ? colors.primary : colors.textSecondary}
            />
          ),
          drawerLabelStyle: { color: colors.text },
        }}
      />
      <Drawer.Screen
        name="SobreApp"
        component={SobreApp}
        options={{
          title: t("drawer.about"),
          drawerIcon: ({ focused }) => (
            <Info
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

function AppContent() {
  useAlertaMonitor();
  
  return (
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
  );
}

export default function AplicativoMottu() {
  return (
    <ThemeProvider>
      <LocalizationProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </LocalizationProvider>
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
