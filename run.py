import subprocess
import sys
import time
import threading
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

PORT = 8765

def open_browser():
    # Allow the server a moment to start up
    time.sleep(0.8)
    webbrowser.open(f"http://localhost:{PORT}")

if __name__ == '__main__':
    # Change working directory to script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if script_dir:
        os.chdir(script_dir)
        
    threading.Thread(target=open_browser, daemon=True).start()
    print(f"DSA Graph running at http://localhost:{PORT} — Ctrl+C to stop")
    try:
        HTTPServer(("", PORT), SimpleHTTPRequestHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nStopping DSA Graph server. Goodbye!")
        sys.exit(0)
