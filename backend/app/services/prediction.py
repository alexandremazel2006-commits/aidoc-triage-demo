"""
Runs the loaded model on a preprocessed image tensor. Only returns the
pathologies the loaded model actually predicts — never a hardcoded list.
"""

from __future__ import annotations

import time

import torch

from app.services.ai_model import get_loaded_device, get_model


def run_inference(image_tensor: torch.Tensor) -> tuple[list[dict], float]:
    """Returns (predictions sorted by score desc, processing_time_seconds)."""
    model = get_model()
    device = get_loaded_device()

    image_tensor = image_tensor.to(device)

    start = time.perf_counter()
    with torch.no_grad():
        outputs = model(image_tensor)
    elapsed = time.perf_counter() - start

    scores = outputs[0].cpu().numpy()

    predictions = [
        {"condition": pathology, "score": float(score)}
        for pathology, score in zip(model.pathologies, scores)
        if pathology  # a couple of entries in model.pathologies are ""
    ]
    predictions.sort(key=lambda p: p["score"], reverse=True)

    return predictions, elapsed
