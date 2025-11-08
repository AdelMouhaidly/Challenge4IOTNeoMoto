from fastapi import FastAPI, Query, File, UploadFile
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
    print("✅ Modelo YOLO carregado com sucesso")
except Exception as e:
    print(f"⚠️ Erro ao carregar modelo YOLO: {e}")
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
            "GET  /leituras",
            "POST /leituras",
            "GET  /motos-estado",
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
        
        # Detectar motos
        results = model(img, verbose=False)
        motos_detectadas = []
        
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0].item())
                label = model.names[cls]
                
                # Verificar se é uma moto
                if label.lower() in ["motorbike", "moto", "motorcycle"]:
                    confianca = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()
                    
                    motos_detectadas.append({
                        "classe": label,
                        "confianca": round(confianca, 2),
                        "bbox": {
                            "x1": round(xyxy[0], 2),
                            "y1": round(xyxy[1], 2),
                            "x2": round(xyxy[2], 2),
                            "y2": round(xyxy[3], 2),
                        }
                    })
        
        return {
            "motos_detectadas": motos_detectadas,
            "total": len(motos_detectadas),
            "status": "sucesso"
        }
        
    except Exception as e:
        return {
            "erro": str(e),
            "motos_detectadas": []
        }
