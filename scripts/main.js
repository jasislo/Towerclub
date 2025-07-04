document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initializeApp();
});

function initializeApp() {
    // Load user data for the main page
    loadUserData();

    // Load wallet balance
    loadWalletBalance();

    // Load quick actions
    loadQuickActions();

    // Load Bitcoin and referral data
    loadBitcoinData();
    loadReferralData();
}

function loadUserData() {
    try {
        const userData = {
            name: 'John Doe',
            welcomeMessage: 'Welcome Back to TowerClub!',
            subtitle: "Here's an overview of your account."
        };

        // Update the welcome message
        const welcomeMessageElement = document.querySelector('.welcome-message');
        const subtitleElement = document.querySelector('.dashboard-subtitle');

        if (welcomeMessageElement) {
            welcomeMessageElement.textContent = userData.welcomeMessage;
        }

        if (subtitleElement) {
            subtitleElement.textContent = userData.subtitle;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function loadWalletBalance() {
    try {
        const walletData = {
            balance: 7302,
            portfolioPercentage: 32
        };

        // Update wallet balance
        const walletBalanceElement = document.querySelector('.wallet-balance .balance');
        const portfolioElement = document.querySelector('.wallet-balance .portfolio');
        const progressBarElement = document.querySelector('.wallet-balance .progress');

        if (walletBalanceElement) {
            walletBalanceElement.textContent = formatCurrency(walletData.balance);
        }

        if (portfolioElement) {
            portfolioElement.textContent = `${walletData.portfolioPercentage}% of portfolio`;
        }

        if (progressBarElement) {
            progressBarElement.style.width = `${walletData.portfolioPercentage}%`;
        }
    } catch (error) {
        console.error('Error loading wallet balance:', error);
    }
}

function loadQuickActions() {
    try {
        const quickActions = [
            { icon: 'account_balance_outlined', title: 'My Bank', link: 'payment_methods.html' },
            { icon: 'swap_horiz_outlined', title: 'Transfer', link: 'edittransaction.html' },
            { icon: 'stacked_line_chart_rounded', title: 'Activity', link: 'socialmedia2.html' },
            { icon: 'chat_bubble_outline', title: 'Messages', link: 'Chatssection.html' },
            { icon: 'person_outline', title: 'Profile', link: 'complete_profile.html' },
            { icon: 'share', title: 'Referrals', link: 'referral_profile.html' }
        ];

        const quickActionsContainer = document.querySelector('.quick-actions');

        if (quickActionsContainer) {
            quickActionsContainer.innerHTML = quickActions
                .map(action => `
                    <a href="${action.link}" class="quick-action-item">
                        <span class="material-icons">${action.icon}</span>
                        <h3>${action.title}</h3>
                    </a>
                `)
                .join('');
        }
    } catch (error) {
        console.error('Error loading quick actions:', error);
    }
}

function loadBitcoinData() {
    try {
        const bitcoinData = {
            balance: 5201.02,
            portfolioPercentage: 32
        };

        // Update Bitcoin section
        const bitcoinBalanceElement = document.querySelector('.bitcoin-section .balance');
        const bitcoinPortfolioElement = document.querySelector('.bitcoin-section .portfolio');
        const bitcoinProgressBarElement = document.querySelector('.bitcoin-section .progress');

        if (bitcoinBalanceElement) {
            bitcoinBalanceElement.textContent = formatCurrency(bitcoinData.balance);
        }

        if (bitcoinPortfolioElement) {
            bitcoinPortfolioElement.textContent = `${bitcoinData.portfolioPercentage}% of portfolio`;
        }

        if (bitcoinProgressBarElement) {
            bitcoinProgressBarElement.style.width = `${bitcoinData.portfolioPercentage}%`;
        }
    } catch (error) {
        console.error('Error loading Bitcoin data:', error);
    }
}

function loadReferralData() {
    try {
        const referralData = {
            reward: 2340,
            portfolioPercentage: 40
        };

        // Update referral reward section
        const referralRewardElement = document.querySelector('.referral-reward .reward');
        const referralPortfolioElement = document.querySelector('.referral-reward .portfolio');
        const referralProgressBarElement = document.querySelector('.referral-reward .progress');

        if (referralRewardElement) {
            referralRewardElement.textContent = referralData.reward;
        }

        if (referralPortfolioElement) {
            referralPortfolioElement.textContent = `${referralData.portfolioPercentage}% of portfolio`;
        }

        if (referralProgressBarElement) {
            referralProgressBarElement.style.width = `${referralData.portfolioPercentage}%`;
        }
    } catch (error) {
        console.error('Error loading referral data:', error);
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

document.addEventListener('DOMContentLoaded', () => {
    // Add upload input if not present
    let profilePicInput = document.getElementById('profilePicInput');
    if (!profilePicInput) {
        profilePicInput = document.createElement('input');
        profilePicInput.type = 'file';
        profilePicInput.accept = 'image/*';
        profilePicInput.id = 'profilePicInput';
        profilePicInput.style.display = 'none';
        document.body.appendChild(profilePicInput);
    }

    // Get all profile picture elements
    function syncProfilePicture(src) {
        // Header
        const headerPic = document.querySelector('.profile-picture-container img');
        if (headerPic) headerPic.src = src;
        // Add more selectors if you have more profile images elsewhere
    }

    // On page load, sync profile picture everywhere
    const savedPic = localStorage.getItem('profilePicture');
    if (savedPic) {
        syncProfilePicture(savedPic);
    }

    // Click on profile picture opens file input
    const headerPicContainer = document.querySelector('.profile-picture-container');
    if (headerPicContainer) {
        headerPicContainer.addEventListener('click', () => {
            profilePicInput.click();
        });
    }

    // When a new photo is selected, update and sync everywhere
    profilePicInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const src = e.target.result;
                // Save to localStorage
                localStorage.setItem('profilePicture', src);
                // Sync everywhere
                syncProfilePicture(src);

                // Also update memberProfile if exists
                const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
                memberProfile.profilePicture = src;
                localStorage.setItem('memberProfile', JSON.stringify(memberProfile));
            };
            reader.readAsDataURL(file);
        }
    });
});