import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StackLista } from "../types/index";

export default function MenuPersonalizado(props: any) {
  const [dadosUsuario, setDadosUsuario] = useState({ nome: '', email: '' });

  const navegacao = useNavigation<NativeStackNavigationProp<StackLista>>();

  const carregarUsuario = async () => {
    try {
      const usuarioArmazenado = await AsyncStorage.getItem('user');
      if (usuarioArmazenado) {
        const usuario = JSON.parse(usuarioArmazenado);
        setDadosUsuario({
          nome: usuario.name ?? '',
          email: usuario.email ?? '',
        });
      }
    } catch (erro) {
      console.log('Erro ao carregar usuário:', erro);
    }
  };

  useEffect(() => {
    carregarUsuario();
  }, []);

  const sair = () => {
    navegacao.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image
          source={require('../assets/avatar.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{dadosUsuario.nome}</Text>
        <Text style={styles.email}>{dadosUsuario.email}</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        <DrawerItemList {...props} />

        <View style={{ flex: 1 }} />

        <DrawerItem
          label="Sair"
          onPress={sair}
          inactiveTintColor="#d32f2f"
          style={styles.logoutButton}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#d32f2f" />}
        />
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#228B22',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#f0f0f0',
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginTop: 'auto',
  },
});
