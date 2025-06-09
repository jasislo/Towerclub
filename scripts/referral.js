class ReferralProfile {
    constructor() {
        this.initializeElements();
        this.loadProfileData();
        this.loadRecentActivity();
        this.loadConnections();
    }

    initializeElements() {
        // Profile elements
        this.followersCount = document.getElementById('followersCount');
        this.viewsCount = document.getElementById('viewsCount');
        this.userName = document.getElementById('userName');
        this.referralCode = document.getElementById('referralCode');
        
        // Stats elements
        this.totalFollowers = document.getElementById('totalFollowers');
        this.level = document.getElementById('level');
        this.rewardAmount = document.getElementById('rewardAmount');
        
        // Activity list
        this.activityList = document.getElementById('activityList');

        // Connections elements
        this.connectionsGrid = document.querySelector('.connections-grid');
    }

    async loadProfileData() {
        try {
            const response = await fetch('/api/profile/referral');
            const data = await response.json();
            
            // Update profile information
            this.followersCount.textContent = this.formatNumber(data.followers);
            this.viewsCount.textContent = this.formatNumber(data.views);
            this.userName.textContent = data.name;
            this.referralCode.textContent = `#${data.referralCode}`;
            
            // Update stats
            this.totalFollowers.textContent = this.formatNumber(data.followers);
            this.level.textContent = getAccountLevel(data.followers, data.referrals, data.plan);
            this.rewardAmount.textContent = this.formatCurrency(data.rewardAmount);
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.showToast('Failed to load profile data', 'error');
        }
    }

    async loadRecentActivity() {
        try {
            const response = await fetch('/api/profile/referral/activity');
            const activities = await response.json();
            
            this.activityList.innerHTML = activities.map(activity => this.createActivityItem(activity)).join('');
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.showToast('Failed to load recent activity', 'error');
        }
    }

    async loadConnections() {
        try {
            const response = await fetch('/api/profile/connections');
            const data = await response.json();
            
            // Update connection values
            const connectionValues = document.querySelectorAll('.connection-value');
            connectionValues[0].textContent = data.bankAccounts;
            connectionValues[1].textContent = data.cards;
            connectionValues[2].textContent = data.wallets;
            connectionValues[3].textContent = data.exchanges;
        } catch (error) {
            console.error('Error loading connections data:', error);
            this.showToast('Failed to load connections data', 'error');
        }
    }

    createActivityItem(activity) {
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <span class="material-icons">${this.getActivityIcon(activity.type)}</span>
                </div>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            </div>
        `;
    }

    getActivityIcon(type) {
        const icons = {
            'referral': 'person_add',
            'reward': 'payments',
            'level_up': 'trending_up',
            'cashout': 'cases'
        };
        return icons[type] || 'notifications';
    }

    formatNumber(number) {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(number);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
            .format(-Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)), 'day');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Load followers count
const followers = JSON.parse(localStorage.getItem('followers')) || [];
document.getElementById('followersCount').textContent = followers.length;
// Repeat for other data types...

/**
 * Get account level based on followers, referrals, and membership plan.
 * @param {number} followers
 * @param {number} referrals
 * @param {string} plan - Membership plan (e.g., "Basic", "VIP Member", "Business")
 * @returns {string} Account level
 */
function getAccountLevel(followers, referrals, plan) {
    // If Basic plan and not enough followers/referrals for higher levels, show "Member"
    if (plan === 'Basic') {
        if (followers < 1000 && referrals < 100) return 'Member';
    }
    if (followers >= 100000 && referrals >= 50000) return 'Platinum';
    if (followers >= 50000 && referrals >= 10000) return 'Gold';
    if (followers >= 10000 && referrals >= 1000) return 'Silver';
    if (followers >= 1000 && referrals >= 100) return 'VIP Member';
    return plan === 'Basic' ? 'Member' : 'Starter';
}

// Example usage:
const followers = 24000; // Replace with actual value
const referrals = 1200;  // Replace with actual value

// Get selected plan from localStorage (set during onboarding/payment)
let selectedPlan = 'Basic';
const memberProfile = JSON.parse(localStorage.getItem('memberProfile') || '{}');
if (memberProfile && memberProfile.selectedPlan) {
    selectedPlan = memberProfile.selectedPlan;
} else if (localStorage.getItem('selectedPlan')) {
    selectedPlan = localStorage.getItem('selectedPlan');
}

const accountLevel = getAccountLevel(followers, referrals, selectedPlan);
document.getElementById('accountLevel').textContent = accountLevel;

/**
 * Calculate referral bonus reward.
 * @param {number} directReferrals - Number of direct referrals.
 * @param {Array<number>} generations - Array representing the number of referrals in each generation (up to 4 generations).
 * @returns {number} - Total referral reward.
 */
function calculateReferralBonus(directReferrals, generations) {
    const directReferralReward = 5; // $5 for each direct referral
    const generationReward = 2.5; // $2.50 for each referral in subsequent generations

    // Calculate reward for direct referrals
    let totalReward = directReferrals * directReferralReward;

    // Calculate reward for referrals in each generation (up to 4 generations)
    for (let i = 0; i < Math.min(generations.length, 4); i++) {
        totalReward += generations[i] * generationReward;
    }

    return totalReward;
}

// Example usage:
const directReferrals = 10; // Number of direct referrals
const generations = [20, 15, 10, 5]; // Referrals in 1st, 2nd, 3rd, and 4th generations

const totalReward = calculateReferralBonus(directReferrals, generations);
console.log(`Total Referral Reward: $${totalReward.toFixed(2)}`);

// Global functions
function copyReferralCode() {
    const referralCode = document.getElementById('referralCode').textContent;
    navigator.clipboard.writeText(referralCode).then(() => {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = 'Referral code copied to clipboard!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }).catch(err => {
        console.error('Failed to copy referral code:', err);
    });
}

function navigateToCashout() {
    window.location.href = '/pages/transactions/cashout.html';
}

function showReferralRewardInfo() {
    // Example: get values from DOM or your algorithm
    const totalReward = document.getElementById('rewardAmount').textContent;
    const cashOutReward = document.getElementById('cashOutReward').textContent;

    document.getElementById('modalTotalReward').textContent = totalReward;
    document.getElementById('modalCashOutReward').textContent = cashOutReward;

    document.getElementById('referralRewardModal').style.display = 'flex';
}

function closeReferralRewardModal() {
    document.getElementById('referralRewardModal').style.display = 'none';
}

function showCashOutModal() {
    // Ask the user if they want to move the reward to their wallet balance
    if (confirm('Move Reward to your Wallet Balance?')) {
        // Proceed to make transfer to wallet balance
        // Simulate transfer logic (replace with actual API call if needed)
        // Example: update wallet balance in UI or notify user
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.textContent = 'Reward moved to your Wallet Balance!';
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3000);

        // Optionally, update wallet balance in the DOM here
        // Example: document.getElementById('walletBalance').textContent = newBalance;
    } else {
        // Cancel transfer, do nothing or show a cancellation message
        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        toast.textContent = 'Transfer cancelled.';
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 2000);
    }
}

function showReferralPromo() {
    const promoBanner = document.createElement('div');
    promoBanner.className = 'promo-banner';
    promoBanner.textContent = 'THIS referral code #jonatthanasis gives 2 months free!';
    document.body.prepend(promoBanner);

    setTimeout(() => {
        promoBanner.remove();
    }, 8000); // Hide after 8 seconds
}

document.addEventListener('DOMContentLoaded', () => {
    new ReferralProfile();
    showReferralPromo(); // Show the promo banner

    // Modal button handlers
    const cashOutYesBtn = document.getElementById('cashOutYesBtn');
    const cashOutNoBtn = document.getElementById('cashOutNoBtn');
    const cashOutModal = document.getElementById('cashOutModal');

    if (cashOutYesBtn && cashOutNoBtn && cashOutModal) {
        cashOutYesBtn.onclick = function() {
            cashOutModal.style.display = 'none';
            // Add your cash out logic here
            const toast = document.createElement('div');
            toast.className = 'toast toast-success';
            toast.textContent = 'Cash out request submitted!';
            document.body.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 3000);
        };
        cashOutNoBtn.onclick = function() {
            cashOutModal.style.display = 'none';
        };
    }

    // Referral Code Form Logic (add this if not already present)
    // If you have a referral code input form:
    const referralInput = document.getElementById('referralCodeInput');
    const referralMsg = document.getElementById('referralCodeMessage');
    if (referralInput && referralMsg) {
        document.getElementById('referralCodeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const code = referralInput.value.trim().toLowerCase();
            if (code === '#jonatthanasis' || code === 'jonatthanasis') {
                referralMsg.style.display = 'block';
                referralMsg.style.color = '#22c55e';
                referralMsg.textContent = 'Referral code applied! You get 2 months free of charge membership.';
            } else if (code.length < 3) {
                referralMsg.style.display = 'block';
                referralMsg.style.color = '#F06A6A';
                referralMsg.textContent = 'Please enter a valid referral code.';
            } else {
                referralMsg.style.display = 'block';
                referralMsg.style.color = '#22c55e';
                referralMsg.textContent = 'Referral code applied!';
            }
        });
    }
});