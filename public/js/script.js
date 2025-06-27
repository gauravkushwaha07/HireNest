// Global JavaScript for Hire Nest

document.addEventListener('DOMContentLoaded', function() {
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert && alert.parentNode) {
                alert.style.transition = 'opacity 0.5s ease-out';
                alert.style.opacity = '0';
                setTimeout(() => {
                    alert.remove();
                }, 500);
            }
        }, 5000);
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Processing...';
                
                // Re-enable button after 3 seconds to prevent permanent disability
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 3000);
            }
        });
    });

    // Date validation for booking forms
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput && endDateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        startDateInput.min = today;
        endDateInput.min = today;
        
        startDateInput.addEventListener('change', function() {
            endDateInput.min = this.value;
            if (endDateInput.value && endDateInput.value < this.value) {
                endDateInput.value = this.value;
            }
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.worker-card');
            
            cards.forEach(card => {
                const name = card.querySelector('.worker-name')?.textContent.toLowerCase() || '';
                const category = card.querySelector('.worker-category')?.textContent.toLowerCase() || '';
                const skills = card.querySelector('.worker-skills')?.textContent.toLowerCase() || '';
                
                if (name.includes(searchTerm) || category.includes(searchTerm) || skills.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Tooltip initialization (if Bootstrap tooltips are used)
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Skills input formatting
    const skillsInput = document.getElementById('skills');
    if (skillsInput) {
        skillsInput.addEventListener('blur', function() {
            // Clean up skills input - remove extra spaces and format
            let skills = this.value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
            this.value = skills.join(', ');
        });
    }

    // Category filter in workers page
    const categoryFilter = document.getElementById('category');
    const availabilityFilter = document.getElementById('availability');
    
    if (categoryFilter || availabilityFilter) {
        function filterWorkers() {
            const category = categoryFilter?.value.toLowerCase() || '';
            const availability = availabilityFilter?.value || '';
            const workerCards = document.querySelectorAll('.worker-card');
            
            workerCards.forEach(card => {
                const cardCategory = card.dataset.category?.toLowerCase() || '';
                const cardAvailable = card.dataset.available === 'true';
                
                let showCard = true;
                
                if (category && !cardCategory.includes(category)) {
                    showCard = false;
                }
                
                if (availability === 'available' && !cardAvailable) {
                    showCard = false;
                }
                
                card.style.display = showCard ? 'block' : 'none';
            });
        }
        
        categoryFilter?.addEventListener('change', filterWorkers);
        availabilityFilter?.addEventListener('change', filterWorkers);
    }
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Error handling for images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        e.target.src = '/images/default-avatar.jpg';
    }
}, true);