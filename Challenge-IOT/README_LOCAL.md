# 🚀 Como Rodar a API IoT Localmente

Este guia explica como executar a API IoT do projeto NeoMoto em sua máquina local.

## 📋 Pré-requisitos

- Python 3.10 ou superior
- pip (gerenciador de pacotes Python)

## 🔧 Instalação

### 1. Instalar dependências

```bash
# No Windows
pip install -r requirements.txt

# No Linux/Mac
pip3 install -r requirements.txt
```

### 2. Iniciar o servidor

Você tem 3 opções para iniciar o servidor:

#### Opção 1: Script Python (Recomendado)
```bash
python run_local.py
```

#### Opção 2: Script Batch (Windows)
```bash
start_local.bat
```

#### Opção 3: Script Shell (Linux/Mac)
```bash
chmod +x start_local.sh
./start_local.sh
```

#### Opção 4: Comando direto
```bash
python -m uvicorn backend:app --host 0.0.0.0 --port 8000 --reload
```

## ✅ Verificar se está funcionando

Após iniciar o servidor, você verá uma mensagem indicando que a API está rodando.

Acesse no navegador:
- **API**: http://localhost:8000
- **Documentação interativa**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/

## 📱 Configurar o App Mobile

### Para Emulador Android

O app já está configurado para usar `http://10.0.2.2:8000` quando rodando no emulador.

### Para Dispositivo Físico ou iOS Simulator

1. Descubra o IP da sua máquina:
   - **Windows**: Abra o CMD e digite `ipconfig` (procure por "IPv4")
   - **Linux/Mac**: Abra o terminal e digite `ifconfig` ou `ip addr`

2. Edite o arquivo `Mottu/src/config/api.ts`:
   - Encontre a linha com `PYTHON_API_LOCAL_DEVICE`
   - Substitua `192.168.1.100` pelo IP da sua máquina
   - Exemplo: `"http://192.168.0.105:8000"`

3. Certifique-se de que:
   - O dispositivo e a máquina estão na mesma rede Wi-Fi
   - O firewall permite conexões na porta 8000

## 🔍 Endpoints Disponíveis

- `GET /` - Informações da API
- `GET /leituras` - Listar todas as leituras
- `GET /leituras?moto_id=MOT-01` - Filtrar por moto
- `GET /leituras?tipo=temperatura` - Filtrar por tipo
- `POST /leituras` - Criar nova leitura
- `GET /motos-estado` - Estado resumido de todas as motos

## 🛠️ Solução de Problemas

### Erro: "Port 8000 is already in use"
- Altere a porta no comando: `--port 8001`
- Ou encerre o processo que está usando a porta 8000

### App não consegue conectar
- Verifique se o servidor está rodando
- Verifique se o IP está correto no arquivo de configuração
- Verifique se o firewall não está bloqueando a porta 8000
- Para dispositivo físico, certifique-se de que estão na mesma rede Wi-Fi

### Erro ao instalar dependências
```bash
# Tente atualizar o pip primeiro
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 📝 Notas

- O servidor roda com `--reload`, então qualquer alteração no código será recarregada automaticamente
- Os dados são armazenados em memória (não persistem após reiniciar o servidor)
- Para produção, considere usar um banco de dados

