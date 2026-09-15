"""
Image preprocessing that exactly matches TorchXRayVision's expected input
pipeline. Values and steps are taken from the library itself
(xrv.utils.normalize, XRayCenterCrop, XRayResizer) — nothing invented here.
"""

from __future__ import annotations

import io

import numpy as np
import skimage.io
import torch
import torchvision
import torchxrayvision as xrv

_TRANSFORM = torchvision.transforms.Compose(
    [xrv.datasets.XRayCenterCrop(), xrv.datasets.XRayResizer(224)]
)


class InvalidImageError(ValueError):
    pass


def preprocess_image_bytes(file_bytes: bytes) -> torch.Tensor:
    """Decode raw image bytes and return a (1, 1, 224, 224) float tensor."""
    try:
        img = skimage.io.imread(io.BytesIO(file_bytes))
    except Exception as exc:
        raise InvalidImageError(f"Could not decode image: {exc}") from exc

    if img is None or img.size == 0:
        raise InvalidImageError("Decoded image is empty.")

    # Some PNGs are float64 in [0, 1] rather than uint8 in [0, 255] — bring
    # everything to the 0-255 range xrv.utils.normalize expects.
    if np.issubdtype(img.dtype, np.floating):
        img = (img * 255).astype(np.uint8)

    maxval = 255
    if img.max() > maxval:
        # 16-bit images occasionally appear; rescale rather than crash.
        img = (img.astype(np.float32) / img.max() * 255).astype(np.uint8)

    img = xrv.utils.normalize(img, maxval=maxval, reshape=True)
    img = _TRANSFORM(img)

    tensor = torch.from_numpy(img).unsqueeze(0)  # (1, 1, 224, 224)
    return tensor.float()
