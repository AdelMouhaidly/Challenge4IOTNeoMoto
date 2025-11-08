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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TipoLeitura = Literal["estado", "moto", "temperatura", "gps", "placa", "marca"]


class LeituraCreate(BaseModel):
    moto_id: str = Field(..., example="MOT-01")
    tipo: TipoLeitura = Field(
        ...,
        example="estado",
        description='Pode ser "estado", "temperatura", "gps", "moto", "placa" ou "marca"',
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
    placa: Optional[str] = None
    marca: Optional[str] = None
    monitoramento_iot: bool = False  # Indica se a moto tem monitoramento IoT ativo
    status_monitoramento: Optional[str] = None  # "online", "offline", "desaparecida"
    tempo_offline: Optional[int] = None  # Tempo em segundos sem sinal
    ultima_atualizacao: Optional[datetime] = None


class Alerta(BaseModel):
    id: str
    tipo: str  # "temperatura_alta", "gps_offline", "moto_inativa", "manutencao"
    moto_id: str
    severidade: str  # "baixa", "media", "alta"
    mensagem: str
    timestamp: datetime


class Estatistica(BaseModel):
    total_motos: int
    motos_em_uso: int
    motos_paradas: int
    motos_manutencao: int
    alertas_ativos: int
    temperatura_media: Optional[float] = None
    ultima_atualizacao: datetime



leituras_db: List[Leitura] = []
_next_id = 1
model = None

def carregar_modelo_yolo():
    global model
    if model is None:
        try:
            print("Carregando modelo YOLO...")
            model = YOLO("yolov8n.pt")
            print("Modelo YOLO carregado com sucesso")
        except Exception as e:
            print(f"Erro ao carregar modelo YOLO: {e}")
            model = None
    return model

@app.on_event("startup")
async def startup_event():
    print("Iniciando API...")
    print("Modelo YOLO será carregado sob demanda")
    print("API pronta para receber requisições")


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
    agora = datetime.utcnow()

    for l in leituras_db:
        if l.moto_id not in resumo:
            resumo[l.moto_id] = MotoResumo(
                moto_id=l.moto_id,
                monitoramento_iot=True,
                status_monitoramento="online"
            )

        moto = resumo[l.moto_id]

        if l.tipo in ("estado", "moto"):
            moto.estado = l.valor

        elif l.tipo == "gps":
            moto.gps = l.valor

        elif l.tipo == "temperatura":
            moto.temperatura = l.valor
        
        elif l.tipo == "placa":
            moto.placa = l.valor
        
        elif l.tipo == "marca":
            moto.marca = l.valor

        moto.ultima_atualizacao = l.timestamp

    for moto_id, moto in resumo.items():
        if moto.estado and "desaparecida" in moto.estado.lower():
            moto.status_monitoramento = "desaparecida"
            if moto.ultima_atualizacao:
                tempo_sem_atualizacao = (agora - moto.ultima_atualizacao).total_seconds()
                moto.tempo_offline = int(tempo_sem_atualizacao)
            else:
                moto.tempo_offline = 0
        elif moto.ultima_atualizacao:
            tempo_sem_atualizacao = (agora - moto.ultima_atualizacao).total_seconds()
            moto.tempo_offline = int(tempo_sem_atualizacao)
            
            if tempo_sem_atualizacao > 1800:
                moto.status_monitoramento = "desaparecida"
                moto.estado = "DESAPARECIDA"
            elif tempo_sem_atualizacao > 300:
                moto.status_monitoramento = "offline"
            else:
                moto.status_monitoramento = "online"

    return list(resumo.values())


@app.get("/alertas", response_model=List[Alerta], tags=["alertas"])
def listar_alertas(criticos_apenas: bool = Query(False, description="Retorna apenas alertas críticos")):
    """
    Gera alertas baseados nas leituras IoT:
    - Temperatura alta (> 35°C)
    - GPS offline (sem leitura GPS há mais de 30s)
    - Moto inativa (parada há muito tempo)
    - Moto desaparecida (GPS offline por muito tempo)
    
    Use criticos_apenas=true para retornar apenas alertas de alta severidade
    """
    alertas = []
    agora = datetime.utcnow()
    
    motos_leituras: Dict[str, Dict[str, List[Leitura]]] = {}
    
    for leitura in leituras_db:
        if leitura.moto_id not in motos_leituras:
            motos_leituras[leitura.moto_id] = {"estado": [], "temperatura": [], "gps": [], "moto": []}
        
        if leitura.tipo in motos_leituras[leitura.moto_id]:
            motos_leituras[leitura.moto_id][leitura.tipo].append(leitura)
    
    alerta_id = 1
    for moto_id, leituras_por_tipo in motos_leituras.items():
        estado_desaparecida = False
        if leituras_por_tipo["estado"]:
            ultimo_estado = leituras_por_tipo["estado"][-1]
            if "desaparecida" in ultimo_estado.valor.lower():
                estado_desaparecida = True
                tempo_desaparecida = (agora - ultimo_estado.timestamp).total_seconds()
                alertas.append(Alerta(
                    id=f"ALT-{alerta_id}",
                    tipo="moto_desaparecida",
                    moto_id=moto_id,
                    severidade="alta",
                    mensagem=f"MOTO DESAPARECIDA - Estado cadastrado como desaparecida há {int(tempo_desaparecida/60)} minutos",
                    timestamp=ultimo_estado.timestamp
                ))
                alerta_id += 1
        
        if leituras_por_tipo["temperatura"]:
            ultima_temp = leituras_por_tipo["temperatura"][-1]
            try:
                temp_valor = float(ultima_temp.valor.replace("ºC", "").replace("°C", "").strip())
                if temp_valor > 35:
                    alertas.append(Alerta(
                        id=f"ALT-{alerta_id}",
                        tipo="temperatura_alta",
                        moto_id=moto_id,
                        severidade="alta" if temp_valor > 38 else "media",
                        mensagem=f"Temperatura elevada: {temp_valor}°C. Requer verificação!",
                        timestamp=ultima_temp.timestamp
                    ))
                    alerta_id += 1
            except ValueError:
                pass
        
        if not estado_desaparecida and leituras_por_tipo["gps"]:
            ultima_gps = leituras_por_tipo["gps"][-1]
            tempo_sem_gps = (agora - ultima_gps.timestamp).total_seconds()
            if tempo_sem_gps > 300:
                if tempo_sem_gps > 1800:
                    alertas.append(Alerta(
                        id=f"ALT-{alerta_id}",
                        tipo="moto_desaparecida",
                        moto_id=moto_id,
                        severidade="alta",
                        mensagem=f"MOTO DESAPARECIDA - Sem sinal GPS há {int(tempo_sem_gps/60)} minutos",
                        timestamp=agora
                    ))
                    alerta_id += 1
                else:
                    alertas.append(Alerta(
                        id=f"ALT-{alerta_id}",
                        tipo="gps_offline",
                        moto_id=moto_id,
                        severidade="alta",
                        mensagem=f"Sem sinal GPS há {int(tempo_sem_gps/60)} minutos. Possível problema!",
                        timestamp=agora
                    ))
                    alerta_id += 1
        
        if not estado_desaparecida and leituras_por_tipo["estado"]:
            ultimo_estado = leituras_por_tipo["estado"][-1]
            if "manutencao" in ultimo_estado.valor.lower() or "manutenção" in ultimo_estado.valor.lower():
                tempo_manutencao = (agora - ultimo_estado.timestamp).total_seconds() / 3600
                alertas.append(Alerta(
                    id=f"ALT-{alerta_id}",
                    tipo="manutencao",
                    moto_id=moto_id,
                    severidade="media" if tempo_manutencao < 24 else "alta",
                    mensagem=f"Em manutenção há {int(tempo_manutencao)} horas.",
                    timestamp=ultimo_estado.timestamp
                ))
                alerta_id += 1
            elif "parada" in ultimo_estado.valor.lower():
                tempo_parada = (agora - ultimo_estado.timestamp).total_seconds() / 3600
                if tempo_parada > 48:
                    alertas.append(Alerta(
                        id=f"ALT-{alerta_id}",
                        tipo="moto_inativa",
                        moto_id=moto_id,
                        severidade="baixa",
                        mensagem=f"Moto parada há {int(tempo_parada)} horas. Verificar se há problema.",
                        timestamp=ultimo_estado.timestamp
                    ))
                    alerta_id += 1
    
    if criticos_apenas:
        alertas = [a for a in alertas if a.severidade == "alta"]
    
    return sorted(alertas, key=lambda a: a.timestamp, reverse=True)


@app.get("/estatisticas", response_model=Estatistica, tags=["estatisticas"])
def obter_estatisticas():
    """
    Retorna estatísticas gerais do sistema
    """
    motos_resumo = listar_motos_estado()
    alertas = listar_alertas()
    
    motos_em_uso = 0
    motos_paradas = 0
    motos_manutencao = 0
    temperaturas = []
    
    for moto in motos_resumo:
        if moto.estado:
            estado_lower = moto.estado.lower()
            if "uso" in estado_lower:
                motos_em_uso += 1
            elif "parada" in estado_lower or "disponível" in estado_lower:
                motos_paradas += 1
            elif "manutencao" in estado_lower or "manutenção" in estado_lower:
                motos_manutencao += 1
        
        if moto.temperatura:
            try:
                temp_valor = float(moto.temperatura.replace("ºC", "").replace("°C", "").strip())
                temperaturas.append(temp_valor)
            except ValueError:
                pass
    
    temp_media = sum(temperaturas) / len(temperaturas) if temperaturas else None
    
    return Estatistica(
        total_motos=len(motos_resumo),
        motos_em_uso=motos_em_uso,
        motos_paradas=motos_paradas,
        motos_manutencao=motos_manutencao,
        alertas_ativos=len(alertas),
        temperatura_media=round(temp_media, 1) if temp_media else None,
        ultima_atualizacao=datetime.utcnow()
    )


@app.post("/detectar-moto", tags=["detecção"])
async def detectar_moto(file: UploadFile = File(...)):
    modelo_atual = carregar_modelo_yolo()
    if modelo_atual is None:
        return {
            "erro": "Modelo YOLO não disponível",
            "motos_detectadas": []
        }
    
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {
                "erro": "Não foi possível decodificar a imagem",
                "motos_detectadas": []
            }
        
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        brilho_medio = np.mean(img_gray)
        temperatura_base = 20.0 + (brilho_medio / 255.0) * 20.0
        temperatura = round(temperatura_base, 1)
        
        results = modelo_atual(img, verbose=False)
        motos_detectadas = []
        altura_img, largura_img = img.shape[:2]
        area_total_imagem = altura_img * largura_img
        area_total_motos = 0
        
        for idx, r in enumerate(results):
            for box in r.boxes:
                cls = int(box.cls[0].item())
                label = modelo_atual.names[cls]
                
                if label.lower() in ["motorbike", "moto", "motorcycle"]:
                    confianca = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()
                    
                    centro_x = (xyxy[0] + xyxy[2]) / 2
                    centro_y = (xyxy[1] + xyxy[3]) / 2
                    
                    largura_moto = xyxy[2] - xyxy[0]
                    altura_moto = xyxy[3] - xyxy[1]
                    area_moto = largura_moto * altura_moto
                    area_total_motos += area_moto
                    
                    posicao_x_percent = (centro_x / largura_img) * 100
                    posicao_y_percent = (centro_y / altura_img) * 100
                    
                    lat_base = -23.5505
                    lon_base = -46.6333
                    lat_offset = (posicao_y_percent / 100) * 0.01
                    lon_offset = (posicao_x_percent / 100) * 0.01
                    gps_lat = lat_base + lat_offset
                    gps_lon = lon_base + lon_offset
                    
                    moto_id = f"MOT-DET-{int(posicao_x_percent)}-{int(posicao_y_percent)}"
                    
                    import random
                    import string
                    
                    letras = ''.join(random.choices(string.ascii_uppercase, k=3))
                    numeros = ''.join(random.choices(string.digits, k=4))
                    placa_mockada = f"{letras}-{numeros}"
                    
                    marcas = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "BMW", "Harley-Davidson", "Ducati", "KTM"]
                    marca_mockada = random.choice(marcas)
                    
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
                        "placa": placa_mockada,
                        "marca": marca_mockada,
                    }
                    
                    motos_detectadas.append(moto_info)
                    
                    try:
                        nova_leitura = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="moto",
                            valor=f"Detectada - Conf: {round(confianca, 2)} - Pos: {round(posicao_x_percent, 1)}%, {round(posicao_y_percent, 1)}%",
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(nova_leitura)
                        
                        leitura_gps = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="gps",
                            valor=f"{gps_lat:.6f}, {gps_lon:.6f}",
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_gps)
                        
                        estado = "em uso" if confianca > 0.7 else "parada"
                        leitura_estado = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="estado",
                            valor=estado,
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_estado)
                        
                        leitura_temperatura = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="temperatura",
                            valor=f"{temperatura} ºC",
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_temperatura)
                        
                        leitura_placa = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="placa",
                            valor=placa_mockada,
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_placa)
                        
                        leitura_marca = Leitura(
                            id=_proximo_id(),
                            moto_id=moto_id,
                            tipo="marca",
                            valor=marca_mockada,
                            timestamp=datetime.utcnow(),
                        )
                        leituras_db.append(leitura_marca)
                        
                    except Exception as e:
                        print(f"Erro ao salvar leitura IoT: {e}")
        
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
