// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded, initializing spare parts data...');
    
    // Initialize Supabase client
    const supabaseUrl = 'https://fjhlglaivlbrowsuxres.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxnbGFpdmxicm93c3V4cmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTUwNDYsImV4cCI6MjA2NjE3MTA0Nn0.0p7afOyJ_Q67d0k7ZTQWnxYIJ6eseuNx_7yjupT6eWo';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // Load spare parts data from Supabase
    async function loadSparePartsData() {
        try {
            console.log('Loading spare parts data from Supabase...');
            
            let allData = [];
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;
            
            // Fetch all data using pagination
            while (hasMore) {
                const { data, error } = await supabase
                .from('autoparts')
                .select('*')
                .order('brand', { ascending: true })
                .range(page * pageSize, (page + 1) * pageSize - 1);
                
                if (error) {
                    throw new Error(`Supabase error: ${error.message}`);
                }
                
                if (data && data.length > 0) {
                    allData = allData.concat(data);
                    console.log(`Loaded page ${page + 1}: ${data.length} parts (Total: ${allData.length})`);
                    page++;
                } else {
                    hasMore = false;
                }
            }
            
            console.log('Spare parts data loaded successfully:', allData.length, 'parts found');
            
            // Process the data
            processSparePartsData(allData);
            updateBrandOptions();
            
            // Hide any error messages
            const adminError = document.getElementById('admin-error-message');
            if (adminError) {
                adminError.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error loading spare parts data:', error);
            
            // Display error to user
            const adminError = document.getElementById('admin-error-message');
            if (adminError) {
                adminError.textContent = 'Failed to load spare parts data: ' + error.message;
                adminError.style.display = 'block';
                adminError.classList.add('show');
            }
        }
    }
    
    // Process spare parts data from Supabase
    function processSparePartsData(data) {
        if (!Array.isArray(data)) {
            console.error('Invalid data format received from Supabase');
            return;
        }
        
        // Store the data globally
        window.sparePartsData = data;
        
        // Extract unique brands
        const brands = [...new Set(data.map(part => part.brand))].sort();
        window.availableBrands = brands;
        
        // Extract unique models for each brand
        window.brandModels = {};
        brands.forEach(brand => {
            const brandParts = data.filter(part => part.brand === brand);
            const models = [...new Set(brandParts.map(part => part.model))].sort();
            window.brandModels[brand] = models;
        });
        
        // Extract unique categories
        const categories = [...new Set(data.map(part => part.category))].sort();
        window.availableCategories = categories;
        
        console.log('Data processed successfully:', {
            totalParts: data.length,
            brands: brands.length,
            categories: categories.length
        });
    }
    
    // Update brand options in the form
    function updateBrandOptions() {
        const brandSelect = document.getElementById('brand');
        if (!brandSelect || !window.availableBrands) return;
        
        // Clear existing options
        brandSelect.innerHTML = '<option value="">Select Brand</option>';
        
        // Add brand options
        window.availableBrands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
    }
    
    // Initialize the data loading
    loadSparePartsData();
}); 
