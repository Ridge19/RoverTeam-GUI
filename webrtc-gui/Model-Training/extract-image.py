import zipfile
import os

# === Configuration ===
excel_file = "Comparison of WC.xlsx"
output_dir = "extracted_images"

# === Extract images ===
with zipfile.ZipFile(excel_file, "r") as zip_ref:
    # Find image files in the xl/media directory
    image_files = [f for f in zip_ref.namelist() if f.startswith("xl/media/")]
    print(f"Found {len(image_files)} images.")

    # Create output folder if not exists
    os.makedirs(output_dir, exist_ok=True)

    # Extract all images
    for image in image_files:
        filename = os.path.basename(image)
        output_path = os.path.join(output_dir, filename)
        with open(output_path, "wb") as f:
            f.write(zip_ref.read(image))
        print(f"Saved: {output_path}")

print("✅ All embedded images have been extracted successfully!")