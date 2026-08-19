"""Static server for the browser harness.

The page modules use extensionless imports ('../utils/constants'), which the
browser will not resolve on its own, so a missing path retries with '.js'.
"""
import http.server, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def translate_path(self, path):
        full = super().translate_path(path)
        if not os.path.exists(full) and os.path.exists(full + '.js'):
            return full + '.js'
        return full

    def log_message(self, *a):
        pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8770
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
