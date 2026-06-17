
// ============================================
// SEARCH FUNCTIONALITY
// ============================================

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.debounceTimer = null;
        this.init();
    }

    init() {
        if (this.searchInput && this.searchResults) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            // Close results when clicking outside
            document.addEventListener('click', (e) => {
                if (e.target !== this.searchInput) {
                    this.searchResults.classList.remove('active');
                }
            });

            // Open results on focus
            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.length > 0) {
                    this.searchResults.classList.add('active');
                }
            });
        }
    }

    handleSearch(query) {
        clearTimeout(this.debounceTimer);

        if (query.length === 0) {
            this.searchResults.classList.remove('active');
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    performSearch(query) {
        const results = db.search(query, 'all');

        if (results.length === 0) {
            this.displayNoResults(query);
            return;
        }

        this.displayResults(results);
        this.searchResults.classList.add('active');
    }

    displayResults(results) {
        const html = results.slice(0, 8).map(result => {
            const icon = result.image ? 'fa-image' : result.thumbnail ? 'fa-video' : 'fa-file';
            return `
                <div class="search-result-item" style="
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                        <i class="fas ${icon}" style="color: var(--primary-color);"></i>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${result.title}
                            </div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                ${result.category ? Utils.capitalize(result.category) : 'Post'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.searchResults.innerHTML = html;
    }

    displayNoResults(query) {
        this.searchResults.innerHTML = `
            <div style="padding: 1.5rem; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
                <p>No results found for "${query}"</p>
            </div>
        `;
        this.searchResults.classList.add('active');
    }
}

// Advanced Search Class
class AdvancedSearch {
    constructor() {
        this.filters = {
            year: null,
            category: null,
            eventType: null,
            popularity: 'all',
            sortBy: 'newest'
        };
    }

    setFilter(filterName, value) {
        this.filters[filterName] = value;
    }

    search(query) {
        let results = db.search(query, 'all');

        // Apply filters
        if (this.filters.category && this.filters.category !== 'all') {
            results = results.filter(r => r.category === this.filters.category);
        }

        if (this.filters.popularity !== 'all') {
            results = this.filterByPopularity(results, this.filters.popularity);
        }

        // Sort results
        results = this.sortResults(results, this.filters.sortBy);

        return results;
    }

    filterByPopularity(results, level) {
        if (level === 'high') {
            return results.filter(r => (r.likes || 0) > 100);
        } else if (level === 'medium') {
            return results.filter(r => (r.likes || 0) > 10 && (r.likes || 0) <= 100);
        } else if (level === 'low') {
            return results.filter(r => (r.likes || 0) <= 10);
        }
        return results;
    }

    sortResults(results, sortBy) {
        const sorted = [...results];

        if (sortBy === 'newest') {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'mostViewed') {
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else if (sortBy === 'mostLiked') {
            sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }

        return sorted;
    }

    reset() {
        this.filters = {
            year: null,
            category: null,
            eventType: null,
            popularity: 'all',
            sortBy: 'newest'
        };
    }
}

// Initialize search
const searchManager = new SearchManager();
const advancedSearch = new AdvancedSearch();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SearchManager, AdvancedSearch };
}
