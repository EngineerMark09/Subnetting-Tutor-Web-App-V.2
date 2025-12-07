/**
 * ============================================
 * Explanations Module
 * ============================================
 * Generates human-friendly, educational explanations
 * for subnet calculations and concepts.
 * ============================================
 */

const Explanations = (function() {
    'use strict';

    /**
     * Generates step-by-step explanation for subnet calculation
     * @param {Object} summary - Calculation summary from SubnetEngine
     * @returns {Array} - Array of explanation step objects
     */
    function generateExplanation(summary) {
        const steps = [];
        const { basePrefix, newPrefix, effectivePrefix, subnetMask, totalSubnets, hostsPerSubnet } = summary;

        // Step 1: Understanding the Network
        steps.push({
            title: '🌐 Understanding the Network',
            content: `
                <p>You started with the network <code>${summary.baseNetwork}/${basePrefix}</code>.</p>
                <p>This is a <strong>Class ${summary.networkClass}</strong> network, which is ${summary.isPrivate ? 'a <strong>private</strong> address range' : 'a <strong>public</strong> address'}.</p>
                ${newPrefix ? `<p>You're splitting this network into smaller subnets using a /${newPrefix} prefix.</p>` : '<p>You\'re analyzing this single network without subdivision.</p>'}
            `,
            icon: '🌐'
        });

        // Step 2: Prefix Length and Subnet Mask
        steps.push({
            title: '🔢 Prefix Length and Subnet Mask',
            content: `
                <p>The prefix <code>/${effectivePrefix}</code> means the first <strong>${effectivePrefix} bits</strong> identify the network.</p>
                <p>The remaining <strong>${32 - effectivePrefix} bits</strong> are available for host addresses.</p>
                <div class="formula-box">
                    Subnet Mask: ${subnetMask}<br>
                    In CIDR: /${effectivePrefix}
                </div>
                <p><strong>How it works:</strong> The subnet mask has ${effectivePrefix} consecutive 1-bits followed by ${32 - effectivePrefix} 0-bits.</p>
                <p>In binary: <code>${SubnetEngine.ipToBinary(subnetMask)}</code></p>
            `,
            icon: '🔢'
        });

        // Step 3: Calculating Number of Subnets
        if (newPrefix && newPrefix > basePrefix) {
            const borrowedBits = newPrefix - basePrefix;
            steps.push({
                title: '📊 Calculating Number of Subnets',
                content: `
                    <p><strong>Question:</strong> How many subnets can we create?</p>
                    <p>To split the <code>/${basePrefix}</code> network into <code>/${newPrefix}</code> subnets, we borrow <strong>${borrowedBits} bit${borrowedBits > 1 ? 's' : ''}</strong> from the host portion.</p>
                    
                    <div class="formula-box">
                        <strong>Formula:</strong> Number of Subnets = 2<sup>borrowed bits</sup><br><br>
                        Borrowed Bits = New Prefix - Base Prefix<br>
                        Borrowed Bits = ${newPrefix} - ${basePrefix} = <strong>${borrowedBits} bit${borrowedBits > 1 ? 's' : ''}</strong><br><br>
                        Number of Subnets = 2<sup>${borrowedBits}</sup> = <strong>${totalSubnets}</strong>
                    </div>
                    
                    <p><strong>Step-by-Step Calculation:</strong></p>
                    <ol>
                        <li>Original prefix: /${basePrefix} (your base network)</li>
                        <li>New prefix: /${newPrefix} (target subnet size)</li>
                        <li>Subtract: ${newPrefix} - ${basePrefix} = ${borrowedBits} bits borrowed</li>
                        <li>Calculate: 2<sup>${borrowedBits}</sup> = ${Array.from({length: borrowedBits}, (_, i) => 2).join(' × ')} = ${totalSubnets} subnets</li>
                    </ol>
                    
                    <p><strong>Why does this work?</strong> Each additional bit we use for the network portion doubles the number of possible subnets. With ${borrowedBits} borrowed bit${borrowedBits > 1 ? 's' : ''}, we can create ${totalSubnets} unique subnet${totalSubnets > 1 ? 's' : ''}.</p>
                    
                    <div class="example-box">
                        <strong>💡 Real Example:</strong><br>
                        If you have /${basePrefix} and split to /${newPrefix}:<br>
                        • Borrowed ${borrowedBits} bit${borrowedBits > 1 ? 's' : ''}<br>
                        • 2<sup>${borrowedBits}</sup> = ${totalSubnets} possible subnets<br>
                        • Each subnet has /${newPrefix} prefix
                    </div>
                `,
                icon: '📊'
            });
        } else {
            steps.push({
                title: '📊 Single Network Analysis',
                content: `
                    <p>You're analyzing a single network without subdividing it.</p>
                    <div class="formula-box">
                        Total Subnets = 1<br>
                        (No subdivision performed)
                    </div>
                    <p><strong>Note:</strong> To create multiple subnets, enter a "New Prefix" value that is larger than your base prefix (/${basePrefix}).</p>
                `,
                icon: '📊'
            });
        }

        // Step 4: Calculating Usable Hosts
        steps.push({
            title: '👥 Calculating Usable Hosts',
            content: `
                <p>With <strong>${32 - effectivePrefix} host bits</strong>, we can calculate the number of usable host addresses.</p>
                <div class="formula-box">
                    Usable Hosts = 2<sup>${32 - effectivePrefix}</sup> - 2 = ${hostsPerSubnet}
                </div>
                <p><strong>Why subtract 2?</strong> Every subnet has two special addresses:</p>
                <ul>
                    <li><strong>Network Address:</strong> The first address (all host bits = 0) identifies the subnet itself</li>
                    <li><strong>Broadcast Address:</strong> The last address (all host bits = 1) is used for broadcasting to all hosts</li>
                </ul>
                <p>These two addresses cannot be assigned to individual hosts, so we subtract them from the total.</p>
            `,
            icon: '👥'
        });

        // Step 5: Network Address Calculation
        steps.push({
            title: '🎯 Finding the Network Address',
            content: `
                <p>The <strong>Network Address</strong> is found by performing a bitwise AND operation between the IP address and subnet mask.</p>
                <p><strong>Process:</strong></p>
                <ol>
                    <li>Convert both IP address and subnet mask to binary</li>
                    <li>Perform AND operation (1 AND 1 = 1, otherwise 0)</li>
                    <li>Convert result back to decimal</li>
                </ol>
                <p>This sets all host bits to 0, giving us the network's base address.</p>
                <p><strong>Example:</strong> For ${summary.subnets[0].networkAddress}/${effectivePrefix}, the network address is <code>${summary.subnets[0].networkAddress}</code></p>
            `,
            icon: '🎯'
        });

        // Step 6: Broadcast Address Calculation
        steps.push({
            title: '📢 Finding the Broadcast Address',
            content: `
                <p>The <strong>Broadcast Address</strong> is the last address in the subnet, used to send data to all hosts simultaneously.</p>
                <p><strong>Process:</strong></p>
                <ol>
                    <li>Start with the network address</li>
                    <li>Set all host bits to 1</li>
                    <li>This gives the highest address in the subnet</li>
                </ol>
                <p><strong>Example:</strong> For the subnet ${summary.subnets[0].networkAddress}/${effectivePrefix}, the broadcast address is <code>${summary.subnets[0].broadcastAddress}</code></p>
            `,
            icon: '📢'
        });

        // Step 7: Usable Host Range
        steps.push({
            title: '🔄 Determining Usable Host Range',
            content: `
                <p>The <strong>Usable Host Range</strong> includes all addresses between the network and broadcast addresses.</p>
                <p><strong>Calculation:</strong></p>
                <ul>
                    <li><strong>First Usable:</strong> Network Address + 1</li>
                    <li><strong>Last Usable:</strong> Broadcast Address - 1</li>
                </ul>
                <p><strong>Example for first subnet:</strong></p>
                <div class="formula-box">
                    First Usable: ${summary.subnets[0].firstUsable}<br>
                    Last Usable: ${summary.subnets[0].lastUsable}
                </div>
                <p>These are the addresses you can assign to devices like computers, printers, and servers.</p>
            `,
            icon: '🔄'
        });

        // Step 8: Practical Application
        steps.push({
            title: '🛠️ Practical Application',
            content: `
                <p><strong>Summary of your subnet configuration:</strong></p>
                <ul>
                    <li>You have <strong>${totalSubnets}</strong> subnet${totalSubnets > 1 ? 's' : ''} available</li>
                    <li>Each subnet can support <strong>${hostsPerSubnet}</strong> usable host${hostsPerSubnet !== 1 ? 's' : ''}</li>
                    <li>Total capacity: <strong>${totalSubnets * hostsPerSubnet}</strong> devices across all subnets</li>
                </ul>
                <p><strong>Best Practices:</strong></p>
                <ul>
                    <li>Assign the first usable address to your gateway/router</li>
                    <li>Document which devices use which addresses</li>
                    <li>Reserve ranges for static and DHCP allocations</li>
                    <li>Plan for future growth when choosing subnet sizes</li>
                </ul>
            `,
            icon: '🛠️'
        });

        return steps;
    }

    /**
     * Generates explanation for binary conversion
     * @param {Object} binary - Binary breakdown from SubnetEngine
     * @returns {string} - HTML explanation
     */
    function generateBinaryExplanation(binary) {
        return `
            <div class="explanation-step">
                <h3>🔢 Understanding Binary Notation</h3>
                <p>Every IP address is actually a 32-bit number. We usually write it in decimal for convenience, but computers work with binary (1s and 0s).</p>
                
                <p><strong>Your IP Address:</strong></p>
                <ul>
                    <li>Decimal: <code>${binary.ip.decimal}</code></li>
                    <li>Binary: <code>${binary.ip.fullBinary}</code></li>
                </ul>

                <p><strong>The Subnet Mask:</strong></p>
                <ul>
                    <li>Decimal: <code>${binary.mask.decimal}</code></li>
                    <li>Binary: <code>${binary.mask.fullBinary}</code></li>
                </ul>

                <p>The mask has <strong>${binary.networkBits} network bits</strong> (shown in blue) and <strong>${binary.hostBits} host bits</strong> (shown in orange).</p>
                
                <p><strong>Network Address:</strong> Created by setting all host bits to 0:</p>
                <ul>
                    <li>Decimal: <code>${binary.network.decimal}</code></li>
                    <li>Binary: <code>${binary.network.fullBinary}</code></li>
                </ul>
            </div>
        `;
    }

    /**
     * Generates quick reference guide
     * @returns {string} - HTML quick reference
     */
    function generateQuickReference() {
        return `
            <div class="explanation-step">
                <h3>📚 Quick Reference Guide</h3>
                
                <p><strong>Common Subnet Masks:</strong></p>
                <div class="formula-box">
                    /24 = 255.255.255.0 → 254 hosts<br>
                    /25 = 255.255.255.128 → 126 hosts<br>
                    /26 = 255.255.255.192 → 62 hosts<br>
                    /27 = 255.255.255.224 → 30 hosts<br>
                    /28 = 255.255.255.240 → 14 hosts<br>
                    /29 = 255.255.255.248 → 6 hosts<br>
                    /30 = 255.255.255.252 → 2 hosts
                </div>

                <p><strong>Private IP Ranges:</strong></p>
                <ul>
                    <li>Class A: <code>10.0.0.0/8</code> (10.0.0.0 - 10.255.255.255)</li>
                    <li>Class B: <code>172.16.0.0/12</code> (172.16.0.0 - 172.31.255.255)</li>
                    <li>Class C: <code>192.168.0.0/16</code> (192.168.0.0 - 192.168.255.255)</li>
                </ul>

                <p><strong>Key Formulas:</strong></p>
                <ul>
                    <li>Number of Subnets = 2<sup>borrowed bits</sup></li>
                    <li>Hosts per Subnet = 2<sup>host bits</sup> - 2</li>
                    <li>Network Address = IP AND Subnet Mask</li>
                    <li>Broadcast Address = Network OR (NOT Subnet Mask)</li>
                </ul>
            </div>
        `;
    }

    /**
     * Renders explanation steps to HTML
     * @param {Array} steps - Array of explanation steps
     * @returns {string} - HTML string
     */
    function renderSteps(steps) {
        return steps.map(step => `
            <div class="explanation-step">
                <h3>${step.icon} ${step.title}</h3>
                ${step.content}
            </div>
        `).join('');
    }

    /**
     * Main function to generate and render all explanations
     * @param {Object} summary - Calculation summary
     * @param {Object} binary - Binary breakdown
     * @returns {string} - Complete HTML explanation
     */
    function generateFullExplanation(summary, binary) {
        const steps = generateExplanation(summary);
        const stepsHTML = renderSteps(steps);
        const quickRef = generateQuickReference();
        
        return stepsHTML + quickRef;
    }

    // Public API
    return {
        generateExplanation,
        generateBinaryExplanation,
        generateQuickReference,
        renderSteps,
        generateFullExplanation
    };
})();

// Make available globally
window.Explanations = Explanations;
