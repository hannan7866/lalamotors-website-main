// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
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
            
        } catch (error) {
            console.error('Error loading spare parts data:', error);
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
    const brandSelect = document.getElementById('partBrand');
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

    // Update model options based on selected brand
function updateModelOptions(brand) {
    const modelSelect = document.getElementById('partModel');
        if (!modelSelect || !window.brandModels) return;
        
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    
        if (brand && window.brandModels[brand]) {
            window.brandModels[brand].forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
    }
}

    // Update category options based on selected brand and model
function updateCategoryOptions(brand, model) {
    const categorySelect = document.getElementById('partCategory');
        if (!categorySelect || !window.sparePartsData) return;
        
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (brand && model) {
            const brandModelParts = window.sparePartsData.filter(part => 
                part.brand === brand && part.model === model
            );
            
            const categories = [...new Set(brandModelParts.map(part => part.category))].sort();
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
    }
}

    // Update part options based on selected brand, model, and category
function updatePartOptions(brand, model, category) {
    const partSelect = document.getElementById('partName');
        if (!partSelect || !window.sparePartsData) return;
        
    partSelect.innerHTML = '<option value="">Select Part</option>';
    
    if (brand && model && category) {
            const parts = window.sparePartsData.filter(part => 
                part.brand === brand && 
                part.model === model && 
                part.category === category
            );
            
            parts.forEach(part => {
                const option = document.createElement('option');
                option.value = part.name;
                option.textContent = `${part.name} (₹${part.price})`;
                partSelect.appendChild(option);
            });
        }
    }
    
    // Initialize the data loading
    loadSparePartsData();

    // Add change event listeners
    const partBrand = document.getElementById('partBrand');
    const partModel = document.getElementById('partModel');
    const partCategory = document.getElementById('partCategory');
    
    if (partBrand) {
        partBrand.addEventListener('change', (e) => {
            console.log('Brand changed to:', e.target.value);
        const brand = e.target.value;
        updateModelOptions(brand);
        updateCategoryOptions('', '');
        updatePartOptions('', '', '');
    });
    }

    if (partModel) {
        partModel.addEventListener('change', (e) => {
            console.log('Model changed to:', e.target.value);
        const brand = document.getElementById('partBrand').value;
        const model = e.target.value;
        updateCategoryOptions(brand, model);
        updatePartOptions('', '', '');
    });
    }

    if (partCategory) {
        partCategory.addEventListener('change', (e) => {
            console.log('Category changed to:', e.target.value);
        const brand = document.getElementById('partBrand').value;
        const model = document.getElementById('partModel').value;
        const category = e.target.value;
        updatePartOptions(brand, model, category);
    });
    }
}); 