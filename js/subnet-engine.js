/**
 * ============================================
 * Subnet Engine - Core Calculation Logic
 * ============================================
 * This module handles all subnet calculations including:
 * - IP address manipulation and validation
 * - Subnet mask generation
 * - Network and broadcast address calculation
 * - Usable host range determination
 * - Binary conversions
 * ============================================
 */

const SubnetEngine = (function() {
    'use strict';

    /**
     * Validates an IPv4 address
     * @param {string} ip - IP address to validate
     * @returns {boolean} - True if valid
     */
    function isValidIP(ip) {
        const octets = ip.split('.');
        if (octets.length !== 4) return false;
        
        return octets.every(octet => {
            const num = parseInt(octet, 10);
            return num >= 0 && num <= 255 && octet === num.toString();
        });
    }

    /**
     * Validates a CIDR prefix
     * @param {number} prefix - Prefix length to validate
     * @returns {boolean} - True if valid
     */
    function isValidPrefix(prefix) {
        return prefix >= 0 && prefix <= 32 && Number.isInteger(prefix);
    }

    /**
     * Converts IP address to 32-bit integer
     * @param {string} ip - IP address
     * @returns {number} - 32-bit integer representation
     */
    function ipToInt(ip) {
        return ip.split('.')
            .reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0) >>> 0;
    }

    /**
     * Converts 32-bit integer to IP address
     * @param {number} int - 32-bit integer
     * @returns {string} - IP address
     */
    function intToIP(int) {
        return [
            (int >>> 24) & 255,
            (int >>> 16) & 255,
            (int >>> 8) & 255,
            int & 255
        ].join('.');
    }

    /**
     * Converts number to 8-bit binary string
     * @param {number} num - Number to convert
     * @returns {string} - 8-bit binary string
     */
    function toBinary8(num) {
        return num.toString(2).padStart(8, '0');
    }

    /**
     * Converts IP address to binary string with dots
     * @param {string} ip - IP address
     * @returns {string} - Binary representation
     */
    function ipToBinary(ip) {
        return ip.split('.')
            .map(octet => toBinary8(parseInt(octet, 10)))
            .join('.');
    }

    /**
     * Generates subnet mask from prefix length
     * @param {number} prefix - Prefix length (0-32)
     * @returns {string} - Subnet mask in dotted decimal
     */
    function prefixToMask(prefix) {
        const mask = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        return intToIP(mask);
    }

    /**
     * Calculates network address
     * @param {string} ip - IP address
     * @param {number} prefix - Prefix length
     * @returns {string} - Network address
     */
    function getNetworkAddress(ip, prefix) {
        const ipInt = ipToInt(ip);
        const maskInt = (0xFFFFFFFF << (32 - prefix)) >>> 0;
        const networkInt = (ipInt & maskInt) >>> 0;
        return intToIP(networkInt);
    }

    /**
     * Calculates broadcast address
     * @param {string} ip - IP address
     * @param {number} prefix - Prefix length
     * @returns {string} - Broadcast address
     */
    function getBroadcastAddress(ip, prefix) {
        const networkInt = ipToInt(getNetworkAddress(ip, prefix));
        const hostMask = (0xFFFFFFFF >>> prefix) >>> 0;
        const broadcastInt = (networkInt | hostMask) >>> 0;
        return intToIP(broadcastInt);
    }

    /**
     * Calculates first usable host address
     * @param {string} networkAddr - Network address
     * @returns {string} - First usable host
     */
    function getFirstUsable(networkAddr) {
        const networkInt = ipToInt(networkAddr);
        return intToIP((networkInt + 1) >>> 0);
    }

    /**
     * Calculates last usable host address
     * @param {string} broadcastAddr - Broadcast address
     * @returns {string} - Last usable host
     */
    function getLastUsable(broadcastAddr) {
        const broadcastInt = ipToInt(broadcastAddr);
        return intToIP((broadcastInt - 1) >>> 0);
    }

    /**
     * Calculates number of usable hosts
     * @param {number} prefix - Prefix length
     * @returns {number} - Number of usable hosts
     */
    function getUsableHosts(prefix) {
        if (prefix >= 31) return 0; // /31 and /32 have no usable hosts in standard subnetting
        return Math.pow(2, 32 - prefix) - 2;
    }

    /**
     * Calculates total number of addresses in subnet
     * @param {number} prefix - Prefix length
     * @returns {number} - Total addresses
     */
    function getTotalAddresses(prefix) {
        return Math.pow(2, 32 - prefix);
    }

    /**
     * Determines network class from IP
     * @param {string} ip - IP address
     * @returns {string} - Network class (A, B, C, D, E)
     */
    function getNetworkClass(ip) {
        const firstOctet = parseInt(ip.split('.')[0], 10);
        
        if (firstOctet >= 1 && firstOctet <= 126) return 'A';
        if (firstOctet >= 128 && firstOctet <= 191) return 'B';
        if (firstOctet >= 192 && firstOctet <= 223) return 'C';
        if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
        if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';
        
        return 'Unknown';
    }

    /**
     * Determines if IP is private
     * @param {string} ip - IP address
     * @returns {boolean} - True if private
     */
    function isPrivateIP(ip) {
        const ipInt = ipToInt(ip);
        
        // 10.0.0.0/8
        if (ipInt >= ipToInt('10.0.0.0') && ipInt <= ipToInt('10.255.255.255')) return true;
        
        // 172.16.0.0/12
        if (ipInt >= ipToInt('172.16.0.0') && ipInt <= ipToInt('172.31.255.255')) return true;
        
        // 192.168.0.0/16
        if (ipInt >= ipToInt('192.168.0.0') && ipInt <= ipToInt('192.168.255.255')) return true;
        
        return false;
    }

    /**
     * Calculates all subnets when splitting a network
     * @param {string} baseIP - Base network IP
     * @param {number} basePrefix - Base prefix length
     * @param {number} newPrefix - New prefix length (for splitting)
     * @returns {Array} - Array of subnet objects
     */
    function calculateSubnets(baseIP, basePrefix, newPrefix = null) {
        if (!isValidIP(baseIP)) {
            throw new Error('Invalid IP address');
        }
        
        if (!isValidPrefix(basePrefix)) {
            throw new Error('Invalid base prefix');
        }
        
        // If no new prefix, return single network
        if (newPrefix === null || newPrefix === basePrefix) {
            const networkAddr = getNetworkAddress(baseIP, basePrefix);
            const broadcastAddr = getBroadcastAddress(baseIP, basePrefix);
            
            return [{
                subnetNumber: 1,
                networkAddress: networkAddr,
                broadcastAddress: broadcastAddr,
                firstUsable: getFirstUsable(networkAddr),
                lastUsable: getLastUsable(broadcastAddr),
                usableHosts: getUsableHosts(basePrefix),
                subnetMask: prefixToMask(basePrefix),
                prefix: basePrefix,
                totalAddresses: getTotalAddresses(basePrefix)
            }];
        }
        
        if (!isValidPrefix(newPrefix)) {
            throw new Error('Invalid new prefix');
        }
        
        if (newPrefix <= basePrefix) {
            throw new Error('New prefix must be larger than base prefix');
        }
        
        const baseNetworkAddr = getNetworkAddress(baseIP, basePrefix);
        const baseNetworkInt = ipToInt(baseNetworkAddr);
        const subnetSize = Math.pow(2, 32 - newPrefix);
        const numSubnets = Math.pow(2, newPrefix - basePrefix);
        
        const subnets = [];
        
        for (let i = 0; i < numSubnets; i++) {
            const subnetNetworkInt = (baseNetworkInt + (i * subnetSize)) >>> 0;
            const networkAddr = intToIP(subnetNetworkInt);
            const broadcastAddr = intToIP((subnetNetworkInt + subnetSize - 1) >>> 0);
            
            subnets.push({
                subnetNumber: i + 1,
                networkAddress: networkAddr,
                broadcastAddress: broadcastAddr,
                firstUsable: getFirstUsable(networkAddr),
                lastUsable: getLastUsable(broadcastAddr),
                usableHosts: getUsableHosts(newPrefix),
                subnetMask: prefixToMask(newPrefix),
                prefix: newPrefix,
                totalAddresses: getTotalAddresses(newPrefix)
            });
        }
        
        return subnets;
    }

    /**
     * Gets detailed information for binary visualization
     * @param {string} ip - IP address
     * @param {number} prefix - Prefix length
     * @returns {Object} - Binary breakdown object
     */
    function getBinaryBreakdown(ip, prefix) {
        const octets = ip.split('.').map(o => parseInt(o, 10));
        const mask = prefixToMask(prefix);
        const maskOctets = mask.split('.').map(o => parseInt(o, 10));
        const networkAddr = getNetworkAddress(ip, prefix);
        const networkOctets = networkAddr.split('.').map(o => parseInt(o, 10));
        
        const breakdown = {
            ip: {
                decimal: ip,
                octets: octets,
                binary: octets.map(o => toBinary8(o)),
                fullBinary: ipToBinary(ip)
            },
            mask: {
                decimal: mask,
                octets: maskOctets,
                binary: maskOctets.map(o => toBinary8(o)),
                fullBinary: ipToBinary(mask),
                prefix: prefix
            },
            network: {
                decimal: networkAddr,
                octets: networkOctets,
                binary: networkOctets.map(o => toBinary8(o)),
                fullBinary: ipToBinary(networkAddr)
            },
            networkBits: prefix,
            hostBits: 32 - prefix
        };
        
        return breakdown;
    }

    /**
     * Generates subnet calculation summary
     * @param {string} baseIP - Base IP address
     * @param {number} basePrefix - Base prefix
     * @param {number} newPrefix - New prefix (optional)
     * @returns {Object} - Calculation summary
     */
    function getCalculationSummary(baseIP, basePrefix, newPrefix = null) {
        const effectivePrefix = newPrefix || basePrefix;
        const subnets = calculateSubnets(baseIP, basePrefix, newPrefix);
        
        return {
            baseNetwork: getNetworkAddress(baseIP, basePrefix),
            basePrefix: basePrefix,
            newPrefix: newPrefix,
            effectivePrefix: effectivePrefix,
            subnetMask: prefixToMask(effectivePrefix),
            totalSubnets: subnets.length,
            hostsPerSubnet: getUsableHosts(effectivePrefix),
            totalAddresses: getTotalAddresses(effectivePrefix),
            networkClass: getNetworkClass(baseIP),
            isPrivate: isPrivateIP(baseIP),
            subnets: subnets
        };
    }

    // Public API
    return {
        isValidIP,
        isValidPrefix,
        ipToInt,
        intToIP,
        toBinary8,
        ipToBinary,
        prefixToMask,
        getNetworkAddress,
        getBroadcastAddress,
        getFirstUsable,
        getLastUsable,
        getUsableHosts,
        getTotalAddresses,
        getNetworkClass,
        isPrivateIP,
        calculateSubnets,
        getBinaryBreakdown,
        getCalculationSummary
    };
})();

// Make available globally
window.SubnetEngine = SubnetEngine;
