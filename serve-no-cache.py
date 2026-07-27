"""Server tĩnh cho demo — gửi header no-cache để luôn nạp JS/CSS mới nhất."""
import http.server
import socketserver

PORT = 4173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
    print(f"Serving (no-cache) at http://127.0.0.1:{PORT}")
    httpd.serve_forever()
