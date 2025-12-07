"use strict";

/**
 * ============================================
 * Explanations Module
 * ============================================
 * Generates human-friendly, educational explanations
 * for subnet calculations and concepts.
 * ============================================
 */
var Explanations = function () {
  'use strict';
  /**
   * Generates step-by-step explanation for subnet calculation
   * @param {Object} summary - Calculation summary from SubnetEngine
   * @returns {Array} - Array of explanation step objects
   */

  function generateExplanation(summary) {
    var steps = [];
    var basePrefix = summary.basePrefix,
        newPrefix = summary.newPrefix,
        effectivePrefix = summary.effectivePrefix,
        subnetMask = summary.subnetMask,
        totalSubnets = summary.totalSubnets,
        hostsPerSubnet = summary.hostsPerSubnet; // Step 1: Understanding the Network

    steps.push({
      title: '🌐 Understanding the Network',
      content: "\n                <p>You started with the network <code>".concat(summary.baseNetwork, "/").concat(basePrefix, "</code>.</p>\n                <p>This is a <strong>Class ").concat(summary.networkClass, "</strong> network, which is ").concat(summary.isPrivate ? 'a <strong>private</strong> address range' : 'a <strong>public</strong> address', ".</p>\n                ").concat(newPrefix ? "<p>You're splitting this network into smaller subnets using a /".concat(newPrefix, " prefix.</p>") : '<p>You\'re analyzing this single network without subdivision.</p>', "\n            "),
      icon: '🌐'
    }); // Step 2: Prefix Length and Subnet Mask

    steps.push({
      title: '🔢 Prefix Length and Subnet Mask',
      content: "\n                <p>The prefix <code>/".concat(effectivePrefix, "</code> means the first <strong>").concat(effectivePrefix, " bits</strong> identify the network.</p>\n                <p>The remaining <strong>").concat(32 - effectivePrefix, " bits</strong> are available for host addresses.</p>\n                <div class=\"formula-box\">\n                    Subnet Mask: ").concat(subnetMask, "<br>\n                    In CIDR: /").concat(effectivePrefix, "\n                </div>\n                <p><strong>How it works:</strong> The subnet mask has ").concat(effectivePrefix, " consecutive 1-bits followed by ").concat(32 - effectivePrefix, " 0-bits.</p>\n                <p>In binary: <code>").concat(SubnetEngine.ipToBinary(subnetMask), "</code></p>\n            "),
      icon: '🔢'
    }); // Step 3: Calculating Number of Subnets

    if (newPrefix && newPrefix > basePrefix) {
      var borrowedBits = newPrefix - basePrefix;
      steps.push({
        title: '📊 Calculating Number of Subnets',
        content: "\n                    <p><strong>Question:</strong> How many subnets can we create?</p>\n                    <p>To split the <code>/".concat(basePrefix, "</code> network into <code>/").concat(newPrefix, "</code> subnets, we borrow <strong>").concat(borrowedBits, " bit").concat(borrowedBits > 1 ? 's' : '', "</strong> from the host portion.</p>\n                    \n                    <div class=\"formula-box\">\n                        <strong>Formula:</strong> Number of Subnets = 2<sup>borrowed bits</sup><br><br>\n                        Borrowed Bits = New Prefix - Base Prefix<br>\n                        Borrowed Bits = ").concat(newPrefix, " - ").concat(basePrefix, " = <strong>").concat(borrowedBits, " bit").concat(borrowedBits > 1 ? 's' : '', "</strong><br><br>\n                        Number of Subnets = 2<sup>").concat(borrowedBits, "</sup> = <strong>").concat(totalSubnets, "</strong>\n                    </div>\n                    \n                    <p><strong>Step-by-Step Calculation:</strong></p>\n                    <ol>\n                        <li>Original prefix: /").concat(basePrefix, " (your base network)</li>\n                        <li>New prefix: /").concat(newPrefix, " (target subnet size)</li>\n                        <li>Subtract: ").concat(newPrefix, " - ").concat(basePrefix, " = ").concat(borrowedBits, " bits borrowed</li>\n                        <li>Calculate: 2<sup>").concat(borrowedBits, "</sup> = ").concat(Array.from({
          length: borrowedBits
        }, function (_, i) {
          return 2;
        }).join(' × '), " = ").concat(totalSubnets, " subnets</li>\n                    </ol>\n                    \n                    <p><strong>Why does this work?</strong> Each additional bit we use for the network portion doubles the number of possible subnets. With ").concat(borrowedBits, " borrowed bit").concat(borrowedBits > 1 ? 's' : '', ", we can create ").concat(totalSubnets, " unique subnet").concat(totalSubnets > 1 ? 's' : '', ".</p>\n                    \n                    <div class=\"example-box\">\n                        <strong>\uD83D\uDCA1 Real Example:</strong><br>\n                        If you have /").concat(basePrefix, " and split to /").concat(newPrefix, ":<br>\n                        \u2022 Borrowed ").concat(borrowedBits, " bit").concat(borrowedBits > 1 ? 's' : '', "<br>\n                        \u2022 2<sup>").concat(borrowedBits, "</sup> = ").concat(totalSubnets, " possible subnets<br>\n                        \u2022 Each subnet has /").concat(newPrefix, " prefix\n                    </div>\n                "),
        icon: '📊'
      });
    } else {
      steps.push({
        title: '📊 Single Network Analysis',
        content: "\n                    <p>You're analyzing a single network without subdividing it.</p>\n                    <div class=\"formula-box\">\n                        Total Subnets = 1<br>\n                        (No subdivision performed)\n                    </div>\n                    <p><strong>Note:</strong> To create multiple subnets, enter a \"New Prefix\" value that is larger than your base prefix (/".concat(basePrefix, ").</p>\n                "),
        icon: '📊'
      });
    } // Step 4: Calculating Usable Hosts


    steps.push({
      title: '👥 Calculating Usable Hosts',
      content: "\n                <p>With <strong>".concat(32 - effectivePrefix, " host bits</strong>, we can calculate the number of usable host addresses.</p>\n                <div class=\"formula-box\">\n                    Usable Hosts = 2<sup>").concat(32 - effectivePrefix, "</sup> - 2 = ").concat(hostsPerSubnet, "\n                </div>\n                <p><strong>Why subtract 2?</strong> Every subnet has two special addresses:</p>\n                <ul>\n                    <li><strong>Network Address:</strong> The first address (all host bits = 0) identifies the subnet itself</li>\n                    <li><strong>Broadcast Address:</strong> The last address (all host bits = 1) is used for broadcasting to all hosts</li>\n                </ul>\n                <p>These two addresses cannot be assigned to individual hosts, so we subtract them from the total.</p>\n            "),
      icon: '👥'
    }); // Step 5: Network Address Calculation

    steps.push({
      title: '🎯 Finding the Network Address',
      content: "\n                <p>The <strong>Network Address</strong> is found by performing a bitwise AND operation between the IP address and subnet mask.</p>\n                <p><strong>Process:</strong></p>\n                <ol>\n                    <li>Convert both IP address and subnet mask to binary</li>\n                    <li>Perform AND operation (1 AND 1 = 1, otherwise 0)</li>\n                    <li>Convert result back to decimal</li>\n                </ol>\n                <p>This sets all host bits to 0, giving us the network's base address.</p>\n                <p><strong>Example:</strong> For ".concat(summary.subnets[0].networkAddress, "/").concat(effectivePrefix, ", the network address is <code>").concat(summary.subnets[0].networkAddress, "</code></p>\n            "),
      icon: '🎯'
    }); // Step 6: Broadcast Address Calculation

    steps.push({
      title: '📢 Finding the Broadcast Address',
      content: "\n                <p>The <strong>Broadcast Address</strong> is the last address in the subnet, used to send data to all hosts simultaneously.</p>\n                <p><strong>Process:</strong></p>\n                <ol>\n                    <li>Start with the network address</li>\n                    <li>Set all host bits to 1</li>\n                    <li>This gives the highest address in the subnet</li>\n                </ol>\n                <p><strong>Example:</strong> For the subnet ".concat(summary.subnets[0].networkAddress, "/").concat(effectivePrefix, ", the broadcast address is <code>").concat(summary.subnets[0].broadcastAddress, "</code></p>\n            "),
      icon: '📢'
    }); // Step 7: Usable Host Range

    steps.push({
      title: '🔄 Determining Usable Host Range',
      content: "\n                <p>The <strong>Usable Host Range</strong> includes all addresses between the network and broadcast addresses.</p>\n                <p><strong>Calculation:</strong></p>\n                <ul>\n                    <li><strong>First Usable:</strong> Network Address + 1</li>\n                    <li><strong>Last Usable:</strong> Broadcast Address - 1</li>\n                </ul>\n                <p><strong>Example for first subnet:</strong></p>\n                <div class=\"formula-box\">\n                    First Usable: ".concat(summary.subnets[0].firstUsable, "<br>\n                    Last Usable: ").concat(summary.subnets[0].lastUsable, "\n                </div>\n                <p>These are the addresses you can assign to devices like computers, printers, and servers.</p>\n            "),
      icon: '🔄'
    }); // Step 8: Practical Application

    steps.push({
      title: '🛠️ Practical Application',
      content: "\n                <p><strong>Summary of your subnet configuration:</strong></p>\n                <ul>\n                    <li>You have <strong>".concat(totalSubnets, "</strong> subnet").concat(totalSubnets > 1 ? 's' : '', " available</li>\n                    <li>Each subnet can support <strong>").concat(hostsPerSubnet, "</strong> usable host").concat(hostsPerSubnet !== 1 ? 's' : '', "</li>\n                    <li>Total capacity: <strong>").concat(totalSubnets * hostsPerSubnet, "</strong> devices across all subnets</li>\n                </ul>\n                <p><strong>Best Practices:</strong></p>\n                <ul>\n                    <li>Assign the first usable address to your gateway/router</li>\n                    <li>Document which devices use which addresses</li>\n                    <li>Reserve ranges for static and DHCP allocations</li>\n                    <li>Plan for future growth when choosing subnet sizes</li>\n                </ul>\n            "),
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
    return "\n            <div class=\"explanation-step\">\n                <h3>\uD83D\uDD22 Understanding Binary Notation</h3>\n                <p>Every IP address is actually a 32-bit number. We usually write it in decimal for convenience, but computers work with binary (1s and 0s).</p>\n                \n                <p><strong>Your IP Address:</strong></p>\n                <ul>\n                    <li>Decimal: <code>".concat(binary.ip.decimal, "</code></li>\n                    <li>Binary: <code>").concat(binary.ip.fullBinary, "</code></li>\n                </ul>\n\n                <p><strong>The Subnet Mask:</strong></p>\n                <ul>\n                    <li>Decimal: <code>").concat(binary.mask.decimal, "</code></li>\n                    <li>Binary: <code>").concat(binary.mask.fullBinary, "</code></li>\n                </ul>\n\n                <p>The mask has <strong>").concat(binary.networkBits, " network bits</strong> (shown in blue) and <strong>").concat(binary.hostBits, " host bits</strong> (shown in orange).</p>\n                \n                <p><strong>Network Address:</strong> Created by setting all host bits to 0:</p>\n                <ul>\n                    <li>Decimal: <code>").concat(binary.network.decimal, "</code></li>\n                    <li>Binary: <code>").concat(binary.network.fullBinary, "</code></li>\n                </ul>\n            </div>\n        ");
  }
  /**
   * Generates quick reference guide
   * @returns {string} - HTML quick reference
   */


  function generateQuickReference() {
    return "\n            <div class=\"explanation-step\">\n                <h3>\uD83D\uDCDA Quick Reference Guide</h3>\n                \n                <p><strong>Common Subnet Masks:</strong></p>\n                <div class=\"formula-box\">\n                    /24 = 255.255.255.0 \u2192 254 hosts<br>\n                    /25 = 255.255.255.128 \u2192 126 hosts<br>\n                    /26 = 255.255.255.192 \u2192 62 hosts<br>\n                    /27 = 255.255.255.224 \u2192 30 hosts<br>\n                    /28 = 255.255.255.240 \u2192 14 hosts<br>\n                    /29 = 255.255.255.248 \u2192 6 hosts<br>\n                    /30 = 255.255.255.252 \u2192 2 hosts\n                </div>\n\n                <p><strong>Private IP Ranges:</strong></p>\n                <ul>\n                    <li>Class A: <code>10.0.0.0/8</code> (10.0.0.0 - 10.255.255.255)</li>\n                    <li>Class B: <code>172.16.0.0/12</code> (172.16.0.0 - 172.31.255.255)</li>\n                    <li>Class C: <code>192.168.0.0/16</code> (192.168.0.0 - 192.168.255.255)</li>\n                </ul>\n\n                <p><strong>Key Formulas:</strong></p>\n                <ul>\n                    <li>Number of Subnets = 2<sup>borrowed bits</sup></li>\n                    <li>Hosts per Subnet = 2<sup>host bits</sup> - 2</li>\n                    <li>Network Address = IP AND Subnet Mask</li>\n                    <li>Broadcast Address = Network OR (NOT Subnet Mask)</li>\n                </ul>\n            </div>\n        ";
  }
  /**
   * Renders explanation steps to HTML
   * @param {Array} steps - Array of explanation steps
   * @returns {string} - HTML string
   */


  function renderSteps(steps) {
    return steps.map(function (step) {
      return "\n            <div class=\"explanation-step\">\n                <h3>".concat(step.icon, " ").concat(step.title, "</h3>\n                ").concat(step.content, "\n            </div>\n        ");
    }).join('');
  }
  /**
   * Main function to generate and render all explanations
   * @param {Object} summary - Calculation summary
   * @param {Object} binary - Binary breakdown
   * @returns {string} - Complete HTML explanation
   */


  function generateFullExplanation(summary, binary) {
    var steps = generateExplanation(summary);
    var stepsHTML = renderSteps(steps);
    var quickRef = generateQuickReference();
    return stepsHTML + quickRef;
  } // Public API


  return {
    generateExplanation: generateExplanation,
    generateBinaryExplanation: generateBinaryExplanation,
    generateQuickReference: generateQuickReference,
    renderSteps: renderSteps,
    generateFullExplanation: generateFullExplanation
  };
}(); // Make available globally


window.Explanations = Explanations;
//# sourceMappingURL=explanations.dev.js.map
