import json
import os
import pyperclip
import time
import pygetwindow as gw
import pyautogui

def load_json(filename):
    if not os.path.exists(filename):
        print(f"Error: {filename} not found.")
        return []
    with open(filename, 'r') as f:
        return json.load(f)

def save_json(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

def focus_gta_window():
    for window in gw.getAllWindows():
        if 'RAG' in window.title and not window.isActive and not window.isMinimized:
            try:
                window.activate()
                time.sleep(0.5)  # give time to focus
                return True
            except Exception as e:
                print(f"[Error] Could not activate window: {e}")
                return False
    return False


def send_command_to_gta():
    if focus_gta_window():
        time.sleep(0.5)  # allow the window to focus
        pyautogui.press('t')         # open chat
        time.sleep(0.1)
        pyautogui.typewrite('/sa')
        time.sleep(0.1)
        pyautogui.press('enter')     # send command
        time.sleep(0.1)
        pyautogui.press('t')         # open chat
        time.sleep(0.1)
        pyautogui.hotkey('ctrl', 'v')  # paste command
        time.sleep(0.1)
        pyautogui.press('enter')     # send command
        time.sleep(0.1)
        # alt-tab back to previous window
        pyautogui.hotkey('alt', 'tab')
        time.sleep(0.2)
        return True
    else:
        print("[Warning] GTA5 window not found or not focusable.")
        return False

def main():
    filename = 'process.json'
    data = load_json(filename)
    if not data:
        return

    for index, entry in enumerate(data):
        command = entry.get("command", "")
        tags = set(entry.get("tags", []))

        print("\nCurrently processing:")
        print(f"Command: {command}")
        
        pyperclip.copy(command)

        # Attempt to send the command into GTA
        sent = send_command_to_gta()
        if not sent:
            print("[Could not send command into GTA]")

        user_input = input("Enter tags to add (space-separated): ").strip()
        if user_input:
            new_tags = user_input.split()
            tags.update(new_tags)

        entry["tags"] = sorted(tags)
        print(f"Updated tags: {entry['tags']}")

        save_json(filename, data)

    print("\nAll entries processed and saved.")

if __name__ == "__main__":
    main()
