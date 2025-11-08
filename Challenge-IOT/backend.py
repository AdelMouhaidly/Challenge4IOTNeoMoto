from fastapi import FastAPI, Query, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict
from datetime import datetime
from ultralytics import YOLO
import cv2
import numpy as np

app = FastAPI(
    title="API IoT Motocicletas",
    description="API para receber leituras de IoT / visão computacional e expor dados para o app mobile.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # se quiser travar depois, coloque o IP/porta do app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TipoLeitura = Literal["estado", "moto", "temperatura", "gps"]


class LeituraCreate(BaseModel):
    moto_id: str = Field(..., example="MOT-01")
    tipo: TipoLeitura = Field(
        ...,
        example="estado",
        description='Pode ser "estado", "temperatura", "gps" ou "moto" (visão computacional)',
    )
    valor: str = Field(..., example="em uso")


class Leitura(LeituraCreate):
    id: int
    timestamp: datetime


class MotoResumo(BaseModel):
    moto_id: str
    estado: Optional[str] = None
    gps: Optional[str] = None
    temperatura: Optional[str] = None
    ultima_atualizacao: Optional[datetime] = None



leituras_db: List[Leitura] = []
_next_id = 1

# Carregar modelo YOLO para detecção de motos
try:
    model = YOLO("yolov8n.pt")
    print("Modelo YOLO carregado com sucesso")
except Exception as e:
    print(f"Erro ao carregar modelo YOLO: {e}")
    model = None


def _proximo_id() -> int:
    global _next_id
    actual = _next_id
    _next_id += 1
    return actual


@app.get("/", tags=["info"])
def root():
    return {
        "message": "API IoT Motocicletas OK",
        "endpoints": [
            "GET    /leituras",
            "POST   /leituras",
            "GET    /leituras/{id}",
            "PUT    /leituras/{id}",
            "DELETE /leituras/{id}",
            "GET    /motos-estado",
            "POST   /detectar-moto",
        ],
    }


@app.post("/leituras", response_model=Leitura, tags=["leituras"])
def criar_leitura(leitura: LeituraCreate):

    nova = Leitura(
      id=_proximo_id(),
      moto_id=leitura.moto_id,
      tipo=leitura.tipo,
      valor=leitura.valor,
      timestamp=datetime.utcnow(),
    )
    leituras_db.append(nova)
    return nova


@app.get("/leituras", response_model=List[Leitura], tags=["leituras"])
def listar_leituras(
    moto_id: Optional[str] = Query(None, description="Filtra por moto_id"),
    tipo: Optional[TipoLeitura] = Query(None, description="Filtra por tipo de leitura"),
):

    resultados = leituras_db
    if moto_id:
        resultados = [l for l in resultados if l.moto_id == moto_id]
    if tipo:
        resultados = [l for l in resultados if l.tipo == tipo]

    resultados = sorted(resultados, key=lambda l: l.timestamp)
    return resultados


@app.get("/leituras/{leitura_id}", response_model=Leitura, tags=["leituras"])
def obter_leitura(leitura_id: int):
    """Obtém uma leitura específica por ID"""
    for leitura in leituras_db:
        if leitura.id == leitura_id:
            return leitura
    raise HTTPException(status_code=404, detail="Leitura não encontrada")


@app.put("/leituras/{leitura_id}", response_model=Leitura, tags=["leituras"])
def atualizar_leitura(leitura_id: int, leitura_update: LeituraCreate):
    """Atualiza uma leitura existente"""
    for i, leitura in enumerate(leituras_db):
        if leitura.id == leitura_id:
            leituras_db[i] = Leitura(
                id=leitura_id,
                moto_id=leitura_update.moto_id,
                tipo=leitura_update.tipo,
                valor=leitura_update.valor,
                timestamp=leitura.timestamp,  # Mantém timestamp original
            )
            return leituras_db[i]
    raise HTTPException(status_code=404, detail="Leitura não encontrada")


@app.delete("/leituras/{leitura_id}", tags=["leituras"])
def deletar_leitura(leitura_id: int):
    """Deleta uma leitura"""
    for i, leitura in enumerate(leituras_db):
        if leitura.id == leitura_id:
            leituras_db.pop(i)
            return {"mensagem": "Leitura deletada com sucesso", "id": leitura_id}
    raise HTTPException(status_code=404, detail="Leitura não encontrada")


@app.get("/motos-estado", response_model=List[MotoResumo], tags=["motos"])
def listar_motos_estado():

    resumo: Dict[str, MotoResumo] = {}


    for l in leituras_db:
        if l.moto_id not in resumo:
            resumo[l.moto_id] = MotoResumo(moto_id=l.moto_id)

        moto = resumo[l.moto_id]


        if l.tipo in ("estado", "moto"):
            moto.estado = l.valor

        elif l.tipo == "gps":
            moto.gps = l.valor

        elif l.tipo == "temperatura":
            moto.temperatura = l.valor

        moto.ultima_atualizacao = l.timestamp


    return list(resumo.values())


@app.post("/detectar-moto", tags=["detecção"])
async def detectar_moto(file: UploadFile = File(...)):
    """
    Detecta motos em uma imagem usando YOLOv8
    """
    if model is None:
        return {
            "erro": "Modelo YOLO não disponível",
            "motos_detectadas": []
        }
    
    try:
        # Ler a imagem
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {
                "erro": "Não foi possível decodificar a imagem",
                "motos_detectadas": []
            }
        
        # Calcular temperatura baseada na imagem (análise de brilho/cor)
        # Converte para escala de cinza e calcula temperatura simulada
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        brilho_medio = np.mean(img_gray)
        # Temperatura simulada: 20-40°C baseada no brilho da imagem
        # Imagens mais claras = temperatura mais alta (simula sol)
        temperatura_base = 20.0 + (brilho_medio / 255.0) * 20.0
        temperatura = round(temperatura_base, 1)
        
        # Detectar motos
        results = model(img, verbose=False)
        motos_detectadas = []
        altura_img, largura_img = img.shape[:2]
        area_total_imagem = altura_img * largura_img
        area_total_motos = 0
        
        for idx, r in enumerate(results):
            for box in r.boxes:
                cls = int(box.cls[0].item())
                label = model.names[cls]
                
                # Verificar se é uma moto
                if label.lower() in ["motorbike", "moto", "motorcycle"]:
                    confianca = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()
                    
                    # Calcular centro da moto
                    centro_x = (xyxy[0] + xyxy[2]) / 2
                    centro_y = (xyxy[1] + xyxy[3]) / 2
                    
                    # Calcular área ocupada pela moto
                    largura_moto = xyxy[2] - xyxy[0]
                    altura_moto = xyxy[3] - xyxy[1]
                    area_moto = largura_moto * altura_moto
                    area_total_motos += area_moto
                    
                    # Calcular posição relativa (0-100%)
                    posicao_x_percent = (centro_x / largura_img) * 100
                    posicao_y_percent = (centro_y / altura_img) * 100
                    
                    # Gerar coordenadas GPS simuladas baseadas na posição na imagem
                    # Usa a posição na imagem para criar coordenadas únicas
                    lat_base = -23.5505
                    lon_base = -46.6333
                    # Variação baseada na posição na imagem (simula diferentes áreas do pátio)
                    lat_offset = (posicao_y_percent / 100) * 0.01  # Variação de ~0.01 graus
                    lon_offset = (posicao_x_percent / 100) * 0.01
                    gps_lat = lat_base + lat_offset
                    gps_lon = lon_base + lon_offset
                    
                    # Gerar ID único baseado na posição
                    moto_id = f"MOT-DET-{int(posicao_x_percent)}-{int(posicao_y_percent)}"
                    
                    moto_info = {
                        "classe": label,
                        "confianca": round(confianca, 2),
                        "bbox": {
                            "x1": round(xyxy[0], 2),
                            "y1": round(xyxy[1], 2),
                            "x2": round(xyxy[2], 2),
                            "y2": round(xyxy[3], 2),
                        },
                        "centro": {
                            "x": round(centro_x, 2),
                            "y": round(centro_y, 2),
                        },
                        "posicao_percentual": {
                            "x": round(posicao_x_percent, 1),
                            "y": round(posicao_y_percent, 1),
                        },
                        "area": {
                            "pixels": round(area_moto, 0),
                            "percentual_imagem": round((area_moto / area_total_imagem) * 100, 2),
                        },
                        "gps": {
                            "latitude": round(gps_lat, 6),
                            "longitude": round(gps_lon, 6),
                        },
                        "moto_id": moto_id,
                    }
                    
                    motos_detectadas.append(moto_info)
                    
                    # Salvar automaticamente no IoT
                    try:
                        nova_leitura = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="moto",
                            valor=f"Detectada - Conf: {round(confianca, 2)} - Pos: {round(posicao_x_percent, 1)}%, {round(posicao_y_percent, 1)}%",
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(nova_leitura)
                        
                        # Salvar GPS
                        leitura_gps = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="gps",
                            valor=f"{gps_lat:.6f}, {gps_lon:.6f}",
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_gps)
                        
                        # Salvar estado baseado na confiança
                        estado = "em uso" if confianca > 0.7 else "parada"
                        leitura_estado = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="estado",
                            valor=estado,
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_estado)
                        
                        # Salvar temperatura baseada na imagem
                        leitura_temperatura = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="temperatura",
                            valor=f"{temperatura} ºC",
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_temperatura)
                        
                    except Exception as e:
                        print(f"Erro ao salvar leitura IoT: {e}")
        
        # Calcular estatísticas
        densidade = (area_total_motos / area_total_imagem) * 100 if area_total_imagem > 0 else 0
        estatisticas = {
            "total_motos": len(motos_detectadas),
            "area_total_ocupada_pixels": round(area_total_motos, 0),
            "area_total_ocupada_percent": round(densidade, 2),
            "densidade": "alta" if densidade > 10 else "media" if densidade > 5 else "baixa",
        }
        
        return {
            "motos_detectadas": motos_detectadas,
            "estatisticas": estatisticas,
            "temperatura_ambiente": f"{temperatura} ºC",
            "total": len(motos_detectadas),
            "status": "sucesso",
            "mensagem": f"{len(motos_detectadas)} moto(s) detectada(s) e registrada(s) no IoT automaticamente!"
        }
        
    except Exception as e:
        return {
            "erro": str(e),
            "motos_detectadas": []
        }
