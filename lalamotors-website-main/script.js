// Sample vehicle data
const vehicles = [
    {
        id: 1,
        name: "Luxury Sedan 2024",
        price: "$45,000",
        image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=600&q=80",
        description: "Elegant and powerful luxury sedan with advanced features"
    },
    {
        id: 2,
        name: "SUV Premium",
        price: "$55,000",
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80",
        description: "Spacious SUV perfect for family adventures"
    },
    {
        id: 3,
        name: "Sports Coupe",
        price: "$65,000",
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80",
        description: "High-performance sports car for thrill-seekers"
    }
];

// Populate vehicle grid
function populateVehicles() {
    const vehicleGrid = document.querySelector('.vehicle-grid');
    if (!vehicleGrid) return;

    vehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';
        vehicleCard.style.backgroundColor = '#fff';
        vehicleCard.style.borderRadius = '10px';
        vehicleCard.style.overflow = 'hidden';
        vehicleCard.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        vehicleCard.style.transition = 'transform 0.3s ease';

        vehicleCard.innerHTML = `
            <img src="${vehicle.image}" alt="${vehicle.name}" style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 1.5rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${vehicle.name}</h3>
                <p style="color: var(--secondary-color); font-weight: bold; margin-bottom: 0.5rem;">${vehicle.price}</p>
                <p style="color: var(--text-color); margin-bottom: 1rem;">${vehicle.description}</p>
                <button onclick="showVehicleDetails(${vehicle.id})" 
                        style="background-color: var(--secondary-color); 
                               color: white; 
                               border: none; 
                               padding: 0.5rem 1rem; 
                               border-radius: 5px; 
                               cursor: pointer;">
                    View Details
                </button>
            </div>
        `;

        vehicleCard.addEventListener('mouseenter', () => {
            vehicleCard.style.transform = 'translateY(-5px)';
        });

        vehicleCard.addEventListener('mouseleave', () => {
            vehicleCard.style.transform = 'translateY(0)';
        });

        vehicleGrid.appendChild(vehicleCard);
    });
}

// Mobile navigation
function setupMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// Smooth scrolling
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                const navLinks = document.querySelector('.nav-links');
                navLinks.classList.remove('active');
            }
        });
    });
}

// Generate Booking ID
function generateBookingId() {
    const timestamp = new Date().getTime();
    return `LALA${timestamp}`;
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show confirmation message
function showConfirmationMessage(message, isSuccess) {
    const confirmationMessage = document.getElementById('confirmation-message');
    if (!confirmationMessage) return;

    confirmationMessage.textContent = message;
    confirmationMessage.className = 'confirmation-message ' + (isSuccess ? 'success' : 'error');
    
    // Scroll to message
    confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Form validation
function validateBookingForm(data) {
    // Check if all fields are filled
    if (Object.values(data).some(value => !value.trim())) {
        showConfirmationMessage('Please fill in all required fields.', false);
        return false;
    }

    // Validate phone number (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(data.phone.replace(/[^0-9]/g, ''))) {
        showConfirmationMessage('Please enter a valid 10-digit phone number.', false);
        return false;
    }

    // Validate date (must be today or future)
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showConfirmationMessage('Please select a future date for booking.', false);
        return false;
    }

    return true;
}

// Setup booking form
document.getElementById("booking-form")?.addEventListener("submit", function(e) {
  e.preventDefault(); // prevent form reload

  const bookingData = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    vehicle: document.getElementById("vehicle").value,
    service: document.getElementById("service").value,
    date: document.getElementById("date").value,
    address: document.getElementById("address").value
  };

  fetch("/api/booking", {
    method: "POST",
    body: JSON.stringify(bookingData),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => response.json())
  .then(data => {
    alert("✅ Booking submitted successfully!");
    document.getElementById("booking-form").reset();
  })
  .catch(error => {
    alert("❌ Error submitting booking.");
    console.error(error);
  });
});

// Vehicle details modal
function showVehicleDetails(vehicleId) {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1001';

    modal.innerHTML = `
        <div style="background: white; 
                    padding: 2rem; 
                    border-radius: 10px; 
                    max-width: 500px; 
                    width: 90%; 
                    position: relative;">
            <button onclick="this.closest('div[style*=fixed]').remove()" 
                    style="position: absolute; 
                           top: 1rem; 
                           right: 1rem; 
                           background: none; 
                           border: none; 
                           font-size: 1.5rem; 
                           cursor: pointer;">×</button>
            <img src="${vehicle.image}" 
                 alt="${vehicle.name}" 
                 style="width: 100%; 
                        height: 300px; 
                        object-fit: cover; 
                        border-radius: 5px; 
                        margin-bottom: 1rem;">
            <h3 style="color: var(--primary-color); 
                       margin-bottom: 0.5rem;">${vehicle.name}</h3>
            <p style="color: var(--secondary-color); 
                      font-weight: bold; 
                      margin-bottom: 0.5rem;">${vehicle.price}</p>
            <p style="color: var(--text-color); 
                      margin-bottom: 1rem;">${vehicle.description}</p>
            <button onclick="window.location.href='#contact'" 
                    style="background-color: var(--secondary-color); 
                           color: white; 
                           border: none; 
                           padding: 0.5rem 1rem; 
                           border-radius: 5px; 
                           cursor: pointer;">
                Inquire Now
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

// Initialize all features when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateVehicles();
    setupMobileNav();
    setupSmoothScroll();
});

// --- Autoparts Brands Grid ---
const brands = [
  { name: 'Hero', icon: 'fa-motorcycle', logo: 'https://logo.clearbit.com/heromotocorp.com', models: [
    'Splendor Plus', 'HF Deluxe', 'Passion Pro / Passion Plus', 'Super Splendor', 'Glamour', 'Xtreme 160R', 'Xpulse 200', 'Karizma XMR', 'Xtreme 200S', 'Xtreme 125R', 'Xtreme 200T', 'CBZ Xtreme', 'Hunk', 'Achiever', 'Ignitor', 'iSmart 110', 'Splendor NXG', 'HF 100', 'Pleasure Plus', 'Destini 125', 'Maestro Edge 110', 'Maestro Edge 125'
  ] },
  {
    name: 'Bajaj',
    icon: 'fa-motorcycle',
    logo: 'https://images.seeklogo.com/logo-png/32/1/bajaj-logo-png_seeklogo-320908.png',
    models: [
      'Pulsar 125', 'Pulsar 150', 'Pulsar NS200', 'Pulsar NS160', 'Pulsar N160', 'Pulsar N250', 'Pulsar RS200', 'Dominar 250', 'Dominar 400', 'Avenger 160', 'Avenger 220', 'CT100', 'CT110', 'Platina 100', 'Platina 110 H-Gear', 'Discover 125', 'Discover 150'
    ]
  },
  {
    name: 'TVS',
    icon: 'fa-motorcycle',
    logo: 'https://images.seeklogo.com/logo-png/24/1/tvs-motors-logo-png_seeklogo-247910.png',
    models: [
      'Sport', 'Star City Plus', 'Radeon', 'Apache RTR 160', 'Apache RTR 160 4V', 'Apache RTR 180', 'Apache RTR 200 4V', 'Apache RR 310', 'Raider 125', 'Ronin', 'XL100', 'Scooty Pep+', 'Zest 110', 'Jupiter 110', 'Jupiter 125', 'NTorq 125'
    ]
  },
  {
    name: 'Honda',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/honda2wheelersindia.com',
    models: [
      'Shine 100', 'Shine 125', 'SP 125', 'Unicorn', 'XBlade', 'Hornet 2.0', 'CB200X', 'CB300F', "CB350 H'ness", 'CB350 RS', 'Activa 6G', 'Activa 5G', 'Activa 4G', 'Activa 3G', 'Activa', 'Activa 125', 'Dio', 'Dio 125'
    ]
  },
  {
    name: 'Yamaha',
    icon: 'fa-motorcycle',
    logo: 'https://images.seeklogo.com/logo-png/15/1/yamaha-logo-png_seeklogo-154906.png',
    models: [
      'FZ V3', 'FZ-S FI V4', 'FZ-X', 'R15 V4', 'R15M', 'MT-15 V2', 'FZ25', 'FZS25', 'Fascino 125', 'RayZR 125'
    ]
  },
  {
    name: 'KTM',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/ktmindia.com',
    models: [
      'Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 125', 'RC 200', 'RC 390', '390 Adventure', '390 Adventure X'
    ]
  },
  {
    name: 'Suzuki',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/suzukimotorcycle.co.in',
    models: [
      'Gixxer', 'Gixxer SF', 'Gixxer 250', 'Gixxer SF 250', 'Intruder 150', 'Access 125', 'Burgman Street 125', 'Avenis 125'
    ]
  },
  {
    name: 'Jawa / Yezdi',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/jawamotorcycles.com',
    models: [
      'Jawa 42', 'Jawa Classic', 'Jawa Perak', 'Jawa 350', 'Yezdi Roadster', 'Yezdi Scrambler', 'Yezdi Adventure'
    ]
  },
  {
    name: 'Kawasaki',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/kawasaki-india.com',
    models: [
      'Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z900'
    ]
  },
  {
    name: 'Benelli',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/benelli.com',
    models: [
      'Imperiale 400', 'TRK 502', 'Leoncino 250', '600i', '300i'
    ]
  },
  {
    name: 'Royal Enfield',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/royalenfield.com',
    models: [
      'Bullet 350', 'Classic 350', 'Hunter 350', 'Meteor 350', 'Scram 411', 'Himalayan 450', 'Interceptor 650', 'Continental GT 650'
    ]
  },
  {
    name: 'Aprilia',
    icon: 'fa-motorcycle',
    logo: 'https://images.seeklogo.com/logo-png/0/1/aprilia-logo-png_seeklogo-9920.png',
    models: [
      'SR 125', 'SR 160', 'SXR 125', 'SXR 160', 'RS 660', 'Tuono 660', 'RSV4 1100 Factory'
    ]
  },
  {
    name: 'Harley-Davidson',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/harley-davidson.com',
    models: [
      'X440', 'Iron 883', 'Forty-Eight', 'Nightster', 'Street Bob 114', 'Fat Bob 114', 'Fat Boy 114', 'Heritage Classic', 'Street Glide', 'Road Glide'
    ]
  },
  {
    name: 'BMW',
    icon: 'fa-motorcycle',
    logo: 'https://images.seeklogo.com/logo-png/17/1/bmw-logo-png_seeklogo-170616.png',
    models: [
      'G310R', 'G310GS', 'F900R', 'F900XR', 'R1250GS', 'S1000RR', 'R18'
    ]
  },
  {
    name: 'Ducati',
    icon: 'fa-motorcycle',
    logo: 'https://logo.clearbit.com/ducati.com',
    models: [
      'Monster', 'Hypermotard 950', 'Scrambler Icon', 'Scrambler 1100', 'Multistrada V4', 'Diavel 1260', 'Panigale V2', 'Panigale V4', 'Streetfighter V2', 'Streetfighter V4'
    ]
  }
];

const partCategories = [
  { name: 'Engine', parts: [
    'Piston Kit', 'Cylinder Block', 'Crankshaft', 'Camshaft', 'Engine Valve', 'Valve Spring', 'Timing Chain', 'Engine Gasket Set', 'Rocker Arm', 'Oil Pump', 'Engine Head', 'Air Filter', 'Fuel Injector / Carburetor', 'Spark Plug', 'Engine Oil Cap', 'Timing Gear', 'Tappet Set'
  ] },
  { name: 'Clutch', parts: [
    'Clutch Plate', 'Clutch Shoe (for scooters)', 'Clutch Bell', 'Clutch Cable', 'Clutch Lever', 'Clutch Hub', 'Clutch Spring', 'Clutch Center', 'Pressure Plate', 'Clutch Cover'
  ] },
  { name: 'Cables', parts: [
    'Accelerator Cable', 'Clutch Cable', 'Front Brake Cable', 'Rear Brake Cable', 'Choke Cable', 'Speedometer Cable', 'Tachometer Cable', 'Gear Shift Cable'
  ] },
  { name: 'Brakes', parts: [
    'Front Disc Plate', 'Rear Disc Plate', 'Disc Pads', 'Brake Shoes', 'Brake Drum', 'Master Cylinder', 'Brake Caliper', 'Brake Lever', 'Brake Fluid Reservoir Cap', 'Brake Oil Pipe'
  ] },
  { name: 'Suspension', parts: [
    'Front Fork Assembly', 'Fork Oil Seal', 'Rear Shock Absorber', 'Suspension Bush', 'Mono Shock', 'Swing Arm', 'Front Fork Dust Cover'
  ] },
  { name: 'Electrical', parts: [
    'Battery', 'Headlight Assembly', 'Taillight Assembly', 'Turn Signal Indicators', 'CDI Unit', 'Regulator/Rectifier', 'Horn', 'Speedometer/Instrument Cluster', 'Wiring Harness', 'Starter Relay', 'Self Motor', 'Ignition Coil', 'Flasher Relay', 'Switch Assembly (Handlebar switches)'
  ] },
  { name: 'Body', parts: [
    'Side Panels', 'Mudguards (Front & Rear)', 'Visor / Windshield', 'Headlight Visor', 'Tank Cover', 'Seat Assembly', 'Foot Rest', 'Handle Bar', 'Number Plate Holder', 'Mirrors', 'Leg Guard', 'Saree Guard', 'Chain Cover'
  ] },
  { name: 'Tyres & Related', parts: [
    'Front Tyre', 'Rear Tyre', 'Tube (if applicable)', 'Rim (Alloy/Spoke)', 'Spokes Set', 'Tyre Valve', 'Wheel Bearing', 'Axle', 'Sprocket Set', 'Chain & Sprocket Kit'
  ] }
];

// List of all scooter models (across brands)
const scooterModels = [
  // Hero
  'Pleasure Plus', 'Destini 125', 'Maestro Edge 110', 'Maestro Edge 125',
  // TVS
  'Scooty Pep+', 'Zest 110', 'Jupiter 110', 'Jupiter 125', 'NTorq 125', 'XL100',
  // Honda
  'Activa 6G', 'Activa 5G', 'Activa 4G', 'Activa 3G', 'Activa', 'Activa 125', 'Dio', 'Dio 125',
  // Yamaha
  'Fascino 125', 'RayZR 125',
  // Suzuki
  'Access 125', 'Burgman Street 125', 'Avenis 125',
  // Aprilia
  'SR 125', 'SR 160', 'SXR 125', 'SXR 160'
];

// Scooter-specific part categories and parts
const scooterPartCategories = [
  { name: 'Engine', parts: [
    'Cylinder Kit', 'Piston & Ring', 'Rocker Arm Set', 'Valve Set (Inlet + Exhaust)', 'Engine Head', 'Magnet Coil', 'Crankshaft', 'Camshaft', 'Timing Chain', 'Engine Mounts', 'Spark Plug'
  ] },
  { name: 'Transmission (CVT)', parts: [
    'CVT Belt (Fan Belt)', 'Clutch Shoe', 'Clutch Bell', 'Variator Pulley Set', 'Kick Shaft & Spring', 'Gear Oil', 'Drive Face / Ramp Plate'
  ] },
  { name: 'Electrical', parts: [
    'Battery', 'Self Motor', 'Ignition Coil', 'CDI Unit', 'Regulator/Rectifier', 'Headlight Assembly', 'Tail Light', 'Indicators', 'Horn', 'Wiring Harness', 'Speedometer Sensor'
  ] },
  { name: 'Brakes', parts: [
    'Front Brake Shoe/Disc Pad', 'Rear Brake Shoe', 'Brake Cam Lever', 'Brake Switch', 'Master Cylinder (if disc)', 'Brake Lever (RH & LH)'
  ] },
  { name: 'Cables', parts: [
    'Throttle Cable', 'Brake Cable (Front/Rear)', 'Speedometer Cable', 'Choke Cable'
  ] },
  { name: 'Suspension', parts: [
    'Front Suspension Fork', 'Rear Shock Absorber', 'Suspension Bush Kit'
  ] },
  { name: 'Body Panels', parts: [
    'Chest (Front Panel)', 'Nose (Headlight Mask)', 'Side Panels', 'Floor Board', 'Mudguard (Front & Rear)', 'Handle Cover', 'Tail Panel', 'Glove Box', 'Seat Assembly', 'Grab Rail', 'Footrest'
  ] },
  { name: 'Tyres & Wheels', parts: [
    'Front Tyre', 'Rear Tyre', 'Alloy Wheels', 'Tube (if applicable)', 'Rim Strip', 'Valve', 'Wheel Bearings'
  ] },
  { name: 'Accessories / Misc', parts: [
    'Side Stand', 'Main Stand', 'Lock Set', 'Key Set', 'Mirror Set', 'Foot Mat', 'Indicator Buzzer', 'Number Plate Frame', 'Tool Kit'
  ] }
];

function renderBrandGrid() {
  const brandStep = document.getElementById('brand-step');
  if (!brandStep) return;
  brandStep.innerHTML = '';
  // Add heading
  const heading = document.createElement('h2');
  heading.className = 'section-title';
  heading.textContent = 'Select Your Bike Brand';
  brandStep.appendChild(heading);
  // Brand grid
  const grid = document.createElement('div');
  grid.className = 'brand-grid';
  brands.forEach((brand, idx) => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.innerHTML = `<img src="${brand.logo}" alt="${brand.name} logo" class="brand-logo" onerror="this.style.display='none';this.parentNode.querySelector('i').style.display='block';"/><i class='fas ${brand.icon}' style='display:none;'></i><span>${brand.name}</span><br><a href="#" class="brand-link" style="display:inline-block;margin-top:0.7rem;color:var(--primary-blue);font-weight:600;text-decoration:underline;font-size:1.05rem;">${brand.name} BikeAutoParts &rarr;</a>`;
    // Brand link click: show full parts gallery for this brand
    card.querySelector('.brand-link').onclick = (e) => {
      e.preventDefault();
      renderModelGridFromCatalog(brand.name);
    };
    // Card click: show models as before
    card.onclick = (e) => {
      if (e.target.classList.contains('brand-link')) return;
      renderModelGridFromCatalog(brand.name);
    };
    grid.appendChild(card);
  });
  brandStep.appendChild(grid);
  brandStep.style.display = 'block';
  document.getElementById('model-step').style.display = 'none';
  document.getElementById('parts-step').style.display = 'none';
  document.getElementById('part-listing-step').style.display = 'none';
}

function renderModelGridFromCatalog(brandName) {
  const modelStep = document.getElementById('model-step');
  const brandStep = document.getElementById('brand-step');
  modelStep.innerHTML = '';
  // Get models from the brands array
  const brandObj = brands.find(b => b.name === brandName);
  const models = brandObj ? brandObj.models : [];
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Brands';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderBrandGrid();
  modelStep.appendChild(backBtn);
  const title = document.createElement('h3');
  title.textContent = `Select Model for ${brandName}`;
  modelStep.appendChild(title);
  const grid = document.createElement('div');
  grid.className = 'model-grid';
  models.forEach(model => {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `<span>${model}</span>`;
    card.onclick = () => renderPartsStepFromCatalog(brandName, model);
    grid.appendChild(card);
  });
  modelStep.appendChild(grid);
  brandStep.style.display = 'none';
  modelStep.style.display = 'block';
  document.getElementById('parts-step').style.display = 'none';
  document.getElementById('part-listing-step').style.display = 'none';
}

function renderPartsStepFromCatalog(brandName, model) {
  const partsStep = document.getElementById('parts-step');
  const modelStep = document.getElementById('model-step');
  partsStep.innerHTML = '';
  // Use scooterPartCategories if model is a scooter, else use partCategories
  const isScooter = scooterModels.includes(model);
  const categories = isScooter
    ? scooterPartCategories.map(cat => cat.name)
    : partCategories.map(cat => cat.name);
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Models';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderModelGridFromCatalog(brandName);
  partsStep.appendChild(backBtn);
  const title = document.createElement('h3');
  title.textContent = `Select Part Category for ${model}`;
  partsStep.appendChild(title);
  const catGrid = document.createElement('div');
  catGrid.className = 'model-grid';
  categories.forEach(cat => {
    const catCard = document.createElement('div');
    catCard.className = 'model-card';
    catCard.innerHTML = `<span>${cat}</span>`;
    catCard.onclick = () => renderPartsListFromCatalog(brandName, model, cat);
    catGrid.appendChild(catCard);
  });
  partsStep.appendChild(catGrid);
  modelStep.style.display = 'none';
  partsStep.style.display = 'block';
  document.getElementById('part-listing-step').style.display = 'none';
}

function renderPartsListFromCatalog(brandName, model, category) {
  const partsStep = document.getElementById('parts-step');
  partsStep.innerHTML = '';
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Categories';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderPartsStepFromCatalog(brandName, model);
  partsStep.appendChild(backBtn);
  const title = document.createElement('h3');
  title.textContent = `${category} Parts for ${model}`;
  partsStep.appendChild(title);
  const list = document.createElement('div');
  list.className = 'model-grid';
  // Use scooterPartCategories if model is a scooter, else use partCategories
  const isScooter = scooterModels.includes(model);
  const catObj = isScooter
    ? scooterPartCategories.find(cat => cat.name === category)
    : partCategories.find(cat => cat.name === category);
  const parts = catObj ? catObj.parts : [];
  parts.forEach(part => {
    const partCard = document.createElement('div');
    partCard.className = 'model-card';
    partCard.innerHTML = `<span>${part}</span>`;
    list.appendChild(partCard);
  });
  partsStep.appendChild(list);
  document.getElementById('part-listing-step').style.display = 'none';
}

function openEnquiryModal(brand, model, category, part) {
  const modal = document.getElementById('enquiry-modal');
  modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:12px;max-width:400px;margin:5vh auto;box-shadow:0 4px 24px rgba(43,75,140,0.18);position:relative;'>
    <button onclick='closeEnquiryModal()' style='position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;'>&times;</button>
    <h3 style='color:var(--primary-blue);margin-bottom:1rem;'>Enquire for ${part}</h3>
    <form id='enquiry-form'>
      <input type='text' name='name' placeholder='Your Name' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <input type='tel' name='phone' placeholder='Phone Number' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <input type='text' name='city' value='Agra' readonly style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);background:#f7f7f7;'>
      <textarea name='query' placeholder='Your Query (optional)' style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'></textarea>
      <input type='hidden' name='brand' value='${brand}'>
      <input type='hidden' name='model' value='${model}'>
      <input type='hidden' name='category' value='${category}'>
      <input type='hidden' name='part' value='${part}'>
      <button type='submit' class='primary-button' style='width:100%;'>Send Enquiry</button>
    </form>
  </div>`;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.getElementById('enquiry-form').onsubmit = function(e) {
    e.preventDefault();
    modal.innerHTML = `<div style='padding:2rem;text-align:center;'><h3 style='color:var(--primary-blue);'>Thank you!</h3><p>Your enquiry has been submitted.<br>We will contact you soon.</p><button class='primary-button' onclick='closeEnquiryModal()' style='margin-top:1.5rem;'>Close</button></div>`;
  };
}

function closeEnquiryModal() {
  const modal = document.getElementById('enquiry-modal');
  modal.style.display = 'none';
  modal.innerHTML = '';
  document.body.style.overflow = '';
}

// --- Global Search Bar for Parts ---
function setupGlobalPartSearch() {
  const searchInput = document.getElementById('part-search');
  if (!searchInput) return;
  searchInput.placeholder = 'Search parts, brands, models, or categories...';
  searchInput.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    const partStep = document.getElementById('part-listing-step');
    if (!q) {
      renderBrandGrid();
      document.getElementById('model-step').style.display = 'none';
      document.getElementById('parts-step').style.display = 'none';
      partStep.style.display = 'none';
      return;
    }
    // Search in catalog
    let found = false;
    partStep.innerHTML = '';
    Object.entries(autopartsCatalog).forEach(([brand, models]) => {
      Object.entries(models).forEach(([model, categories]) => {
        Object.entries(categories).forEach(([cat, parts]) => {
          parts.forEach(part => {
            if (
              brand.toLowerCase().includes(q) ||
              model.toLowerCase().includes(q) ||
              cat.toLowerCase().includes(q) ||
              part.toLowerCase().includes(q)
            ) {
              if (!found) {
                partStep.innerHTML = `<h3>Search Results</h3>`;
                found = true;
              }
              const card = document.createElement('div');
              card.className = 'model-card';
              card.innerHTML = `<b>${brand}</b> / <b>${model}</b> / <b>${cat}</b><br><span>${part}</span><button class='primary-button' style='margin-top:0.7rem;font-size:0.95rem;' onclick='openEnquiryModal("${brand}", "${model}", "${cat}", "${part}")'>Enquire Now</button>`;
              partStep.appendChild(card);
            }
          });
        });
      });
    });
    document.getElementById('brand-step').style.display = 'none';
    document.getElementById('model-step').style.display = 'none';
    document.getElementById('parts-step').style.display = 'none';
    partStep.style.display = 'block';
    if (!found) {
      partStep.innerHTML = `<p style='text-align:center;color:var(--primary-blue);margin-top:2rem;'>No results found.</p>`;
    }
  });
}

// On DOMContentLoaded, setup the new logic
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.endsWith('autoparts.html')) {
    renderBrandGrid();
    setupGlobalPartSearch();
    if (document.getElementById('cart-icon')) {
      document.getElementById('cart-icon').onclick = showCartModal;
      document.getElementById('cart-count').textContent = getCart().reduce((a, b) => a + b.qty, 0);
    }
    return;
  }
  if (path.endsWith('servicing.html')) {
    renderBrandGridFor('servicing-brand-step');
  } else if (path.endsWith('repairing.html')) {
    renderBrandGridFor('repairing-brand-step');
  } else if (path.endsWith('restoring.html')) {
    renderBrandGridFor('restoring-brand-step');
  } else if (path.endsWith('painting.html')) {
    renderBrandGridFor('painting-brand-step');
  } else if (path.endsWith('sale.html')) {
    renderBrandGridFor('sale-brand-step');
  }
});

function renderBrandGridFor(targetDivId, onBrandClick) {
  const brandStep = document.getElementById(targetDivId);
  if (!brandStep) return;
  brandStep.innerHTML = '';
  // Add heading
  const heading = document.createElement('h2');
  heading.className = 'section-title';
  heading.textContent = 'Select Your Bike Brand';
  brandStep.appendChild(heading);
  // Brand grid
  const grid = document.createElement('div');
  grid.className = 'brand-grid';
  brands.forEach((brand, idx) => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    card.innerHTML = `<img src="${brand.logo}" alt="${brand.name} logo" class="brand-logo" onerror="this.style.display='none';this.parentNode.querySelector('i').style.display='block';"/><i class='fas ${brand.icon}' style='display:none;'></i><span>${brand.name}</span>`;
    card.onclick = () => onBrandClick ? onBrandClick(idx) : null;
    grid.appendChild(card);
  });
  brandStep.appendChild(grid);
}

// --- Sale & Purchase Logic ---
function getBikes() {
  return JSON.parse(localStorage.getItem('bikes') || '[]');
}
function saveBikes(bikes) {
  localStorage.setItem('bikes', JSON.stringify(bikes));
}
function renderBikeListings() {
  const grid = document.querySelector('.bike-listings-grid');
  if (!grid) return;
  let bikes = getBikes();
  // Apply filters
  const brand = document.getElementById('filter-brand')?.value || '';
  const model = document.getElementById('filter-model')?.value || '';
  const price = document.getElementById('filter-price')?.value || '';
  if (brand) bikes = bikes.filter(b => b.brand === brand);
  if (model) bikes = bikes.filter(b => b.model === model);
  if (price) {
    const [min, max] = price.split('-').map(Number);
    bikes = bikes.filter(b => b.price >= min && b.price <= max);
  }
  grid.innerHTML = '';
  if (!bikes.length) {
    grid.innerHTML = `<p style='text-align:center;color:var(--primary-blue);margin-top:2rem;'>No bikes found.</p>`;
    return;
  }
  bikes.forEach((bike, idx) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <h3>${bike.brand} ${bike.model}</h3>
      <p><b>Year:</b> ${bike.year} | <b>Condition:</b> ${bike.condition}</p>
      <p><b>Price:</b> ₹${bike.price.toLocaleString()}</p>
      <button class='primary-button' onclick='openSaleContactModal(${idx})'>I'm Interested</button>
    `;
    grid.appendChild(card);
  });
}
function updateModelFilter() {
  const bikes = getBikes();
  const brand = document.getElementById('filter-brand')?.value || '';
  const modelSel = document.getElementById('filter-model');
  if (!modelSel) return;
  const models = [...new Set(bikes.filter(b => !brand || b.brand === brand).map(b => b.model))];
  modelSel.innerHTML = '<option value="">All Models</option>' + models.map(m => `<option>${m}</option>`).join('');
}
function setupSaleFilters() {
  const brandSel = document.getElementById('filter-brand');
  const modelSel = document.getElementById('filter-model');
  const priceSel = document.getElementById('filter-price');
  [brandSel, modelSel, priceSel].forEach(sel => sel && sel.addEventListener('change', () => {
    if (sel === brandSel) updateModelFilter();
    renderBikeListings();
  }));
}
function setupBikeUploadForm() {
  const form = document.getElementById('bike-upload-form');
  if (!form) return;
  form.onsubmit = function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.price = Number(data.price);
    let bikes = getBikes();
    bikes.push(data);
    saveBikes(bikes);
    form.reset();
    document.getElementById('bike-upload-success').textContent = 'Bike listed successfully!';
    document.getElementById('bike-upload-success').style.display = 'block';
    renderBikeListings();
    updateModelFilter();
    setTimeout(() => { document.getElementById('bike-upload-success').style.display = 'none'; }, 2500);
  };
}
function openSaleContactModal(idx) {
  const bikes = getBikes();
  const bike = bikes[idx];
  const modal = document.getElementById('sale-contact-modal');
  modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:12px;max-width:400px;margin:5vh auto;box-shadow:0 4px 24px rgba(43,75,140,0.18);position:relative;'>
    <button onclick='closeSaleContactModal()' style='position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;'>&times;</button>
    <h3 style='color:var(--primary-blue);margin-bottom:1rem;'>Contact Seller</h3>
    <p><b>${bike.brand} ${bike.model}</b> | Year: ${bike.year}</p>
    <p><b>Price:</b> ₹${bike.price.toLocaleString()}</p>
    <form id='sale-contact-form'>
      <input type='text' name='name' placeholder='Your Name' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <input type='tel' name='phone' placeholder='Your Phone Number' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <textarea name='message' placeholder='Message to Seller (optional)' style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'></textarea>
      <button type='submit' class='primary-button' style='width:100%;'>Send Interest</button>
    </form>
  </div>`;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.getElementById('sale-contact-form').onsubmit = function(e) {
    e.preventDefault();
    modal.innerHTML = `<div style='padding:2rem;text-align:center;'><h3 style='color:var(--primary-blue);'>Thank you!</h3><p>Your interest has been sent to the seller.<br>They will contact you soon.</p><button class='primary-button' onclick='closeSaleContactModal()' style='margin-top:1.5rem;'>Close</button></div>`;
  };
}
function closeSaleContactModal() {
  const modal = document.getElementById('sale-contact-modal');
  modal.style.display = 'none';
  modal.innerHTML = '';
  document.body.style.overflow = '';
}
// On DOMContentLoaded, setup Sale & Purchase logic
window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.endsWith('sale.html')) {
    renderBikeListings();
    setupSaleFilters();
    setupBikeUploadForm();
    updateModelFilter();
    return;
  }
});

// --- Autoparts Catalog & Cart Logic ---
const autopartsCatalog = [
  {
    brand: 'Hero',
    models: [
      {
        name: 'Splendor',
        parts: [
          { name: 'Air Filter', price: 280, img: 'https://imgd.aeplcdn.com/664x374/bw/models/hero-splendor-plus-xtec-right-front-three-quarter-2.png', category: 'Engine' },
          { name: 'Clutch Plate', price: 350, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/hero-splendor-clutch-plate-set-500x500.jpg', category: 'Clutch' },
          { name: 'Cylinder Block Kit', price: 3100, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/hero-cylinder-block-kit-500x500.jpg', category: 'Engine' }
        ]
      },
      {
        name: 'HF Deluxe',
        parts: [
          { name: 'Air Filter', price: 280, img: 'https://imgd.aeplcdn.com/664x374/bw/models/hero-hf-deluxe-right-front-three-quarter-2.png', category: 'Engine' },
          { name: 'Clutch Plate', price: 340, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/hero-splendor-clutch-plate-set-500x500.jpg', category: 'Clutch' }
        ]
      }
    ]
  },
  {
    brand: 'Honda',
    models: [
      {
        name: 'Activa',
        parts: [
          { name: 'Air Filter', price: 230, img: 'https://imgd.aeplcdn.com/664x374/bw/models/honda-activa-6g-right-front-three-quarter-2.png', category: 'Engine' },
          { name: 'Clutch Plate', price: 360, img: 'https://5.imimg.com/data5/SELLER/Default/2022/7/UK/GL/GL/1517266/honda-activa-clutch-plate-set-500x500.jpg', category: 'Clutch' }
        ]
      }
    ]
  }
  // ... Add more brands/models/parts as needed
];

function renderPartListing(brandIdx, modelIdx) {
  const partStep = document.getElementById('part-listing-step');
  partStep.innerHTML = '';
  const brand = autopartsCatalog[brandIdx];
  const model = brand.models[modelIdx];
  // Back button
  const backBtn = document.createElement('button');
  backBtn.textContent = '← Back to Models';
  backBtn.className = 'back-btn';
  backBtn.onclick = () => renderPartsStep(brandIdx, model.name);
  partStep.appendChild(backBtn);
  // Title
  const title = document.createElement('h3');
  title.textContent = `Parts for ${brand.brand} ${model.name}`;
  partStep.appendChild(title);
  // Part grid
  const grid = document.createElement('div');
  grid.className = 'model-grid';
  model.parts.forEach((part, pIdx) => {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `
      <img src="${part.img}" alt="${part.name}" style="width:80px;height:80px;object-fit:contain;margin-bottom:0.5rem;">
      <span style="font-weight:700;">${part.name}</span>
      <span style="color:var(--primary-blue);font-size:1.1rem;font-weight:600;margin:0.5rem 0;">₹${part.price}</span>
      <div style="display:flex;align-items:center;justify-content:center;margin:0.5rem 0;">
        <button onclick="updateCartQty(${brandIdx},${modelIdx},${pIdx},-1)" style="padding:0 8px;">-</button>
        <input id="qty-${brandIdx}-${modelIdx}-${pIdx}" type="number" min="1" value="1" style="width:40px;text-align:center;margin:0 6px;">
        <button onclick="updateCartQty(${brandIdx},${modelIdx},${pIdx},1)" style="padding:0 8px;">+</button>
      </div>
      <button class='primary-button' style='margin-top:0.7rem;font-size:0.95rem;' onclick='addToCart(${brandIdx},${modelIdx},${pIdx})'>Add to Cart</button>
    `;
    grid.appendChild(card);
  });
  partStep.appendChild(grid);
  document.getElementById('brand-step').style.display = 'none';
  document.getElementById('model-step').style.display = 'none';
  document.getElementById('parts-step').style.display = 'none';
  partStep.style.display = 'block';
}

function updateCartQty(brandIdx, modelIdx, pIdx, delta) {
  const input = document.getElementById(`qty-${brandIdx}-${modelIdx}-${pIdx}`);
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

function getCart() {
  return JSON.parse(localStorage.getItem('autoparts_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('autoparts_cart', JSON.stringify(cart));
  document.getElementById('cart-count').textContent = cart.reduce((a, b) => a + b.qty, 0);
}
function addToCart(brandIdx, modelIdx, pIdx) {
  const qty = parseInt(document.getElementById(`qty-${brandIdx}-${modelIdx}-${pIdx}`).value) || 1;
  const brand = autopartsCatalog[brandIdx];
  const model = brand.models[modelIdx];
  const part = model.parts[pIdx];
  let cart = getCart();
  const key = `${brand.brand}|${model.name}|${part.name}`;
  const idx = cart.findIndex(item => item.key === key);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({ key, brand: brand.brand, model: model.name, part: part.name, price: part.price, img: part.img, qty });
  }
  saveCart(cart);
  showCartModal();
}
function showCartModal() {
  const modal = document.getElementById('cart-modal');
  const cart = getCart();
  if (!cart.length) {
    modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:12px;max-width:400px;margin:5vh auto;text-align:center;'><h3>Your Cart is Empty</h3><button class='primary-button' onclick='closeCartModal()' style='margin-top:1.5rem;'>Close</button></div>`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    return;
  }
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:12px;max-width:500px;margin:5vh auto;box-shadow:0 4px 24px rgba(43,75,140,0.18);position:relative;'>
    <button onclick='closeCartModal()' style='position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;'>&times;</button>
    <h3 style='color:var(--primary-blue);margin-bottom:1rem;'>Your Cart</h3>
    <div style='max-height:250px;overflow-y:auto;'>
      ${cart.map((item, idx) => `
        <div style='display:flex;align-items:center;gap:1rem;margin-bottom:1rem;'>
          <img src='${item.img}' alt='${item.part}' style='width:48px;height:48px;object-fit:contain;border-radius:6px;'>
          <div style='flex:1;'>
            <b>${item.brand} ${item.model}</b><br><span>${item.part}</span><br>₹${item.price} x ${item.qty}
          </div>
          <button onclick='removeFromCart(${idx})' style='background:none;border:none;color:var(--primary-blue);font-size:1.2rem;cursor:pointer;' title='Remove'>&times;</button>
        </div>
      `).join('')}
    </div>
    <div style='margin:1rem 0;font-weight:700;'>Total: ₹${total.toLocaleString()}</div>
    <button class='primary-button' style='width:100%;' onclick='openCartEnquiryModal()'>Enquire / Checkout</button>
  </div>`;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function removeFromCart(idx) {
  let cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  showCartModal();
}
function closeCartModal() {
  const modal = document.getElementById('cart-modal');
  modal.style.display = 'none';
  modal.innerHTML = '';
  document.body.style.overflow = '';
}
function openCartEnquiryModal() {
  const modal = document.getElementById('cart-modal');
  const cart = getCart();
  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  modal.innerHTML = `<div style='background:#fff;padding:2rem 1.5rem;border-radius:12px;max-width:500px;margin:5vh auto;box-shadow:0 4px 24px rgba(43,75,140,0.18);position:relative;'>
    <button onclick='closeCartModal()' style='position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;'>&times;</button>
    <h3 style='color:var(--primary-blue);margin-bottom:1rem;'>Enquire / Checkout</h3>
    <div style='max-height:180px;overflow-y:auto;'>
      ${cart.map(item => `<div style='margin-bottom:0.7rem;'><b>${item.brand} ${item.model}</b> - ${item.part} x ${item.qty} (₹${item.price})</div>`).join('')}
    </div>
    <div style='margin:1rem 0;font-weight:700;'>Total: ₹${total.toLocaleString()}</div>
    <form id='cart-enquiry-form'>
      <input type='text' name='name' placeholder='Your Name' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <input type='tel' name='phone' placeholder='Phone Number' required style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'>
      <input type='text' name='city' value='Agra' readonly style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);background:#f7f7f7;'>
      <textarea name='query' placeholder='Your Query (optional)' style='width:100%;margin-bottom:1rem;padding:0.6rem;border-radius:6px;border:1.2px solid var(--primary-blue);'></textarea>
      <button type='submit' class='primary-button' style='width:100%;'>Send Enquiry</button>
    </form>
  </div>`;
  document.getElementById('cart-enquiry-form').onsubmit = function(e) {
    e.preventDefault();
    modal.innerHTML = `<div style='padding:2rem;text-align:center;'><h3 style='color:var(--primary-blue);'>Thank you!</h3><p>Your enquiry has been submitted.<br>We will contact you soon.</p><button class='primary-button' onclick='closeCartModal()' style='margin-top:1.5rem;'>Close</button></div>`;
    saveCart([]);
    document.getElementById('cart-count').textContent = '0';
  };
}
// Cart icon click
if (document.getElementById('cart-icon')) {
  document.getElementById('cart-icon').onclick = showCartModal;
  document.getElementById('cart-count').textContent = getCart().reduce((a, b) => a + b.qty, 0);
}

// --- Brand Models Catalog Data (2024–2025) ---
const brandModelsCatalog = [
  {
    brand: 'Hero',
    models: [
      'Splendor Plus', 'HF Deluxe', 'Passion Pro / Passion Plus', 'Super Splendor', 'Glamour', 'Xtreme 160R', 'Xpulse 200', 'Karizma XMR', 'Xtreme 200S', 'Xtreme 125R', 'Xtreme 200T', 'CBZ Xtreme', 'Hunk', 'Achiever', 'Ignitor', 'iSmart 110', 'Splendor NXG', 'HF 100', 'Pleasure Plus', 'Destini 125', 'Maestro Edge 110', 'Maestro Edge 125'
    ]
  },
  {
    brand: 'Bajaj',
    models: [
      'Pulsar 125', 'Pulsar 150', 'Pulsar NS200', 'Pulsar NS160', 'Pulsar N160', 'Pulsar N250', 'Pulsar RS200', 'Dominar 250', 'Dominar 400', 'Avenger 160', 'Avenger 220', 'CT100', 'CT110', 'Platina 100', 'Platina 110 H-Gear', 'Discover 125', 'Discover 150'
    ]
  },
  {
    brand: 'TVS',
    models: [
      'Sport', 'Star City Plus', 'Radeon', 'Apache RTR 160', 'Apache RTR 160 4V', 'Apache RTR 180', 'Apache RTR 200 4V', 'Apache RR 310', 'Raider 125', 'Ronin', 'XL100', 'Scooty Pep+', 'Zest 110', 'Jupiter 110', 'Jupiter 125', 'NTorq 125'
    ]
  },
  {
    brand: 'Honda',
    models: [
      'Shine 100', 'Shine 125', 'SP 125', 'Unicorn', 'XBlade', 'Hornet 2.0', 'CB200X', 'CB300F', "CB350 H'ness", 'CB350 RS', 'Activa', 'Activa 3G', 'Activa 4G', 'Activa 5G', 'Activa 6G', 'Activa 125', 'Dio', 'Dio 125'
    ]
  },
  {
    brand: 'Yamaha',
    models: [
      'FZ V3', 'FZ-S FI V4', 'FZ-X', 'R15 V4', 'R15M', 'MT-15 V2', 'FZ25', 'FZS25', 'Fascino 125', 'RayZR 125'
    ]
  },
  {
    brand: 'KTM',
    models: [
      'Duke 125', 'Duke 200', 'Duke 250', 'Duke 390', 'RC 125', 'RC 200', 'RC 390', '390 Adventure', '390 Adventure X'
    ]
  },
  {
    brand: 'Suzuki',
    models: [
      'Gixxer', 'Gixxer SF', 'Gixxer 250', 'Gixxer SF 250', 'Intruder 150', 'Access 125', 'Burgman Street 125', 'Avenis 125'
    ]
  },
  {
    brand: 'Jawa / Yezdi',
    models: [
      'Jawa 42', 'Jawa Classic', 'Jawa Perak', 'Jawa 350', 'Yezdi Roadster', 'Yezdi Scrambler', 'Yezdi Adventure'
    ]
  },
  {
    brand: 'Kawasaki',
    models: [
      'Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z900'
    ]
  },
  {
    brand: 'Benelli',
    models: [
      'Imperiale 400', 'TRK 502', 'Leoncino 250', '600i', '300i'
    ]
  },
  {
    brand: 'Royal Enfield',
    models: [
      'Bullet 350', 'Classic 350', 'Hunter 350', 'Meteor 350', 'Scram 411', 'Himalayan 450', 'Interceptor 650', 'Continental GT 650'
    ]
  },
  {
    brand: 'Aprilia',
    models: [
      'SR 125', 'SR 160', 'SXR 125', 'SXR 160', 'RS 660', 'Tuono 660', 'RSV4 1100 Factory'
    ]
  },
  {
    brand: 'Harley-Davidson',
    models: [
      'X440', 'Iron 883', 'Forty-Eight', 'Nightster', 'Street Bob 114', 'Fat Bob 114', 'Fat Boy 114', 'Heritage Classic', 'Street Glide', 'Road Glide'
    ]
  },
  {
    brand: 'BMW',
    models: [
      'G310R', 'G310GS', 'F900R', 'F900XR', 'R1250GS', 'S1000RR', 'R18'
    ]
  },
  {
    brand: 'Ducati',
    models: [
      'Monster', 'Hypermotard 950', 'Scrambler Icon', 'Scrambler 1100', 'Multistrada V4', 'Diavel 1260', 'Panigale V2', 'Panigale V4', 'Streetfighter V2', 'Streetfighter V4'
    ]
  }
];

function renderBrandModelsCatalog() {
  const container = document.querySelector('.brand-catalog-container');
  if (!container) return;
  container.innerHTML = '';
  brandModelsCatalog.forEach(({ brand, models }) => {
    const details = document.createElement('details');
    details.className = 'brand-dropdown';
    const summary = document.createElement('summary');
    summary.textContent = brand;
    details.appendChild(summary);
    const list = document.createElement('div');
    list.className = 'brand-model-list';
    models.forEach(model => {
      const btn = document.createElement('button');
      btn.className = 'brand-model-btn';
      btn.textContent = model;
      btn.setAttribute('data-brand', brand);
      btn.setAttribute('data-model', model);
      // btn.onclick = () => { /* ready for linking to booking/servicing */ };
      list.appendChild(btn);
    });
    details.appendChild(list);
    container.appendChild(details);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderBrandModelsCatalog();
}); 