import zipfile
import os
import glob

# === Configuration ===
# Directory where all images will be stored
output_dir = "/home/ridge/RMIT/Rover/RoverTeam-GUI/webrtc-gui/Model-Training/extracted_images"
os.makedirs(output_dir, exist_ok=True)

# === Find all .xlsx files in current directory ===
excel_files = sorted(glob.glob("*.xlsx"))

if not excel_files:
    print("No .xlsx files found in current directory.")
else:
    for excel_file in excel_files:
        print(f"\nProcessing: {excel_file}")

        # Open the Excel file as a ZIP archive
        with zipfile.ZipFile(excel_file, "r") as zip_ref:
            # Locate embedded images in xl/media
            image_files = [f for f in zip_ref.namelist() if f.startswith("xl/media/")]
            print(f"Found {len(image_files)} images in {excel_file}.")

            # Extract all images into the single output directory
            for image in image_files:
                filename = os.path.basename(image)
                # Prefix filename with Excel file name for uniqueness
                prefix = os.path.splitext(os.path.basename(excel_file))[0]
                out_name = f"{prefix}_{filename}"
                output_path = os.path.join(output_dir, out_name)

                with open(output_path, "wb") as f:
                    f.write(zip_ref.read(image))
                print(f"Saved: {output_path}")

        print(f"All embedded images from '{excel_file}' extracted to '{output_dir}'.")