#!/usr/bin/env python3
"""
Script para iniciar a API IoT localmente
"""
import uvicorn
import sys
import os

if __name__ == "__main__":
    # Verifica se estamos no diretório correto
    if not os.path.exists("backend.py"):
        print("Erro: backend.py não encontrado!")
        print("Execute este script na pasta Challenge-IOT")
        sys.exit(1)
    
    print("=" * 50)
    print("🚀 Iniciando API IoT NeoMoto")
    print("=" * 50)
    print("\n📡 API estará disponível em:")
    print("   - Local: http://localhost:8000")
    print("   - Rede: http://0.0.0.0:8000")
    print("\n📚 Documentação: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/")
    print("\n" + "=" * 50)
    print("Pressione Ctrl+C para parar o servidor")
    print("=" * 50 + "\n")
    
    try:
        uvicorn.run(
            "backend:app",
            host="0.0.0.0",
            port=8000,
            reload=True,  # Auto-reload em desenvolvimento
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\n✅ Servidor encerrado com sucesso!")
        sys.exit(0)

