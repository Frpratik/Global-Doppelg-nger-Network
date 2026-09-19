.PHONY: help install dev dev-api dev-web test seed benchmark demo build clean

help:
	@echo "DOPPEL Platform Makefile"
	@echo "-----------------------------------"
	@echo "make install      - Install backend and frontend dependencies"
	@echo "make dev-api      - Start FastAPI backend server (port 8000)"
	@echo "make dev-web      - Start Next.js frontend dev server (port 3000)"
	@echo "make seed         - Seed 60+ synthetic consenting demo personas"
	@echo "make benchmark    - Run vector ANN matching benchmark (1k, 10k vectors)"
	@echo "make test         - Run pytest backend test suite"
	@echo "make demo         - Initialize database, seed demo data, and run tests"
	@echo "make build        - Build frontend and verify types"

install:
	pip install -r requirements.txt || true
	cd apps/web && npm install

dev-api:
	python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload

dev-web:
	cd apps/web && npm run dev

seed:
	python scripts/seed_demo_data.py

benchmark:
	python scripts/benchmark_matching.py

test:
	python -m pytest -v

demo: seed test
	@echo "✓ Doppel demo environment initialized and validated!"

build:
	cd apps/web && npm run build
