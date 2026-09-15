import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

TEST_DB_PATH = Path(__file__).parent / "test_radiocheck.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_PATH}"

FIXTURES_DIR = Path(__file__).parent / "fixtures"
SAMPLE_CHEST_XRAY = FIXTURES_DIR / "sample_chest_xray.png"


@pytest.fixture(scope="session")
def test_engine():
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    yield engine
    engine.dispose()
    if TEST_DB_PATH.exists():
        os.remove(TEST_DB_PATH)


@pytest.fixture(scope="session")
def client(test_engine):
    # Import app pieces lazily, after we can point the DB at the test engine.
    from app.database import Base, get_db
    from app.main import app

    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # The `with` form runs the app's lifespan (loads the real model once
    # for the whole test session — no mocking of the AI itself).
    with TestClient(app) as test_client:
        yield test_client
