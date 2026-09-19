"""
DOPPEL Async & Sync Database Session Management
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from apps.api.core.config import settings

# Async Engine for FastAPI Request Handlers
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base ORM model
Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining async DB sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Create all tables asynchronously."""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
