import { Image, TouchableOpacity, StyleSheet } from 'react-native';
import {
  NavigationContainer,
  DrawerActions,
  useNavigation,
  ParamListBase,
  NavigationProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Home from './src/pages/Home';
import Patio from './src/pages/PatioDashboard';
import MottuLogo from './src/assets/mottu-branca.png';
import MenuPersonalizado from './src/components/DrawerContent';
import CadastroDeMotos from './src/pages/CadastroDeMotos';
import Perfil from './src/pages/Perfil';
import { StackLista, DrawerLista } from "./src/types/index";
import DashboardAlertas from './src/pages/DashboardAlertas';
import DetectarMoto from './src/pages/DetectarMoto';

const Stack = createNativeStackNavigator<StackLista>();
const Drawer = createDrawerNavigator<DrawerLista>();

function BotaoMenu() {
  const navegacao = useNavigation<NavigationProp<ParamListBase>>();

  const abrirFecharMenu = () => {
    navegacao.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <TouchableOpacity onPress={abrirFecharMenu} style={styles.menuButton}>
      <Ionicons name="menu" size={28} color="#fff" />
    </TouchableOpacity>
  );
}

function BotaoAvatar() {
  const navegacao = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <TouchableOpacity
      onPress={() => navegacao.navigate('Perfil' as never)}
      style={styles.avatarButton}
    >
      <Image source={require('./src/assets/avatar.jpg')} style={styles.avatarImage} />
    </TouchableOpacity>
  );
}

function RotasDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <MenuPersonalizado {...props} />}
      screenOptions={{
        headerLeft: () => <BotaoMenu />,
        headerRight: () => <BotaoAvatar />,
        headerTitle: () => (
          <Image
            source={MottuLogo}
            style={{ width: 100, height: 30, resizeMode: 'contain' }}
          />
        ),
        headerStyle: { backgroundColor: '#228B22' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Patio" component={Patio} />
      <Drawer.Screen name="Cadastro" component={CadastroDeMotos} />
      <Drawer.Screen name="Alertas" component={DashboardAlertas} />
      <Drawer.Screen name="DetectarMoto" component={DetectarMoto} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="DrawerRoot" component={RotasDrawer} />
        <Stack.Screen name="Cadastro" component={CadastroDeMotos} />
        <Stack.Screen name="Alertas" component={DashboardAlertas} />
        <Stack.Screen name="Perfil" component={Perfil} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 15,
  },
  avatarButton: {
    marginRight: 15,
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
