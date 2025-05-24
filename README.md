
# Projeto Mottu Challenge -  Mobile

Este repositório reúne duas partes principais do desafio:

NeoMoto é um sistema digital interativo desenvolvido para otimizar a gestão da frota da Mottu. Ele oferece rastreamento em tempo real das motos, visualização interativa da disposição física dos veículos no pátio, interface intuitiva adaptada ao layout de cada filial e integração com dados de uso, manutenção e status operacional. O sistema foi projetado com foco em controle total das operações, agilidade no processo logístico e alta escalabilidade, garantindo eficiência, precisão e maior visibilidade das motos tanto para operadores quanto para gestores.

**Importante:** O backend em Python com FastAPI é utilizado apenas para a **página de detecção de motos (IoT)**. **Todas as outras funcionalidades do app mobile funcionam normalmente sem a API rodando**. Caso o backend não esteja ativo, apenas essa página específica não funcionará.


- Backend em **Python** com **FastAPI** para detecção de motos.
- Frontend **mobile** com **React Native + Expo**.

---

##  Requisitos

- Python 3.10 ou superior
- Node.js 16 ou superior
- npm (ou yarn)
- Git
- Android Studio (caso for emular no Android)
- Expo Go App (para rodar no celular via QR Code)

---

##  Backend - API Python (FastAPI)

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

##  Mobile - App com React Native + Expo

###  Instruções para rodar o app mobile

1. **Entre na pasta do projeto mobile**:
   ```bash
   cd Mottu
   ```

2. **Instale as dependências do projeto**:
   ```bash
   npm install
   ```

3. **Inicie o servidor do Expo**:
   ```bash
   npx expo start
   ```

   Isso abrirá o Metro Bundler no navegador. Você pode:

   - Escanear o QR Code com o app **Expo Go** no celular.
   - Usar emulador com Android Studio.

4. **(Opcional) Rodar no emulador Android diretamente**:
   ```bash
   npm run android
   ```


---

##  Dicas importantes

- Caso tenha problemas com o `uvicorn` não sendo reconhecido, verifique se o ambiente virtual está ativado corretamente.
- Se a API de primeira que você envia a imagem para detectar a moto, tente mais de uma vez ao clicar em "Enviar imagem para API", que as vezes dá um bug.


---

##  Autor

Desenvolvido por 
- Adel Mouhaidly RM557705
- Afonso Correia Pereira RM557863
- Tiago Ferro RM558485
