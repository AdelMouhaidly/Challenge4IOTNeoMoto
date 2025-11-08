import requests
import cv2
from ultralytics import YOLO
import time
import random

API_URL = "http://localhost:8000/leituras"  


model = YOLO("yolov8n.pt")

def enviar(tipo, valor):
    try:
        r = requests.post(API_URL, json={"tipo": tipo, "valor": valor}, timeout=5)
        print(f"[OK] {tipo}: {valor} → {r.status_code}")
    except Exception as e:
        print("[ERRO ao enviar]", e)

def detectar_motos(frame):
    results = model(frame, verbose=False)
    moto_detectada = False

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0].item())
            label = model.names[cls]  
            if label.lower() in ["motorbike", "moto", "motorcycle"]:
                moto_detectada = True
                
                xyxy = box.xyxy[0].tolist()
                cv2.rectangle(frame, (int(xyxy[0]), int(xyxy[1])),
                                     (int(xyxy[2]), int(xyxy[3])), (0, 255, 0), 2)
                cv2.putText(frame, "MOTO", (int(xyxy[0]), int(xyxy[1] - 10)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

    return frame, moto_detectada

def sensores_simulados():
    temperatura = round(random.uniform(20, 40), 1)
    gps = f"{-23.55 + random.random()/100:.5f}, {-46.63 + random.random()/100:.5f}"
    return temperatura, gps

def main():
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame, moto_detectada = detectar_motos(frame)

        enviar("visao_computacional", "detectada" if moto_detectada else "nao_detectada")

        temperatura, gps = sensores_simulados()
        enviar("temperatura", f"{temperatura} ºC")
        enviar("gps", gps)

        cv2.imshow("Deteccao de Motos + Sensores", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

        time.sleep(5)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
