const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// --- TEXT GENERATOR ---
const getInsight = (name, score, category) => {
    if (score > 80) return `You are owning your joy! Your consistent support of this service shows it provides real value. Consider a yearly bundle to keep more money in your pocket for future dreams.`;
    if (score > 50) return `This subscription is in the "Passive Zone". You use it enough to justify the cost, but there are gaps in your usage history that suggest a cheaper plan might fit better.`;
    return `This feels like a "Zombie Subscription". Our analysis detects high payments with very little implied value. The smartest financial move is to cut this cord immediately.`;
};

// --- API ENDPOINTS ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (row) res.json({ success: true, user: { name: row.name, username: row.username } });
        else res.status(401).json({ success: false, message: "Invalid credentials" });
    });
});

app.get('/api/dashboard', (req, res) => {
    db.all("SELECT * FROM transactions", [], (err, rows) => {
        if (err || !rows) return res.json([]);
        
        const grouped = rows.reduce((acc, t) => {
            if (!acc[t.name]) acc[t.name] = [];
            acc[t.name].push(t);
            return acc;
        }, {});

        const analyzed = Object.keys(grouped).map(name => {
            const history = grouped[name].sort((a,b) => new Date(b.date) - new Date(a.date));
            const latest = history[0];
            const count = history.length;
            
            // Intelligence Logic
            let intentScore = 60, alert = "Stable", savings = 0, smartCost = latest.amount;
            const isRisk = name.includes("Adobe") || name.includes("Tinder") || name.includes("Cult");
            const isGood = name.includes("Netflix") || name.includes("Spotify");

            if (isRisk) {
                intentScore = 25;
                alert = "High Regret Risk";
                savings = latest.amount; 
                smartCost = 0;
            } else if (isGood) {
                intentScore = 92;
                alert = "Low Regret Risk";
                savings = 0;
            } else {
                intentScore = 55;
                alert = "Moderate Risk";
                savings = latest.amount * 0.2; 
                smartCost = latest.amount * 0.8;
            }

            // --- NEW: SMART TAG LOGIC ---
            // Fixes the "24/12" bug
            let durationTag = "";
            if (count > 12) {
                // If more than a year, show years (e.g. "1.5 YEARS ACTIVE")
                const years = (count / 12).toFixed(1).replace('.0', ''); 
                durationTag = `${years} YEARS ACTIVE`;
            } else {
                // If less than a year, just show months (e.g. "7 MONTHS ACTIVE")
                durationTag = `${count} MONTHS ACTIVE`;
            }

            return { 
                name: latest.name, 
                amount: latest.amount, 
                category: latest.category, 
                nextDate: latest.nextDate, 
                intentScore, 
                alert,
                insight: getInsight(name, intentScore, latest.category),
                financials: {
                    current: latest.amount,
                    smartPath: smartCost,
                    waste: savings
                },
                tags: [durationTag, "ZERO INTERRUPTIONS"]
            };
        });
        
        res.json(analyzed.sort((a, b) => a.intentScore - b.intentScore));
    });
});

// Analytics & Calendar APIs (Unchanged)
app.get('/api/analytics', (req, res) => {
    const catQuery = "SELECT category, SUM(amount) as total FROM transactions GROUP BY category";
    const trendQuery = "SELECT date, SUM(amount) as total FROM transactions GROUP BY date ORDER BY date ASC";

    db.all(catQuery, [], (err, categories) => {
        db.all(trendQuery, [], (err, trend) => {
            const monthly = {};
            (trend || []).forEach(t => {
                const m = t.date.substring(0, 7);
                if (!monthly[m]) monthly[m] = 0;
                monthly[m] += t.total;
            });
            const finalTrend = Object.keys(monthly).map(k => ({ month: k, total: monthly[k] }));
            res.json({ categories: categories || [], trend: finalTrend }); 
        });
    });
});

app.get('/api/calendar', (req, res) => {
    db.all("SELECT DISTINCT name, amount, nextDate, category FROM transactions WHERE nextDate IS NOT NULL ORDER BY nextDate ASC", [], (err, rows) => {
        res.json(rows || []);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`SmartPause Server running at http://localhost:${PORT}`);
});