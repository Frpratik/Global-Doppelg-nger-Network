# Twin Request & Direct Chat System (Mutual Acceptance Model)

## 1. Overview
DOPPEL implements a high-trust, privacy-first **Twin Request & Direct Chat System** modeled after modern social verification workflows (e.g., Instagram mutual follow/request). 

Direct messaging is strictly gated: two users can **only** exchange direct messages if:
1. A visual twin candidate sends a **Twin Request** (`Connection` with status `pending`).
2. The recipient explicitly **Accepts** the request (`status: accepted`).
3. Mutual twin verification passes (`verify_accepted_twin_connection`), ensuring non-twins, unaccepted requests, or blocked connections cannot transmit or read messages.

---

## 2. Connection State Machine

```
               [ User A sends Request ]
                         │
                         ▼
                  ┌──────────────┐
                  │   PENDING    │
                  └──────┬───────┘
                         │
             ┌───────────┴───────────┐
             │ (User B action)       │
             ▼                       ▼
      ┌──────────────┐        ┌──────────────┐
      │   ACCEPTED   │        │   DECLINED   │
      └──────┬───────┘        └──────────────┘
             │                       │
      [ Unlocks Chat ]        [ Chat Blocked ]
             │
             ▼
      ┌──────────────┐
      │   BLOCKED    │
      └──────────────┘
```

### Connection States
| State | Description | Chat Access |
|---|---|---|
| `pending` | Request sent by initiator; awaiting recipient response. | ❌ Blocked |
| `accepted` | Mutual twinship confirmed by recipient. | ✅ Unlocked (Real-Time Direct Messaging) |
| `declined` | Recipient declined twinship. | ❌ Blocked |
| `blocked` | Either user blocked the connection. | ❌ Blocked |

---

## 3. Architecture & Data Model

### 3.1 Database Schema (`DirectMessage`)
```sql
CREATE TABLE direct_messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id),
    receiver_id VARCHAR(36) NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_dm_conversation ON direct_messages (sender_id, receiver_id, created_at);
```

### 3.2 Security & Access Control
- **Mutual Twin Verification Gate**:
  All direct message endpoints (`GET /api/v1/chat/conversations/{twin_id}/messages` and `POST /api/v1/chat/conversations/{twin_id}/messages`) enforce `verify_accepted_twin_connection`.
  ```python
  # Checks bidirectional acceptance
  connection = db.query(Connection).filter(
      or_(
          and_(Connection.requester_id == user_a_id, Connection.addressee_id == user_b_id),
          and_(Connection.requester_id == user_b_id, Connection.addressee_id == user_a_id)
      ),
      Connection.status == ConnectionStatus.ACCEPTED
  ).first()
  ```
  If not found, a `403 Forbidden` response is returned immediately.

---

## 4. API Endpoints

### 4.1 Connection Management (`/api/v1/users/connections`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users/{id}/connect` | Send twin request to user `{id}` with optional introductory note |
| `GET` | `/api/v1/users/connections` | List incoming requests, outgoing requests, and accepted twin connections |
| `PUT` | `/api/v1/users/connections/{id}/respond` | Accept or decline incoming twin request (`action: "accept" \| "decline"`) |
| `DELETE` | `/api/v1/users/connections/{id}` | Disconnect or cancel twin request |

### 4.2 Twin Direct Messaging (`/api/v1/chat`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/chat/conversations` | List all accepted twin conversations with latest message, timestamp, unread counts |
| `GET` | `/api/v1/chat/conversations/{twin_id}/messages` | Retrieve direct message history with twin; automatically marks unread messages as read |
| `POST` | `/api/v1/chat/conversations/{twin_id}/messages` | Send direct message to accepted twin |

---

## 5. Frontend Features & User Interface

1. **Match Profile Page (`/matches/[id]`)**:
   - Displays candidate's full profile picture (DP).
   - Dynamic Connection Button:
     - **Send Twin Request**: Initiates twinship request.
     - **Twin Request Pending**: Shows outbound pending status.
     - **Respond to Twin Request**: Prompts inline Accept/Decline if inbound.
     - **You are Twins! Open Twin Chat**: Direct link to `/messages?twin={id}`.

2. **Twin Chat Hub (`/messages`)**:
   - **Active Conversations**: Searchable list of accepted twins with real-time unread badges.
   - **Twin Requests Tab**: Dedicated inbox for incoming twin connection requests with one-click Accept / Decline actions.
   - **Message Viewport**:
     - Live message stream with bubble styling (sent vs received).
     - Full twin DP, handle, and online status badge.
     - Message timestamp formatting (`hh:mm a`).
     - Auto-polling (3s intervals) for real-time messaging without manual page refresh.
     - Auto-scroll to latest message on receive.

---

## 6. Verification & Testing

### Automated Test Coverage
Run backend integration tests:
```bash
pytest tests/test_twin_chat.py -v
```
Tests cover:
1. Sending a twin request from User A to User B.
2. Attempting to chat before acceptance (returns `403 Forbidden`).
3. User B accepting the twin request.
4. Sending direct messages between User A and User B.
5. Conversation list aggregation and unread badge decrements upon reading.
