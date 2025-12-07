"use strict";

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
var Visualizer = function () {
  'use strict';
  /**
   * Generates binary visualization for IP, mask, and network
   * @param {Object} binary - Binary breakdown from SubnetEngine
   * @param {string} containerId - Container element ID
   */

  function renderBinaryVisualization(binary, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html = ''; // IP Address Binary

    html += createBinaryRow('IP Address', binary.ip.decimal, binary.ip.binary, binary.networkBits); // Subnet Mask Binary

    html += createBinaryRow('Subnet Mask', binary.mask.decimal, binary.mask.binary, binary.networkBits); // Network Address Binary

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
    var html = '<div class="binary-row">';
    html += "<div class=\"binary-label\">".concat(label, ": ").concat(decimal, "</div>");
    html += '<div class="binary-octets">';
    var bitPosition = 0;
    binaryOctets.forEach(function (octet, octetIndex) {
      html += '<div class="binary-octet">';

      for (var i = 0; i < 8; i++) {
        var bit = octet[i];
        var isNetworkBit = bitPosition < networkBits;
        var className = isNetworkBit ? 'network' : 'host'; // Calculate decimal value of this bit position (128, 64, 32, 16, 8, 4, 2, 1)

        var bitPositionInOctet = i;
        var decimalValue = Math.pow(2, 7 - bitPositionInOctet);
        var contribution = bit === '1' ? decimalValue : 0; // Create detailed tooltip

        var tooltip = "Position ".concat(bitPosition + 1, " (Bit ").concat(bitPositionInOctet, ")\n") + "Value: ".concat(bit, "\n") + "Decimal: ".concat(decimalValue, "\n") + "Contributes: ".concat(contribution, "\n") + "Type: ".concat(isNetworkBit ? 'Network' : 'Host', " bit");
        html += "<div class=\"binary-bit ".concat(className, "\" title=\"").concat(tooltip, "\" data-value=\"").concat(decimalValue, "\" data-contributes=\"").concat(contribution, "\">").concat(bit, "</div>");
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
    var container = document.getElementById(containerId);
    if (!container) return; // If no splitting, show simple single node

    if (!newPrefix || newPrefix === basePrefix || subnets.length === 1) {
      container.innerHTML = "\n                <svg width=\"400\" height=\"200\" viewBox=\"0 0 400 200\">\n                    <defs>\n                        <linearGradient id=\"singleNodeGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n                            <stop offset=\"0%\" style=\"stop-color:var(--color-primary);stop-opacity:1\" />\n                            <stop offset=\"100%\" style=\"stop-color:var(--color-secondary);stop-opacity:1\" />\n                        </linearGradient>\n                    </defs>\n                    <rect x=\"100\" y=\"70\" width=\"200\" height=\"70\" rx=\"12\" class=\"tree-node-single\" fill=\"url(#singleNodeGrad)\" />\n                    <text x=\"200\" y=\"95\" text-anchor=\"middle\" class=\"tree-text-main\" style=\"fill: white; font-size: 14px; font-weight: 700;\">".concat(subnets[0].networkAddress, "</text>\n                    <text x=\"200\" y=\"115\" text-anchor=\"middle\" class=\"tree-text-main\" style=\"fill: white; font-size: 13px;\">/").concat(basePrefix, "</text>\n                    <text x=\"200\" y=\"132\" text-anchor=\"middle\" class=\"tree-text-main\" style=\"fill: rgba(255,255,255,0.8); font-size: 10px;\">").concat(subnets[0].usableHosts, " hosts</text>\n                </svg>\n            ");
      return;
    } // Calculate tree dimensions with improved spacing


    var nodeWidth = 160;
    var nodeHeight = 70;
    var levelHeight = 140;
    var horizontalSpacing = 30;
    var minHorizontalSpacing = 15; // Better grid calculation

    var cols = Math.min(8, Math.ceil(Math.sqrt(subnets.length * 1.5)));
    var rows = Math.ceil(subnets.length / cols);
    var totalWidth = Math.max(cols * (nodeWidth + horizontalSpacing), 1000);
    var svgHeight = levelHeight + rows * (nodeHeight + 80) + 50;
    var svgWidth = totalWidth + 100;
    var svg = "<svg width=\"100%\" height=\"".concat(svgHeight, "\" viewBox=\"0 0 ").concat(svgWidth, " ").concat(svgHeight, "\">"); // Add gradient definitions

    svg += "\n            <defs>\n                <linearGradient id=\"rootGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n                    <stop offset=\"0%\" style=\"stop-color:#8b5cf6;stop-opacity:1\" />\n                    <stop offset=\"100%\" style=\"stop-color:#3b82f6;stop-opacity:1\" />\n                </linearGradient>\n                <linearGradient id=\"childGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n                    <stop offset=\"0%\" style=\"stop-color:#3b82f6;stop-opacity:1\" />\n                    <stop offset=\"100%\" style=\"stop-color:#06b6d4;stop-opacity:1\" />\n                </linearGradient>\n                <filter id=\"shadow\">\n                    <feDropShadow dx=\"0\" dy=\"4\" stdDeviation=\"4\" flood-opacity=\"0.3\"/>\n                </filter>\n            </defs>\n        "; // Draw root node (base network)

    var rootX = svgWidth / 2;
    var rootY = 40;
    svg += drawTreeNode(subnets[0].networkAddress.split('.').slice(0, 3).join('.') + '.0', basePrefix, rootX, rootY, nodeWidth + 20, nodeHeight, null, true); // Draw child nodes (subnets) with better layout

    var startY = rootY + levelHeight;
    var gridWidth = cols * (nodeWidth + horizontalSpacing);
    var startX = (svgWidth - gridWidth) / 2 + nodeWidth / 2;
    subnets.forEach(function (subnet, index) {
      var col = index % cols;
      var row = Math.floor(index / cols);
      var x = startX + col * (nodeWidth + horizontalSpacing);
      var y = startY + row * (nodeHeight + 80); // Draw curved line from root to child

      var midY = (rootY + nodeHeight + y) / 2;
      svg += "<path d=\"M ".concat(rootX, " ").concat(rootY + nodeHeight, " Q ").concat(rootX, " ").concat(midY, ", ").concat(x, " ").concat(y, "\" class=\"tree-link\" />"); // Draw child node

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


  function drawTreeNode(address, prefix, x, y, width, height) {
    var number = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;
    var isRoot = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    var rectX = x - width / 2;
    var fillColor = isRoot ? 'url(#rootGrad)' : 'url(#childGrad)';
    var strokeColor = isRoot ? '#8b5cf6' : '#3b82f6';
    var svg = "<rect x=\"".concat(rectX, "\" y=\"").concat(y, "\" width=\"").concat(width, "\" height=\"").concat(height, "\" rx=\"12\" \n                   class=\"tree-node\" fill=\"").concat(fillColor, "\" stroke=\"").concat(strokeColor, "\" \n                   stroke-width=\"3\" filter=\"url(#shadow)\" />");

    if (number) {
      // Child node with number
      svg += "<rect x=\"".concat(rectX + 5, "\" y=\"").concat(y + 5, "\" width=\"30\" height=\"20\" rx=\"4\" fill=\"rgba(255,255,255,0.2)\" />");
      svg += "<text x=\"".concat(rectX + 20, "\" y=\"").concat(y + 18, "\" text-anchor=\"middle\" class=\"tree-text\" style=\"font-size: 11px; fill: white; font-weight: 700;\">#").concat(number, "</text>");
      svg += "<text x=\"".concat(x, "\" y=\"").concat(y + 38, "\" text-anchor=\"middle\" class=\"tree-text\" style=\"font-size: 13px; fill: white; font-weight: 700;\">").concat(address, "</text>");
      svg += "<text x=\"".concat(x, "\" y=\"").concat(y + 55, "\" text-anchor=\"middle\" class=\"tree-text\" style=\"font-size: 12px; fill: rgba(255,255,255,0.9);\">/").concat(prefix, "</text>");
    } else {
      // Root node
      svg += "<text x=\"".concat(x, "\" y=\"").concat(y + 20, "\" text-anchor=\"middle\" class=\"tree-text\" style=\"font-size: 11px; fill: rgba(255,255,255,0.8); font-weight: 600;\">BASE NETWORK</text>");
      svg += "<text x=\"".concat(x, "\" y=\"").concat(y + 38, "\" text-anchor=\"middle\" class=\"tree-text\" style=\"font-size: 14px; fill: white; font-weight: 700;\">").concat(address, "</text>");
      svg += "<text x=\"".concat(x, "\" y=\"").concat(y + 55, "\" text-anchor=\"middle\" class=\"tree-text\" style=\"font-size: 13px; fill: rgba(255,255,255,0.9);\">/").concat(prefix, "</text>");
    }

    return svg;
  }
  /**
   * Generates address space map visualization
   * @param {Array} subnets - Array of subnet objects
   * @param {string} containerId - Container element ID
   */


  function renderAddressSpaceMap(subnets, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (subnets.length === 0) {
      container.innerHTML = '<p>No subnets to display</p>';
      return;
    }

    var svgHeight = Math.max(200, subnets.length * 60 + 40);
    var svgWidth = 800;
    var barHeight = 40;
    var barSpacing = 20;
    var leftMargin = 50;
    var rightMargin = 50;
    var availableWidth = svgWidth - leftMargin - rightMargin; // Calculate max address for scaling

    var lastSubnet = subnets[subnets.length - 1];
    var maxAddress = SubnetEngine.ipToInt(lastSubnet.broadcastAddress);
    var minAddress = SubnetEngine.ipToInt(subnets[0].networkAddress);
    var range = maxAddress - minAddress + 1;
    var svg = "<svg width=\"100%\" height=\"".concat(svgHeight, "\" viewBox=\"0 0 ").concat(svgWidth, " ").concat(svgHeight, "\">");
    subnets.forEach(function (subnet, index) {
      var y = 20 + index * (barHeight + barSpacing); // Calculate positions

      var networkInt = SubnetEngine.ipToInt(subnet.networkAddress);
      var broadcastInt = SubnetEngine.ipToInt(subnet.broadcastAddress);
      var firstUsableInt = SubnetEngine.ipToInt(subnet.firstUsable);
      var lastUsableInt = SubnetEngine.ipToInt(subnet.lastUsable); // Calculate widths proportionally

      var totalWidth = availableWidth * (subnet.totalAddresses / range);
      var networkWidth = 3; // Fixed small width for network

      var broadcastWidth = 3; // Fixed small width for broadcast

      var usableWidth = totalWidth - networkWidth - broadcastWidth;
      var startX = leftMargin; // Draw network address (blue)

      svg += "<rect x=\"".concat(startX, "\" y=\"").concat(y, "\" width=\"").concat(networkWidth, "\" height=\"").concat(barHeight, "\" \n                    fill=\"var(--color-network)\" rx=\"2\" />"); // Draw usable range (green)

      svg += "<rect x=\"".concat(startX + networkWidth, "\" y=\"").concat(y, "\" width=\"").concat(usableWidth, "\" height=\"").concat(barHeight, "\" \n                    fill=\"var(--color-usable)\" rx=\"2\" />"); // Draw broadcast address (red)

      svg += "<rect x=\"".concat(startX + networkWidth + usableWidth, "\" y=\"").concat(y, "\" width=\"").concat(broadcastWidth, "\" height=\"").concat(barHeight, "\" \n                    fill=\"var(--color-broadcast)\" rx=\"2\" />"); // Add border

      svg += "<rect x=\"".concat(startX, "\" y=\"").concat(y, "\" width=\"").concat(totalWidth, "\" height=\"").concat(barHeight, "\" \n                    fill=\"none\" stroke=\"var(--border-color)\" stroke-width=\"2\" rx=\"2\" />"); // Add labels

      svg += "<text x=\"".concat(startX + totalWidth + 10, "\" y=\"").concat(y + barHeight / 2, "\" \n                    alignment-baseline=\"middle\" class=\"tree-text\" style=\"font-size: 12px;\">\n                    Subnet ").concat(index + 1, ": ").concat(subnet.networkAddress, "/").concat(subnet.prefix, "\n                    </text>"); // Add hover tooltip (simplified)

      svg += "<title>Subnet ".concat(index + 1, "\nNetwork: ").concat(subnet.networkAddress, "\nUsable: ").concat(subnet.firstUsable, " - ").concat(subnet.lastUsable, "\nBroadcast: ").concat(subnet.broadcastAddress, "\nHosts: ").concat(subnet.usableHosts, "</title>");
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
    var colors = {
      network: 'var(--color-network)',
      broadcast: 'var(--color-broadcast)',
      usable: 'var(--color-usable)'
    };
    return "<span style=\"color: ".concat(colors[type] || 'inherit', "; font-weight: 600;\">").concat(ip, "</span>");
  }
  /**
   * Creates a visual comparison of two subnets
   * @param {Object} subnet1 - First subnet
   * @param {Object} subnet2 - Second subnet
   * @returns {string} - HTML comparison
   */


  function compareSubnets(subnet1, subnet2) {
    return "\n            <div class=\"subnet-comparison\">\n                <div class=\"comparison-column\">\n                    <h4>Subnet ".concat(subnet1.subnetNumber, "</h4>\n                    <p>Network: ").concat(colorCodeIP(subnet1.networkAddress, 'network'), "</p>\n                    <p>Broadcast: ").concat(colorCodeIP(subnet1.broadcastAddress, 'broadcast'), "</p>\n                    <p>Hosts: ").concat(subnet1.usableHosts, "</p>\n                </div>\n                <div class=\"comparison-column\">\n                    <h4>Subnet ").concat(subnet2.subnetNumber, "</h4>\n                    <p>Network: ").concat(colorCodeIP(subnet2.networkAddress, 'network'), "</p>\n                    <p>Broadcast: ").concat(colorCodeIP(subnet2.broadcastAddress, 'broadcast'), "</p>\n                    <p>Hosts: ").concat(subnet2.usableHosts, "</p>\n                </div>\n            </div>\n        ");
  }
  /**
   * Clears all visualizations
   */


  function clearVisualizations() {
    var containers = ['binaryVisualization', 'subnetTree', 'addressMap'];
    containers.forEach(function (id) {
      var container = document.getElementById(id);

      if (container) {
        container.innerHTML = '';
      }
    });
  } // Public API


  return {
    renderBinaryVisualization: renderBinaryVisualization,
    renderSubnetTree: renderSubnetTree,
    renderAddressSpaceMap: renderAddressSpaceMap,
    colorCodeIP: colorCodeIP,
    compareSubnets: compareSubnets,
    clearVisualizations: clearVisualizations
  };
}(); // Make available globally


window.Visualizer = Visualizer;
//# sourceMappingURL=visualizer.dev.js.map
