# Design System Engineering

**Epic 4 V2 Complete** - Two-repository OKLCH color optimization

## Architecture

**DS-SimulateV2** - Token Studio integration  
**DS-Simulate** - DSE development environment (this repo)

## Status

✅ 25 OKLCH-optimized color families  
✅ Multi-brand support (Base, Logifuture, Bet9ja)  
✅ Token Studio direct file integration  
✅ WCAG AA+ accessibility compliance  

## Token Studio Setup

1. Install Token Studio plugin in Figma
2. Connect to: `https://github.com/edmondmiu/DS-SimulateV2`
3. Use direct file integration
4. Import 25 color families from tokens/ directory

## Development

```bash
npm install
npm run build
npm run lint
```

**Two-repo workflow:**
1. Pull tokens from DS-SimulateV2 when needed
2. Process/develop in DS-Simulate
3. Push results back to DS-SimulateV2 for designers