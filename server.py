#!/usr/bin/env python3
import http.server
import socketserver
import os
import signal
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

os.chdir(DIRECTORY)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        sys.stdout.write("%s - - [%s] %s\n" %
                         (self.client_address[0],
                          self.log_date_time_string(),
                          format%args))
        sys.stdout.flush()

def signal_handler(sig, frame):
    print("\n🛑 Server stopped.")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"✅ Server running at http://localhost:{PORT}")
    print(f"📁 Serving: {DIRECTORY}")
    print("Press Ctrl+C to stop\n")
    sys.stdout.flush()
    httpd.serve_forever()
