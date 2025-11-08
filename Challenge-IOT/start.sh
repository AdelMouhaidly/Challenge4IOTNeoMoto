#!/bin/bash
gunicorn backend:app --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 600 --worker-class uvicorn.workers.UvicornWorker --max-requests 1000 --max-requests-jitter 100

