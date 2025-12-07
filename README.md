# Subnet Tutor v2.0 - Advanced Subnetting Learning Tool

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Offline](https://img.shields.io/badge/offline-100%25-orange)

## 📡 Overview

**Subnet Tutor v2.0** is a fully offline, production-ready educational web application designed to teach subnetting concepts through interactive calculations, step-by-step explanations, and visual learning components. Perfect for networking students, IT professionals, and instructors.

### ✨ Key Features

- **100% Offline** - No internet connection required, no external dependencies
- **Dual Learning Modes** - Beginner mode with full explanations and Expert mode for quick calculations
- **Visual Learning** - Binary visualization, subnet tree diagrams, and address space maps
- **Dark/Light Themes** - Comfortable viewing in any environment
- **Export Capabilities** - Generate CSV and PDF reports without external libraries
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Educational Focus** - Step-by-step explanations with formulas and best practices

---

## 🚀 Quick Start

### Installation

1. **Download or clone** this repository to your local machine
2. **Navigate** to the project folder
3. **Open** `index.html` in any modern web browser

That's it! No installation, no dependencies, no build process required.

```bash
# Clone the repository (if using git)
git clone <repository-url>

# Navigate to the folder
cd "Subnetting Tutor Web App"

# Open in browser
# Windows:
start index.html
# macOS:
open index.html
# Linux:
xdg-open index.html
```

---

## 📁 Project Structure

```
Subnetting Tutor Web App/
│
├── index.html                 # Main HTML file
│
├── css/
│   └── style.css             # Complete styling with themes
│
├── js/
│   ├── app.js                # Main application controller
│   ├── subnet-engine.js      # Core calculation logic
│   ├── explanations.js       # Educational content generator
│   ├── visualizer.js         # Visual components (SVG)
│   └── exporter.js           # CSV/PDF export functionality
│
└── assets/
    └── (optional icons/fonts)
```

---

## 🎯 Features in Detail

### 1. Subnet Calculator

- **Input Parameters:**
  - Base IP Address (e.g., 192.168.1.0)
  - Base Prefix/CIDR (e.g., /24)
  - Optional: Split to New Prefix (e.g., /26)

- **Calculations:**
  - Number of subnets
  - Usable hosts per subnet
  - Network addresses
  - Broadcast addresses
  - Usable IP ranges
  - Subnet masks (dotted decimal and CIDR)

### 2. Learning Modes

#### Beginner Mode
- **Step-by-step explanations** covering:
  - Understanding network classes
  - Prefix length and subnet masks
  - Calculating number of subnets
  - Host formula (2^n - 2)
  - Network and broadcast addresses
  - Practical applications

- **Visual Components:**
  - Binary visualization with color-coded bits
  - Subnet tree structure diagram
  - Address space timeline map
  - Quick reference guide

#### Expert Mode
- Streamlined interface
- Results table only
- Fast calculations without explanations

### 3. Visual Learning Tools

#### Binary Visualization
- Shows IP addresses in both decimal and binary
- Color-coded network bits (blue) and host bits (orange)
- Side-by-side comparison of IP, mask, and network addresses

#### Subnet Tree View
- Hierarchical visualization of subnet splitting
- Shows parent-child relationships
- Interactive SVG rendering

#### Address Space Map
- Timeline view of subnet distribution
- Color-coded segments:
  - **Blue** - Network address
  - **Green** - Usable IP range
  - **Red** - Broadcast address

### 4. Export Functions

- **CSV Export** - Spreadsheet-compatible format with full subnet details
- **PDF Export** - Professional reports with summary and subnet information
- **Pure JavaScript** - No external libraries (jsPDF, etc.)
- **Offline Safe** - Works without internet connection

### 5. User Interface

- **Modern Design** - Clean, professional appearance
- **Dark/Light Themes** - Toggle with smooth transitions
- **Responsive Layout** - Optimized for all screen sizes
- **Tooltips** - Helpful hints on input fields
- **Keyboard Shortcuts:**
  - `Ctrl/Cmd + K` - Calculate
  - `Ctrl/Cmd + M` - Toggle mode
  - `Ctrl/Cmd + T` - Toggle theme
  - `Enter` - Calculate (when in input field)

---

## 🎓 Educational Content

### Concepts Covered

1. **IP Address Structure** - Octets, binary representation, address classes
2. **CIDR Notation** - Classless Inter-Domain Routing explained
3. **Subnet Masks** - How they work and why they matter
4. **Network vs Host Bits** - Understanding the division
5. **Special Addresses** - Network and broadcast addresses
6. **Usable Hosts Formula** - 2^n - 2 explained in detail
7. **Subnetting Process** - Step-by-step breakdown
8. **Best Practices** - Real-world application tips

### Learning Approach

- **Visual First** - See concepts in action
- **Progressive Disclosure** - Start simple, add complexity
- **Multiple Representations** - Decimal, binary, visual
- **Real Examples** - Practical scenarios and use cases
- **Interactive** - Learn by doing

---

## 🔧 Technical Details

### Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript (ES6+)** - No frameworks, no dependencies
- **SVG** - Scalable vector graphics for visualizations

### Browser Compatibility

- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Performance

- **Lightweight** - Fast load times (< 200KB total)
- **Efficient** - Optimized calculations
- **Responsive** - Smooth animations at 60 FPS
- **Scalable** - Handles hundreds of subnets

### Code Architecture

**Modular Design:**
- Each JavaScript file has a single responsibility
- Clean separation of concerns
- Reusable functions
- Documented code with JSDoc comments

**State Management:**
- Centralized application state
- LocalStorage for preferences
- No external state libraries needed

**Error Handling:**
- Input validation
- User-friendly error messages
- Graceful degradation

---

## 📖 Usage Examples

### Example 1: Single Network Analysis
```
Input:
- Base IP: 192.168.1.0
- Base Prefix: /24
- New Prefix: (leave empty)

Result:
- 1 network with 254 usable hosts
```

### Example 2: Splitting a /24 into /26
```
Input:
- Base IP: 192.168.1.0
- Base Prefix: /24
- New Prefix: /26

Result:
- 4 subnets, each with 62 usable hosts
- Subnet 1: 192.168.1.0/26
- Subnet 2: 192.168.1.64/26
- Subnet 3: 192.168.1.128/26
- Subnet 4: 192.168.1.192/26
```

### Example 3: Class B Network
```
Input:
- Base IP: 172.16.0.0
- Base Prefix: /16
- New Prefix: /24

Result:
- 256 subnets, each with 254 usable hosts
```

---

## 🎨 Customization

### Changing Colors

Edit `css/style.css` and modify the CSS variables in the `:root` selector:

```css
:root {
    --color-primary: #3b82f6;      /* Primary accent color */
    --color-network: #3b82f6;      /* Network address color */
    --color-broadcast: #ef4444;    /* Broadcast address color */
    --color-usable: #10b981;       /* Usable range color */
    /* ... more variables */
}
```

### Adding Features

The modular architecture makes it easy to extend:

1. **New calculations** → Add to `subnet-engine.js`
2. **New explanations** → Add to `explanations.js`
3. **New visualizations** → Add to `visualizer.js`
4. **New export formats** → Add to `exporter.js`

---

## 🐛 Troubleshooting

### Issue: Calculator not responding
**Solution:** Check browser console for errors. Ensure JavaScript is enabled.

### Issue: Visualizations not showing
**Solution:** Ensure you're in Beginner mode. Try clearing browser cache.

### Issue: Export not working
**Solution:** Some browsers may block downloads. Check browser settings for download permissions.

### Issue: Theme not persisting
**Solution:** LocalStorage must be enabled in browser settings.

---

## 📚 Learning Resources

### Recommended Reading
- RFC 1878 - Variable Length Subnet Table
- RFC 4632 - Classless Inter-domain Routing (CIDR)
- [Subnet Cheat Sheet](https://www.aelius.com/njh/subnet_sheet.html)

### Practice Tips
1. Start with /24 networks (most common)
2. Practice binary-to-decimal conversion
3. Memorize common subnet masks
4. Draw network diagrams
5. Use the tool to verify your manual calculations

---

## 🤝 Contributing

This is an educational project. Contributions are welcome!

### Ideas for Enhancements
- [ ] IPv6 support
- [ ] VLSM (Variable Length Subnet Masking) calculator
- [ ] Network troubleshooting scenarios
- [ ] Quiz/test mode
- [ ] Save/load configurations
- [ ] Additional languages

---

## 📄 License

MIT License - Free to use, modify, and distribute.

---

## 👨‍💻 Author

Created for IT 312 - Networking 2 course.

**Instructor:** Ammugauan, Felipe Jr Bautista  
**Institution:** [Your Institution]  
**Course:** Networking 2  
**Year:** 2025

---

## 🙏 Acknowledgments

- Built with modern web standards
- Inspired by real-world networking education needs
- No external dependencies used - pure vanilla implementation

---

## 📞 Support

For questions or issues related to this educational tool:
- Check the troubleshooting section above
- Review the code comments for implementation details
- Use browser developer tools for debugging

---

## 🔐 Privacy

**100% Private & Secure:**
- No data sent to any server
- No tracking or analytics
- No external API calls
- All calculations performed locally
- LocalStorage only used for user preferences

---

## ⚡ Quick Reference

### Common Subnet Masks
| CIDR | Subnet Mask       | Usable Hosts | Networks (from /24) |
|------|-------------------|--------------|---------------------|
| /24  | 255.255.255.0     | 254          | 1                   |
| /25  | 255.255.255.128   | 126          | 2                   |
| /26  | 255.255.255.192   | 62           | 4                   |
| /27  | 255.255.255.224   | 30           | 8                   |
| /28  | 255.255.255.240   | 14           | 16                  |
| /29  | 255.255.255.248   | 6            | 32                  |
| /30  | 255.255.255.252   | 2            | 64                  |

### Private IP Ranges
- **Class A:** 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
- **Class B:** 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
- **Class C:** 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)

---

**Made with ❤️ for networking students everywhere**

*Happy Subnetting! 🌐*
