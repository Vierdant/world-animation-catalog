import requests
from PIL import Image
from io import BytesIO
import json

GITHUB_JSON_URL = "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/animations.json"
GITHUB_IMAGE_REPO = "https://raw.githubusercontent.com/Vierdant/world-animation-catalog/main/images/"

def format_image_name(command):
    """Extract the second word from the command string."""
    parts = command.split(" ")
    return parts[1] if len(parts) > 1 else None

def fetch_json(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"[ERROR] Failed to fetch JSON: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"[ERROR] Invalid JSON format: {e}")
        return None

def test_image_url(image_url):
    try:
        response = requests.get(image_url, timeout=10)
        if response.status_code == 429:
            return None, "429 Too Many Requests"
        response.raise_for_status()
        Image.open(BytesIO(response.content)).verify()
        return True, None
    except requests.HTTPError as e:
        return False, f"HTTP error: {e.response.status_code}"
    except requests.RequestException as e:
        return False, f"Request error: {e}"
    except (IOError, SyntaxError) as e:
        return False, f"Invalid image data: {e}"

def process_animations(data):
    results = {}
    for animation in data:
        command = animation.get("command", "")
        image_name = format_image_name(command)
        if not image_name:
            results[command] = (False, "Invalid command format, cannot extract image name.")
            continue

        image_url = f"{GITHUB_IMAGE_REPO}{image_name}.png"
        status, error = test_image_url(image_url)

        # Skip logging/reporting for 429 errors
        if error == "429 Too Many Requests":
            continue

        results[image_url] = (status, error)

    return results

def generate_report(results):
    report = {
        "total_images": len(results),
        "successful": [],
        "failed": []
    }

    for url, (status, error) in results.items():
        if status:
            report["successful"].append(url)
        else:
            report["failed"].append({"url": url, "error": error})

    return report

def main():
    print("[INFO] Fetching JSON data...")
    data = fetch_json(GITHUB_JSON_URL)
    if not data:
        return

    print(f"[INFO] Processing {len(data)} animations...")
    results = process_animations(data)

    report = generate_report(results)

    print("\n=== IMAGE TEST REPORT ===")
    print(f"Total Images Tested (excluding 429s): {report['total_images']}")
    print(f"Successful: {len(report['successful'])}")
    print(f"Failed: {len(report['failed'])}")

    if report["failed"]:
        print("\nFailures:")
        for fail in report["failed"]:
            print(f" - URL: {fail['url']}")
            print(f"   Error: {fail['error']}")

    with open("image_test_report.json", "w") as f:
        json.dump(report, f, indent=2)
        print("\n[INFO] Report saved as image_test_report.json")

if __name__ == "__main__":
    main()
