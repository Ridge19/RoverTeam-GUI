# analysis.py
import glob
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from skimage.io import imread
from skimage.color import rgb2gray
from skimage.filters import sobel
from skimage.util import img_as_float
from skimage.transform import resize
import os

# === 1. Load image data from extracted folder ===
# Folder should have files like: Model-Training/extracted_images/image1.png, image2.png, etc.
img_paths = sorted(glob.glob("/home/ridge/RMIT/Rover/RoverTeam-GUI/webrtc-gui/Model-Training/extracted_images/image*.*"))
print(f"Found {len(img_paths)} extracted images.")

# === 2. Link each image with water content (WC) ===
# Based on the data from Comparison of WC.xlsx [1]
# Each water content level had 3 images in the sheet
wc_levels = [
    0.0, 0.025, 0.05, 0.075, 0.1, 0.125, 0.15, 0.175, 0.2, 0.225, 0.25, 0.275
]
# Repeat each WC 3 times (for Image1, Image2, Image3)
water_content = np.repeat(wc_levels, 3)

# Truncate or pad lengths to match number of images, if mismatched
if len(img_paths) != len(water_content):
    min_len = min(len(img_paths), len(water_content))
    img_paths = img_paths[:min_len]
    water_content = water_content[:min_len]

# === 3. Feature extraction ===
def extract_features(img_path, target_size=(128, 128)):
    img = imread(img_path)
    img = resize(img, target_size, anti_aliasing=True)
    img = img_as_float(img)

    # If image has 4 channels (RGBA), discard the alpha channel
    if img.shape[-1] == 4:
        img = img[..., :3]

    # If image is grayscale (2D), expand to 3 identical channels
    if len(img.shape) == 2:
        img = np.stack([img]*3, axis=-1)

    # --- Color histogram features ---
    hist_features = []
    for ch in range(3):
        hist, _ = np.histogram(img[..., ch], bins=16, range=(0, 1), density=True)
        hist_features.extend(hist)

    # --- Texture feature using Sobel edge filter ---
    gray = rgb2gray(img)
    edges = sobel(gray)
    texture_mean, texture_std = edges.mean(), edges.std()

    return np.hstack([hist_features, [texture_mean, texture_std]])

# === 4. Compute feature matrix ===
X = np.array([extract_features(p) for p in img_paths])
y = water_content

# === 5. Train/test split ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === 6. Train regression model ===
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# === 7. Evaluate ===
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Mean Absolute Error: {mae:.4f}")

# === 8. Plot results ===
plt.scatter(y_test, y_pred, alpha=0.7)
plt.plot([y.min(), y.max()], [y.min(), y.max()], "r--")
plt.xlabel("Actual WC (%)")
plt.ylabel("Predicted WC (%)")
plt.title("Predicted vs Actual Water Content")
plt.show()

# === 9. show most likely image for a given WC ===
def show_img_for_wc(wc_value):
    wc_levels = [
        0.0, 0.025, 0.05, 0.075, 0.1, 0.125, 0.15,
        0.175, 0.2, 0.225, 0.25, 0.275
    ]
    group_size = 3
    idx = (np.abs(np.array(wc_levels) - wc_value)).argmin()
    group_start = idx * group_size
    group_end = min(group_start + group_size, len(img_paths))

    plt.figure(figsize=(12, 4))
    for i, path in enumerate(img_paths[group_start:group_end], 1):
        img = mpimg.imread(path)
        plt.subplot(1, group_size, i)
        plt.imshow(img)
        plt.axis("off")
        plt.title(f"{wc_levels[idx]*100:.1f}% WC (image {i})")

    plt.tight_layout()
    plt.show()

# === Show all WC sample groups sequentially ===
for wc in [
    0.0, 0.025, 0.05, 0.075, 0.1, 0.125, 0.15,
    0.175, 0.2, 0.225, 0.25, 0.275
]:
    show_img_for_wc(wc)
