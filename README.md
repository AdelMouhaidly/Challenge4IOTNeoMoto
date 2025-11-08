# Projeto Mottu Challenge - Mobile

Sistema de gestão de frota de motocicletas com rastreamento em tempo real, detecção por IA e monitoramento IoT.

## Arquitetura

- **Backend Python (FastAPI)**: Detecção de motos por IA e monitoramento IoT
- **Backend Java (Spring Boot)**: CRUD de motos e motoristas
- **Frontend Mobile (React Native + Expo)**: App mobile multiplataforma

## Requisitos

- Python 3.10+
- Java 17+
- Node.js 16+
- Expo CLI (`npm install -g expo-cli`)

## Instalação e Execução

### 1. Backend Python (FastAPI)

```bash
cd Challenge-IOT
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_local.py
```

API disponível em: `http://localhost:8000`
Documentação: `http://localhost:8000/docs`

### 2. Backend Java (Spring Boot)

```bash
cd NeoMoto
./gradlew bootRun  # Windows: .\gradlew.bat bootRun
```

API disponível em: `http://localhost:8080`
Console H2: `http://localhost:8080/h2-console`

### 3. App Mobile (React Native + Expo)

```bash
cd Mottu
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go ou pressione `a` para Android / `i` para iOS.

## Configuração das APIs

### APIs Locais

Edite `Mottu/src/config/api.ts`:

```typescript
export const getJavaApiUrl = () => {
  return API_CONFIG.JAVA_API_LOCAL; // http://10.0.2.2:8080/api
};

export const getPythonApiUrl = () => {
  return API_CONFIG.PYTHON_API_LOCAL; // http://10.0.2.2:8000
};
```

**Para dispositivo físico**: Altere `MEU_IPV4` no arquivo `api.ts` com o IP da sua máquina.

### APIs Hospedadas (Render)

As APIs já estão configuradas para usar:

- Java: `https://mottu-java-api.onrender.com/api`
- Python: `https://mottu-python-api.onrender.com`

**Importante**: Acesse os links acima no navegador para ativar os serviços (Render coloca em sleep após 15min de inatividade).

## Funcionalidades

### Páginas do App

- **Home**: Página inicial
- **Pátio Dashboard**: Mapa com localização das motos
- **Cadastro de Motos**: CRUD de motos
- **Gestão de Motoristas**: CRUD de motoristas
- **Dashboard de Alertas**: Alertas críticos (desaparecidas, manutenção)
- **Detecção de Motos**: Detecção por IA usando YOLOv8
- **Monitoramento IoT**: Dashboard e histórico de leituras IoT
- **Perfil**: Dados do usuário

### Recursos

- **Temas Dark/Light**: Alternância com persistência
- **Notificações Push**: Alertas críticos em tempo real
- **Multi-idioma**: Português e Espanhol
- **Detecção Automática**: Geração automática de ID ao detectar moto
- **Monitoramento IoT**: Status online/offline/desaparecida
- **Mapa Interativo**: Visualização e navegação no pátio

## Endpoints Principais

### API Python (FastAPI)

- `POST /detectar-moto`: Detecta motos em imagem
- `GET /motos-estado`: Lista estado das motos
- `GET /alertas?criticos_apenas=true`: Alertas críticos
- `GET /leituras`: Histórico de leituras IoT
- `POST /leituras`: Enviar leitura IoT

### API Java (Spring Boot)

- `GET /api/motos`: Listar motos
- `POST /api/motos`: Cadastrar moto
- `PUT /api/motos/{id}`: Atualizar moto
- `DELETE /api/motos/{id}`: Excluir moto
- `GET /api/motoristas`: Listar motoristas
- `POST /api/motoristas`: Cadastrar motorista
- `PUT /api/motoristas/{id}`: Atualizar motorista
- `DELETE /api/motoristas/{id}`: Excluir motorista

## Estrutura do Projeto

```
Challenge4IOTNeoMoto/
├── Challenge-IOT/          # Backend Python
│   ├── backend.py          # API FastAPI
│   ├── run_local.py        # Script para rodar localmente
│   └── requirements.txt    # Dependências Python
├── NeoMoto/                # Backend Java
│   └── src/main/java/      # Código fonte Spring Boot
└── Mottu/                  # App Mobile
    ├── src/
    │   ├── pages/          # Telas do app
    │   ├── components/     # Componentes reutilizáveis
    │   ├── contexts/       # Contextos React
    │   ├── services/       # Serviços (notificações)
    │   ├── hooks/          # Hooks customizados
    │   └── config/         # Configurações (APIs)
    └── App.tsx             # Componente principal
```

## Autores

- Adel Mouhaidly - [GitHub](https://github.com/AdelMouhaidly)
- Afonso Correia Pereira - [GitHub](https://github.com/afonsocp)
- Tiago Ferro - [GitHub](https://github.com/Ferro333)

## Vídeo da Aplicação

[Assistir no YouTube](https://www.youtube.com/watch?v=UsrqBACNkuI)
