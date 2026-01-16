const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('smartpause.db');

db.serialize(() => {
    // 1. Reset Database on Restart (Safety for Demo)
    db.run("DROP TABLE IF EXISTS users");
    db.run("DROP TABLE IF EXISTS transactions");

    // 2. Create Users Table
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        username TEXT,
        password TEXT
    )`);

    // 3. Create Transactions Table
    db.run(`CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        amount INTEGER, 
        date TEXT,
        category TEXT,
        nextDate TEXT,
        status TEXT DEFAULT 'active' 
    )`);

    // 4. Seed User
    const stmt = db.prepare("INSERT INTO users (name, username, password) VALUES (?, ?, ?)");
    stmt.run("Ashmit Kumar Singh", "admin", "123");
    stmt.finalize();

    // 5. Seed Transactions (ONLY YOUR 10 APPS)
    const tStmt = db.prepare("INSERT INTO transactions (name, amount, date, category, nextDate) VALUES (?, ?, ?, ?, ?)");
    
    // 1. ADOBE CREATIVE CLOUD (High Cost - Risk)
    tStmt.run("Adobe Creative Cloud", 4230, "2026-01-02", "Productivity", "2026-02-02");
    tStmt.run("Adobe Creative Cloud", 4230, "2025-12-02", "Productivity", null);
    tStmt.run("Adobe Creative Cloud", 4230, "2025-11-02", "Productivity", null);

    // 2. CULT.FIT (Health - High Regret Risk)
    tStmt.run("Cult.fit", 1500, "2026-01-10", "Health", "2026-02-10");
    tStmt.run("Cult.fit", 1500, "2025-12-10", "Health", null);

    // 3. GOOGLE ONE (Storage - Low Maintenance)
    tStmt.run("Google One", 130, "2026-01-18", "Productivity", "2026-02-18");
    tStmt.run("Google One", 130, "2025-12-18", "Productivity", null);
    tStmt.run("Google One", 130, "2025-11-18", "Productivity", null);
    tStmt.run("Google One", 130, "2025-10-18", "Productivity", null);

    // 4. CHATGPT PLUS (AI - High Value)
    tStmt.run("ChatGPT Plus", 1999, "2026-01-08", "AI", "2026-02-08");
    tStmt.run("ChatGPT Plus", 1999, "2025-12-08", "AI", null);

    // 5. DISNEY+ HOTSTAR (Entertainment)
    tStmt.run("Disney+ Hotstar", 299, "2026-01-20", "Entertainment", "2026-02-20");
    tStmt.run("Disney+ Hotstar", 299, "2025-12-20", "Entertainment", null);

    // 6. NETFLIX (Anchor - Maximum Value)
    tStmt.run("Netflix", 649, "2026-01-15", "Entertainment", "2026-02-15");
    tStmt.run("Netflix", 649, "2025-12-15", "Entertainment", null);
    tStmt.run("Netflix", 649, "2025-11-15", "Entertainment", null);

    // 7. NORDVPN (Utility)
    tStmt.run("NordVPN", 900, "2026-01-12", "Utility", "2026-02-12");
    tStmt.run("NordVPN", 900, "2025-12-12", "Utility", null);

    // 8. SPOTIFY (Music - Low Cost)
    tStmt.run("Spotify", 119, "2026-01-05", "Entertainment", "2026-02-05");
    tStmt.run("Spotify", 119, "2025-12-05", "Entertainment", null);
    tStmt.run("Spotify", 119, "2025-11-05", "Entertainment", null);
    tStmt.run("Spotify", 119, "2025-10-05", "Entertainment", null);

    // 9. TINDER GOLD (Lifestyle - High Regret)
    tStmt.run("Tinder Gold", 450, "2026-01-14", "Lifestyle", "2026-02-14");
    
    // 10. ZOMATO GOLD (Food)
    tStmt.run("Zomato Gold", 99, "2026-01-30", "Food", "2026-02-28");
    tStmt.run("Zomato Gold", 99, "2025-12-30", "Food", null);
    
    tStmt.finalize();
});

module.exports = db;