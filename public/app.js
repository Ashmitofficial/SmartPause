const App = {
    user: JSON.parse(localStorage.getItem('sp_user')) || null,
    view: 'login', 

    init() {
        if (this.user) this.navigate('dashboard');
        else this.render();
    },

    // LOGO ENGINE (Merchant Logos)
    getLogo(name) {
        const n = name.toLowerCase();
        let filename = 'default';
        if (n.includes('netflix')) filename = 'netflix';
        else if (n.includes('adobe')) filename = 'adobe';
        else if (n.includes('cult')) filename = 'cult';
        else if (n.includes('nord')) filename = 'nord';
        else if (n.includes('gpt') || n.includes('chat')) filename = 'gpt';
        else if (n.includes('google')) filename = 'google';
        else if (n.includes('zomato')) filename = 'zomato';
        else if (n.includes('tinder')) filename = 'tinder';
        else if (n.includes('spotify')) filename = 'spotify';
        else if (n.includes('hotstar')) filename = 'hotstar';
        return `/logos/${filename}.png`;
    },

    getRemoteLogo(name) {
        const n = name.toLowerCase();
        let domain = 'spark.com';
        if (n.includes('netflix')) domain = 'netflix.com';
        else if (n.includes('adobe')) domain = 'adobe.com';
        else if (n.includes('cult')) domain = 'cure.fit';
        else if (n.includes('nord')) domain = 'nordvpn.com';
        else if (n.includes('gpt') || n.includes('openai.com')) domain = 'openai.com'; 
        else if (n.includes('google')) domain = 'google.com';
        else if (n.includes('zomato')) domain = 'zomato.com';
        else if (n.includes('tinder')) domain = 'tinder.com';
        else if (n.includes('spotify')) domain = 'spotify.com';
        else if (n.includes('hotstar')) domain = 'hotstar.com';
        return `https://logo.clearbit.com/${domain}`;
    },

    // TOAST SYSTEM 
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return; 
        const toast = document.createElement('div');
        const color = type === 'success' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-indigo-500 bg-indigo-500/10 text-indigo-300';
        
        toast.className = `glass-panel px-6 py-4 rounded-xl border-l-4 ${color} shadow-2xl flex items-center gap-4 min-w-[300px] animate-slideIn`;
        toast.innerHTML = `
            <div class="p-2 bg-white/5 rounded-lg"><i data-lucide="${type === 'success' ? 'check-circle' : 'zap'}" class="w-5 h-5"></i></div>
            <div><p class="font-bold text-sm text-white">${type === 'success' ? 'Action Successful' : 'Processing'}</p><p class="text-xs opacity-70">${message}</p></div>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ACTIONS
    async triggerAction(action, name) {
        if (action === 'Cancel') {
            this.showToast(`Connecting to ${name} Merchant API...`, 'process');
            const res = await fetch('/api/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (data.success) {
                setTimeout(() => {
                    this.showToast(`${name} Subscription Terminated.`);
                    this.navigate('dashboard'); 
                }, 1500); 
            }
        } 
        else if (action === 'Optimize') {
            this.showToast(`Negotiating Annual Plan for ${name}...`, 'process');
            const res = await fetch('/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (data.success) {
                setTimeout(() => {
                    this.showToast(`Success! ${name} cost reduced by 20%.`);
                    this.navigate('dashboard'); 
                }, 1500);
            }
        }
    },

    async login(username, password) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            this.user = data.user;
            localStorage.setItem('sp_user', JSON.stringify(data.user));
            this.navigate('dashboard');
        } else alert(data.message);
    },

    async fetchData(endpoint) { return await (await fetch(`/api/${endpoint}`)).json(); },
    
    logout() {
        this.user = null;
        localStorage.removeItem('sp_user');
        this.view = 'login';
        this.render();
    },

    async navigate(target) {
        this.view = target;
        this.data = await this.fetchData(target);
        this.render();
        if (target === 'analytics') this.initCharts();
    },

    // COMPONENTS 
    Sidebar: (active) => `
        <aside class="w-72 glass-panel border-r-0 border-r-white/10 h-full flex flex-col justify-between p-6 shrink-0 relative z-20">
            <div>
                <div class="flex items-center gap-4 mb-12 px-2">
                    <svg class="w-10 h-10 shadow-[0_0_15px_rgba(99,102,241,0.5)] rounded-xl"><use href="#icon-smartpause"/></svg>
                    <div>
                        <h1 class="font-bold text-xl tracking-wide text-white">SmartPause</h1>
                    </div>
                </div>
                
                <nav class="space-y-3">
                    <button onclick="App.navigate('dashboard')" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${active === 'dashboard' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
                        <i data-lucide="layout-grid" class="w-5 h-5"></i> <span class="font-medium">Command Center</span>
                    </button>
                    <button onclick="App.navigate('analytics')" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${active === 'analytics' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
                        <i data-lucide="pie-chart" class="w-5 h-5"></i> <span class="font-medium">Money Map</span>
                    </button>
                    <button onclick="App.navigate('calendar')" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${active === 'calendar' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
                        <i data-lucide="calendar-days" class="w-5 h-5"></i> <span class="font-medium">Crystal Ball</span>
                    </button>
                    <button onclick="App.navigate('history')" class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${active === 'history' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}">
                        <i data-lucide="scroll-text" class="w-5 h-5"></i> <span class="font-medium">Ledger</span>
                    </button>
                </nav>
            </div>
            
            <div class="p-4 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500"></div>
                <div class="flex-1"><p class="text-xs text-slate-400">Logged in as</p><p class="font-bold text-sm text-white">${App.user?.name}</p></div>
                <button onclick="App.logout()" class="text-slate-400 hover:text-white transition-colors"><i data-lucide="log-out" class="w-4 h-4"></i></button>
            </div>
        </aside>
    `,

    HistoryView: (data) => `
        ${App.Sidebar('history')}
        <main class="flex-1 h-full overflow-y-auto p-10 relative">
             <header class="mb-10"><h2 class="text-4xl font-bold text-white mb-2 text-glow">Ledger</h2><p class="text-indigo-200/70">Full transaction history.</p></header>
             <div class="glass-card rounded-2xl overflow-hidden border border-white/10">
                <table class="w-full text-left text-white">
                    <thead class="bg-white/5 text-indigo-300 uppercase text-xs font-bold border-b border-white/10">
                        <tr>
                            <th class="p-4">Date</th>
                            <th class="p-4">Merchant</th>
                            <th class="p-4">Category</th>
                            <th class="p-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        ${data.map(t => `
                            <tr class="hover:bg-white/5 transition-colors group">
                                <td class="p-4 text-white/70 font-mono text-sm">${t.date}</td>
                                <td class="p-4 flex items-center gap-3 font-bold">
                                    <div class="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-sm">
                                        <img src="${App.getLogo(t.name)}" class="w-full h-full object-contain" onerror="this.src='${App.getRemoteLogo(t.name)}'">
                                    </div>
                                    ${t.name}
                                </td>
                                <td class="p-4 text-xs uppercase tracking-wider opacity-60">${t.category}</td>
                                <td class="p-4 text-right font-mono font-bold group-hover:text-emerald-300 transition-colors">₹${t.amount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
             </div>
        </main>
    `,

    DashboardView: (data) => {
        const totalSavings = data.reduce((a, b) => a + (b.financials.waste || 0), 0);

        return `
        ${App.Sidebar('dashboard')}
        <main class="flex-1 h-full overflow-y-auto p-10 relative">
            <header class="flex justify-between items-end mb-10 relative z-10">
                <div><h2 class="text-4xl font-bold text-white mb-2 text-glow">Overview</h2><p class="text-indigo-200/70">Your Financial Clarity.</p></div>
                
                ${totalSavings > 0 ? `
                    <div class="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 border-emerald-500/30 bg-emerald-500/10">
                        <svg class="w-10 h-10 shadow-lg shadow-emerald-500/20"><use href="#icon-savings"/></svg>
                        <div>
                            <p class="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Potential Savings</p>
                            <p class="text-xl font-bold text-white">₹${totalSavings.toLocaleString()}</p>
                        </div>
                    </div>` : ''}
            </header>

            <div class="space-y-6 relative z-10">
                ${data.map(sub => `
                    <div class="glass-card p-8 rounded-[2rem] border border-white/10">
                        <div class="flex justify-between items-start mb-8">
                            <div class="flex items-center gap-6">
                                <div class="w-16 h-16 bg-white rounded-2xl p-2 shadow-lg flex items-center justify-center overflow-hidden">
                                    <img src="${App.getLogo(sub.name)}" 
                                         class="w-full h-full object-contain" 
                                         onerror="this.src='${App.getRemoteLogo(sub.name)}'; this.onerror=function(){this.src='https://ui-avatars.com/api/?name=${sub.name[0]}';}">
                                </div>
                                <div>
                                    <div class="flex items-center gap-3 mb-1">
                                        <h3 class="text-2xl font-bold text-white">${sub.name}</h3>
                                        <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sub.intentScore > 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${sub.alert}</span>
                                    </div>
                                    <p class="text-white/60">₹${sub.amount} • Monthly Cycle</p>
                                </div>
                            </div>
                            
                            ${sub.intentScore > 90 ? 
                                `<div class="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-right opacity-50 cursor-not-allowed">
                                    <p class="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Status</p>
                                    <div class="flex items-center justify-end gap-2 text-white font-bold text-lg">
                                        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
                                        <span class="text-emerald-100">Optimized</span>
                                    </div>
                                </div>` 
                                : 
                                `<button onclick="App.triggerAction('${sub.intentScore < 50 ? 'Cancel' : 'Optimize'}', '${sub.name}')" 
                                        class="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-right hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer w-full md:w-auto text-left md:text-right">
                                    <p class="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Recommendation</p>
                                    <div class="flex items-center justify-end gap-2 text-white font-bold text-lg">
                                        <i data-lucide="${sub.intentScore < 50 ? 'trash-2' : 'sliders'}" class="w-4 h-4 ${sub.intentScore < 50 ? 'text-rose-400' : 'text-emerald-400'}"></i>
                                        <span class="${sub.intentScore < 50 ? 'text-rose-100' : 'text-emerald-100'}">${sub.intentScore < 50 ? 'Cancel Immediately' : 'Maintain & Optimize'}</span>
                                    </div>
                                </button>`
                            }
                        </div>

                        <div class="mb-8">
                            <div class="flex justify-between text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
                                <span>Financial Intent & Alignment</span>
                                <span>${sub.intentScore}%</span>
                            </div>
                            <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-indigo-500" style="width: ${sub.intentScore}%"></div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-2">
                                <p class="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-3">Inferred Insights</p>
                                <p class="text-white/80 leading-relaxed italic mb-6">"${sub.insight}"</p>
                                <div class="flex gap-3">
                                    ${sub.tags.map(t => `<span class="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 uppercase">${t}</span>`).join('')}
                                </div>
                            </div>

                            <div class="bg-white/5 rounded-2xl p-5 border border-white/5">
                                <p class="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-4">Financial Impact Simulation</p>
                                <div class="space-y-3 text-sm">
                                    <div class="flex justify-between text-white/60"><span>Current Path</span><span class="font-bold">₹${sub.financials.current}</span></div>
                                    <div class="flex justify-between text-indigo-300"><span>SmartPause Path</span><span class="font-bold">₹${sub.financials.smartPath}</span></div>
                                    <div class="h-px bg-white/10 my-2"></div>
                                    <div class="flex justify-between text-rose-400 font-bold"><span>Estimated Waste</span><span>-₹${sub.financials.waste}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </main>
    `},

    AnalyticsView: () => `
        ${App.Sidebar('analytics')}
        <main class="flex-1 h-full overflow-y-auto p-10 relative">
            <header class="mb-10"><h2 class="text-4xl font-bold text-white mb-2 text-glow">Money Map</h2><p class="text-indigo-200/70">Visualizing flow.</p></header>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
                <div class="glass-card p-8 rounded-3xl flex flex-col relative overflow-hidden">
                    <h3 class="font-bold text-white mb-6">Category Distribution</h3>
                    <div class="flex-1 flex items-center justify-center">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
                <div class="glass-card p-8 rounded-3xl flex flex-col">
                    <h3 class="font-bold text-white mb-6">12-Month Trend</h3>
                    <div class="flex-1 relative"><canvas id="trendChart"></canvas></div>
                </div>
            </div>
        </main>
    `,

    CalendarView: (data) => `
        ${App.Sidebar('calendar')}
        <main class="flex-1 h-full overflow-y-auto p-10 relative">
            <header class="mb-10"><h2 class="text-4xl font-bold text-white mb-2 text-glow">Crystal Ball</h2><p class="text-indigo-200/70">Forecast upcoming payments.</p></header>
            <div class="max-w-4xl space-y-4">
                ${data.map(item => `
                    <div class="glass-card p-4 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                        <div class="flex items-center gap-6">
                            <div class="bg-indigo-500/20 px-5 py-3 rounded-xl text-center border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300">
                                <div class="text-xs font-bold text-indigo-300 group-hover:text-white uppercase tracking-wider">${new Date(item.nextDate).toLocaleString('default', { month: 'short' })}</div>
                                <div class="text-2xl font-bold text-white">${new Date(item.nextDate).getDate()}</div>
                            </div>
                            <div class="flex items-center gap-4">
                                <img src="${App.getLogo(item.name)}" class="w-10 h-10 object-contain rounded-lg bg-white p-1" onerror="this.src='${App.getRemoteLogo(item.name)}'">
                                <div><h4 class="font-bold text-white text-lg">${item.name}</h4><p class="text-xs text-white/50 uppercase tracking-widest">${item.category}</p></div>
                            </div>
                        </div>
                        <div class="text-right"><p class="font-bold text-white text-lg">₹${item.amount.toLocaleString()}</p><div class="text-xs text-indigo-300 font-medium">Auto-Debit</div></div>
                    </div>
                `).join('')}
            </div>
        </main>
    `,

    LoginView: () => `
        <div class="w-full h-full flex items-center justify-center p-4 relative">
            <div class="glass-panel w-full max-w-md p-10 rounded-3xl relative z-10 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                <div class="text-center mb-10">
                    <svg class="w-16 h-16 mx-auto mb-6 shadow-[0_0_20px_rgba(99,102,241,0.6)] rounded-2xl"><use href="#icon-smartpause"/></svg>
                    <h2 class="text-3xl font-bold text-white mb-2 text-glow">Welcome Back</h2>
                    <p class="text-indigo-200/80">Access your financial command center</p>
                </div>
                <form onsubmit="event.preventDefault(); App.login(this.username.value, this.password.value)" class="space-y-5">
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-indigo-300 uppercase ml-1">Username</label>
                        <input name="username" type="text" placeholder="admin" class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-black/40 transition-all">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold text-indigo-300 uppercase ml-1">Password</label>
                        <input name="password" type="password" placeholder="123" class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 focus:bg-black/40 transition-all">
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] mt-4">Enter Dashboard</button>
                </form>
            </div>
        </div>`,

    render() {
        const root = document.getElementById('app');
        if (this.view === 'login') root.innerHTML = this.LoginView();
        else if (this.view === 'dashboard') root.innerHTML = this.DashboardView(this.data);
        else if (this.view === 'analytics') root.innerHTML = this.AnalyticsView();
        else if (this.view === 'calendar') root.innerHTML = this.CalendarView(this.data);
        else if (this.view === 'history') root.innerHTML = this.HistoryView(this.data);
        lucide.createIcons();
    },

    initCharts() {
        Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

        new Chart(document.getElementById('categoryChart'), {
            type: 'doughnut',
            data: {
                labels: this.data.categories.map(d => d.category),
                datasets: [{ 
                    data: this.data.categories.map(d => d.total), 
                    backgroundColor: ['#6366f1', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981'], 
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.1)'
                }]
            },
            options: { 
                cutout: '70%', 
                maintainAspectRatio: false, 
                plugins: { 
                    legend: { position: 'right', labels: { usePointStyle: true, color: 'white', padding: 20 } } 
                } 
            }
        });

        new Chart(document.getElementById('trendChart'), {
            type: 'line',
            data: {
                labels: this.data.trend.map(d => new Date(d.month + '-01').toLocaleString('default', { month: 'short' })),
                datasets: [{ 
                    label: 'Spend', 
                    data: this.data.trend.map(d => d.total), 
                    borderColor: '#6366f1', 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                    tension: 0.4, 
                    fill: true,
                    pointBackgroundColor: '#fff',
                    pointRadius: 4
                }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } }
        });
    }
};

App.init();