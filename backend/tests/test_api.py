"""
End-to-end API tests against the real FastAPI app, the real SQLite schema,
and — except where a test explicitly targets error handling — the real
TorchXRayVision model. No mocked AI output: these tests only pass if the
whole pipeline (preprocessing, inference, persistence) genuinely works.
"""

from pathlib import Path

SAMPLE_CHEST_XRAY = Path(__file__).parent / "fixtures" / "sample_chest_xray.png"


def _upload_sample(client):
    with open(SAMPLE_CHEST_XRAY, "rb") as f:
        return client.post(
            "/api/exams/analyze",
            files={"file": ("sample_chest_xray.png", f, "image/png")},
            data={"patient_age": "42", "clinical_indication": "Routine check"},
        )


def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_upload_valid_image_returns_real_predictions(client):
    res = _upload_sample(client)
    assert res.status_code == 200

    body = res.json()
    assert body["patient_id"]
    assert body["exam_id"]
    assert body["priority"] in {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
    assert len(body["predictions"]) == 18  # the model's full pathology list
    for p in body["predictions"]:
        assert 0.0 <= p["score"] <= 1.0
    assert body["processing_time_seconds"] > 0


def test_upload_invalid_extension_is_rejected(client):
    res = client.post(
        "/api/exams/analyze",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
    )
    assert res.status_code == 400
    assert "extension" in res.json()["detail"].lower()


def test_upload_empty_file_is_rejected(client):
    res = client.post(
        "/api/exams/analyze",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert res.status_code == 400


def test_analyze_creates_an_exam_visible_in_the_list(client):
    upload = _upload_sample(client)
    exam_id = upload.json()["exam_id"]

    res = client.get("/api/exams")
    assert res.status_code == 200
    ids = [e["id"] for e in res.json()]
    assert exam_id in ids


def test_get_exam_detail_matches_the_analysis(client):
    upload = _upload_sample(client)
    exam_id = upload.json()["exam_id"]

    res = client.get(f"/api/exams/{exam_id}")
    assert res.status_code == 200

    body = res.json()
    assert body["id"] == exam_id
    assert body["patient_age"] == 42
    assert body["clinical_indication"] == "Routine check"
    assert body["image_url"].startswith("/uploads/")
    assert len(body["predictions"]) == 18


def test_get_exam_detail_404_for_unknown_id(client):
    res = client.get("/api/exams/does-not-exist")
    assert res.status_code == 404


def test_review_workflow_updates_status(client):
    upload = _upload_sample(client)
    exam_id = upload.json()["exam_id"]

    before = client.get(f"/api/exams/{exam_id}").json()
    assert before["review_status"] == "Needs review"

    review = client.post(
        f"/api/exams/{exam_id}/review",
        json={"decision": "confirmed", "notes": "Looks right."},
    )
    assert review.status_code == 200
    assert review.json()["decision"] == "confirmed"

    after = client.get(f"/api/exams/{exam_id}").json()
    assert after["review_status"] == "Reviewed"


def test_report_draft_then_save(client):
    upload = _upload_sample(client)
    exam_id = upload.json()["exam_id"]

    draft = client.get(f"/api/exams/{exam_id}/report")
    assert draft.status_code == 200
    assert "AI FINDINGS" in draft.json()["draft_text"]
    assert draft.json()["edited_text"] is None

    saved = client.put(
        f"/api/exams/{exam_id}/report",
        json={"edited_text": "Edited by radiologist."},
    )
    assert saved.status_code == 200
    assert saved.json()["edited_text"] == "Edited by radiologist."
    # The original draft must survive an edit — never overwritten.
    assert "AI FINDINGS" in saved.json()["draft_text"]


def test_heatmap_returns_real_gradcam_images(client):
    upload = _upload_sample(client)
    exam_id = upload.json()["exam_id"]
    condition = upload.json()["predictions"][0]["condition"]

    res = client.get(f"/api/exams/{exam_id}/heatmap", params={"condition": condition})
    assert res.status_code == 200

    body = res.json()
    assert body["condition"] == condition
    assert len(body["image_base64"]) > 1000
    assert len(body["heatmap_base64"]) > 100
    assert condition in body["available_conditions"]


def test_heatmap_rejects_unknown_condition(client):
    upload = _upload_sample(client)
    exam_id = upload.json()["exam_id"]

    res = client.get(
        f"/api/exams/{exam_id}/heatmap", params={"condition": "Not A Real Pathology"}
    )
    assert res.status_code == 400


def test_model_error_is_handled_gracefully(client, monkeypatch):
    import app.api.exams as exams_module

    def broken_inference(_tensor):
        raise RuntimeError("simulated model failure")

    monkeypatch.setattr(exams_module, "run_inference", broken_inference)

    res = _upload_sample(client)
    assert res.status_code == 503
    assert "model error" in res.json()["detail"].lower()
