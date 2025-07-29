import os

original_filenames = [
    "signanddance1.png",
    "signanddance2.png",
    "signanddance3.png",
    "signanddance4.png",
    "signanddance5.png",
]

new_filenames = [
    "singanddance1.png",
    "singanddance2.png",
    "singanddance3.png",
    "singanddance4.png",
    "singanddance5.png",
]


script_dir = os.path.dirname(os.path.abspath(__file__))
target_directory = os.path.join(script_dir, "..", "images")
target_directory = os.path.normpath(target_directory)

not_found = []
rename_errors = []
successfully_renamed = []

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