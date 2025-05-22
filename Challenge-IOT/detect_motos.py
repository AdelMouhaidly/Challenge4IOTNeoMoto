import cv2
import numpy as np
from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from typing import Dict

app = FastAPI()
model = YOLO('yolov8n.pt')

@app.post("/detectar-moto")
async def detectar_moto(file: UploadFile = File(...)) -> Dict:
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"erro": "Imagem inválida."}

        results = model(frame)
        motos_detectadas = []

        for result in results:
            for box in result.boxes.data.tolist():
                x1, y1, x2, y2, score, cls = box
                if int(cls) == 3:  
                    motos_detectadas.append({
                        "x1": int(x1),
                        "y1": int(y1),
                        "x2": int(x2),
                        "y2": int(y2),
                        "score": round(score, 2),
                        "classe": int(cls)
                    })

        return JSONResponse(content={"motos_detectadas": motos_detectadas})
    
    except Exception as e:
        return {"erro": str(e)}
