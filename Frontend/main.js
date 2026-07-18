/* ==========================================================================
   LinkSpire URL Shortener - Frontend Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI Icons
    lucide.createIcons();

    // Elements
    const shortenForm = document.getElementById('shorten-form');
    const longUrlInput = document.getElementById('long-url-input');
    const clearBtn = document.getElementById('clear-btn');
    const shortenSubmitBtn = document.getElementById('shorten-submit-btn');
    const shortenSpinner = document.getElementById('shorten-spinner');
    const urlError = document.getElementById('url-error');
    const errorMessage = document.getElementById('error-message');
    const searchInput = document.getElementById('search-input');
    const linksContainer = document.getElementById('links-container');
    const emptyState = document.getElementById('empty-state');
    
    // Modals
    const statsModal = document.getElementById('stats-modal');
    const editModal = document.getElementById('edit-modal');
    const deleteModal = document.getElementById('delete-modal');
    
    const closeStatsBtn = document.getElementById('close-stats-btn');
    const statsCloseBtnFooter = document.getElementById('stats-close-btn-footer');
    const closeEditBtn = document.getElementById('close-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    const closeDeleteBtn = document.getElementById('close-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteShortCodeDisplay = document.getElementById('delete-short-code-display');
    
    // Edit Form Elements
    const editForm = document.getElementById('edit-form');
    const editUrlInput = document.getElementById('edit-url-input');
    const editUrlError = document.getElementById('edit-url-error');
    const editErrorMessage = document.getElementById('edit-error-message');
    const editShortCodeDisplay = document.getElementById('edit-short-code-display');
    const editSpinner = document.getElementById('edit-spinner');
    const saveEditBtn = document.getElementById('save-edit-btn');
    
    // Stats Elements
    const modalClicksCount = document.getElementById('modal-clicks-count');
    const modalOriginalUrl = document.getElementById('modal-original-url');
    const modalShortCode = document.getElementById('modal-short-code');
    const modalCopyCodeBtn = document.getElementById('modal-copy-code-btn');
    const modalCreatedAt = document.getElementById('modal-created-at');
    const modalUpdatedAt = document.getElementById('modal-updated-at');
    
    // State
    let links = JSON.parse(localStorage.getItem('linkspire_links') || '[]');
    let currentEditCode = null;
    let currentDeleteCode = null;

    // API Base URL for production deployment (empty in dev to use Vite proxy)
    const API_BASE = import.meta.env.VITE_API_URL || '';

    // Check Routing for Redirection
    handleRouting();

    // Initial render
    renderLinks();

    /* ==========================================================================
       Routing & Redirections
       ========================================================================== */
    async function handleRouting() {
        const pathname = window.location.pathname;
        // Matches /r/abc1234 where shortCode length is 7
        if (pathname.startsWith('/r/')) {
            const shortCode = pathname.substring(3);
            
            if (shortCode.length === 7) {
                // Show Redirect overlay, hide main app
                const redirectOverlay = document.getElementById('redirect-overlay');
                const appRoot = document.getElementById('app-root');
                
                redirectOverlay.classList.remove('hidden');
                appRoot.classList.add('hidden');
                
                try {
                    // Fetch original url from backend
                    const response = await fetch(`${API_BASE}/api/shorten/${shortCode}`);
                    const data = await response.json();
                    
                    if (response.status === 200 && data.url) {
                        // Simulate a brief loading transition for rich visual aesthetics
                        setTimeout(() => {
                            window.location.replace(data.url);
                        }, 1200);
                    } else {
                        showRedirectError(data.message || 'The short URL is invalid or has expired.');
                    }
                } catch (error) {
                    console.error('Redirection error:', error);
                    showRedirectError('Network error. Unable to connect to the backend services.');
                }
            } else {
                showToast('Invalid short link path format.', 'error');
            }
        }
    }

    function showRedirectError(msg) {
        const redirectOverlay = document.getElementById('redirect-overlay');
        redirectOverlay.innerHTML = `
            <div class="glass-card modal-content" style="max-width: 450px; text-align: center; padding: 3rem 2rem;">
                <div class="empty-icon-wrapper" style="margin: 0 auto 1.5rem; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2);">
                    <i data-lucide="alert-triangle" style="color: var(--error); width: 40px; height: 40px;"></i>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Redirection Failed</h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 0.95rem;">${msg}</p>
                <a href="/" class="btn btn-primary" style="width: 100%;">Return to Home Dashboard</a>
            </div>
        `;
        lucide.createIcons();
    }

    /* ==========================================================================
       List Rendering
       ========================================================================== */
    function renderLinks(filterText = '') {
        const filtered = links.filter(item => {
            const query = filterText.toLowerCase();
            return item.shortCode.toLowerCase().includes(query) || 
                   item.url.toLowerCase().includes(query);
        });

        // Sort by created_at desc (newest first)
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        if (filtered.length === 0) {
            linksContainer.innerHTML = '';
            linksContainer.appendChild(emptyState);
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            linksContainer.innerHTML = '';
            
            filtered.forEach(item => {
                const card = document.createElement('div');
                
                // Deterministic sticky note color and rotation based on shortCode char codes
                const stickyColors = ['card-yellow', 'card-blue', 'card-pink', 'card-green'];
                let charSum = 0;
                for (let i = 0; i < item.shortCode.length; i++) {
                    charSum += item.shortCode.charCodeAt(i);
                }
                const colorClass = stickyColors[charSum % stickyColors.length];
                const rotationDegrees = ((charSum % 7) - 3) * 0.5; // -1.5deg to 1.5deg
                
                card.className = `glass-card link-card ${colorClass}`;
                card.dataset.code = item.shortCode;
                card.style.transform = `rotate(${rotationDegrees}deg)`;
                
                const shortUrl = `${window.location.origin}/r/${item.shortCode}`;
                const displayDate = formatDate(item.created_at);
                
                card.innerHTML = `
                    <div class="link-card-header">
                        <div class="shortcode-wrapper">
                            <a href="${shortUrl}" target="_blank" class="short-link" title="Visit Link">${item.shortCode}</a>
                            <button class="btn-copy-card" data-copy-target="${shortUrl}" title="Copy link">
                                <i data-lucide="copy" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                        <span class="date-badge">${displayDate}</span>
                    </div>
                    <div class="link-card-body">
                        <span class="original-url-label">Destination</span>
                        <p class="original-url-text" title="${item.url}">${escapeHtml(item.url)}</p>
                    </div>
                    <div class="link-card-footer">
                        <div class="click-counter" id="clicks-badge-${item.shortCode}">
                            <i data-lucide="bar-chart-2"></i>
                            <span>Stats Loading...</span>
                        </div>
                        <div class="card-actions">
                            <button class="icon-btn-small primary-btn btn-stats-action" title="Performance Stats">
                                <i data-lucide="activity" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="icon-btn-small primary-btn btn-edit-action" title="Edit Destination">
                                <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
                            </button>
                            <button class="icon-btn-small danger btn-delete-action" title="Delete Shortcode">
                                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                linksContainer.appendChild(card);
                
                // Fetch dynamic click counts in background for each card
                fetchStatsForCard(item.shortCode);
            });
            
            lucide.createIcons();
            attachCardEvents();
        }
    }

    async function fetchStatsForCard(code) {
        try {
            const response = await fetch(`${API_BASE}/api/shorten/${code}/stats`);
            const data = await response.json();
            
            // Note: Stats endpoint yields status 400 on success due to backend bug.
            // We verify by checking if the required payload variables exist.
            const clickBadge = document.getElementById(`clicks-badge-${code}`);
            if (clickBadge) {
                if (data && data.accessCount !== undefined) {
                    clickBadge.querySelector('span').textContent = `${data.accessCount} click${data.accessCount === 1 ? '' : 's'}`;
                } else {
                    clickBadge.querySelector('span').textContent = 'No data';
                }
            }
        } catch (error) {
            console.error(`Error fetching card stats for ${code}:`, error);
            const clickBadge = document.getElementById(`clicks-badge-${code}`);
            if (clickBadge) {
                clickBadge.querySelector('span').textContent = 'Error';
            }
        }
    }

    function attachCardEvents() {
        // Clipboard Copy
        const copyBtns = document.querySelectorAll('.btn-copy-card');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetText = btn.getAttribute('data-copy-target');
                copyToClipboard(targetText);
                
                // Temporary success icon
                const icon = btn.querySelector('i');
                icon.setAttribute('data-lucide', 'check');
                icon.style.color = 'var(--success)';
                lucide.createIcons();
                
                setTimeout(() => {
                    icon.setAttribute('data-lucide', 'copy');
                    icon.style.color = '';
                    lucide.createIcons();
                }, 1500);
            });
        });

        // View Stats Event
        const statsBtns = document.querySelectorAll('.btn-stats-action');
        statsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.currentTarget.closest('.link-card').dataset.code;
                openStatsModal(code);
            });
        });

        // Edit Event
        const editBtns = document.querySelectorAll('.btn-edit-action');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.currentTarget.closest('.link-card');
                const code = card.dataset.code;
                const originalUrl = card.querySelector('.original-url-text').title;
                openEditModal(code, originalUrl);
            });
        });

        // Delete Event
        const deleteBtns = document.querySelectorAll('.btn-delete-action');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.currentTarget.closest('.link-card').dataset.code;
                openDeleteConfirmModal(code);
            });
        });
    }

    /* ==========================================================================
       CRUD Logic
       ========================================================================== */
    // CREATE (Shorten)
    shortenForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const urlValue = longUrlInput.value.trim();
        
        if (!validateUrl(urlValue)) {
            showInputError('Please enter a valid URL, including http:// or https://');
            return;
        }
        
        hideInputError();
        setShortenLoading(true);
        
        try {
            const response = await fetch(`${API_BASE}/api/shorten`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlValue })
            });
            
            const data = await response.json();
            
            if (response.status === 201) {
                // Add to local list state
                const newLink = {
                    shortCode: data.shortCode,
                    url: data.url,
                    created_at: data.created_at || new Date().toISOString()
                };
                
                links.push(newLink);
                localStorage.setItem('linkspire_links', JSON.stringify(links));
                
                longUrlInput.value = '';
                clearBtn.classList.add('hidden');
                
                showToast('URL shortened successfully!', 'success');
                renderLinks();
            } else {
                showInputError(data.message || 'Failed to shorten URL');
                showToast(data.message || 'Error occurred while shortening URL', 'error');
            }
        } catch (error) {
            console.error('Shorten error:', error);
            showToast('Unable to connect to the server.', 'error');
        } finally {
            setShortenLoading(false);
        }
    });

    // UPDATE (Edit)
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUrlValue = editUrlInput.value.trim();
        
        if (!validateUrl(newUrlValue)) {
            showEditError('Please enter a valid URL, including http:// or https://');
            return;
        }
        
        hideEditError();
        setEditLoading(true);
        
        try {
            const response = await fetch(`${API_BASE}/api/shorten/${currentEditCode}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrlValue })
            });
            
            const data = await response.json();
            
            if (response.status === 200) {
                // Update local storage
                links = links.map(item => {
                    if (item.shortCode === currentEditCode) {
                        return {
                            ...item,
                            url: data.url,
                            updated_at: data.updated_at
                        };
                    }
                    return item;
                });
                
                localStorage.setItem('linkspire_links', JSON.stringify(links));
                closeModal(editModal);
                showToast('Destination URL updated successfully!', 'success');
                renderLinks();
            } else {
                showEditError(data.message || 'Failed to update shortlink');
                showToast(data.message || 'Error occurred while updating URL', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast('Unable to connect to the server.', 'error');
        } finally {
            setEditLoading(false);
        }
    });

    // DELETE
    async function deleteLink(code) {
        try {
            const response = await fetch(`${API_BASE}/api/shorten/${code}`, {
                method: 'DELETE'
            });
            
            // Delete endpoint returns status 204 (no body) or 200 (if error JSON)
            if (response.status === 204 || response.status === 200) {
                links = links.filter(item => item.shortCode !== code);
                localStorage.setItem('linkspire_links', JSON.stringify(links));
                showToast('Link removed from vault.', 'success');
                renderLinks();
            } else {
                const data = await response.json();
                showToast(data.message || 'Failed to delete shortened link', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Unable to delete short URL due to network connection issues.', 'error');
        }
    }

    // READ STATS (View performance)
    async function openStatsModal(code) {
        // Reset modal state
        modalClicksCount.textContent = '...';
        modalOriginalUrl.href = '#';
        modalOriginalUrl.querySelector('span').textContent = 'Loading...';
        modalShortCode.textContent = code;
        modalCreatedAt.textContent = 'Loading...';
        modalUpdatedAt.textContent = 'Loading...';
        
        modalCopyCodeBtn.onclick = () => {
            const shortUrl = `${window.location.origin}/r/${code}`;
            copyToClipboard(shortUrl);
        };
        
        openModal(statsModal);
        
        try {
            const response = await fetch(`${API_BASE}/api/shorten/${code}/stats`);
            const data = await response.json();
            
            // Note: Stats endpoint yields status 400 on success due to backend bug.
            if (data && data.shortCode) {
                modalClicksCount.textContent = data.accessCount ?? 0;
                modalOriginalUrl.href = data.url;
                modalOriginalUrl.querySelector('span').textContent = data.url;
                modalCreatedAt.textContent = formatDate(data.created_at);
                modalUpdatedAt.textContent = formatDate(data.updated_at);
            } else {
                modalOriginalUrl.querySelector('span').textContent = 'Data retrieval issue';
                showToast('Failed to parse link details.', 'error');
            }
        } catch (error) {
            console.error('Stats error:', error);
            modalClicksCount.textContent = '0';
            modalOriginalUrl.querySelector('span').textContent = 'Network offline';
            showToast('Unable to download clicks dashboard.', 'error');
        }
    }

    function openEditModal(code, originalUrl) {
        currentEditCode = code;
        editShortCodeDisplay.textContent = code;
        editUrlInput.value = originalUrl;
        hideEditError();
        openModal(editModal);
        
        setTimeout(() => {
            editUrlInput.focus();
            editUrlInput.select();
        }, 100);
    }

    function openDeleteConfirmModal(code) {
        currentDeleteCode = code;
        deleteShortCodeDisplay.textContent = code;
        openModal(deleteModal);
    }

    /* ==========================================================================
       Modal Animations
       ========================================================================== */
    function openModal(modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    closeStatsBtn.addEventListener('click', () => closeModal(statsModal));
    statsCloseBtnFooter.addEventListener('click', () => closeModal(statsModal));
    closeEditBtn.addEventListener('click', () => closeModal(editModal));
    cancelEditBtn.addEventListener('click', () => closeModal(editModal));
    
    closeDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
    
    confirmDeleteBtn.addEventListener('click', async () => {
        if (currentDeleteCode) {
            const codeToDel = currentDeleteCode;
            closeModal(deleteModal);
            await deleteLink(codeToDel);
            currentDeleteCode = null;
        }
    });

    // Close on overlay background click
    window.addEventListener('click', (e) => {
        if (e.target === statsModal) closeModal(statsModal);
        if (e.target === editModal) closeModal(editModal);
        if (e.target === deleteModal) closeModal(deleteModal);
    });

    /* ==========================================================================
       UI Helpers & Search filters
       ========================================================================== */
    // Search input
    searchInput.addEventListener('input', (e) => {
        renderLinks(e.target.value);
    });

    // Input clearing button behaviour
    longUrlInput.addEventListener('input', () => {
        if (longUrlInput.value.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    });

    clearBtn.addEventListener('click', () => {
        longUrlInput.value = '';
        clearBtn.classList.add('hidden');
        longUrlInput.focus();
    });

    function setShortenLoading(isLoading) {
        if (isLoading) {
            shortenSubmitBtn.classList.add('loading');
            shortenSubmitBtn.disabled = true;
            shortenSpinner.classList.remove('hidden');
        } else {
            shortenSubmitBtn.classList.remove('loading');
            shortenSubmitBtn.disabled = false;
            shortenSpinner.classList.add('hidden');
        }
    }

    function setEditLoading(isLoading) {
        if (isLoading) {
            saveEditBtn.classList.add('loading');
            saveEditBtn.disabled = true;
            editSpinner.classList.remove('hidden');
        } else {
            saveEditBtn.classList.remove('loading');
            saveEditBtn.disabled = false;
            editSpinner.classList.add('hidden');
        }
    }

    function showInputError(msg) {
        errorMessage.textContent = msg;
        urlError.classList.remove('hidden');
    }

    function hideInputError() {
        urlError.classList.add('hidden');
    }

    function showEditError(msg) {
        editErrorMessage.textContent = msg;
        editUrlError.classList.remove('hidden');
    }

    function hideEditError() {
        editUrlError.classList.add('hidden');
    }

    // URL Validator helper
    function validateUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Date formatting helper
    function formatDate(dateString) {
        if (!dateString) return 'Unavailable';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unavailable';
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Clipboard API helper
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Link copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Could not copy text: ', err);
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    }

    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Link copied to clipboard!', 'success');
        } catch (err) {
            console.error('Fallback copy fail:', err);
            showToast('Failed to copy link.', 'error');
        }
        document.body.removeChild(textArea);
    }

    // Toast Manager
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'x-circle';
        
        toast.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon"></i>
            <div class="toast-content">${message}</div>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();
        
        // Auto remove toast
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 3000);
    }

    // HTML Escaping utility
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});
