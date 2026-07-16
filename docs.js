/**
 * ADRENALINE DOCS — Complete JavaScript
 * Modern documentation functionality: Sidebar, Scroll spy, TOC, search, copy code, theme.
 */

(function () {
    'use strict';

    // ── Configuration & State ──
    let searchData = [];
    let sectionOrder = [];
    let docsObserver = null;
    let currentFocusedResultIndex = -1;

    // ── Theme Management ──
    function toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        try {
            localStorage.setItem('docs-theme', isLight ? 'light' : 'dark');
        } catch (e) {
            console.error('Failed to save theme setting:', e);
        }
    }

    function restoreTheme() {
        try {
            const val = localStorage.getItem('docs-theme');
            const body = document.body;
            if (val === 'light') {
                body.classList.add('light-theme');
            } else if (val === 'dark') {
                body.classList.remove('light-theme');
            } else {
                // Default to dark theme, check system preferences if needed
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    body.classList.add('light-theme');
                }
            }
        } catch (e) {
            console.error('Failed to restore theme setting:', e);
        }
    }

    // ── Sidebar Categories ──
    function toggleCategory(el) {
        const cat = el.closest('.docs-sidebar-category');
        if (!cat) return;
        
        cat.classList.toggle('collapsed');
        const key = cat.querySelector('.docs-sidebar-cat-title span')?.textContent.trim();
        if (key) {
            try {
                localStorage.setItem('docs-cat-' + key, cat.classList.contains('collapsed'));
            } catch (e) {
                console.error('Failed to save sidebar category state:', e);
            }
        }
    }

    function restoreCategories() {
        document.querySelectorAll('.docs-sidebar-category').forEach(cat => {
            const key = cat.querySelector('.docs-sidebar-cat-title span')?.textContent.trim();
            if (key) {
                try {
                    const val = localStorage.getItem('docs-cat-' + key);
                    if (val === 'true') {
                        cat.classList.add('collapsed');
                    } else if (val === 'false') {
                        cat.classList.remove('collapsed');
                    }
                } catch (e) {
                    console.error('Failed to restore sidebar category state:', e);
                }
            }
        });
    }

    // ── Mobile Sidebar Drawer ──
    function toggleMobileSidebar() {
        const sidebar = document.getElementById('docs-sidebar');
        const overlay = document.getElementById('docs-sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        }
    }

    function closeMobileSidebar() {
        const sidebar = document.getElementById('docs-sidebar');
        const overlay = document.getElementById('docs-sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    // ── Scroll Spy & Intersection Tracking ──
    function initDocsTracking() {
        const sections = document.querySelectorAll('.docs-section[data-section]');
        sectionOrder = Array.from(sections).map(s => s.id);

        // Generate IDs for h2/h3 if they don't have them
        sections.forEach(s => {
            s.querySelectorAll('h2, h3').forEach(heading => {
                if (!heading.id) {
                    heading.id = heading.textContent
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '');
                }
            });
        });

        if (docsObserver) {
            docsObserver.disconnect();
        }

        docsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    if (id) {
                        setActiveSection(id);
                    }
                }
            });
        }, {
            rootMargin: '-80px 0px -60% 0px',
            threshold: 0
        });

        sections.forEach(s => docsObserver.observe(s));
        if (sections.length > 0) {
            setActiveSection(sections[0].id);
        }
    }

    function setActiveSection(id) {
        // Update sidebar links
        document.querySelectorAll('.docs-sidebar-link').forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.docs-sidebar-link[data-section="${id}"]`) ||
                     document.querySelector(`.docs-sidebar-link[href="#${id}"]`);
        
        if (link) {
            link.classList.add('active');
            
            // Expand category if collapsed
            const cat = link.closest('.docs-sidebar-category');
            if (cat && cat.classList.contains('collapsed')) {
                cat.classList.remove('collapsed');
            }

            // Update Breadcrumb Current Item
            const breadcrumbCurrent = document.getElementById('docs-breadcrumb-current');
            if (breadcrumbCurrent) {
                breadcrumbCurrent.textContent = link.textContent.trim();
            }
        }

        // Build Table of Contents for this section
        buildTOC(id);

        // Update Prev / Next buttons
        updatePrevNext(id);
    }

    // ── Table of Contents ──
    function buildTOC(sectionId) {
        const tocNav = document.getElementById('docs-toc-nav');
        if (!tocNav) return;
        tocNav.innerHTML = '';

        const section = document.getElementById(sectionId);
        if (!section) return;

        const headings = section.querySelectorAll('h2, h3');
        if (headings.length === 0) {
            const emptyMsg = document.createElement('span');
            emptyMsg.style.fontSize = '0.75rem';
            emptyMsg.style.color = 'var(--docs-text-faint)';
            emptyMsg.textContent = 'No subheadings';
            tocNav.appendChild(emptyMsg);
            return;
        }

        headings.forEach(h => {
            const a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            a.className = h.tagName.toLowerCase() === 'h3' ? 'toc-h3' : 'toc-h2';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(h.id);
                if (target) {
                    const offset = 88; // Height of header + padding
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = target.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Highlight manually clicked TOC item
                    tocNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
                    a.classList.add('active');
                }
            });
            tocNav.appendChild(a);
        });

        // Set first item active by default
        if (tocNav.firstChild && tocNav.firstChild.tagName === 'A') {
            tocNav.firstChild.classList.add('active');
        }
    }

    // Scroll listener on window to update TOC item highlighting within current section
    window.addEventListener('scroll', () => {
        const tocNav = document.getElementById('docs-toc-nav');
        if (!tocNav) return;

        const links = tocNav.querySelectorAll('a');
        if (links.length === 0) return;

        let activeId = '';
        const offset = 120; // threshold

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const target = document.getElementById(href.substring(1));
            if (target) {
                const top = target.getBoundingClientRect().top;
                if (top <= offset) {
                    activeId = href;
                }
            }
        });

        if (activeId) {
            links.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === activeId);
            });
        } else if (links.length > 0) {
            // Default first link active if before any headings
            links.forEach((link, idx) => {
                link.classList.toggle('active', idx === 0);
            });
        }
    });

    // ── Previous / Next Navigation ──
    function updatePrevNext(id) {
        const idx = sectionOrder.indexOf(id);
        const prevBtn = document.getElementById('docs-prev');
        const nextBtn = document.getElementById('docs-next');
        const prevTitle = document.getElementById('docs-prev-title');
        const nextTitle = document.getElementById('docs-next-title');

        if (!prevBtn || !nextBtn) return;

        // Previous
        if (idx > 0) {
            const prevId = sectionOrder[idx - 1];
            const prevLink = document.querySelector(`.docs-sidebar-link[data-section="${prevId}"]`);
            if (prevLink) {
                prevBtn.href = '#' + prevId;
                prevTitle.textContent = prevLink.textContent.trim();
                prevBtn.classList.remove('disabled');
            }
        } else {
            prevBtn.classList.add('disabled');
            prevTitle.textContent = '—';
            prevBtn.removeAttribute('href');
        }

        // Next
        if (idx < sectionOrder.length - 1) {
            const nextId = sectionOrder[idx + 1];
            const nextLink = document.querySelector(`.docs-sidebar-link[data-section="${nextId}"]`);
            if (nextLink) {
                nextBtn.href = '#' + nextId;
                nextTitle.textContent = nextLink.textContent.trim();
                nextBtn.classList.remove('disabled');
            }
        } else {
            nextBtn.classList.add('disabled');
            nextTitle.textContent = '—';
            nextBtn.removeAttribute('href');
        }
    }

    // ── Copy Code Buttons ──
    function addCopyButtons() {
        document.querySelectorAll('.docs-code-block').forEach(block => {
            const header = block.querySelector('.docs-code-header');
            const codeEl = block.querySelector('.docs-code code');
            if (!header || !codeEl) return;

            // Check if button already exists
            if (header.querySelector('.docs-copy-btn')) return;

            const btn = document.createElement('button');
            btn.className = 'docs-copy-btn';
            btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
            `;

            btn.addEventListener('click', () => {
                const text = codeEl.textContent || '';
                navigator.clipboard.writeText(text).then(() => {
                    btn.classList.add('copied');
                    btn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Copied!
                    `;
                    showToast('Copied to clipboard!', 'success');

                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = `
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copy
                        `;
                    }, 2000);
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                    showToast('Failed to copy code.', 'error');
                });
            });

            header.appendChild(btn);
        });
    }

    // ── Toast Notifications ──
    function showToast(message, type = 'success') {
        let toast = document.getElementById('docs-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'docs-toast';
            toast.className = 'docs-toast hidden';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `docs-toast ${type}`;
        
        // Custom styling dynamic color overrides
        if (type === 'success') {
            toast.style.background = 'rgba(34, 197, 94, 0.1)';
            toast.style.borderColor = '#22C55E';
            toast.style.color = '#22C55E';
        } else if (type === 'error') {
            toast.style.background = 'rgba(239, 68, 68, 0.1)';
            toast.style.borderColor = '#EF4444';
            toast.style.color = '#EF4444';
        }

        toast.classList.remove('hidden');
        
        // Hide after 3 seconds
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        toast.timeoutId = setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // ── Search Functional Logic ──
    function buildSearchData() {
        searchData = [];
        document.querySelectorAll('.docs-section[data-section]').forEach(section => {
            const id = section.id;
            const sidebarLink = document.querySelector(`.docs-sidebar-link[data-section="${id}"]`);
            const parentTitle = sidebarLink ? sidebarLink.textContent.trim() : id;

            // Page itself
            searchData.push({
                id: id,
                title: parentTitle,
                type: 'Page',
                parent: '',
                text: parentTitle.toLowerCase()
            });

            // Headings inside section
            section.querySelectorAll('h2, h3').forEach(heading => {
                const headingId = heading.id || heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                searchData.push({
                    id: headingId,
                    title: heading.textContent.trim(),
                    type: heading.tagName,
                    parent: parentTitle,
                    text: (parentTitle + ' ' + heading.textContent).toLowerCase()
                });
            });

            // Paragraphs for context
            section.querySelectorAll('p').forEach((p, idx) => {
                const textContent = p.textContent.trim();
                if (textContent.length > 20) {
                    searchData.push({
                        id: section.id, // navigate to section
                        title: textContent.substring(0, 70) + (textContent.length > 70 ? '...' : ''),
                        type: 'Content',
                        parent: parentTitle,
                        text: (parentTitle + ' ' + textContent).toLowerCase()
                    });
                }
            });
        });
    }

    function openSearch() {
        const dialog = document.getElementById('docs-search-dialog');
        const overlay = document.getElementById('docs-search-overlay');
        const input = document.getElementById('docs-search-input');
        
        if (dialog && overlay && input) {
            dialog.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            currentFocusedResultIndex = -1;
            
            setTimeout(() => {
                input.value = '';
                input.focus();
                filterSearchResults();
            }, 50);
        }
    }

    function closeSearch() {
        const dialog = document.getElementById('docs-search-dialog');
        const overlay = document.getElementById('docs-search-overlay');
        
        if (dialog && overlay) {
            dialog.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    function filterSearchResults() {
        const input = document.getElementById('docs-search-input');
        const resultsContainer = document.getElementById('docs-search-results');
        if (!input || !resultsContainer) return;

        const q = input.value.trim().toLowerCase();
        if (!q) {
            resultsContainer.innerHTML = '<div class="docs-search-empty">Type to start searching...</div>';
            currentFocusedResultIndex = -1;
            return;
        }

        // Fuzzy matches (contains query words)
        const queries = q.split(/\s+/).filter(Boolean);
        const matches = searchData.filter(item => {
            return queries.every(term => item.text.includes(term));
        }).slice(0, 10);

        if (matches.length === 0) {
            resultsContainer.innerHTML = '<div class="docs-search-empty">No results found.</div>';
            currentFocusedResultIndex = -1;
            return;
        }

        currentFocusedResultIndex = 0;
        resultsContainer.innerHTML = matches.map((m, idx) => {
            const metaInfo = m.parent ? `${m.type} in ${m.parent}` : m.type;
            const highlightedTitle = highlightMatch(m.title, q);
            const activeClass = idx === 0 ? 'focused' : '';
            return `
                <a href="#${m.id}" class="docs-search-result ${activeClass}" data-index="${idx}" data-target-id="${m.id}">
                    <div class="docs-search-result-title">${highlightedTitle}</div>
                    <div class="docs-search-result-meta">${metaInfo}</div>
                </a>
            `;
        }).join('');

        // Attach click click handlers to search items
        resultsContainer.querySelectorAll('.docs-search-result').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = el.getAttribute('data-target-id');
                navigateToTarget(targetId);
            });
        });
    }

    function highlightMatch(text, query) {
        const terms = query.split(/\s+/).filter(Boolean);
        let highlighted = text;
        terms.forEach(term => {
            const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        return highlighted;
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function navigateToTarget(targetId) {
        closeSearch();
        const target = document.getElementById(targetId);
        if (target) {
            setTimeout(() => {
                const offset = 88;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = target.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }

    // Keyboard navigation inside search dialog
    function handleSearchKeydown(e) {
        const dialog = document.getElementById('docs-search-dialog');
        if (!dialog || !dialog.classList.contains('open')) return;

        const resultsContainer = document.getElementById('docs-search-results');
        const results = resultsContainer ? resultsContainer.querySelectorAll('.docs-search-result') : [];
        
        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            results[currentFocusedResultIndex]?.classList.remove('focused');
            currentFocusedResultIndex = (currentFocusedResultIndex + 1) % results.length;
            results[currentFocusedResultIndex]?.classList.add('focused');
            results[currentFocusedResultIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            results[currentFocusedResultIndex]?.classList.remove('focused');
            currentFocusedResultIndex = (currentFocusedResultIndex - 1 + results.length) % results.length;
            results[currentFocusedResultIndex]?.classList.add('focused');
            results[currentFocusedResultIndex]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const focusedEl = results[currentFocusedResultIndex];
            if (focusedEl) {
                const targetId = focusedEl.getAttribute('data-target-id');
                navigateToTarget(targetId);
            }
        }
    }

    // ── Function Reference ──
    const API_DESCRIPTIONS = {
        checkcaller: 'Returns whether the current call came from the calling script.',
        clonefunction: 'Creates an independent callable copy of a function.',
        getscriptclosure: 'Returns the closure associated with a script object.',
        hookfunction: 'Replaces a function while returning the original implementation.',
        iscclosure: 'Checks whether a value is a native C closure.',
        islclosure: 'Checks whether a value is a Lua closure.',
        isexecutorclosure: 'Checks whether a closure was created by the executor.',
        newcclosure: 'Wraps a Lua callback as a protected C-style closure.',
        getfunctionhash: 'Returns a stable hash for comparing function implementations.',
        restorefunction: 'Restores a function that was previously hooked.',
        'debug.getconstant': 'Reads one constant from a function prototype.',
        'debug.getconstants': 'Returns the constants available to a function prototype.',
        'debug.getinfo': 'Returns metadata about a function or stack frame.',
        'debug.getproto': 'Returns one nested prototype from a function.',
        'debug.getprotos': 'Returns the nested prototypes owned by a function.',
        'debug.getstack': 'Reads a value from a running stack frame.',
        'debug.getupvalue': 'Reads one captured upvalue from a function.',
        'debug.getupvalues': 'Returns the captured upvalues for a function.',
        'debug.setconstant': 'Updates one constant in a function prototype.',
        'debug.setstack': 'Updates a value in a running stack frame.',
        'debug.setupvalue': 'Updates one captured upvalue on a function.',
        readfile: 'Reads text from a file in the client workspace.',
        writefile: 'Writes text to a file, replacing existing contents.',
        appendfile: 'Adds text to the end of a workspace file.',
        loadfile: 'Loads a workspace file and returns it as a callable chunk.',
        isfile: 'Checks whether a workspace path points to a file.',
        delfile: 'Deletes a file from the client workspace.',
        makefolder: 'Creates a folder in the client workspace.',
        isfolder: 'Checks whether a workspace path points to a folder.',
        delfolder: 'Deletes a workspace folder and its contents when permitted.',
        listfiles: 'Returns the files and folders inside a workspace path.',
        getscriptbytecode: 'Returns the bytecode associated with a script object.',
        getscripthash: 'Returns a hash that can be used to compare script bytecode.',
        getscripts: 'Returns script objects currently known to the environment.',
        getrunningscripts: 'Returns scripts that are active in the current session.',
        getscriptfromthread: 'Finds the script associated with a running thread.',
        getcallingscript: 'Returns the script that called the current function.',
        getsenv: 'Returns the environment table belonging to a script.',
        getloadedmodules: 'Returns module scripts that have been loaded.',
        loadstring: 'Compiles source text into a callable Lua function.',
        getinstances: 'Returns instances currently tracked by the client.',
        getnilinstances: 'Returns instances that are not parented in the visible tree.',
        gethui: 'Returns the hidden interface container used for client UI.',
        getconnections: 'Returns connections attached to an event signal.',
        getcallbackvalue: 'Reads the callback stored by a connection.',
        fireclickdetector: 'Triggers a click detector from a test script.',
        fireproximityprompt: 'Triggers a proximity prompt programmatically.',
        firetouchinterest: 'Simulates a touch interaction between two instances.',
        firesignal: 'Invokes listeners attached to a signal.',
        replicatesignal: 'Sends a supported signal through the replication layer.',
        getrawmetatable: 'Returns a metatable without respecting its read-only flag.',
        setrawmetatable: 'Assigns a metatable without the normal protection wrapper.',
        getnamecallmethod: 'Returns the method name used by the active namecall.',
        hookmetamethod: 'Hooks one metamethod and returns its original function.',
        isreadonly: 'Checks whether a table is marked read-only.',
        setreadonly: 'Changes the read-only state of a table.',
        'Drawing.new': 'Creates a new client-side drawing object of the requested type.',
        'Drawing.Fonts': 'Lists the font values available to drawing objects.',
        isrenderobj: 'Checks whether a value is a drawing render object.',
        getrenderproperty: 'Reads a property from a drawing render object.',
        setrenderproperty: 'Updates a property on a drawing render object.',
        cleardrawcache: 'Removes drawing objects created by the current script.',
        getcustomasset: 'Returns a usable asset reference for a local file.',
        getrenv: 'Returns the environment table for the running experience.',
        getgenv: 'Returns the shared executor environment table.',
        getgc: 'Returns garbage-collected objects visible to the script.',
        filtergc: 'Returns garbage-collected objects matching supplied filters.',
        getthreadidentity: 'Returns the identity level of the current thread.',
        setthreadidentity: 'Changes the identity level of the current thread.',
        identifyexecutor: 'Returns the executor name and version when available.',
        gethiddenproperty: 'Reads a property that is hidden from normal reflection.',
        sethiddenproperty: 'Updates a property that is hidden from normal reflection.',
        isscriptable: 'Checks whether an instance property is scriptable.',
        setscriptable: 'Changes whether an instance property is scriptable.',
        'cache.iscached': 'Checks whether an instance reference is in the client cache.',
        'cache.invalidate': 'Removes an instance reference from the client cache.',
        'cache.replace': 'Replaces one cached instance reference with another.',
        cloneref: 'Creates a separate reference to an instance.',
        compareinstances: 'Checks whether two instance references point to the same object.',
        getactors: 'Returns actor containers available to the current experience.',
        getactor: 'Finds a specific actor container by name or reference.',
        run_on_actor: 'Runs a function in the context of a selected actor.',
        rconsoleprint: 'Writes normal text to the client console.',
        rconsolewarn: 'Writes a warning message to the client console.',
        rconsoleerr: 'Writes an error message to the client console.',
        rconsoleclear: 'Clears the current client console output.',
        rconsolename: 'Changes the title shown on the client console.',
        rconsoleinput: 'Reads a line of input from the client console.',
        'crypt.hash': 'Creates a digest from supplied text or bytes.',
        'crypt.encrypt': 'Encrypts data with a supplied key.',
        'crypt.decrypt': 'Decrypts data with a compatible key.',
        'crypt.generatekey': 'Generates a random key for cryptographic helpers.',
        'crypt.base64encode': 'Encodes data as Base64 through the crypt namespace.',
        'crypt.base64decode': 'Decodes Base64 data through the crypt namespace.',
        base64_encode: 'Encodes text or bytes as Base64.',
        base64_decode: 'Decodes a Base64 string into its original data.',
        json_encode: 'Serializes a Lua value as JSON text.',
        json_decode: 'Parses JSON text into a Lua value.',
        url_encode: 'Escapes text so it can safely be used in a URL.',
        url_decode: 'Decodes URL-escaped text.',
        keypress: 'Sends a key-down event for a keyboard key.',
        keyrelease: 'Sends a key-up event for a keyboard key.',
        mouse1press: 'Sends a primary mouse-button press.',
        mouse1release: 'Sends a primary mouse-button release.',
        mousemoverel: 'Moves the mouse by a relative screen offset.',
        mousemoveabs: 'Moves the mouse to an absolute screen position.',
        mouse2press: 'Sends a secondary mouse-button press.',
        mouse2release: 'Sends a secondary mouse-button release.',
        getstate: 'Returns a proxy for the active Lua state.',
        pushvalue: 'Pushes a value onto a Lua state stack.',
        popvalue: 'Removes and returns the top value from a Lua state stack.',
        gettop: 'Returns the number of values on a Lua state stack.',
        settop: 'Moves the top of a Lua state stack to a selected index.',
        setclipboard: 'Copies text into the operating system clipboard.',
        getclipboard: 'Returns text currently stored in the operating system clipboard.',
        gethwid: 'Returns the client hardware identifier used for licensing.',
        setfpscap: 'Sets the maximum client frame rate.',
        getfpscap: 'Returns the current client frame-rate cap.',
        isnetworkowner: 'Checks whether the client owns an instance network region.',
        isrbxactive: 'Checks whether the experience window currently has focus.',
        queue_on_teleport: 'Queues source text to run after the next teleport.',
        setsimulationradius: 'Sets the supported simulation radius values for testing.',
        getnetworkownershipauto: 'Reads automatic network-ownership behavior.',
        setnetworkownershipauto: 'Changes automatic network-ownership behavior.',
        request: 'Sends an HTTP request and returns the response details.',
        'WebSocket.connect': 'Opens a WebSocket connection to a supported endpoint.',
        'WebSocket.OnMessage': 'Registers a callback for incoming WebSocket messages.',
        'WebSocket.OnClose': 'Registers a callback for a closed WebSocket connection.',
        'WebSocket.Send': 'Sends text or data through an open WebSocket.',
        'WebSocket.Close': 'Closes an open WebSocket connection.',
        lz4compress: 'Compresses data using the LZ4 format.',
        lz4decompress: 'Decompresses data that was encoded with LZ4.'
    };

    function apiSlug(name) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    function decorateApiEntries() {
        document.querySelectorAll('.api-section').forEach(section => {
            section.querySelectorAll('.api-list li').forEach(item => {
                const code = item.querySelector('code');
                if (!code) return;
                const name = code.textContent.trim();
                const slug = apiSlug(name);
                const functionId = `api-${section.id}-${slug}`;
                const description = API_DESCRIPTIONS[name] || 'Provides the ' + name + ' helper for scripts in this reference category.';
                item.id = functionId;
                item.classList.add('api-entry');
                code.replaceWith(Object.assign(document.createElement('a'), {
                    className: 'api-function-link',
                    href: `/docs/${section.id}/${slug}`,
                    textContent: name
                }));
                const detail = document.createElement('p');
                detail.className = 'api-function-description';
                detail.textContent = description;
                item.appendChild(detail);
            });
        });
    }

    function openApiEntryFromPath() {
        const parts = window.location.pathname.split('/').filter(Boolean);
        if (parts[0] !== 'docs' || parts.length < 3) return;
        const sectionId = parts[1];
        const functionId = `api-${sectionId}-${apiSlug(parts.slice(2).join('-'))}`;
        const target = document.getElementById(functionId);
        if (!target) return;
        const section = document.getElementById(sectionId);
        if (section) setActiveSection(sectionId);
        target.classList.add('api-entry-focused');
        window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }

    // ── Global Event Bindings ──
    document.addEventListener('DOMContentLoaded', () => {
        // Theme
        restoreTheme();
        const themeBtn = document.querySelector('.docs-header-theme');
        if (themeBtn) {
            themeBtn.addEventListener('click', toggleTheme);
        }

        // Sidebar categories
        restoreCategories();
        document.querySelectorAll('.docs-sidebar-cat-title').forEach(title => {
            title.addEventListener('click', () => toggleCategory(title));
        });

        // Add function-level descriptions and deep links before indexing search content.
        decorateApiEntries();

        // Search events
        buildSearchData();
        const searchInput = document.getElementById('docs-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', filterSearchResults);
            searchInput.addEventListener('keydown', handleSearchKeydown);
        }

        // Copy buttons injection
        addCopyButtons();

        // Intersection scrollspy initialization
        initDocsTracking();
        openApiEntryFromPath();

        // Smooth scroll for all side links / anchor tags
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                // If it's a search result or toc link, handled elsewhere
                if (this.closest('.docs-search-results') || this.closest('.docs-toc-nav')) return;

                e.preventDefault();
                const target = document.getElementById(href.substring(1));
                if (target) {
                    closeMobileSidebar();
                    
                    const offset = 88;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = target.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    });

    // Keyboard Shortcuts (Ctrl+K and Escape)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openSearch();
        }
        if (e.key === 'Escape') {
            closeSearch();
        }
    });

    // Make functions globally available for inline HTML events if necessary
    window.AdrenalineDocs = {
        toggleTheme,
        toggleCategory,
        toggleMobileSidebar,
        closeMobileSidebar,
        openSearch,
        closeSearch
    };
})();
