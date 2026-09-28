from http.server import BaseHTTPRequestHandler, HTTPServer
from io import BytesIO
import os

from PIL import Image
from rembg import new_session, remove


HOST = "127.0.0.1"
PORT = 8765
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MODEL_NAME = os.environ.get("REMBG_MODEL", "u2netp")
SESSION = None


class BackgroundRemovalHandler(BaseHTTPRequestHandler):
    server_version = "PixelFaunaBackgroundService/1.0"

    def send_json_error(self, status: int, message: str) -> None:
        body = ('{"error":"' + message + '"}').encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path != "/health":
            self.send_json_error(404, "Not found")
            return

        body = b'{"status":"ready"}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        if self.path != "/remove-background":
            self.send_json_error(404, "Not found")
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json_error(400, "Invalid content length")
            return

        if content_length < 1 or content_length > MAX_IMAGE_BYTES:
            self.send_json_error(413, "Image must be smaller than 10 MB")
            return

        image_bytes = self.rfile.read(content_length)
        if len(image_bytes) != content_length:
            self.send_json_error(400, "Incomplete image upload")
            return

        try:
            removed_image = remove(
                image_bytes,
                session=SESSION,
            )
            if isinstance(removed_image, Image.Image):
                image = removed_image
            else:
                image = Image.open(BytesIO(removed_image))

            output = BytesIO()
            image.convert("RGBA").save(output, format="PNG")
            png_bytes = output.getvalue()
            if not png_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValueError("Background remover did not produce a PNG")
        except Exception:
            self.send_json_error(422, "Could not process this image")
            return

        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(png_bytes)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(png_bytes)

    def log_message(self, format_string: str, *args: object) -> None:
        print("[pixel-fauna] " + format_string % args)


def main() -> None:
    global SESSION

    print(f"Loading rembg model '{MODEL_NAME}' (first startup may download model weights)...", flush=True)
    SESSION = new_session(MODEL_NAME)
    server = HTTPServer((HOST, PORT), BackgroundRemovalHandler)
    print(f"Background-removal service ready at http://{HOST}:{PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping background-removal service.", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
