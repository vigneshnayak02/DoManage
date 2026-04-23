// Database instances
const db = {
    sales: new PouchDB('manager_sales'),
    inventory: new PouchDB('manager_inventory'),
    customers: new PouchDB('manager_customers'),
    suppliers: new PouchDB('manager_suppliers'),
    purchases: new PouchDB('manager_purchases'),
    expenses: new PouchDB('manager_expenses'),
    categories: new PouchDB('manager_categories'),
    company: new PouchDB('manager_company'),
    users: new PouchDB('manager_users'),
    purchaseInvoices: new PouchDB('manager_purchase_invoices'),
    saleInvoices: new PouchDB('manager_sale_invoices'),
    rolePermissions: new PouchDB('manager_role_permissions')
};

// Main application state
const state = {
    currentUser: null,
    currentView: 'dashboard',
    stats: {
        todaySales: 1250.50,
        monthlyRevenue: 45200.00,
        pendingPayments: 3450.00,
        lowStockAlerts: 0
    },
    sales: [
        { id: 'INV-001', date: '2026-03-18', customer: 'John Doe', total: 450.00, status: 'Paid' },
        { id: 'INV-002', date: '2026-03-17', customer: 'Jane Smith', total: 800.50, status: 'Pending' },
        { id: 'INV-003', date: '2026-03-16', customer: 'Bob Johnson', total: 1200.00, status: 'Overdue' }
    ],
    inventory: [
        { id: 1, name: 'Product A', sku: 'SKU001', stock: 50, price: 25.00, category: 'Electronics', taxRate: 10, minStock: 10 },
        { id: 2, name: 'Product B', sku: 'SKU002', stock: 5, price: 45.00, category: 'Office', taxRate: 15, minStock: 10 },
        { id: 3, name: 'Product C', sku: 'SKU003', stock: 120, price: 15.00, category: 'Stationery', taxRate: 5, minStock: 20 }
    ],
    customers: [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', address: '123 Main St' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', address: '456 Oak Ave' }
    ],
    suppliers: [
        { id: 1, name: 'Global Traders', email: 'sales@globaltraders.com', phone: '555-0199', address: '789 Trade Blvd' },
        { id: 2, name: 'Tech Wholesale', email: 'info@techwholesale.com', phone: '555-0188', address: '321 Tech Park' }
    ],
    purchases: [
        { id: 'PUR-001', date: '2026-03-15', supplier: 'Global Traders', total: 1500.00, status: 'Paid' }
    ],
    purchaseInvoices: [],
    saleInvoices: [],
    expenses: [
        { id: 1, date: '2026-03-10', category: 'Rent', description: 'Monthly Office Rent', amount: 2000.00 },
        { id: 2, date: '2026-03-12', category: 'Utilities', description: 'Electricity Bill', amount: 150.00 }
    ],
    expenseCategories: ['Rent', 'Utilities', 'Salaries', 'Travel', 'Others'],
    filters: {
        sales: '',
        inventory: '',
        purchases: '',
        customers: '',
        suppliers: '',
        expenses: '',
        salesPeriod: 'All',
        salesStart: '',
        salesEnd: '',
        purPeriod: 'All',
        purStart: '',
        purEnd: '',
        expPeriod: 'All',
        expStart: '',
        expEnd: '',
        reportPeriod: 'All',
        reportStart: '',
        reportEnd: '',
        pinv: '',
        pinvPeriod: 'All',
        pinvStart: '',
        pinvEnd: '',
        sinv: '',
        sinvPeriod: 'All',
        sinvStart: '',
        sinvEnd: ''
    },
    company: {
        name: 'Domanage',
        legalName: 'Domange',
        logo: 'Dm',
        logoUrl: null,
        qrUrl: null,
        sigUrl: null,
        address: 'Plot 526| Level 6 | T Hub | Hyderabad | Telangana 53565959',
        phone: '123659985',
        email: 'Na@gmail.com',
        gstin: '36Afhf665488',
        state: '36-Telangana',
        bankName: 'IDBI BANK, GACHIBOWLI',
        accountNo: '01256695955',
        ifscCode: 'IBK525695465',
        accountHolder: 'Domanger',
        terms: '1.Payment : After Delivery'
    },
    users: [],
    // Dynamic Role Permissions — loaded from PouchDB, editable by Admin
    // Each module key maps to an object of { Admin: bool, Manager: bool, Staff: bool }
    rolePermissions: {
        dashboard:        { Admin: true,  Manager: true,  Staff: true  },
        'sales': { 'Admin': true, 'Manager': true, 'Staff': true },
        'purchases': { 'Admin': true, 'Manager': true, 'Staff': true },
        'inventory': { 'Admin': true, 'Manager': true, 'Staff': true },
        customers:        { Admin: true,  Manager: true,  Staff: true  },
        suppliers:        { Admin: true,  Manager: true,  Staff: false },
        expenses:         { Admin: true,  Manager: true,  Staff: false },
        reports:          { Admin: true,  Manager: true,  Staff: false },
        profile:          { Admin: true,  Manager: true,  Staff: false },
        users:            { Admin: true,  Manager: false, Staff: false },
    },
    dashFilters: {
        period: 'ThisMonth',
        startDate: '',
        endDate: ''
    }
};

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle');
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Global Loading State Utility
function setBtnLoading(btn, isLoading, originalText) {
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="loader"></span> Processing...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Persist Data to PouchDB (Legacy wrapper for saveAppState)
async function saveAppState() {
    // This function now primarily updates the UI stats and charts
    // Individual CRUD operations will handle PouchDB persistence
    updateDashboardStats();
    if (state.currentView === 'dashboard') {
        renderDashboardCharts();
    }
}

// Migration from localStorage to PouchDB
async function migrateLocalStorage() {
    const savedData = localStorage.getItem('manager_io_data');
    if (!savedData) return;

    console.log('Migrating localStorage data to PouchDB...');
    try {
        const parsed = JSON.parse(savedData);
        
        const migrateCollection = async (database, data, idField = 'id') => {
            if (!data || !Array.isArray(data)) return;
            for (const item of data) {
                const doc = { ...item, _id: item[idField].toString() };
                try {
                    await database.put(doc);
                } catch (e) {
                    if (e.status !== 409) console.error(`Migration error for ${database.name}:`, e);
                }
            }
        };

        await migrateCollection(db.sales, parsed.sales);
        await migrateCollection(db.inventory, parsed.inventory);
        await migrateCollection(db.customers, parsed.customers);
        await migrateCollection(db.suppliers, parsed.suppliers);
        await migrateCollection(db.purchases, parsed.purchases);
        await migrateCollection(db.expenses, parsed.expenses);
        
        if (parsed.company) {
            try {
                await db.company.put({ ...parsed.company, _id: 'config' });
            } catch (e) {
                if (e.status !== 409) console.error('Migration error for company:', e);
            }
        }

        // Only remove if we successfully migrated (or at least tried)
        localStorage.removeItem('manager_io_data');
        console.log('Migration complete.');
        showToast('Local data migrated to database successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

// ─── Permission Helper ───────────────────────────────────────────────
// Returns true if the current user's role has access to the given module/view
function hasPermission(view) {
    if (!state.currentUser) return false;
    const role = state.currentUser.role;
    if (role === 'Admin') return true; // Admin always has full access
    const perms = state.rolePermissions[view];
    if (!perms) return true; // Unknown views default to accessible
    return perms[role] === true;
}

// Applies role permissions to sidebar nav items and hides inaccessible links
function applyRolePermissionsToUI() {
    if (!state.currentUser) return;
    const navItems = document.querySelectorAll('#sidebar nav li[data-view]');
    navItems.forEach(item => {
        const view = item.getAttribute('data-view');
        if (!view) return;
        if (hasPermission(view)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Users nav is always admin-only regardless of permission matrix
    const navUsers = document.getElementById('nav-users');
    if (navUsers) {
        if (state.currentUser.role === 'Admin') navUsers.classList.remove('hidden');
        else navUsers.classList.add('hidden');
    }
}

// Saves current role permissions to PouchDB
async function saveRolePermissions() {
    try {
        let doc;
        try { doc = await db.rolePermissions.get('config'); } catch(e) { doc = { _id: 'config' }; }
        await db.rolePermissions.put({ ...doc, permissions: state.rolePermissions });
    } catch (err) {
        console.error('Failed to save role permissions:', err);
    }
}

// Load Data from PouchDB
async function loadAppState() {
    const loadCollection = async (database) => {
        const result = await database.allDocs({ include_docs: true });
        return result.rows.map(row => row.doc);
    };

    try {
        state.sales = await loadCollection(db.sales);
        state.inventory = await loadCollection(db.inventory);
        state.customers = await loadCollection(db.customers);
        state.suppliers = await loadCollection(db.suppliers);
        state.purchases = await loadCollection(db.purchases);
        state.expenses = await loadCollection(db.expenses);
        state.purchaseInvoices = await loadCollection(db.purchaseInvoices);
        state.saleInvoices = await loadCollection(db.saleInvoices);
        
        // Load saved role permissions (overrides defaults if found)
        try {
            const rpDoc = await db.rolePermissions.get('config');
            // Merge saved perms with defaults (so new modules appear with defaults)
            for (const [mod, perms] of Object.entries(rpDoc.permissions || {})) {
                if (state.rolePermissions[mod]) {
                    state.rolePermissions[mod] = { ...state.rolePermissions[mod], ...perms };
                }
            }
        } catch (e) {
            if (e.status !== 404) console.error('Error loading role permissions:', e);
            // 404 = first run, defaults are fine
        }
        
        const cats = await loadCollection(db.categories);
        if (cats.length > 0) {
            state.expenseCategories = cats.map(c => c.name);
        } else {
            // Seed defaults
            const defaults = ['Rent', 'Utilities', 'Salaries', 'Travel', 'Others'];
            for (const name of defaults) {
                await db.categories.put({ _id: name, name });
            }
            state.expenseCategories = defaults;
        }
        
        try {
            const companyDoc = await db.company.get('config');
            state.company = companyDoc;
        } catch (e) {
            if (e.status !== 404) console.error('Error loading company config:', e);
        }
    } catch (err) {
        console.error('Error loading app state from PouchDB:', err);
        showToast('Error loading data from database', 'error');
    }
}

// Update Sidebar Branding
function updateBrandingDisplay() {
    const comp = state.company;
    const sidebarLogo = document.getElementById('sidebar-logo');
    const sidebarPlaceholder = document.getElementById('sidebar-logo-placeholder');
    const sidebarName = document.getElementById('sidebar-company-name');
    const sidebarLogoContainer = document.querySelector('.sidebar-logo-container');
    
    if (comp.logoUrl) {
        sidebarLogo.src = comp.logoUrl;
        sidebarLogo.style.display = 'block';
        sidebarPlaceholder.style.display = 'none';
        sidebarLogoContainer.style.backgroundColor = 'transparent';
    } else {
        sidebarLogo.style.display = 'none';
        sidebarPlaceholder.style.display = 'flex';
        sidebarPlaceholder.textContent = comp.name ? comp.name.charAt(0).toUpperCase() : 'M';
        sidebarLogoContainer.style.backgroundColor = 'var(--primary-color)';
    }
    
    
    if (comp.name) {
        sidebarName.textContent = comp.name;
        sidebarName.style.display = 'block';
    } else {
        sidebarName.textContent = '';
        sidebarName.style.display = 'none';
    }
}

// Setup Real-time Database Listeners
function setupDatabaseListeners() {
    const dbsToWatch = ['sales', 'inventory', 'customers', 'suppliers', 'purchases', 'expenses', 'categories', 'company'];
    
    dbsToWatch.forEach(dbKey => {
        db[dbKey].changes({
            since: 'now',
            live: true,
            include_docs: true
        }).on('change', async (change) => {
            console.log(`Change detected in ${dbKey}:`, change);
            // Reload the specific state part or full state
            await loadAppState(); 
            
            // Re-render current view if applicable
            const currentView = state.currentView;
            const renderMap = {
                'sales': renderSales,
                'inventory': renderInventory,
                'customers': renderCustomers,
                'suppliers': renderSuppliers,
                'purchases': renderPurchases,
                'expenses': renderExpenses,
                'dashboard': () => { updateDashboardStats(); if(window.renderDashboardCharts) renderDashboardCharts(); }
            };
            
            if (renderMap[currentView]) {
                renderMap[currentView]();
            } else if (currentView === 'dashboard') {
                updateDashboardStats();
            }
        }).on('error', (err) => {
            console.error(`Error in ${dbKey} listener:`, err);
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    // Check for migration
    await migrateLocalStorage();
    
    // Load persisted data
    await loadAppState();
    setupDatabaseListeners(); // Start watching for changes
    updateBrandingDisplay();
    applyDashboardFilters(); // Refresh stats from loaded data

    try {
        if (supabaseClient) {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;

            if (session) {
                await loadUserSession(session.user);
            } else {
                checkAuth(null);
            }

            // Handle password reset callback
            const hash = window.location.hash;
            if (hash && hash.includes('type=recovery')) {
                openResetPasswordModal();
            }

            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    await loadUserSession(session.user);
                } else if (event === 'SIGNED_OUT') {
                    checkAuth(null);
                }
            });
        } else {
            // Fallback for development if Supabase isn't configured
            console.warn('Supabase client not initialized, using mock mode');
            const mockAdmin = { id: 1, email: 'admin@manager.io', role: 'Admin' };
            state.users = [
                mockAdmin,
                { id: 2, email: 'manager@manager.io', role: 'Manager', lastLogin: '2026-03-17' },
                { id: 3, email: 'staff@manager.io', role: 'Staff', lastLogin: '2026-03-18' }
            ];
            checkAuth(mockAdmin);
        }
    } catch (err) {
        console.error('Initialization error:', err);
        showToast('System initialization failed. Please refresh the page.', 'error');
    }
    
    updateBrandingDisplay();
}

async function loadUserSession(user) {
    try {
        let role = 'Staff';
        if (supabaseClient) {
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
                console.error('Profile fetch error:', error);
            }
            if (profile) role = profile.role;
        }
        
        checkAuth({ id: user.id, email: user.email, role });
        
        if (role === 'Admin') {
            await fetchUsers();
        }
    } catch (err) {
        console.error('Load session error:', err);
        showToast('Error loading user profile. Logging out...', 'error');
        if (supabaseClient) await supabaseClient.auth.signOut();
    }
}

async function fetchUsers() {
    if (!supabaseClient) {
        // In mock mode, users are already in state.users from initApp
        if (state.currentView === 'users') renderUsers();
        return;
    }
    
    try {
        const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('*');
        
        if (error) throw error;

        state.users = profiles;
        console.log('Fetched users:', profiles); // Debug log
        if (state.currentView === 'users') {
            renderUsers();
        }
    } catch (err) {
        console.error('Error fetching users:', err);
        showToast(`Failed to fetch users: ${err.message}`, 'error');
    }
}

function checkAuth(user) {
    try {
        if (user) {
            state.currentUser = user;
            document.getElementById('auth-container').classList.add('hidden');
            document.getElementById('main-view').classList.remove('hidden');
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-role').textContent = user.role;
            // Update avatar icon initial
            const avatarEl = document.getElementById('user-avatar-icon');
            if (avatarEl) {
                const initial = (user.email || 'U')[0].toUpperCase();
                avatarEl.textContent = initial;
            }

            // Ensure we are on the dashboard view initially
            switchView('dashboard');
            loadAppState().then(() => {
                applyDashboardFilters();
                // Apply dynamic role-based permissions to sidebar after load
                applyRolePermissionsToUI();
            });
        } else {
            state.currentUser = null;
            document.getElementById('auth-container').classList.remove('hidden');
            document.getElementById('main-view').classList.add('hidden');
            // Clear sensitive UI info
            document.getElementById('user-email').textContent = '';
            document.getElementById('user-role').textContent = '';
            const loginForm = document.getElementById('login-form');
            if (loginForm) loginForm.reset();
        }
    } catch (err) {
        console.error('Auth check error:', err);
    }
}

// Helper Functions for Party Selection & GST
window.handleSaleCustomerChange = () => {
    const customerId = document.getElementById('sale-customer').value;
    const infoDiv = document.getElementById('sale-cust-info');
    const gstTypeSelect = document.getElementById('sale-gst-type');
    
    if (!customerId) {
        infoDiv.textContent = '';
        return;
    }
    
    const customer = state.customers.find(c => c.id == customerId);
    if (customer) {
        infoDiv.textContent = `GSTIN: ${customer.gstin || 'N/A'} | State: ${customer.state || 'N/A'}`;
        
        // Auto-select GST Type
        if (customer.state && state.company.state) {
            const isNonLocal = customer.state.trim().toLowerCase() !== state.company.state.trim().toLowerCase();
            gstTypeSelect.value = isNonLocal ? 'Non-Local' : 'Local';
        }
    }
};

window.handlePurchaseSupplierChange = () => {
    const supplierId = document.getElementById('pur-supplier').value;
    const infoDiv = document.getElementById('pur-sup-info');
    const gstTypeSelect = document.getElementById('pur-gst-type');
    
    if (!supplierId) {
        infoDiv.textContent = '';
        return;
    }
    
    const supplier = state.suppliers.find(s => s.id == supplierId);
    if (supplier) {
        infoDiv.textContent = `GSTIN: ${supplier.gstin || 'N/A'} | State: ${supplier.state || 'N/A'}`;
        
        // Auto-select GST Type
        if (supplier.state && state.company.state) {
            const isNonLocal = supplier.state.trim().toLowerCase() !== state.company.state.trim().toLowerCase();
            gstTypeSelect.value = isNonLocal ? 'Non-Local' : 'Local';
        }
    }
};

window.openAddCategoryModal = () => {
    const content = `
        <form id="add-category-form">
            <div class="form-group"><label>Category Name</label><input type="text" id="new-cat-name" required></div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Add Category</button>
            </div>
        </form>
    `;
    // We need a way to open a second modal or replace content. 
    // Since our closeModal closes everything, we'll just replace the content for now or use a prompt.
    // For simplicity, let's just use a prompt for now and update the state.
    const name = prompt('Enter new category name:');
    if (name && !state.expenseCategories.includes(name)) {
        db.categories.put({ _id: name, name }).then(() => {
            state.expenseCategories.push(name);
            showToast('Category added');
            // Re-open/Refresh Expense Modal? 
            // Better to just update the select if it's open
            const select = document.getElementById('exp-cat');
            if (select) {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
                select.value = name;
            }
        });
    }
};

function setupEventListeners() {
    const navItems = document.querySelectorAll('#sidebar nav li');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // Mobile hamburger toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
            if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
        });
    }
    // Close sidebar when overlay is clicked
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
            sidebarOverlay.classList.remove('active');
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!state.currentUser) return;
            const view = item.getAttribute('data-view');
            
            // Dynamic RBAC Check — uses admin-configured permissions
            if (!hasPermission(view)) {
                showToast('Access Denied: Your role does not have permission for this module.', 'error');
                return;
            }

            switchView(view);
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Auto-close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('sidebar-open');
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            }
        });
    });

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        setBtnLoading(submitBtn, true, originalText);
        
        if (supabaseClient) {
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                showToast(`Login Failed: ${error.message}`, 'error');
            } else {
                showToast('Login Successful!');
            }
        } else {
            // Mock Login
            const user = state.users.find(u => u.email === email);
            if (user) {
                checkAuth(user);
                showToast('Login Successful (Mock Mode)');
            } else {
                showToast('Invalid email or password (Mock Mode)', 'error');
            }
        }
        setBtnLoading(submitBtn, false, originalText);
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                if (supabaseClient) {
                    await supabaseClient.auth.signOut();
                }
                // Always clear local session and show login
                checkAuth(null);
                showToast('Logged out successfully');
            } catch (err) {
                console.error('Logout error:', err);
                checkAuth(null); // Force local logout
            }
        });
    }

    const forgotPasswordLink = document.getElementById('forgot-password-link');
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        openForgotPasswordModal();
    });
}

// Modal Management
function openModal(title, contentHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = contentHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

window.closeModal = () => {
    document.getElementById('modal-overlay').classList.add('hidden');
};

// Search and Filtering Logic
window.handleSearch = (module, value) => {
    state.filters[module] = value;
    applyModuleFilters(module);
};

window.handlePeriodChange = (module) => {
    const period = document.getElementById(`${module}-period`).value;
    const customDates = document.getElementById(`${module}-custom-dates`);
    state.filters[`${module}Period`] = period;
    
    if (period === 'Custom') {
        customDates.classList.remove('hidden');
    } else {
        customDates.classList.add('hidden');
        applyModuleFilters(module);
    }
};

window.applyModuleFilters = (module) => {
    const period = state.filters[`${module}Period`];
    const startDate = document.getElementById(`${module}-start-date`)?.value;
    const endDate = document.getElementById(`${module}-end-date`)?.value;
    const today = new Date().toISOString().split('T')[0];
    
    let filteredData;
    if (module === 'sales' || module === 'pur' || module === 'exp' || module === 'pinv' || module === 'sinv') { // Generic module handling
        const dataKey = module === 'pur' ? 'purchases' : (module === 'exp' ? 'expenses' : (module === 'pinv' ? 'purchaseInvoices' : (module === 'sinv' ? 'saleInvoices' : 'sales')));
        filteredData = state[dataKey];
        
        // 1. Date Filtering
        if (period === 'Today') {
            filteredData = filteredData.filter(item => item.date === today);
        } else if (period === 'ThisMonth') {
            const month = today.slice(0, 7);
            filteredData = filteredData.filter(item => item.date.startsWith(month));
        } else if (period === 'LastMonth') {
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            const lastMonth = d.toISOString().slice(0, 7);
            filteredData = filteredData.filter(item => item.date.startsWith(lastMonth));
        } else if (period === 'Custom' && startDate && endDate) {
            filteredData = filteredData.filter(item => item.date >= startDate && item.date <= endDate);
        }
        
        // 2. Search Text Filtering
        const searchVal = state.filters[dataKey === 'purchases' ? 'purchases' : (dataKey === 'expenses' ? 'expenses' : (dataKey === 'purchaseInvoices' ? 'pinv' : (dataKey === 'saleInvoices' ? 'sinv' : 'sales')))].toLowerCase();
        if (searchVal) {
            filteredData = filteredData.filter(item => {
                if (dataKey === 'sales') return item.id.toLowerCase().includes(searchVal) || item.customer.toLowerCase().includes(searchVal);
                if (dataKey === 'purchases') return item.id.toLowerCase().includes(searchVal) || item.supplier.toLowerCase().includes(searchVal);
                if (dataKey === 'expenses') return item.category.toLowerCase().includes(searchVal) || item.description.toLowerCase().includes(searchVal);
                if (dataKey === 'purchaseInvoices') return item.invoiceNo.toLowerCase().includes(searchVal) || item.supplier.toLowerCase().includes(searchVal);
                if (dataKey === 'saleInvoices') return item.invoiceNo.toLowerCase().includes(searchVal) || item.customer.toLowerCase().includes(searchVal);
                return false;
            });
        }
        
        // Store the result back for rendering (or just pass it)
        updateModuleStats(module, filteredData);
        
        if (module === 'sales') renderSales(filteredData);
        if (module === 'pur') renderPurchases(filteredData);
        if (module === 'exp') renderExpenses(filteredData);
        if (module === 'pinv') renderPurchaseInvoices(filteredData);
        if (module === 'sinv') renderSaleInvoices(filteredData);
    }
};

window.applyReportFilters = () => {
    const period = document.getElementById('report-period').value;
    const customDates = document.getElementById('report-custom-dates');
    state.filters.reportPeriod = period;
    
    if (period === 'Custom') {
        customDates.classList.remove('hidden');
    } else {
        customDates.classList.add('hidden');
    }

    // Identify which report was active
    const title = document.getElementById('report-title-text').textContent;
    if (title.includes('Sales')) {
        generateSalesReport();
    } else if (title.includes('Purchase')) {
        generatePurchaseReport();
    }
};

function getCustomerGST(name) {
    const customer = state.customers.find(c => c.name === name);
    return customer ? (customer.gstin || '-') : '-';
}

function getSupplierGST(name) {
    const supplier = state.suppliers.find(s => s.name === name);
    return supplier ? (supplier.gstin || '-') : '-';
}

function getFilteredReportData(type) {
    const period = state.filters.reportPeriod;
    const startDate = document.getElementById('report-start-date')?.value;
    const endDate = document.getElementById('report-end-date')?.value;
    const today = new Date().toISOString().split('T')[0];
    
    let data = type === 'sales' ? state.sales : state.purchases;
    
    if (period === 'Today') {
        data = data.filter(item => item.date === today);
    } else if (period === 'ThisMonth') {
        const month = today.slice(0, 7);
        data = data.filter(item => item.date.startsWith(month));
    } else if (period === 'LastMonth') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonth = d.toISOString().slice(0, 7);
        data = data.filter(item => item.date.startsWith(lastMonth));
    } else if (period === 'Custom' && startDate && endDate) {
        data = data.filter(item => item.date >= startDate && item.date <= endDate);
    }
    
    return data;
}

function updateModuleStats(module, data) {
    const statsContainer = document.getElementById(`${module}-stats`);
    if (!statsContainer) return;
    
    let statsHTML = '';
    if (module === 'sales') {
        // Sales Module Stats
        const taxable = data.reduce((sum, s) => sum + (parseFloat(s.subtotal) || 0), 0);
        const tax = data.reduce((sum, s) => sum + (parseFloat(s.tax) || 0), 0);
        const total = data.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
        const received = data.reduce((sum, s) => sum + (parseFloat(s.receivedAmount) || 0), 0);
        const pending = data.reduce((sum, s) => sum + (parseFloat(s.pendingAmount) || 0), 0);
        
        statsHTML = `
            <div class="stat-card" style="border-left-color: var(--primary-color)">
                <h3>Total Sales</h3>
                <p class="stat-value">₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--success-color)">
                <h3>Total Received</h3>
                <p class="stat-value">₹ ${received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--danger-color)">
                <h3>Total Pending</h3>
                <p class="stat-value">₹ ${pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--secondary-color)">
                <h3>Taxable Value</h3>
                <p class="stat-value">₹ ${taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--warning-color)">
                <h3>Total Tax</h3>
                <p class="stat-value">₹ ${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        `;
    } else if (module === 'pur') {
        // Purchases Module Stats
        const taxable = data.reduce((sum, p) => sum + (parseFloat(p.subtotal) || 0), 0);
        const tax = data.reduce((sum, p) => sum + (parseFloat(p.tax) || 0), 0);
        const total = data.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
        const paid = data.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
        const pending = data.reduce((sum, p) => sum + (parseFloat(p.pendingAmount) || 0), 0);
        
        statsHTML = `
            <div class="stat-card" style="border-left-color: var(--primary-color)">
                <h3>Total Purchases</h3>
                <p class="stat-value">₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--success-color)">
                <h3>Total Paid</h3>
                <p class="stat-value">₹ ${paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--danger-color)">
                <h3>Total Pending</h3>
                <p class="stat-value">₹ ${pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--secondary-color)">
                <h3>Taxable Value</h3>
                <p class="stat-value">₹ ${taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--warning-color)">
                <h3>Total Tax</h3>
                <p class="stat-value">₹ ${tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        `;
    } else if (module === 'exp') {
        const totalExpenses = data.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        statsHTML = `
            <div class="stat-card" style="border-left-color: var(--danger-color)">
                <h3>Total Expenses</h3>
                <p class="stat-value">₹ ${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        `;
    }
    
    statsContainer.innerHTML = statsHTML;
}

window.updateSaleStatus = async (id, newStatus) => {
    try {
        const saleIndex = state.sales.findIndex(s => s.id === id);
        if (saleIndex === -1) return;

        const sale = state.sales[saleIndex];
        sale.status = newStatus;

        // Update PouchDB
        const doc = await db.sales.get(id);
        await db.sales.put({ ...doc, status: newStatus });

        await saveAppState();
        applyModuleFilters('sales');
        updateDashboardStats();
        showToast(`Sale ${id} marked as ${newStatus}`);
    } catch (err) {
        console.error('Error updating sale status:', err);
        showToast('Failed to update status', 'error');
    }
};

window.updatePurchaseStatus = async (id, newStatus) => {
    try {
        const purIndex = state.purchases.findIndex(p => p.id === id);
        if (purIndex === -1) return;

        const pur = state.purchases[purIndex];
        pur.status = newStatus;

        // Update PouchDB
        const doc = await db.purchases.get(id);
        await db.purchases.put({ ...doc, status: newStatus });

        await saveAppState();
        applyModuleFilters('pur');
        updateDashboardStats();
        showToast(`Purchase ${id} marked as ${newStatus}`);
    } catch (err) {
        console.error('Error updating purchase status:', err);
        showToast('Failed to update status', 'error');
    }
};

function switchView(view) {
    state.currentView = view;
    document.getElementById('view-title').textContent = view.charAt(0).toUpperCase() + view.slice(1);
    
    const modules = document.querySelectorAll('.module');
    modules.forEach(m => m.classList.add('hidden'));
    
    const currentModule = document.getElementById(`${view}-view`);
    if (currentModule) {
        currentModule.classList.remove('hidden');
        if (view === 'dashboard') renderDashboardCharts();
        if (view === 'sales') applyModuleFilters('sales');
        if (view === 'inventory') renderInventory();
        if (view === 'purchases') applyModuleFilters('pur');
        if (view === 'customers') renderCustomers();
        if (view === 'suppliers') renderSuppliers();
        if (view === 'expenses') applyModuleFilters('exp');
        if (view === 'purchase-invoices') applyModuleFilters('pinv');
        if (view === 'sale-invoices') applyModuleFilters('sinv');
        if (view === 'profile') renderProfileForm();
        if (view === 'users') {
            if (supabaseClient) {
                fetchUsers();
            } else {
                renderUsers();
            }
        }
    } else {
        const moduleContainer = document.getElementById('module-container');
        let placeholder = document.getElementById(`${view}-view`);
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.id = `${view}-view`;
            placeholder.className = 'module';
            moduleContainer.appendChild(placeholder);
        }
        placeholder.classList.remove('hidden');
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <i class="fas fa-tools fa-3x" style="color: #64748b; margin-bottom: 1rem;"></i>
                <h3>${view.charAt(0).toUpperCase() + view.slice(1)} Module Under Development</h3>
                <p>We are building this module based on the PRD requirements.</p>
            </div>
        `;
    }
}

function renderSales(data) {
    const list = document.getElementById('sales-list');
    const searchTerm = state.filters.sales.toLowerCase();
    
    const filteredSales = data || state.sales.filter(sale => 
        sale.id.toLowerCase().includes(searchTerm) || 
        sale.customer.toLowerCase().includes(searchTerm) ||
        sale.status.toLowerCase().includes(searchTerm)
    );

    list.innerHTML = filteredSales.map(sale => `
        <tr>
            <td>${sale.id}</td>
            <td>${sale.date}</td>
            <td>${sale.customer}</td>
            <td>₹ ${sale.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹ ${(sale.receivedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹ ${(sale.pendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>
                <select class="status-pill status-${sale.status ? sale.status.toLowerCase() : 'pending'}" onchange="updateSaleStatus('${sale.id}', this.value)" style="border: none; cursor: pointer; outline: none;">
                    <option value="Paid" ${sale.status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Pending" ${sale.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Overdue" ${sale.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                </select>
            </td>
            <td>
                ${sale.attachment ? `<button class="action-btn" onclick="viewSaleAttachment('${sale.id}')" title="View Document"><i class="fas fa-paperclip"></i></button>` : ''}
                <button class="action-btn" onclick="viewSale('${sale.id}')" title="View/Print Invoice"><i class="fas fa-eye"></i></button>
                <button class="action-btn" onclick="openEditSaleModal('${sale.id}')" title="Edit Sale"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteSale('${sale.id}')" title="Delete Sale"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.viewSaleAttachment = (id) => {
    const sale = state.sales.find(s => s.id === id);
    if (!sale || !sale.attachment) {
        showToast('No document attached', 'error');
        return;
    }

    try {
        const base64Data = sale.attachment.split(',')[1] || sale.attachment;
        const mimeType = sale.attachment.substring(5, sale.attachment.indexOf(';'));
        
        const bin = atob(base64Data);
        const len = bin.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = bin.charCodeAt(i);
        }
        const blob = new Blob([arr], { type: mimeType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (e) {
        console.error('Error opening attachment:', e);
        showToast('Failed to open document', 'error');
    }
};

function renderInventory() {
    const list = document.getElementById('inventory-list');
    const searchTerm = state.filters.inventory.toLowerCase();
    
    const filteredItems = state.inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.sku.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );

    list.innerHTML = filteredItems.map(item => `
        <tr class="${item.stock < item.minStock ? 'low-stock-row' : ''}">
            <td>${item.name}</td>
            <td>${item.sku}</td>
            <td class="${item.stock < item.minStock ? 'text-danger' : ''}">
                ${item.stock} 
                ${item.stock < item.minStock ? '<i class="fas fa-exclamation-triangle" title="Below Minimum Stock"></i>' : ''}
            </td>
            <td>₹ ${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>${item.category}</td>
            <td style="font-size: 0.85em; color: var(--text-light);">${item.minStock}</td>
            <td>
                <button class="action-btn" onclick="openEditItemModal('${item.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderPurchases(data) {
    const list = document.getElementById('purchases-list');
    const searchTerm = state.filters.purchases.toLowerCase();
    
    const filteredPurchases = data || state.purchases.filter(pur => 
        pur.id.toLowerCase().includes(searchTerm) || 
        pur.supplier.toLowerCase().includes(searchTerm) ||
        pur.status.toLowerCase().includes(searchTerm)
    );

    list.innerHTML = filteredPurchases.map(pur => `
        <tr>
            <td>${pur.id}</td>
            <td>${pur.date}</td>
            <td>${pur.supplier}</td>
            <td>₹ ${pur.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹ ${(pur.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹ ${(pur.pendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>
                <select class="status-pill status-${pur.status ? pur.status.toLowerCase() : 'pending'}" onchange="updatePurchaseStatus('${pur.id}', this.value)" style="border: none; cursor: pointer; outline: none;">
                    <option value="Paid" ${pur.status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Pending" ${pur.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Overdue" ${pur.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                </select>
            </td>
            <td>
                ${pur.attachment ? `<button class="action-btn" onclick="viewPurchaseAttachment('${pur.id}')" title="View Document"><i class="fas fa-paperclip"></i></button>` : ''}
                <button class="action-btn" onclick="viewPurchase('${pur.id}')" title="View Bill"><i class="fas fa-eye"></i></button>
                <button class="action-btn" onclick="openEditPurchaseModal('${pur.id}')" title="Edit Purchase"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deletePurchase('${pur.id}')" title="Delete Purchase"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.viewPurchaseAttachment = (id) => {
    const pur = state.purchases.find(p => p.id === id);
    if (!pur || !pur.attachment) {
        showToast('No document attached', 'error');
        return;
    }

    try {
        const base64Data = pur.attachment.split(',')[1] || pur.attachment;
        const mimeType = pur.attachment.substring(5, pur.attachment.indexOf(';'));
        
        const bin = atob(base64Data);
        const len = bin.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = bin.charCodeAt(i);
        }
        const blob = new Blob([arr], { type: mimeType || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (e) {
        console.error('Error opening attachment:', e);
        showToast('Failed to open document', 'error');
    }
};

function renderCustomers() {
    const list = document.getElementById('customers-list');
    const searchTerm = state.filters.customers.toLowerCase();
    
    const filtered = state.customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        (c.phone && c.phone.toLowerCase().includes(searchTerm)) ||
        (c.gstin && c.gstin.toLowerCase().includes(searchTerm))
    );

    list.innerHTML = filtered.map(c => `
        <tr>
            <td>${c.name}</td>
            <td style="font-family: monospace; font-size: 0.9em;">${c.gstin || '-'}</td>
            <td>${c.phone || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>${c.address}</td>
            <td>
                <button class="action-btn" onclick="openEditCustomerModal('${c.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderSuppliers() {
    const list = document.getElementById('suppliers-list');
    const searchTerm = state.filters.suppliers.toLowerCase();
    
    const filtered = state.suppliers.filter(s => 
        s.name.toLowerCase().includes(searchTerm) || 
        (s.phone && s.phone.toLowerCase().includes(searchTerm)) ||
        (s.gstin && s.gstin.toLowerCase().includes(searchTerm))
    );

    list.innerHTML = filtered.map(s => `
        <tr>
            <td>${s.name}</td>
            <td style="font-family: monospace; font-size: 0.9em;">${s.gstin || '-'}</td>
            <td>${s.phone || '-'}</td>
            <td>${s.email || '-'}</td>
            <td>${s.address}</td>
            <td>
                <button class="action-btn" onclick="openEditSupplierModal('${s.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteSupplier('${s.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderExpenses(data) {
    const list = document.getElementById('expenses-list');
    const searchTerm = state.filters.expenses.toLowerCase();
    
    const filtered = data || state.expenses.filter(e => 
        e.category.toLowerCase().includes(searchTerm) || 
        e.description.toLowerCase().includes(searchTerm)
    );

    list.innerHTML = filtered.map(e => `
        <tr>
            <td>${e.date}</td>
            <td>${e.category}</td>
            <td>${e.description}</td>
            <td>₹ ${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>
                <button class="action-btn" onclick="openEditExpenseModal('${e.id}')" title="Edit Expense"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteExpense('${e.id}')" title="Delete Expense"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderPurchaseInvoices(data) {
    const list = document.getElementById('pinv-list');
    if (!list) return;

    const searchTerm = state.filters.pinv.toLowerCase();
    const filtered = data || state.purchaseInvoices.filter(inv => 
        inv.invoiceNo.toLowerCase().includes(searchTerm) || 
        inv.supplier.toLowerCase().includes(searchTerm)
    );

    list.innerHTML = filtered.map(inv => `
        <tr>
            <td>${inv.invoiceNo}</td>
            <td>${inv.date}</td>
            <td>${inv.supplier}</td>
            <td style="font-weight: bold;">₹ ${parseFloat(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="color: var(--success-color)">₹ ${parseFloat(inv.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="color: var(--danger-color)">₹ ${parseFloat(inv.pendingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td><span class="status-badge status-${inv.status.toLowerCase()}">${inv.status}</span></td>
            <td>
                ${inv.attachment ? `<button class="action-btn" onclick="viewInvoicePDF('${inv.id}')" title="View PDF"><i class="fas fa-file-pdf"></i></button>` : ''}
                <button class="action-btn" onclick="openEditPurchaseInvoiceModal('${inv.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deletePurchaseInvoice('${inv.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderSaleInvoices(data) {
    const list = document.getElementById('sinv-list');
    if (!list) return;

    const searchTerm = state.filters.sinv.toLowerCase();
    const filtered = data || state.saleInvoices.filter(inv => 
        inv.invoiceNo.toLowerCase().includes(searchTerm) || 
        inv.customer.toLowerCase().includes(searchTerm)
    );

    list.innerHTML = filtered.map(inv => `
        <tr>
            <td>${inv.invoiceNo}</td>
            <td>${inv.date}</td>
            <td>${inv.customer}</td>
            <td style="font-weight: bold;">₹ ${parseFloat(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="color: var(--success-color)">₹ ${parseFloat(inv.receivedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="color: var(--danger-color)">₹ ${parseFloat(inv.pendingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td><span class="status-badge status-${inv.status.toLowerCase()}">${inv.status}</span></td>
            <td>
                ${inv.attachment ? `<button class="action-btn" onclick="viewSaleInvoicePDF('${inv.id}')" title="View PDF"><i class="fas fa-file-pdf"></i></button>` : ''}
                <button class="action-btn" onclick="openEditSaleInvoiceModal('${inv.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deleteSaleInvoice('${inv.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.viewInvoicePDF = (id) => {
    const inv = state.purchaseInvoices.find(i => i.id === id);
    if (!inv || !inv.attachment) {
        showToast('No attachment found', 'error');
        return;
    }

    try {
        const base64Data = inv.attachment.split(',')[1] || inv.attachment;
        const bin = atob(base64Data);
        const len = bin.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = bin.charCodeAt(i);
        }
        const blob = new Blob([arr], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (e) {
        console.error('Error opening PDF:', e);
        showToast('Failed to open PDF document', 'error');
    }
};

window.viewSaleInvoicePDF = (id) => {
    const inv = state.saleInvoices.find(i => i.id === id);
    if (!inv || !inv.attachment) {
        showToast('No attachment found', 'error');
        return;
    }

    try {
        // Handle images differently from PDF
        if (inv.attachment.startsWith('data:image')) {
            // It's an image, create an object URL directly from a fetch, or just open base64
            // Since base64 image urls can be large, we can create a blob
            fetch(inv.attachment)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                });
            return;
        }

        const base64Data = inv.attachment.split(',')[1] || inv.attachment;
        const bin = atob(base64Data);
        const len = bin.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = bin.charCodeAt(i);
        }
        const blob = new Blob([arr], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (e) {
        console.error('Error opening Attachment:', e);
        showToast('Failed to open attachment document', 'error');
    }
};

// Sales Module Implementation
function getNextInvoiceNumber() {
    if (state.sales.length === 0) return "INV-001";
    
    // Try to find the highest numeric part in existing invoices
    const invoiceNumbers = state.sales.map(s => {
        const match = s.id.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    });
    
    const maxNo = Math.max(...invoiceNumbers);
    const nextNo = maxNo + 1;
    
    // Format with leading zeros (e.g., INV-002)
    return `INV-${nextNo.toString().padStart(3, '0')}`;
}

window.openNewSaleModal = () => {
    const customerOptions = state.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const content = `
        <form id="new-sale-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Invoice Number</label>
                    <input type="text" id="sale-invoice-no" placeholder="Leave empty for auto-generation">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="sale-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Customer</label>
                    <select id="sale-customer" onchange="handleSaleCustomerChange()" required>
                        <option value="">Select Customer</option>
                        ${customerOptions}
                    </select>
                    <div id="sale-cust-info" style="font-size: 0.8em; color: var(--text-light); margin-top: 4px;"></div>
                </div>
                <div class="form-group">
                    <label>GST Type</label>
                    <select id="sale-gst-type" onchange="calculateSaleTotals()" required>
                        <option value="Local">Local (CGST + SGST)</option>
                        <option value="Non-Local">Non-Local (IGST)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Mode</label>
                    <select id="sale-payment-mode">
                        <option value="">(None)</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Received Amount (₹)</label>
                    <input type="number" id="sale-received-amount" step="0.01" value="0.00" oninput="calculateSaleTotals()">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="sale-status">
                        <option value="Paid">Paid</option>
                        <option value="Pending" selected>Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Pending Amount (₹)</label>
                    <input type="text" id="sale-pending-display" value="0.00" readonly>
                </div>
            </div>
            <div class="modal-table-wrapper">
                <table class="sale-items-table">
                    <thead>
                        <tr>
                            <th width="300">Product</th>
                            <th width="120">HSN/SAC</th>
                            <th width="100">Qty</th>
                            <th width="130">Price</th>
                            <th width="110">Tax %</th>
                            <th width="140">Total</th>
                            <th width="50"></th>
                        </tr>
                    </thead>
                    <tbody id="sale-items-list"></tbody>
                </table>
            </div>
            <button type="button" class="btn-primary" style="width: auto; margin-bottom: 1rem;" onclick="addSaleItemRow()">
                <i class="fas fa-plus"></i> Add Item
            </button>
            <div class="totals-section">
                <div><span>Subtotal:</span> <span id="sale-subtotal">₹ 0.00</span></div>
                <div><span>Tax Total:</span> <span id="sale-tax-total">₹ 0.00</span></div>
                <div class="grand-total"><span>Grand Total:</span> <span id="sale-grand-total">₹ 0.00</span></div>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label>Order Completion Document (PDF/JPG Optional)</label>
                <input type="file" id="sale-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" class="btn-primary" style="width: auto; background-color: var(--secondary-color);" onclick="this.form.dataset.action='save'">Save Only</button>
                    <button type="submit" class="btn-primary" style="width: auto;" onclick="this.form.dataset.action='generate'">Save & Generate</button>
                </div>
            </div>
        </form>
    `;
    openModal('Create New Sale', content);
    document.getElementById('new-sale-form').addEventListener('submit', handleSaleSubmit);
    addSaleItemRow();
};

window.addSaleItemRow = () => {
    const tbody = document.getElementById('sale-items-list');
    const rowId = Date.now();
    const productOptions = state.inventory.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    const tr = document.createElement('tr');
    tr.id = `row-${rowId}`;
    tr.innerHTML = `
        <td width="300"><select class="item-product" onchange="updateSaleRowDetails('${rowId}')" required><option value="">Select Product</option>${productOptions}</select></td>
        <td width="120"><input type="text" class="item-hsn" placeholder="HSN/SAC"></td>
        <td width="100"><input type="number" class="item-qty" value="1" min="1" oninput="calculateSaleTotals()" required></td>
        <td width="130"><input type="number" class="item-price" step="0.01" oninput="calculateSaleTotals()" required></td>
        <td class="item-tax-cell" width="110"><input type="number" class="item-tax" data-total-tax="0" value="0" readonly></td>
        <td width="140"><input type="text" class="item-total" readonly value="0.00"></td>
        <td width="50"><button type="button" class="action-btn" onclick="removeSaleRow('${rowId}')"><i class="fas fa-times"></i></button></td>
    `;
    tbody.appendChild(tr);
    calculateSaleTotals();
};

window.removeSaleRow = (id) => {
    const row = document.getElementById(`row-${id}`);
    if (row) row.remove();
    calculateSaleTotals();
};

window.updateSaleRowDetails = (rowId) => {
    const row = document.getElementById(`row-${rowId}`);
    const productId = row.querySelector('.item-product').value;
    const product = state.inventory.find(p => p.id == productId);
    if (product) {
        row.querySelector('.item-price').value = product.price;
        row.querySelector('.item-hsn').value = product.hsn || '';
        const taxInput = row.querySelector('.item-tax');
        taxInput.dataset.totalTax = product.taxRate;
        calculateSaleTotals();
    }
};

window.calculateSaleTotals = () => {
    const gstType = document.getElementById('sale-gst-type')?.value || 'Local';
    const headerRow = document.querySelector('.sale-items-table thead tr');
    
    if (headerRow) {
        if (gstType === 'Local') {
            headerRow.innerHTML = `
                <th width="300">Product</th>
                <th width="120">HSN/SAC</th>
                <th width="100">Qty</th>
                <th width="130">Price</th>
                <th width="110">CGST %</th>
                <th width="110">SGST %</th>
                <th width="140">Total</th>
                <th width="50"></th>
            `;
        } else {
            headerRow.innerHTML = `
                <th width="300">Product</th>
                <th width="120">HSN/SAC</th>
                <th width="100">Qty</th>
                <th width="130">Price</th>
                <th width="110">IGST %</th>
                <th width="140">Total</th>
                <th width="50"></th>
            `;
        }
    }

    const rows = document.querySelectorAll('#sale-items-list tr');
    let subtotal = 0, taxTotal = 0;
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const totalTaxRate = parseFloat(row.querySelector('.item-tax').dataset.totalTax || 0);
        
        const lineSubtotal = qty * price;
        const lineTax = lineSubtotal * (totalTaxRate / 100);
        
        // Update row display
        if (gstType === 'Local') {
            const halfTax = (totalTaxRate / 2).toFixed(2);
            row.querySelector('.item-tax-cell').innerHTML = `
                <input type="number" class="item-tax" data-total-tax="${totalTaxRate}" value="${halfTax}" readonly>
            `;
            // Add second tax cell if missing
            if (!row.querySelector('.item-tax-sgst')) {
                const td = document.createElement('td');
                td.className = 'item-tax-sgst-cell';
                td.innerHTML = `<input type="number" class="item-tax-sgst" value="${halfTax}" readonly>`;
                row.insertBefore(td, row.querySelector('.item-total').parentElement);
            } else {
                row.querySelector('.item-tax-sgst').value = halfTax;
            }
        } else {
            row.querySelector('.item-tax-cell').innerHTML = `
                <input type="number" class="item-tax" data-total-tax="${totalTaxRate}" value="${totalTaxRate}" readonly>
            `;
            const sgstCell = row.querySelector('.item-tax-sgst-cell');
            if (sgstCell) sgstCell.remove();
        }

        row.querySelector('.item-total').value = (lineSubtotal + lineTax).toFixed(2);
        subtotal += lineSubtotal;
        taxTotal += lineTax;
    });

    document.getElementById('sale-subtotal').textContent = `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    const taxLabel = gstType === 'Local' ? 'CGST + SGST' : 'IGST';
    document.getElementById('sale-tax-total').parentElement.firstChild.textContent = `${taxLabel} Total:`;
    document.getElementById('sale-tax-total').textContent = `₹ ${taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const grandTotal = subtotal + taxTotal;
    document.getElementById('sale-grand-total').textContent = `₹ ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    // Calculate Pending
    const received = parseFloat(document.getElementById('sale-received-amount')?.value) || 0;
    const pending = grandTotal - received;
    const pendingDisp = document.getElementById('sale-pending-display');
    if (pendingDisp) pendingDisp.value = pending.toFixed(2);
};

// Amount to Words conversion utility
function amountToWords(amount) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

    function convertGroup(n) {
        if (n < 20) return units[n];
        let s = tens[Math.floor(n / 10)];
        if (n % 10 > 0) s += ' ' + units[n % 10];
        return s;
    }

    function convertHundred(n) {
        let s = '';
        if (n >= 100) {
            s += units[Math.floor(n / 100)] + ' Hundred';
            n %= 100;
            if (n > 0) s += ' ';
        }
        if (n > 0) s += convertGroup(n);
        return s;
    }

    if (amount === 0) return 'Zero Rupees only';

    let n = Math.floor(amount);
    let parts = [];
    
    // Crore
    if (n >= 10000000) {
        parts.push(convertHundred(Math.floor(n / 10000000)) + ' Crore');
        n %= 10000000;
    }
    // Lakh
    if (n >= 100000) {
        parts.push(convertHundred(Math.floor(n / 100000)) + ' Lakh');
        n %= 100000;
    }
    // Thousand
    if (n >= 1000) {
        parts.push(convertHundred(Math.floor(n / 1000)) + ' Thousand');
        n %= 1000;
    }
    // Hundred
    if (n > 0) {
        parts.push(convertHundred(n));
    }

    return parts.join(' ') + ' Rupees only';
}

async function handleSaleSubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    setBtnLoading(submitBtn, true, originalText);

    try {
        const customerId = document.getElementById('sale-customer').value;
        const customer = state.customers.find(c => c.id == customerId);
        const date = document.getElementById('sale-date').value;
        const gstType = document.getElementById('sale-gst-type').value;
        const paymentMode = document.getElementById('sale-payment-mode').value;
        const items = [];
        document.querySelectorAll('#sale-items-list tr').forEach(row => {
            const productId = row.querySelector('.item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.item-qty').value);
            
            const totalTaxRate = parseFloat(row.querySelector('.item-tax').dataset.totalTax || 0);

            items.push({ 
                name: product.name, 
                code: product.sku,
                hsn: row.querySelector('.item-hsn').value || product.hsn || '84716050',
                qty, 
                price: row.querySelector('.item-price').value, 
                tax: totalTaxRate, 
                total: row.querySelector('.item-total').value 
            });
        });
        
        const grandTotalRaw = document.getElementById('sale-grand-total').textContent.replace('₹', '').replace(/,/g, '').trim();
        const subtotalRaw = document.getElementById('sale-subtotal').textContent.replace('₹', '').replace(/,/g, '').trim();
        const taxRaw = document.getElementById('sale-tax-total').textContent.replace('₹', '').replace(/,/g, '').trim();
        
        let invoiceNo = document.getElementById('sale-invoice-no').value.trim();
        if (!invoiceNo) {
            invoiceNo = getNextInvoiceNumber();
        }

        // Check for duplicates
        if (state.sales.some(s => s.id === invoiceNo)) {
            showToast(`Invoice number ${invoiceNo} already exists!`, 'error');
            setBtnLoading(submitBtn, false, originalText);
            return;
        }

        let attachmentBase64 = null;
        const fileInput = document.getElementById('sale-attachment');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            attachmentBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const receivedAmount = parseFloat(document.getElementById('sale-received-amount').value) || 0;
        const status = document.getElementById('sale-status').value;
        const pendingAmount = parseFloat(grandTotalRaw) - receivedAmount;

        const saleDoc = { 
            _id: invoiceNo,
            id: invoiceNo, 
            date, 
            customer: customer.name, 
            customerObj: customer,
            gstType,
            items, 
            subtotal: subtotalRaw, 
            tax: taxRaw, 
            total: parseFloat(grandTotalRaw),
            receivedAmount,
            pendingAmount,
            paymentMode, 
            status,
            attachment: attachmentBase64
        };
        // Save Sale to PouchDB
        await db.sales.put(saleDoc);

        // Update Inventory in PouchDB and State
        for (const item of items) {
            const product = state.inventory.find(p => p.sku === item.code);
            if (product) {
                product.stock -= item.qty;
                const latestProductDoc = await db.inventory.get(product._id);
                await db.inventory.put({ ...latestProductDoc, stock: product.stock });
            }
        }

        // Update local state for immediate UI update
        state.sales.unshift({ ...saleDoc });
        
        await saveAppState(); // Updates stats and charts
        if (e.target.dataset.action === 'generate') {
            await generateInvoicePDF(invoiceNo, date, customer, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, 'Sales', paymentMode);
            showToast(`Sale saved! Invoice ${invoiceNo} generated.`);
        } else {
            showToast(`Sale saved!`);
        }
        closeModal();
        applyModuleFilters('sales');
        updateDashboardStats();
    } catch (err) {
        showToast(`Error saving sale: ${err.message}`, 'error');
    } finally {
        setBtnLoading(submitBtn, false, originalText);
    }
}

async function handleSaleUpdate(e) {
    e.preventDefault();
    const invoiceNo = document.getElementById('edit-sale-id').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    setBtnLoading(submitBtn, true, originalText);

    try {
        const customerId = document.getElementById('sale-customer').value;
        const customer = state.customers.find(c => c.id == customerId);
        const date = document.getElementById('sale-date').value;
        const gstType = document.getElementById('sale-gst-type').value;
        const paymentMode = document.getElementById('sale-payment-mode').value;
        const items = [];
        
        document.querySelectorAll('#sale-items-list tr').forEach(row => {
            const productId = row.querySelector('.item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.item-qty').value);
            const totalTaxRate = parseFloat(row.querySelector('.item-tax').dataset.totalTax || 0);

            items.push({ 
                name: product.name, 
                code: product.sku,
                hsn: (row.querySelector('.pur-item-hsn') || row.querySelector('.item-hsn')).value || (product ? product.hsn : '') || '84716050',
                qty, 
                price: row.querySelector('.item-price').value, 
                tax: totalTaxRate, 
                total: row.querySelector('.item-total').value 
            });
        });

        const grandTotalRaw = document.getElementById('sale-grand-total').textContent.replace('₹', '').replace(/,/g, '').trim();
        const subtotalRaw = document.getElementById('sale-subtotal').textContent.replace('₹', '').replace(/,/g, '').trim();
        const taxRaw = document.getElementById('sale-tax-total').textContent.replace('₹', '').replace(/,/g, '').trim();

        const saleIndex = state.sales.findIndex(s => s.id === invoiceNo);
        if (saleIndex !== -1) {
            // Restore old stock
            const oldSale = state.sales[saleIndex];
            for (const item of oldSale.items) {
                const product = state.inventory.find(p => p.sku === item.code);
                if (product) {
                    product.stock += item.qty;
                    const latest = await db.inventory.get(product._id);
                    await db.inventory.put({ ...latest, stock: product.stock });
                }
            }
            // Subtract new stock
            for (const item of items) {
                const product = state.inventory.find(p => p.sku === item.code);
                if (product) {
                    product.stock -= item.qty;
                    const latest = await db.inventory.get(product._id);
                    await db.inventory.put({ ...latest, stock: product.stock });
                }
            }

            const receivedAmount = parseFloat(document.getElementById('sale-received-amount').value) || 0;
            const status = document.getElementById('sale-status').value;
            const pendingAmount = parseFloat(grandTotalRaw) - receivedAmount;

            let attachmentBase64 = oldSale.attachment; // Corrected: use oldSale instead of sale
            const fileInput = document.getElementById('sale-attachment');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                attachmentBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            const updatedSale = { 
                ...state.sales[saleIndex],
                date, 
                customer: customer.name, 
                customerObj: customer,
                gstType,
                items, 
                subtotal: subtotalRaw, 
                tax: taxRaw, 
                total: parseFloat(grandTotalRaw),
                receivedAmount,
                pendingAmount,
                paymentMode,
                status,
                attachment: attachmentBase64
            };

            const latestDoc = await db.sales.get(invoiceNo);
            await db.sales.put({ ...latestDoc, ...updatedSale });
            state.sales[saleIndex] = updatedSale;

            await saveAppState();
            
            if (e.target.dataset.action === 'generate') {
                await generateInvoicePDF(invoiceNo, date, customer, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, 'Sales', paymentMode);
                showToast(`Invoice ${invoiceNo} updated and re-generated.`);
            } else {
                showToast(`Invoice ${invoiceNo} updated.`);
            }
            closeModal();
            applyModuleFilters('sales');
        }
    } catch (err) {
        showToast(`Error updating sale: ${err.message}`, 'error');
    } finally {
        setBtnLoading(submitBtn, false, originalText);
    }
}

window.openEditSaleModal = (id) => {
    const sale = state.sales.find(s => s.id === id);
    if (!sale) {
        showToast('Sale not found', 'error');
        return;
    }

    const customerOptions = state.customers.map(c => `<option value="${c.id}" ${c.name === sale.customer ? 'selected' : ''}>${c.name}</option>`).join('');
    
    const content = `
        <form id="edit-sale-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Invoice Number</label>
                    <input type="text" id="edit-sale-id" value="${sale.id}" readonly style="background-color: #f1f5f9;">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="sale-date" value="${sale.date}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Customer</label>
                    <select id="sale-customer" onchange="handleSaleCustomerChange()" required>
                        <option value="">Select Customer</option>
                        ${customerOptions}
                    </select>
                    <div id="sale-cust-info" style="font-size: 0.8em; color: var(--text-light); margin-top: 4px;"></div>
                </div>
                <div class="form-group">
                    <label>GST Type</label>
                    <select id="sale-gst-type" onchange="calculateSaleTotals()" required>
                        <option value="Local" ${sale.gstType === 'Local' ? 'selected' : ''}>Local (CGST + SGST)</option>
                        <option value="Non-Local" ${sale.gstType === 'Non-Local' ? 'selected' : ''}>Non-Local (IGST)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Mode</label>
                    <select id="sale-payment-mode">
                        <option value="" ${!sale.paymentMode ? 'selected' : ''}>(None)</option>
                        <option value="Cash" ${sale.paymentMode === 'Cash' ? 'selected' : ''}>Cash</option>
                        <option value="Cheque" ${sale.paymentMode === 'Cheque' ? 'selected' : ''}>Cheque</option>
                        <option value="Bank Transfer" ${sale.paymentMode === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                        <option value="UPI" ${sale.paymentMode === 'UPI' ? 'selected' : ''}>UPI</option>
                        <option value="Credit Card" ${sale.paymentMode === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Received Amount (₹)</label>
                    <input type="number" id="sale-received-amount" step="0.01" value="${sale.receivedAmount || 0}" oninput="calculateSaleTotals()">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="sale-status">
                        <option value="Paid" ${sale.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Pending" ${sale.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Overdue" ${sale.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Pending Amount (₹)</label>
                    <input type="text" id="sale-pending-display" value="${sale.pendingAmount || 0}" readonly>
                </div>
            </div>
            <div class="modal-table-wrapper">
                <table class="sale-items-table">
                    <thead>
                        <tr>
                            <th width="300">Product</th>
                            <th width="120">HSN/SAC</th>
                            <th width="100">Qty</th>
                            <th width="130">Price</th>
                            <th width="110">Tax %</th>
                            <th width="140">Total</th>
                            <th width="50"></th>
                        </tr>
                    </thead>
                    <tbody id="sale-items-list"></tbody>
                </table>
            </div>
            <button type="button" class="btn-primary" style="width: auto; margin-bottom: 1rem;" onclick="addSaleItemRow()">
                <i class="fas fa-plus"></i> Add Item
            </button>
            <div class="totals-section">
                <div><span>Subtotal:</span> <span id="sale-subtotal">₹ 0.00</span></div>
                <div><span>Tax Total:</span> <span id="sale-tax-total">₹ 0.00</span></div>
                <div class="grand-total"><span>Grand Total:</span> <span id="sale-grand-total">₹ 0.00</span></div>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label>Replace Order Completion Document (Optional)</label>
                <input type="file" id="sale-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
                ${sale.attachment ? '<small style="color:var(--text-muted);display:block;margin-top:4px;">Currently attached. Uploading new will overwrite.</small>' : ''}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" class="btn-primary" style="width: auto; background-color: var(--secondary-color);" onclick="this.form.dataset.action='save'">Update Only</button>
                    <button type="submit" class="btn-primary" style="width: auto;" onclick="this.form.dataset.action='generate'">Update & Re-generate</button>
                </div>
            </div>
        </form>
    `;
    
    openModal('Edit Sale', content);
    
    // Populate items
    if (sale.items && sale.items.length > 0) {
        sale.items.forEach(item => {
            addSaleItemRowWithData(item);
        });
    } else {
        addSaleItemRow();
    }
    
    calculateSaleTotals();
    handleSaleCustomerChange(); // Populate info on open
    document.getElementById('edit-sale-form').addEventListener('submit', handleSaleUpdate);
};

window.addSaleItemRowWithData = (item) => {
    const tbody = document.getElementById('sale-items-list');
    const rowId = Date.now() + Math.random();
    const productOptions = state.inventory.map(p => `<option value="${p.id}" ${p.name === item.name ? 'selected' : ''}>${p.name}</option>`).join('');
    const tr = document.createElement('tr');
    tr.id = `row-${rowId}`;
    tr.innerHTML = `
        <td width="300"><select class="item-product" onchange="updateSaleRowDetails('${rowId}')" required><option value="">Select Product</option>${productOptions}</select></td>
        <td width="120"><input type="text" class="item-hsn" value="${item.hsn || ''}" placeholder="HSN/SAC"></td>
        <td width="100"><input type="number" class="item-qty" value="${item.qty}" min="1" oninput="calculateSaleTotals()" required></td>
        <td width="130"><input type="number" class="item-price" value="${item.price}" step="0.01" oninput="calculateSaleTotals()" required></td>
        <td class="item-tax-cell" width="110"><input type="number" class="item-tax" data-total-tax="${item.tax}" value="${item.tax}" readonly></td>
        <td width="140"><input type="text" class="item-total" readonly value="${item.total}"></td>
        <td width="50"><button type="button" class="action-btn" onclick="removeSaleRow('${rowId}')"><i class="fas fa-times"></i></button></td>
    `;
    tbody.appendChild(tr);
};



window.viewSale = async (id) => {
    const sale = state.sales.find(s => s.id === id);
    if (!sale) {
        showToast('Sale not found', 'error');
        return;
    }
    
    if (sale.customerObj && sale.items) {
        await generateInvoicePDF(sale.id, sale.date, sale.customerObj, sale.items, sale.subtotal, sale.tax, sale.total, sale.gstType || 'Local', 'Sales', sale.paymentMode || '');
        showToast('Invoice re-generated');
    } else {
        showToast('Invoice detail not available for this record.', 'warning');
    }
};

window.viewPurchase = async (id) => {
    const pur = state.purchases.find(p => p.id === id);
    if (!pur) {
        showToast('Purchase not found', 'error');
        return;
    }
    
    if (pur.supplierObj && pur.items) {
        await generateInvoicePDF(pur.id, pur.date, pur.supplierObj, pur.items, pur.subtotal, pur.tax, pur.total, pur.gstType || 'Local', 'Purchases', pur.paymentMode || '');
        showToast('Bill re-generated');
    } else {
        showToast('Bill detail not available for this record.', 'warning');
    }
};

window.deleteSale = async (id) => {
    if (confirm(`Are you sure you want to delete sale ${id}?`)) {
        try {
            const sale = state.sales.find(s => s.id === id);
            if (sale && sale.items) {
                // Restore stock in PouchDB
                for (const item of sale.items) {
                    const product = state.inventory.find(p => p.sku === item.code);
                    if (product) {
                        product.stock += item.qty;
                        const latestDoc = await db.inventory.get(product._id);
                        await db.inventory.put({ ...latestDoc, stock: product.stock });
                    }
                }
            }

            // Delete from PouchDB
            const doc = await db.sales.get(id);
            await db.sales.remove(doc);

            state.sales = state.sales.filter(s => s.id !== id);
            await saveAppState();
            applyModuleFilters('sales');
            updateDashboardStats();
            showToast('Sale deleted');
        } catch (err) {
            console.error('Error deleting sale:', err);
            showToast('Failed to delete sale', 'error');
        }
    }
};

window.deletePurchase = (id) => {
    if (confirm(`Are you sure you want to delete purchase ${id}?`)) {
        state.purchases = state.purchases.filter(p => p.id !== id);
        saveAppState();
        applyModuleFilters('pur');
        updateDashboardStats();
        showToast('Purchase deleted');
    }
};

async function generateInvoicePDF(no, date, party, items, subtotal, tax, grandTotal, gstType = 'Local', type = 'Sales', paymentMode = '') {
    const isPurchase = type === 'Purchases';
    
    // Dynamically refresh party info to ensure it's not stale
    let currentParty = party;
    if (isPurchase) {
        const freshSupplier = state.suppliers.find(s => s.name === party.name || (party.id && s.id == party.id));
        if (freshSupplier) currentParty = freshSupplier;
    } else {
        const freshCustomer = state.customers.find(c => c.name === party.name || (party.id && c.id == party.id));
        if (freshCustomer) currentParty = freshCustomer;
    }
    party = currentParty; // Use the fresh data for the rest of the function

    const amountVal = parseFloat(grandTotal);
    const comp = state.company;
    
    // Header Title
    document.querySelector('.gst-invoice-title').textContent = isPurchase ? 'Purchase Bill' : 'Tax Invoice';
    document.getElementById('gst-sig-label').textContent = isPurchase ? `For : ${party.name}` : `For : ${comp.legalName}`;

    // Company Header
    if (comp.logoUrl) {
        document.getElementById('gst-company-logo-img').src = comp.logoUrl;
        document.getElementById('gst-company-logo-img').style.display = 'block';
    } else {
        document.getElementById('gst-company-logo-img').style.display = 'none';
    }
    document.getElementById('gst-company-name').textContent = comp.name || '';
    document.getElementById('gst-company-legal-name').textContent = comp.legalName || '';
    document.getElementById('gst-company-address').textContent = comp.address || '';
    document.getElementById('gst-company-contact').textContent = `Phone no.: ${comp.phone || ''} Email: ${comp.email || ''}`;
    document.getElementById('gst-company-gstin').textContent = comp.gstin || '';
    document.getElementById('gst-company-state').textContent = comp.state || '';

    // Meta
    document.getElementById('gst-inv-no').textContent = no;
    document.getElementById('gst-inv-date').textContent = date;
    
    // Place of Supply
    const supplyState = party.state || (isPurchase ? comp.state : (party.address.split(',').pop() || comp.state));
    document.getElementById('gst-inv-supply').textContent = supplyState;
    
    // Billing & Shipping logic reversed for Purchase
    if (isPurchase) {        document.getElementById('gst-bill-name').textContent = party.name;
        document.getElementById('gst-bill-address').innerHTML = party.address.replace(/\n/g, '<br>');
        document.getElementById('gst-bill-gstin').textContent = party.gstin || 'N/A';
        document.getElementById('gst-bill-state').textContent = party.state || 'N/A';

        document.getElementById('gst-ship-name').textContent = comp.legalName;
        document.getElementById('gst-ship-address').innerHTML = comp.address.replace(/\n/g, '<br>');
        
        // Hide bank details for purchase bill (since it's their bank, not ours)
        document.querySelector('.gst-bank-details').style.visibility = 'hidden';
    } else {
        // We are selling TO the customer
        document.getElementById('gst-bill-name').textContent = party.name;
        document.getElementById('gst-bill-address').innerHTML = party.address.replace(/\n/g, '<br>');
        document.getElementById('gst-bill-gstin').textContent = party.gstin || 'N/A';
        document.getElementById('gst-bill-state').textContent = party.state || 'N/A';

        document.getElementById('gst-ship-name').textContent = party.name;
        document.getElementById('gst-ship-address').innerHTML = party.address.replace(/\n/g, '<br>');
        
        document.querySelector('.gst-bank-details').style.visibility = 'visible';
    }
    
    // Items Table Header
    const tableHeader = document.querySelector('.gst-items-table thead tr');
    if (gstType === 'Local') {
        tableHeader.innerHTML = `
            <th width="5%">#</th>
            <th width="35%">Description of Goods</th>
            <th width="10%">HSN/SAC</th>
            <th width="8%">Qty</th>
            <th width="12%">Rate</th>
            <th width="10%">CGST %</th>
            <th width="10%">SGST %</th>
            <th width="10%">Amount</th>
        `;
    } else {
        tableHeader.innerHTML = `
            <th width="5%">#</th>
            <th width="45%">Description of Goods</th>
            <th width="10%">HSN/SAC</th>
            <th width="10%">Qty</th>
            <th width="10%">Rate</th>
            <th width="10%">IGST %</th>
            <th width="10%">Amount</th>
        `;
    }

    // Items
    document.getElementById('gst-items-list').innerHTML = items.map((item, index) => {
        if (gstType === 'Local') {
            const halfTax = (item.tax / 2).toFixed(2);
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.hsn}</td>
                    <td>${item.qty}</td>
                    <td>₹ ${parseFloat(item.price).toLocaleString()}</td>
                    <td>${halfTax}%</td>
                    <td>${halfTax}%</td>
                    <td>₹ ${parseFloat(item.total).toLocaleString()}</td>
                </tr>
            `;
        } else {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.hsn}</td>
                    <td>${item.qty}</td>
                    <td>₹ ${parseFloat(item.price).toLocaleString()}</td>
                    <td>${item.tax}%</td>
                    <td>₹ ${parseFloat(item.total).toLocaleString()}</td>
                </tr>
            `;
        }
    }).join('');
    
    // Totals Section Logic
    const totalsContainer = document.querySelector('.gst-amounts-col');
    if (gstType === 'Local') {
        const halfTaxVal = (parseFloat(tax) / 2).toFixed(2);
        totalsContainer.innerHTML = `
            <div class="gst-amounts-label">Amounts</div>
            <div class="gst-amount-row"><span>Sub Total</span> <span id="gst-subtotal">₹ ${parseFloat(subtotal).toLocaleString()}</span></div>
            <div class="gst-amount-row"><span>CGST</span> <span>₹ ${parseFloat(halfTaxVal).toLocaleString()}</span></div>
            <div class="gst-amount-row"><span>SGST</span> <span>₹ ${parseFloat(halfTaxVal).toLocaleString()}</span></div>
            <div class="gst-total-row"><span>Total</span> <span id="gst-grand-total">₹ ${amountVal.toLocaleString()}</span></div>
        `;
    } else {
        totalsContainer.innerHTML = `
            <div class="gst-amounts-label">Amounts</div>
            <div class="gst-amount-row"><span>Sub Total</span> <span id="gst-subtotal">₹ ${parseFloat(subtotal).toLocaleString()}</span></div>
            <div class="gst-amount-row"><span>IGST</span> <span id="gst-igst-total">₹ ${parseFloat(tax).toLocaleString()}</span></div>
            <div class="gst-total-row"><span>Total</span> <span id="gst-grand-total">₹ ${amountVal.toLocaleString()}</span></div>
        `;
    }

    document.getElementById('gst-amount-words').textContent = amountToWords(amountVal);
    
    // Payment Mode logic
    const paymentContainer = document.getElementById('gst-payment-container');
    const paymentModeEl = document.getElementById('gst-payment-mode');
    if (paymentMode && paymentMode !== '') {
        paymentModeEl.textContent = paymentMode;
        paymentContainer.style.display = 'block';
    } else {
        paymentContainer.style.display = 'none';
    }
    
    // Footer
    document.getElementById('gst-bank-name').textContent = `Name : ${comp.bankName}`;
    document.getElementById('gst-bank-acc').textContent = `Account No. : ${comp.accountNo}`;
    document.getElementById('gst-bank-ifsc').textContent = `IFSC code : ${comp.ifscCode}`;
    document.getElementById('gst-bank-holder').textContent = `Account holder's name : ${comp.accountHolder}`;
    document.getElementById('gst-company-terms').textContent = comp.terms;
    document.getElementById('gst-sig-label').textContent = `For : ${comp.legalName}`;

    // Handle QR Code
    if (comp.qrUrl) {
        document.getElementById('gst-bank-qr-img').src = comp.qrUrl;
        document.getElementById('gst-bank-qr-img').style.display = 'inline-block';
        document.getElementById('gst-bank-qr-icon').style.display = 'none';
    } else {
        document.getElementById('gst-bank-qr-img').style.display = 'none';
        document.getElementById('gst-bank-qr-icon').style.display = 'inline-block';
    }

    // Handle Signature
    if (comp.sigUrl) {
        document.getElementById('gst-sig-img').src = comp.sigUrl;
        document.getElementById('gst-sig-img').style.display = 'inline-block';
        document.getElementById('gst-sig-mock').style.display = 'none';
    } else {
        document.getElementById('gst-sig-img').style.display = 'none';
        document.getElementById('gst-sig-mock').style.display = 'block';
    }

    const element = document.querySelector('.gst-invoice-container');
    const template = document.getElementById('invoice-template');
    template.classList.remove('hidden');
    try {
        await html2pdf().set({ 
            margin: 0, 
            filename: `Invoice_${no}.pdf`, 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2 }, 
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
        }).from(element).save();
    } finally {
        template.classList.add('hidden');
    }
}

// Purchase Module Implementation
function getNextPurchaseNumber() {
    if (state.purchases.length === 0) return "PUR-001";
    const nos = state.purchases.map(p => {
        const match = p.id.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    });
    const maxNo = Math.max(...nos);
    return `PUR-${(maxNo + 1).toString().padStart(3, '0')}`;
}

window.openNewPurchaseModal = () => {
    const supplierOptions = state.suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const content = `
        <form id="new-purchase-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Purchase Order #</label>
                    <input type="text" id="pur-order-no" placeholder="Auto-generated" value="${getNextPurchaseNumber()}">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="pur-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Supplier</label>
                    <select id="pur-supplier" onchange="handlePurchaseSupplierChange()" required>
                        <option value="">Select Supplier</option>
                        ${supplierOptions}
                    </select>
                    <div id="pur-sup-info" style="font-size: 0.8em; color: var(--text-light); margin-top: 4px;"></div>
                </div>
                <div class="form-group">
                    <label>GST Type</label>
                    <select id="pur-gst-type" onchange="calculatePurchaseTotals()" required>
                        <option value="Local">Local (CGST + SGST)</option>
                        <option value="Non-Local">Non-Local (IGST)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Mode</label>
                    <select id="pur-payment-mode">
                        <option value="">(None)</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Paid Amount (₹)</label>
                    <input type="number" id="pur-paid-amount" step="0.01" value="0.00" oninput="calculatePurchaseTotals()">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="pur-status">
                        <option value="Paid">Paid</option>
                        <option value="Pending" selected>Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Pending Amount (₹)</label>
                    <input type="text" id="pur-pending-display" value="0.00" readonly>
                </div>
            </div>
            <div class="modal-table-wrapper">
                <table class="sale-items-table pur-items-table">
                    <thead>
                        <tr>
                            <th width="300">Product</th>
                            <th width="120">HSN/SAC</th>
                            <th width="100">Qty</th>
                            <th width="130">Cost Price</th>
                            <th width="110">Tax %</th>
                            <th width="140">Total</th>
                            <th width="50"></th>
                        </tr>
                    </thead>
                    <tbody id="pur-items-list"></tbody>
                </table>
            </div>
            <button type="button" class="btn-primary" style="width: auto; margin-bottom: 1rem;" onclick="addPurchaseItemRow()">
                <i class="fas fa-plus"></i> Add Item
            </button>
            <div class="totals-section">
                <div class="total-row"><span>Sub Total:</span> <span id="pur-subtotal">₹ 0.00</span></div>
                <div class="total-row"><span>Tax Total:</span> <span id="pur-tax-total">₹ 0.00</span></div>
                <div class="grand-total"><span>Grand Total:</span> <span id="pur-grand-total">₹ 0.00</span></div>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label>Purchase Bill/Receipt Attachment (Optional)</label>
                <input type="file" id="pur-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" class="btn-primary" style="width: auto; background-color: var(--secondary-color);" onclick="this.form.dataset.action='save'">Save Only</button>
                    <button type="submit" class="btn-primary" style="width: auto;" onclick="this.form.dataset.action='generate'">Save & Print</button>
                </div>
            </div>
        </form>
    `;
    openModal('Create New Purchase', content);
    document.getElementById('new-purchase-form').addEventListener('submit', handlePurchaseSubmit);
    addPurchaseItemRow();
};

window.openEditPurchaseModal = (id) => {
    const pur = state.purchases.find(p => p.id === id);
    if (!pur) return;

    const supplierOptions = state.suppliers.map(s => `
        <option value="${s.id}" ${pur.supplierObj && pur.supplierObj.id == s.id ? 'selected' : ''}>${s.name}</option>
    `).join('');

    const content = `
        <form id="edit-purchase-form">
            <input type="hidden" id="edit-purchase-id" value="${pur.id}">
            <div class="form-row">
                <div class="form-group">
                    <label>Purchase Order #</label>
                    <input type="text" id="pur-order-no" value="${pur.id}" readonly>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="pur-date" value="${pur.date}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Supplier</label>
                    <select id="pur-supplier" onchange="handlePurchaseSupplierChange()" required>
                        <option value="">Select Supplier</option>
                        ${supplierOptions}
                    </select>
                    <div id="pur-sup-info" style="font-size: 0.8em; color: var(--text-light); margin-top: 4px;"></div>
                </div>
                <div class="form-group">
                    <label>GST Type</label>
                    <select id="pur-gst-type" onchange="calculatePurchaseTotals()" required>
                        <option value="Local" ${pur.gstType === 'Local' ? 'selected' : ''}>Local (CGST + SGST)</option>
                        <option value="Non-Local" ${pur.gstType === 'Non-Local' ? 'selected' : ''}>Non-Local (IGST)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Payment Mode</label>
                    <select id="pur-payment-mode">
                        <option value="" ${!pur.paymentMode ? 'selected' : ''}>(None)</option>
                        <option value="Cash" ${pur.paymentMode === 'Cash' ? 'selected' : ''}>Cash</option>
                        <option value="Cheque" ${pur.paymentMode === 'Cheque' ? 'selected' : ''}>Cheque</option>
                        <option value="Bank Transfer" ${pur.paymentMode === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                        <option value="UPI" ${pur.paymentMode === 'UPI' ? 'selected' : ''}>UPI</option>
                        <option value="Credit Card" ${pur.paymentMode === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Paid Amount (₹)</label>
                    <input type="number" id="pur-paid-amount" step="0.01" value="${pur.paidAmount || 0}" oninput="calculatePurchaseTotals()">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="pur-status">
                        <option value="Paid" ${pur.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Pending" ${pur.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Overdue" ${pur.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Pending Amount (₹)</label>
                    <input type="text" id="pur-pending-display" value="${pur.pendingAmount || 0}" readonly>
                </div>
            </div>
            <div class="modal-table-wrapper">
                <table class="sale-items-table pur-items-table">
                    <thead>
                        <tr>
                            <th width="300">Product</th>
                            <th width="120">HSN/SAC</th>
                            <th width="100">Qty</th>
                            <th width="130">Cost Price</th>
                            <th width="110">Tax %</th>
                            <th width="140">Total</th>
                            <th width="50"></th>
                        </tr>
                    </thead>
                    <tbody id="pur-items-list"></tbody>
                </table>
            </div>
            <button type="button" class="btn-primary" style="width: auto; margin-bottom: 1rem;" onclick="addPurchaseItemRow()">
                <i class="fas fa-plus"></i> Add Item
            </button>
            <div class="totals-section">
                <div class="total-row"><span>Sub Total:</span> <span id="pur-subtotal">₹ 0.00</span></div>
                <div class="total-row"><span>Tax Total:</span> <span id="pur-tax-total">₹ 0.00</span></div>
                <div class="grand-total"><span>Grand Total:</span> <span id="pur-grand-total">₹ 0.00</span></div>
            </div>
            <div class="form-group" style="margin-top: 1rem;">
                <label>Replace Bill/Receipt Attachment (Optional)</label>
                <input type="file" id="pur-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
                ${pur.attachment ? '<small style="color:var(--text-muted);display:block;margin-top:4px;">Currently attached. Uploading new will overwrite.</small>' : ''}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="submit" class="btn-primary" style="width: auto; background-color: var(--secondary-color);" onclick="this.form.dataset.action='save'">Update Only</button>
                    <button type="submit" class="btn-primary" style="width: auto;" onclick="this.form.dataset.action='generate'">Update & Print</button>
                </div>
            </div>
        </form>
    `;
    openModal(`Edit Purchase: ${pur.id}`, content);
    
    // Repopulate items
    const tbody = document.getElementById('pur-items-list');
    pur.items.forEach(item => {
        const rowId = Date.now() + Math.random();
        const productOptions = state.inventory.map(p => `
            <option value="${p.id}" ${p.sku === item.code ? 'selected' : ''}>${p.name}</option>
        `).join('');
        const tr = document.createElement('tr');
        tr.id = `pur-row-${rowId}`;
        tr.innerHTML = `
            <td width="300"><select class="pur-item-product" onchange="updatePurchaseRowDetails('${rowId}')" required><option value="">Select Product</option>${productOptions}</select></td>
            <td width="120"><input type="text" class="pur-item-hsn" value="${item.hsn || ''}" placeholder="HSN/SAC"></td>
            <td width="100"><input type="number" class="pur-item-qty" value="${item.qty}" min="1" oninput="calculatePurchaseTotals()" required></td>
            <td width="130"><input type="number" class="pur-item-cost" value="${item.price}" step="0.01" oninput="calculatePurchaseTotals()" required></td>
            <td class="pur-item-tax-cell" width="110"><input type="number" class="pur-item-tax" data-total-tax="${item.tax}" value="${item.tax}" readonly></td>
            <td width="140"><input type="text" class="pur-item-total" readonly value="${item.total}"></td>
            <td width="50"><button type="button" class="action-btn" onclick="removePurchaseRow('${rowId}')"><i class="fas fa-times"></i></button></td>
        `;
        tbody.appendChild(tr);
    });

    calculatePurchaseTotals();
    document.getElementById('edit-purchase-form').addEventListener('submit', handlePurchaseUpdate);
};

window.addPurchaseItemRow = () => {
    const tbody = document.getElementById('pur-items-list');
    const rowId = Date.now() + Math.random();
    const productOptions = state.inventory.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    const tr = document.createElement('tr');
    tr.id = `pur-row-${rowId}`;
    tr.innerHTML = `
        <td width="300"><select class="pur-item-product" onchange="updatePurchaseRowDetails('${rowId}')" required><option value="">Select Product</option>${productOptions}</select></td>
        <td width="120"><input type="text" class="pur-item-hsn" placeholder="HSN/SAC"></td>
        <td width="100"><input type="number" class="pur-item-qty" value="1" min="1" oninput="calculatePurchaseTotals()" required></td>
        <td width="130"><input type="number" class="pur-item-cost" step="0.01" oninput="calculatePurchaseTotals()" required></td>
        <td class="pur-item-tax-cell" width="110"><input type="number" class="pur-item-tax" data-total-tax="0" value="0" readonly></td>
        <td width="140"><input type="text" class="pur-item-total" readonly value="0.00"></td>
        <td width="50"><button type="button" class="action-btn" onclick="removePurchaseRow('${rowId}')"><i class="fas fa-times"></i></button></td>
    `;
    tbody.appendChild(tr);
    calculatePurchaseTotals();
};

window.removePurchaseRow = (id) => {
    const row = document.getElementById(`pur-row-${id}`);
    if (row) row.remove();
    calculatePurchaseTotals();
};

window.updatePurchaseRowDetails = (rowId) => {
    const row = document.getElementById(`pur-row-${rowId}`);
    const productId = row.querySelector('.pur-item-product').value;
    const product = state.inventory.find(p => p.id == productId);
    if (product) {
        // For purchase, price is often different, but we pre-fill.
        // Usually, product.price is selling price. Maybe product needs costPrice too?
        // For now, let's just pre-fill with something reasonable or leave empty.
        row.querySelector('.pur-item-hsn').value = product.hsn || '';
        const taxInput = row.querySelector('.pur-item-tax');
        taxInput.dataset.totalTax = product.taxRate;
        calculatePurchaseTotals();
    }
};

window.calculatePurchaseTotals = () => {
    const gstType = document.getElementById('pur-gst-type')?.value || 'Local';
    const headerRow = document.querySelector('.pur-items-table thead tr');
    
    if (headerRow) {
        // Remove existing SGST header if present
        const existingSgstHeader = headerRow.querySelector('.pur-sgst-header');
        if (existingSgstHeader) existingSgstHeader.remove();

        if (gstType === 'Local') {
            headerRow.innerHTML = `
                <th width="300">Product</th>
                <th width="120">HSN/SAC</th>
                <th width="100">Qty</th>
                <th width="130">Cost Price</th>
                <th width="110">CGST %</th>
                <th width="110" class="pur-sgst-header">SGST %</th>
                <th width="140">Total</th>
                <th width="50"></th>
            `;
        } else {
            headerRow.innerHTML = `
                <th width="300">Product</th>
                <th width="120">HSN/SAC</th>
                <th width="100">Qty</th>
                <th width="130">Cost Price</th>
                <th width="110">IGST %</th>
                <th width="140">Total</th>
                <th width="50"></th>
            `;
        }
    }

    const rows = document.querySelectorAll('#pur-items-list tr');
    let subtotal = 0, taxTotal = 0;
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.pur-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.pur-item-cost').value) || 0;
        const totalTaxRate = parseFloat(row.querySelector('.pur-item-tax').dataset.totalTax || 0);
        
        const lineSubtotal = qty * price;
        const lineTax = lineSubtotal * (totalTaxRate / 100);
        
        if (gstType === 'Local') {
            const halfTax = (totalTaxRate / 2).toFixed(2);
            row.querySelector('.pur-item-tax-cell').innerHTML = `
                <input type="number" class="pur-item-tax" data-total-tax="${totalTaxRate}" value="${halfTax}" readonly>
            `;
            if (!row.querySelector('.pur-item-tax-sgst')) {
                const td = document.createElement('td');
                td.className = 'pur-item-tax-sgst-cell';
                td.innerHTML = `<input type="number" class="pur-item-tax-sgst" value="${halfTax}" readonly>`;
                row.insertBefore(td, row.querySelector('.pur-item-total').parentElement);
            } else {
                row.querySelector('.pur-item-tax-sgst').value = halfTax;
            }
        } else {
            row.querySelector('.pur-item-tax-cell').innerHTML = `
                <input type="number" class="pur-item-tax" data-total-tax="${totalTaxRate}" value="${totalTaxRate}" readonly>
            `;
            const sgstCell = row.querySelector('.pur-item-tax-sgst-cell');
            if (sgstCell) sgstCell.remove();
        }

        row.querySelector('.pur-item-total').value = (lineSubtotal + lineTax).toFixed(2);
        subtotal += lineSubtotal;
        taxTotal += lineTax;
    });

    document.getElementById('pur-subtotal').textContent = `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const taxLabel = gstType === 'Local' ? 'CGST + SGST' : 'IGST';
    document.getElementById('pur-tax-total').parentElement.firstChild.textContent = `${taxLabel} Total:`;
    document.getElementById('pur-tax-total').textContent = `₹ ${taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    const grandTotal = subtotal + taxTotal;
    document.getElementById('pur-grand-total').textContent = `₹ ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    // Calculate Pending
    const paid = parseFloat(document.getElementById('pur-paid-amount')?.value) || 0;
    const pending = grandTotal - paid;
    const pendingDisp = document.getElementById('pur-pending-display');
    if (pendingDisp) pendingDisp.value = pending.toFixed(2);
};

async function handlePurchaseSubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    setBtnLoading(submitBtn, true, originalText);

    try {
        const supplierId = document.getElementById('pur-supplier').value;
        const supplier = state.suppliers.find(s => s.id == supplierId);
        const date = document.getElementById('pur-date').value;
        const gstType = document.getElementById('pur-gst-type').value;
        const paymentMode = document.getElementById('pur-payment-mode').value;
        const purchaseId = document.getElementById('pur-order-no').value || getNextPurchaseNumber();
        
        const items = [];
        for (const row of document.querySelectorAll('#pur-items-list tr')) {
            const productId = row.querySelector('.pur-item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.pur-item-qty').value);
            const totalTaxRate = parseFloat(row.querySelector('.pur-item-tax').dataset.totalTax || 0);

            items.push({ 
                name: product.name, 
                code: product.sku,
                hsn: (row.querySelector('.pur-item-hsn') || row.querySelector('.item-hsn')).value || (product ? product.hsn : '') || '84716050',
                qty, 
                price: row.querySelector('.pur-item-cost').value, 
                tax: totalTaxRate, 
                total: row.querySelector('.pur-item-total').value 
            });
            
            product.stock += qty;
            const latestDoc = await db.inventory.get(product._id);
            await db.inventory.put({ ...latestDoc, stock: product.stock });
        }
        
        const grandTotalRaw = document.getElementById('pur-grand-total').textContent.replace('₹', '').replace(/,/g, '').trim();
        const subtotalRaw = document.getElementById('pur-subtotal').textContent.replace('₹', '').replace(/,/g, '').trim();
        const taxRaw = document.getElementById('pur-tax-total').textContent.replace('₹', '').replace(/,/g, '').trim();

        let attachmentBase64 = null;
        const fileInput = document.getElementById('pur-attachment');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            attachmentBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const paidAmount = parseFloat(document.getElementById('pur-paid-amount').value) || 0;
        const status = document.getElementById('pur-status').value;
        const pendingAmount = parseFloat(grandTotalRaw) - paidAmount;

        const newPurchase = { 
            _id: purchaseId,
            id: purchaseId, 
            date, 
            supplier: supplier.name, 
            supplierObj: supplier,
            gstType,
            items, 
            subtotal: subtotalRaw,
            tax: taxRaw,
            total: parseFloat(grandTotalRaw),
            paidAmount,
            pendingAmount,
            paymentMode, 
            status,
            attachment: attachmentBase64
        };
        
        await db.purchases.put(newPurchase);
        state.purchases.push(newPurchase);
        
        await saveAppState();
        if (e.target.dataset.action === 'generate') {
            await generateInvoicePDF(purchaseId, date, supplier, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, 'Purchases', paymentMode);
            showToast('Purchase added and bill printed successfully');
        } else {
            showToast('Purchase added successfully');
        }
        closeModal();
        applyModuleFilters('pur');
    } catch (err) {
        console.error('Error adding purchase:', err);
        showToast('Failed to add purchase', 'error');
    } finally {
        setBtnLoading(submitBtn, false, originalText);
    }
}

async function handlePurchaseUpdate(e) {
    e.preventDefault();
    const purchaseId = document.getElementById('edit-purchase-id').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    setBtnLoading(submitBtn, true, originalText);

    try {
        const supplierId = document.getElementById('pur-supplier').value;
        const supplier = state.suppliers.find(s => s.id == supplierId);
        const date = document.getElementById('pur-date').value;
        const gstType = document.getElementById('pur-gst-type').value;
        const paymentMode = document.getElementById('pur-payment-mode').value;
        
        const items = [];
        for (const row of document.querySelectorAll('#pur-items-list tr')) {
            const productId = row.querySelector('.pur-item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.pur-item-qty').value);
            const totalTaxRate = parseFloat(row.querySelector('.pur-item-tax').dataset.totalTax || 0);

            items.push({ 
                name: product.name, 
                code: product.sku,
                hsn: (row.querySelector('.pur-item-hsn') || row.querySelector('.item-hsn')).value || (product ? product.hsn : '') || '84716050',
                qty, 
                price: row.querySelector('.pur-item-cost').value, 
                tax: totalTaxRate, 
                total: row.querySelector('.pur-item-total').value 
            });
        }
        
        const grandTotalRaw = document.getElementById('pur-grand-total').textContent.replace('₹', '').replace(/,/g, '').trim();
        const subtotalRaw = document.getElementById('pur-subtotal').textContent.replace('₹', '').replace(/,/g, '').trim();
        const taxRaw = document.getElementById('pur-tax-total').textContent.replace('₹', '').replace(/,/g, '').trim();
        
        const purIndex = state.purchases.findIndex(p => p.id === purchaseId);
        if (purIndex !== -1) {
            const oldPur = state.purchases[purIndex];
            for (const oldItem of oldPur.items) {
                const product = state.inventory.find(p => p.sku === oldItem.code);
                if (product) {
                    product.stock -= oldItem.qty;
                    const latestDoc = await db.inventory.get(product._id);
                    await db.inventory.put({ ...latestDoc, stock: product.stock });
                }
            }
            for (const newItem of items) {
                const product = state.inventory.find(p => p.sku === newItem.code);
                if (product) {
                    product.stock += newItem.qty;
                    const latestDoc = await db.inventory.get(product._id);
                    await db.inventory.put({ ...latestDoc, stock: product.stock });
                }
            }

            const paidAmount = parseFloat(document.getElementById('pur-paid-amount').value) || 0;
            const status = document.getElementById('pur-status').value;
            const pendingAmount = parseFloat(grandTotalRaw) - paidAmount;

            let attachmentBase64 = oldPur.attachment; // Corrected: use oldPur instead of pur
            const fileInput = document.getElementById('pur-attachment');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                attachmentBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            const updatedPur = { 
                ...state.purchases[purIndex],
                date, 
                supplier: supplier.name, 
                supplierObj: supplier,
                gstType,
                items, 
                subtotal: subtotalRaw, 
                tax: taxRaw, 
                total: parseFloat(grandTotalRaw),
                paidAmount,
                pendingAmount,
                paymentMode,
                status,
                attachment: attachmentBase64
            };
            
            const latestDoc = await db.purchases.get(purchaseId);
            await db.purchases.put({ ...latestDoc, ...updatedPur });
            state.purchases[purIndex] = updatedPur;
            
            await saveAppState();
            if (e.target.dataset.action === 'generate') {
                await generateInvoicePDF(purchaseId, date, supplier, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, 'Purchases', paymentMode);
                showToast(`Purchase ${purchaseId} updated and bill printed.`);
            } else {
                showToast(`Purchase ${purchaseId} updated.`);
            }
            closeModal();
            applyModuleFilters('pur');
        }
    } catch (err) {
        showToast(`Error updating purchase: ${err.message}`, 'error');
    } finally {
        setBtnLoading(submitBtn, false, originalText);
    }
}



window.viewPurchase = async (id) => {
    const pur = state.purchases.find(p => p.id === id);
    if (!pur) return;
    
    if (pur.supplierObj && pur.items) {
        await generateInvoicePDF(pur.id, pur.date, pur.supplierObj, pur.items, pur.subtotal, pur.tax, pur.total, pur.gstType || 'Local', 'Purchases', pur.paymentMode || '');
        showToast('Bill re-generated');
    } else {
        showToast('Bill detail not available.', 'warning');
    }
};

window.deletePurchase = async (id) => {
    if (confirm(`Are you sure you want to delete purchase ${id}?`)) {
        try {
            const pur = state.purchases.find(p => p.id === id);
            if (pur && pur.items) {
                for (const item of pur.items) {
                    const product = state.inventory.find(p => p.sku === item.code);
                    if (product) {
                        product.stock -= item.qty;
                        const latestDoc = await db.inventory.get(product._id);
                        await db.inventory.put({ ...latestDoc, stock: product.stock });
                    }
                }
            }

            const doc = await db.purchases.get(id);
            await db.purchases.remove(doc);

            state.purchases = state.purchases.filter(p => p.id !== id);
            await saveAppState();
            applyModuleFilters('pur');
            updateDashboardStats();
            showToast('Purchase deleted');
        } catch (err) {
            console.error('Error deleting purchase:', err);
            showToast('Failed to delete purchase', 'error');
        }
    }
}

// Inventory CRUD
window.openAddItemModal = () => {
    const content = `
        <form id="item-form">
            <div class="form-group"><label>Product Name</label><input type="text" id="item-name" required></div>
            <div class="form-group"><label>SKU</label><input type="text" id="item-sku" required></div>
            <div class="form-row">
                <div class="form-group"><label>Category</label><input type="text" id="item-category" required></div>
                <div class="form-group"><label>Tax Rate %</label><input type="number" id="item-tax" value="0" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Selling Price</label><input type="number" id="item-price" step="0.01" required></div>
                <div class="form-group"><label>Min Stock Level</label><input type="number" id="item-min" value="10" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>HSN/SAC Code</label><input type="text" id="item-hsn" placeholder="e.g. 84716050"></div>
                <div class="form-group"><label>Opening Total Stock</label><input type="number" id="item-stock" value="0" required></div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Save Product</button>
            </div>
        </form>
    `;
    openModal('Add New Product', content);
        document.getElementById('item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = Date.now().toString();
            const newItem = {
                _id: id,
                id: id,
                name: document.getElementById('item-name').value,
                sku: document.getElementById('item-sku').value,
                category: document.getElementById('item-category').value,
                taxRate: parseFloat(document.getElementById('item-tax').value),
                price: parseFloat(document.getElementById('item-price').value),
                minStock: parseInt(document.getElementById('item-min').value),
                hsn: document.getElementById('item-hsn').value,
                stock: parseInt(document.getElementById('item-stock').value || 0)
            };

            try {
                await db.inventory.put(newItem);
                state.inventory.push(newItem);
                await saveAppState();
                closeModal();
                renderInventory();
                updateDashboardStats();
                showToast('Product added to inventory');
            } catch (err) {
                console.error('Error adding product:', err);
                showToast('Failed to add product', 'error');
            }
        });
};

window.openEditItemModal = (id) => {
    const item = state.inventory.find(p => p.id == id);
    if (!item) return;

    const content = `
        <form id="edit-item-form">
            <div class="form-group"><label>Product Name</label><input type="text" id="edit-item-name" value="${item.name}" required></div>
            <div class="form-group"><label>SKU</label><input type="text" id="edit-item-sku" value="${item.sku}" required></div>
            <div class="form-row">
                <div class="form-group"><label>Category</label><input type="text" id="edit-item-category" value="${item.category}" required></div>
                <div class="form-group"><label>Tax Rate %</label><input type="number" id="edit-item-tax" value="${item.taxRate}" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Selling Price</label><input type="number" id="edit-item-price" step="0.01" value="${item.price}" required></div>
                <div class="form-group"><label>Min Stock Level</label><input type="number" id="edit-item-min" value="${item.minStock}" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>HSN/SAC Code</label><input type="text" id="edit-item-hsn" value="${item.hsn || ''}" placeholder="e.g. 84716050"></div>
                <div class="form-group"><label>Current Total Stock</label><input type="number" id="edit-item-stock" value="${item.stock}" required></div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Update Product</button>
            </div>
        </form>
    `;
    openModal('Edit Product', content);
    
    document.getElementById('edit-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedItem = {
            ...item,
            name: document.getElementById('edit-item-name').value,
            sku: document.getElementById('edit-item-sku').value,
            category: document.getElementById('edit-item-category').value,
            taxRate: parseFloat(document.getElementById('edit-item-tax').value),
            price: parseFloat(document.getElementById('edit-item-price').value),
            minStock: parseInt(document.getElementById('edit-item-min').value),
            hsn: document.getElementById('edit-item-hsn').value,
            stock: parseInt(document.getElementById('edit-item-stock').value || 0)
        };

        try {
            const doc = await db.inventory.get(item._id);
            await db.inventory.put({ ...doc, ...updatedItem });
            
            const index = state.inventory.findIndex(p => p.id == id);
            state.inventory[index] = updatedItem;
            
            await saveAppState();
            closeModal();
            renderInventory();
            updateDashboardStats();
            showToast('Product updated');
        } catch (err) {
            console.error('Error updating item:', err);
            showToast('Failed to update product', 'error');
        }
    });
};

window.deleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const doc = await db.inventory.get(id.toString());
            await db.inventory.remove(doc);

            state.inventory = state.inventory.filter(p => p.id != id);
            await saveAppState();
            renderInventory();
            updateDashboardStats();
            showToast('Product deleted');
        } catch (err) {
            console.error('Error deleting item:', err);
            showToast('Failed to delete product', 'error');
        }
    }
};

// Customer CRUD
window.openAddCustomerModal = () => {
    const content = `
        <form id="customer-form">
            <div class="form-group"><label>Full Name</label><input type="text" id="cust-name" required></div>
            <div class="form-row">
                <div class="form-group"><label>GSTIN (Optional)</label><input type="text" id="cust-gstin" placeholder="e.g. 27AABC...01M"></div>
                <div class="form-group"><label>State (Optional)</label><input type="text" id="cust-state" placeholder="e.g. Maharashtra"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Email (Optional)</label><input type="email" id="cust-email"></div>
                <div class="form-group"><label>Phone (Optional)</label><input type="text" id="cust-phone"></div>
            </div>
            <div class="form-group"><label>Address</label><textarea id="cust-address" required></textarea></div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Save Customer</button>
            </div>
        </form>
    `;
    openModal('Add New Customer', content);
    document.getElementById('customer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = Date.now().toString();
        const newCustomer = {
            _id: id,
            id: id,
            name: document.getElementById('cust-name').value,
            gstin: document.getElementById('cust-gstin').value,
            state: document.getElementById('cust-state').value,
            email: document.getElementById('cust-email').value,
            phone: document.getElementById('cust-phone').value,
            address: document.getElementById('cust-address').value
        };

        try {
            await db.customers.put(newCustomer);
            state.customers.push(newCustomer);
            await saveAppState();
            closeModal();
            renderCustomers();
            showToast('Customer added');
        } catch (err) {
            console.error('Error adding customer:', err);
            showToast('Failed to add customer', 'error');
        }
    });
};

window.openEditCustomerModal = (id) => {
    const customer = state.customers.find(c => c.id == id);
    if (!customer) return;

    const content = `
        <form id="edit-customer-form">
            <div class="form-group"><label>Full Name</label><input type="text" id="edit-cust-name" value="${customer.name}" required></div>
            <div class="form-row">
                <div class="form-group"><label>GSTIN (Optional)</label><input type="text" id="edit-cust-gstin" value="${customer.gstin || ''}"></div>
                <div class="form-group"><label>State (Optional)</label><input type="text" id="edit-cust-state" value="${customer.state || ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Email (Optional)</label><input type="email" id="edit-cust-email" value="${customer.email || ''}"></div>
                <div class="form-group"><label>Phone (Optional)</label><input type="text" id="edit-cust-phone" value="${customer.phone || ''}"></div>
            </div>
            <div class="form-group"><label>Address</label><textarea id="edit-cust-address" required>${customer.address}</textarea></div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Update Customer</button>
            </div>
        </form>
    `;
    openModal('Edit Customer', content);
    
    document.getElementById('edit-customer-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedCustomer = {
            ...customer,
            name: document.getElementById('edit-cust-name').value,
            gstin: document.getElementById('edit-cust-gstin').value,
            state: document.getElementById('edit-cust-state').value,
            email: document.getElementById('edit-cust-email').value,
            phone: document.getElementById('edit-cust-phone').value,
            address: document.getElementById('edit-cust-address').value
        };

        try {
            const doc = await db.customers.get(customer._id);
            await db.customers.put({ ...doc, ...updatedCustomer });
            
            const index = state.customers.findIndex(c => c.id == id);
            state.customers[index] = updatedCustomer;
            
            await saveAppState();
            closeModal();
            renderCustomers();
            showToast('Customer updated');
        } catch (err) {
            console.error('Error updating customer:', err);
            showToast('Failed to update customer', 'error');
        }
    });
};

window.deleteCustomer = async (id) => {
    if (confirm('Delete this customer?')) {
        try {
            const doc = await db.customers.get(id.toString());
            await db.customers.remove(doc);

            state.customers = state.customers.filter(c => c.id != id);
            await saveAppState();
            renderCustomers();
            showToast('Customer removed');
        } catch (err) {
            console.error('Error deleting customer:', err);
            showToast('Failed to remove customer', 'error');
        }
    }
};

// Supplier CRUD
window.openAddSupplierModal = () => {
    const content = `
        <form id="supplier-form">
            <div class="form-group"><label>Supplier Name</label><input type="text" id="sup-name" required></div>
            <div class="form-row">
                <div class="form-group"><label>GSTIN (Optional)</label><input type="text" id="sup-gstin" placeholder="e.g. 27AABC...01M"></div>
                <div class="form-group"><label>State (Optional)</label><input type="text" id="sup-state" placeholder="e.g. Maharashtra"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Email (Optional)</label><input type="email" id="sup-email"></div>
                <div class="form-group"><label>Phone (Optional)</label><input type="text" id="sup-phone"></div>
            </div>
            <div class="form-group"><label>Address</label><textarea id="sup-address" required></textarea></div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Save Supplier</button>
            </div>
        </form>
    `;
    openModal('Add New Supplier', content);
    document.getElementById('supplier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = Date.now().toString();
        const newSupplier = {
            _id: id,
            id: id,
            name: document.getElementById('sup-name').value,
            gstin: document.getElementById('sup-gstin').value,
            state: document.getElementById('sup-state').value,
            email: document.getElementById('sup-email').value,
            phone: document.getElementById('sup-phone').value,
            address: document.getElementById('sup-address').value
        };

        try {
            await db.suppliers.put(newSupplier);
            state.suppliers.push(newSupplier);
            await saveAppState();
            closeModal();
            renderSuppliers();
            showToast('Supplier added');
        } catch (err) {
            console.error('Error adding supplier:', err);
            showToast('Failed to add supplier', 'error');
        }
    });
};

window.openEditSupplierModal = (id) => {
    const supplier = state.suppliers.find(s => s.id == id);
    if (!supplier) return;

    const content = `
        <form id="edit-supplier-form">
            <div class="form-group"><label>Supplier Name</label><input type="text" id="edit-sup-name" value="${supplier.name}" required></div>
            <div class="form-row">
                <div class="form-group"><label>GSTIN (Optional)</label><input type="text" id="edit-sup-gstin" value="${supplier.gstin || ''}"></div>
                <div class="form-group"><label>State (Optional)</label><input type="text" id="edit-sup-state" value="${supplier.state || ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Email (Optional)</label><input type="email" id="edit-sup-email" value="${supplier.email || ''}"></div>
                <div class="form-group"><label>Phone (Optional)</label><input type="text" id="edit-sup-phone" value="${supplier.phone || ''}"></div>
            </div>
            <div class="form-group"><label>Address</label><textarea id="edit-sup-address" required>${supplier.address}</textarea></div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Update Supplier</button>
            </div>
        </form>
    `;
    openModal('Edit Supplier', content);
    
    document.getElementById('edit-supplier-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedSupplier = {
            ...supplier,
            name: document.getElementById('edit-sup-name').value,
            gstin: document.getElementById('edit-sup-gstin').value,
            state: document.getElementById('edit-sup-state').value,
            email: document.getElementById('edit-sup-email').value,
            phone: document.getElementById('edit-sup-phone').value,
            address: document.getElementById('edit-sup-address').value
        };

        try {
            const doc = await db.suppliers.get(supplier._id);
            await db.suppliers.put({ ...doc, ...updatedSupplier });
            
            const index = state.suppliers.findIndex(s => s.id == id);
            state.suppliers[index] = updatedSupplier;
            
            await saveAppState();
            closeModal();
            renderSuppliers();
            showToast('Supplier updated');
        } catch (err) {
            console.error('Error updating supplier:', err);
            showToast('Failed to update supplier', 'error');
        }
    });
};

window.deleteSupplier = async (id) => {
    if (confirm('Delete this supplier?')) {
        try {
            const doc = await db.suppliers.get(id.toString());
            await db.suppliers.remove(doc);

            state.suppliers = state.suppliers.filter(s => s.id != id);
            await saveAppState();
            renderSuppliers();
            showToast('Supplier removed');
        } catch (err) {
            console.error('Error deleting supplier:', err);
            showToast('Failed to remove supplier', 'error');
        }
    }
};



// Expense CRUD
window.openAddExpenseModal = () => {
    const categoryOptions = state.expenseCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    const content = `
        <form id="expense-form">
            <div class="form-group">
                <label>Category</label>
                <div style="display: flex; gap: 0.5rem;">
                    <select id="exp-cat" style="flex: 1;">
                        ${categoryOptions}
                    </select>
                    <button type="button" class="btn-secondary" style="width: 40px;" onclick="openAddCategoryModal()" title="Add Category"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <div class="form-group"><label>Description</label><input type="text" id="exp-desc" required></div>
            <div class="form-row">
                <div class="form-group"><label>Amount</label><input type="number" id="exp-amount" step="0.01" required></div>
                <div class="form-group"><label>Date</label><input type="date" id="exp-date" value="${new Date().toISOString().split('T')[0]}" required></div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Save Expense</button>
            </div>
        </form>
    `;
    openModal('Add New Expense', content);
    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = Date.now().toString();
        const newExpense = {
            _id: id,
            id: id,
            category: document.getElementById('exp-cat').value,
            description: document.getElementById('exp-desc').value,
            amount: parseFloat(document.getElementById('exp-amount').value),
            date: document.getElementById('exp-date').value
        };

        try {
            await db.expenses.put(newExpense);
            state.expenses.unshift(newExpense);
            await saveAppState();
            closeModal();
            applyModuleFilters('exp');
            updateDashboardStats();
            showToast('Expense recorded');
        } catch (err) {
            console.error('Error adding expense:', err);
            showToast('Failed to record expense', 'error');
        }
    });
};

window.openEditExpenseModal = (id) => {
    const expense = state.expenses.find(e => e.id == id);
    if (!expense) return;

    const categoryOptions = state.expenseCategories.map(cat => `<option value="${cat}" ${cat === expense.category ? 'selected' : ''}>${cat}</option>`).join('');
    const content = `
        <form id="edit-expense-form">
            <input type="hidden" id="edit-exp-id" value="${expense.id}">
            <div class="form-group">
                <label>Category</label>
                <div style="display: flex; gap: 0.5rem;">
                    <select id="edit-exp-cat" style="flex: 1;">
                        ${categoryOptions}
                    </select>
                    <button type="button" class="btn-secondary" style="width: 40px;" onclick="openAddCategoryModal()" title="Add Category"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <div class="form-group"><label>Description</label><input type="text" id="edit-exp-desc" value="${expense.description}" required></div>
            <div class="form-row">
                <div class="form-group"><label>Amount</label><input type="number" id="edit-exp-amount" step="0.01" value="${expense.amount}" required></div>
                <div class="form-group"><label>Date</label><input type="date" id="edit-exp-date" value="${expense.date}" required></div>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Update Expense</button>
            </div>
        </form>
    `;
    openModal('Edit Expense', content);
    document.getElementById('edit-expense-form').addEventListener('submit', handleExpenseUpdate);
};

async function handleExpenseUpdate(e) {
    e.preventDefault();
    const id = document.getElementById('edit-exp-id').value;
    const updatedExpense = {
        category: document.getElementById('edit-exp-cat').value,
        description: document.getElementById('edit-exp-desc').value,
        amount: parseFloat(document.getElementById('edit-exp-amount').value),
        date: document.getElementById('edit-exp-date').value
    };

    try {
        const doc = await db.expenses.get(id);
        const finalExpense = { ...doc, ...updatedExpense };
        await db.expenses.put(finalExpense);
        
        const index = state.expenses.findIndex(exp => exp.id == id);
        state.expenses[index] = { ...state.expenses[index], ...updatedExpense };
        
        await saveAppState();
        closeModal();
        applyModuleFilters('exp');
        updateDashboardStats();
        showToast('Expense updated');
    } catch (err) {
        console.error('Error updating expense:', err);
        showToast('Failed to update expense', 'error');
    }
}

window.deleteExpense = async (id) => {
    if (confirm('Delete this expense?')) {
        try {
            const doc = await db.expenses.get(id.toString());
            await db.expenses.remove(doc);

            state.expenses = state.expenses.filter(e => e.id != id);
            await saveAppState();
            applyModuleFilters('exp');
            updateDashboardStats();
            showToast('Expense deleted');
        } catch (err) {
            console.error('Error deleting expense:', err);
            showToast('Failed to delete expense', 'error');
        }
    }
};

// ─── Users Tab Switching ────────────────────────────────────────
window.switchUsersTab = (tabId, btn) => {
    // Hide all panels
    document.querySelectorAll('.users-tab-panel').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.users-tab-btn').forEach(b => b.classList.remove('active'));
    // Show selected
    document.getElementById(tabId).classList.remove('hidden');
    btn.classList.add('active');
    // Render content of the activated tab
    if (tabId === 'users-tab-roles') renderRoleSettings();
};

// Human-friendly module labels
const MODULE_LABELS = {
    dashboard:           { icon: 'fas fa-chart-line',         label: 'Dashboard' },
    'sales': { icon: 'fas fa-shopping-cart', label: 'Sales' },
    'purchases': { icon: 'fas fa-truck', label: 'Purchases' },
    'inventory': { icon: 'fas fa-boxes', label: 'Inventory' },
    customers:           { icon: 'fas fa-users',              label: 'Customers' },
    suppliers:           { icon: 'fas fa-truck-field',        label: 'Suppliers' },
    expenses:            { icon: 'fas fa-receipt',            label: 'Expenses' },
    reports:             { icon: 'fas fa-chart-bar',          label: 'Reports' },
    profile:             { icon: 'fas fa-building',           label: 'Company Profile' },
    users:               { icon: 'fas fa-user-shield',        label: 'User Management' },
};

function renderRoleSettings() {
    const container = document.getElementById('role-settings-container');
    if (!container) return;

    const roles = ['Manager', 'Staff']; // Admin is always full-access — not configurable
    const modules = Object.keys(state.rolePermissions);

    container.innerHTML = `
        <!-- Admin Role Card -->
        <div class="role-card admin-role-card" style="margin-bottom:1.5rem;">
            <div class="role-card-header">
                <div class="role-card-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                    <i class="fas fa-crown"></i>
                </div>
                <div>
                    <h3 class="role-card-title">Admin</h3>
                    <p class="role-card-subtitle">Super user with full access to all modules and features. Cannot be restricted.</p>
                </div>
                <span class="status-badge status-paid" style="margin-left:auto;">Full Access</span>
            </div>
        </div>

        <!-- Permission Matrix -->
        <div class="role-matrix-wrapper">
            <div class="role-matrix-card">
                <div class="role-matrix-header">
                    <h3><i class="fas fa-th"></i> Module Access Matrix</h3>
                    <p>Toggle which modules each role can see and navigate to.</p>
                </div>
                <div class="role-matrix-table-wrap">
                    <table class="role-matrix-table">
                        <thead>
                            <tr>
                                <th class="module-col">Module</th>
                                <th class="role-col admin-col"><i class="fas fa-crown"></i> Admin</th>
                                ${roles.map(r => `<th class="role-col"><i class="fas fa-user"></i> ${r}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${modules.map(mod => {
                                const info = MODULE_LABELS[mod] || { icon: 'fas fa-circle', label: mod };
                                return `<tr>
                                    <td class="module-col">
                                        <div class="module-name-cell">
                                            <i class="${info.icon}" style="color:var(--primary);width:18px;"></i>
                                            <span>${info.label}</span>
                                        </div>
                                    </td>
                                    <td class="role-col admin-col">
                                        <div class="toggle-switch active-toggle" title="Admin always has full access">
                                            <div class="toggle-knob"></div>
                                        </div>
                                    </td>
                                    ${roles.map(role => {
                                        const isEnabled = state.rolePermissions[mod]?.[role] ?? false;
                                        const isLocked = mod === 'users'; // Users module always locked to Admin
                                        return `<td class="role-col">
                                            <label class="toggle-switch ${isEnabled ? 'active-toggle' : ''} ${isLocked ? 'locked-toggle' : ''}" 
                                                   title="${isLocked ? 'Only Admins can access User Management' : ''}">
                                                <input type="checkbox" 
                                                    class="rbac-toggle" 
                                                    data-module="${mod}" 
                                                    data-role="${role}" 
                                                    ${isEnabled ? 'checked' : ''} 
                                                    ${isLocked ? 'disabled' : ''}
                                                    onchange="this.closest('.toggle-switch').classList.toggle('active-toggle', this.checked)">
                                                <div class="toggle-knob"></div>
                                            </label>
                                        </td>`;
                                    }).join('')}
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Role Summary Cards -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-top:1.5rem;">
            ${roles.map(role => {
                const accessible = modules.filter(m => state.rolePermissions[m]?.[role]).map(m => MODULE_LABELS[m]?.label || m);
                const denied = modules.filter(m => !state.rolePermissions[m]?.[role]).map(m => MODULE_LABELS[m]?.label || m);
                return `<div class="role-summary-card">
                    <div class="role-card-header" style="margin-bottom:0.75rem;">
                        <div class="role-card-icon" style="background:linear-gradient(135deg,var(--primary),var(--secondary));">
                            <i class="fas fa-user-tag"></i>
                        </div>
                        <div>
                            <h4 class="role-card-title">${role}</h4>
                            <p class="role-card-subtitle">${accessible.length} of ${modules.length} modules accessible</p>
                        </div>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-secondary);">
                        <div style="margin-bottom:0.4rem;"><span style="color:var(--success);font-weight:700;">✓ Can Access:</span> ${accessible.join(', ') || 'None'}</div>
                        <div><span style="color:var(--danger);font-weight:700;">✗ Restricted:</span> ${denied.join(', ') || 'None'}</div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
}

window.saveRoleSettingsUI = async () => {
    // Read all toggle checkboxes from the matrix
    const toggles = document.querySelectorAll('.rbac-toggle');
    toggles.forEach(toggle => {
        const mod = toggle.dataset.module;
        const role = toggle.dataset.role;
        if (state.rolePermissions[mod]) {
            state.rolePermissions[mod][role] = toggle.checked;
        }
    });

    // Persist to PouchDB
    await saveRolePermissions();

    // Re-apply sidebar permissions immediately
    applyRolePermissionsToUI();

    // Re-render to update summary cards
    renderRoleSettings();

    showToast('Role permissions saved and applied!', 'success');
};

// User Management Implementation
function renderUsers() {
    const list = document.getElementById('users-list');
    if (!list) {
        console.error('Users list container not found');
        return;
    }
    
    if (!state.users || state.users.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No users found.</td></tr>';
        return;
    }

    list.innerHTML = state.users.map(u => `
        <tr>
            <td>${u.email}</td>
            <td><span class="status-pill ${u.role === 'Admin' ? 'status-paid' : 'status-pending'}">${u.role}</span></td>
            <td>${u.lastLogin || 'Never'}</td>
            <td>
                <button class="action-btn" onclick="openEditUserModal('${u.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteUser('${u.id}')" ${u.role === 'Admin' ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

window.openAddUserModal = () => {
    const content = `
        <form id="user-add-form">
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="new-user-email" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="new-user-password" required>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select id="new-user-role" required>
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Create User</button>
            </div>
        </form>
    `;
    openModal('Add New User', content);
    
    document.getElementById('user-add-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('new-user-email').value;
        const password = document.getElementById('new-user-password').value;
        const role = document.getElementById('new-user-role').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        setBtnLoading(submitBtn, true, originalText);
        
        try {
            if (supabaseClient) {
                const { data, error } = await supabaseClient.auth.signUp({ 
                    email, 
                    password,
                    options: {
                        data: { role: role }
                    }
                });
                
                if (error) throw error;
                
                if (data.user) {
                    const { error: profErr } = await supabaseClient
                        .from('profiles')
                        .upsert([{ 
                            id: data.user.id, 
                            email, 
                            role
                        }]);
                    
                    if (profErr) throw profErr;
                    showToast(`User ${email} created! If login fails, please check if email confirmation is enabled in Supabase settings.`);
                } else if (data.session === null) {
                    // This often happens if email confirmation is enabled or user exists
                    showToast(`Creation request sent for ${email}. If they don't appear, they might already exist or need email confirmation.`, 'warning');
                }
            } else {
                // Mock Mode: Add to local state and PouchDB
                const id = Date.now().toString();
                const newUser = {
                    _id: id,
                    id: id,
                    email,
                    role,
                    lastLogin: 'Never'
                };
                try {
                    await db.users.put(newUser);
                    state.users.push(newUser);
                    await saveAppState();
                    showToast(`User ${email} created (Mock Mode)`);
                } catch (err) {
                    console.error('Error creating user in mock mode:', err);
                    showToast('Failed to create user', 'error');
                }
            }
            
            await fetchUsers();
            closeModal();
        } catch (err) {
            console.error('User creation error:', err);
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            setBtnLoading(submitBtn, false, originalText);
        }
    };
};

window.deleteUser = async (id) => {
    if (!id) {
        showToast('Invalid user selection', 'error');
        return;
    }

    if (state.currentUser && state.currentUser.id == id) {
        showToast('Action Denied: You cannot delete your own account.', 'error');
        return;
    }

    if (confirm('Are you sure you want to delete this user profile? (Note: This only deletes the profile record, not the Auth account for security)')) {
        try {
            console.log('Attempting to delete user with ID:', id);
            
            if (supabaseClient) {
                const { error } = await supabaseClient
                    .from('profiles')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
            } else {
                // Mock Mode delete from PouchDB
                try {
                    const doc = await db.users.get(id.toString());
                    await db.users.remove(doc);
                } catch (pouchErr) {
                    if (pouchErr.status !== 404) throw pouchErr;
                }
            }

            // Update UI State
            state.users = state.users.filter(u => u.id != id);
            await saveAppState();
            renderUsers();
            showToast('User profile deleted successfully');
        } catch (err) {
            console.error('Delete user error:', err);
            showToast(`Error: ${err.message || 'Operation failed'}`, 'error');
        }
    }
};

window.openForgotPasswordModal = () => {
    const content = `
        <form id="forgot-password-form">
            <div class="form-group">
                <label>Enter your email address</label>
                <input type="email" id="forgot-email" required placeholder="you@example.com">
            </div>
            <p>We will send a password reset link to your email.</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Send Reset Link</button>
            </div>
        </form>
    `;
    openModal('Forgot Password', content);

    document.getElementById('forgot-password-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        setBtnLoading(submitBtn, true, originalText);
        
        if (supabaseClient) {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.href,
            });
            if (error) {
                showToast(`Error: ${error.message}`, 'error');
            } else {
                closeModal();
                showToast('Password reset link sent! Check your email.');
            }
        } else {
            showToast('Forgot Password is not available in Mock Mode.', 'warning');
        }
        setBtnLoading(submitBtn, false, originalText);
    };
};

window.openEditUserModal = (id) => {
    const user = state.users.find(u => u.id == id);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    const content = `
        <form id="user-edit-form">
            <div class="form-group">
                <label>Email (Read-only)</label>
                <input type="email" value="${user.email}" readonly>
            </div>
            <div class="form-group">
                <label>Role</label>
                <select id="edit-user-role" required>
                    <option value="Staff" ${user.role === 'Staff' ? 'selected' : ''}>Staff</option>
                    <option value="Manager" ${user.role === 'Manager' ? 'selected' : ''}>Manager</option>
                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Update User</button>
            </div>
        </form>
    `;
    openModal('Edit User Role', content);
    
    document.getElementById('user-edit-form').onsubmit = async (e) => {
        e.preventDefault();
        const role = document.getElementById('edit-user-role').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        setBtnLoading(submitBtn, true, originalText);
        
        try {
            if (supabaseClient) {
                const { error } = await supabaseClient
                    .from('profiles')
                    .update({ 
                        role
                    })
                    .eq('id', id);
                
                if (error) throw error;
                
                // Optimistic UI update
                const idx = state.users.findIndex(u => u.id == id);
                if (idx !== -1) {
                    state.users[idx].role = role;
                }
            } else {
                // Mock Mode: update in PouchDB
                const doc = await db.users.get(id.toString());
                await db.users.put({ ...doc, role });
                user.role = role;
            }
            
            showToast('User role updated successfully');
            renderUsers(); // Refresh the list view
            closeModal();
        } catch (err) {
            console.error('Update role error:', err);
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            setBtnLoading(submitBtn, false, originalText);
        }
    };
};

// Profile Module Implementation
function renderProfileForm() {
    const comp = state.company;
    document.getElementById('prof-name').value = comp.name || '';
    document.getElementById('prof-legal-name').value = comp.legalName || '';
    document.getElementById('prof-gstin').value = comp.gstin || '';
    document.getElementById('prof-address').value = comp.address || '';
    document.getElementById('prof-phone').value = comp.phone || '';
    document.getElementById('prof-email').value = comp.email || '';
    document.getElementById('prof-state').value = comp.state || '';
    document.getElementById('prof-bank-name').value = comp.bankName || '';
    document.getElementById('prof-account-no').value = comp.accountNo || '';
    document.getElementById('prof-ifsc').value = comp.ifscCode || '';
    document.getElementById('prof-holder').value = comp.accountHolder || '';
    document.getElementById('prof-terms').value = comp.terms || '';

    const logoPreview = document.getElementById('prof-logo-preview');
    const qrPreview = document.getElementById('prof-qr-preview');
    const sigPreview = document.getElementById('prof-sig-preview');

    logoPreview.src = comp.logoUrl || '';
    logoPreview.style.display = comp.logoUrl ? 'block' : 'none';
    
    qrPreview.src = comp.qrUrl || '';
    qrPreview.style.display = comp.qrUrl ? 'block' : 'none';
    
    sigPreview.src = comp.sigUrl || '';
    sigPreview.style.display = comp.sigUrl ? 'block' : 'none';

    document.getElementById('prof-logo-file').onchange = (e) => handleFileChange(e, 'logoUrl', 'prof-logo-preview');
    document.getElementById('prof-qr-file').onchange = (e) => handleFileChange(e, 'qrUrl', 'prof-qr-preview');
    document.getElementById('prof-sig-file').onchange = (e) => handleFileChange(e, 'sigUrl', 'prof-sig-preview');

    document.getElementById('profile-form').onsubmit = handleProfileSubmit;
}

async function handleFileChange(event, stateKey, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (PNG/JPG only)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showToast('Invalid file format. Please upload PNG or JPG only.', 'error');
        event.target.value = ''; // Reset input
        return;
    }

    // 1. Immediate Feedback: Show local preview and update state with Data URL
    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target.result;
        
        // Update UI preview
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.src = dataUrl;
            preview.style.display = 'block';
        }

        // Update state immediately with Data URL (fallback/temp)
        state.company[stateKey] = dataUrl;
        
        // Save to PouchDB
        try {
            const doc = await db.company.get('config');
            await db.company.put({ ...doc, [stateKey]: dataUrl });
        } catch (e) {
            if (e.status === 404) {
                await db.company.put({ ...state.company, _id: 'config', [stateKey]: dataUrl });
            }
        }
        
        await saveAppState();

        // 2. Background Task: Upload to Supabase Storage if available
        if (supabaseClient) {
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${stateKey}-${Date.now()}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                showToast(`Uploading ${stateKey} to cloud...`, 'info');

                const { data, error } = await supabaseClient.storage
                    .from('branding')
                    .upload(filePath, file);

                if (error) throw error;

                // Get Public URL and update state with the permanent link
                const { data: { publicUrl } } = supabaseClient.storage
                    .from('branding')
                    .getPublicUrl(filePath);

                state.company[stateKey] = publicUrl;
                
                // Update PouchDB with public URL
                const doc = await db.company.get('config');
                await db.company.put({ ...doc, [stateKey]: publicUrl });
                
                await saveAppState();
                showToast(`${stateKey} synced to cloud!`);
            } catch (err) {
                console.error('Cloud upload error:', err);
                showToast(`Cloud sync failed: ${err.message}. Image saved locally.`, 'warning');
                // State already has the Data URL from step 1, so we are safe.
            }
        }
    };
    reader.readAsDataURL(file);
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    state.company.name = document.getElementById('prof-name').value;
    state.company.legalName = document.getElementById('prof-legal-name').value;
    state.company.gstin = document.getElementById('prof-gstin').value;
    state.company.address = document.getElementById('prof-address').value;
    state.company.phone = document.getElementById('prof-phone').value;
    state.company.email = document.getElementById('prof-email').value;
    state.company.state = document.getElementById('prof-state').value;
    state.company.bankName = document.getElementById('prof-bank-name').value;
    state.company.accountNo = document.getElementById('prof-account-no').value;
    state.company.ifscCode = document.getElementById('prof-ifsc').value;
    state.company.accountHolder = document.getElementById('prof-holder').value;
    state.company.terms = document.getElementById('prof-terms').value;
    
    // Save to PouchDB
    try {
        let doc;
        try {
            doc = await db.company.get('config');
            await db.company.put({ ...doc, ...state.company });
        } catch (e) {
            if (e.status === 404) {
                await db.company.put({ ...state.company, _id: 'config' });
            } else {
                throw e;
            }
        }
        
        await saveAppState(); // Updates UI
        updateBrandingDisplay();
        showToast('Company profile updated and saved successfully!');
    } catch (err) {
        console.error('Error saving profile:', err);
        showToast('Failed to save profile', 'error');
    }
}

window.openResetPasswordModal = () => {
    const content = `
        <form id="reset-password-form">
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="reset-password" required minlength="6" placeholder="Min 6 characters">
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="reset-password-confirm" required minlength="6" placeholder="Confirm your new password">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="submit" class="btn-primary" style="width: auto;">Update Password</button>
            </div>
        </form>
    `;
    openModal('Set New Password', content);

    document.getElementById('reset-password-form').onsubmit = async (e) => {
        e.preventDefault();
        const password = document.getElementById('reset-password').value;
        const confirm = document.getElementById('reset-password-confirm').value;

        if (password !== confirm) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        setBtnLoading(submitBtn, true, originalText);

        if (supabaseClient) {
            const { error } = await supabaseClient.auth.updateUser({ password });
            if (error) {
                showToast(`Error: ${error.message}`, 'error');
            } else {
                closeModal();
                showToast('Password updated successfully! You can now log in with your new password.');
                // Clear the hash from URL
                window.history.replaceState(null, null, window.location.pathname);
            }
        } else {
            showToast('Password reset is not available in Mock Mode.', 'warning');
        }
        setBtnLoading(submitBtn, false, originalText);
    };
};

// Reports Implementation
function showReport(title, thead, tbody, summary) {
    document.getElementById('report-results').classList.remove('hidden');
    document.getElementById('report-title-text').textContent = title;
    document.getElementById('report-date-text').textContent = `Generated on: ${new Date().toLocaleDateString()}`;
    document.getElementById('report-thead').innerHTML = thead;
    document.getElementById('report-tbody').innerHTML = tbody;
    document.getElementById('report-summary').innerHTML = summary;
    
    // Show/hide Excel export button for Sales and Purchase reports
    const excelBtn = document.getElementById('report-excel-btn');
    if (title.includes('Sales') || title.includes('Purchase')) {
        excelBtn.style.display = 'flex';
    } else {
        excelBtn.style.display = 'none';
    }
}

window.generateSalesReport = () => {
    const title = "Sales Report";
    const filteredData = getFilteredReportData('sales');
    const thead = `<tr><th>Date</th><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Status</th></tr>`;
    const tbody = filteredData.map(s => `<tr><td>${s.date}</td><td>${s.id}</td><td>${s.customer}</td><td>₹ ${s.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td>${s.status}</td></tr>`).join('');
    const total = filteredData.reduce((sum, s) => sum + s.total, 0);
    const summary = `<div class="grand-total"><span>Total Sales:</span> <span>₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>`;
    showReport(title, thead, tbody, summary);
};

window.generatePurchaseReport = () => {
    const title = "Purchase Report";
    const filteredData = getFilteredReportData('pur');
    const thead = `<tr><th>Date</th><th>Order #</th><th>Supplier</th><th>Amount</th><th>Status</th></tr>`;
    const tbody = filteredData.map(p => `<tr><td>${p.date}</td><td>${p.id}</td><td>${p.supplier}</td><td>₹ ${p.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td>${p.status}</td></tr>`).join('');
    const total = filteredData.reduce((sum, p) => sum + p.total, 0);
    const summary = `<div class="grand-total"><span>Total Purchases:</span> <span>₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>`;
    showReport(title, thead, tbody, summary);
};

window.generateInventoryReport = () => {
    const title = "Inventory Status Report";
    const thead = `<tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Min Stock</th><th>Status</th><th>Valuation</th></tr>`;
    const tbody = state.inventory.map(p => {
        const isLow = p.stock < p.minStock;
        const status = isLow ? `<span style="color: var(--danger-color); font-weight: bold;">LOW STOCK</span>` : `<span style="color: var(--success-color)">In Stock</span>`;
        return `
            <tr>
                <td>${p.name}</td>
                <td>${p.sku}</td>
                <td>${p.category}</td>
                <td style="font-weight: bold; color: ${isLow ? 'var(--danger-color)' : 'inherit'}">${p.stock}</td>
                <td>${p.minStock}</td>
                <td>${status}</td>
                <td>₹ ${(p.stock * p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
        `;
    }).join('');
    const totalVal = state.inventory.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const summary = `<div class="grand-total"><span>Total Valuation:</span> <span>₹ ${totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>`;
    showReport(title, thead, tbody, summary);
};

window.generateProfitLossReport = () => {
    const title = "Profit & Loss Statement";
    const revenue = state.sales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = revenue - totalExpenses;
    
    const thead = `<tr><th>Type</th><th>Total Amount</th></tr>`;
    const tbody = `
        <tr><td>Total Revenue (Sales)</td><td style="color: var(--success-color)">₹ ${revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
        <tr><td>Total Expenses</td><td style="color: var(--danger-color)">-₹ ${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
    `;
    const summary = `<div class="grand-total"><span>Net Profit:</span> <span style="color: ${netProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">₹ ${netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>`;
    showReport(title, thead, tbody, summary);
};

window.generateExpenseReport = () => {
    const title = "Expense Breakdown Report";
    const thead = `<tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr>`;
    const tbody = state.expenses.map(e => `<tr><td>${e.date}</td><td>${e.category}</td><td>${e.description}</td><td>₹ ${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>`).join('');
    const total = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    const summary = `<div class="grand-total"><span>Total Expenses:</span> <span>₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>`;
    showReport(title, thead, tbody, summary);
};

window.printReport = () => {
    window.print();
};

// --- Advanced Dashboard Implementation ---

window.handleDashboardFilterChange = () => {
    const period = document.getElementById('dash-period').value;
    state.dashFilters.period = period;
    
    const customDates = document.getElementById('dash-custom-dates');
    if (period === 'Custom') {
        customDates.classList.remove('hidden');
    } else {
        customDates.classList.add('hidden');
        applyDashboardFilters();
    }
};

window.applyDashboardFilters = () => {
    const period = state.dashFilters.period;
    let start = '';
    let end = new Date().toISOString().split('T')[0];
    const today = new Date();

    if (period === 'Today') {
        start = end;
    } else if (period === 'Last7Days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split('T')[0];
    } else if (period === 'ThisMonth') {
        start = end.slice(0, 7) + '-01';
    } else if (period === 'LastMonth') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonth = d.toISOString().slice(0, 7);
        start = lastMonth + '-01';
        const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
        end = lastDay.toISOString().split('T')[0];
    } else if (period === 'ThisYear') {
        start = end.slice(0, 4) + '-01-01';
    } else if (period === 'Custom') {
        start = document.getElementById('dash-start-date').value;
        end = document.getElementById('dash-end-date').value;
    }

    state.dashFilters.startDate = start;
    state.dashFilters.endDate = end;

    updateDashboardStats();
    renderDashboardCharts();
};

function getFilteredDataForDashboard(dataArray, dateKey = 'date') {
    const { startDate, endDate, period } = state.dashFilters;
    if (period === 'All') return dataArray;
    if (!startDate || !endDate) return dataArray;
    
    return dataArray.filter(item => {
        const d = item[dateKey];
        return d >= startDate && d <= endDate;
    });
}

function updateDashboardStats() {
    const filteredSales = getFilteredDataForDashboard(state.sales);
    const filteredPurchases = getFilteredDataForDashboard(state.purchases);
    const filteredExpenses = getFilteredDataForDashboard(state.expenses);

    // 1. Financial KPIs
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) : 0;

    const revEl = document.getElementById('dash-revenue');
    const expEl = document.getElementById('dash-expenses');
    const profEl = document.getElementById('dash-profit');
    const margEl = document.getElementById('dash-margin');

    if (revEl) revEl.textContent = `₹ ${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (expEl) expEl.textContent = `₹ ${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (profEl) profEl.textContent = `₹ ${netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (margEl) margEl.textContent = `${margin}%`;

    // Visual coloring for Profit/Loss
    const profitCard = document.querySelector('.kpi-card.profit');
    if (profitCard && profEl) {
        if (netProfit < 0) {
            profitCard.style.borderTopColor = 'var(--danger)';
            profEl.classList.add('text-danger');
        } else {
            profitCard.style.borderTopColor = 'var(--success)';
            profEl.classList.remove('text-danger');
        }
    }

    // 2. Operational Stats
    const lowStockCount = state.inventory.filter(p => p.stock < p.minStock).length;
    const pendingRev = state.sales.filter(s => s.status === 'Pending').reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    const pendingPay = state.purchases.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
    const invValue = state.inventory.reduce((sum, p) => sum + ((parseFloat(p.stock) || 0) * (parseFloat(p.price) || 0)), 0);

    const lowStockEl = document.getElementById('dash-low-stock');
    const pendRevEl = document.getElementById('dash-pending-rev');
    const pendPayEl = document.getElementById('dash-pending-pay');
    const invValEl = document.getElementById('dash-inv-value');

    if (lowStockEl) lowStockEl.textContent = lowStockCount;
    if (pendRevEl) pendRevEl.textContent = `₹ ${pendingRev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (pendPayEl) pendPayEl.textContent = `₹ ${pendingPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (invValEl) invValEl.textContent = `₹ ${invValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    // 3. Top Lists
    renderTopLists(filteredSales);
}

function renderTopLists(filteredSales) {
    // Top Products
    const productMap = {};
    filteredSales.forEach(sale => {
        if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach(item => {
                const name = item.name || 'Unknown Product';
                const revenue = (parseFloat(item.total) || 0);
                productMap[name] = (productMap[name] || 0) + revenue;
            });
        }
    });

    const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const productContainer = document.getElementById('dash-top-products');
    if (productContainer) {
        if (topProducts.length === 0) {
            productContainer.innerHTML = '<p class="text-muted">No sales data for this period.</p>';
        } else {
            productContainer.innerHTML = topProducts.map(([name, val]) => `
                <div class="dash-list-item">
                    <span class="item-name">${name}</span>
                    <span class="item-value">₹ ${val.toLocaleString('en-IN')}</span>
                </div>
            `).join('');
        }
    }

    // Top Customers
    const customerMap = {};
    filteredSales.forEach(sale => {
        const name = sale.customer || 'Guest';
        customerMap[name] = (customerMap[name] || 0) + (parseFloat(sale.total) || 0);
    });

    const topCustomers = Object.entries(customerMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const customerContainer = document.getElementById('dash-top-customers');
    if (customerContainer) {
        if (topCustomers.length === 0) {
            customerContainer.innerHTML = '<p class="text-muted">No customer data for this period.</p>';
        } else {
            customerContainer.innerHTML = topCustomers.map(([name, val]) => `
                <div class="dash-list-item">
                    <span class="item-name">${name}</span>
                    <span class="item-value">₹ ${val.toLocaleString('en-IN')}</span>
                </div>
            `).join('');
        }
    }
}

function renderDashboardCharts() {
    try {
        const salesCanvas = document.getElementById('salesChart');
        const expenseCanvas = document.getElementById('expenseChart');
        if (!salesCanvas || !expenseCanvas) return;

        // 1. Sales Trend Data
        const { startDate, endDate, period } = state.dashFilters;
        let labels = [];
        let dataset = [];

        if (period === 'Today') {
            labels = ['Today'];
            const todayTotal = state.sales.filter(s => s.date === startDate).reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
            dataset = [todayTotal];
        } else if (period === 'Last7Days' || (period === 'Custom' && startDate && endDate && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) <= 14)) {
            // Day-wise trend
            const dStart = new Date(startDate);
            const dEnd = new Date(endDate);
            for (let d = new Date(dStart); d <= dEnd; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                labels.push(d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
                const dailyTotal = state.sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
                dataset.push(dailyTotal);
            }
        } else {
            // Month-wise trend
            const monthMap = {};
            const salesInScope = getFilteredDataForDashboard(state.sales);
            salesInScope.forEach(s => {
                const m = s.date.slice(0, 7); // YYYY-MM
                monthMap[m] = (monthMap[m] || 0) + (parseFloat(s.total) || 0);
            });
            labels = Object.keys(monthMap).sort();
            dataset = labels.map(m => monthMap[m]);
            labels = labels.map(m => {
                const [y, mm] = m.split('-');
                return new Date(y, parseInt(mm) - 1).toLocaleString('default', { month: 'short' });
            });
        }

        const salesCtx = salesCanvas.getContext('2d');
        if (window.mySalesChart) window.mySalesChart.destroy();
        window.mySalesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{ 
                    label: 'Sales Revenue (₹)', 
                    data: dataset, 
                    borderColor: '#4f46e5', 
                    tension: 0.3, 
                    fill: true, 
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 2. Expense Breakdown
        const filteredExpenses = getFilteredDataForDashboard(state.expenses);
        const expenseMap = {};
        filteredExpenses.forEach(e => {
            expenseMap[e.category] = (expenseMap[e.category] || 0) + (parseFloat(e.amount) || 0);
        });

        const expenseCtx = expenseCanvas.getContext('2d');
        if (window.myExpenseChart) window.myExpenseChart.destroy();
        window.myExpenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expenseMap),
                datasets: [{ 
                    data: Object.values(expenseMap), 
                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'] 
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15, font: { size: 11 } } }
                },
                cutout: '70%'
            }
        });
    } catch (err) {
        console.error('Error rendering dashboard charts:', err);
    }
}

// Excel Export Functions
window.exportSalesToExcel = () => {
    // Apply current module filters to the export data
    const period = state.filters.salesPeriod;
    const startDate = document.getElementById('sales-start-date')?.value;
    const endDate = document.getElementById('sales-end-date')?.value;
    const today = new Date().toISOString().split('T')[0];
    const searchVal = state.filters.sales.toLowerCase();
    
    let filteredSales = state.sales;

    // 1. Date Filtering
    if (period === 'Today') {
        filteredSales = filteredSales.filter(item => item.date === today);
    } else if (period === 'ThisMonth') {
        const month = today.slice(0, 7);
        filteredSales = filteredSales.filter(item => item.date.startsWith(month));
    } else if (period === 'LastMonth') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonth = d.toISOString().slice(0, 7);
        filteredSales = filteredSales.filter(item => item.date.startsWith(lastMonth));
    } else if (period === 'Custom' && startDate && endDate) {
        filteredSales = filteredSales.filter(item => item.date >= startDate && item.date <= endDate);
    }

    // 2. Search Text Filtering
    if (searchVal) {
        filteredSales = filteredSales.filter(sale => 
            sale.id.toLowerCase().includes(searchVal) || 
            sale.customer.toLowerCase().includes(searchVal) ||
            sale.status.toLowerCase().includes(searchVal)
        );
    }

    if (filteredSales.length === 0) {
        showToast('No sales data matching filters to export', 'warning');
        return;
    }

    const exportData = filteredSales.map(sale => {
        const taxableValue = parseFloat(sale.subtotal) || 0;
        const totalTax = parseFloat(sale.tax) || 0;
        const isLocal = sale.gstType === 'Local';
        
        return {
            'Date': sale.date,
            'Invoice No': sale.id,
            'Customer': sale.customer,
            'GST No': getCustomerGST(sale.customer),
            'Taxable Value': taxableValue.toFixed(2),
            'CGST': isLocal ? (totalTax / 2).toFixed(2) : '0.00',
            'SGST': isLocal ? (totalTax / 2).toFixed(2) : '0.00',
            'IGST': !isLocal ? totalTax.toFixed(2) : '0.00',
            'Total Amount': (sale.total || 0).toFixed(2),
            'Received Amount': (sale.receivedAmount || 0).toFixed(2),
            'Pending Amount': (sale.pendingAmount || 0).toFixed(2),
            'Status': sale.status,
            'Payment Mode': sale.paymentMode || 'None'
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Sales report exported to Excel');
};

window.exportPurchasesToExcel = () => {
    // Apply current module filters to the export data
    const period = state.filters.purPeriod;
    const startDate = document.getElementById('pur-start-date')?.value;
    const endDate = document.getElementById('pur-end-date')?.value;
    const today = new Date().toISOString().split('T')[0];
    const searchVal = state.filters.purchases.toLowerCase();
    
    let filteredPurchases = state.purchases;

    // 1. Date Filtering
    if (period === 'Today') {
        filteredPurchases = filteredPurchases.filter(item => item.date === today);
    } else if (period === 'ThisMonth') {
        const month = today.slice(0, 7);
        filteredPurchases = filteredPurchases.filter(item => item.date.startsWith(month));
    } else if (period === 'LastMonth') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonth = d.toISOString().slice(0, 7);
        filteredPurchases = filteredPurchases.filter(item => item.date.startsWith(lastMonth));
    } else if (period === 'Custom' && startDate && endDate) {
        filteredPurchases = filteredPurchases.filter(item => item.date >= startDate && item.date <= endDate);
    }

    // 2. Search Text Filtering
    if (searchVal) {
        filteredPurchases = filteredPurchases.filter(pur => 
            pur.id.toLowerCase().includes(searchVal) || 
            pur.supplier.toLowerCase().includes(searchVal) ||
            pur.status.toLowerCase().includes(searchVal)
        );
    }

    if (filteredPurchases.length === 0) {
        showToast('No purchase data matching filters to export', 'warning');
        return;
    }

    const exportData = filteredPurchases.map(pur => {
        const taxableValue = parseFloat(pur.subtotal) || 0;
        const totalTax = parseFloat(pur.tax) || 0;
        const isLocal = pur.gstType === 'Local';
        
        return {
            'Date': pur.date,
            'Order No': pur.id,
            'Supplier': pur.supplier,
            'GST No': getSupplierGST(pur.supplier),
            'Taxable Value': taxableValue.toFixed(2),
            'CGST': isLocal ? (totalTax / 2).toFixed(2) : '0.00',
            'SGST': isLocal ? (totalTax / 2).toFixed(2) : '0.00',
            'IGST': !isLocal ? totalTax.toFixed(2) : '0.00',
            'Total Amount': (pur.total || 0).toFixed(2),
            'Paid Amount': (pur.paidAmount || 0).toFixed(2),
            'Pending Amount': (pur.pendingAmount || 0).toFixed(2),
            'Status': pur.status,
            'Payment Mode': pur.paymentMode || 'None'
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchases");
    XLSX.writeFile(wb, `Purchases_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Purchase report exported to Excel');
};

window.exportPurchaseInvoicesToExcel = () => {
    const period = state.filters.pinvPeriod;
    const startDate = document.getElementById('pinv-start-date')?.value;
    const endDate = document.getElementById('pinv-end-date')?.value;
    const today = new Date().toISOString().split('T')[0];
    const searchVal = state.filters.pinv.toLowerCase();
    
    let filteredInvoices = state.purchaseInvoices;

    // 1. Date Filtering
    if (period === 'Today') {
        filteredInvoices = filteredInvoices.filter(item => item.date === today);
    } else if (period === 'ThisMonth') {
        const month = today.slice(0, 7);
        filteredInvoices = filteredInvoices.filter(item => item.date.startsWith(month));
    } else if (period === 'LastMonth') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonth = d.toISOString().slice(0, 7);
        filteredInvoices = filteredInvoices.filter(item => item.date.startsWith(lastMonth));
    } else if (period === 'Custom' && startDate && endDate) {
        filteredInvoices = filteredInvoices.filter(item => item.date >= startDate && item.date <= endDate);
    }

    // 2. Search Text Filtering
    if (searchVal) {
        filteredInvoices = filteredInvoices.filter(inv => 
            inv.invoiceNo.toLowerCase().includes(searchVal) || 
            inv.supplier.toLowerCase().includes(searchVal) ||
            inv.status.toLowerCase().includes(searchVal)
        );
    }

    if (filteredInvoices.length === 0) {
        showToast('No purchase invoices matching filters to export', 'warning');
        return;
    }

    const exportData = filteredInvoices.map(inv => {
        return {
            'Invoice No': inv.invoiceNo,
            'Date': inv.date,
            'Supplier': inv.supplier,
            'GST No': getSupplierGST(inv.supplier),
            'Total Amount': parseFloat(inv.total) || 0,
            'Paid Amount': parseFloat(inv.paidAmount) || 0,
            'Pending Amount': parseFloat(inv.pendingAmount) || 0,
            'Status': inv.status,
            'Has Attachment': inv.attachment ? 'Yes' : 'No'
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchase_Invoices");
    XLSX.writeFile(wb, `Purchase_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Purchase Invoices exported to Excel');
};

window.exportSaleInvoicesToExcel = () => {
    const period = state.filters.sinvPeriod;
    const startDate = document.getElementById('sinv-start-date')?.value;
    const endDate = document.getElementById('sinv-end-date')?.value;
    const today = new Date().toISOString().split('T')[0];
    const searchVal = state.filters.sinv.toLowerCase();
    
    let filteredInvoices = state.saleInvoices;

    // 1. Date Filtering
    if (period === 'Today') {
        filteredInvoices = filteredInvoices.filter(item => item.date === today);
    } else if (period === 'ThisMonth') {
        const month = today.slice(0, 7);
        filteredInvoices = filteredInvoices.filter(item => item.date.startsWith(month));
    } else if (period === 'LastMonth') {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        const lastMonth = d.toISOString().slice(0, 7);
        filteredInvoices = filteredInvoices.filter(item => item.date.startsWith(lastMonth));
    } else if (period === 'Custom' && startDate && endDate) {
        filteredInvoices = filteredInvoices.filter(item => item.date >= startDate && item.date <= endDate);
    }

    // 2. Search Text Filtering
    if (searchVal) {
        filteredInvoices = filteredInvoices.filter(inv => 
            inv.invoiceNo.toLowerCase().includes(searchVal) || 
            inv.customer.toLowerCase().includes(searchVal) ||
            inv.status.toLowerCase().includes(searchVal)
        );
    }

    if (filteredInvoices.length === 0) {
        showToast('No sale invoices matching filters to export', 'warning');
        return;
    }

    const exportData = filteredInvoices.map(inv => {
        return {
            'Invoice No': inv.invoiceNo,
            'Date': inv.date,
            'Customer': inv.customer,
            'GST No': getCustomerGST(inv.customer),
            'Total Amount': parseFloat(inv.total) || 0,
            'Received Amount': parseFloat(inv.receivedAmount) || 0,
            'Pending Amount': parseFloat(inv.pendingAmount) || 0,
            'Status': inv.status,
            'Has Attachment': inv.attachment ? 'Yes' : 'No'
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sale_Invoices");
    XLSX.writeFile(wb, `Sale_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Sale Invoices exported to Excel');
};

window.exportReportToExcel = () => {
    const title = document.getElementById('report-title-text').textContent;
    let exportData = [];
    let fileName = "";
    let data;

    if (title.includes('Sales')) {
        data = getFilteredReportData('sales');
        fileName = `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        exportData = data.map(sale => {
            const taxableValue = parseFloat(sale.subtotal) || 0;
            const totalTax = parseFloat(sale.tax) || 0;
            const isLocal = sale.gstType === 'Local';
            return {
                'Date': sale.date,
                'Invoice No': sale.id,
                'Customer': sale.customer,
                'GST No': getCustomerGST(sale.customer),
                'Taxable Value': taxableValue,
                'CGST': isLocal ? (totalTax / 2) : 0,
                'SGST': isLocal ? (totalTax / 2) : 0,
                'IGST': !isLocal ? totalTax : 0,
                'Total Amount': parseFloat(sale.total) || 0,
                'Status': sale.status
            };
        });
    } else if (title.includes('Purchase')) {
        data = getFilteredReportData('pur');
        fileName = `Purchases_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
        exportData = data.map(pur => {
            const taxableValue = parseFloat(pur.subtotal) || 0;
            const totalTax = parseFloat(pur.tax) || 0;
            const isLocal = pur.gstType === 'Local';
            return {
                'Date': pur.date,
                'Order No': pur.id,
                'Supplier': pur.supplier,
                'GST No': getSupplierGST(pur.supplier),
                'Taxable Value': taxableValue,
                'CGST': isLocal ? (totalTax / 2) : 0,
                'SGST': isLocal ? (totalTax / 2) : 0,
                'IGST': !isLocal ? totalTax : 0,
                'Total Amount': parseFloat(pur.total) || 0,
                'Status': pur.status
            };
        });
    }

    if (exportData.length > 0) {
        // Calculate Totals
        const totals = {
            'Date': 'TOTAL',
            'Invoice No': '',
            'Customer': '',
            'GST No': '',
            'Taxable Value': exportData.reduce((sum, item) => sum + item['Taxable Value'], 0),
            'CGST': exportData.reduce((sum, item) => sum + item['CGST'], 0),
            'SGST': exportData.reduce((sum, item) => sum + item['SGST'], 0),
            'IGST': exportData.reduce((sum, item) => sum + item['IGST'], 0),
            'Total Amount': exportData.reduce((sum, item) => sum + item['Total Amount'], 0),
            'Status': ''
        };
        
        // Format numbers for export (strings with 2 decimals)
        const finalData = exportData.map(item => ({
            ...item,
            'Taxable Value': item['Taxable Value'].toFixed(2),
            'CGST': item['CGST'].toFixed(2),
            'SGST': item['SGST'].toFixed(2),
            'IGST': item['IGST'].toFixed(2),
            'Total Amount': item['Total Amount'].toFixed(2)
        }));
        
        finalData.push({
            'Date': 'TOTAL',
            'Invoice No': '',
            'Customer': '',
            'GST No': '',
            'Taxable Value': totals['Taxable Value'].toFixed(2),
            'CGST': totals['CGST'].toFixed(2),
            'SGST': totals['SGST'].toFixed(2),
            'IGST': totals['IGST'].toFixed(2),
            'Total Amount': totals['Total Amount'].toFixed(2),
            'Status': ''
        });

        const ws = XLSX.utils.json_to_sheet(finalData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, fileName);
        showToast('Report exported to Excel');
    } else {
        showToast('No relevant data to export', 'warning');
    }
};
