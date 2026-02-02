import os
import glob
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.metrics.pairwise import euclidean_distances
from skimage.io import imread
from skimage.color import rgb2gray
from skimage.filters import sobel
from skimage.util import img_as_float
from skimage.transform import resize

# === 1. Load image data ===
img_paths = sorted(
    glob.glob("/home/ridge/RMIT/Rover/RoverTeam-GUI/webrtc-gui/Model-Training/extracted_images/image*.*")
)
print(f"Found {len(img_paths)} extracted images.")

# === 2. Link images with water‑content labels ===
wc_levels = [0.0, 0.025, 0.05, 0.075, 0.1, 0.125,
             0.15, 0.175, 0.2, 0.225, 0.25, 0.275]
water_content = np.repeat(wc_levels, 3)

# Truncate to equal lengths
min_len = min(len(img_paths), len(water_content))
img_paths = img_paths[:min_len]
water_content = water_content[:min_len]

# === 3. Feature extraction ===
def extract_features(img_path, target_size=(128, 128)):
    img = imread(img_path)
    img = resize(img, target_size, anti_aliasing=True)
    img = img_as_float(img)
    if img.ndim == 2:
        img = np.stack([img]*3, axis=-1)
    elif img.shape[-1] == 4:
        img = img[..., :3]

    # colour histograms
    hist_features = []
    for ch in range(3):
        hist, _ = np.histogram(img[..., ch], bins=16, range=(0, 1), density=False)
        hist = hist / hist.sum()                       # normalise to sum=1
        hist_features.extend(hist)

    # simple edge‑texture stats
    edges = sobel(rgb2gray(img))
    texture_mean, texture_std = edges.mean(), edges.std()
    return np.hstack([hist_features, [texture_mean, texture_std]])

# === 4. Build feature matrix ===
X = np.array([extract_features(p) for p in img_paths])
y = water_content

# === 5. Train/test split & scaling ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled  = scaler.transform(X_test)

# === 6. Train regression model ===
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train_scaled, y_train)

# === 7. Evaluate ===
y_pred = model.predict(X_test_scaled)
mae = mean_absolute_error(y_test, y_pred)
print(f"Mean Absolute Error: {mae:.4f}")

plt.scatter(y_test, y_pred, alpha=0.7)
plt.plot([y.min(), y.max()], [y.min(), y.max()], "r--")
plt.xlabel("Actual WC")
plt.ylabel("Predicted WC")
plt.title("Predicted vs Actual Water Content")
plt.show()

# === 8. Compare a microscope screenshot ===
def compare_to_screenshot(screenshot_path):
    # feature extraction and scaling
    screenshot_features = extract_features(screenshot_path).reshape(1, -1)
    screenshot_scaled   = scaler.transform(screenshot_features)

    predicted_wc = model.predict(screenshot_scaled)[0]
    print(f"Predicted water content for {os.path.basename(screenshot_path)}: {predicted_wc:.3f}")

    # --- distances in scaled space ---
    X_scaled_all = np.vstack((X_train_scaled, X_test_scaled))
    distances = euclidean_distances(screenshot_scaled, X_scaled_all)[0]
    similarities = 1 / (1 + distances)

    top_indices = np.argsort(distances)[:3]
    print("Most similar training images:")
    for rank, idx in enumerate(top_indices, 1):
        print(f"  {rank}. {os.path.basename(img_paths[idx])} "
              f"(WC={y[idx]:.3f}, distance={distances[idx]:.4f}, "
              f"similarity={similarities[idx]:.3f})")

    # --- plot ---
    plt.figure(figsize=(10, 4))
    plt.subplot(1, 4, 1)
    plt.imshow(mpimg.imread(screenshot_path))
    plt.title("Microscope Screenshot")
    plt.axis("off")

    for i, idx in enumerate(top_indices, 1):
        plt.subplot(1, 4, i+1)
        plt.imshow(mpimg.imread(img_paths[idx]))
        plt.title(f"Train Img {i}\nWC={y[idx]:.3f}")
        plt.axis("off")

    plt.tight_layout()
    plt.show()

# === 9. Loop through screenshots ===
screenshot_dir = "/home/ridge/RMIT/Rover/RoverTeam-GUI/webrtc-gui/Model-Training/screenshots"
screenshot_files = sorted(
    glob.glob(os.path.join(screenshot_dir, "*.png")) +
    glob.glob(os.path.join(screenshot_dir, "*.jpg"))
)

if not screenshot_files:
    print(f"No screenshots found in: {screenshot_dir}")
else:
    for path in screenshot_files:
        print(f"\nComparing {os.path.basename(path)} ...")
        compare_to_screenshot(path)