/**
 * Modern Sliding Dropdown Box Component
 * Universally transforms all native <select> elements into sleek, 
 * down-sliding, fully animated dropdowns with search, keyboard navigation,
 * and seamless two-way state synchronization.
 * Works seamlessly across mobile, tablet, and desktop devices.
 */
(function() {
    'use strict';

    let activeMenu = null;
    let activeTrigger = null;
    let activeSelect = null;
    let activeScrollHandler = null;

    // Helper: Escape HTML string
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Helper: Truncate text for trigger
    function truncateText(text, maxLen = 48) {
        if (!text) return '';
        return text.length > maxLen ? text.substring(0, maxLen - 3) + '...' : text;
    }

    /**
     * Close the currently open dropdown menu
     */
    function closeActiveDropdown() {
        if (!activeMenu) return;

        const menu = activeMenu;
        const trigger = activeTrigger;

        menu.classList.remove('is-open');
        if (trigger) {
            trigger.classList.remove('is-active');
            trigger.setAttribute('aria-expanded', 'false');
        }

        if (activeScrollHandler) {
            window.removeEventListener('scroll', activeScrollHandler, true);
            window.removeEventListener('resize', activeScrollHandler, true);
            activeScrollHandler = null;
        }

        setTimeout(() => {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        }, 220);

        activeMenu = null;
        activeTrigger = null;
        activeSelect = null;
    }

    /**
     * Synchronize custom trigger with underlying select element
     */
    function syncTrigger(selectEl, wrapper) {
        if (!selectEl || !wrapper) return;
        const trigger = wrapper.querySelector('.modern-dropdown-trigger');
        if (!trigger) return;

        const selectedOption = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
        const labelSpan = trigger.querySelector('.modern-dropdown-label');
        
        if (selectedOption && labelSpan) {
            const rawText = selectedOption.textContent.trim();
            labelSpan.textContent = truncateText(rawText, 52);
            trigger.title = rawText;
        }

        // Mirror disabled state
        if (selectEl.disabled) {
            trigger.classList.add('is-disabled');
            trigger.setAttribute('aria-disabled', 'true');
            trigger.setAttribute('tabindex', '-1');
        } else {
            trigger.classList.remove('is-disabled');
            trigger.removeAttribute('aria-disabled');
            trigger.setAttribute('tabindex', '0');
        }

        // Mirror status pill classes if applicable
        if (selectEl.classList.contains('status-pill')) {
            const currentVal = (selectEl.value || '').toLowerCase();
            trigger.className = `modern-dropdown-trigger modern-status-pill status-${currentVal}`;
            if (selectEl.disabled) trigger.classList.add('is-disabled');
        }
    }

    /**
     * Open the down-sliding dropdown menu for a select element
     */
    function openDropdown(selectEl, wrapper, trigger) {
        if (selectEl.disabled || trigger.classList.contains('is-disabled')) return;

        // If already open, close it
        if (activeTrigger === trigger) {
            closeActiveDropdown();
            return;
        }

        // Close any other open dropdown
        closeActiveDropdown();

        const isStatusPill = selectEl.classList.contains('status-pill');
        const options = Array.from(selectEl.options);
        const hasManyOptions = options.length > 6 && !isStatusPill;

        // Build menu DOM
        const menu = document.createElement('div');
        menu.className = `modern-dropdown-menu${isStatusPill ? ' modern-dropdown-pill-menu' : ''}`;
        menu.setAttribute('role', 'listbox');

        let searchInput = null;
        if (hasManyOptions) {
            const searchWrap = document.createElement('div');
            searchWrap.className = 'modern-dropdown-search-wrap';
            searchWrap.innerHTML = `
                <i class="fas fa-search modern-dropdown-search-icon"></i>
                <input type="text" class="modern-dropdown-search-input" placeholder="Type to filter..." autocomplete="off" spellcheck="false">
                <button type="button" class="modern-dropdown-search-clear" style="display: none;">&times;</button>
            `;
            searchInput = searchWrap.querySelector('input');
            const clearBtn = searchWrap.querySelector('button');

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                clearBtn.style.display = query ? 'block' : 'none';
                let visibleCount = 0;

                menu.querySelectorAll('.modern-dropdown-item').forEach(item => {
                    const text = item.dataset.searchText || '';
                    if (!query || text.includes(query)) {
                        item.style.display = 'flex';
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                });

                const emptyEl = menu.querySelector('.modern-dropdown-empty');
                if (emptyEl) {
                    emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
                }
            });

            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            });

            menu.appendChild(searchWrap);
        }

        // Options List Container
        const listWrap = document.createElement('div');
        listWrap.className = 'modern-dropdown-list';

        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = `modern-dropdown-item${opt.selected ? ' is-selected' : ''}${opt.disabled ? ' is-disabled' : ''}`;
            item.dataset.value = opt.value;
            item.dataset.searchText = opt.textContent.toLowerCase();
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
            item.title = opt.title || opt.textContent;

            if (isStatusPill) {
                const valLower = opt.value.toLowerCase();
                item.innerHTML = `
                    <span class="modern-status-dot status-${valLower}"></span>
                    <span class="modern-dropdown-item-text">${escapeHtml(opt.textContent)}</span>
                    <span class="modern-dropdown-item-check"><i class="fas fa-check"></i></span>
                `;
            } else {
                item.innerHTML = `
                    <span class="modern-dropdown-item-text">${escapeHtml(opt.textContent)}</span>
                    <span class="modern-dropdown-item-check"><i class="fas fa-check"></i></span>
                `;
            }

            item.addEventListener('click', (e) => {
                e.stopPropagation();
                if (opt.disabled) return;

                selectEl.value = opt.value;
                // Dispatch native events
                selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                selectEl.dispatchEvent(new Event('input', { bubbles: true }));
                
                // If inline onchange exists, trigger it
                if (typeof selectEl.onchange === 'function') {
                    selectEl.onchange();
                }

                syncTrigger(selectEl, wrapper);
                closeActiveDropdown();
                trigger.focus();
            });

            listWrap.appendChild(item);
        });

        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'modern-dropdown-empty';
        emptyMsg.style.display = 'none';
        emptyMsg.innerHTML = '<i class="fas fa-search" style="margin-right: 6px; opacity: 0.5;"></i>No matching options';
        listWrap.appendChild(emptyMsg);

        menu.appendChild(listWrap);
        document.body.appendChild(menu);

        // Position Menu Relative to Trigger
        function updatePosition() {
            if (!trigger.isConnected) {
                closeActiveDropdown();
                return;
            }

            const rect = trigger.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // If trigger scrolled entirely out of view, close
            if (rect.bottom < 0 || rect.top > viewportHeight) {
                closeActiveDropdown();
                return;
            }

            let menuWidth = rect.width;
            if (isStatusPill) {
                menuWidth = Math.max(120, rect.width);
            } else if (menuWidth < 180) {
                menuWidth = Math.max(180, rect.width);
            }

            // Ensure menu fits horizontally in viewport
            let left = rect.left;
            if (left + menuWidth > viewportWidth - 8) {
                left = viewportWidth - menuWidth - 8;
            }
            if (left < 8) left = 8;

            const estimatedMenuHeight = Math.min(280, (options.length * 38) + (hasManyOptions ? 50 : 16));
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            const opensUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;

            menu.style.width = `${menuWidth}px`;
            menu.style.left = `${left}px`;

            if (opensUp) {
                menu.classList.add('opens-up');
                menu.style.top = 'auto';
                menu.style.bottom = `${viewportHeight - rect.top + 4}px`;
            } else {
                menu.classList.remove('opens-up');
                menu.style.bottom = 'auto';
                menu.style.top = `${rect.bottom + 4}px`;
            }
        }

        updatePosition();

        // Listen for scroll/resize to update menu position
        activeScrollHandler = updatePosition;
        window.addEventListener('scroll', activeScrollHandler, true);
        window.addEventListener('resize', activeScrollHandler, true);

        // Smooth downward sliding animation frame
        requestAnimationFrame(() => {
            menu.classList.add('is-open');
            trigger.classList.add('is-active');
            trigger.setAttribute('aria-expanded', 'true');

            // Scroll selected item into view
            const selectedItem = listWrap.querySelector('.modern-dropdown-item.is-selected');
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest' });
            }

            // Auto-focus search input if present (on non-touch devices)
            if (searchInput && window.innerWidth > 768) {
                setTimeout(() => searchInput.focus(), 50);
            }
        });

        activeMenu = menu;
        activeTrigger = trigger;
        activeSelect = selectEl;
    }

    /**
     * Enhance a single <select> element
     */
    function enhanceSelect(selectEl) {
        if (!selectEl || selectEl.dataset.modernEnhanced === 'true') {
            if (selectEl && selectEl.dataset.modernEnhanced === 'true') {
                const wrapper = selectEl.nextElementSibling;
                if (wrapper && wrapper.classList.contains('modern-dropdown-wrapper')) {
                    syncTrigger(selectEl, wrapper);
                }
            }
            return;
        }

        // Do not enhance if explicitly opted out
        if (selectEl.dataset.modernIgnore === 'true') return;

        selectEl.dataset.modernEnhanced = 'true';
        selectEl.classList.add('modern-select-hidden');

        const isStatusPill = selectEl.classList.contains('status-pill');

        // Create trigger wrapper
        const wrapper = document.createElement('div');
        wrapper.className = `modern-dropdown-wrapper${isStatusPill ? ' modern-dropdown-pill-wrapper' : ''}`;
        
        // Copy inline styling if needed for layout
        if (selectEl.style.width && !isStatusPill) {
            wrapper.style.width = selectEl.style.width;
        }

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = isStatusPill 
            ? `modern-dropdown-trigger modern-status-pill status-${(selectEl.value || '').toLowerCase()}`
            : 'modern-dropdown-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const initialOption = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
        const initialText = initialOption ? initialOption.textContent.trim() : '';

        trigger.innerHTML = `
            <span class="modern-dropdown-label">${escapeHtml(truncateText(initialText, 52))}</span>
            <span class="modern-dropdown-chevron"><i class="fas fa-chevron-down"></i></span>
        `;
        trigger.title = initialText;

        wrapper.appendChild(trigger);
        selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

        // Click Trigger Handler
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDropdown(selectEl, wrapper, trigger);
        });

        // Keyboard navigation on Trigger
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                openDropdown(selectEl, wrapper, trigger);
            } else if (e.key === 'Escape') {
                closeActiveDropdown();
            }
        });

        // Sync initial state
        syncTrigger(selectEl, wrapper);

        // Watch for changes to attributes (e.g. disabled, class)
        const attrObserver = new MutationObserver(() => {
            syncTrigger(selectEl, wrapper);
        });
        attrObserver.observe(selectEl, { attributes: true, attributeFilter: ['disabled', 'class', 'value'] });

        // Watch for changes to <option> children
        const childrenObserver = new MutationObserver(() => {
            syncTrigger(selectEl, wrapper);
        });
        childrenObserver.observe(selectEl, { childList: true, subtree: true });

        // Listen for change events dispatched on native select
        selectEl.addEventListener('change', () => {
            syncTrigger(selectEl, wrapper);
        });
    }

    /**
     * Scan and enhance all <select> elements in a given root container
     */
    function init(container = document) {
        if (!container) return;
        const selects = container.querySelectorAll ? container.querySelectorAll('select') : [];
        selects.forEach(sel => enhanceSelect(sel));
    }

    /**
     * Programmatic sync helper
     */
    function sync(selectEl) {
        if (!selectEl) return;
        const wrapper = selectEl.nextElementSibling;
        if (wrapper && wrapper.classList.contains('modern-dropdown-wrapper')) {
            syncTrigger(selectEl, wrapper);
        }
    }

    // Intercept HTMLSelectElement.prototype.value setter so programmatic assignments auto-sync
    try {
        const originalValueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
        Object.defineProperty(HTMLSelectElement.prototype, 'value', {
            set: function(val) {
                originalValueSetter.call(this, val);
                if (this.dataset && this.dataset.modernEnhanced === 'true') {
                    const wrapper = this.nextElementSibling;
                    if (wrapper && wrapper.classList.contains('modern-dropdown-wrapper')) {
                        syncTrigger(this, wrapper);
                    }
                }
            }
        });
    } catch (e) {
        // Fallback for environments with strict property descriptors
    }

    // Global click listener to close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (activeMenu && !activeMenu.contains(e.target) && (!activeTrigger || !activeTrigger.contains(e.target))) {
            closeActiveDropdown();
        }
    });

    // Global key listener for Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeMenu) {
            closeActiveDropdown();
        }
    });

    // Auto-enhance newly added nodes via MutationObserver
    const bodyObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'childList') {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'SELECT') {
                            enhanceSelect(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('select').forEach(s => enhanceSelect(s));
                        }
                    }
                });
            }
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init(document);
            bodyObserver.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        init(document);
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Expose API on window
    window.ModernDropdown = {
        init,
        enhance: enhanceSelect,
        sync,
        close: closeActiveDropdown
    };
})();
