import os
import json

# Path to your folder containing PNG files
folder_path = '../images'

# List to store the entries
entries = []

# Loop through all files in the folder
for filename in os.listdir(folder_path):
    if filename.lower().endswith('.png'):
        name = os.path.splitext(filename)[0]  # Remove the .png extension
        entry = {
            "command": f"/anim {name}",
            "keywords": []
        }
        entries.append(entry)

# Output file path
output_file = os.path.join("./", 'animations_generated.json')

# Write to file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(entries, f, indent=2)

print(f"Generated {output_file} with {len(entries)} entries.")
