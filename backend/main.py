import os
import sys
import threading
import time
import webbrowser
import uvicorn

# Ensure the backend directory is in the Python search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from app.main import app

def open_browser_delayed(url: str, delay_seconds: float = 1.5):
    """Open the user's default browser after server initialization."""
    def _open():
        time.sleep(delay_seconds)
        try:
            webbrowser.open(url)
        except Exception:
            pass
    threading.Thread(target=_open, daemon=True).start()

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload_flag = os.getenv("RELOAD", "false").lower() in ("true", "1", "yes")

    print("\n" + "=" * 62)
    print("           LUCINA AI &bull; CLINICAL & ATHLETIC PLATFORM          ")
    print("=" * 62)
    print(f"  [+] Server starting on:  http://{host}:{port}")
    print(f"  [+] Open in Browser:     http://localhost:{port}")
    print(f"  [+] API Documentation:   http://localhost:{port}/docs")
    print("=" * 62)
    print("  [INFO] Pre-seeded patients available:")
    print("         - Maya Patel (Endocrine / PCOS)")
    print("         - Sarah Jenkins (Athletic / RED-S)")
    print("         - Priya Sharma (Gestational 22w)")
    print("=" * 62 + "\n")

    # Automatically launch the web dashboard in default browser
    open_browser_delayed(f"http://localhost:{port}")

    # Run Uvicorn server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload_flag,
        log_level="info"
    )
