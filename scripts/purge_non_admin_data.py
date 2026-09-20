"""
DOPPEL Database Reset Script
Deletes all non-admin users, face profiles, matches, sessions, and resets the vector store.
Keeps only the super admin (admin@doppel.ai / AdminPass123!).
"""
import asyncio
import os
import sys

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, delete
from apps.api.db.session import AsyncSessionLocal
from apps.api.models.models import (
    User, FaceProfile, Consent, UserSettings, Match, 
    DiscoverySession, ImageAsset, ConnectionRequest, UserBlock, UserReport, DirectMessage, AuditLog
)
from apps.api.core.security import get_password_hash
from apps.api.repositories.vector_store import get_vector_store

async def reset_to_super_admin():
    async with AsyncSessionLocal() as session:
        print("[1/4] Querying existing users...")
        users_res = await session.execute(select(User))
        all_users = users_res.scalars().all()
        print(f"  Found {len(all_users)} users in database.")

        admin_user = None
        for u in all_users:
            if u.is_admin or u.email == "admin@doppel.ai":
                admin_user = u
                break

        # If admin doesn't exist, create it
        if not admin_user:
            print("[2/4] Creating Super Admin account (admin@doppel.ai)...")
            admin_user = User(
                email="admin@doppel.ai",
                username="admin",
                display_name="Doppel Super Admin",
                password_hash=get_password_hash("AdminPass123!"),
                is_admin=True,
                avatar="https://api.dicebear.com/7.x/bottts/svg?seed=admin_doppel",
                account_status="active"
            )
            session.add(admin_user)
            await session.flush()

            admin_consent = Consent(
                user_id=admin_user.id,
                biometric_processing_consent=True,
                discovery_consent=True
            )
            session.add(admin_consent)

            admin_settings = UserSettings(
                user_id=admin_user.id,
                profile_visibility="public",
                discovery_enabled=True,
                show_city=True,
                city_name="San Francisco, CA",
                bio="Platform administrator and security lead."
            )
            session.add(admin_settings)
            await session.commit()
        else:
            print(f"[2/4] Preserving Super Admin: {admin_user.email} (ID: {admin_user.id})")

        admin_id = admin_user.id

        print("[3/4] Purging non-admin records...")
        await session.execute(delete(DirectMessage))
        await session.execute(delete(ConnectionRequest))
        await session.execute(delete(UserReport))
        await session.execute(delete(UserBlock))
        await session.execute(delete(Match))
        await session.execute(delete(DiscoverySession))
        await session.execute(delete(ImageAsset).where(ImageAsset.user_id != admin_id))
        await session.execute(delete(FaceProfile).where(FaceProfile.user_id != admin_id))
        await session.execute(delete(Consent).where(Consent.user_id != admin_id))
        await session.execute(delete(UserSettings).where(UserSettings.user_id != admin_id))
        await session.execute(delete(AuditLog).where(AuditLog.user_id != admin_id))
        await session.execute(delete(User).where(User.id != admin_id))

        await session.commit()
        print("  All non-admin database records successfully removed.")

        print("[4/4] Resetting vector store index...")
        vector_store = get_vector_store()
        if hasattr(vector_store, "_vectors"):
            vector_store._vectors.clear()
            vector_store._metadata.clear()
        
        print("  Vector store successfully reset to empty.")

        count = await vector_store.count()
        print(f"\n[DONE] System successfully reset. Vector store indexed count: {count}")
        print("Super Admin credentials:")
        print("  Email:    admin@doppel.ai")
        print("  Password: AdminPass123!")

if __name__ == "__main__":
    asyncio.run(reset_to_super_admin())
