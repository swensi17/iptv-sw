from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import json
from urllib.parse import urlparse, parse_qs

class IPTVHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Настройка CORS для разрешения cross-origin запросов
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Обработка запроса к корневой директории
        if self.path == '/':
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            with open('index.html', 'rb') as file:
                self.wfile.write(file.read())
            return
        
        # Обработка остальных файлов
        try:
            super().do_GET()
        except Exception as e:
            print(f"Ошибка при обработке запроса: {e}")
            self.send_error(500, f"Внутренняя ошибка сервера: {str(e)}")

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, IPTVHandler)
    print(f"Сервер запущен на порту {port}")
    print(f"Откройте http://localhost:{port} в вашем браузере")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nСервер остановлен")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
