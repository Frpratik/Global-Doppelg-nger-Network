"""
Integration Tests for DOPPEL Auth, Consent, and Matching API
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import app
from apps.api.db.session import init_db

@pytest.mark.asyncio
async def test_health_check_endpoint():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["service"] == "DOPPEL"
        assert data["model"]["dimension"] == 512

@pytest.mark.asyncio
async def test_register_and_login_flow():
    await init_db()
    uid = uuid.uuid4().hex[:6]
    test_email = f"test_{uid}@doppel.ai"
    test_uname = f"user_{uid}"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register
        reg_payload = {
            "email": test_email,
            "password": "SecurePassword123!",
            "display_name": "Test Journey User",
            "username": test_uname,
            "biometric_consent": True,
            "discovery_consent": True
        }
        reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert reg_res.status_code == 201
        tokens = reg_res.json()
        assert "access_token" in tokens
        assert tokens["user"]["has_biometric_consent"] is True

        # 2. Login
        login_payload = {
            "email": test_email,
            "password": "SecurePassword123!"
        }
        log_res = await client.post("/api/v1/auth/login", json=login_payload)
        assert log_res.status_code == 200
        auth_data = log_res.json()
        access_token = auth_data["access_token"]

        # 3. Authenticated /me
        headers = {"Authorization": f"Bearer {access_token}"}
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["username"] == test_uname
        assert me_data["email"] == test_email

@pytest.mark.asyncio
async def test_consent_retrieval_and_update():
    uid = uuid.uuid4().hex[:6]
    test_email = f"consent_{uid}@doppel.ai"
    test_uname = f"consent_{uid}"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register
        reg_res = await client.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": "SecurePassword123!",
            "display_name": "Consent Test User",
            "username": test_uname,
            "biometric_consent": True,
            "discovery_consent": True
        })
        access_token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # Get consent
        c_res = await client.get("/api/v1/consent", headers=headers)
        assert c_res.status_code == 200
        assert c_res.json()["biometric_processing_consent"] is True

        # Toggle consent
        update_res = await client.post(
            "/api/v1/consent",
            headers=headers,
            json={"biometric_processing_consent": True, "discovery_consent": False}
        )
        assert update_res.status_code == 200
        assert update_res.json()["discovery_consent"] is False

@pytest.mark.asyncio
async def test_ai_chat_assistant_faq():
    uid = uuid.uuid4().hex[:6]
    test_email = f"chat_{uid}@doppel.ai"
    test_uname = f"chat_{uid}"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        reg_res = await client.post("/api/v1/auth/register", json={
            "email": test_email,
            "password": "SecurePassword123!",
            "display_name": "Chat Test User",
            "username": test_uname,
            "biometric_consent": True,
            "discovery_consent": True
        })
        access_token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        chat_res = await client.post(
            "/api/v1/ai/chat",
            headers=headers,
            json={"message": "How does biometric privacy and matching work?"}
        )
        assert chat_res.status_code == 200
        reply = chat_res.json()["reply"]
        assert "Privacy" in reply or "matching" in reply.lower()
