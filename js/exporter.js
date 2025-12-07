/**
 * ============================================
 * Exporter Module
 * ============================================
 * Handles CSV and PDF export functionality
 * Pure JavaScript implementation - no external libraries
 * ============================================
 */

const Exporter = (function() {
    'use strict';

    /**
     * Exports subnet data to CSV format
     * @param {Object} summary - Calculation summary
     * @param {string} filename - Output filename
     */
    function exportToCSV(summary, filename = 'subnet-results.csv') {
        const { subnets, baseNetwork, basePrefix, newPrefix, effectivePrefix, subnetMask } = summary;

        // Build CSV content
        let csv = 'Subnet Tutor v2.0 - Export Results\n';
        csv += `Generated: ${new Date().toLocaleString()}\n`;
        csv += '\n';
        csv += 'Configuration Summary\n';
        csv += `Base Network,${baseNetwork}/${basePrefix}\n`;
        csv += `Subnet Mask,${subnetMask}\n`;
        csv += `Effective Prefix,/${effectivePrefix}\n`;
        csv += `Total Subnets,${subnets.length}\n`;
        csv += `Hosts per Subnet,${subnets[0].usableHosts}\n`;
        csv += '\n';
        
        // Headers
        csv += 'Subnet #,Network Address,Subnet Mask,Broadcast Address,First Usable,Last Usable,Usable Hosts,Total Addresses\n';
        
        // Data rows
        subnets.forEach(subnet => {
            csv += `${subnet.subnetNumber},`;
            csv += `${subnet.networkAddress},`;
            csv += `${subnet.subnetMask},`;
            csv += `${subnet.broadcastAddress},`;
            csv += `${subnet.firstUsable},`;
            csv += `${subnet.lastUsable},`;
            csv += `${subnet.usableHosts},`;
            csv += `${subnet.totalAddresses}\n`;
        });

        // Download
        downloadFile(csv, filename, 'text/csv');
    }

    /**
     * Exports subnet data to PDF format
     * Pure JavaScript implementation without external libraries
     * @param {Object} summary - Calculation summary
     * @param {string} filename - Output filename
     */
    function exportToPDF(summary, filename = 'subnet-results.pdf') {
        const { subnets, baseNetwork, basePrefix, newPrefix, effectivePrefix, subnetMask, networkClass } = summary;

        // Create PDF content using simplified PDF structure
        const pdf = createSimplePDF(summary);
        
        // Download
        downloadFile(pdf, filename, 'application/pdf');
    }

    /**
     * Creates a simple PDF file structure
     * This is a minimal PDF implementation that works offline
     * @param {Object} summary - Calculation summary
     * @returns {string} - PDF content
     */
    function createSimplePDF(summary) {
        const { subnets, baseNetwork, basePrefix, effectivePrefix, subnetMask, networkClass } = summary;
        const timestamp = new Date().toLocaleString();

        // PDF header
        let pdf = '%PDF-1.4\n';
        pdf += '%âãÏÓ\n'; // Binary marker
        
        // Build content stream
        let content = '';
        content += 'BT\n'; // Begin text
        content += '/F1 18 Tf\n'; // Font size 18
        content += '50 750 Td\n'; // Position
        content += '(Subnet Tutor v2.0 - Results) Tj\n';
        
        content += '/F1 10 Tf\n'; // Font size 10
        content += '0 -20 Td\n';
        content += `(Generated: ${timestamp}) Tj\n`;
        
        content += '0 -30 Td\n';
        content += '/F1 12 Tf\n';
        content += '(Configuration Summary) Tj\n';
        
        content += '/F1 10 Tf\n';
        content += '0 -18 Td\n';
        content += `(Base Network: ${baseNetwork}/${basePrefix}) Tj\n`;
        content += '0 -15 Td\n';
        content += `(Subnet Mask: ${subnetMask}) Tj\n`;
        content += '0 -15 Td\n';
        content += `(Network Class: ${networkClass}) Tj\n`;
        content += '0 -15 Td\n';
        content += `(Total Subnets: ${subnets.length}) Tj\n`;
        content += '0 -15 Td\n';
        content += `(Hosts per Subnet: ${subnets[0].usableHosts}) Tj\n`;
        
        content += '0 -30 Td\n';
        content += '/F1 12 Tf\n';
        content += '(Subnet Details) Tj\n';
        content += '/F1 9 Tf\n';
        
        // Add subnet data (limit to first 20 for PDF space)
        const displaySubnets = subnets.slice(0, 20);
        let yPos = 0;
        
        displaySubnets.forEach((subnet, index) => {
            yPos -= 15;
            if (yPos < -650) return; // Page boundary check
            
            content += `0 ${yPos} Td\n`;
            content += `(Subnet ${subnet.subnetNumber}: ${subnet.networkAddress} - ${subnet.broadcastAddress}) Tj\n`;
            yPos -= 12;
            content += `0 ${-12} Td\n`;
            content += `(  Usable: ${subnet.firstUsable} to ${subnet.lastUsable} \\(${subnet.usableHosts} hosts\\)) Tj\n`;
        });
        
        if (subnets.length > 20) {
            yPos -= 15;
            content += `0 ${yPos} Td\n`;
            content += `(... and ${subnets.length - 20} more subnets) Tj\n`;
        }
        
        content += 'ET\n'; // End text

        // Object 1: Catalog
        const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
        
        // Object 2: Pages
        const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
        
        // Object 3: Page
        const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n';
        
        // Object 4: Resources
        const obj4 = '4 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >>\nendobj\n';
        
        // Object 5: Content stream
        const contentLength = content.length;
        const obj5 = `5 0 obj\n<< /Length ${contentLength} >>\nstream\n${content}endstream\nendobj\n`;
        
        // Build complete PDF
        const startObj1 = pdf.length;
        pdf += obj1;
        
        const startObj2 = pdf.length;
        pdf += obj2;
        
        const startObj3 = pdf.length;
        pdf += obj3;
        
        const startObj4 = pdf.length;
        pdf += obj4;
        
        const startObj5 = pdf.length;
        pdf += obj5;
        
        // Cross-reference table
        const xrefStart = pdf.length;
        pdf += 'xref\n';
        pdf += '0 6\n';
        pdf += '0000000000 65535 f \n';
        pdf += padOffset(startObj1) + ' 00000 n \n';
        pdf += padOffset(startObj2) + ' 00000 n \n';
        pdf += padOffset(startObj3) + ' 00000 n \n';
        pdf += padOffset(startObj4) + ' 00000 n \n';
        pdf += padOffset(startObj5) + ' 00000 n \n';
        
        // Trailer
        pdf += 'trailer\n';
        pdf += '<< /Size 6 /Root 1 0 R >>\n';
        pdf += 'startxref\n';
        pdf += xrefStart + '\n';
        pdf += '%%EOF\n';
        
        return pdf;
    }

    /**
     * Pads offset number for PDF xref table
     * @param {number} offset - Byte offset
     * @returns {string} - Padded offset string
     */
    function padOffset(offset) {
        return offset.toString().padStart(10, '0');
    }

    /**
     * Triggers file download
     * @param {string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Generates a text report
     * @param {Object} summary - Calculation summary
     * @returns {string} - Text report
     */
    function generateTextReport(summary) {
        const { subnets, baseNetwork, basePrefix, effectivePrefix, subnetMask, networkClass } = summary;
        
        let report = '═══════════════════════════════════════════════════════\n';
        report += '    SUBNET TUTOR v2.0 - CALCULATION REPORT\n';
        report += '═══════════════════════════════════════════════════════\n\n';
        report += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        report += '─────────────────────────────────────────────────────── \n';
        report += '  CONFIGURATION SUMMARY\n';
        report += '─────────────────────────────────────────────────────── \n';
        report += `Base Network:      ${baseNetwork}/${basePrefix}\n`;
        report += `Subnet Mask:       ${subnetMask}\n`;
        report += `Effective Prefix:  /${effectivePrefix}\n`;
        report += `Network Class:     ${networkClass}\n`;
        report += `Total Subnets:     ${subnets.length}\n`;
        report += `Hosts per Subnet:  ${subnets[0].usableHosts}\n\n`;
        
        report += '─────────────────────────────────────────────────────── \n';
        report += '  SUBNET DETAILS\n';
        report += '─────────────────────────────────────────────────────── \n\n';
        
        subnets.forEach(subnet => {
            report += `Subnet ${subnet.subnetNumber}:\n`;
            report += `  Network:    ${subnet.networkAddress}\n`;
            report += `  Broadcast:  ${subnet.broadcastAddress}\n`;
            report += `  Usable:     ${subnet.firstUsable} - ${subnet.lastUsable}\n`;
            report += `  Hosts:      ${subnet.usableHosts}\n`;
            report += `  Mask:       ${subnet.subnetMask}\n\n`;
        });
        
        report += '═══════════════════════════════════════════════════════\n';
        report += '           End of Report\n';
        report += '═══════════════════════════════════════════════════════\n';
        
        return report;
    }

    /**
     * Copies results to clipboard
     * @param {Object} summary - Calculation summary
     */
    function copyToClipboard(summary) {
        const report = generateTextReport(summary);
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(report).then(() => {
                alert('Results copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                fallbackCopy(report);
            });
        } else {
            fallbackCopy(report);
        }
    }

    /**
     * Fallback clipboard copy method
     * @param {string} text - Text to copy
     */
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            alert('Results copied to clipboard!');
        } catch (err) {
            alert('Failed to copy to clipboard. Please copy manually.');
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textarea);
    }

    // Public API
    return {
        exportToCSV,
        exportToPDF,
        generateTextReport,
        copyToClipboard
    };
})();

// Make available globally
window.Exporter = Exporter;
