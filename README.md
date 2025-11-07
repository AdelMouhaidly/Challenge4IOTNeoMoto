# Projeto Mottu Challenge - Mobile

Este repositório reúne três partes principais do desafio:

NeoMoto é um sistema digital interativo desenvolvido para otimizar a gestão da frota da Mottu. Ele oferece rastreamento em tempo real das motos, visualização interativa da disposição física dos veículos no pátio, interface intuitiva adaptada ao layout de cada filial e integração com dados de uso, manutenção e status operacional. O sistema foi projetado com foco em controle total das operações, agilidade no processo logístico e alta escalabilidade, garantindo eficiência, precisão e maior visibilidade das motos tanto para operadores quanto para gestores.

**Importante:**

- O backend em **Python com FastAPI** é utilizado apenas para a **página de detecção de motos (IoT)**.
- O backend em **Java Spring Boot** é utilizado para o **CRUD de motos e gestão de motoristas**.
- O app mobile funciona normalmente mesmo sem as APIs rodando, com fallback para funcionamento offline.

## Arquitetura do Sistema

- **Backend Python** com **FastAPI** para detecção de motos (IA/IoT).
- **Backend Java** com **Spring Boot** para CRUD de motos e motoristas.
- **Frontend mobile** com **React Native + Expo**.

---

## Requisitos

- **Para o Backend Python:** Python 3.10 ou superior
- **Para o Backend Java:** Java 17 ou superior
- **Para o Mobile:** Node.js 16 ou superior, npm (ou yarn)
- Git
- Android Studio (caso for emular no Android)
- Expo Go App (para rodar no celular via QR Code)

---

## Backend - API Python (FastAPI)

### Instruções para rodar a API

1. **Crie o ambiente virtual**:

   ```bash
   python -m venv venv
   ```

2. **Instale as dependências**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Rode a API com Uvicorn**:

   ```bash
   python -m uvicorn detect_motos:app --host 0.0.0.0 --port 8000
   ```

4. **Acesse a documentação da API no navegador**:
   ```
   http://localhost:8000/docs
   ```

---

## Backend - API Java (Spring Boot)

### Instruções para rodar a API de CRUD

1. **Entre na pasta do projeto Spring Boot**:

   ```bash
   cd NeoMoto
   ```

2. **Execute a aplicação**:

   ```bash
   # No Windows PowerShell
   .\gradlew.bat bootRun

   # No Linux/Mac
   ./gradlew bootRun
   ```

3. **A API estará disponível em**:

   ```
   http://localhost:8080
   ```

4. **Acesse o console do banco H2**:
   ```
   http://localhost:8080/h2-console
   ```
   - JDBC URL: `jdbc:h2:mem:testdb`
   - Username: `sa`
   - Password: `password`

### Endpoints principais:

- **Motos**: `/api/motos` (GET, POST, PUT, DELETE)
- **Motoristas**: `/api/motoristas` (GET, POST, PUT, DELETE)

---

## Mobile - App com React Native + Expo

### Instruções para rodar o app mobile

1. Entre na pasta do projeto mobile:

   ```bash
   cd Mottu
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor do Expo:

   ```bash
   npx expo start
   ```

4. Escaneie o QR Code com o app Expo Go no celular ou use o emulador Android.

### Configuração das APIs

O app pode usar as APIs de duas formas:

**Opção 1: APIs hospedadas no Render (recomendado)**

As APIs já estão configuradas para usar os endpoints do Render:

- API Java: https://mottu-java-api.onrender.com/api
- API Python: https://mottu-python-api.onrender.com

**Importante:** O Render usa plano gratuito que coloca os serviços em sleep após 15 minutos de inatividade. Antes de usar o app, acesse os links acima no navegador para "acordar" os serviços. Aguarde alguns segundos até os serviços iniciarem antes de usar o app.

**Opção 2: APIs locais**

Para usar as APIs localmente, edite o arquivo `Mottu/src/config/api.ts` e altere as funções `getJavaApiUrl()` e `getPythonApiUrl()` para retornar:

- `API_CONFIG.JAVA_API_LOCAL` (http://10.0.2.2:8080/api)
- `API_CONFIG.PYTHON_API_LOCAL` (http://10.0.2.2:8000)

Certifique-se de que as APIs locais estejam rodando antes de iniciar o app.

---

## Funcionalidades do App Mobile

### **Páginas Principais**

- **Home**: Página inicial com informações sobre a Mottu
- **Pátio Dashboard**: Visualização em mapa das motos no pátio
- **Cadastro de Motos**: CRUD completo de motos integrado com API Spring Boot
- **Gestão de Motoristas**: CRUD completo de motoristas integrado com API Spring Boot
- **Dashboard de Alertas**: Monitoramento de motos desaparecidas e em manutenção
- **Detecção de Motos**: IA para detectar motos em imagens (API Python)
- **Perfil**: Gerenciamento de dados do usuário

### **Sistema de Autenticação**

- Login e cadastro de usuários
- Armazenamento local com AsyncStorage
- Logout funcional

### **Sistema de Temas**

- **Tema Dark/Light**: Alternância completa entre temas
- **Persistência**: Tema salvo automaticamente no AsyncStorage
- **Aplicação Universal**: Todos os componentes respondem ao tema
- **Menu Hambúrguer**: Totalmente adaptado ao tema ativo
- **Transição Suave**: Mudança instantânea entre temas

## **APIs Integradas**

### 1. **API Python (FastAPI)** - Detecção de Motos

- **Endpoint**: `POST /detectar-moto`
- **Função**: Detecta motos em imagens usando YOLOv8
- **Porta**: 8000

### 2. **API Java (Spring Boot)** - CRUD

- **Endpoints Motos**:
  - `GET /api/motos` - Listar motos
  - `POST /api/motos` - Cadastrar moto
  - `PUT /api/motos/{id}` - Atualizar moto
  - `DELETE /api/motos/{id}` - Excluir moto
- **Endpoints Motoristas**:
  - `GET /api/motoristas` - Listar motoristas
  - `POST /api/motoristas` - Cadastrar motorista
  - `PUT /api/motoristas/{id}` - Atualizar motorista
  - `DELETE /api/motoristas/{id}` - Excluir motorista
  - `POST /api/motoristas/{motoristaId}/moto/{motoId}` - Associar motorista à moto
- **Porta**: 8080

## Como executar o projeto completo

### Executando localmente

1. Inicie a API Java (porta 8080):

   ```bash
   cd NeoMoto
   ./gradlew bootRun
   ```

2. Inicie a API Python (porta 8000):

   ```bash
   cd Challenge-IOT
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m uvicorn detect_motos:app --host 0.0.0.0 --port 8000
   ```

3. Configure o app mobile para usar APIs locais (edite `Mottu/src/config/api.ts`)

4. Inicie o app mobile:
   ```bash
   cd Mottu
   npm install
   npx expo start
   ```

### Usando APIs hospedadas no Render

1. Acesse os links abaixo no navegador para ativar os serviços (necessário devido ao plano gratuito do Render):

   - API Java: https://mottu-java-api.onrender.com/api
   - API Python: https://mottu-python-api.onrender.com

2. Aguarde alguns segundos para os serviços iniciarem

3. Inicie o app mobile (já configurado para usar as APIs do Render):
   ```bash
   cd Mottu
   npm install
   npx expo start
   ```

**Nota:** Se as APIs do Render não responderem, acesse os links novamente para reativá-las. O plano gratuito coloca os serviços em sleep após 15 minutos de inatividade.

## **Estrutura de Pastas**

```
challenge-neomoto/
├── Challenge-IOT/          # API Python para detecção de motos
│   ├── __pycache__/        # Cache Python
│   ├── detect_motos.py     # Endpoint FastAPI com YOLOv8
│   ├── Imagem-moto.jpg     # Imagem de exemplo para testes
│   ├── requirements.txt    # Dependências Python
│   └── yolov8n.pt         # Modelo YOLOv8
├── NeoMoto/               # API Java Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/demo/
│   │   │   │   ├── config/         # Configurações (CORS)
│   │   │   │   ├── controller/     # Controllers REST
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── entity/        # Entidades JPA (Moto, Motorista)
│   │   │   │   ├── repository/    # Repositories JPA
│   │   │   │   ├── util/          # Utilitários (DTOConverter)
│   │   │   │   └── NeoMotoApplication.java # Classe principal
│   │   │   └── resources/
│   │   │       └── application.properties # Configurações do banco
│   │   └── test/java/             # Testes unitários
│   ├── build/                     # Arquivos compilados
│   ├── gradle/wrapper/            # Gradle Wrapper
│   ├── build.gradle              # Dependências Gradle
│   ├── gradlew & gradlew.bat     # Scripts Gradle
│   └── HELP.md                   # Documentação Spring Boot
├── Mottu/                        # App React Native + Expo
│   ├── src/
│   │   ├── assets/               # Imagens e recursos do app
│   │   │   ├── avatar.jpg
│   │   │   ├── BgMotos.jpeg
│   │   │   ├── mottu-branca.png
│   │   │   ├── Mottu.png
│   │   │   └── ...
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   └── DrawerContent.tsx # Menu lateral personalizado
│   │   ├── contexts/             # Contextos React
│   │   │   └── ThemeContext.tsx  # Sistema de temas dark/light
│   │   ├── pages/                # Telas do aplicativo
│   │   │   ├── Login.tsx         # Tela de login
│   │   │   ├── Register.tsx      # Cadastro de usuário
│   │   │   ├── Home.tsx          # Página inicial
│   │   │   ├── CadastroDeMotos.tsx # CRUD de motos
│   │   │   ├── GestaoMotoristas.tsx # CRUD de motoristas
│   │   │   ├── PatioDashboard.tsx # Mapa do pátio
│   │   │   ├── DashboardAlertas.tsx # Alertas e monitoramento
│   │   │   ├── DetectarMoto.tsx  # IA detecção de motos
│   │   │   └── Perfil.tsx        # Perfil do usuário
│   │   └── types/                # Tipos TypeScript
│   │       └── index.ts          # Definições de tipos
│   ├── assets/                   # Assets do Expo
│   ├── node_modules/             # Dependências Node.js
│   ├── App.tsx                   # Componente principal
│   ├── app.json                  # Configurações Expo
│   ├── package.json              # Dependências e scripts
│   ├── tsconfig.json             # Configurações TypeScript
│   └── index.ts                  # Entry point
└── README.md                     # Este arquivo
```

---

## Autor

Desenvolvido por:

- Adel Mouhaidly - [![GitHub](https://img.shields.io/badge/GitHub-Perfil-blue?style=for-the-badge&logo=github)](https://github.com/AdelMouhaidly)
- Afonso Correia Pereira - [![GitHub](https://img.shields.io/badge/GitHub-Perfil-blue?style=for-the-badge&logo=github)](https://github.com/afonsocp)
- Tiago Ferro - [![GitHub](https://img.shields.io/badge/GitHub-Perfil-blue?style=for-the-badge&logo=github)](https://github.com/Ferro333)

## Video da Aplicação

[Clique aqui](https://www.youtube.com/watch?v=UsrqBACNkuI)
