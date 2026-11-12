"""
AAA Real Estate - Multi-Device Sync Server
Serves static web files and provides REST API to sync property database & uploaded images
across desktop, laptop, mobile, and tablets on the local network.
"""
import http.server
import socketserver
import json
import os
import re
import base64
import time
import socket

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
PROPS_FILE = os.path.join(DIRECTORY, "properties.json")
UPLOADS_DIR = os.path.join(DIRECTORY, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)

class RealEstateHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS for cross-device requests and disable aggressive caching for data files
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if self.path.startswith("/api/") or self.path.endswith(".json"):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/api/properties":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            if os.path.exists(PROPS_FILE):
                with open(PROPS_FILE, "rb") as f:
                    self.wfile.write(f.read())
            else:
                self.wfile.write(b"[]")
            return

        if self.path.split("?")[0] == "/api/server-info":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            info = {
                "status": "online",
                "port": PORT,
                "server_time": int(time.time()),
                "properties_count": 0
            }
            if os.path.exists(PROPS_FILE):
                try:
                    with open(PROPS_FILE, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        info["properties_count"] = len(data)
                except Exception:
                    pass
            self.wfile.write(json.dumps(info).encode("utf-8"))
            return

        # Serve static files as standard
        super().do_GET()

    def do_POST(self):
        clean_path = self.path.split("?")[0]

        # 1. Save Full Properties Database to properties.json
        if clean_path == "/api/properties":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length <= 0:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'{"error": "Empty body"}')
                return

            try:
                body = self.rfile.read(content_length).decode("utf-8")
                props_data = json.loads(body)
                if not isinstance(props_data, list):
                    raise ValueError("Properties must be a JSON array")

                with open(PROPS_FILE, "w", encoding="utf-8") as f:
                    json.dump(props_data, f, indent=2, ensure_ascii=False)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                resp = {"success": True, "count": len(props_data), "saved_at": int(time.time())}
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                print(f"[SYNC SERVER] Successfully saved {len(props_data)} properties to {PROPS_FILE}")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                err_resp = {"error": str(e)}
                self.wfile.write(json.dumps(err_resp).encode("utf-8"))
            return

        # 2. Upload Image File and save to /uploads folder
        if clean_path == "/api/upload":
            content_length = int(self.headers.get("Content-Length", 0))
            try:
                body = self.rfile.read(content_length).decode("utf-8")
                payload = json.loads(body)
                data_url = payload.get("data", "")
                ext = "jpg"
                if "image/png" in data_url: ext = "png"
                elif "image/webp" in data_url: ext = "webp"

                # Extract base64 part
                if "," in data_url:
                    base64_data = data_url.split(",", 1)[1]
                else:
                    base64_data = data_url

                file_bytes = base64.b64decode(base64_data)
                filename = f"prop_{int(time.time()*1000)}_{os.urandom(3).hex()}.{ext}"
                filepath = os.path.join(UPLOADS_DIR, filename)

                with open(filepath, "wb") as f:
                    f.write(file_bytes)

                rel_url = f"uploads/{filename}"
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                resp = {"success": True, "url": rel_url, "size": len(file_bytes)}
                self.wfile.write(json.dumps(resp).encode("utf-8"))
                print(f"[SYNC SERVER] Saved uploaded image to {rel_url} ({len(file_bytes)} bytes)")
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def run_server():
    local_ip = get_local_ip()
    print("=" * 65)
    print(f"🚀 AAA Real Estate - Multi-Device Sync Server Active")
    print(f"💻 Laptop / Desktop URL : http://localhost:{PORT}")
    print(f"📱 Mobile / Tablet URL  : http://{local_ip}:{PORT}")
    print(f"📁 Database Path        : {PROPS_FILE}")
    print(f"📷 Uploads Directory    : {UPLOADS_DIR}")
    print("=" * 65)

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), RealEstateHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == "__main__":
    run_server()
