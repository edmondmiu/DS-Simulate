# Designer Setup Guide

Complete guide for connecting to the design system using Figma Token Studio plugin.

## 🚀 Quick Start (5 Minutes)

**Prerequisites:** Figma account with Token Studio plugin access

1. **Install Plugin:** Add "Token Studio" from Figma Community
2. **Connect Repository:** Use GitHub URL: `https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json`
3. **Import Tokens:** Click "Update" to load 662 design tokens
4. **Select Theme:** Choose from 4 available themes (Base Dark, Base Light, Bet9ja Dark, Bet9ja Light)
5. **Start Designing:** Apply tokens to your design elements

**Expected Result:** 662 tokens loaded across 5 token sets, ready for use in your designs.

---

## 📋 Table of Contents

1. [Token Studio Plugin Setup](#-token-studio-plugin-setup)
2. [Repository Connection](#-repository-connection)
3. [Theme Configuration](#-theme-configuration)
4. [Token Application](#-token-application)
5. [Troubleshooting](#-troubleshooting)
6. [Workflow Best Practices](#-workflow-best-practices)
7. [FAQ](#-frequently-asked-questions)

---

## 🔧 Token Studio Plugin Setup

### Step 1: Install Token Studio Plugin

1. **Open Figma** in your browser or desktop app
2. **Navigate to Community:** Click "Community" in the left sidebar
3. **Search for Token Studio:** Type "Token Studio" in the search bar
4. **Install Plugin:** Click "Install" on the official Token Studio plugin
5. **Verify Installation:** Check that Token Studio appears in your plugins menu

### Step 2: Launch Token Studio

1. **Open a Figma File** (existing or new)
2. **Access Plugins:** Right-click → Plugins → Token Studio
3. **Alternative Access:** Menu → Plugins → Development → Token Studio
4. **Plugin Interface:** The Token Studio panel should open on the right side

### Step 3: Initial Configuration

1. **First Launch:** Token Studio will show setup options
2. **Choose Source:** Select "GitHub" as your token source
3. **Skip Local Setup:** We'll connect directly to the remote repository

---

## 🔗 Repository Connection

### Step 1: Configure GitHub Source

1. **Open Token Studio Settings:** Click the settings (gear) icon in Token Studio
2. **Select GitHub:** Choose "GitHub" from the source type dropdown
3. **Repository URL:** Enter the exact URL:
   ```
   https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json
   ```

### Step 2: Test Connection

1. **Save Configuration:** Click "Save" in Token Studio settings
2. **Update Tokens:** Click the "Update" button to test connection
3. **Verify Loading:** You should see a loading indicator
4. **Success Confirmation:** Token Studio will display "Tokens updated successfully"

### Step 3: Validate Token Import

**Expected Results:**
- **Token Sets:** 5 sets loaded (core, global, components, bet9ja dark, Content Typography)
- **Total Tokens:** 662 tokens imported
- **File Size:** ~142,832 bytes processed
- **Import Time:** 30-60 seconds for initial load

**Verify in Token Studio:**
- Navigate to "Token Sets" tab
- Confirm all 5 token sets are visible
- Check that token counts match expected values

---

## 🎨 Theme Configuration

### Available Themes

The design system provides 4 pre-configured themes:

#### 1. Base Dark (Recommended Default)
- **Description:** Generic dark mode interface
- **Token Sets:** core (source) + global (enabled) + components (enabled)
- **Use Case:** Default interface, works with any brand
- **Best For:** Initial design work, prototyping

#### 2. Base Light
- **Description:** Generic light mode interface  
- **Token Sets:** core (source) + global (enabled) + global light (enabled) + components (enabled)
- **Use Case:** Light mode variant of base theme
- **Best For:** Light mode designs, accessibility testing

#### 3. Bet9ja Dark
- **Description:** Bet9ja brand dark mode
- **Token Sets:** core (source) + global (enabled) + components (enabled) + bet9ja dark (enabled)
- **Use Case:** Bet9ja-specific designs with brand colors
- **Best For:** Client-specific work, branded interfaces

#### 4. Bet9ja Light
- **Description:** Bet9ja brand light mode
- **Token Sets:** core (source) + global (enabled) + global light (enabled) + components (enabled) + bet9ja light (enabled)
- **Use Case:** Light mode with Bet9ja branding
- **Best For:** Light mode branded designs

### Selecting and Applying Themes

1. **Access Themes:** Click "Themes" tab in Token Studio
2. **Browse Themes:** View available themes with descriptions
3. **Select Theme:** Click on desired theme (e.g., "Base Dark")
4. **Apply Theme:** Click "Apply theme" button
5. **Verify Application:** Check that token values update in your designs

### Switching Between Themes

1. **Easy Switching:** Themes can be changed at any time
2. **Design Update:** All token-based elements update automatically
3. **Compare Themes:** Use multiple Figma pages to compare theme variations
4. **Brand Consistency:** Use appropriate theme for your client/project

---

## 🎯 Token Application

### Understanding Token Types

The design system provides several token categories:

#### Color Tokens
```
{core.Color Ramp.Amber.Amber 0500} - Foundation colors
{global.primary.500} - Semantic colors
{bet9ja dark.brand.Primary.400} - Brand-specific colors
```

#### Typography Tokens
```
{Content Typography.header.h1} - Main headings
{Content Typography.body.default} - Paragraph text
{Content Typography.label.default} - Form labels
```

#### Spacing Tokens
```
{global.spacing.md} - Medium spacing (16px)
{global.spacing.xl} - Large spacing (32px)
{global.spacing.2xs} - Micro spacing (4px)
```

### Applying Tokens to Design Elements

#### Method 1: Direct Token Application
1. **Select Element:** Click on shape, text, or component
2. **Choose Property:** Select fill, stroke, text properties, etc.
3. **Apply Token:** In Token Studio, click token to apply to selected property

#### Method 2: Token Picker
1. **Open Token Picker:** Click token picker icon in Figma properties panel
2. **Browse Tokens:** Navigate through token categories
3. **Select Token:** Click desired token to apply

#### Method 3: Search and Apply
1. **Search Tokens:** Use Token Studio search to find specific tokens
2. **Preview Values:** Hover to see token values and descriptions
3. **Apply:** Click token while element is selected

### Best Practices for Token Application

#### Colors
- **Use Semantic Tokens:** Prefer `{global.primary.500}` over `{core.Color Ramp.Amber.Amber 0500}`
- **Brand Consistency:** Use brand-specific tokens for client work
- **Accessibility:** Choose high contrast token combinations

#### Typography
- **Hierarchy:** Use header tokens (h1, h2, h3) for proper text hierarchy
- **Consistency:** Stick to defined typography tokens instead of custom values
- **Readability:** Consider line height and spacing tokens for optimal readability

#### Spacing
- **System Consistency:** Use spacing tokens instead of arbitrary pixel values
- **Responsive Design:** Choose appropriate spacing tokens for different screen sizes
- **Component Spacing:** Use consistent spacing within and between components

---

## 🛠 Troubleshooting

### Common Issues and Solutions

#### 1. Plugin Won't Connect to Repository

**Symptoms:**
- "Connection failed" error message
- Token Studio shows "Unable to fetch tokens"
- Empty token list despite correct URL

**Solutions:**
```
✅ Verify internet connection
✅ Check repository URL is exact: https://raw.githubusercontent.com/edmondmiu/DS-Simulate/main/tokensource.json
✅ Test URL in browser (should display JSON content)
✅ Try "Force refresh" in Token Studio settings
✅ Clear Token Studio cache and reconnect
```

#### 2. Tokens Not Loading or Incomplete

**Symptoms:**
- Some token sets missing from Token Studio
- Token count lower than expected (should be 662)
- "Loading..." state that doesn't complete

**Solutions:**
```
✅ Wait for full import (can take 30-60 seconds for 662 tokens)
✅ Check network stability during import
✅ Verify file size in browser: should be ~142,832 bytes
✅ Try importing during off-peak hours
✅ Close and reopen Token Studio plugin
```

#### 3. Theme Switching Not Working

**Symptoms:**
- Themes don't change design elements
- Token values remain the same after theme switch
- Missing theme options in Token Studio

**Solutions:**
```
✅ Ensure design elements use token references (not hardcoded values)
✅ Check that token sets are enabled correctly for selected theme
✅ Verify themes are properly loaded in Token Studio themes tab
✅ Re-apply theme after switching
✅ Check if custom overrides are blocking theme changes
```

#### 4. Token References Broken

**Symptoms:**
- Tokens show as "missing" or "undefined"
- Design elements revert to default values
- Token Studio shows reference errors

**Solutions:**
```
✅ Check if referenced token exists in current theme
✅ Verify token set containing referenced token is enabled
✅ Look for typos in token names or paths
✅ Update to latest tokensource.json version
✅ Clear Token Studio cache and re-import
```

#### 5. Performance Issues

**Symptoms:**
- Token Studio is slow to respond
- Figma becomes sluggish during token operations
- Long loading times for token updates

**Solutions:**
```
✅ Close unnecessary browser tabs/applications
✅ Use Figma desktop app instead of browser version
✅ Import tokens in smaller batches if possible
✅ Limit number of concurrent Figma files with tokens
✅ Consider using fewer token sets simultaneously
```

### Advanced Troubleshooting

#### Verify Token Source Data
1. **Direct URL Test:** Open token URL in browser tab
2. **JSON Validation:** Confirm JSON displays properly (should be ~142,832 bytes)
3. **Content Check:** Verify token sets are present: core, global, components, bet9ja dark, Content Typography

#### Plugin Reset Procedure
1. **Clear Cache:** Token Studio settings → Clear cache
2. **Disconnect:** Remove GitHub connection in settings
3. **Restart Figma:** Close and reopen Figma application
4. **Reconnect:** Add GitHub URL again and re-import tokens

#### Network Diagnostics
1. **Connection Test:** Verify stable internet connection
2. **Firewall Check:** Ensure corporate firewall isn't blocking raw.githubusercontent.com
3. **DNS Test:** Try accessing GitHub directly to rule out DNS issues

---

## 📋 Workflow Best Practices

### Designer-DSE Collaboration

#### Communication Workflow
1. **Token Requests:** Submit token requests through established channels
2. **Change Notifications:** DSE will notify when tokens are updated  
3. **Sync Schedule:** Check for token updates daily or after notifications
4. **Feedback Loop:** Provide feedback on token usage and design needs

#### Design System Maintenance
1. **Regular Updates:** Keep Token Studio plugin updated to latest version
2. **Token Hygiene:** Regularly audit designs for proper token usage
3. **Consistency Checks:** Use design system guidelines for token selection
4. **Documentation:** Document any custom token applications or exceptions

### Multi-Brand Design Workflow

#### Brand Setup
1. **Project Setup:** Choose appropriate theme before starting design work
2. **Brand Consistency:** Stick to brand-specific tokens throughout project
3. **Theme Testing:** Test designs in both light and dark themes
4. **Cross-Brand Review:** Ensure generic components work across all brands

#### Collaboration Best Practices
1. **Theme Documentation:** Document which theme was used for each design
2. **Handoff Notes:** Include theme information in developer handoffs
3. **Version Control:** Keep track of which token version was used
4. **Review Process:** Include token compliance in design reviews

### Performance Optimization

#### File Organization
1. **Token Usage:** Use tokens consistently across all design elements
2. **Component Design:** Create reusable components with proper token application
3. **File Structure:** Organize Figma files to minimize token loading overhead
4. **Asset Management:** Use shared libraries for token-based components

#### Collaboration Efficiency
1. **Shared Libraries:** Create and maintain shared component libraries
2. **Template Files:** Use template files with pre-configured token themes
3. **Team Training:** Ensure all team members understand token system
4. **Review Checklists:** Include token compliance in design review checklists

---

## ❓ Frequently Asked Questions

### General Questions

**Q: How often are tokens updated?**
A: Tokens are updated automatically within 2-5 minutes after DSE makes changes. You'll receive notifications when updates are available.

**Q: Can I use the system offline?**
A: No, Token Studio requires internet connection to sync with GitHub repository. However, once tokens are loaded, you can work offline until next sync.

**Q: How many tokens are available?**
A: The system currently provides 662 design tokens across 5 token sets, with support for unlimited future expansion.

### Technical Questions

**Q: What happens if I lose internet connection during token import?**
A: Token import will fail if connection is lost. Simply retry the import once connection is restored.

**Q: Can I modify tokens locally?**
A: Tokens should not be modified locally. Submit requests to the DSE team for token changes through established workflows.

**Q: How do I know which theme to use for my project?**
A: Use Base Dark/Light for generic projects, and brand-specific themes (e.g., Bet9ja) for client work.

### Troubleshooting Questions

**Q: Token Studio shows "outdated tokens" warning - what should I do?**
A: Click "Update" in Token Studio to sync with the latest token version from GitHub.

**Q: My designs broke after a token update - how do I fix this?**
A: Check if token names changed or if your theme configuration needs updating. Contact DSE team if issues persist.

**Q: Can I roll back to a previous token version?**
A: Contact the DSE team for rollback requests. They can provide specific version URLs if needed.

### Workflow Questions

**Q: How do I request new tokens or modifications?**
A: Submit token requests through your team's established process (Slack, Jira, etc.). Include specific use cases and examples.

**Q: Should I create custom color values or always use tokens?**
A: Always use design tokens when possible. Only use custom values for one-off cases, and consider requesting new tokens for reusable needs.

**Q: How do I handle designs that need tokens not yet available?**
A: Use the closest available token as a placeholder and submit a request for the needed token. Document the placeholder usage for developer handoff.

---

## 🔗 Additional Resources

### Documentation Links
- **GitHub Repository:** https://github.com/edmondmiu/DS-Simulate
- **Token Studio Plugin:** Available in Figma Community
- **Technical Integration Guide:** `TOKEN_STUDIO_INTEGRATION.md`
- **Developer Documentation:** `README.md`

### Support Contacts
- **Design System Engineer:** Contact via team channels for token requests
- **Technical Issues:** Use GitHub Issues for technical problems
- **Plugin Support:** Token Studio official documentation and community

### Validation Tools
- **Token Validation:** DSE team can run validation scripts to verify system health
- **Integration Testing:** Regular testing ensures Token Studio compatibility
- **Performance Monitoring:** System performance is monitored and optimized

---

**Setup Complete! 🎉**

You're now ready to use the design system with Figma Token Studio. Remember to:
- Keep Token Studio plugin updated
- Sync tokens regularly (especially after notifications)
- Use appropriate themes for your projects  
- Follow design system best practices
- Contact DSE team for support and token requests

**Last Updated:** August 2025 | **Version:** Epic 2 Complete | **Tokens:** 662 across 5 sets