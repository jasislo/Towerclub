/**
 * GitHub Integration Service
 * Handles GitHub API calls for user registration and authentication
 */

import { APP_CONFIG } from './config.js';

class GitHubIntegration {
    constructor() {
        this.config = APP_CONFIG.github;
        this.apiUrl = this.config.apiUrl;
        this.token = this.config.token;
    }

    /**
     * Make authenticated GitHub API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.apiUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `GitHub API request failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get GitHub user information
     * @param {string} username - GitHub username
     * @returns {Promise<Object>} User information
     */
    async getUserInfo(username) {
        try {
            const userData = await this.makeRequest(`/users/${username}`);
            return {
                success: true,
                user: {
                    id: userData.id,
                    username: userData.login,
                    name: userData.name,
                    email: userData.email,
                    avatar: userData.avatar_url,
                    bio: userData.bio,
                    location: userData.location,
                    company: userData.company,
                    blog: userData.blog,
                    publicRepos: userData.public_repos,
                    followers: userData.followers,
                    following: userData.following,
                    createdAt: userData.created_at,
                    updatedAt: userData.updated_at
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Verify GitHub account exists
     * @param {string} username - GitHub username
     * @returns {Promise<boolean>} Whether account exists
     */
    async verifyAccount(username) {
        try {
            await this.makeRequest(`/users/${username}`);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get user's public repositories
     * @param {string} username - GitHub username
     * @returns {Promise<Array>} List of repositories
     */
    async getUserRepositories(username) {
        try {
            const repos = await this.makeRequest(`/users/${username}/repos`);
            return {
                success: true,
                repositories: repos.map(repo => ({
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    isPrivate: repo.private,
                    isFork: repo.fork,
                    createdAt: repo.created_at,
                    updatedAt: repo.updated_at,
                    url: repo.html_url
                }))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get user's contribution statistics
     * @param {string} username - GitHub username
     * @returns {Promise<Object>} Contribution statistics
     */
    async getContributionStats(username) {
        try {
            // Get user's repositories to calculate stats
            const reposResponse = await this.getUserRepositories(username);
            if (!reposResponse.success) {
                throw new Error(reposResponse.error);
            }

            const repos = reposResponse.repositories;
            const stats = {
                totalRepos: repos.length,
                publicRepos: repos.filter(repo => !repo.isPrivate).length,
                privateRepos: repos.filter(repo => repo.isPrivate).length,
                totalStars: repos.reduce((sum, repo) => sum + repo.stars, 0),
                totalForks: repos.reduce((sum, repo) => sum + repo.forks, 0),
                languages: {},
                topLanguages: []
            };

            // Calculate language statistics
            repos.forEach(repo => {
                if (repo.language) {
                    stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
                }
            });

            // Get top 5 languages
            stats.topLanguages = Object.entries(stats.languages)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([language, count]) => ({ language, count }));

            return {
                success: true,
                stats
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate GitHub token
     * @returns {Promise<boolean>} Whether token is valid
     */
    async validateToken() {
        try {
            await this.makeRequest('/user');
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get authenticated user information
     * @returns {Promise<Object>} Authenticated user data
     */
    async getAuthenticatedUser() {
        try {
            const userData = await this.makeRequest('/user');
            return {
                success: true,
                user: {
                    id: userData.id,
                    username: userData.login,
                    name: userData.name,
                    email: userData.email,
                    avatar: userData.avatar_url,
                    bio: userData.bio,
                    location: userData.location,
                    company: userData.company,
                    blog: userData.blog,
                    publicRepos: userData.public_repos,
                    followers: userData.followers,
                    following: userData.following,
                    createdAt: userData.created_at,
                    updatedAt: userData.updated_at
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Search for users
     * @param {string} query - Search query
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} Search results
     */
    async searchUsers(query, limit = 10) {
        try {
            const response = await this.makeRequest(`/search/users?q=${encodeURIComponent(query)}&per_page=${limit}`);
            return {
                success: true,
                users: response.items.map(user => ({
                    id: user.id,
                    username: user.login,
                    avatar: user.avatar_url,
                    type: user.type
                })),
                totalCount: response.total_count
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create and export singleton instance
const githubIntegration = new GitHubIntegration();
export default githubIntegration;

// Export individual methods for convenience
export const {
    makeRequest,
    getUserInfo,
    verifyAccount,
    getUserRepositories,
    getContributionStats,
    validateToken,
    getAuthenticatedUser,
    searchUsers
} = githubIntegration; 