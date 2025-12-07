"use strict";

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
var SubnetEngine = function () {
  'use strict';
  /**
   * Validates an IPv4 address
   * @param {string} ip - IP address to validate
   * @returns {boolean} - True if valid
   */

  function isValidIP(ip) {
    var octets = ip.split('.');
    if (octets.length !== 4) return false;
    return octets.every(function (octet) {
      var num = parseInt(octet, 10);
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
    return ip.split('.').reduce(function (_int, octet) {
      return (_int << 8) + parseInt(octet, 10);
    }, 0) >>> 0;
  }
  /**
   * Converts 32-bit integer to IP address
   * @param {number} int - 32-bit integer
   * @returns {string} - IP address
   */


  function intToIP(_int2) {
    return [_int2 >>> 24 & 255, _int2 >>> 16 & 255, _int2 >>> 8 & 255, _int2 & 255].join('.');
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
    return ip.split('.').map(function (octet) {
      return toBinary8(parseInt(octet, 10));
    }).join('.');
  }
  /**
   * Generates subnet mask from prefix length
   * @param {number} prefix - Prefix length (0-32)
   * @returns {string} - Subnet mask in dotted decimal
   */


  function prefixToMask(prefix) {
    var mask = 0xFFFFFFFF << 32 - prefix >>> 0;
    return intToIP(mask);
  }
  /**
   * Calculates network address
   * @param {string} ip - IP address
   * @param {number} prefix - Prefix length
   * @returns {string} - Network address
   */


  function getNetworkAddress(ip, prefix) {
    var ipInt = ipToInt(ip);
    var maskInt = 0xFFFFFFFF << 32 - prefix >>> 0;
    var networkInt = (ipInt & maskInt) >>> 0;
    return intToIP(networkInt);
  }
  /**
   * Calculates broadcast address
   * @param {string} ip - IP address
   * @param {number} prefix - Prefix length
   * @returns {string} - Broadcast address
   */


  function getBroadcastAddress(ip, prefix) {
    var networkInt = ipToInt(getNetworkAddress(ip, prefix));
    var hostMask = 0xFFFFFFFF >>> prefix >>> 0;
    var broadcastInt = (networkInt | hostMask) >>> 0;
    return intToIP(broadcastInt);
  }
  /**
   * Calculates first usable host address
   * @param {string} networkAddr - Network address
   * @returns {string} - First usable host
   */


  function getFirstUsable(networkAddr) {
    var networkInt = ipToInt(networkAddr);
    return intToIP(networkInt + 1 >>> 0);
  }
  /**
   * Calculates last usable host address
   * @param {string} broadcastAddr - Broadcast address
   * @returns {string} - Last usable host
   */


  function getLastUsable(broadcastAddr) {
    var broadcastInt = ipToInt(broadcastAddr);
    return intToIP(broadcastInt - 1 >>> 0);
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
    var firstOctet = parseInt(ip.split('.')[0], 10);
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
    var ipInt = ipToInt(ip); // 10.0.0.0/8

    if (ipInt >= ipToInt('10.0.0.0') && ipInt <= ipToInt('10.255.255.255')) return true; // 172.16.0.0/12

    if (ipInt >= ipToInt('172.16.0.0') && ipInt <= ipToInt('172.31.255.255')) return true; // 192.168.0.0/16

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


  function calculateSubnets(baseIP, basePrefix) {
    var newPrefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    if (!isValidIP(baseIP)) {
      throw new Error('Invalid IP address');
    }

    if (!isValidPrefix(basePrefix)) {
      throw new Error('Invalid base prefix');
    } // If no new prefix, return single network


    if (newPrefix === null || newPrefix === basePrefix) {
      var networkAddr = getNetworkAddress(baseIP, basePrefix);
      var broadcastAddr = getBroadcastAddress(baseIP, basePrefix);
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

    var baseNetworkAddr = getNetworkAddress(baseIP, basePrefix);
    var baseNetworkInt = ipToInt(baseNetworkAddr);
    var subnetSize = Math.pow(2, 32 - newPrefix);
    var numSubnets = Math.pow(2, newPrefix - basePrefix);
    var subnets = [];

    for (var i = 0; i < numSubnets; i++) {
      var subnetNetworkInt = baseNetworkInt + i * subnetSize >>> 0;

      var _networkAddr = intToIP(subnetNetworkInt);

      var _broadcastAddr = intToIP(subnetNetworkInt + subnetSize - 1 >>> 0);

      subnets.push({
        subnetNumber: i + 1,
        networkAddress: _networkAddr,
        broadcastAddress: _broadcastAddr,
        firstUsable: getFirstUsable(_networkAddr),
        lastUsable: getLastUsable(_broadcastAddr),
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
    var octets = ip.split('.').map(function (o) {
      return parseInt(o, 10);
    });
    var mask = prefixToMask(prefix);
    var maskOctets = mask.split('.').map(function (o) {
      return parseInt(o, 10);
    });
    var networkAddr = getNetworkAddress(ip, prefix);
    var networkOctets = networkAddr.split('.').map(function (o) {
      return parseInt(o, 10);
    });
    var breakdown = {
      ip: {
        decimal: ip,
        octets: octets,
        binary: octets.map(function (o) {
          return toBinary8(o);
        }),
        fullBinary: ipToBinary(ip)
      },
      mask: {
        decimal: mask,
        octets: maskOctets,
        binary: maskOctets.map(function (o) {
          return toBinary8(o);
        }),
        fullBinary: ipToBinary(mask),
        prefix: prefix
      },
      network: {
        decimal: networkAddr,
        octets: networkOctets,
        binary: networkOctets.map(function (o) {
          return toBinary8(o);
        }),
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


  function getCalculationSummary(baseIP, basePrefix) {
    var newPrefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var effectivePrefix = newPrefix || basePrefix;
    var subnets = calculateSubnets(baseIP, basePrefix, newPrefix);
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
  } // Public API


  return {
    isValidIP: isValidIP,
    isValidPrefix: isValidPrefix,
    ipToInt: ipToInt,
    intToIP: intToIP,
    toBinary8: toBinary8,
    ipToBinary: ipToBinary,
    prefixToMask: prefixToMask,
    getNetworkAddress: getNetworkAddress,
    getBroadcastAddress: getBroadcastAddress,
    getFirstUsable: getFirstUsable,
    getLastUsable: getLastUsable,
    getUsableHosts: getUsableHosts,
    getTotalAddresses: getTotalAddresses,
    getNetworkClass: getNetworkClass,
    isPrivateIP: isPrivateIP,
    calculateSubnets: calculateSubnets,
    getBinaryBreakdown: getBinaryBreakdown,
    getCalculationSummary: getCalculationSummary
  };
}(); // Make available globally


window.SubnetEngine = SubnetEngine;
//# sourceMappingURL=subnet-engine.dev.js.map
