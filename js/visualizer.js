/**
 * ============================================
 * Visualizer Module
 * ============================================
 * Creates visual representations of subnetting:
 * - Binary visualization with color coding
 * - Subnet tree structure
 * - Address space timeline map
 * All using pure SVG (no external libraries)
 * ============================================
 */

const Visualizer = (function() {
    'use strict';

    /**
     * Generates binary visualization for IP, mask, and network
     * @param {Object} binary - Binary breakdown from SubnetEngine
     * @param {string} containerId - Container element ID
     */
    function renderBinaryVisualization(binary, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';

        // IP Address Binary
        html += createBinaryRow('IP Address', binary.ip.decimal, binary.ip.binary, binary.networkBits);
        
        // Subnet Mask Binary
        html += createBinaryRow('Subnet Mask', binary.mask.decimal, binary.mask.binary, binary.networkBits);
        
        // Network Address Binary
        html += createBinaryRow('Network Address', binary.network.decimal, binary.network.binary, binary.networkBits);

        container.innerHTML = html;
    }

    /**
     * Creates a single binary row with color-coded bits
     * @param {string} label - Row label
     * @param {string} decimal - Decimal representation
     * @param {Array} binaryOctets - Array of 4 binary strings
     * @param {number} networkBits - Number of network bits
     * @returns {string} - HTML string
     */
    function createBinaryRow(label, decimal, binaryOctets, networkBits) {
        let html = '<div class="binary-row">';
        html += `<div class="binary-label">${label}: ${decimal}</div>`;
        html += '<div class="binary-octets">';

        let bitPosition = 0;
        
        binaryOctets.forEach((octet, octetIndex) => {
            html += '<div class="binary-octet">';
            
            for (let i = 0; i < 8; i++) {
                const bit = octet[i];
                const isNetworkBit = bitPosition < networkBits;
                const className = isNetworkBit ? 'network' : 'host';
                
                // Calculate decimal value of this bit position (128, 64, 32, 16, 8, 4, 2, 1)
                const bitPositionInOctet = i;
                const decimalValue = Math.pow(2, 7 - bitPositionInOctet);
                const contribution = bit === '1' ? decimalValue : 0;
                
                // Create detailed tooltip
                const tooltip = `Position ${bitPosition + 1} (Bit ${bitPositionInOctet})\n` +
                              `Value: ${bit}\n` +
                              `Decimal: ${decimalValue}\n` +
                              `Contributes: ${contribution}\n` +
                              `Type: ${isNetworkBit ? 'Network' : 'Host'} bit`;
                
                html += `<div class="binary-bit ${className}" title="${tooltip}" data-value="${decimalValue}" data-contributes="${contribution}">${bit}</div>`;
                bitPosition++;
            }
            
            html += '</div>';
        });

        html += '</div></div>';
        return html;
    }

    /**
     * Generates subnet tree visualization
     * @param {Array} subnets - Array of subnet objects
     * @param {number} basePrefix - Base prefix length
     * @param {number} newPrefix - New prefix length
     * @param {string} containerId - Container element ID
     */
    function renderSubnetTree(subnets, basePrefix, newPrefix, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // If no splitting, show simple single node
        if (!newPrefix || newPrefix === basePrefix || subnets.length === 1) {
            container.innerHTML = `
                <svg width="400" height="200" viewBox="0 0 400 200">
                    <defs>
                        <linearGradient id="singleNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:var(--color-secondary);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect x="100" y="70" width="200" height="70" rx="12" class="tree-node-single" fill="url(#singleNodeGrad)" />
                    <text x="200" y="95" text-anchor="middle" class="tree-text-main" style="fill: white; font-size: 14px; font-weight: 700;">${subnets[0].networkAddress}</text>
                    <text x="200" y="115" text-anchor="middle" class="tree-text-main" style="fill: white; font-size: 13px;">/${basePrefix}</text>
                    <text x="200" y="132" text-anchor="middle" class="tree-text-main" style="fill: rgba(255,255,255,0.8); font-size: 10px;">${subnets[0].usableHosts} hosts</text>
                </svg>
            `;
            return;
        }

        // Calculate tree dimensions with improved spacing
        const nodeWidth = 160;
        const nodeHeight = 70;
        const levelHeight = 140;
        const horizontalSpacing = 30;
        const minHorizontalSpacing = 15;

        // Better grid calculation
        const cols = Math.min(8, Math.ceil(Math.sqrt(subnets.length * 1.5)));
        const rows = Math.ceil(subnets.length / cols);
        
        const totalWidth = Math.max(cols * (nodeWidth + horizontalSpacing), 1000);
        const svgHeight = levelHeight + rows * (nodeHeight + 80) + 50;
        const svgWidth = totalWidth + 100;

        let svg = `<svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
        
        // Add gradient definitions
        svg += `
            <defs>
                <linearGradient id="rootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="childGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3"/>
                </filter>
            </defs>
        `;

        // Draw root node (base network)
        const rootX = svgWidth / 2;
        const rootY = 40;
        svg += drawTreeNode(subnets[0].networkAddress.split('.').slice(0, 3).join('.') + '.0', basePrefix, rootX, rootY, nodeWidth + 20, nodeHeight, null, true);

        // Draw child nodes (subnets) with better layout
        const startY = rootY + levelHeight;
        const gridWidth = cols * (nodeWidth + horizontalSpacing);
        const startX = (svgWidth - gridWidth) / 2 + nodeWidth / 2;

        subnets.forEach((subnet, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (nodeWidth + horizontalSpacing);
            const y = startY + row * (nodeHeight + 80);

            // Draw curved line from root to child
            const midY = (rootY + nodeHeight + y) / 2;
            svg += `<path d="M ${rootX} ${rootY + nodeHeight} Q ${rootX} ${midY}, ${x} ${y}" class="tree-link" />`;

            // Draw child node
            svg += drawTreeNode(subnet.networkAddress, newPrefix, x, y, nodeWidth, nodeHeight, index + 1, false);
        });

        svg += '</svg>';
        container.innerHTML = svg;
    }

    /**
     * Draws a single tree node
     * @param {string} address - IP address
     * @param {number} prefix - Prefix length
     * @param {number} x - X coordinate (center)
     * @param {number} y - Y coordinate (top)
     * @param {number} width - Node width
     * @param {number} height - Node height
     * @param {number} number - Subnet number (optional)
     * @param {boolean} isRoot - Is this the root node
     * @returns {string} - SVG string
     */
    function drawTreeNode(address, prefix, x, y, width, height, number = null, isRoot = false) {
        const rectX = x - width / 2;
        const fillColor = isRoot ? 'url(#rootGrad)' : 'url(#childGrad)';
        const strokeColor = isRoot ? '#8b5cf6' : '#3b82f6';
        
        let svg = `<rect x="${rectX}" y="${y}" width="${width}" height="${height}" rx="12" 
                   class="tree-node" fill="${fillColor}" stroke="${strokeColor}" 
                   stroke-width="3" filter="url(#shadow)" />`;
        
        if (number) {
            // Child node with number
            svg += `<rect x="${rectX + 5}" y="${y + 5}" width="30" height="20" rx="4" fill="rgba(255,255,255,0.2)" />`;
            svg += `<text x="${rectX + 20}" y="${y + 18}" text-anchor="middle" class="tree-text" style="font-size: 11px; fill: white; font-weight: 700;">#${number}</text>`;
            svg += `<text x="${x}" y="${y + 38}" text-anchor="middle" class="tree-text" style="font-size: 13px; fill: white; font-weight: 700;">${address}</text>`;
            svg += `<text x="${x}" y="${y + 55}" text-anchor="middle" class="tree-text" style="font-size: 12px; fill: rgba(255,255,255,0.9);">/${prefix}</text>`;
        } else {
            // Root node
            svg += `<text x="${x}" y="${y + 20}" text-anchor="middle" class="tree-text" style="font-size: 11px; fill: rgba(255,255,255,0.8); font-weight: 600;">BASE NETWORK</text>`;
            svg += `<text x="${x}" y="${y + 38}" text-anchor="middle" class="tree-text" style="font-size: 14px; fill: white; font-weight: 700;">${address}</text>`;
            svg += `<text x="${x}" y="${y + 55}" text-anchor="middle" class="tree-text" style="font-size: 13px; fill: rgba(255,255,255,0.9);">/${prefix}</text>`;
        }
        
        return svg;
    }

    /**
     * Generates address space map visualization
     * @param {Array} subnets - Array of subnet objects
     * @param {string} containerId - Container element ID
     */
    function renderAddressSpaceMap(subnets, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (subnets.length === 0) {
            container.innerHTML = '<p>No subnets to display</p>';
            return;
        }

        const svgHeight = Math.max(200, subnets.length * 60 + 40);
        const svgWidth = 800;
        const barHeight = 40;
        const barSpacing = 20;
        const leftMargin = 50;
        const rightMargin = 50;
        const availableWidth = svgWidth - leftMargin - rightMargin;

        // Calculate max address for scaling
        const lastSubnet = subnets[subnets.length - 1];
        const maxAddress = SubnetEngine.ipToInt(lastSubnet.broadcastAddress);
        const minAddress = SubnetEngine.ipToInt(subnets[0].networkAddress);
        const range = maxAddress - minAddress + 1;

        let svg = `<svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;

        subnets.forEach((subnet, index) => {
            const y = 20 + index * (barHeight + barSpacing);
            
            // Calculate positions
            const networkInt = SubnetEngine.ipToInt(subnet.networkAddress);
            const broadcastInt = SubnetEngine.ipToInt(subnet.broadcastAddress);
            const firstUsableInt = SubnetEngine.ipToInt(subnet.firstUsable);
            const lastUsableInt = SubnetEngine.ipToInt(subnet.lastUsable);

            // Calculate widths proportionally
            const totalWidth = availableWidth * (subnet.totalAddresses / range);
            const networkWidth = 3; // Fixed small width for network
            const broadcastWidth = 3; // Fixed small width for broadcast
            const usableWidth = totalWidth - networkWidth - broadcastWidth;

            const startX = leftMargin;

            // Draw network address (blue)
            svg += `<rect x="${startX}" y="${y}" width="${networkWidth}" height="${barHeight}" 
                    fill="var(--color-network)" rx="2" />`;

            // Draw usable range (green)
            svg += `<rect x="${startX + networkWidth}" y="${y}" width="${usableWidth}" height="${barHeight}" 
                    fill="var(--color-usable)" rx="2" />`;

            // Draw broadcast address (red)
            svg += `<rect x="${startX + networkWidth + usableWidth}" y="${y}" width="${broadcastWidth}" height="${barHeight}" 
                    fill="var(--color-broadcast)" rx="2" />`;

            // Add border
            svg += `<rect x="${startX}" y="${y}" width="${totalWidth}" height="${barHeight}" 
                    fill="none" stroke="var(--border-color)" stroke-width="2" rx="2" />`;

            // Add labels
            svg += `<text x="${startX + totalWidth + 10}" y="${y + barHeight / 2}" 
                    alignment-baseline="middle" class="tree-text" style="font-size: 12px;">
                    Subnet ${index + 1}: ${subnet.networkAddress}/${subnet.prefix}
                    </text>`;

            // Add hover tooltip (simplified)
            svg += `<title>Subnet ${index + 1}
Network: ${subnet.networkAddress}
Usable: ${subnet.firstUsable} - ${subnet.lastUsable}
Broadcast: ${subnet.broadcastAddress}
Hosts: ${subnet.usableHosts}</title>`;
        });

        svg += '</svg>';
        container.innerHTML = svg;
    }

    /**
     * Generates a color-coded IP address display
     * @param {string} ip - IP address
     * @param {string} type - Type: 'network', 'broadcast', 'usable'
     * @returns {string} - HTML string with color coding
     */
    function colorCodeIP(ip, type) {
        const colors = {
            network: 'var(--color-network)',
            broadcast: 'var(--color-broadcast)',
            usable: 'var(--color-usable)'
        };
        
        return `<span style="color: ${colors[type] || 'inherit'}; font-weight: 600;">${ip}</span>`;
    }

    /**
     * Creates a visual comparison of two subnets
     * @param {Object} subnet1 - First subnet
     * @param {Object} subnet2 - Second subnet
     * @returns {string} - HTML comparison
     */
    function compareSubnets(subnet1, subnet2) {
        return `
            <div class="subnet-comparison">
                <div class="comparison-column">
                    <h4>Subnet ${subnet1.subnetNumber}</h4>
                    <p>Network: ${colorCodeIP(subnet1.networkAddress, 'network')}</p>
                    <p>Broadcast: ${colorCodeIP(subnet1.broadcastAddress, 'broadcast')}</p>
                    <p>Hosts: ${subnet1.usableHosts}</p>
                </div>
                <div class="comparison-column">
                    <h4>Subnet ${subnet2.subnetNumber}</h4>
                    <p>Network: ${colorCodeIP(subnet2.networkAddress, 'network')}</p>
                    <p>Broadcast: ${colorCodeIP(subnet2.broadcastAddress, 'broadcast')}</p>
                    <p>Hosts: ${subnet2.usableHosts}</p>
                </div>
            </div>
        `;
    }

    /**
     * Clears all visualizations
     */
    function clearVisualizations() {
        const containers = ['binaryVisualization', 'subnetTree', 'addressMap'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });
    }

    // Public API
    return {
        renderBinaryVisualization,
        renderSubnetTree,
        renderAddressSpaceMap,
        colorCodeIP,
        compareSubnets,
        clearVisualizations
    };
})();

// Make available globally
window.Visualizer = Visualizer;
