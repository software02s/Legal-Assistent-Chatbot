import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from chat import app
import pytest

@pytest.fixture
def client():
    app.testing = True
    return app.test_client()

def test_greeting(client):
    response = client.post("/api/message", json={"message": "Përshëndetje"})
    assert response.status_code == 200
    assert "ligjor" in response.get_json()["response"]
