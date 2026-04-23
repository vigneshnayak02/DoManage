// Supabase Configuration
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Initialize Supabase client
let supabaseClient = null;

try {
    // Only initialize if the configuration is set
    if (SUPABASE_URL && SUPABASE_ANON_KEY && 
        SUPABASE_URL !== 'https://your-project-id.supabase.co' && 
        SUPABASE_ANON_KEY !== 'your-anon-key-here') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized successfully');
    } else {
        console.warn('Supabase configuration not set. Using mock mode.');
    }
} catch (error) {
    console.error('Error initializing Supabase:', error);
}
