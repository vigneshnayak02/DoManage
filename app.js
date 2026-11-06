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
        website: '',
        gstin: '36Afhf665488',
        state: '36-Telangana',
        bankName: 'IDBI BANK, GACHIBOWLI',
        branchAddress: '',
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
        // 'All' = All Time so the dashboard always reflects the stored data.
        // Users can narrow it down with the period selector.
        period: 'All',
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
        
        // Load users from PouchDB or seed defaults
        const savedUsers = await loadCollection(db.users);
        if (savedUsers.length > 0) {
            state.users = savedUsers;
        } else {
            const defaultUsers = [
                { _id: '1', id: '1', email: 'admin@manager.io', role: 'Admin', password: 'admin', lastLogin: '2026-03-17' },
                { _id: '2', id: '2', email: 'manager@manager.io', role: 'Manager', password: 'admin', lastLogin: '2026-03-17' },
                { _id: '3', id: '3', email: 'staff@manager.io', role: 'Staff', password: 'admin', lastLogin: '2026-03-18' }
            ];
            for (const u of defaultUsers) {
                try { await db.users.put(u); } catch (_) {}
            }
            state.users = defaultUsers;
        }
        
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
            state.company = { ...state.company, ...companyDoc };
            if (state.currentView === 'profile') {
                renderProfileForm();
            }
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
            if (currentView === 'sales') {
                applyModuleFilters('sales');
            } else if (currentView === 'purchases') {
                applyModuleFilters('pur');
            } else if (currentView === 'expenses') {
                applyModuleFilters('exp');
            } else if (currentView === 'inventory') {
                renderInventory();
            } else if (currentView === 'customers') {
                renderCustomers();
            } else if (currentView === 'suppliers') {
                renderSuppliers();
            } else if (currentView === 'dashboard') {
                updateDashboardStats();
                if(window.renderDashboardCharts) renderDashboardCharts();
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

    // Check for existing session in sessionStorage
    const savedSession = sessionStorage.getItem('manager_auth_user');
    if (savedSession) {
        try {
            const parsed = JSON.parse(savedSession);
            const user = state.users.find(u => u.email.toLowerCase() === (parsed.email || '').toLowerCase()) || parsed;
            checkAuth(user);
        } catch (_) {
            checkAuth(null);
        }
    } else {
        checkAuth(null);
    }
    
    updateBrandingDisplay();
}

async function fetchUsers() {
    try {
        const result = await db.users.allDocs({ include_docs: true });
        if (result.rows.length > 0) {
            state.users = result.rows.map(r => r.doc);
        }
        if (state.currentView === 'users') {
            renderUsers();
        }
    } catch (err) {
        console.error('Error fetching users:', err);
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
            if (window.ModernDropdown && window.ModernDropdown.sync) {
                window.ModernDropdown.sync(gstTypeSelect);
            }
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
            if (window.ModernDropdown && window.ModernDropdown.sync) {
                window.ModernDropdown.sync(gstTypeSelect);
            }
        }
    }
};

// ─── Ship-To Select Helpers ─────────────────────────────────────────────────
window.handleSaleShipToSelectChange = () => {
    const sel = document.getElementById('sale-ship-to-select');
    const inp = document.getElementById('sale-ship-to');
    if (!sel || !inp) return;
    const val = sel.value;
    if (!val) {
        inp.value = '';
        inp.readOnly = false;
        return;
    }
    if (val === 'same_as_billing') {
        const custId = document.getElementById('sale-customer') ? document.getElementById('sale-customer').value : '';
        const cust = state.customers.find(c => c.id == custId);
        if (cust) {
            inp.value = [cust.name, cust.address, cust.state].filter(Boolean).join(', ');
        } else {
            inp.value = '';
        }
        inp.readOnly = false;
        return;
    }
    const c = state.customers.find(x => x.id == val);
    if (c) {
        inp.value = [c.name, c.address, c.state].filter(Boolean).join(', ');
    }
    inp.readOnly = false;
};

window.handlePurchaseShipToSelectChange = () => {
    const sel = document.getElementById('pur-ship-to-select');
    const inp = document.getElementById('pur-ship-to');
    if (!sel || !inp) return;
    const val = sel.value;
    if (!val) {
        inp.value = '';
        inp.readOnly = false;
        return;
    }
    if (val === 'company_address') {
        const co = state.company || {};
        inp.value = [co.name, co.address, co.state].filter(Boolean).join(', ');
        inp.readOnly = false;
        return;
    }
    const c = state.customers.find(x => x.id == val);
    if (c) {
        inp.value = [c.name, c.address, c.state].filter(Boolean).join(', ');
    }
    inp.readOnly = false;
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
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        setBtnLoading(submitBtn, true, originalText);
        
        const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            // Validate password: match stored password or allow 'admin'
            const isMatch = (user.password && user.password === password) || (!user.password && (password === 'admin' || password.length > 0)) || (password === 'admin');
            if (!isMatch) {
                showToast('Invalid email or password', 'error');
                setBtnLoading(submitBtn, false, originalText);
                return;
            }
            user.lastLogin = new Date().toISOString().split('T')[0];
            try {
                const doc = await db.users.get(user._id || user.id.toString());
                await db.users.put({ ...doc, lastLogin: user.lastLogin });
            } catch (_) {}

            sessionStorage.setItem('manager_auth_user', JSON.stringify({ id: user.id, email: user.email, role: user.role }));
            checkAuth(user);
            showToast('Login Successful!');
        } else {
            showToast('Invalid email or password', 'error');
        }
        setBtnLoading(submitBtn, false, originalText);
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('manager_auth_user');
            checkAuth(null);
            showToast('Logged out successfully');
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
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(document.getElementById('modal-content'));
    }
}

window.closeModal = () => {
    document.getElementById('modal-overlay').classList.add('hidden');
    if (window.ModernDropdown && window.ModernDropdown.close) {
        window.ModernDropdown.close();
    }
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
    const today = toLocalISODate(new Date());

    let filteredData;
    if (module === 'sales' || module === 'pur' || module === 'exp' || module === 'pinv' || module === 'sinv') { // Generic module handling
        const dataKey = module === 'pur' ? 'purchases' : (module === 'exp' ? 'expenses' : (module === 'pinv' ? 'purchaseInvoices' : (module === 'sinv' ? 'saleInvoices' : 'sales')));
        filteredData = Array.isArray(state[dataKey]) ? state[dataKey] : [];

        // 1. Date Filtering — normalize the stored value first so imported
        //    records (DD/MM/YYYY, timestamps, ...) are matched reliably.
        if (period === 'Today') {
            filteredData = filteredData.filter(item => normalizeDate(item.date) === today);
        } else if (period === 'ThisMonth') {
            const month = today.slice(0, 7);
            filteredData = filteredData.filter(item => normalizeDate(item.date).startsWith(month));
        } else if (period === 'LastMonth') {
            const d = new Date();
            d.setDate(1); // avoid month-end overflow (e.g. Mar 31 → Mar 3)
            d.setMonth(d.getMonth() - 1);
            const lastMonth = toLocalISODate(d).slice(0, 7);
            filteredData = filteredData.filter(item => normalizeDate(item.date).startsWith(lastMonth));
        } else if (period === 'Custom' && startDate && endDate) {
            filteredData = filteredData.filter(item => {
                const d = normalizeDate(item.date);
                return d && d >= startDate && d <= endDate;
            });
        }

        // 2. Search Text Filtering
        const searchVal = (state.filters[dataKey === 'purchases' ? 'purchases' : (dataKey === 'expenses' ? 'expenses' : (dataKey === 'purchaseInvoices' ? 'pinv' : (dataKey === 'saleInvoices' ? 'sinv' : 'sales')))] || '').toLowerCase();
        if (searchVal) {
            const has = (value) => String(value || '').toLowerCase().includes(searchVal);
            filteredData = filteredData.filter(item => {
                if (!item) return false;
                if (dataKey === 'sales') return has(item.id) || has(item.customer);
                if (dataKey === 'purchases') return has(item.id) || has(item.supplier);
                if (dataKey === 'expenses') return has(item.category) || has(item.description);
                if (dataKey === 'purchaseInvoices') return has(item.invoiceNo) || has(item.supplier);
                if (dataKey === 'saleInvoices') return has(item.invoiceNo) || has(item.customer);
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
    data = Array.isArray(data) ? data : [];

    let statsHTML = '';
    if (module === 'sales') {
        // Sales Module Stats
        const taxable = data.reduce((sum, s) => sum + parseAmount(s.subtotal), 0);
        const tax = data.reduce((sum, s) => sum + parseAmount(s.tax), 0);
        const total = data.reduce((sum, s) => sum + parseAmount(s.total), 0);
        const received = data.reduce((sum, s) => {
            if (s.status === 'Paid') return sum + parseAmount(s.total);
            return sum + parseAmount(s.receivedAmount);
        }, 0);
        const pending = data.reduce((sum, s) => {
            if (s.status === 'Paid') return sum;
            if (s.status === 'Pending' || s.status === 'Overdue') {
                return sum + (parseAmount(s.total) - parseAmount(s.receivedAmount));
            }
            return sum + parseAmount(s.pendingAmount);
        }, 0);
        
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
        const taxable = data.reduce((sum, p) => sum + parseAmount(p.subtotal), 0);
        const tax = data.reduce((sum, p) => sum + parseAmount(p.tax), 0);
        const total = data.reduce((sum, p) => sum + parseAmount(p.total), 0);
        const paid = data.reduce((sum, p) => {
            if (p.status === 'Paid') return sum + parseAmount(p.total);
            return sum + parseAmount(p.paidAmount);
        }, 0);
        const pending = data.reduce((sum, p) => {
            if (p.status === 'Paid') return sum;
            if (p.status === 'Pending' || p.status === 'Overdue') {
                return sum + (parseAmount(p.total) - parseAmount(p.paidAmount));
            }
            return sum + parseAmount(p.pendingAmount);
        }, 0);
        
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
        const totalExpenses = data.reduce((sum, e) => sum + parseAmount(e.amount), 0);
        const totalAdvance = data.reduce((sum, e) => sum + parseAmount(e.advance), 0);
        const netExpenses = totalExpenses - totalAdvance;
        const txnCount = data.length;
        statsHTML = `
            <div class="stat-card" style="border-left-color: var(--danger-color)">
                <h3>Total Expenses</h3>
                <p class="stat-value">₹ ${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--warning-color)">
                <h3>Total Advance Given</h3>
                <p class="stat-value">₹ ${totalAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--primary-color)">
                <h3>Net Expenses</h3>
                <p class="stat-value">₹ ${netExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--secondary-color)">
                <h3>Total Transactions</h3>
                <p class="stat-value">${txnCount}</p>
            </div>
        `;
    } else if (module === 'inventory') {
        // Inventory Module Stats
        const totalProducts = data.length;
        const totalStock = data.reduce((sum, p) => sum + parseAmount(p.stock), 0);
        const invValue = data.reduce((sum, p) => sum + (parseAmount(p.stock) * parseAmount(p.price)), 0);
        const lowStock = data.filter(p => {
            const min = parseAmount(p.minStock);
            return min > 0 && parseAmount(p.stock) < min;
        }).length;
        statsHTML = `
            <div class="stat-card" style="border-left-color: var(--primary-color)">
                <h3>Total Products</h3>
                <p class="stat-value">${totalProducts}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--success-color)">
                <h3>Total Stock</h3>
                <p class="stat-value">${totalStock}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--secondary-color)">
                <h3>Inventory Value</h3>
                <p class="stat-value">₹ ${invValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--warning-color)">
                <h3>Low Stock</h3>
                <p class="stat-value">${lowStock}</p>
            </div>
        `;
    } else if (module === 'customers') {
        // Customers Module Stats
        const totalCustomers = data.length;
        const withGst = data.filter(c => (c.gstin || '').trim()).length;
        const receivables = state.sales.reduce((sum, s) => {
            if (s.status !== 'Paid') return sum + ((parseFloat(s.total) || 0) - (parseFloat(s.receivedAmount) || 0));
            return sum;
        }, 0);
        statsHTML = `
            <div class="stat-card" style="border-left-color: var(--primary-color)">
                <h3>Total Customers</h3>
                <p class="stat-value">${totalCustomers}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--success-color)">
                <h3>With GST</h3>
                <p class="stat-value">${withGst}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--danger-color)">
                <h3>Total Receivables</h3>
                <p class="stat-value">₹ ${receivables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        `;
    } else if (module === 'suppliers') {
        // Suppliers Module Stats
        const totalSuppliers = data.length;
        const withGst = data.filter(s => (s.gstin || '').trim()).length;
        const payables = state.purchases.reduce((sum, p) => {
            if (p.status !== 'Paid') return sum + ((parseFloat(p.total) || 0) - (parseFloat(p.paidAmount) || 0));
            return sum;
        }, 0);
        statsHTML = `
            <div class="stat-card" style="border-left-color: var(--primary-color)">
                <h3>Total Suppliers</h3>
                <p class="stat-value">${totalSuppliers}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--success-color)">
                <h3>With GST</h3>
                <p class="stat-value">${withGst}</p>
            </div>
            <div class="stat-card" style="border-left-color: var(--danger-color)">
                <h3>Total Payables</h3>
                <p class="stat-value">₹ ${payables.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        `;
    }
    
    statsContainer.innerHTML = statsHTML;
}

window.updateSaleStatus = async (id, newStatus) => {
    try {
        const saleIndex = state.sales.findIndex(s => s.id === id);
        if (saleIndex === -1) return;

        // Persist to PouchDB first to make sure database is the source of truth
        const doc = await db.sales.get(id);
        const result = await db.sales.put({ ...doc, status: newStatus });
        
        // Update in-memory state with the new rev to keep listener happy
        state.sales[saleIndex] = { ...state.sales[saleIndex], status: newStatus, _rev: result.rev };

        // Re-render list and update dashboard stats immediately
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

        // Persist to PouchDB first
        const doc = await db.purchases.get(id);
        const result = await db.purchases.put({ ...doc, status: newStatus });
        
        // Update in-memory state with the new rev
        state.purchases[purIndex] = { ...state.purchases[purIndex], status: newStatus, _rev: result.rev };

        // Re-render list and update dashboard stats immediately
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
        if (view === 'dashboard') applyDashboardFilters();
        if (view === 'sales') applyModuleFilters('sales');
        if (view === 'inventory') renderInventory();
        if (view === 'purchases') applyModuleFilters('pur');
        if (view === 'customers') renderCustomers();
        if (view === 'suppliers') renderSuppliers();
        if (view === 'expenses') applyModuleFilters('exp');
        if (view === 'purchase-invoices') applyModuleFilters('pinv');
        if (view === 'sale-invoices') applyModuleFilters('sinv');
        if (view === 'profile') renderProfileForm();
        if (view === 'users') fetchUsers();
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
    if (!list) return;
    const searchTerm = (state.filters.sales || '').toLowerCase();

    const rows = Array.isArray(data) ? data : (Array.isArray(state.sales) ? state.sales : []);
    const filteredSales = rows.filter(sale => {
        if (!sale) return false;
        if (!searchTerm) return true;
        const has = (v) => String(v || '').toLowerCase().includes(searchTerm);
        return has(sale.id) || has(sale.customer) || has(sale.status);
    });

    list.innerHTML = filteredSales.map(sale => {
        const total = parseAmount(sale.total);
        const received = parseAmount(sale.receivedAmount);
        const pending = sale.pendingAmount !== undefined && sale.pendingAmount !== null && sale.pendingAmount !== ''
            ? parseAmount(sale.pendingAmount)
            : total - received;
        const status = sale.status || 'Pending';
        return `
        <tr>
            <td data-label="Invoice #">${sale.id || '-'}</td>
            <td data-label="Date">${sale.date || '-'}</td>
            <td data-label="Customer">${sale.customer || '-'}</td>
            <td data-label="Total">₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Received">₹ ${received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Pending">₹ ${pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Status">
                <select class="status-pill status-${status.toLowerCase()}" onchange="updateSaleStatus('${sale.id}', this.value)" style="border: none; cursor: pointer; outline: none;">
                    <option value="Paid" ${status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Overdue" ${status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                </select>
            </td>
            <td data-label="Actions" class="row-actions">
                ${sale.attachment ? `<button class="action-btn" onclick="viewSaleAttachment('${sale.id}')" title="View Document"><i class="fas fa-paperclip"></i></button>` : ''}
                <button class="action-btn" onclick="viewSale('${sale.id}')" title="View/Print PDF Invoice"><i class="fas fa-file-pdf"></i></button>
                <button class="action-btn" onclick="exportSaleToWord('${sale.id}')" title="Export to Word (.docx)" style="color: #2563eb;"><i class="fas fa-file-word"></i></button>
                <button class="action-btn" onclick="exportSaleToExcelInvoice('${sale.id}')" title="Export to Excel (.xlsx)" style="color: #16a34a;"><i class="fas fa-file-excel"></i></button>
                <button class="action-btn" onclick="openEditSaleModal('${sale.id}')" title="Edit Sale"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deleteSale('${sale.id}')" title="Delete Sale"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
    }).join('');
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(list);
    }
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
    if (!list) return;
    const searchTerm = (state.filters.inventory || '').toLowerCase();
    updateModuleStats('inventory', state.inventory);

    const filteredItems = (Array.isArray(state.inventory) ? state.inventory : []).filter(item => {
        if (!item) return false;
        if (!searchTerm) return true;
        const has = (v) => String(v || '').toLowerCase().includes(searchTerm);
        return has(item.name) || has(item.sku) || has(item.category);
    });

    list.innerHTML = filteredItems.map(item => {
        const stock = parseAmount(item.stock);
        const minStock = parseAmount(item.minStock);
        const price = parseAmount(item.price);
        const isLow = minStock > 0 && stock < minStock;
        return `
        <tr class="${isLow ? 'low-stock-row' : ''}">
            <td data-label="Product">${item.name || '-'}</td>
            <td data-label="SKU">${item.sku || '-'}</td>
            <td data-label="Stock Level" class="${isLow ? 'text-danger' : ''}">
                ${stock} 
                ${isLow ? '<i class="fas fa-exclamation-triangle" title="Below Minimum Stock"></i>' : ''}
            </td>
            <td data-label="Price">₹ ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Category">${item.category || '-'}</td>
            <td data-label="Min Stock" style="font-size: 0.85em; color: var(--text-light);">${minStock}</td>
            <td data-label="Actions" class="row-actions">
                <button class="action-btn" onclick="openEditItemModal('${item.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteItem('${item.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
    }).join('');
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(list);
    }
}

function renderPurchases(data) {
    const list = document.getElementById('purchases-list');
    if (!list) return;
    const searchTerm = (state.filters.purchases || '').toLowerCase();

    const rows = Array.isArray(data) ? data : (Array.isArray(state.purchases) ? state.purchases : []);
    const filteredPurchases = rows.filter(pur => {
        if (!pur) return false;
        if (!searchTerm) return true;
        const has = (v) => String(v || '').toLowerCase().includes(searchTerm);
        return has(pur.id) || has(pur.supplier) || has(pur.status);
    });

    list.innerHTML = filteredPurchases.map(pur => {
        const total = parseAmount(pur.total);
        const paid = parseAmount(pur.paidAmount);
        const pending = pur.pendingAmount !== undefined && pur.pendingAmount !== null && pur.pendingAmount !== ''
            ? parseAmount(pur.pendingAmount)
            : total - paid;
        const status = pur.status || 'Pending';
        return `
        <tr>
            <td data-label="Order #">${pur.id || '-'}</td>
            <td data-label="Date">${pur.date || '-'}</td>
            <td data-label="Supplier">${pur.supplier || '-'}</td>
            <td data-label="Total">₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Paid">₹ ${paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Pending">₹ ${pending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Status">
                <select class="status-pill status-${status.toLowerCase()}" onchange="updatePurchaseStatus('${pur.id}', this.value)" style="border: none; cursor: pointer; outline: none;">
                    <option value="Paid" ${status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Overdue" ${status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                </select>
            </td>
            <td data-label="Actions" class="row-actions">
                ${pur.attachment ? `<button class="action-btn" onclick="viewPurchaseAttachment('${pur.id}')" title="View Document"><i class="fas fa-paperclip"></i></button>` : ''}
                <button class="action-btn" onclick="viewPurchase('${pur.id}')" title="View/Print PDF Bill"><i class="fas fa-file-pdf"></i></button>
                <button class="action-btn" onclick="exportPurchaseToWord('${pur.id}')" title="Export to Word (.docx)" style="color: #2563eb;"><i class="fas fa-file-word"></i></button>
                <button class="action-btn" onclick="exportPurchaseToExcelInvoice('${pur.id}')" title="Export to Excel (.xlsx)" style="color: #16a34a;"><i class="fas fa-file-excel"></i></button>
                <button class="action-btn" onclick="openEditPurchaseModal('${pur.id}')" title="Edit Purchase"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deletePurchase('${pur.id}')" title="Delete Purchase"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
    }).join('');
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(list);
    }
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
    if (!list) return;
    const searchTerm = (state.filters.customers || '').toLowerCase();
    updateModuleStats('customers', state.customers);

    const filtered = (Array.isArray(state.customers) ? state.customers : []).filter(c => {
        if (!c) return false;
        if (!searchTerm) return true;
        const has = (v) => String(v || '').toLowerCase().includes(searchTerm);
        return has(c.name) || has(c.phone) || has(c.gstin);
    });

    list.innerHTML = filtered.map(c => `
        <tr>
            <td data-label="Name">${c.name || '-'}</td>
            <td data-label="GSTIN" style="font-family: monospace; font-size: 0.9em;">${c.gstin || '-'}</td>
            <td data-label="Phone">${c.phone || '-'}</td>
            <td data-label="Email">${c.email || '-'}</td>
            <td data-label="Address">${c.address || '-'}</td>
            <td data-label="Actions" class="row-actions">
                <button class="action-btn" onclick="openEditCustomerModal('${c.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderSuppliers() {
    const list = document.getElementById('suppliers-list');
    if (!list) return;
    const searchTerm = (state.filters.suppliers || '').toLowerCase();
    updateModuleStats('suppliers', state.suppliers);

    const filtered = (Array.isArray(state.suppliers) ? state.suppliers : []).filter(s => {
        if (!s) return false;
        if (!searchTerm) return true;
        const has = (v) => String(v || '').toLowerCase().includes(searchTerm);
        return has(s.name) || has(s.phone) || has(s.gstin);
    });

    list.innerHTML = filtered.map(s => `
        <tr>
            <td data-label="Name">${s.name || '-'}</td>
            <td data-label="GSTIN" style="font-family: monospace; font-size: 0.9em;">${s.gstin || '-'}</td>
            <td data-label="Phone">${s.phone || '-'}</td>
            <td data-label="Email">${s.email || '-'}</td>
            <td data-label="Address">${s.address || '-'}</td>
            <td data-label="Actions" class="row-actions">
                <button class="action-btn" onclick="openEditSupplierModal('${s.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteSupplier('${s.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderExpenses(data) {
    const list = document.getElementById('expenses-list');
    if (!list) return;
    const searchTerm = (state.filters.expenses || '').toLowerCase();

    const rows = Array.isArray(data) ? data : (Array.isArray(state.expenses) ? state.expenses : []);
    const filtered = rows.filter(e => {
        if (!e) return false;
        if (!searchTerm) return true;
        const has = (v) => String(v || '').toLowerCase().includes(searchTerm);
        return has(e.category) || has(e.description) || has(e.employeeName) || has(e.paymentBy);
    });

    list.innerHTML = filtered.map(e => {
        const amount = parseAmount(e.amount);
        const advance = parseAmount(e.advance);
        return `
        <tr>
            <td data-label="Date">${e.date || '-'}</td>
            <td data-label="Category">${e.category || '-'}</td>
            <td data-label="Description">${e.description || '-'}</td>
            <td data-label="Employee">${e.employeeName || '-'}</td>
            <td data-label="Payment By">${e.paymentBy || '-'}</td>
            <td data-label="Advance">₹ ${advance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Amount">₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td data-label="Actions" class="row-actions">
                <button class="action-btn" onclick="openEditExpenseModal('${e.id}')" title="Edit Expense"><i class="fas fa-edit"></i></button>
                <button class="action-btn" onclick="deleteExpense('${e.id}')" title="Delete Expense"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `;
    }).join('');
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(list);
    }
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
                <button class="action-btn" onclick="viewPurchase('${inv.id}')" title="View/Print PDF"><i class="fas fa-eye"></i></button>
                <button class="action-btn" onclick="exportPurchaseToWord('${inv.id}')" title="Export to Word (.docx)" style="color: #2563eb;"><i class="fas fa-file-word"></i></button>
                <button class="action-btn" onclick="exportPurchaseToExcelInvoice('${inv.id}')" title="Export to Excel (.xlsx)" style="color: #16a34a;"><i class="fas fa-file-excel"></i></button>
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
                <button class="action-btn" onclick="viewSale('${inv.id}')" title="View/Print PDF"><i class="fas fa-eye"></i></button>
                <button class="action-btn" onclick="exportSaleToWord('${inv.id}')" title="Export to Word (.docx)" style="color: #2563eb;"><i class="fas fa-file-word"></i></button>
                <button class="action-btn" onclick="exportSaleToExcelInvoice('${inv.id}')" title="Export to Excel (.xlsx)" style="color: #16a34a;"><i class="fas fa-file-excel"></i></button>
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

// ─── Modern Truncated & Responsive Dropdown Options Helpers ───
window.getProductSelectOptions = (selectedVal = '') => {
    if (!state.inventory || !Array.isArray(state.inventory)) return '';
    return state.inventory.map(p => {
        const isSel = selectedVal && (String(p.id) === String(selectedVal) || p.name === selectedVal || (p.sku && p.sku === selectedVal));
        const fullName = p.name || 'Unnamed Product';
        const maxLen = 48;
        const shortName = fullName.length > maxLen ? fullName.substring(0, maxLen - 3) + '...' : fullName;
        const display = p.sku ? `[${p.sku}] ${shortName}` : shortName;
        const safeTitle = fullName.replace(/"/g, '&quot;');
        return `<option value="${p.id}" title="${safeTitle}" ${isSel ? 'selected' : ''}>${display}</option>`;
    }).join('');
};

window.getCustomerSelectOptions = (selectedVal = '') => {
    if (!state.customers || !Array.isArray(state.customers)) return '';
    return state.customers.map(c => {
        const isSel = selectedVal && (String(c.id) === String(selectedVal) || c.name === selectedVal);
        const fullName = c.name || 'Unnamed Customer';
        const maxLen = 45;
        const shortName = fullName.length > maxLen ? fullName.substring(0, maxLen - 3) + '...' : fullName;
        const safeTitle = fullName.replace(/"/g, '&quot;');
        return `<option value="${c.id}" title="${safeTitle}" ${isSel ? 'selected' : ''}>${shortName}</option>`;
    }).join('');
};

window.getCustomerShipToSelectOptions = (selectedVal = '') => {
    if (!state.customers || !Array.isArray(state.customers)) return '';
    return state.customers.map(c => {
        const isSel = selectedVal && (String(c.id) === String(selectedVal) || c.name === selectedVal);
        const addr = [c.address, c.state].filter(Boolean).join(', ');
        const fullName = c.name + (addr ? ` — ${addr}` : '');
        const maxLen = 50;
        const shortName = fullName.length > maxLen ? fullName.substring(0, maxLen - 3) + '...' : fullName;
        const safeTitle = fullName.replace(/"/g, '&quot;');
        return `<option value="${c.id}" title="${safeTitle}" ${isSel ? 'selected' : ''}>${shortName}</option>`;
    }).join('');
};

window.getSupplierSelectOptions = (selectedVal = '') => {
    if (!state.suppliers || !Array.isArray(state.suppliers)) return '';
    return state.suppliers.map(s => {
        const isSel = selectedVal && (String(s.id) === String(selectedVal) || s.name === selectedVal);
        const fullName = s.name || 'Unnamed Supplier';
        const maxLen = 45;
        const shortName = fullName.length > maxLen ? fullName.substring(0, maxLen - 3) + '...' : fullName;
        const safeTitle = fullName.replace(/"/g, '&quot;');
        return `<option value="${s.id}" title="${safeTitle}" ${isSel ? 'selected' : ''}>${shortName}</option>`;
    }).join('');
};

window.openNewSaleModal = () => {
    const customerOptions = getCustomerSelectOptions();
    const shipToOptions = getCustomerShipToSelectOptions();
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
                    <label>Bill Type</label>
                    <select id="sale-bill-type" onchange="calculateSaleTotals()" required>
                        <option value="GST Bill">GST Bill</option>
                        <option value="Non-GST Bill">Non-GST Bill</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Ship To Customer <span class="label-optional">(Optional)</span></label>
                    <select id="sale-ship-to-select" onchange="handleSaleShipToSelectChange()">
                        <option value="">— Select to auto-fill —</option>
                        <option value="same_as_billing">Same as Billing Customer</option>
                        ${shipToOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Shipping Address <span class="label-optional">(displayed in invoice only when filled)</span></label>
                    <input type="text" id="sale-ship-to" placeholder="Name, address, city, state...">
                </div>
            </div>
            <div class="form-row form-row-3">
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
                <div class="form-group">
                    <label>Status</label>
                    <select id="sale-status">
                        <option value="Paid">Paid</option>
                        <option value="Pending" selected>Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Received Amount (₹)</label>
                    <input type="number" id="sale-received-amount" step="0.01" value="0.00" oninput="calculateSaleTotals()">
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
            <div class="modal-items-footer">
                <button type="button" class="btn-primary" style="width: auto;" onclick="addSaleItemRow()">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                <div class="totals-section">
                    <div><span>Subtotal:</span> <span id="sale-subtotal">₹ 0.00</span></div>
                    <div><span>Tax Total:</span> <span id="sale-tax-total">₹ 0.00</span></div>
                    <div class="grand-total"><span>Grand Total:</span> <span id="sale-grand-total">₹ 0.00</span></div>
                </div>
            </div>
            <div class="form-group">
                <label>Order Completion Document (PDF/JPG Optional)</label>
                <input type="file" id="sale-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
            </div>
            <div class="modal-form-actions">
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
    const productOptions = getProductSelectOptions();
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
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(tr);
    }
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
    const billType = document.getElementById('sale-bill-type')?.value || 'GST Bill';
    const gstTypeSelect = document.getElementById('sale-gst-type');
    const gstType = gstTypeSelect?.value || 'Local';
    
    if (gstTypeSelect) {
        gstTypeSelect.disabled = (billType === 'Non-GST Bill');
        if (window.ModernDropdown && window.ModernDropdown.sync) {
            window.ModernDropdown.sync(gstTypeSelect);
        }
    }
    
    const headerRow = document.querySelector('.sale-items-table thead tr');
    
    if (headerRow) {
        if (billType === 'Non-GST Bill') {
            headerRow.innerHTML = `
                <th width="300">Product</th>
                <th width="120">HSN/SAC</th>
                <th width="100">Qty</th>
                <th width="130">Price</th>
                <th width="140">Total</th>
                <th width="50"></th>
            `;
        } else if (gstType === 'Local') {
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
        let totalTaxRate = 0;
        
        if (billType === 'GST Bill') {
            totalTaxRate = parseFloat(row.querySelector('.item-tax')?.dataset?.totalTax || 0);
        }
        
        const lineSubtotal = qty * price;
        const lineTax = billType === 'GST Bill' ? lineSubtotal * (totalTaxRate / 100) : 0;
        
        // Update row display
        if (billType === 'Non-GST Bill') {
            const taxCell = row.querySelector('.item-tax-cell');
            if (taxCell) taxCell.innerHTML = '';
            const sgstCell = row.querySelector('.item-tax-sgst-cell');
            if (sgstCell) sgstCell.remove();
        } else if (gstType === 'Local') {
            const halfTax = (totalTaxRate / 2).toFixed(2);
            const taxCell = row.querySelector('.item-tax-cell');
            if (taxCell) {
                taxCell.innerHTML = `
                    <input type="number" class="item-tax" data-total-tax="${totalTaxRate}" value="${halfTax}" readonly>
                `;
            }
            // Add second tax cell if missing
            if (!row.querySelector('.item-tax-sgst-cell')) {
                const td = document.createElement('td');
                td.className = 'item-tax-sgst-cell';
                td.innerHTML = `<input type="number" class="item-tax-sgst" value="${halfTax}" readonly>`;
                row.insertBefore(td, row.querySelector('.item-total').parentElement);
            } else {
                row.querySelector('.item-tax-sgst').value = halfTax;
            }
        } else {
            const taxCell = row.querySelector('.item-tax-cell');
            if (taxCell) {
                taxCell.innerHTML = `
                    <input type="number" class="item-tax" data-total-tax="${totalTaxRate}" value="${totalTaxRate}" readonly>
                `;
            }
            const sgstCell = row.querySelector('.item-tax-sgst-cell');
            if (sgstCell) sgstCell.remove();
        }

        row.querySelector('.item-total').value = (lineSubtotal + lineTax).toFixed(2);
        subtotal += lineSubtotal;
        taxTotal += lineTax;
    });

    document.getElementById('sale-subtotal').textContent = `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    if (billType === 'Non-GST Bill') {
        document.getElementById('sale-tax-total').parentElement.style.display = 'none';
    } else {
        document.getElementById('sale-tax-total').parentElement.style.display = 'block';
        const taxLabel = gstType === 'Local' ? 'CGST + SGST' : 'IGST';
        document.getElementById('sale-tax-total').parentElement.firstChild.textContent = `${taxLabel} Total:`;
        document.getElementById('sale-tax-total').textContent = `₹ ${taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    
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
        const billType = document.getElementById('sale-bill-type').value;
        const gstType = document.getElementById('sale-gst-type').value;
        const paymentMode = document.getElementById('sale-payment-mode').value;
        const items = [];
        document.querySelectorAll('#sale-items-list tr').forEach(row => {
            const productId = row.querySelector('.item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.item-qty').value);
            
            // Safe access — tax input may not exist for Non-GST bills
            const taxInput = row.querySelector('.item-tax');
            const totalTaxRate = taxInput ? parseFloat(taxInput.dataset.totalTax || 0) : 0;

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
        const shipTo = document.getElementById('sale-ship-to') ? document.getElementById('sale-ship-to').value.trim() : '';
        const shipToCustomerId = document.getElementById('sale-ship-to-select') ? document.getElementById('sale-ship-to-select').value : '';

        const saleDoc = { 
            _id: invoiceNo,
            id: invoiceNo, 
            date, 
            customer: customer.name, 
            customerObj: customer,
            shipTo,
            shipToCustomerId,
            billType,
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
            await generateInvoicePDF(invoiceNo, date, customer, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, billType, 'Sales', paymentMode, shipTo);
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
        const billType = document.getElementById('sale-bill-type').value;
        const gstType = document.getElementById('sale-gst-type').value;
        const paymentMode = document.getElementById('sale-payment-mode').value;
        const items = [];
        
        document.querySelectorAll('#sale-items-list tr').forEach(row => {
            const productId = row.querySelector('.item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.item-qty').value);
            const taxInput = row.querySelector('.item-tax');
            const totalTaxRate = taxInput ? parseFloat(taxInput.dataset.totalTax || 0) : 0;

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
            const shipTo = document.getElementById('sale-ship-to') ? document.getElementById('sale-ship-to').value.trim() : '';
            const shipToCustomerId = document.getElementById('sale-ship-to-select') ? document.getElementById('sale-ship-to-select').value : '';

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
                shipTo,
                shipToCustomerId,
                billType,
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
                await generateInvoicePDF(invoiceNo, date, customer, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, billType, 'Sales', paymentMode, shipTo);
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

    const customerOptions = getCustomerSelectOptions(sale.customer);
    const shipToOptions = getCustomerShipToSelectOptions(sale.shipToCustomerId);
    
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
                    <label>Bill Type</label>
                    <select id="sale-bill-type" onchange="calculateSaleTotals()" required>
                        <option value="GST Bill" ${sale.billType === 'GST Bill' || !sale.billType ? 'selected' : ''}>GST Bill</option>
                        <option value="Non-GST Bill" ${sale.billType === 'Non-GST Bill' ? 'selected' : ''}>Non-GST Bill</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Ship To Customer <span class="label-optional">(Optional)</span></label>
                    <select id="sale-ship-to-select" onchange="handleSaleShipToSelectChange()">
                        <option value="">— Select to auto-fill —</option>
                        <option value="same_as_billing">Same as Billing Customer</option>
                        ${shipToOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Shipping Address <span class="label-optional">(displayed in invoice only when filled)</span></label>
                    <input type="text" id="sale-ship-to" placeholder="Name, address, city, state..." value="${sale.shipTo ? sale.shipTo.replace(/"/g, '&quot;') : ''}">
                </div>
            </div>
            <div class="form-row form-row-3">
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
                <div class="form-group">
                    <label>Status</label>
                    <select id="sale-status">
                        <option value="Paid" ${sale.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Pending" ${sale.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Overdue" ${sale.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Received Amount (₹)</label>
                    <input type="number" id="sale-received-amount" step="0.01" value="${sale.receivedAmount || 0}" oninput="calculateSaleTotals()">
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
            <div class="modal-items-footer">
                <button type="button" class="btn-primary" style="width: auto;" onclick="addSaleItemRow()">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                <div class="totals-section">
                    <div><span>Subtotal:</span> <span id="sale-subtotal">₹ 0.00</span></div>
                    <div><span>Tax Total:</span> <span id="sale-tax-total">₹ 0.00</span></div>
                    <div class="grand-total"><span>Grand Total:</span> <span id="sale-grand-total">₹ 0.00</span></div>
                </div>
            </div>
            <div class="form-group">
                <label>Replace Order Completion Document (Optional)</label>
                <input type="file" id="sale-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
                ${sale.attachment ? '<small style="color:var(--text-muted);display:block;margin-top:4px;">Currently attached. Uploading new will overwrite.</small>' : ''}
            </div>
            <div class="modal-form-actions">
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
    const productOptions = getProductSelectOptions(item.name);
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
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(tr);
    }
};



window.viewSale = async (id) => {
    const sale = state.sales.find(s => s.id === id);
    if (!sale) {
        showToast('Sale not found', 'error');
        return;
    }
    
    if (sale.customerObj && sale.items) {
        await generateInvoicePDF(sale.id, sale.date, sale.customerObj, sale.items, sale.subtotal, sale.tax, sale.total, sale.gstType || 'Local', sale.billType || 'GST Bill', 'Sales', sale.paymentMode || '', sale.shipTo || '');
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
        await generateInvoicePDF(pur.id, pur.date, pur.supplierObj, pur.items, pur.subtotal, pur.tax, pur.total, pur.gstType || 'Local', pur.billType || 'GST Bill', 'Purchases', pur.paymentMode || '', pur.shipTo || '');
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

async function generateInvoicePDF(no, date, party, items, subtotal, tax, grandTotal, gstType = 'Local', billType = 'GST Bill', type = 'Sales', paymentMode = '', shipTo = '') {
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
    if (billType === 'Non-GST Bill') {
        document.querySelector('.gst-invoice-title').textContent = isPurchase ? 'Purchase Bill' : 'Invoice';
    } else {
        document.querySelector('.gst-invoice-title').textContent = isPurchase ? 'Purchase Bill' : 'Tax Invoice';
    }
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
    
    const websiteEl = document.getElementById('gst-company-website');
    if (websiteEl) {
        if (comp.website && comp.website.trim()) {
            websiteEl.textContent = `Website: ${comp.website.trim()}`;
            websiteEl.style.display = 'block';
        } else {
            websiteEl.style.display = 'none';
        }
    }
    
    if (billType === 'Non-GST Bill') {
        document.getElementById('gst-company-gstin').parentElement.style.display = 'none';
    } else {
        document.getElementById('gst-company-gstin').parentElement.style.display = 'block';
        document.getElementById('gst-company-gstin').textContent = comp.gstin || '';
    }
    document.getElementById('gst-company-state').textContent = comp.state || '';

    // Meta
    document.getElementById('gst-inv-no').textContent = no;
    document.getElementById('gst-inv-date').textContent = date;
    
    // Place of Supply
    const supplyState = party.state || (isPurchase ? comp.state : (party.address.split(',').pop() || comp.state));
    document.getElementById('gst-inv-supply').textContent = supplyState;
    
    // Billing logic
    if (isPurchase) {
        document.getElementById('gst-bill-name').textContent = party.name;
        document.getElementById('gst-bill-address').innerHTML = party.address.replace(/\n/g, '<br>');
        document.getElementById('gst-bill-gstin').textContent = party.gstin || 'N/A';
        document.getElementById('gst-bill-state').textContent = party.state || 'N/A';

        // Hide bank details for purchase bill (since it's their bank, not ours)
        document.querySelector('.gst-bank-details').style.visibility = 'hidden';
    } else {
        // We are selling TO the customer
        document.getElementById('gst-bill-name').textContent = party.name;
        document.getElementById('gst-bill-address').innerHTML = party.address.replace(/\n/g, '<br>');
        document.getElementById('gst-bill-gstin').textContent = party.gstin || 'N/A';
        document.getElementById('gst-bill-state').textContent = party.state || 'N/A';

        document.querySelector('.gst-bank-details').style.visibility = 'visible';
    }
    
    // Shipping logic: Ship To section is optional and displayed ONLY when user enters shipping details.
    // If no shipping details entered, the Ship To section does not appear in the invoice.
    // Applied to BOTH Sales and Purchase invoices.
    const shipToSection = document.getElementById('gst-ship-to-section') || document.querySelector('.gst-ship-to');
    if (shipTo && shipTo.trim()) {
        if (shipToSection) shipToSection.style.display = 'block';
        const shipVal = shipTo.trim();
        const lines = shipVal.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length > 1) {
            document.getElementById('gst-ship-name').textContent = lines[0];
            document.getElementById('gst-ship-name').style.display = 'block';
            document.getElementById('gst-ship-address').innerHTML = lines.slice(1).join('<br>');
            document.getElementById('gst-ship-address').style.display = 'block';
        } else if (shipVal.includes(',')) {
            const firstComma = shipVal.indexOf(',');
            document.getElementById('gst-ship-name').textContent = shipVal.substring(0, firstComma).trim();
            document.getElementById('gst-ship-name').style.display = 'block';
            document.getElementById('gst-ship-address').innerHTML = shipVal.substring(firstComma + 1).split(',').map(s => s.trim()).filter(Boolean).join('<br>');
            document.getElementById('gst-ship-address').style.display = 'block';
        } else {
            document.getElementById('gst-ship-name').textContent = shipVal;
            document.getElementById('gst-ship-name').style.display = 'block';
            document.getElementById('gst-ship-address').innerHTML = '';
            document.getElementById('gst-ship-address').style.display = 'none';
        }
    } else {
        if (shipToSection) shipToSection.style.display = 'none';
    }
    
    // If Non-GST, hide GSTIN from billing as well
    if (billType === 'Non-GST Bill') {
        document.getElementById('gst-bill-gstin').parentElement.style.display = 'none';
    } else {
        document.getElementById('gst-bill-gstin').parentElement.style.display = 'block';
    }
    
    // Items Table Header
    const tableHeader = document.querySelector('.gst-items-table thead tr');
    if (billType === 'Non-GST Bill') {
        tableHeader.innerHTML = `
            <th width="5%">#</th>
            <th width="45%">Description of Goods</th>
            <th width="15%">HSN/SAC</th>
            <th width="10%">Qty</th>
            <th width="10%">Rate</th>
            <th width="15%">Amount</th>
        `;
    } else if (gstType === 'Local') {
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
        if (billType === 'Non-GST Bill') {
            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.hsn}</td>
                    <td>${item.qty}</td>
                    <td>₹ ${parseFloat(item.price).toLocaleString()}</td>
                    <td>₹ ${parseFloat(item.total).toLocaleString()}</td>
                </tr>
            `;
        } else if (gstType === 'Local') {
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
    if (billType === 'Non-GST Bill') {
        totalsContainer.innerHTML = `
            <div class="gst-amounts-label">Amounts</div>
            <div class="gst-amount-row"><span>Sub Total</span> <span id="gst-subtotal">₹ ${parseFloat(subtotal).toLocaleString()}</span></div>
            <div class="gst-total-row"><span>Total</span> <span id="gst-grand-total">₹ ${amountVal.toLocaleString()}</span></div>
        `;
    } else if (gstType === 'Local') {
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

    // Update the Tax Details panel dynamically
    const taxDetailsCol = document.querySelector('.gst-tax-details-col');
    if (taxDetailsCol) {
        if (billType === 'Non-GST Bill') {
            taxDetailsCol.style.display = 'none';
        } else {
            taxDetailsCol.style.display = 'block';
            // Compute unique tax rates from items
            const taxMap = {};
            items.forEach(item => {
                const rate = parseFloat(item.tax) || 0;
                if (rate > 0) {
                    if (!taxMap[rate]) taxMap[rate] = 0;
                    const lineAmt = (parseFloat(item.qty) * parseFloat(item.price));
                    taxMap[rate] += lineAmt * rate / 100;
                }
            });
            const taxLines = Object.entries(taxMap).map(([rate, amt]) => {
                if (gstType === 'Local') {
                    const half = (parseFloat(rate) / 2).toFixed(1);
                    return `<div style="margin-bottom:4px;"><strong>${rate}% GST</strong> (CGST ${half}% + SGST ${half}%): ₹${amt.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>`;
                } else {
                    return `<div style="margin-bottom:4px;"><strong>IGST ${rate}%</strong>: ₹${amt.toLocaleString('en-IN', {minimumFractionDigits:2})}</div>`;
                }
            }).join('');
            taxDetailsCol.innerHTML = `<div class="gst-tax-label">Tax Details</div>${taxLines || '<div style="color:#64748b;">No tax applied</div>'}`;
        }
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
    
    // Terms & Conditions
    const termsSection = document.getElementById('gst-terms-section');
    if (comp.terms && comp.terms.trim()) {
        document.getElementById('gst-company-terms').textContent = comp.terms;
        if (termsSection) termsSection.style.display = 'block';
    } else {
        if (termsSection) termsSection.style.display = 'none';
    }
    
    // Footer
    document.getElementById('gst-bank-name').textContent = `Name : ${comp.bankName || ''}`;
    const branchEl = document.getElementById('gst-bank-branch');
    if (branchEl) {
        if (comp.branchAddress && comp.branchAddress.trim()) {
            branchEl.textContent = `Branch Address : ${comp.branchAddress.trim()}`;
            branchEl.style.display = 'block';
        } else {
            branchEl.style.display = 'none';
        }
    }
    document.getElementById('gst-bank-acc').textContent = `Account No. : ${comp.accountNo || ''}`;
    document.getElementById('gst-bank-ifsc').textContent = `IFSC code : ${comp.ifscCode || ''}`;
    document.getElementById('gst-bank-holder').textContent = `Account holder's name : ${comp.accountHolder || ''}`;
    document.getElementById('gst-sig-label').textContent = isPurchase ? `For : ${party.name}` : `For : ${comp.legalName}`;

    // Handle QR Code — hide entirely if no QR uploaded
    const qrSection = document.getElementById('gst-qr-section');
    if (comp.qrUrl) {
        document.getElementById('gst-bank-qr-img').src = comp.qrUrl;
        document.getElementById('gst-bank-qr-img').style.display = 'inline-block';
        document.getElementById('gst-bank-qr-icon').style.display = 'none';
        if (qrSection) qrSection.style.display = 'flex';
    } else {
        // No QR uploaded — hide the entire QR placeholder box
        if (qrSection) qrSection.style.display = 'none';
    }

    // Handle Signature — hide mock if no sig uploaded
    const sigMock = document.getElementById('gst-sig-mock');
    const sigImg = document.getElementById('gst-sig-img');
    if (comp.sigUrl) {
        sigImg.src = comp.sigUrl;
        sigImg.style.display = 'inline-block';
        if (sigMock) sigMock.style.display = 'none';
    } else {
        sigImg.style.display = 'none';
        // Hide the mock signature — show blank space instead
        if (sigMock) sigMock.style.display = 'none';
    }

    const element = document.querySelector('.gst-invoice-container');
    const template = document.getElementById('invoice-template');
    template.classList.remove('hidden');
    try {
        await html2pdf().set({ 
            margin: [8, 8, 8, 8],
            filename: `${isPurchase ? 'Purchase_Bill' : 'Invoice'}_${no}.pdf`, 
            image: { type: 'jpeg', quality: 0.98 }, 
            html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { 
                mode: ['css', 'legacy'], 
                avoid: ['tr', '.gst-header-section', '.gst-bill-ship-row', '.gst-tax-summary-row', '.gst-payment-info-row', '.gst-terms-section', '.gst-footer-section'] 
            }
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
    const supplierOptions = getSupplierSelectOptions();
    const shipToOptions = getCustomerShipToSelectOptions();
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
                    <label>Bill Type</label>
                    <select id="pur-bill-type" onchange="calculatePurchaseTotals()" required>
                        <option value="GST Bill">GST Bill</option>
                        <option value="Non-GST Bill">Non-GST Bill</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Ship To Customer <span class="label-optional">(Optional)</span></label>
                    <select id="pur-ship-to-select" onchange="handlePurchaseShipToSelectChange()">
                        <option value="">— Select to auto-fill —</option>
                        <option value="company_address">Our Company Address (Default)</option>
                        ${shipToOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Shipping Address <span class="label-optional">(displayed in invoice only when filled)</span></label>
                    <input type="text" id="pur-ship-to" placeholder="Name, address, city, state...">
                </div>
            </div>
            <div class="form-row form-row-3">
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
                <div class="form-group">
                    <label>Status</label>
                    <select id="pur-status">
                        <option value="Paid">Paid</option>
                        <option value="Pending" selected>Pending</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Paid Amount (₹)</label>
                    <input type="number" id="pur-paid-amount" step="0.01" value="0.00" oninput="calculatePurchaseTotals()">
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
            <div class="modal-items-footer">
                <button type="button" class="btn-primary" style="width: auto;" onclick="addPurchaseItemRow()">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                <div class="totals-section">
                    <div><span>Sub Total:</span> <span id="pur-subtotal">₹ 0.00</span></div>
                    <div><span>Tax Total:</span> <span id="pur-tax-total">₹ 0.00</span></div>
                    <div class="grand-total"><span>Grand Total:</span> <span id="pur-grand-total">₹ 0.00</span></div>
                </div>
            </div>
            <div class="form-group">
                <label>Purchase Bill/Receipt Attachment (Optional)</label>
                <input type="file" id="pur-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
            </div>
            <div class="modal-form-actions">
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

    const supplierOptions = getSupplierSelectOptions(pur.supplierObj ? pur.supplierObj.id : pur.supplier);
    const shipToOptions = getCustomerShipToSelectOptions(pur.shipToCustomerId);

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
                    <label>Bill Type</label>
                    <select id="pur-bill-type" onchange="calculatePurchaseTotals()" required>
                        <option value="GST Bill" ${pur.billType === 'GST Bill' || !pur.billType ? 'selected' : ''}>GST Bill</option>
                        <option value="Non-GST Bill" ${pur.billType === 'Non-GST Bill' ? 'selected' : ''}>Non-GST Bill</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Ship To Customer <span class="label-optional">(Optional)</span></label>
                    <select id="pur-ship-to-select" onchange="handlePurchaseShipToSelectChange()">
                        <option value="">— Select to auto-fill —</option>
                        <option value="company_address">Our Company Address (Default)</option>
                        ${shipToOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Shipping Address <span class="label-optional">(displayed in invoice only when filled)</span></label>
                    <input type="text" id="pur-ship-to" placeholder="Name, address, city, state..." value="${pur.shipTo ? pur.shipTo.replace(/"/g, '&quot;') : ''}">
                </div>
            </div>
            <div class="form-row form-row-3">
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
                <div class="form-group">
                    <label>Status</label>
                    <select id="pur-status">
                        <option value="Paid" ${pur.status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Pending" ${pur.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Overdue" ${pur.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Paid Amount (₹)</label>
                    <input type="number" id="pur-paid-amount" step="0.01" value="${pur.paidAmount || 0}" oninput="calculatePurchaseTotals()">
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
            <div class="modal-items-footer">
                <button type="button" class="btn-primary" style="width: auto;" onclick="addPurchaseItemRow()">
                    <i class="fas fa-plus"></i> Add Item
                </button>
                <div class="totals-section">
                    <div><span>Sub Total:</span> <span id="pur-subtotal">₹ 0.00</span></div>
                    <div><span>Tax Total:</span> <span id="pur-tax-total">₹ 0.00</span></div>
                    <div class="grand-total"><span>Grand Total:</span> <span id="pur-grand-total">₹ 0.00</span></div>
                </div>
            </div>
            <div class="form-group">
                <label>Replace Bill/Receipt Attachment (Optional)</label>
                <input type="file" id="pur-attachment" accept="application/pdf,image/jpeg,image/jpg,image/png">
                ${pur.attachment ? '<small style="color:var(--text-muted);display:block;margin-top:4px;">Currently attached. Uploading new will overwrite.</small>' : ''}
            </div>
            <div class="modal-form-actions">
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
        const productOptions = getProductSelectOptions(item.code || item.name);
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
        if (window.ModernDropdown && window.ModernDropdown.init) {
            window.ModernDropdown.init(tr);
        }
    });

    calculatePurchaseTotals();
    document.getElementById('edit-purchase-form').addEventListener('submit', handlePurchaseUpdate);
};

window.addPurchaseItemRow = () => {
    const tbody = document.getElementById('pur-items-list');
    const rowId = Date.now() + Math.random();
    const productOptions = getProductSelectOptions();
    const tr = document.createElement('tr');
    tr.id = `pur-row-${rowId}`;
    tr.innerHTML = `
        <td width="300"><select class="pur-item-product" onchange="updatePurchaseRowDetails('${rowId}')" required><option value="">Select Product</option>${productOptions}</select></td>
        <td width="120"><input type="text" class="pur-item-hsn" placeholder="HSN/SAC"></td>
        <td width="100"><input type="number" class="pur-item-qty" value="1" min="1" oninput="calculatePurchaseTotals()" required></td>
        <td width="130"><input type="number" class="pur-item-cost" step="0.01" oninput="calculatePurchaseTotals()" required></td>
        <td class="item-tax-cell" width="110"><input type="number" class="pur-item-tax" data-total-tax="0" value="0" readonly></td>
        <td width="140"><input type="text" class="pur-item-total" readonly value="0.00"></td>
        <td width="50"><button type="button" class="action-btn" onclick="removePurchaseRow('${rowId}')"><i class="fas fa-times"></i></button></td>
    `;
    tbody.appendChild(tr);
    if (window.ModernDropdown && window.ModernDropdown.init) {
        window.ModernDropdown.init(tr);
    }
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
    const billType = document.getElementById('pur-bill-type')?.value || 'GST Bill';
    const gstTypeSelect = document.getElementById('pur-gst-type');
    const gstType = gstTypeSelect?.value || 'Local';
    
    if (gstTypeSelect) {
        gstTypeSelect.disabled = (billType === 'Non-GST Bill');
        if (window.ModernDropdown && window.ModernDropdown.sync) {
            window.ModernDropdown.sync(gstTypeSelect);
        }
    }
    
    const headerRow = document.querySelector('.pur-items-table thead tr');
    
    if (headerRow) {
        // Remove existing SGST header if present
        const existingSgstHeader = headerRow.querySelector('.pur-sgst-header');
        if (existingSgstHeader) existingSgstHeader.remove();

        if (billType === 'Non-GST Bill') {
            headerRow.innerHTML = `
                <th width="300">Product</th>
                <th width="120">HSN/SAC</th>
                <th width="100">Qty</th>
                <th width="130">Cost Price</th>
                <th width="140">Total</th>
                <th width="50"></th>
            `;
        } else if (gstType === 'Local') {
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
        let totalTaxRate = 0;
        
        if (billType === 'GST Bill') {
            totalTaxRate = parseFloat(row.querySelector('.pur-item-tax')?.dataset?.totalTax || 0);
        }
        
        const lineSubtotal = qty * price;
        const lineTax = billType === 'GST Bill' ? lineSubtotal * (totalTaxRate / 100) : 0;
        
        if (billType === 'Non-GST Bill') {
            const taxCell = row.querySelector('.pur-item-tax-cell');
            if (taxCell) taxCell.innerHTML = '';
            const sgstCell = row.querySelector('.pur-item-tax-sgst-cell');
            if (sgstCell) sgstCell.remove();
        } else if (gstType === 'Local') {
            const halfTax = (totalTaxRate / 2).toFixed(2);
            const taxCell = row.querySelector('.pur-item-tax-cell');
            if (taxCell) {
                taxCell.innerHTML = `
                    <input type="number" class="pur-item-tax" data-total-tax="${totalTaxRate}" value="${halfTax}" readonly>
                `;
            }
            if (!row.querySelector('.pur-item-tax-sgst-cell')) {
                const td = document.createElement('td');
                td.className = 'pur-item-tax-sgst-cell';
                td.innerHTML = `<input type="number" class="pur-item-tax-sgst" value="${halfTax}" readonly>`;
                row.insertBefore(td, row.querySelector('.pur-item-total').parentElement);
            } else {
                row.querySelector('.pur-item-tax-sgst').value = halfTax;
            }
        } else {
            const taxCell = row.querySelector('.pur-item-tax-cell');
            if (taxCell) {
                taxCell.innerHTML = `
                    <input type="number" class="pur-item-tax" data-total-tax="${totalTaxRate}" value="${totalTaxRate}" readonly>
                `;
            }
            const sgstCell = row.querySelector('.pur-item-tax-sgst-cell');
            if (sgstCell) sgstCell.remove();
        }

        row.querySelector('.pur-item-total').value = (lineSubtotal + lineTax).toFixed(2);
        subtotal += lineSubtotal;
        taxTotal += lineTax;
    });

    document.getElementById('pur-subtotal').textContent = `₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    
    if (billType === 'Non-GST Bill') {
        document.getElementById('pur-tax-total').parentElement.style.display = 'none';
    } else {
        document.getElementById('pur-tax-total').parentElement.style.display = 'block';
        const taxLabel = gstType === 'Local' ? 'CGST + SGST' : 'IGST';
        document.getElementById('pur-tax-total').parentElement.firstChild.textContent = `${taxLabel} Total:`;
        document.getElementById('pur-tax-total').textContent = `₹ ${taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }

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
        const billType = document.getElementById('pur-bill-type').value;
        const gstType = document.getElementById('pur-gst-type').value;
        const paymentMode = document.getElementById('pur-payment-mode').value;
        const purchaseId = document.getElementById('pur-order-no').value || getNextPurchaseNumber();
        
        const items = [];
        for (const row of document.querySelectorAll('#pur-items-list tr')) {
            const productId = row.querySelector('.pur-item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.pur-item-qty').value);
            const purTaxInput = row.querySelector('.pur-item-tax');
            const totalTaxRate = purTaxInput ? parseFloat(purTaxInput.dataset.totalTax || 0) : 0;

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
        const shipTo = document.getElementById('pur-ship-to') ? document.getElementById('pur-ship-to').value.trim() : '';
        const shipToCustomerId = document.getElementById('pur-ship-to-select') ? document.getElementById('pur-ship-to-select').value : '';

        const newPurchase = { 
            _id: purchaseId,
            id: purchaseId, 
            date, 
            supplier: supplier.name, 
            supplierObj: supplier,
            shipTo,
            shipToCustomerId,
            billType,
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
            await generateInvoicePDF(purchaseId, date, supplier, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, billType, 'Purchases', paymentMode, shipTo);
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
        const billType = document.getElementById('pur-bill-type').value;
        const gstType = document.getElementById('pur-gst-type').value;
        const paymentMode = document.getElementById('pur-payment-mode').value;
        
        const items = [];
        for (const row of document.querySelectorAll('#pur-items-list tr')) {
            const productId = row.querySelector('.pur-item-product').value;
            const product = state.inventory.find(p => p.id == productId);
            const qty = parseInt(row.querySelector('.pur-item-qty').value);
            const purTaxInput2 = row.querySelector('.pur-item-tax');
            const totalTaxRate = purTaxInput2 ? parseFloat(purTaxInput2.dataset.totalTax || 0) : 0;

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
            const shipTo = document.getElementById('pur-ship-to') ? document.getElementById('pur-ship-to').value.trim() : '';
            const shipToCustomerId = document.getElementById('pur-ship-to-select') ? document.getElementById('pur-ship-to-select').value : '';

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
                shipTo,
                shipToCustomerId,
                billType,
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
                await generateInvoicePDF(purchaseId, date, supplier, items, subtotalRaw, taxRaw, grandTotalRaw, gstType, billType, 'Purchases', paymentMode, shipTo);
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
        await generateInvoicePDF(pur.id, pur.date, pur.supplierObj, pur.items, pur.subtotal, pur.tax, pur.total, pur.gstType || 'Local', pur.billType || 'GST Bill', 'Purchases', pur.paymentMode || '', pur.shipTo || '');
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
            <div class="form-row">
                <div class="form-group">
                    <label>Category</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <select id="exp-cat" style="flex: 1;">
                            ${categoryOptions}
                        </select>
                        <button type="button" class="btn-secondary" style="width: 40px;" onclick="openAddCategoryModal()" title="Add Category"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="form-group"><label>Date</label><input type="date" id="exp-date" value="${new Date().toISOString().split('T')[0]}" required></div>
            </div>
            <div class="form-group"><label>Description</label><input type="text" id="exp-desc" placeholder="Expense description..." required></div>
            <div class="form-row">
                <div class="form-group"><label>Amount (₹)</label><input type="number" id="exp-amount" step="0.01" min="0" placeholder="0.00" required></div>
                <div class="form-group"><label>Advance Given (₹)</label><input type="number" id="exp-advance" step="0.01" min="0" placeholder="0.00" value="0"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Employee Name</label><input type="text" id="exp-employee" placeholder="Employee who made expense"></div>
                <div class="form-group">
                    <label>Payment Done By</label>
                    <select id="exp-payment-by">
                        <option value="">- Select -</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Petty Cash">Petty Cash</option>
                        <option value="Advance">From Advance</option>
                    </select>
                </div>
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
            advance: parseFloat(document.getElementById('exp-advance').value) || 0,
            employeeName: document.getElementById('exp-employee').value.trim(),
            paymentBy: document.getElementById('exp-payment-by').value,
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
    const paymentOptions = ['', 'Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Credit Card', 'Debit Card', 'Petty Cash', 'Advance'].map(opt =>
        `<option value="${opt}" ${opt === (expense.paymentBy || '') ? 'selected' : ''}>${opt || '- Select -'}</option>`
    ).join('');
    
    const content = `
        <form id="edit-expense-form">
            <input type="hidden" id="edit-exp-id" value="${expense.id}">
            <div class="form-row">
                <div class="form-group">
                    <label>Category</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <select id="edit-exp-cat" style="flex: 1;">
                            ${categoryOptions}
                        </select>
                        <button type="button" class="btn-secondary" style="width: 40px;" onclick="openAddCategoryModal()" title="Add Category"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="form-group"><label>Date</label><input type="date" id="edit-exp-date" value="${expense.date}" required></div>
            </div>
            <div class="form-group"><label>Description</label><input type="text" id="edit-exp-desc" value="${expense.description}" required></div>
            <div class="form-row">
                <div class="form-group"><label>Amount (₹)</label><input type="number" id="edit-exp-amount" step="0.01" min="0" value="${expense.amount}" required></div>
                <div class="form-group"><label>Advance Given (₹)</label><input type="number" id="edit-exp-advance" step="0.01" min="0" value="${expense.advance || 0}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Employee Name</label><input type="text" id="edit-exp-employee" value="${expense.employeeName || ''}" placeholder="Employee who made expense"></div>
                <div class="form-group">
                    <label>Payment Done By</label>
                    <select id="edit-exp-payment-by">
                        ${paymentOptions}
                    </select>
                </div>
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
        advance: parseFloat(document.getElementById('edit-exp-advance').value) || 0,
        employeeName: document.getElementById('edit-exp-employee').value.trim(),
        paymentBy: document.getElementById('edit-exp-payment-by').value,
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

// ─── Expenses Excel Export ────────────────────────────────────────
window.exportExpensesExcel = () => {
    try {
        if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }
        
        const data = state.expenses;
        if (data.length === 0) { showToast('No expenses to export', 'warning'); return; }

        const rows = data.map(e => ({
            'Date': e.date || '',
            'Category': e.category || '',
            'Description': e.description || '',
            'Employee Name': e.employeeName || '',
            'Payment Done By': e.paymentBy || '',
            'Advance Given (₹)': parseFloat(e.advance) || 0,
            'Amount (₹)': parseFloat(e.amount) || 0
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        // Set column widths
        ws['!cols'] = [
            { wch: 14 }, { wch: 18 }, { wch: 30 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 14 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
        XLSX.writeFile(wb, `Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Expenses exported to Excel successfully');
    } catch (err) {
        console.error('Export error:', err);
        showToast('Failed to export expenses', 'error');
    }
};

// Triggers the hidden file input
window.importExpensesExcel = () => {
    const input = document.getElementById('expense-excel-import');
    if (input) { input.value = ''; input.click(); }
};

// Handles the file once selected
window.handleExpenseExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (rows.length === 0) { showToast('No data found in file', 'warning'); return; }

                let imported = 0;
                let skipped = 0;
                for (const row of rows) {
                    // Support flexible column name casing
                    const amount = parseFloat(row['Amount (₹)'] || row['Amount'] || row['amount'] || 0);
                    if (!amount) { skipped++; continue; }

                    const id = Date.now().toString() + Math.random().toString(36).slice(2);
                    const newExpense = {
                        _id: id,
                        id,
                        date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
                        category: row['Category'] || row['category'] || 'Others',
                        description: row['Description'] || row['description'] || '',
                        employeeName: row['Employee Name'] || row['employeeName'] || '',
                        paymentBy: row['Payment Done By'] || row['paymentBy'] || '',
                        advance: parseFloat(row['Advance Given (₹)'] || row['Advance'] || row['advance'] || 0),
                        amount
                    };

                    try {
                        await db.expenses.put(newExpense);
                        state.expenses.unshift(newExpense);
                        imported++;
                    } catch (putErr) {
                        if (putErr.status !== 409) console.error('Import row error:', putErr);
                        skipped++;
                    }
                }

                await saveAppState();
                applyModuleFilters('exp');
                updateDashboardStats();
                showToast(`Import complete: ${imported} records added${skipped > 0 ? `, ${skipped} skipped` : ''}`);
            } catch (parseErr) {
                console.error('Excel parse error:', parseErr);
                showToast('Failed to parse Excel file', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (err) {
        console.error('Import error:', err);
        showToast('Failed to import file', 'error');
    }
};

// ─── Inventory Excel Export ──────────────────────────────────────
window.exportInventoryToExcel = () => {
    try {
        if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }
        const data = state.inventory;
        if (data.length === 0) { showToast('No products to export', 'warning'); return; }

        const rows = data.map(p => ({
            'Product Name': p.name || '',
            'SKU': p.sku || '',
            'Category': p.category || '',
            'Price (₹)': parseFloat(p.price) || 0,
            'Stock': parseFloat(p.stock) || 0,
            'Min Stock': parseFloat(p.minStock) || 0,
            'Tax Rate %': parseFloat(p.taxRate) || 0,
            'HSN/SAC Code': p.hsn || ''
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
        XLSX.writeFile(wb, `Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Inventory exported to Excel successfully');
    } catch (err) {
        console.error('Export error:', err);
        showToast('Failed to export inventory', 'error');
    }
};

// Triggers the hidden file input
window.importInventoryExcel = () => {
    const input = document.getElementById('inventory-excel-import');
    if (input) { input.value = ''; input.click(); }
};

// Handles the file once selected
window.handleInventoryExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (rows.length === 0) { showToast('No data found in file', 'warning'); return; }

                let imported = 0;
                let skipped = 0;
                for (const row of rows) {
                    const name = row['Product Name'] || row['name'] || row['Product'];
                    const sku = row['SKU'] || row['sku'] || row['Sku'];
                    if (!name || !sku) { skipped++; continue; }

                    const id = Date.now().toString() + Math.random().toString(36).slice(2);
                    const newItem = {
                        _id: id,
                        id,
                        name,
                        sku,
                        category: row['Category'] || row['category'] || 'General',
                        price: parseFloat(row['Price (₹)'] || row['Price'] || row['price'] || 0),
                        stock: parseFloat(row['Stock'] || row['stock'] || 0),
                        minStock: parseFloat(row['Min Stock'] || row['minStock'] || row['Minimum Stock'] || 0),
                        taxRate: parseFloat(row['Tax Rate %'] || row['taxRate'] || row['Tax'] || 0),
                        hsn: row['HSN/SAC Code'] || row['hsn'] || ''
                    };

                    try {
                        await db.inventory.put(newItem);
                        state.inventory.unshift(newItem);
                        imported++;
                    } catch (putErr) {
                        if (putErr.status !== 409) console.error('Import row error:', putErr);
                        skipped++;
                    }
                }

                await saveAppState();
                renderInventory();
                updateDashboardStats();
                showToast(`Import complete: ${imported} products added${skipped > 0 ? `, ${skipped} skipped` : ''}`);
            } catch (parseErr) {
                console.error('Excel parse error:', parseErr);
                showToast('Failed to parse Excel file', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (err) {
        console.error('Import error:', err);
        showToast('Failed to import file', 'error');
    }
};

// ─── Customers Excel Export ────────────────────────────────────────
window.exportCustomersToExcel = () => {
    try {
        if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }
        const data = state.customers;
        if (data.length === 0) { showToast('No customers to export', 'warning'); return; }

        const rows = data.map(c => ({
            'Name': c.name || '',
            'GSTIN': c.gstin || '',
            'State': c.state || '',
            'Phone': c.phone || '',
            'Email': c.email || '',
            'Address': c.address || ''
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 26 }, { wch: 30 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Customers');
        XLSX.writeFile(wb, `Customers_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Customers exported to Excel successfully');
    } catch (err) {
        console.error('Export error:', err);
        showToast('Failed to export customers', 'error');
    }
};

// Triggers the hidden file input
window.importCustomersExcel = () => {
    const input = document.getElementById('customers-excel-import');
    if (input) { input.value = ''; input.click(); }
};

// Handles the file once selected
window.handleCustomersExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (rows.length === 0) { showToast('No data found in file', 'warning'); return; }

                let imported = 0;
                let skipped = 0;
                for (const row of rows) {
                    const name = row['Name'] || row['name'] || row['Full Name'] || row['Customer'];
                    if (!name) { skipped++; continue; }

                    const id = Date.now().toString() + Math.random().toString(36).slice(2);
                    const newCustomer = {
                        _id: id,
                        id,
                        name,
                        gstin: row['GSTIN'] || row['gstin'] || '',
                        state: row['State'] || row['state'] || '',
                        email: row['Email'] || row['email'] || '',
                        phone: row['Phone'] || row['phone'] || '',
                        address: row['Address'] || row['address'] || ''
                    };

                    try {
                        await db.customers.put(newCustomer);
                        state.customers.unshift(newCustomer);
                        imported++;
                    } catch (putErr) {
                        if (putErr.status !== 409) console.error('Import row error:', putErr);
                        skipped++;
                    }
                }

                await saveAppState();
                renderCustomers();
                showToast(`Import complete: ${imported} customers added${skipped > 0 ? `, ${skipped} skipped` : ''}`);
            } catch (parseErr) {
                console.error('Excel parse error:', parseErr);
                showToast('Failed to parse Excel file', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (err) {
        console.error('Import error:', err);
        showToast('Failed to import file', 'error');
    }
};

// ─── Suppliers Excel Export ────────────────────────────────────────
window.exportSuppliersToExcel = () => {
    try {
        if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }
        const data = state.suppliers;
        if (data.length === 0) { showToast('No suppliers to export', 'warning'); return; }

        const rows = data.map(s => ({
            'Name': s.name || '',
            'GSTIN': s.gstin || '',
            'State': s.state || '',
            'Phone': s.phone || '',
            'Email': s.email || '',
            'Address': s.address || ''
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 26 }, { wch: 30 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Suppliers');
        XLSX.writeFile(wb, `Suppliers_${new Date().toISOString().split('T')[0]}.xlsx`);
        showToast('Suppliers exported to Excel successfully');
    } catch (err) {
        console.error('Export error:', err);
        showToast('Failed to export suppliers', 'error');
    }
};

// Triggers the hidden file input
window.importSuppliersExcel = () => {
    const input = document.getElementById('suppliers-excel-import');
    if (input) { input.value = ''; input.click(); }
};

// Handles the file once selected
window.handleSuppliersExcelImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.XLSX) { showToast('Excel library not loaded', 'error'); return; }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

                if (rows.length === 0) { showToast('No data found in file', 'warning'); return; }

                let imported = 0;
                let skipped = 0;
                for (const row of rows) {
                    const name = row['Name'] || row['name'] || row['Supplier Name'] || row['Supplier'];
                    if (!name) { skipped++; continue; }

                    const id = Date.now().toString() + Math.random().toString(36).slice(2);
                    const newSupplier = {
                        _id: id,
                        id,
                        name,
                        gstin: row['GSTIN'] || row['gstin'] || '',
                        state: row['State'] || row['state'] || '',
                        email: row['Email'] || row['email'] || '',
                        phone: row['Phone'] || row['phone'] || '',
                        address: row['Address'] || row['address'] || ''
                    };

                    try {
                        await db.suppliers.put(newSupplier);
                        state.suppliers.unshift(newSupplier);
                        imported++;
                    } catch (putErr) {
                        if (putErr.status !== 409) console.error('Import row error:', putErr);
                        skipped++;
                    }
                }

                await saveAppState();
                renderSuppliers();
                showToast(`Import complete: ${imported} suppliers added${skipped > 0 ? `, ${skipped} skipped` : ''}`);
            } catch (parseErr) {
                console.error('Excel parse error:', parseErr);
                showToast('Failed to parse Excel file', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (err) {
        console.error('Import error:', err);
        showToast('Failed to import file', 'error');
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
                <button class="action-btn" onclick="openResetUserPasswordModal('${u.id}')" title="Set / Reset Password"><i class="fas fa-key"></i></button>
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
            const id = Date.now().toString();
            const newUser = {
                _id: id,
                id: id,
                email,
                role,
                password,
                lastLogin: 'Never'
            };
            try {
                await db.users.put(newUser);
                state.users.push(newUser);
                await saveAppState();
                showToast(`User ${email} created successfully!`);
            } catch (err) {
                console.error('Error creating user:', err);
                showToast('Failed to create user', 'error');
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

    if (confirm('Are you sure you want to delete this user?')) {
        try {
            try {
                const doc = await db.users.get(id.toString());
                await db.users.remove(doc);
            } catch (pouchErr) {
                if (pouchErr.status !== 404) throw pouchErr;
            }

            // Update UI State
            state.users = state.users.filter(u => u.id != id);
            await saveAppState();
            renderUsers();
            showToast('User deleted successfully');
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
                <label>Enter your registered email</label>
                <input type="email" id="forgot-email" required placeholder="e.g. admin@manager.io">
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="forgot-new-password" required minlength="4" placeholder="Enter new password">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Reset Password</button>
            </div>
        </form>
    `;
    openModal('Reset Password', content);

    document.getElementById('forgot-password-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();
        const newPassword = document.getElementById('forgot-new-password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        setBtnLoading(submitBtn, true, originalText);
        const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            user.password = newPassword;
            try {
                const doc = await db.users.get(user._id || user.id.toString());
                await db.users.put({ ...doc, password: newPassword });
            } catch (pErr) {
                if (pErr.status === 404) {
                    await db.users.put({ _id: user.id.toString(), id: user.id, email: user.email, role: user.role, password: newPassword });
                }
            }
            await saveAppState();
            closeModal();
            showToast('Password reset successfully! You can now log in.');
        } else {
            showToast('No user found with that email address.', 'error');
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
            try {
                const doc = await db.users.get(id.toString());
                await db.users.put({ ...doc, role });
            } catch (pErr) {
                if (pErr.status === 404) {
                    await db.users.put({ _id: id.toString(), id, email: user.email, role });
                }
            }
            user.role = role;
            const idx = state.users.findIndex(u => u.id == id);
            if (idx !== -1) {
                state.users[idx].role = role;
            }
            
            showToast('User role updated successfully');
            renderUsers();
            closeModal();
        } catch (err) {
            console.error('Update role error:', err);
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            setBtnLoading(submitBtn, false, originalText);
        }
    };
};

window.openResetUserPasswordModal = (id) => {
    const user = state.users.find(u => u.id == id);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    const content = `
        <form id="reset-password-form">
            <div class="form-group">
                <label>User</label>
                <input type="text" value="${user.email}" readonly>
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="reset-user-password" required minlength="4" placeholder="Minimum 4 characters">
            </div>
            <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" id="reset-user-password-confirm" required minlength="4" placeholder="Re-enter new password">
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary" style="width: auto;">Update Password</button>
            </div>
        </form>
    `;
    openModal('Set / Reset Password', content);

    document.getElementById('reset-password-form').onsubmit = async (e) => {
        e.preventDefault();
        const password = document.getElementById('reset-user-password').value;
        const confirmPassword = document.getElementById('reset-user-password-confirm').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        if (password.length < 4) {
            showToast('Password must be at least 4 characters', 'error');
            return;
        }

        setBtnLoading(submitBtn, true, originalText);
        try {
            try {
                let doc = await db.users.get(id.toString());
                await db.users.put({ ...doc, password });
            } catch (pouchErr) {
                if (pouchErr.status === 404) {
                    await db.users.put({ _id: id.toString(), id, email: user.email, role: user.role, password });
                } else {
                    throw pouchErr;
                }
            }
            user.password = password;
            await saveAppState();
            showToast(`Password updated for ${user.email}`);
            closeModal();
        } catch (err) {
            console.error('Password update error:', err);
            showToast(`Error: ${err.message || 'Operation failed'}`, 'error');
        } finally {
            setBtnLoading(submitBtn, false, originalText);
        }
    };
};

// Profile Module Implementation
let profileStaging = {
    logoUrl: null,
    qrUrl: null,
    sigUrl: null,
    pendingFiles: {}
};

function renderProfileForm() {
    const comp = state.company;
    document.getElementById('prof-name').value = comp.name || '';
    document.getElementById('prof-legal-name').value = comp.legalName || '';
    document.getElementById('prof-gstin').value = comp.gstin || '';
    document.getElementById('prof-address').value = comp.address || '';
    document.getElementById('prof-phone').value = comp.phone || '';
    document.getElementById('prof-email').value = comp.email || '';
    document.getElementById('prof-website').value = comp.website || '';
    document.getElementById('prof-state').value = comp.state || '';
    document.getElementById('prof-bank-name').value = comp.bankName || '';
    document.getElementById('prof-branch-address').value = comp.branchAddress || '';
    document.getElementById('prof-account-no').value = comp.accountNo || '';
    document.getElementById('prof-ifsc').value = comp.ifscCode || '';
    document.getElementById('prof-holder').value = comp.accountHolder || '';
    document.getElementById('prof-terms').value = comp.terms || '';

    // Initialize staging with current saved company images
    profileStaging = {
        logoUrl: comp.logoUrl || null,
        qrUrl: comp.qrUrl || null,
        sigUrl: comp.sigUrl || null,
        pendingFiles: {}
    };

    // Reset file input values
    const logoFileInput = document.getElementById('prof-logo-file');
    const qrFileInput = document.getElementById('prof-qr-file');
    const sigFileInput = document.getElementById('prof-sig-file');
    if (logoFileInput) logoFileInput.value = '';
    if (qrFileInput) qrFileInput.value = '';
    if (sigFileInput) sigFileInput.value = '';

    updateImagePreviews();

    if (logoFileInput) logoFileInput.onchange = (e) => handleFileChange(e, 'logoUrl', 'prof-logo-preview', 'prof-logo-delete-btn');
    if (qrFileInput) qrFileInput.onchange = (e) => handleFileChange(e, 'qrUrl', 'prof-qr-preview', 'prof-qr-delete-btn');
    if (sigFileInput) sigFileInput.onchange = (e) => handleFileChange(e, 'sigUrl', 'prof-sig-preview', 'prof-sig-delete-btn');

    document.getElementById('profile-form').onsubmit = handleProfileSubmit;
}

function updateImagePreviews() {
    const logoPreview = document.getElementById('prof-logo-preview');
    const qrPreview = document.getElementById('prof-qr-preview');
    const sigPreview = document.getElementById('prof-sig-preview');

    const logoDeleteBtn = document.getElementById('prof-logo-delete-btn');
    const qrDeleteBtn = document.getElementById('prof-qr-delete-btn');
    const sigDeleteBtn = document.getElementById('prof-sig-delete-btn');

    if (logoPreview) {
        logoPreview.src = profileStaging.logoUrl || '';
        logoPreview.style.display = profileStaging.logoUrl ? 'block' : 'none';
    }
    if (logoDeleteBtn) {
        logoDeleteBtn.style.display = profileStaging.logoUrl ? 'inline-flex' : 'none';
    }

    if (qrPreview) {
        qrPreview.src = profileStaging.qrUrl || '';
        qrPreview.style.display = profileStaging.qrUrl ? 'block' : 'none';
    }
    if (qrDeleteBtn) {
        qrDeleteBtn.style.display = profileStaging.qrUrl ? 'inline-flex' : 'none';
    }

    if (sigPreview) {
        sigPreview.src = profileStaging.sigUrl || '';
        sigPreview.style.display = profileStaging.sigUrl ? 'block' : 'none';
    }
    if (sigDeleteBtn) {
        sigDeleteBtn.style.display = profileStaging.sigUrl ? 'inline-flex' : 'none';
    }
}

window.deleteCompanyImage = (stateKey, displayName) => {
    // Only update staging in memory — DO NOT persist to database until "Save Profile Details" is clicked!
    profileStaging[stateKey] = null;
    delete profileStaging.pendingFiles[stateKey];

    const fileInputMap = {
        logoUrl: 'prof-logo-file',
        qrUrl: 'prof-qr-file',
        sigUrl: 'prof-sig-file'
    };
    const inputId = fileInputMap[stateKey];
    if (inputId) {
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = '';
    }

    updateImagePreviews();
    showToast(`${displayName} marked for removal. Click 'Save Profile Details' to apply changes.`);
};

async function handleFileChange(event, stateKey, previewId, deleteBtnId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (PNG/JPG only)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showToast('Invalid file format. Please upload PNG or JPG only.', 'error');
        event.target.value = '';
        return;
    }

    // Read and stage local preview — DO NOT save to database yet!
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        profileStaging[stateKey] = dataUrl;
        profileStaging.pendingFiles[stateKey] = file;
        updateImagePreviews();
        showToast('Image selected. Click \'Save Profile Details\' to apply changes.');
    };
    reader.readAsDataURL(file);
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) setBtnLoading(submitBtn, true, 'Saving...');

    try {
        state.company.name = document.getElementById('prof-name').value.trim();
        state.company.legalName = document.getElementById('prof-legal-name').value.trim();
        state.company.gstin = document.getElementById('prof-gstin').value.trim();
        state.company.address = document.getElementById('prof-address').value.trim();
        state.company.phone = document.getElementById('prof-phone').value.trim();
        state.company.email = document.getElementById('prof-email').value.trim();
        state.company.website = document.getElementById('prof-website').value.trim();
        state.company.state = document.getElementById('prof-state').value.trim();
        state.company.bankName = document.getElementById('prof-bank-name').value.trim();
        state.company.branchAddress = document.getElementById('prof-branch-address').value.trim();
        state.company.accountNo = document.getElementById('prof-account-no').value.trim();
        state.company.ifscCode = document.getElementById('prof-ifsc').value.trim();
        state.company.accountHolder = document.getElementById('prof-holder').value.trim();
        state.company.terms = document.getElementById('prof-terms').value.trim();

        // Apply staged images to state.company now
        state.company.logoUrl = profileStaging.logoUrl;
        state.company.qrUrl = profileStaging.qrUrl;
        state.company.sigUrl = profileStaging.sigUrl;

        // Save to PouchDB
        let doc;
        try {
            doc = await db.company.get('config');
            await db.company.put({ ...doc, ...state.company });
        } catch (pouchErr) {
            if (pouchErr.status === 404) {
                await db.company.put({ ...state.company, _id: 'config' });
            } else {
                throw pouchErr;
            }
        }

        await saveAppState(); // Updates UI
        updateBrandingDisplay();

        showToast('Company profile updated and saved successfully!');
    } catch (err) {
        console.error('Error saving profile:', err);
        showToast('Failed to save profile: ' + (err.message || 'Unknown error'), 'error');
    } finally {
        if (submitBtn) setBtnLoading(submitBtn, false, originalText);
    }
}

window.openResetPasswordModal = () => {
    const content = `
        <form id="reset-password-form">
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="reset-password" required minlength="4" placeholder="Min 4 characters">
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" id="reset-password-confirm" required minlength="4" placeholder="Confirm your new password">
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

        if (state.currentUser) {
            try {
                const doc = await db.users.get(state.currentUser._id || state.currentUser.id.toString());
                await db.users.put({ ...doc, password });
            } catch (pErr) {
                if (pErr.status === 404) {
                    await db.users.put({ _id: state.currentUser.id.toString(), id: state.currentUser.id, email: state.currentUser.email, role: state.currentUser.role, password });
                }
            }
            state.currentUser.password = password;
            closeModal();
            showToast('Password updated successfully!');
        } else {
            showToast('No active user logged in', 'error');
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
    const periodSelect = document.getElementById('dash-period');
    if (!periodSelect) return;
    const period = periodSelect.value;
    if (!state.dashFilters) state.dashFilters = { period: 'All', startDate: '', endDate: '' };
    state.dashFilters.period = period;

    const customDates = document.getElementById('dash-custom-dates');
    if (customDates) {
        if (period === 'Custom') customDates.classList.remove('hidden');
        else customDates.classList.add('hidden');
    }

    // Custom range needs two valid dates before the stats can be recalculated
    if (period === 'Custom') {
        const startVal = document.getElementById('dash-start-date')?.value || '';
        const endVal = document.getElementById('dash-end-date')?.value || '';
        if (!startVal || !endVal) return;
    }
    applyDashboardFilters();
};

// Formats a Date object as a local YYYY-MM-DD string.
// (toISOString() is UTC based and can shift the date by one day for IST users.)
function toLocalISODate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Resolves a dashboard period into an inclusive { start, end } ISO date range.
function getDashboardDateRange(period, customStart = '', customEnd = '') {
    const today = new Date();
    const todayStr = toLocalISODate(today);
    let start = '';
    let end = todayStr;

    switch (period) {
        case 'Today':
            start = todayStr;
            break;
        case 'Last7Days': {
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
            start = toLocalISODate(d);
            break;
        }
        case 'ThisMonth':
            start = todayStr.slice(0, 7) + '-01';
            break;
        case 'LastMonth': {
            const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
            start = toLocalISODate(firstDay);
            end = toLocalISODate(lastDay);
            break;
        }
        case 'ThisYear':
            start = todayStr.slice(0, 4) + '-01-01';
            break;
        case 'Custom':
            start = customStart || '';
            end = customEnd || '';
            break;
        default: // 'All' → no date restriction at all
            start = '';
            end = '';
    }

    return { start, end };
}

// Universal Amount Parser & Date Normalizer
function parseAmount(val) {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const clean = String(val).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

// Normalizes almost any stored date value into an ISO YYYY-MM-DD string.
// Handles ISO timestamps, YYYY/MM/DD, DD/MM/YYYY, DD-MM-YYYY and Date objects
// so records imported from Excel still match the dashboard date filters.
function normalizeDate(dStr) {
    if (!dStr) return '';
    if (dStr instanceof Date) return isNaN(dStr.getTime()) ? '' : toLocalISODate(dStr);

    const value = String(dStr).trim();
    if (!value) return '';

    // ISO timestamp → take the date part: "2026-11-06T10:20:30.000Z"
    if (value.includes('T')) {
        const isoPart = value.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(isoPart)) return isoPart;
    }

    // Already ISO: "2026-11-06"
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // Year first with slashes/dots: "2026/11/06" or "2026.11.06"
    const ymd = value.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})/);
    if (ymd) {
        return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
    }

    // Day first: "06/11/2026", "6-11-2026" or "06.11.2026"
    const dmy = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (dmy) {
        return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }

    // Fallback: let the browser parse it ("06 Nov 2026", "Nov 6, 2026", ...)
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) return toLocalISODate(parsed);

    return value;
}

// Currency formatter used by the dashboard KPI cards and top lists.
function formatCurrency(amount) {
    const value = parseAmount(amount);
    return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Writes text into an element if it exists on the current page.
function setTextById(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
    return !!el;
}

// Human readable label for the currently selected dashboard period.
function getDashboardPeriodLabel() {
    const period = (state.dashFilters && state.dashFilters.period) || 'All';
    const labels = {
        All: 'all time',
        Today: 'today',
        Last7Days: 'the last 7 days',
        ThisMonth: 'this month',
        LastMonth: 'last month',
        ThisYear: 'this year',
        Custom: 'the selected date range'
    };
    return labels[period] || 'the selected period';
}

window.applyDashboardFilters = () => {
    if (!state.dashFilters) state.dashFilters = { period: 'All', startDate: '', endDate: '' };
    const period = state.dashFilters.period || 'All';

    const startInput = document.getElementById('dash-start-date');
    const endInput = document.getElementById('dash-end-date');
    const range = getDashboardDateRange(
        period,
        startInput ? startInput.value : '',
        endInput ? endInput.value : ''
    );

    state.dashFilters.startDate = range.start;
    state.dashFilters.endDate = range.end;

    // Keep the filter bar in sync with the active period
    const periodSelect = document.getElementById('dash-period');
    if (periodSelect && periodSelect.value !== period) periodSelect.value = period;
    const customDates = document.getElementById('dash-custom-dates');
    if (customDates) {
        if (period === 'Custom') customDates.classList.remove('hidden');
        else customDates.classList.add('hidden');
    }

    updateDashboardStats();
    renderDashboardCharts();
};

function getFilteredDataForDashboard(dataArray, dateKey = 'date') {
    if (!Array.isArray(dataArray)) return [];
    const filters = state.dashFilters || {};
    const startDate = filters.startDate || '';
    const endDate = filters.endDate || '';

    // 'All Time' (or an incomplete custom range) → use every record
    if (filters.period === 'All' || (!startDate && !endDate)) return dataArray.slice();

    return dataArray.filter(item => {
        if (!item) return false;
        const rawDate = item[dateKey] || item.createdAt || item.created_at || item.updatedAt || '';
        const d = normalizeDate(rawDate);
        if (!d) return true; // records without a date always count
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
    });
}

function updateDashboardStats() {
    // Defensive: the dashboard must never blow up because a collection is missing
    const sales = Array.isArray(state.sales) ? state.sales : [];
    const purchases = Array.isArray(state.purchases) ? state.purchases : [];
    const expenses = Array.isArray(state.expenses) ? state.expenses : [];
    const inventory = Array.isArray(state.inventory) ? state.inventory : [];
    const customers = Array.isArray(state.customers) ? state.customers : [];
    const suppliers = Array.isArray(state.suppliers) ? state.suppliers : [];

    const filteredSales = getFilteredDataForDashboard(sales);
    const filteredPurchases = getFilteredDataForDashboard(purchases);
    const filteredExpenses = getFilteredDataForDashboard(expenses);

    try {
        // 1. Financial KPIs (Real-Time from Sales, Purchases, and Expenses)
        const totalRevenue = filteredSales.reduce((sum, s) => sum + parseAmount(s.total), 0);
        const purchaseExpenses = filteredPurchases.reduce((sum, p) => sum + parseAmount(p.total), 0);
        const generalExpenses = filteredExpenses.reduce((sum, e) => sum + parseAmount(e.amount), 0);
        const totalExpenses = purchaseExpenses + generalExpenses;
        const netProfit = totalRevenue - totalExpenses;
        const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

        setTextById('dash-revenue', formatCurrency(totalRevenue));
        setTextById('dash-expenses', formatCurrency(totalExpenses));
        setTextById('dash-profit', formatCurrency(netProfit));
        setTextById('dash-margin', `${margin}%`);

        // Visual coloring for Profit/Loss
        const profEl = document.getElementById('dash-profit');
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
    } catch (err) {
        console.error('Error calculating dashboard financial KPIs:', err);
    }

    try {
        // 2. Operational Stats
        const totalProducts = inventory.length;
        const totalCustomers = customers.length;
        const totalSuppliers = suppliers.length;
        const lowStockCount = inventory.filter(p => {
            if (!p) return false;
            const stock = parseAmount(p.stock);
            const hasMin = p.minStock !== undefined && p.minStock !== null && p.minStock !== '';
            const minStock = hasMin ? parseAmount(p.minStock) : 0;
            return minStock > 0 && stock < minStock;
        }).length;

        const pendingRev = filteredSales.reduce((sum, s) => {
            if (s.pendingAmount !== undefined && s.pendingAmount !== null && s.pendingAmount !== '') {
                return sum + parseAmount(s.pendingAmount);
            }
            return sum + (s.status !== 'Paid' ? parseAmount(s.total) : 0);
        }, 0);
        const pendingPay = filteredPurchases.reduce((sum, p) => {
            if (p.pendingAmount !== undefined && p.pendingAmount !== null && p.pendingAmount !== '') {
                return sum + parseAmount(p.pendingAmount);
            }
            return sum + (p.status !== 'Paid' ? parseAmount(p.total) : 0);
        }, 0);
        const invValue = inventory.reduce((sum, p) => sum + (parseAmount(p.stock) * parseAmount(p.price)), 0);

        setTextById('dash-total-products', totalProducts);
        setTextById('dash-total-customers', totalCustomers);
        setTextById('dash-total-suppliers', totalSuppliers);
        setTextById('dash-low-stock', lowStockCount);
        setTextById('dash-pending-rev', formatCurrency(pendingRev));
        setTextById('dash-pending-pay', formatCurrency(pendingPay));
        setTextById('dash-inv-value', formatCurrency(invValue));
    } catch (err) {
        console.error('Error calculating dashboard operational stats:', err);
    }

    try {
        // 3. Top Lists (products + customers)
        renderTopLists(filteredSales);
    } catch (err) {
        console.error('Error rendering dashboard top lists:', err);
    }
}

// Renders an explanatory empty state for a dashboard list card.
function renderDashboardListEmpty(containerId, fallbackText, totalRecords) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const periodLabel = getDashboardPeriodLabel();
    let message = fallbackText.replace('{period}', periodLabel);
    if (totalRecords > 0 && periodLabel !== 'all time') {
        message += ` ${totalRecords} record${totalRecords === 1 ? '' : 's'} exist outside this period — choose "All Time".`;
    }
    container.innerHTML = `<p class="text-muted">${message}</p>`;
}

function renderDashboardList(containerId, rows) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = rows.map(([name, value]) => `
        <div class="dash-list-item">
            <span class="item-name">${name}</span>
            <span class="item-value">${formatCurrency(value)}</span>
        </div>
    `).join('');
}

function renderTopLists(filteredSales) {
    const sales = Array.isArray(filteredSales) ? filteredSales : [];
    const totalSalesRecords = Array.isArray(state.sales) ? state.sales.length : 0;

    // ── Top Products (by revenue) ──────────────────────────────────────────
    const productMap = {};
    sales.forEach(sale => {
        if (!sale || !Array.isArray(sale.items)) return;
        sale.items.forEach(item => {
            if (!item) return;
            const name = item.name || item.product || item.code || 'Unknown Product';
            // Some records only store qty/price — fall back to qty × price
            const revenue = parseAmount(item.total) || (parseAmount(item.qty) * parseAmount(item.price));
            productMap[name] = (productMap[name] || 0) + revenue;
        });
    });

    const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topProducts.length === 0) {
        renderDashboardListEmpty('dash-top-products', 'No sales data for {period}.', totalSalesRecords);
    } else {
        renderDashboardList('dash-top-products', topProducts);
    }

    // ── Top Customers ──────────────────────────────────────────────────────
    const customerMap = {};
    sales.forEach(sale => {
        if (!sale) return;
        const name = sale.customer || (sale.customerObj && sale.customerObj.name) || 'Guest';
        customerMap[name] = (customerMap[name] || 0) + parseAmount(sale.total);
    });

    const topCustomers = Object.entries(customerMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topCustomers.length === 0) {
        renderDashboardListEmpty('dash-top-customers', 'No customer data for {period}.', totalSalesRecords);
    } else {
        renderDashboardList('dash-top-customers', topCustomers);
    }
}

function renderDashboardCharts() {
    try {
        const salesCanvas = document.getElementById('salesChart');
        const expenseCanvas = document.getElementById('expenseChart');
        if (!salesCanvas || !expenseCanvas) return;
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js is not loaded — dashboard charts skipped.');
            return;
        }

        const salesRecords = Array.isArray(state.sales) ? state.sales : [];
        const expenseRecords = Array.isArray(state.expenses) ? state.expenses : [];
        const purchaseRecords = Array.isArray(state.purchases) ? state.purchases : [];

        // 1. Sales Trend Data
        const { startDate, endDate, period } = state.dashFilters || {};
        let labels = [];
        let dataset = [];

        if (period === 'Today') {
            labels = ['Today'];
            const todayTotal = salesRecords
                .filter(s => normalizeDate(s.date) === startDate)
                .reduce((sum, s) => sum + parseAmount(s.total), 0);
            dataset = [todayTotal];
        } else if (period === 'Last7Days' || (period === 'Custom' && startDate && endDate && (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) <= 14)) {
            const dStart = new Date(startDate + 'T00:00:00');
            const dEnd = new Date(endDate + 'T00:00:00');
            if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime()) && dStart <= dEnd) {
                for (let d = new Date(dStart); d <= dEnd; d.setDate(d.getDate() + 1)) {
                    const dateStr = toLocalISODate(d);
                    labels.push(d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));
                    const dailyTotal = salesRecords
                        .filter(s => normalizeDate(s.date) === dateStr)
                        .reduce((sum, s) => sum + parseAmount(s.total), 0);
                    dataset.push(dailyTotal);
                }
            }
            if (labels.length === 0) {
                labels = ['No Data'];
                dataset = [0];
            }
        } else {
            const monthMap = {};
            const salesInScope = getFilteredDataForDashboard(salesRecords);
            salesInScope.forEach(s => {
                const normD = normalizeDate(s && s.date);
                const m = normD ? normD.slice(0, 7) : 'Recent';
                monthMap[m] = (monthMap[m] || 0) + parseAmount(s.total);
            });
            const sortedKeys = Object.keys(monthMap).sort();
            labels = sortedKeys.map(m => {
                if (m.includes('-')) {
                    const [y, mm] = m.split('-');
                    return new Date(parseInt(y), parseInt(mm) - 1).toLocaleString('default', { month: 'short' });
                }
                return m;
            });
            dataset = sortedKeys.map(m => monthMap[m]);
            if (labels.length === 0) {
                labels = ['No Data'];
                dataset = [0];
            }
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

        // 2. Expense Breakdown (Purchases + General Expenses)
        const filteredExpenses = getFilteredDataForDashboard(expenseRecords);
        const filteredPurchases = getFilteredDataForDashboard(purchaseRecords);
        const expenseMap = {};
        
        const purchaseTotal = filteredPurchases.reduce((sum, p) => sum + parseAmount(p.total), 0);
        if (purchaseTotal > 0) {
            expenseMap['Purchases / Stock'] = purchaseTotal;
        }

        filteredExpenses.forEach(e => {
            const cat = e.category || 'General Expense';
            expenseMap[cat] = (expenseMap[cat] || 0) + parseAmount(e.amount);
        });

        if (Object.keys(expenseMap).length === 0) {
            expenseMap['No Expenses'] = 0;
        }

        const expenseCtx = expenseCanvas.getContext('2d');
        if (window.myExpenseChart) window.myExpenseChart.destroy();
        window.myExpenseChart = new Chart(expenseCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(expenseMap),
                datasets: [{ 
                    data: Object.values(expenseMap), 
                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899', '#6366f1'] 
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

// ─── Single Invoice Word (.docx) & Excel (.xlsx) Export ────────────────────────
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getInvoiceExportData(id, type = 'Sales') {
    const isPurchase = type === 'Purchases';
    const record = isPurchase ? state.purchases.find(p => p.id === id) : state.sales.find(s => s.id === id);
    if (!record) return null;

    let party = isPurchase ? record.supplierObj : record.customerObj;
    if (isPurchase) {
        const fresh = state.suppliers.find(s => s.name === record.supplier || (party && s.id == party.id));
        if (fresh) party = fresh;
        if (!party) party = { name: record.supplier || 'N/A', address: 'N/A', gstin: 'N/A', state: 'N/A' };
    } else {
        const fresh = state.customers.find(c => c.name === record.customer || (party && c.id == party.id));
        if (fresh) party = fresh;
        if (!party) party = { name: record.customer || 'N/A', address: 'N/A', gstin: 'N/A', state: 'N/A' };
    }

    const comp = state.company || {};
    const items = record.items || [];
    const subtotal = parseAmount(record.subtotal);
    const tax = parseAmount(record.tax);
    const total = parseAmount(record.total);
    const billType = record.billType || 'GST Bill';
    const gstType = record.gstType || 'Local';
    const no = record.id;
    const date = record.date;
    const paymentMode = record.paymentMode || '';
    const shipTo = record.shipTo || '';
    const supplyState = party.state || (isPurchase ? comp.state : (party.address && party.address.split(',').pop().trim()) || comp.state || 'N/A');

    return {
        id,
        no,
        date,
        type,
        isPurchase,
        party,
        comp,
        items,
        subtotal,
        tax,
        total,
        billType,
        gstType,
        paymentMode,
        shipTo,
        supplyState,
        amountWords: typeof amountToWords === 'function' ? amountToWords(total) : `₹ ${total.toFixed(2)}`
    };
}

window.exportInvoiceToWord = async (id, type = 'Sales') => {
    try {
        const inv = getInvoiceExportData(id, type);
        if (!inv) {
            showToast('Invoice record not found', 'error');
            return;
        }

        const isPurchase = inv.isPurchase;
        const comp = inv.comp;
        const party = inv.party;
        const items = inv.items;
        const title = isPurchase ? 'PURCHASE BILL' : (inv.billType === 'Non-GST Bill' ? 'INVOICE' : 'TAX INVOICE');

        const htmlDoc = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${title} - ${inv.no}</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
@page { size: 210mm 297mm; margin: 15mm; }
body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; color: #1e293b; font-size: 9.5pt; line-height: 1.4; margin: 0; padding: 0; }
.title { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; color: #0f172a; }
table { width: 100%; border-collapse: collapse; border: 1px solid #94a3b8; margin-bottom: 0px; }
th, td { border: 1px solid #94a3b8; padding: 6px 8px; font-size: 9pt; }
th { background-color: #f1f5f9; font-weight: bold; text-align: center; color: #334155; }
.header-box { background-color: #f8fafc; }
.bold { font-weight: bold; }
.right { text-align: right; }
.center { text-align: center; }
.section-head { background-color: #e2e8f0; font-weight: bold; padding: 4px 8px; text-transform: uppercase; font-size: 8.5pt; color: #334155; margin-bottom: 4px; }
</style>
</head>
<body>
<div class="title">${title}</div>

<table>
  <tr class="header-box">
    <td style="width: 50%; vertical-align: top; border-bottom: none;">
      <div style="font-size: 14pt; font-weight: bold; color: #0f172a;">${comp.name || 'Company Name'}</div>
    </td>
    <td style="width: 50%; vertical-align: top; text-align: right; border-bottom: none;">
      <div style="font-weight: bold; font-size: 11pt; color: #1e293b;">${comp.legalName || comp.name || ''}</div>
      <div>${comp.address || ''}</div>
      <div>Phone: ${comp.phone || ''} | Email: ${comp.email || ''}</div>
      ${comp.website ? `<div>Website: ${comp.website}</div>` : ''}
      <div>GSTIN: ${comp.gstin || 'N/A'}, State: ${comp.state || 'N/A'}</div>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td style="width: ${inv.shipTo ? '35%' : '50%'}; vertical-align: top;">
      <div class="section-head">Bill To</div>
      <div class="bold" style="font-size: 10.5pt; margin: 3px 0;">${party.name || 'N/A'}</div>
      <div>${(party.address || 'N/A').replace(/\r?\n/g, '<br>')}</div>
      ${inv.billType !== 'Non-GST Bill' ? `<div>GSTIN: ${party.gstin || 'N/A'}</div>` : ''}
      <div>State: ${party.state || 'N/A'}</div>
    </td>
    ${inv.shipTo ? `
    <td style="width: 35%; vertical-align: top;">
      <div class="section-head">Ship To</div>
      <div style="margin: 3px 0;">${inv.shipTo.replace(/\r?\n/g, '<br>')}</div>
    </td>` : ''}
    <td style="width: ${inv.shipTo ? '30%' : '50%'}; vertical-align: top;">
      <div class="section-head">Invoice Details</div>
      <div style="margin-top: 3px;"><strong>Invoice No:</strong> ${inv.no}</div>
      <div><strong>Date:</strong> ${inv.date}</div>
      <div><strong>Place of Supply:</strong> ${inv.supplyState}</div>
      ${inv.paymentMode ? `<div><strong>Payment Mode:</strong> ${inv.paymentMode}</div>` : ''}
    </td>
  </tr>
</table>

<table>
  <thead>
    <tr>
      <th style="width: 5%;">#</th>
      <th style="width: 38%; text-align: left;">Description of Goods</th>
      <th style="width: 12%;">HSN/SAC</th>
      <th style="width: 8%;">Qty</th>
      <th style="width: 12%;">Rate (₹)</th>
      ${inv.billType === 'Non-GST Bill' ? '' : (inv.gstType === 'Local' ? '<th style="width: 8%;">CGST %</th><th style="width: 8%;">SGST %</th>' : '<th style="width: 10%;">IGST %</th>')}
      <th style="width: 15%;">Amount (₹)</th>
    </tr>
  </thead>
  <tbody>
    ${items.map((it, idx) => `
      <tr>
        <td class="center">${idx + 1}</td>
        <td>${it.name || ''}</td>
        <td class="center">${it.hsn || ''}</td>
        <td class="center">${it.qty || 1}</td>
        <td class="right">₹ ${parseFloat(it.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        ${inv.billType === 'Non-GST Bill' ? '' : (inv.gstType === 'Local' ? `<td class="center">${(parseFloat(it.tax || 0)/2).toFixed(1)}%</td><td class="center">${(parseFloat(it.tax || 0)/2).toFixed(1)}%</td>` : `<td class="center">${parseFloat(it.tax || 0).toFixed(1)}%</td>`)}
        <td class="right">₹ ${parseFloat(it.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

<table>
  <tr>
    <td style="width: 60%; vertical-align: top;">
      <div class="section-head">Invoice Amount in Words</div>
      <div class="bold" style="padding: 4px 0;">${inv.amountWords || ''}</div>
      ${comp.terms ? `<div class="section-head" style="margin-top: 8px;">Terms and Conditions</div><div style="white-space: pre-wrap;">${comp.terms}</div>` : ''}
    </td>
    <td style="width: 40%; vertical-align: top;">
      <div class="section-head">Amounts</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>Sub Total:</span> <strong>₹ ${inv.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
      </div>
      ${inv.billType !== 'Non-GST Bill' ? (inv.gstType === 'Local' ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>CGST:</span> <strong>₹ ${(inv.tax/2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>SGST:</span> <strong>₹ ${(inv.tax/2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>
      ` : `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>IGST:</span> <strong>₹ ${inv.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        </div>
      `) : ''}
      <div style="display: flex; justify-content: space-between; font-size: 11pt; border-top: 2px solid #94a3b8; padding-top: 4px; margin-top: 4px;">
        <span><strong>Total:</strong></span> <strong>₹ ${inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
      </div>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td style="width: 60%; vertical-align: top;">
      <div class="section-head">Bank Details</div>
      <div><strong>Bank Name:</strong> ${comp.bankName || 'N/A'}</div>
      ${comp.branchAddress ? `<div><strong>Branch:</strong> ${comp.branchAddress}</div>` : ''}
      <div><strong>Account No:</strong> ${comp.accountNo || 'N/A'}</div>
      <div><strong>IFSC Code:</strong> ${comp.ifscCode || 'N/A'}</div>
      <div><strong>Account Holder:</strong> ${comp.accountHolder || comp.legalName || 'N/A'}</div>
    </td>
    <td style="width: 40%; vertical-align: bottom; text-align: center;">
      <div class="bold">For : ${comp.legalName || comp.name || ''}</div>
      <div style="height: 45px;"></div>
      <div style="border-top: 1px solid #94a3b8; padding-top: 4px; font-size: 8.5pt; font-weight: bold;">Authorized Signatory</div>
    </td>
  </tr>
</table>

</body>
</html>`;

        const filename = `${isPurchase ? 'Purchase_Bill' : 'Invoice'}_${inv.no}.docx`;

        if (window.JSZip) {
            const zip = new window.JSZip();
            zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="html" ContentType="text/html"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

            zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

            zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="htmlChunk" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="htmlDoc.html"/>
</Relationships>`);

            zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:altChunk r:id="htmlChunk"/>
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
    </w:sectPr>
  </w:body>
</w:document>`);

            zip.file('word/htmlDoc.html', htmlDoc);

            const content = await zip.generateAsync({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            downloadBlob(content, filename);
        } else {
            const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword;charset=utf-8' });
            downloadBlob(blob, filename);
        }

        showToast(`Invoice ${inv.no} exported to Word (.docx)`);
    } catch (err) {
        console.error('Error exporting invoice to Word:', err);
        showToast('Failed to export invoice to Word', 'error');
    }
};

window.exportInvoiceToExcel = (id, type = 'Sales') => {
    try {
        if (!window.XLSX) {
            showToast('Excel export library not available', 'error');
            return;
        }

        const inv = getInvoiceExportData(id, type);
        if (!inv) {
            showToast('Invoice record not found', 'error');
            return;
        }

        const isPurchase = inv.isPurchase;
        const comp = inv.comp;
        const party = inv.party;
        const items = inv.items;
        const isLocal = inv.gstType === 'Local';
        const isGST = inv.billType !== 'Non-GST Bill';
        const title = isPurchase ? 'PURCHASE BILL' : (isGST ? 'TAX INVOICE' : 'INVOICE');

        const aoa = [];
        aoa.push([title]);
        aoa.push([comp.legalName || comp.name || 'Company Name']);
        aoa.push([comp.address || '']);
        aoa.push([`Phone: ${comp.phone || ''} | Email: ${comp.email || ''}${comp.website ? ' | Website: ' + comp.website : ''}`]);
        aoa.push([`GSTIN: ${comp.gstin || 'N/A'} | State: ${comp.state || 'N/A'}`]);
        aoa.push([]);

        // Billing & Invoice Details
        aoa.push(['BILL TO:', '', '', '', 'INVOICE DETAILS:']);
        aoa.push(['Name:', party.name || 'N/A', '', '', 'Invoice No:', inv.no]);
        aoa.push(['Address:', (party.address || 'N/A').replace(/\r?\n/g, ', '), '', '', 'Date:', inv.date]);
        aoa.push(['GSTIN:', party.gstin || 'N/A', '', '', 'Place of Supply:', inv.supplyState]);
        aoa.push(['State:', party.state || 'N/A', '', '', 'Payment Mode:', inv.paymentMode || 'N/A']);
        if (inv.shipTo) {
            aoa.push(['SHIP TO:', inv.shipTo.replace(/\r?\n/g, ', ')]);
        }
        aoa.push([]);

        // Items Table Header
        if (!isGST) {
            aoa.push(['#', 'Description of Goods', 'HSN/SAC', 'Qty', 'Rate (₹)', 'Amount (₹)']);
            items.forEach((it, idx) => {
                aoa.push([
                    idx + 1,
                    it.name || '',
                    it.hsn || '',
                    parseFloat(it.qty) || 1,
                    parseFloat(it.price) || 0,
                    parseFloat(it.total) || 0
                ]);
            });
        } else if (isLocal) {
            aoa.push(['#', 'Description of Goods', 'HSN/SAC', 'Qty', 'Rate (₹)', 'CGST %', 'SGST %', 'Amount (₹)']);
            items.forEach((it, idx) => {
                const halfRate = (parseFloat(it.tax || 0) / 2);
                aoa.push([
                    idx + 1,
                    it.name || '',
                    it.hsn || '',
                    parseFloat(it.qty) || 1,
                    parseFloat(it.price) || 0,
                    `${halfRate.toFixed(1)}%`,
                    `${halfRate.toFixed(1)}%`,
                    parseFloat(it.total) || 0
                ]);
            });
        } else {
            aoa.push(['#', 'Description of Goods', 'HSN/SAC', 'Qty', 'Rate (₹)', 'IGST %', 'Amount (₹)']);
            items.forEach((it, idx) => {
                aoa.push([
                    idx + 1,
                    it.name || '',
                    it.hsn || '',
                    parseFloat(it.qty) || 1,
                    parseFloat(it.price) || 0,
                    `${parseFloat(it.tax || 0).toFixed(1)}%`,
                    parseFloat(it.total) || 0
                ]);
            });
        }

        aoa.push([]);
        // Totals
        const totalColIdx = (!isGST ? 4 : (isLocal ? 6 : 5));
        const emptyLead = Array(totalColIdx).fill('');
        
        aoa.push([...emptyLead, 'Sub Total (₹):', inv.subtotal]);
        if (isGST) {
            if (isLocal) {
                aoa.push([...emptyLead, 'CGST (₹):', inv.tax / 2]);
                aoa.push([...emptyLead, 'SGST (₹):', inv.tax / 2]);
            } else {
                aoa.push([...emptyLead, 'IGST (₹):', inv.tax]);
            }
        }
        aoa.push([...emptyLead, 'GRAND TOTAL (₹):', inv.total]);
        aoa.push(['Amount in Words:', inv.amountWords || '']);
        aoa.push([]);

        // Bank Details & Signatory
        aoa.push(['BANK DETAILS:', '', '', '', `FOR ${comp.legalName || comp.name || ''}:`]);
        aoa.push(['Bank Name:', comp.bankName || 'N/A']);
        if (comp.branchAddress) {
            aoa.push(['Branch Address:', comp.branchAddress]);
        }
        aoa.push(['Account No:', comp.accountNo || 'N/A']);
        aoa.push(['IFSC Code:', comp.ifscCode || 'N/A']);
        aoa.push(['A/C Holder:', comp.accountHolder || comp.legalName || 'N/A', '', '', 'Authorized Signatory']);
        if (comp.terms) {
            aoa.push([]);
            aoa.push(['Terms and Conditions:', comp.terms]);
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols'] = [
            { wch: 6 },
            { wch: 38 },
            { wch: 14 },
            { wch: 10 },
            { wch: 16 },
            { wch: 12 },
            { wch: 12 },
            { wch: 18 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Invoice");
        const filename = `${isPurchase ? 'Purchase_Bill' : 'Invoice'}_${inv.no}.xlsx`;
        XLSX.writeFile(wb, filename);
        showToast(`Invoice ${inv.no} exported to Excel (.xlsx)`);
    } catch (err) {
        console.error('Error exporting invoice to Excel:', err);
        showToast('Failed to export invoice to Excel', 'error');
    }
};

window.exportSaleToWord = (id) => window.exportInvoiceToWord(id, 'Sales');
window.exportSaleToExcelInvoice = (id) => window.exportInvoiceToExcel(id, 'Sales');
window.exportPurchaseToWord = (id) => window.exportInvoiceToWord(id, 'Purchases');
window.exportPurchaseToExcelInvoice = (id) => window.exportInvoiceToExcel(id, 'Purchases');

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
