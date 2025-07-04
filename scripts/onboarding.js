<link rel="stylesheet" href="../styles/onboarding.css">
<style>
    .btn-paypal {
        background-color: #ffc439; /* PayPal yellow */
        color: #111827; /* Dark text for contrast */
        border: none;
        padding: 10px 20px;
        font-size: 1rem;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
        margin-top: 10px; /* Add spacing under the heading */
        display: inline-block;
    }

    .btn-paypal:hover {
        background-color: #e0a800; /* Darker yellow on hover */
        transform: scale(1.05); /* Slightly enlarge on hover */
    }
</style>
import profilePictureManager from './profile-picture-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- Carousel Logic (if present) ---
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const primaryButton = document.querySelector('.primary-button');
    const secondaryButton = document.querySelector('.secondary-button');
    let currentSlide = 0;

    function updateSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlide(index);
        });
    });

    let touchStartX = 0;
    let touchEndX = 0;
    const carousel = document.querySelector('.carousel');
    if (carousel) {
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            if (currentSlide < slides.length - 1) {
                updateSlide(currentSlide + 1);
            }
        } else if (touchEndX > touchStartX + swipeThreshold) {
            if (currentSlide > 0) {
                updateSlide(currentSlide - 1);
            }
        }
    }

    if (primaryButton) {
        primaryButton.addEventListener('click', () => {
            window.location.href = 'create-budget.html';
        });
    }
    if (secondaryButton) {
        secondaryButton.addEventListener('click', () => {
            window.location.href = 'subscription-payment.html';
        });
    }

    if (slides.length > 0) {
        setInterval(() => {
            if (currentSlide < slides.length - 1) {
                updateSlide(currentSlide + 1);
            } else {
                updateSlide(0);
            }
        }, 5000);
    }

    // --- Payment Info Persistence Logic ---
    const cardPaymentForm = document.getElementById('cardPaymentForm');
    const paypalBtn = document.getElementById('paypalButton');
    const cardNumberInput = document.getElementById('cardNumber');
    const cardExpiryInput = document.getElementById('cardExpiry');
    const cardCVCInput = document.getElementById('cardCVC');
    const cardHolderInput = document.getElementById('cardHolder');

    // Restore card info if available
    if (localStorage.getItem('paymentMethod') === 'creditCard' && cardNumberInput && cardExpiryInput && cardCVCInput && cardHolderInput) {
        const cardDetails = JSON.parse(localStorage.getItem('cardDetails') || '{}');
        if (cardDetails.number) cardNumberInput.value = cardDetails.number;
        if (cardDetails.expiry) cardExpiryInput.value = cardDetails.expiry;
        if (cardDetails.cvc) cardCVCInput.value = cardDetails.cvc;
        if (cardDetails.holder) cardHolderInput.value = cardDetails.holder;
    }

    // Restore PayPal info if available
    if (localStorage.getItem('paymentMethod') === 'paypal' && paypalBtn) {
        paypalBtn.textContent = 'Logged with PayPal';
        paypalBtn.style.backgroundColor = '#ffc439'; // PayPal yellow
        paypalBtn.style.color = '#111827'; // Dark text for contrast
        paypalBtn.style.cursor = 'not-allowed';
        paypalBtn.disabled = true;
    }

    // Save card info on submit
    if (cardPaymentForm) {
        cardPaymentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            localStorage.setItem('paymentMethod', 'creditCard');
            localStorage.setItem('cardDetails', JSON.stringify({
                number: cardNumberInput ? cardNumberInput.value : '',
                expiry: cardExpiryInput ? cardExpiryInput.value : '',
                cvc: cardCVCInput ? cardCVCInput.value : '',
                holder: cardHolderInput ? cardHolderInput.value : ''
            }));
            alert('Payment successful!');
            window.location.href = 'payment methods.html';
        });
    }

    // Save PayPal info on click
    if (paypalBtn) {
        paypalBtn.addEventListener('click', function () {
            localStorage.setItem('paymentMethod', 'paypal');
            alert('PayPal payment successful!');
            window.location.href = 'payment methods.html';
        });
    }

    // Prefill Complete Profile section with info from register.html if available
    const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
    if (memberProfile) {
        if (memberProfile.fullName && document.getElementById('name')) {
            document.getElementById('name').value = memberProfile.fullName;
        }
        if (memberProfile.email && document.getElementById('email')) {
            document.getElementById('email').value = memberProfile.email;
        }
        if (memberProfile.phone && document.getElementById('phone')) {
            document.getElementById('phone').value = memberProfile.phone;
        }
        if (memberProfile.username && document.getElementById('username')) {
            document.getElementById('username').value = memberProfile.username;
        }
        if (memberProfile.age && document.getElementById('age')) {
            document.getElementById('age').value = memberProfile.age;
        }
    }

    // Handle Complete Profile Form Submission
    const profileForm = document.getElementById('profileForm');
    const completeProfileBtn = document.getElementById('completeProfileBtn');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            // Collect profile info
            const name = document.getElementById('name')?.value || '';
            const username = document.getElementById('username')?.value || '';
            const age = document.getElementById('age')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const profilePicture = localStorage.getItem('profilePicture') || '';

            // Save profile info to localStorage
            const updatedProfile = {
                fullName: name,
                username,
                age,
                email,
                phone,
                profilePicture
            };
            localStorage.setItem('memberProfile', JSON.stringify(updatedProfile));

            // Always proceed to mainpage.html when Complete Profile is clicked
            window.location.href = 'mainpage.html';
        });
    }

    // Register profile pictures
    const profileImage = document.getElementById('profileImage');
    const profileImg = document.getElementById('profileImg');
    
    if (profileImage) {
        profilePictureManager.registerProfilePicture(profileImage);
    }
    if (profileImg) {
        profilePictureManager.registerProfilePicture(profileImg);
    }
    
    // Sync all profile pictures
    profilePictureManager.syncProfilePictures();

    // Budget form logic
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        const amountInput = document.getElementById('amount');
        const budgetNameInput = document.getElementById('budgetName');
        const descriptionInput = document.getElementById('description');

        // Format amount input with commas (optional)
        amountInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/,/g, '');
            if (value) {
                value = parseInt(value).toLocaleString();
                e.target.value = value;
            }
        });

        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const budgetData = {
                amount: amountInput.value.replace(/,/g, ''),
                name: budgetNameInput.value,
                description: descriptionInput.value,
                createdAt: new Date().toISOString(),
                timeLeft: '45 days left'
            };
            // Simulate budget creation
            alert(`$${parseFloat(budgetData.amount).toLocaleString()} has been added to your account balance!`);
            budgetForm.reset();
            // Optionally redirect or update UI here
        });
    }

    // Change header to "Payment Method Selected" if payment was made on pay.html
    const paymentHeader = document.getElementById('paymentSectionHeader');
    if (
        (localStorage.getItem('paymentMethod') === 'creditCard' && localStorage.getItem('cardDetails')) ||
        localStorage.getItem('paymentMethod') === 'paypal'
    ) {
        if (paymentHeader) {
            paymentHeader.textContent = 'Payment Method Selected';
        }
    }
});

// Show/Hide payment forms
function showCardPaymentForm() {
    document.getElementById('cardPaymentFormContainer').style.display = 'block';
    document.getElementById('paypalPaymentFormContainer').style.display = 'none';

    // Add active class to Credit/Debit Card option
    document.getElementById('creditCardOption').classList.add('active');
    document.getElementById('paypalOption').classList.remove('active');
}

function showPayPalPaymentForm() {
    document.getElementById('cardPaymentFormContainer').style.display = 'none';
    document.getElementById('paypalPaymentFormContainer').style.display = 'block';

    // Add active class to PayPal option
    document.getElementById('paypalOption').classList.add('active');
    document.getElementById('creditCardOption').classList.remove('active');
}

// Hide Create Budget section when skipping and enable Complete Profile button
function skipForNow() {
    // Hide the Create Budget section
    const budgetSection = Array.from(document.querySelectorAll('.profile-section h1'))
        .find(h1 => h1.textContent === 'Create Budget')?.closest('.profile-section');
    if (budgetSection) {
        budgetSection.style.display = 'none';
    }
    
    // Hide the Make Payment section
    const paymentSection = document.querySelector('.payment-section');
    if (paymentSection) {
        paymentSection.style.display = 'none';
    }

    // Enable the Complete Profile button
    const completeProfileBtn = document.getElementById('completeProfileBtn');
    if (completeProfileBtn) {
        completeProfileBtn.disabled = false;
        completeProfileBtn.style.opacity = '1';
        completeProfileBtn.style.cursor = 'pointer';
    }
}