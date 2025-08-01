import json
import os

CATEGORY_TAGS = [
    "sitting",
    "laying",
    "standing",
    "food",
    "working",
    "expressions",
    "gangsigns",
    "phone",
    "ground",
    "walking",
    "smoking",
    "leaning",
    "surrender",
    "social",
    "regular_dances",
    "rave_dances",
    "professional_dances",
    "adult",
    "items",
    "gestures",
    "fighting",
    "exercises",
    "poses",
    "tactical",
    "vehicle"
]
TYPE_TAGS = ['pose', 'loop', 'scene']
GENDER_TAGS = ['female', 'male']
FINAL_TAGS = ['controls']

def reorder_tags(tags, priority_category):
    tags_set = set(tags)
    ordered = []

    if priority_category in tags_set:
        ordered.append(priority_category)
        tags_set.remove(priority_category)

    for category in CATEGORY_TAGS:
        if category != priority_category and category in tags_set:
            ordered.append(category)
            tags_set.remove(category)
            break

    for tag in TYPE_TAGS:
        if tag in tags_set:
            ordered.append(tag)
            tags_set.remove(tag)
            break

    for tag in GENDER_TAGS:
        if tag in tags_set:
            ordered.append(tag)
            tags_set.remove(tag)
            break

    for tag in FINAL_TAGS:
        if tag in tags_set:
            ordered.append(tag)
            tags_set.remove(tag)
            break

    remaining = sorted(tags_set)
    ordered.extend(remaining)

    return ordered

def main():
    filename = 'process.json'
    if not os.path.exists(filename):
        print("process.json not found.")
        return

    with open(filename, 'r') as f:
        data = json.load(f)

    priority_category = input("Enter a tag to prioritize as the first category: ").strip().lower()

    for entry in data:
        tags = entry.get("tags", [])
        reordered = reorder_tags(tags, priority_category)
        entry["tags"] = reordered

    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

    print("Tags reordered and saved in process.json")

if __name__ == "__main__":
    main()
