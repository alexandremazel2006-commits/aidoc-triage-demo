"""
Loads the TorchXRayVision model exactly once and keeps it in memory for the
lifetime of the process — never reload it per-request.
"""

from __future__ import annotations

import torch
import torchxrayvision as xrv

MODEL_WEIGHTS = "densenet121-res224-all"

_model: xrv.models.DenseNet | None = None
_device: torch.device | None = None


def get_device() -> torch.device:
    """CUDA > MPS (Apple Silicon) > CPU, with a safe fallback."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    if torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def load_model() -> xrv.models.DenseNet:
    """Load the model once and cache it at module level."""
    global _model, _device
    if _model is not None:
        return _model

    _device = get_device()
    model = xrv.models.DenseNet(weights=MODEL_WEIGHTS)
    model = model.to(_device)
    model.eval()

    _model = model
    return _model


def get_model() -> xrv.models.DenseNet:
    if _model is None:
        raise RuntimeError(
            "Model not loaded yet — load_model() must run at application startup."
        )
    return _model


def get_loaded_device() -> torch.device:
    if _device is None:
        raise RuntimeError("Model not loaded yet.")
    return _device
