# Projeto Mottu Challenge - Mobile

## Introdução do Projeto

O **Mottu** é um sistema completo de gestão de frota de motocicletas desenvolvido para otimizar o controle e monitoramento de veículos em tempo real. A aplicação combina tecnologias de **Inteligência Artificial**, **Internet das Coisas (IoT)** e **desenvolvimento mobile** para oferecer uma solução robusta e inovadora.

### Objetivo

Facilitar a gestão de frotas de motocicletas através de:

- **Rastreamento em tempo real** da localização dos veículos
- **Detecção automática** de motos usando visão computacional (YOLOv8)
- **Monitoramento IoT** com sensores para status online/offline
- **Gestão completa** de motoristas e veículos através de CRUDs intuitivos
- **Alertas inteligentes** para situações críticas (veículos desaparecidos, manutenção necessária)

### Tecnologias Principais

- **Frontend**: React Native + Expo (aplicativo multiplataforma iOS/Android)
- **Backend Java**: Spring Boot (CRUD de motos e motoristas)
- **Backend Python**: FastAPI (IA para detecção de motos e monitoramento IoT)
- **IA**: YOLOv8 para detecção de objetos em imagens
- **Banco de Dados**: H2 (in-memory) para desenvolvimento

## Problema Identificado

### Falta de Gestão de Frotas de Motocicletas

Empresas que operam com frotas de motocicletas enfrentam diversos desafios na gestão e controle de seus veículos e motoristas. Os principais problemas identificados são:

1. **Falta de Visibilidade em Tempo Real**: Empresas não conseguem acompanhar a localização e o status de suas motocicletas em tempo real, dificultando o planejamento e a tomada de decisões.

2. **Gestão Manual de Dados**: O controle de motoristas e veículos é feito de forma manual, através de planilhas ou sistemas desatualizados, resultando em:
   - Dados desatualizados ou inconsistentes
   - Perda de tempo com processos manuais
   - Maior probabilidade de erros humanos
   - Dificuldade em rastrear histórico de alterações

3. **Ausência de Monitoramento IoT**: Não há sistema de monitoramento que identifique automaticamente quando uma motocicleta está online, offline ou desaparecida, dificultando a detecção precoce de problemas.

4. **Falta de Alertas Inteligentes**: Não existe um sistema que alerte automaticamente sobre situações críticas como:
   - Veículos desaparecidos
   - Necessidade de manutenção
   - Problemas de conectividade
   - Anomalias no comportamento dos veículos

5. **Dificuldade na Associação Motorista-Veículo**: A gestão da relação entre motoristas e motocicletas é complexa e propensa a erros quando feita manualmente.

6. **Ausência de Detecção Automática**: Não há sistema que utilize inteligência artificial para identificar e catalogar motocicletas automaticamente através de imagens.

## Solução Implementada

O sistema **Mottu** foi desenvolvido para resolver todos esses problemas através de uma solução completa e integrada:

### 1. Rastreamento em Tempo Real

O sistema oferece um dashboard interativo com mapa em tempo real mostrando a localização de todas as motocicletas da frota. Isso permite:
- Visualização geográfica da distribuição dos veículos
- Monitoramento contínuo da posição de cada moto
- Navegação e planejamento de rotas otimizadas

### 2. CRUD Completo de Motos e Motoristas

Foi implementado um sistema completo de gestão (Create, Read, Update, Delete) para:
- **Motos**: Cadastro, atualização, listagem e exclusão de veículos com todas as informações relevantes (nome, marca, configurações, status, localização)
- **Motoristas**: Gestão completa de motoristas incluindo dados pessoais, documentos, contatos e associação com veículos

### 3. Monitoramento IoT

O sistema integra sensores IoT para monitorar o status de cada motocicleta:
- **Status Online/Offline**: Identificação automática quando um veículo está conectado ou desconectado
- **Status Desaparecida**: Alerta automático quando uma moto não envia sinais há um período determinado
- **Histórico de Leituras**: Armazenamento e visualização de todas as leituras IoT para análise histórica

### 4. Sistema de Alertas Inteligentes

Foi implementado um dashboard de alertas que notifica sobre:
- **Veículos Desaparecidos**: Alertas quando uma moto não é detectada há muito tempo
- **Manutenção Necessária**: Notificações sobre veículos que precisam de manutenção
- **Problemas Críticos**: Alertas em tempo real sobre situações que requerem atenção imediata

### 5. Detecção Automática por IA

O sistema utiliza YOLOv8 (modelo de deep learning) para detectar automaticamente motocicletas em imagens:
- Identificação automática de motos em fotos
- Geração automática de IDs para novos veículos detectados
- Catalogação inteligente sem necessidade de entrada manual

### 6. Interface Mobile Intuitiva

Foi desenvolvido um aplicativo mobile multiplataforma (iOS e Android) com:
- Interface moderna e intuitiva
- Suporte a temas claro/escuro
- Multi-idioma (Português e Espanhol)
- Notificações push para alertas críticos
- Acesso offline quando possível

### Resultado

O sistema Mottu resolve completamente o problema de falta de gestão de frotas, oferecendo:

- **Visibilidade Total**: Acompanhamento em tempo real de toda a frota
- **Automação**: Redução significativa de processos manuais
- **Inteligência**: Detecção automática e alertas inteligentes
- **Eficiência**: Gestão centralizada e organizada de todos os dados
- **Confiabilidade**: Sistema robusto com validações e tratamento de erros
- **Acessibilidade**: Interface mobile disponível a qualquer momento e lugar
## Requisitos

- Python 3.10+
- Java 17+
- Node.js 16+
- Expo CLI (`npm install -g expo-cli`)

## Como Rodar

### Opção 1: Usando APIs Hospedadas no Render (Recomendado)

**Passo 1: Acordar as APIs (IMPORTANTE)**

Antes de usar o app, acesse no navegador para ativar os serviços:

- API Java: https://mottu-java-api.onrender.com/api/motos
- API Python: https://mottu-python-api.onrender.com

Aguarde 30-60 segundos para os serviços iniciarem (cold start).

**Passo 2: Rodar o App Mobile**

```bash
cd Mottu
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go ou pressione `a` para Android / `i` para iOS.

**Nota**: O app já está configurado para usar as APIs do Render. Se as APIs não responderem, acesse os links novamente para reativá-las.

---

### Opção 2: Rodar Localmente

**1. Backend Python (FastAPI)**

```bash
cd Challenge-IOT
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_local.py
```

API disponível em: `http://localhost:8000`

**2. Backend Java (Spring Boot)**

```bash
cd NeoMoto
./gradlew bootRun  # Windows: .\gradlew.bat bootRun
```

API disponível em: `http://localhost:8080`

**3. Configurar App Mobile para APIs Locais**

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

**4. Rodar App Mobile**

```bash
cd Mottu
npm install
npx expo start
```

---

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
    │   ├── contexts/        # Contextos React
    │   ├── services/        # Serviços (notificações)
    │   ├── hooks/           # Hooks customizados
    │   └── config/          # Configurações (APIs)
    └── App.tsx              # Componente principal
```

## Autores

- Adel Mouhaidly - [GitHub](https://github.com/AdelMouhaidly)
- Afonso Correia Pereira - [GitHub](https://github.com/afonsocp)
- Tiago Ferro - [GitHub](https://github.com/Ferro333)



## Vídeo da Aplicação

[Assistir no YouTube](https://youtu.be/zs_qX9jk9E4?si=IpATf30Nl36mdQtN)

## Link do Firebase Distribution

[Clique aqui para acessar](https://appdistribution.firebase.google.com/testerapps/1:367184149135:android:830ae108746a10e1428efa/releases/1ulp6g8gs107o?utm_source=firebase-console)
