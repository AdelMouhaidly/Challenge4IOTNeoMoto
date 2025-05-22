import { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function DetectarMoto() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [resultado, setResultado] = useState<any>(null);

  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setResultado(null);
    }
  };

  const enviarImagem = async () => {
    if (!imageUri) {
      Alert.alert('Erro', 'Por favor, selecione uma imagem antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'foto.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch('http://192.168.15.7:8000/detectar-moto', {
        // Altere o ip com base no ip local
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      Alert.alert('Erro', 'Não foi possível conectar à API.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Detecção de Motos</Text>

      <TouchableOpacity style={styles.botao} onPress={selecionarImagem}>
        <Text style={styles.textoBotao}>Selecionar Imagem</Text>
      </TouchableOpacity>

      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />

          <TouchableOpacity style={styles.botao} onPress={enviarImagem}>
            <Text style={styles.textoBotao}>Enviar para API</Text>
          </TouchableOpacity>
        </>
      )}

      {resultado && (
        <View style={styles.resultadoContainer}>
          <Text style={styles.resultadoTitulo}>Resultado da Detecção:</Text>

          {resultado.motos_detectadas.length > 0 ? (
            <Text style={styles.mensagemSucesso}> Moto detectada na imagem!</Text>
          ) : (
            <Text style={styles.mensagemErro}> Nenhuma moto detectada na imagem.</Text>
          )}

          <Text style={styles.resultadoTexto}>
            {JSON.stringify(resultado, null, 2)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#228B22',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: 320,
    height: 320,
    marginVertical: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultadoContainer: {
    marginTop: 20,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resultadoTitulo: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
  resultadoTexto: {
    fontFamily: 'monospace',
    color: '#555',
    fontSize: 14,
  },
  mensagemSucesso: {
    color: '#228B22',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  mensagemErro: {
    color: '#B22222',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
});
