const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./smartpause.db');

// --- DATE HELPERS ---
const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

const daysFromNow = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

db.serialize(() => {
    // 1. FRESH START
    db.run("DROP TABLE IF EXISTS transactions");
    db.run("DROP TABLE IF EXISTS users");

    // 2. CREATE TABLES
    db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, name TEXT)`);
    db.run(`CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        amount REAL, 
        cycle TEXT, 
        category TEXT, 
        date TEXT,
        nextDate TEXT 
    )`);

    // 3. SEED USER (Professional Profile)
    const stmtUser = db.prepare("INSERT INTO users (username, password, name) VALUES (?, ?, ?)");
    stmtUser.run("admin", "123", "Ashmit Kumar Singh"); // Upgraded name
    stmtUser.finalize();

    // 4. SEED COMPLEX DATA
    console.log("Seeding Enterprise Dataset...");
    const stmt = db.prepare("INSERT INTO transactions (name, amount, cycle, category, date, nextDate) VALUES (?, ?, ?, ?, ?, ?)");

    // --- CASE 1: The "Loyalist" (Netflix) ---
    // Perfect history, high intent.
    for (let i = 0; i < 18; i++) stmt.run("Netflix Premium", 649, "Monthly", "Entertainment", daysAgo(i * 30), daysFromNow(5));

    // --- CASE 2: The "Price Shock" (Adobe) ---
    // Price jumped recently. Urgent Action required.
    stmt.run("Adobe Creative Cloud", 4230, "Monthly", "Software", daysAgo(15), daysFromNow(2));
    stmt.run("Adobe Creative Cloud", 4230, "Monthly", "Software", daysAgo(45), daysFromNow(2));
    stmt.run("Adobe Creative Cloud", 2300, "Monthly", "Software", daysAgo(75), daysFromNow(2)); // Was cheaper before
    stmt.run("Adobe Creative Cloud", 2300, "Monthly", "Software", daysAgo(105), daysFromNow(2));

    // --- CASE 3: The "Ghost" (Cult.fit) ---
    // Stopped paying 3 months ago. No future date. System should flag as "Inactive/Waste".
    for (let i = 3; i < 12; i++) stmt.run("Cult.fit", 1500, "Monthly", "Health", daysAgo(i * 30), null);

    // --- CASE 4: The "Annual Bomb" (NordVPN) ---
    // Paid 11 months ago. Due very soon. Calendar Alert!
    stmt.run("NordVPN 1-Year", 6900, "Yearly", "Security", daysAgo(340), daysFromNow(25));

    // --- CASE 5: The "New Obsession" (ChatGPT) ---
    // Started recently, consistent so far.
    stmt.run("ChatGPT Plus", 1999, "Monthly", "Productivity", daysAgo(10), daysFromNow(20));
    stmt.run("ChatGPT Plus", 1999, "Monthly", "Productivity", daysAgo(40), daysFromNow(20));

    // --- CASE 6: The "Zombie" (Google One) ---
    // Small amount, ignored forever.
    for (let i = 0; i < 24; i++) stmt.run("Google One", 130, "Monthly", "Cloud", daysAgo(i * 30), daysFromNow(1));

    // --- CASE 7: The "Periodic Binger" (Zomato) ---
    // Active now, but skips months often.
    stmt.run("Zomato Gold", 129, "Monthly", "Food", daysAgo(5), daysFromNow(25));
    stmt.run("Zomato Gold", 129, "Monthly", "Food", daysAgo(35), daysFromNow(25));
    // ... skipped 2 months ...
    stmt.run("Zomato Gold", 129, "Monthly", "Food", daysAgo(120), daysFromNow(25));

    // --- CASE 8: The "Regret" (Tinder) ---
    // Paid once 5 months ago. Never again.
    stmt.run("Tinder Gold", 899, "Monthly", "Lifestyle", daysAgo(150), null);

    // --- CASE 9: The "Music Lover" (Spotify) ---
    // Cheap, consistent.
    for (let i = 0; i < 12; i++) stmt.run("Spotify Individual", 119, "Monthly", "Entertainment", daysAgo(i * 30), daysFromNow(12));

    stmt.finalize();
});

module.exports = db;