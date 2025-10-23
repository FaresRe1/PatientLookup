import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer, Server } from 'http';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow = null;
let nextServer = null;
function setupDatabase() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'app.db');
    console.log('=== Database Setup ===');
    console.log('userData path:', userDataPath);
    console.log('Target DB path:', dbPath);
    // Ensure userData directory exists
    if (!existsSync(userDataPath)) {
        mkdirSync(userDataPath, { recursive: true });
    }
    // Find source database
    let sourceDbPath;
    if (app.isPackaged) {
        // In production, look in resources
        sourceDbPath = path.join(process.resourcesPath, 'app.db');
        console.log('Looking for packaged DB at:', sourceDbPath);
    }
    else {
        // In development
        sourceDbPath = path.join(__dirname, '..', 'prisma', 'app.db');
        console.log('Looking for dev DB at:', sourceDbPath);
    }
    // Copy database if it doesn't exist in userData
    if (!existsSync(dbPath)) {
        if (existsSync(sourceDbPath)) {
            console.log('Copying database from:', sourceDbPath);
            copyFileSync(sourceDbPath, dbPath);
            console.log('✓ Database copied successfully!');
        }
        else {
            console.error('✗ Source database not found at:', sourceDbPath);
            console.log('Will create empty database...');
        }
    }
    else {
        console.log('✓ Database already exists');
    }
    return { dbPath, userDataPath };
}
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: true
        }
    });
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    console.log('=== Electron Starting ===');
    console.log('isDev:', isDev);
    console.log('isPackaged:', app.isPackaged);
    console.log('__dirname:', __dirname);
    if (isDev) {
        await mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        console.log('=== Production Mode ===');
        // Setup database
        const { dbPath, userDataPath } = setupDatabase();
        // Set absolute path for database
        process.env.DATABASE_URL = `file:${dbPath}`;
        // Set absolute path for database
        process.env.DATABASE_URL = `file:${dbPath}`;
        process.env.NODE_ENV = 'production';
        console.log('DATABASE_URL set to:', process.env.DATABASE_URL);
        console.log('Database file exists:', existsSync(dbPath));
        const next = (await import('next')).default;
        const appDir = app.isPackaged
            ? path.join(process.resourcesPath, 'app.asar.unpacked')
            : path.dirname(__dirname);
        console.log('Next.js app directory:', appDir);
        const nextApp = next({
            dev: false,
            dir: appDir,
            conf: {
                distDir: '.next'
            }
        });
        const handle = nextApp.getRequestHandler();
        try {
            console.log('Preparing Next.js...');
            await nextApp.prepare();
            console.log('✓ Next.js prepared successfully!');
            nextServer = createServer((req, res) => {
                console.log(`${req.method} ${req.url}`);
                handle(req, res).catch((err) => {
                    console.error('Request error:', err.message);
                    console.error('Stack:', err.stack);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        error: err.message,
                        stack: err.stack
                    }));
                });
            });
            nextServer.listen(3000, 'localhost', () => {
                console.log('✓ Server ready on http://localhost:3000');
                if (mainWindow) {
                    setTimeout(() => {
                        mainWindow?.loadURL('http://localhost:3000');
                        mainWindow?.webContents.openDevTools();
                    }, 1000);
                }
            });
            nextServer.on('error', (err) => {
                console.error('Server error:', err);
            });
        }
        catch (err) {
            console.error('Failed to start Next.js:', err);
        }
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (nextServer) {
            nextServer.close();
            nextServer = null;
        }
    });
    mainWindow.webContents.on('console-message', (_event, level, message) => {
        console.log(`[Renderer ${level}]:`, message);
    });
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (nextServer) {
        nextServer.close();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
app.on('before-quit', () => {
    if (nextServer) {
        nextServer.close();
    }
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
