import os

# === Hardcoded Lists ===
original_filenames = [
    "hotemwithdatdance.png",
    "marashinodance.png",
    "milkyrockdance.png",
    "slidechance1.png",
    "studygrounddance.png",
    "woodwalkdance.png"
]

new_filenames = [
    "hitemwithdatdance.png",
    "maraschinodance.png",
    "millyrockdance.png",
    "slidedance1.png",
    "sturdygrounddance.png",
    "woowalkdance.png"
]

# === Folder to search in ===
# You can set this to any path you want
target_directory = "./images"

# === Debug info collectors ===
not_found = []
rename_errors = []
successfully_renamed = []

# === Renaming process ===
for old_name, new_name in zip(original_filenames, new_filenames):
    old_path = os.path.join(target_directory, old_name)
    new_path = os.path.join(target_directory, new_name)

    if not os.path.exists(old_path):
        not_found.append(old_name)
        continue

    try:
        os.rename(old_path, new_path)
        successfully_renamed.append((old_name, new_name))
    except Exception as e:
        rename_errors.append((old_name, new_name, str(e)))

# === Debug Summary ===
print("\n--- Rename Operation Report ---")

print("\nSuccessfully Renamed:")
for old, new in successfully_renamed:
    print(f"  {old} -> {new}")

print("\nFiles Not Found:")
for name in not_found:
    print(f"  {name}")

print("\nRename Errors:")
for old, new, error in rename_errors:
    print(f"  {old} -> {new} | Error: {error}")

print("\n--- End of Report ---")