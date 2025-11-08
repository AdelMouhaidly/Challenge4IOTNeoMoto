# Challenge-IOT - API de Detecção de Motos

API Python com FastAPI para detecção de motos em imagens usando YOLO.

## Descrição

Esta API utiliza o modelo YOLOv8 para detectar motos em imagens enviadas via requisição POST.

## Endpoints

- `POST /detectar-moto`: Recebe uma imagem e retorna as motos detectadas

## Deploy

A API está configurada para deploy no Render através dos arquivos:

- `Procfile`: Configuração de processo para Render
- `render.yaml`: Configuração de serviços para Render
- `requirements.txt`: Dependências Python

## Modelo

O modelo YOLOv8 (`yolov8n.pt`) é carregado automaticamente ao iniciar a aplicação.

## Integrantes do Projeto

- **Adel Mouhaidly** - RM557705 - [GitHub](https://github.com/AdelMouhaidly)
- **Afonso Correia Pereira** - RM557863 - [GitHub](https://github.com/afonsocp)
- **Tiago Ferro** - RM556955 - [GitHub](https://github.com/Ferro333)
