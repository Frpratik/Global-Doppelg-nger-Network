"""
DOPPEL Demo Data Seeder
Populates the database and vector store with 60+ synthetic consenting demo personas.
Does NOT use real people's private data or internet scraping.
"""
import asyncio
import random
import numpy as np
import os
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add project root to PYTHONPATH
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from datetime import datetime, timezone
from sqlalchemy import select
from apps.api.db.session import AsyncSessionLocal, init_db
from apps.api.models.models import User, Consent, FaceProfile, UserSettings, ImageAsset
from apps.api.core.security import get_password_hash
from apps.api.repositories.vector_store import get_vector_store
from apps.api.core.config import settings
from packages.shared.constants import AccountStatus, ProfileVisibility

CITIES = [
    "Tokyo", "Berlin", "San Francisco", "London", "Toronto",
    "Seoul", "Singapore", "Sydney", "Paris", "Austin",
    "Stockholm", "Amsterdam", "New York", "São Paulo", "Dublin"
]

DEMO_PERSONAS = [
    ("Elena Rostova", "elena_r", "Visual designer & generative artist.", "female"),
    ("Marcus Vance", "marcus_v", "Distributed systems engineer & coffee lover.", "male"),
    ("Aria Thorne", "aria_t", "Cognitive neuroscientist researching facial perception.", "female"),
    ("Kai Chen", "kai_c", "Hardware hacker & ambient music creator.", "male"),
    ("Sophia Martinez", "sophia_m", "Architectural designer exploring spatial audio.", "female"),
    ("Dmitri Volkov", "dmitri_v", "Robotics perception specialist.", "male"),
    ("Amara Okafor", "amara_o", "Bioinformatics researcher & triathlete.", "female"),
    ("Liam Gallagher", "liam_g", "Game engine developer & VR enthusiast.", "male"),
    ("Zoe Zimmerman", "zoe_z", "Cinematographer & optical instrument collector.", "female"),
    ("Hassan Al-Mansoor", "hassan_m", "Cryptographic protocols researcher.", "male"),
    ("Chloe Dubois", "chloe_d", "Fashion technologist & generative weaver.", "female"),
    ("Ravi Sharma", "ravi_s", "Autonomous drone flight controls engineer.", "male"),
    ("Yuki Tanaka", "yuki_t", "Deep learning researcher in facial geometry.", "female"),
    ("Gabriel Silva", "gabriel_s", "Astrobiology enthusiast & rock climber.", "male"),
    ("Nia Patel", "nia_p", "UI/UX lead building ethical AI interfaces.", "female"),
    ("Oliver Queen", "oliver_q", "Open source contributor & cyclist.", "male"),
    ("Isabella Rossi", "isabella_r", "Opera vocalist and vocal acoustic analyst.", "female"),
    ("Lucas Moreau", "lucas_m", "Philosophy of AI lecturer & mountaineer.", "male"),
    ("Freja Lindqvist", "freja_l", "Solar energy engineer from Scandinavia.", "female"),
    ("Mateo Hernandez", "mateo_h", "Digital signal processing engineer.", "male")
]

def generate_synthetic_embedding(base_seed: int, variance: float = 0.15) -> list:
    """Generate a realistic 512-d normalized synthetic embedding clustered around archetypes."""
    rng = np.random.default_rng(base_seed)
    archetype = rng.normal(0.0, 1.0, settings.EMBEDDING_DIMENSION)
    archetype /= np.linalg.norm(archetype)
    
    noise = np.random.normal(0.0, variance, settings.EMBEDDING_DIMENSION)
    vec = archetype + noise
    vec /= np.linalg.norm(vec)
    return vec.tolist()

async def seed_demo():
    print("Initializing Database...")
    await init_db()
    vector_store = get_vector_store()

    async with AsyncSessionLocal() as session:
        print(f"Seeding demo users and indexing synthetic face embeddings...")
        
        # 1. Create Admin User
        admin_stmt = select(User).where(User.email == "admin@doppel.ai")
        admin_res = await session.execute(admin_stmt)
        admin = admin_res.scalar_one_or_none()
        if not admin:
            admin = User(
                email="admin@doppel.ai",
                username="admin",
                display_name="Doppel System Admin",
                password_hash=get_password_hash("AdminPass123!"),
                is_admin=True,
                avatar="https://api.dicebear.com/7.x/bottts/svg?seed=admin_doppel",
                account_status=AccountStatus.ACTIVE.value
            )
            session.add(admin)
            await session.flush()
            
            admin_consent = Consent(
                user_id=admin.id,
                biometric_processing_consent=True,
                discovery_consent=True,
                accepted_at=datetime.now(timezone.utc)
            )
            session.add(admin_consent)

            admin_settings = UserSettings(
                user_id=admin.id,
                profile_visibility=ProfileVisibility.PUBLIC.value,
                discovery_enabled=True,
                show_city=True,
                city_name="San Francisco",
                bio="Platform administrator and security engineer."
            )
            session.add(admin_settings)

        # 2. Create 60 Synthetic Personas with Archetype Clusters
        # We create 10 archetypes so multiple users are close "visual twins"
        archetype_seeds = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1010]
        
        count = 0
        for i in range(60):
            persona_idx = i % len(DEMO_PERSONAS)
            name, uname_base, bio, gender = DEMO_PERSONAS[persona_idx]
            suffix = f"_{i+1}" if i >= len(DEMO_PERSONAS) else ""
            username = f"{uname_base}{suffix}"
            email = f"{username}@example.com"

            # Check if exists
            user_stmt = select(User).where(User.username == username)
            u_res = await session.execute(user_stmt)
            if u_res.scalar_one_or_none():
                continue

            user = User(
                email=email,
                username=username,
                display_name=f"{name} {suffix}".strip(),
                password_hash=get_password_hash("DemoUserPass123!"),
                avatar=f"https://api.dicebear.com/7.x/adventurer/svg?seed={username}&gender={gender}",
                account_status=AccountStatus.ACTIVE.value
            )
            session.add(user)
            await session.flush()

            # Consents
            consent = Consent(
                user_id=user.id,
                biometric_processing_consent=True,
                discovery_consent=True,
                accepted_at=datetime.now(timezone.utc)
            )
            session.add(consent)

            # Settings
            city = random.choice(CITIES)
            settings_obj = UserSettings(
                user_id=user.id,
                profile_visibility=ProfileVisibility.DISCOVERY_ONLY.value,
                discovery_enabled=True,
                allow_contact_requests=True,
                show_city=True,
                city_name=city,
                bio=bio
            )
            session.add(settings_obj)

            # Assign to an archetype cluster (so some people have ~85-95% similarity!)
            arch_seed = archetype_seeds[i % len(archetype_seeds)]
            # variance: 0.08 for very close twins, 0.20 for moderate
            variance = 0.08 if (i % 2 == 0) else 0.22
            embedding = generate_synthetic_embedding(arch_seed, variance=variance)

            quality_score = round(random.uniform(0.85, 0.98), 2)
            face_profile = FaceProfile(
                user_id=user.id,
                model_name=settings.MODEL_NAME,
                model_version=settings.MODEL_VERSION,
                embedding_dimension=settings.EMBEDDING_DIMENSION,
                quality_score=quality_score,
                blur_score=round(random.uniform(120.0, 220.0), 1),
                brightness_score=round(random.uniform(110.0, 160.0), 1),
                face_box=[120, 90, 280, 280],
                enrollment_status="enrolled"
            )
            session.add(face_profile)

            # Index in VectorStore
            await vector_store.upsert_embedding(
                user_id=user.id,
                embedding=embedding,
                metadata={
                    "user_id": user.id,
                    "display_name": user.display_name,
                    "username": user.username,
                    "city": city,
                    "quality_score": quality_score
                }
            )
            count += 1

        await session.commit()
        print(f"Successfully seeded {count} consenting demo users into Doppel database and vector store!")

if __name__ == "__main__":
    asyncio.run(seed_demo())
