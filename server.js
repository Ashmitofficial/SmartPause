const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const getInsight = (name, score, category) => {
    if (score > 80) return `You are owning your joy! Your consistent support of this service shows it provides real value. Consider a yearly bundle to keep more money in your pocket for future dreams.`;
    if (score > 50) return `This subscription is in the "Passive Zone". You use it enough to justify the cost, but there are gaps in your usage history that suggest a cheaper plan might fit better.`;
    return `This feels like a "Zombie Subscription". Our analysis detects high payments with very little implied value. The smartest financial move is to cut this cord immediately.`;
};

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

            // 1. FILTER: HIDE CANCELLED
            if (latest.status === 'cancelled') return null;
            
            let intentScore = 60, alert = "Stable", savings = 0, smartCost = latest.amount;
            
            // 2. CHECK IF ALREADY OPTIMIZED
            if (latest.status === 'optimized') {
                intentScore = 98;            
                alert = "Annual Plan Active"; 
                savings = 0;                 
                smartCost = latest.amount;
            } 
            else {
                // STANDARD ANALYSIS LOGIC
                const isVolatilityRisk = name.includes("Adobe") || name.includes("Uber");
                const isUsageRisk = name.includes("Tinder") || name.includes("Cult");
                const isAnchor = name.includes("Netflix") || name.includes("Spotify");

                if (isVolatilityRisk) {
                    intentScore = 25; 
                    alert = "Price Volatility Alert";
                    savings = latest.amount; 
                    smartCost = 0;
                } else if (isUsageRisk) {
                    intentScore = 42;
                    alert = "High Regret Risk";
                    savings = latest.amount;
                    smartCost = 0;
                } else if (isAnchor) {
                    intentScore = 95; 
                    alert = "Maximum Value";
                    savings = 0;
                    smartCost = latest.amount;
                } else {
                    intentScore = 55;
                    alert = "Optimization Available";
                    savings = latest.amount * 0.2; 
                    smartCost = latest.amount * 0.8;
                }
            }

            let durationTag = "";
            if (count > 12) {
                const years = (count / 12).toFixed(1).replace('.0', ''); 
                durationTag = `${years} YEARS ACTIVE`;
            } else {
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
        }).filter(item => item !== null); 
        
        res.json(analyzed.sort((a, b) => a.intentScore - b.intentScore));
    });
});

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
    db.all("SELECT DISTINCT name, amount, nextDate, category FROM transactions WHERE nextDate IS NOT NULL AND status != 'cancelled' ORDER BY nextDate ASC", [], (err, rows) => {
        res.json(rows || []);
    });
});

app.get('/api/history', (req, res) => {
    db.all("SELECT * FROM transactions ORDER BY date DESC", [], (err, rows) => {
        res.json(rows || []);
    });
});

app.post('/api/cancel', (req, res) => {
    const { name } = req.body;
    db.run("UPDATE transactions SET status = 'cancelled' WHERE name = ?", [name], function(err) {
        if (err) res.status(500).json({ success: false, message: err.message });
        else res.json({ success: true, message: `Successfully cancelled ${name}` });
    });
});

// OPTIMIZE API 
// Applies a 20% discount and updates status
app.post('/api/optimize', (req, res) => {
    const { name } = req.body;
    db.run("UPDATE transactions SET amount = CAST(amount * 0.8 AS INTEGER), status = 'optimized' WHERE name = ?", [name], function(err) {
        if (err) res.status(500).json({ success: false, message: err.message });
        else res.json({ success: true, message: `Successfully optimized ${name}` });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`SmartPause Server running at http://localhost:${PORT}`);
});