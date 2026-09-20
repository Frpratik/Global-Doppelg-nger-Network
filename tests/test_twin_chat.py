"""
Integration Tests for Twin Connection Requests and Mutual Direct Chat
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from apps.api.main import app
from apps.api.db.session import init_db

@pytest.mark.asyncio
async def test_twin_request_and_chat_flow():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register User A
        uid_a = uuid.uuid4().hex[:6]
        res_a = await client.post("/api/v1/auth/register", json={
            "email": f"user_a_{uid_a}@doppel.ai",
            "password": "Password123!",
            "display_name": "Twin Alpha",
            "username": f"alpha_{uid_a}",
            "biometric_consent": True,
            "discovery_consent": True
        })
        assert res_a.status_code == 201
        data_a = res_a.json()
        token_a = data_a["access_token"]
        user_a_id = data_a["user"]["id"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Register User B
        uid_b = uuid.uuid4().hex[:6]
        res_b = await client.post("/api/v1/auth/register", json={
            "email": f"user_b_{uid_b}@doppel.ai",
            "password": "Password123!",
            "display_name": "Twin Beta",
            "username": f"beta_{uid_b}",
            "biometric_consent": True,
            "discovery_consent": True
        })
        assert res_b.status_code == 201
        data_b = res_b.json()
        token_b = data_b["access_token"]
        user_b_id = data_b["user"]["id"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. User A attempts to message User B BEFORE sending/accepting request -> Expect 403
        msg_pre = await client.post(
            f"/api/v1/chat/conversations/{user_b_id}/messages",
            headers=headers_a,
            json={"content": "Hey twin, are we connected?"}
        )
        assert msg_pre.status_code == 403

        # 4. User A sends Twin Request to User B
        conn_req = await client.post(
            f"/api/v1/users/{user_b_id}/connect",
            headers=headers_a,
            json={"note": "We matched at 94.2% similarity!"}
        )
        assert conn_req.status_code in [200, 201]
        conn_data = conn_req.json()
        conn_id = conn_data["id"]
        assert conn_data["status"] == "pending"

        # 5. User B checks pending connections
        inbound_res = await client.get("/api/v1/users/connections", headers=headers_b)
        assert inbound_res.status_code == 200
        inbound_data = inbound_res.json()
        assert any(c["id"] == conn_id and c["peer"]["user_id"] == user_a_id for c in inbound_data["pending_incoming"])

        # 6. User B accepts Twin Request
        accept_res = await client.put(
            f"/api/v1/users/connections/{conn_id}/respond",
            headers=headers_b,
            json={"action": "accept"}
        )
        assert accept_res.status_code == 200
        assert accept_res.json()["status"] == "accepted"

        # 7. User A sends direct message to User B -> Expect 201
        msg_send = await client.post(
            f"/api/v1/chat/conversations/{user_b_id}/messages",
            headers=headers_a,
            json={"content": "Hello my twin! Incredible match!"}
        )
        assert msg_send.status_code == 201
        sent_data = msg_send.json()
        assert sent_data["content"] == "Hello my twin! Incredible match!"
        assert sent_data["sender_id"] == user_a_id
        assert sent_data["receiver_id"] == user_b_id

        # 8. User B views conversations list -> Expect conversation with User A
        conv_res = await client.get("/api/v1/chat/conversations", headers=headers_b)
        assert conv_res.status_code == 200
        conv_list = conv_res.json()
        assert len(conv_list) >= 1
        conv_a = next(c for c in conv_list if c["twin_id"] == user_a_id)
        assert conv_a["last_message"] == "Hello my twin! Incredible match!"
        assert conv_a["unread_count"] == 2  # Includes initial friend request note + direct message

        # 9. User B fetches messages in conversation -> Expect read receipt mark
        chat_history = await client.get(
            f"/api/v1/chat/conversations/{user_a_id}/messages",
            headers=headers_b
        )
        assert chat_history.status_code == 200
        messages = chat_history.json()
        assert len(messages) == 2
        assert messages[0]["content"] == "We matched at 94.2% similarity!"  # First message is the connection note
        assert messages[1]["content"] == "Hello my twin! Incredible match!"

        # 10. User B sends reply to User A
        reply_res = await client.post(
            f"/api/v1/chat/conversations/{user_a_id}/messages",
            headers=headers_b,
            json={"content": "Hey! It is unbelievable how similar we look!"}
        )
        assert reply_res.status_code == 201
        assert reply_res.json()["sender_id"] == user_b_id
