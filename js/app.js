/**
 * ============================================
 * Main Application Controller
 * ============================================
 * Coordinates all modules and handles user interactions
 * Manages state, theme, mode switching, and calculations
 * ============================================
 */

(function() {
    'use strict';

    // Application state
    const state = {
        mode: 'beginner', // 'beginner' or 'expert'
        theme: 'light', // 'light' or 'dark'
        lastCalculation: null
    };

    // DOM elements
    const elements = {
        // Inputs
        baseIP: document.getElementById('baseIP'),
        basePrefix: document.getElementById('basePrefix'),
        newPrefix: document.getElementById('newPrefix'),
        calculateBtn: document.getElementById('calculateBtn'),
        
        // Controls
        modeToggle: document.getElementById('modeToggle'),
        themeToggle: document.getElementById('themeToggle'),
        
        // Sections
        resultsSection: document.getElementById('resultsSection'),
        learningPanel: document.getElementById('learningPanel'),
        visualComponents: document.getElementById('visualComponents'),
        
        // Results
        resultsTableBody: document.getElementById('resultsTableBody'),
        totalSubnets: document.getElementById('totalSubnets'),
        hostsPerSubnet: document.getElementById('hostsPerSubnet'),
        subnetMask: document.getElementById('subnetMask'),
        networkClass: document.getElementById('networkClass'),
        
        // Standard Subnetting Outputs
        networkAddress: document.getElementById('networkAddress'),
        broadcastAddress: document.getElementById('broadcastAddress'),
        subnetMaskDecimal: document.getElementById('subnetMaskDecimal'),
        subnetMaskBinary: document.getElementById('subnetMaskBinary'),
        cidrNotation: document.getElementById('cidrNotation'),
        firstUsableHost: document.getElementById('firstUsableHost'),
        lastUsableHost: document.getElementById('lastUsableHost'),
        totalUsableHosts: document.getElementById('totalUsableHosts'),
        totalAddresses: document.getElementById('totalAddresses'),
        networkClassDisplay: document.getElementById('networkClassDisplay'),
        totalSubnetsOutput: document.getElementById('totalSubnetsOutput'),
        hostsPerSubnetOutput: document.getElementById('hostsPerSubnetOutput'),
        networkBits: document.getElementById('networkBits'),
        hostBits: document.getElementById('hostBits'),
        ipType: document.getElementById('ipType'),
        
        // Learning
        explanationContent: document.getElementById('explanationContent'),
        
        // Export
        exportCSV: document.getElementById('exportCSV'),
        exportPDF: document.getElementById('exportPDF')
    };

    /**
     * Initialize application
     */
    function init() {
        // Load saved preferences
        loadPreferences();
        
        // Set up event listeners
        setupEventListeners();
        
        // Apply initial theme
        applyTheme(state.theme);
        
        // Apply initial mode
        applyMode(state.mode);
        
        console.log('Subnet Tutor v2.0 initialized successfully');
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Calculate button
        elements.calculateBtn.addEventListener('click', handleCalculate);
        
        // Enter key on inputs
        [elements.baseIP, elements.basePrefix, elements.newPrefix].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleCalculate();
                }
            });
        });
        
        // Mode toggle
        elements.modeToggle.addEventListener('click', toggleMode);
        
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        // Export buttons
        elements.exportCSV.addEventListener('click', handleExportCSV);
        elements.exportPDF.addEventListener('click', handleExportPDF);
    }

    /**
     * Handle calculate button click
     */
    function handleCalculate() {
        try {
            // Get input values
            const baseIP = elements.baseIP.value.trim();
            const basePrefix = parseInt(elements.basePrefix.value, 10);
            const newPrefixValue = elements.newPrefix.value.trim();
            const newPrefix = newPrefixValue ? parseInt(newPrefixValue, 10) : null;

            // Validate inputs
            if (!SubnetEngine.isValidIP(baseIP)) {
                showError('Invalid IP address. Please enter a valid IPv4 address (e.g., 192.168.1.0)');
                return;
            }

            if (!SubnetEngine.isValidPrefix(basePrefix)) {
                showError('Invalid base prefix. Please enter a value between 8 and 30.');
                return;
            }

            if (newPrefix !== null && !SubnetEngine.isValidPrefix(newPrefix)) {
                showError('Invalid new prefix. Please enter a value between 8 and 30, or leave empty.');
                return;
            }

            if (newPrefix !== null && newPrefix <= basePrefix) {
                showError('New prefix must be larger than base prefix to split the network.');
                return;
            }

            // Perform calculation
            const summary = SubnetEngine.getCalculationSummary(baseIP, basePrefix, newPrefix);
            const binary = SubnetEngine.getBinaryBreakdown(baseIP, basePrefix);

            // Store calculation
            state.lastCalculation = { summary, binary };

            // Display results
            displayResults(summary);
            
            // Display learning content (if in beginner mode)
            if (state.mode === 'beginner') {
                displayLearningContent(summary, binary);
            }

            // Show results section
            elements.resultsSection.classList.remove('hidden');
            
            // Smooth scroll to results
            elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            showError(`Calculation error: ${error.message}`);
            console.error('Calculation error:', error);
        }
    }

    /**
     * Display calculation results
     * @param {Object} summary - Calculation summary
     */
    function displayResults(summary) {
        const firstSubnet = summary.subnets[0];
        
        // Populate Standard Subnetting Outputs
        // Network Information
        elements.networkAddress.textContent = firstSubnet.networkAddress;
        elements.broadcastAddress.textContent = firstSubnet.broadcastAddress;
        elements.subnetMaskDecimal.textContent = summary.subnetMask;
        elements.subnetMaskBinary.textContent = SubnetEngine.ipToBinary(summary.subnetMask);
        elements.cidrNotation.textContent = `${firstSubnet.networkAddress}/${summary.effectivePrefix}`;
        
        // Host Information
        elements.firstUsableHost.textContent = firstSubnet.firstUsable;
        elements.lastUsableHost.textContent = firstSubnet.lastUsable;
        elements.totalUsableHosts.textContent = summary.hostsPerSubnet.toLocaleString();
        elements.totalAddresses.textContent = summary.totalAddresses.toLocaleString();
        elements.networkClassDisplay.textContent = summary.networkClass;
        
        // Subnet Information
        elements.totalSubnetsOutput.textContent = summary.totalSubnets;
        elements.hostsPerSubnetOutput.textContent = summary.hostsPerSubnet.toLocaleString();
        elements.networkBits.textContent = summary.effectivePrefix + ' bits';
        elements.hostBits.textContent = (32 - summary.effectivePrefix) + ' bits';
        elements.ipType.textContent = summary.isPrivate ? 'Private IP' : 'Public IP';
        
        // Update summary cards (keep for visual balance)
        elements.totalSubnets.textContent = summary.totalSubnets;
        elements.hostsPerSubnet.textContent = summary.hostsPerSubnet;
        elements.subnetMask.textContent = `${summary.subnetMask} /${summary.effectivePrefix}`;
        elements.networkClass.textContent = summary.networkClass;

        // Build table rows
        let tableHTML = '';
        summary.subnets.forEach(subnet => {
            tableHTML += `
                <tr>
                    <td>${subnet.subnetNumber}</td>
                    <td>${subnet.networkAddress}</td>
                    <td>${subnet.broadcastAddress}</td>
                    <td>${subnet.firstUsable} → ${subnet.lastUsable}</td>
                    <td>${subnet.usableHosts}</td>
                    <td>${subnet.subnetMask} /${subnet.prefix}</td>
                </tr>
            `;
        });

        elements.resultsTableBody.innerHTML = tableHTML;

        // Add fade-in animation
        elements.resultsSection.classList.add('fade-in');
    }

    /**
     * Display learning content (beginner mode)
     * @param {Object} summary - Calculation summary
     * @param {Object} binary - Binary breakdown
     */
    function displayLearningContent(summary, binary) {
        // Generate and display explanations
        const explanationHTML = Explanations.generateFullExplanation(summary, binary);
        elements.explanationContent.innerHTML = explanationHTML;
        
        // Show learning panels
        elements.learningPanel.classList.remove('hidden');
        elements.visualComponents.classList.remove('hidden');

        // Render visualizations
        Visualizer.renderBinaryVisualization(binary, 'binaryVisualization');
        Visualizer.renderSubnetTree(
            summary.subnets,
            summary.basePrefix,
            summary.newPrefix,
            'subnetTree'
        );

        // Add animations
        elements.learningPanel.classList.add('fade-in');
        elements.visualComponents.classList.add('fade-in');
    }

    /**
     * Toggle between beginner and expert mode
     */
    function toggleMode() {
        state.mode = state.mode === 'beginner' ? 'expert' : 'beginner';
        applyMode(state.mode);
        savePreferences();
    }

    /**
     * Apply mode settings
     * @param {string} mode - 'beginner' or 'expert'
     */
    function applyMode(mode) {
        if (mode === 'beginner') {
            elements.modeToggle.innerHTML = `
                <svg class="icon"><use href="#icon-beginner"></use></svg>
                <span>Beginner Mode</span>
            `;
            
            // Show learning content if calculation exists
            if (state.lastCalculation) {
                elements.learningPanel.classList.remove('hidden');
                elements.visualComponents.classList.remove('hidden');
                
                // Regenerate learning content
                const { summary, binary } = state.lastCalculation;
                displayLearningContent(summary, binary);
            }
        } else {
            elements.modeToggle.innerHTML = `
                <svg class="icon"><use href="#icon-expert"></use></svg>
                <span>Expert Mode</span>
            `;
            
            // Hide learning content
            elements.learningPanel.classList.add('hidden');
            elements.visualComponents.classList.add('hidden');
        }
    }

    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        applyTheme(state.theme);
        savePreferences();
    }

    /**
     * Apply theme
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            elements.themeToggle.innerHTML = '<svg class="icon"><use href="#icon-sun"></use></svg>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            elements.themeToggle.innerHTML = '<svg class="icon"><use href="#icon-moon"></use></svg>';
        }
    }

    /**
     * Handle CSV export
     */
    function handleExportCSV() {
        if (!state.lastCalculation) {
            showError('No calculation results to export. Please calculate first.');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `subnet-results-${timestamp}.csv`;
        
        Exporter.exportToCSV(state.lastCalculation.summary, filename);
        showSuccess('Results exported to CSV successfully!');
    }

    /**
     * Handle PDF export
     */
    function handleExportPDF() {
        if (!state.lastCalculation) {
            showError('No calculation results to export. Please calculate first.');
            return;
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `subnet-results-${timestamp}.pdf`;
        
        Exporter.exportToPDF(state.lastCalculation.summary, filename);
        showSuccess('Results exported to PDF successfully!');
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    function showError(message) {
        alert(`❌ Error: ${message}`);
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = `✅ ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Save user preferences to localStorage
     */
    function savePreferences() {
        try {
            localStorage.setItem('subnetTutorPreferences', JSON.stringify({
                mode: state.mode,
                theme: state.theme
            }));
        } catch (e) {
            console.warn('Failed to save preferences:', e);
        }
    }

    /**
     * Load user preferences from localStorage
     */
    function loadPreferences() {
        try {
            const saved = localStorage.getItem('subnetTutorPreferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                state.mode = preferences.mode || 'beginner';
                state.theme = preferences.theme || 'light';
            }
        } catch (e) {
            console.warn('Failed to load preferences:', e);
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Calculate
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            handleCalculate();
        }
        
        // Ctrl/Cmd + M: Toggle mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            toggleMode();
        }
        
        // Ctrl/Cmd + T: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
    });

    /**
     * Add CSS animation for notifications
     */
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export state for debugging (optional)
    window.SubnetTutorApp = {
        getState: () => ({ ...state }),
        calculate: handleCalculate,
        toggleMode,
        toggleTheme
    };

})();
