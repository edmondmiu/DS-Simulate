# Designer Quick Reference Card - Epic 4 MVP

**🎯 Ready-to-Use Design System | Epic 4 Complete**

---

## 🚀 5-Minute Setup

### **1. Token Studio Connection**
```
URL: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json
Expected: 662 tokens across 5 sets
Load Time: 30-60 seconds
```

### **2. Available Themes**
- **Base Dark** → Generic dark interface
- **Base Light** → Generic light interface  
- **Bet9ja Dark** → Bet9ja brand dark mode
- **Bet9ja Light** → Bet9ja brand light mode

### **3. Quick Validation**
✅ 662 total tokens loaded  
✅ 5 token sets visible  
✅ 4 themes available  
✅ File size ~142KB  

---

## 🎨 Epic 4 Key Features

### **OKLCH Color Science**
- Perceptually uniform color progressions
- Enhanced accessibility compliance (WCAG AA)
- Superior color harmony across palettes
- Scientifically optimized brand variations

### **Multi-Brand Architecture**  
- Base themes for generic interfaces
- Brand themes for client-specific work
- Perfect light/dark mode support
- Zero workflow disruption from Token Studio

### **Enhanced Token System**
- 662 carefully crafted design tokens
- Complete typography hierarchy
- Comprehensive spacing system
- Advanced color ramp generation

---

## 🔧 Essential Token Patterns

### **Colors**
```
{core.Color Ramp.Amber.Amber 0500}     → Foundation colors
{global.primary.500}                   → Semantic colors  
{bet9ja dark.brand.Primary.400}        → Brand colors
```

### **Typography**  
```
{Content Typography.header.h1}         → Main headings
{Content Typography.body.default}      → Body text
{Content Typography.label.default}     → Form labels
```

### **Spacing**
```
{global.spacing.xs}   → 8px
{global.spacing.md}   → 16px  
{global.spacing.xl}   → 32px
{global.spacing.2xl}  → 48px
```

---

## 🎯 Theme Selection Guide

### **When to Use Base Themes**
- ✅ Prototyping and initial design work
- ✅ Generic interface components
- ✅ Cross-client reusable patterns
- ✅ Design system documentation

### **When to Use Brand Themes**
- ✅ Client-specific project work
- ✅ Branded interface elements
- ✅ Marketing and promotional designs
- ✅ Final production implementations

---

## ⚡ Quick Actions

### **Import Tokens**
1. Open Token Studio → Settings
2. Select GitHub source
3. Paste: `https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json`
4. Click "Save" → "Update"

### **Switch Themes**
1. Token Studio → Themes tab
2. Select desired theme
3. Click "Apply theme"
4. Verify token values update

### **Apply Tokens**
1. Select design element
2. Choose property (fill, text, etc.)
3. Click token in Token Studio
4. Token reference applies automatically

---

## 🚨 Common Issues & Quick Fixes

### **Tokens Won't Load**
- ✅ Check internet connection
- ✅ Verify exact URL (no typos)
- ✅ Wait full 60 seconds for 662 token import
- ✅ Try "Force refresh" in settings

### **Theme Not Switching**
- ✅ Ensure elements use token references (not direct values)
- ✅ Re-apply theme after switching  
- ✅ Check token set configuration for theme
- ✅ Clear Token Studio cache if needed

### **Performance Issues**
- ✅ Use Figma desktop app vs browser
- ✅ Close unnecessary tabs/files
- ✅ Enable only required token sets
- ✅ Clear cache periodically

---

## 🎪 Epic 4 Testing Checklist

### **Quick Validation Test**
- [ ] 662 tokens imported successfully
- [ ] All 4 themes switch correctly  
- [ ] Color progressions appear smooth (OKLCH)
- [ ] Accessibility improved (check contrast)
- [ ] No broken token references
- [ ] Performance remains responsive

### **Ready for Production?**
- [ ] All team members can connect successfully
- [ ] Themes work for intended use cases
- [ ] Token Studio integration stable  
- [ ] Design handoffs include correct tokens
- [ ] Backup/recovery procedures understood

---

## 📞 Support Resources

### **Documentation**
- **Full Testing Guide:** `docs/DESIGNER_MVP_TESTING_GUIDE.md`
- **Complete Setup:** `docs/DESIGNER_SETUP.md`  
- **Technical Details:** `docs/ARCHITECTURE.md`
- **GitHub Repository:** `https://github.com/edmondmiu/DS-Simulate`

### **Getting Help**
- **DSE Team:** Token requests and system issues
- **GitHub Issues:** Technical problems and bugs
- **Token Studio:** Plugin-specific questions
- **Team Slack:** Quick questions and coordination

---

## 🏆 Epic 4 Success Metrics

**System Performance:**
- ✅ 662 tokens load in <60 seconds
- ✅ Theme switching in <1 second  
- ✅ Zero broken references across themes
- ✅ WCAG AA accessibility compliance  

**Designer Experience:**
- ✅ Seamless Token Studio integration
- ✅ Zero workflow disruption
- ✅ Enhanced color quality via OKLCH
- ✅ Consistent multi-brand theming

---

**Epic 4 Status: ✅ READY FOR DESIGNER TESTING**

**Quick Start → Import → Test → Design → Ship** 🚀