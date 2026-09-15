"""
Minimal sanity-check script for the TorchXRayVision model, per RadioCheck AI
Phase 2. Run it directly (not through FastAPI) to confirm the model loads and
produces real predictions on a chest X-ray image before wiring it into the
API.

Usage:
    python test_model.py /path/to/chest-xray.jpg
"""

import sys

import numpy as np
import skimage.io
import torch
import torchvision
import torchxrayvision as xrv


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    if torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


def load_and_preprocess(image_path: str) -> torch.Tensor:
    img = skimage.io.imread(image_path)

    # torchxrayvision's own normalize() expects the raw max pixel value and
    # reshape=True both collapses to a single channel and adds the leading
    # channel dimension — this exact call is what the library's README uses.
    img = xrv.utils.normalize(img, maxval=255, reshape=True)

    transform = torchvision.transforms.Compose(
        [xrv.datasets.XRayCenterCrop(), xrv.datasets.XRayResizer(224)]
    )
    img = transform(img)

    tensor = torch.from_numpy(img).unsqueeze(0)  # (1, 1, 224, 224)
    return tensor.float()


def main():
    if len(sys.argv) != 2:
        print("Usage: python test_model.py /path/to/chest-xray.jpg")
        sys.exit(1)

    image_path = sys.argv[1]
    device = get_device()
    print(f"Using device: {device}")

    print("Loading densenet121-res224-all (downloads weights on first run)...")
    model = xrv.models.DenseNet(weights="densenet121-res224-all")
    model = model.to(device)
    model.eval()
    print(f"Model pathologies ({len(model.pathologies)}): {model.pathologies}")

    img_tensor = load_and_preprocess(image_path).to(device)
    print(f"Preprocessed image shape: {tuple(img_tensor.shape)}")

    with torch.no_grad():
        outputs = model(img_tensor)

    scores = outputs[0].cpu().numpy()
    ranked = sorted(zip(model.pathologies, scores), key=lambda x: x[1], reverse=True)

    print("\nModel output scores (not calibrated clinical probabilities):")
    for pathology, score in ranked:
        if pathology:  # some entries in `pathologies` can be empty strings
            print(f"  {pathology:25s} {score:.4f}")


if __name__ == "__main__":
    main()
