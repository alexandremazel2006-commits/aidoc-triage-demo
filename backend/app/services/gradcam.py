"""
Real Grad-CAM (Selvaraju et al., 2017) against the model's actual gradients
— never a simulated or hand-drawn localization.

Target layer: `model.features`, the output of the last dense block
(after norm5, before the final ReLU + global average pool). This is the
standard Grad-CAM target for a DenseNet and matches the model's own
forward pass exactly (see DenseNet.features2 in torchxrayvision), which we
inspected directly on the installed package rather than assuming.
"""

from __future__ import annotations

import io

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

from app.services.ai_model import get_loaded_device, get_model


class UnknownConditionError(ValueError):
    pass


def _jet_colormap(gray: np.ndarray) -> np.ndarray:
    """Approximate matplotlib's 'jet' colormap without the matplotlib
    dependency. `gray` in [0, 1], shape (H, W) -> uint8 (H, W, 3)."""
    gray = np.clip(gray, 0.0, 1.0)
    r = np.clip(1.5 - np.abs(4 * gray - 3), 0, 1)
    g = np.clip(1.5 - np.abs(4 * gray - 2), 0, 1)
    b = np.clip(1.5 - np.abs(4 * gray - 1), 0, 1)
    rgb = np.stack([r, g, b], axis=-1)
    return (rgb * 255).astype(np.uint8)


def _array_to_png_bytes(arr: np.ndarray) -> bytes:
    image = Image.fromarray(arr)
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    return buf.getvalue()


def compute_gradcam(image_tensor: torch.Tensor, condition: str) -> bytes:
    """Returns a colorized (224, 224, 3) Grad-CAM heatmap as PNG bytes,
    explaining the model's score for `condition` on `image_tensor`."""
    model = get_model()
    device = get_loaded_device()

    if condition not in model.pathologies:
        raise UnknownConditionError(
            f"'{condition}' is not one of this model's pathologies: {model.pathologies}"
        )
    class_idx = model.pathologies.index(condition)

    image_tensor = image_tensor.to(device).clone().requires_grad_(True)

    activations: dict[str, torch.Tensor] = {}

    def save_activation(_module, _input, output):
        output.retain_grad()
        activations["value"] = output

    handle = model.features.register_forward_hook(save_activation)
    try:
        model.zero_grad(set_to_none=True)
        output = model(image_tensor)
        score = output[0, class_idx]
        score.backward()

        acts = activations["value"]  # (1, C, H, W)
        grads = acts.grad  # (1, C, H, W)
        if grads is None:
            raise RuntimeError("Gradients did not flow back to the target layer.")

        weights = grads.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)
        cam = F.relu((weights * acts).sum(dim=1, keepdim=True))  # (1, 1, H, W)
        cam = F.interpolate(
            cam, size=image_tensor.shape[-2:], mode="bilinear", align_corners=False
        )
        cam = cam.squeeze().detach().cpu().numpy()
    finally:
        handle.remove()

    cam_min, cam_max = cam.min(), cam.max()
    cam_normalized = (cam - cam_min) / (cam_max - cam_min + 1e-8)

    colorized = _jet_colormap(cam_normalized)
    return _array_to_png_bytes(colorized)


def array_to_grayscale_png(arr_uint8: np.ndarray) -> bytes:
    """`arr_uint8`: (H, W) uint8 grayscale array -> PNG bytes."""
    return _array_to_png_bytes(arr_uint8)
