import os
import secrets
import sys
import subprocess
import time
from urllib.error import URLError
from urllib.request import urlopen
from dotenv import dotenv_values

def run():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    file_settings = {}
    for relative_path in (".env", "backend/.env", "../.env"):
        file_settings.update(dotenv_values(os.path.join(root_dir, relative_path)))
    environment = os.environ.get("ENVIRONMENT", file_settings.get("ENVIRONMENT", "development")).lower()
    jwt_secret = os.environ.get("JWT_SECRET_KEY") or file_settings.get("JWT_SECRET_KEY")
    if not jwt_secret and environment in {"development", "dev"}:
        os.environ["JWT_SECRET_KEY"] = secrets.token_urlsafe(48)
    elif not jwt_secret:
        raise SystemExit("JWT_SECRET_KEY is required outside development.")

    print("========================================================")
    print("  Starting Flood-Flash Predictive Early Warning System ")
    print("========================================================")

    print("\n1. Initializing Database Schema (non-destructive)...")
    seed_cmd = [sys.executable, "-m", "backend.seed_data"]
    if "--reset" in sys.argv:
        seed_cmd.append("--reset")
    seed_proc = subprocess.run(seed_cmd, cwd=root_dir)
    if seed_proc.returncode != 0:
        raise SystemExit("Database initialization failed; services were not started.")

    print("\n2. Launching FastAPI Backend Server (http://localhost:8000)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=root_dir
    )

    frontend_proc = None
    try:
        deadline = time.monotonic() + 30
        while time.monotonic() < deadline:
            if backend_proc.poll() is not None:
                raise RuntimeError("Backend exited before becoming ready. Check the backend startup output.")
            try:
                with urlopen("http://127.0.0.1:8000/health", timeout=2) as response:
                    if response.status == 200:
                        break
            except (OSError, URLError):
                time.sleep(0.5)
        else:
            raise RuntimeError("Backend did not become ready within 30 seconds.")

        print("\n3. Launching Vite Frontend Dev Server (http://127.0.0.1:5173)...")
        frontend_proc = subprocess.Popen(
            "npm run dev -- --host 127.0.0.1",
            cwd=frontend_dir,
            shell=True
        )

        print("\n========================================================")
        print("  Both services are running!")
        print("  - Frontend UI:     http://127.0.0.1:5173")
        print("  - Backend API:      http://localhost:8000")
        print("  - API Docs:         http://localhost:8000/docs")
        print("  Press Ctrl+C at any time to stop both servers.")
        print("========================================================\n")

        while backend_proc.poll() is None:
            if frontend_proc.poll() is not None:
                raise RuntimeError("Frontend dev server stopped unexpectedly.")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
    finally:
        for proc in (frontend_proc, backend_proc):
            if proc is not None and proc.poll() is None:
                proc.terminate()
        for proc in (frontend_proc, backend_proc):
            if proc is not None:
                proc.wait()
        print("Services stopped.")

if __name__ == "__main__":
    run()
