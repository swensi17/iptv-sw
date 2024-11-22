const http = require('http');
const fs = require('fs');
const path = require('path');

// Функция для парсинга M3U файлов
function parseM3U(content) {
    const channels = [];
    const lines = content.split('\n');
    let currentChannel = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
            // Парсинг информации о канале
            currentChannel = {};
            const info = line.substring(8).split(',');
            const attributes = info[0].match(/tvg-id="([^"]*)"\s*tvg-name="([^"]*)"\s*tvg-logo="([^"]*)"/);
            
            if (attributes) {
                currentChannel.id = attributes[1];
                currentChannel.name = attributes[2] || info[1];
                currentChannel.logo = attributes[3];
            } else {
                currentChannel.name = info[1];
            }
        } else if (line.startsWith('http')) {
            // Добавление URL потока
            currentChannel.url = line;
            channels.push(currentChannel);
            currentChannel = {};
        }
    }

    return channels;
}

const server = http.createServer((req, res) => {
    // Обработка CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/') {
        // Отдаем главную страницу
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Ошибка загрузки index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    } else if (req.url.startsWith('/api/channels/')) {
        // API endpoint для получения списка каналов по стране
        const countryCode = req.url.split('/').pop();
        const playlistPath = path.join(__dirname, 'streams', `${countryCode}.m3u`);

        fs.readFile(playlistPath, 'utf8', (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Каналы не найдены' }));
                return;
            }

            const channels = parseM3U(content);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(channels));
        });
    } else if (req.url.endsWith('.js')) {
        // Отдаем JavaScript файлы
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Ошибка загрузки JavaScript файла');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(content);
        });
    } else if (req.url.endsWith('.css')) {
        // Отдаем CSS файлы
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Ошибка загрузки CSS файла');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(content);
        });
    } else if (req.url.startsWith('/streams/') && req.url.endsWith('.m3u')) {
        // Отдаем M3U плейлисты
        const filePath = path.join(__dirname, req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('Плейлист не найден');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/x-mpegurl' });
            res.end(content);
        });
    } else {
        res.writeHead(404);
        res.end('Страница не найдена');
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
