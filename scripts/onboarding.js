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
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const primaryButton = document.querySelector('.primary-button');
    const secondaryButton = document.querySelector('.secondary-button');
    let currentSlide = 0;

    // Function to update the active slide and dot
    function updateSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    // Add click event listeners to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateSlide(index);
        });
    });

    // Add touch swipe functionality
    let touchStartX = 0;
    let touchEndX = 0;

    document.querySelector('.carousel').addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.querySelector('.carousel').addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left
            if (currentSlide < slides.length - 1) {
                updateSlide(currentSlide + 1);
            }
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right
            if (currentSlide > 0) {
                updateSlide(currentSlide - 1);
            }
        }
    }

    // Add click event listeners to buttons
    primaryButton.addEventListener('click', () => {
        // Navigate to create budget page
        window.location.href = 'create-budget.html';
    });

    secondaryButton.addEventListener('click', () => {
        // Navigate to subscription payment page
        window.location.href = 'subscription-payment.html';
    });

    // Auto-advance slides every 5 seconds
    setInterval(() => {
        if (currentSlide < slides.length - 1) {
            updateSlide(currentSlide + 1);
        } else {
            updateSlide(0);
        }
    }, 5000);

    const profileImage = document.getElementById('profileImage');
    const profileImg = document.getElementById('profileImg');
    const profileImageInput = document.getElementById('profileImageInput');

    // Handle profile image click
    profileImage.addEventListener('click', () => {
        profileImageInput.click();
    });

    // Handle file selection
    profileImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImg.src = e.target.result; // Update the profile picture preview
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle Profile Form Submission
    document.getElementById('profileForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Collect profile data
        const profileData = {
            name: document.getElementById('name').value,
            username: document.getElementById('username').value,
            age: document.getElementById('age').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
        };

        try {
            // Send profile data to the TowerClub LLC API
            const response = await fetch('https://api.towerclub.com/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (response.ok) {
                alert('Profile saved successfully!');
            } else {
                alert('Failed to save profile. Please try again.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('An error occurred while saving your profile.');
        }
    });

    // Handle Credit/Debit Card Payment
    document.getElementById('cardPaymentForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        // Collect payment data
        const paymentData = {
            cardNumber: document.getElementById('cardNumber').value,
            cardExpiry: document.getElementById('cardExpiry').value,
            cardCVC: document.getElementById('cardCVC').value,
            cardHolder: document.getElementById('cardHolder').value,
        };

        try {
            // Simulate sending payment data to the API
            const response = await fetch('https://api.towerclub.com/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert('Payment successful!');
                    window.location.href = 'mainpage.html'; // Redirect to mainpage.html
                } else {
                    alert('Payment failed. Please try again.');
                }
            } else {
                alert('Failed to process payment. Please try again.');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('An error occurred while processing your payment.');
        }
    });

    // Handle PayPal Payment
    function startPayPalPayment() {
        // Simulate a successful PayPal payment
        alert('PayPal payment successful!');
        window.location.href = 'mainpage.html'; // Redirect to mainpage.html
    }

    // Attach the PayPal payment function to the button
    document.querySelector('.btn-paypal').addEventListener('click', startPayPalPayment);
});