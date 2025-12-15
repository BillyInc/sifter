# Sifter 1.0

Automated project due diligence for crypto/web3 investments. Analyze any project by Twitter handle, Discord invite, Telegram link, GitHub repo, website URL, or project name.

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Single input analysis** - Enter any project identifier and get a comprehensive risk assessment
- **13 risk metrics** - Team identity, agency detection, community analysis, GitHub authenticity, and more
- **Composite scoring** - Weighted 0-100 score for easy ranking and filtering
- **Clear verdicts** - REJECT (≥75) or PROCEED (<75) with color-coded UI

## Metrics

| Metric | Weight | Description |
|--------|--------|-------------|
| Likely Agency | 15% | Signs of paid marketing agency involvement |
| Team Identity | 12% | Are team members doxxed with verifiable backgrounds? |
| Community Type | 12% | Organic vs botted/artificial community growth |
| Team Competence | 10% | Relevant experience and track record |
| Mercenary ratio | 10% | Percentage of community that are paid promoters |
| Mod overlap | 8% | Moderators shared with known rugged/scam projects |
| Recycled GitHub | 8% | Code originality and contributor authenticity |
| Tweet focus (30d) | 6% | Balance of product vs hype content |
| Mutual-follow deficit | 6% | Network reciprocity compared to organic baseline |
| Ghost admins | 5% | Hidden admin accounts with elevated permissions |
| Farming velocity spike | 4% | Sudden spikes in airdrop farming activity |
| Bot-like similarity | 4% | Pattern matching against known bot behaviors |

## Risk Tiers

| Score | Tier | Verdict |
|-------|------|---------|
| 0-30 | Low Risk | PROCEED |
| 31-50 | Moderate Risk | PROCEED |
| 51-74 | Elevated Risk | PROCEED (with caution) |
| 75-100 | High Risk | REJECT |

## Usage for VCs

1. **Batch screening** - Scan 100 projects, instantly filter to top performers
2. **Ranking survivors** - Sort passing projects by composite score
3. **Delegation** - Junior reviews 70+, senior reviews 60-70, partner sees 80+
4. **Justification** - "Selected top 5 by Sifter score, here's why Project C (81) looks strongest"

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── globals.css      # Global styles
│   └── page.tsx         # Main page
├── components/
│   ├── SearchInput.tsx  # Project input field
│   ├── LoadingState.tsx # Analysis progress UI
│   └── VerdictCard.tsx  # Results display
├── data/
│   ├── scoring.ts       # Weighted scoring system
│   └── placeholders.ts  # Demo data
└── types/
    └── index.ts         # TypeScript interfaces
```

## Demo

Click "View REJECT example" or "View PROCEED example" on the home page to see sample results without waiting for the loading animation.

## License

MIT
