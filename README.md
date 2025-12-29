# SIFTER 1.0

**Automated Due Diligence for Web3 Projects**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## Overview

SIFTER is an automated due diligence platform designed to help investors, venture capital firms, and researchers evaluate the legitimacy and risk profile of cryptocurrency and Web3 projects. By analyzing multiple data sources across team credentials, community behavior, technical implementation, and tokenomics, SIFTER provides a comprehensive risk assessment score to streamline investment decisions.

### The Problem

The Web3 ecosystem faces a significant trust problem. With thousands of new projects launching monthly, distinguishing legitimate ventures from potential scams or poorly-executed projects is increasingly difficult. Traditional due diligence methods are time-consuming, inconsistent, and often miss subtle red flags that indicate project risk.

### Our Solution

SIFTER automates the due diligence process by:

- **Aggregating signals** from Twitter, Discord, Telegram, GitHub, and project websites
- **Analyzing 13 weighted risk metrics** across 6 categories
- **Generating a composite risk score** (0-100) with clear PROCEED/REJECT verdicts
- **Providing detailed breakdowns** of each metric for transparent decision-making

---

## Features

### Single-Input Analysis
Enter any project identifier—Twitter handle, Discord invite, Telegram link, GitHub repo, website URL, or project name—and receive a comprehensive risk assessment.

### Multi-Stakeholder Dashboards
- **VC Dashboard**: Batch screening, portfolio monitoring, deal flow management
- **Researcher Dashboard**: Deep-dive analysis tools, data export, historical tracking
- **Individual Dashboard**: Personal watchlists, alerts, simplified verdicts

### Real-Time Monitoring
Continuous monitoring of analyzed projects with alerts for significant score changes or new red flags.

### Batch Processing
Screen hundreds of projects simultaneously, instantly filtering to top performers for efficient deal flow management.

---

## Risk Metrics

SIFTER evaluates projects across **13 weighted metrics** organized into **6 categories**:

### Team Legitimacy (24%)

| # | Metric | Weight | Description |
|---|--------|--------|-------------|
| 1 | **Team Identity** | 13% | Level of doxxing, real name usage, and public reputation exposure. Measures whether team members have verifiable identities and professional backgrounds. |
| 2 | **Team Competence** | 11% | Prior successful projects, relevant domain experience, and delivery track record. Evaluates the team's ability to execute on their roadmap. |

### Marketing Authenticity (40%)

| # | Metric | Weight | Description |
|---|--------|--------|-------------|
| 3 | **Contaminated Network** | 19% | Connections to verified bad actors in our proprietary database. Identifies relationships with known scammers, rug-pullers, or fraudulent projects. |
| 4 | **Mercenary Keywords** | 9% | Prevalence of financial urgency and hype terms in community discourse. Detects language patterns commonly associated with pump-and-dump schemes. |
| 7 | **Tweet Focus** | 7% | Balance between project updates vs. personal/promotional content. Analyzes whether communication is substance-focused or hype-driven. |
| 10 | **Artificial Hype Campaigns** | 5% | Detection of coordinated posting bursts and anomalous engagement patterns. Identifies paid promotion campaigns and artificial virality. |

### Community Health (10%)

| # | Metric | Weight | Description |
|---|--------|--------|-------------|
| 5 | **Entropy - Message Times** | 5% | Uniformity of message timestamp distribution. Detects bot activity through unnatural posting patterns. |
| 6 | **Entropy - Account Ages** | 5% | Natural vs. sudden spikes in account creation dates. Identifies coordinated fake account creation. |

### Technical Reality (12%)

| # | Metric | Weight | Description |
|---|--------|--------|-------------|
| 8 | **GitHub Authenticity** | 10% | Commit patterns, authorship distribution, recency, and code quality. Verifies genuine development activity vs. copied or fabricated repositories. |
| 9 | **Bus Factor** | 2% | Dependency on individual contributors. Measures development centralization risk. |

### Behavioral Signals (16%)

| # | Metric | Weight | Description |
|---|--------|--------|-------------|
| 11 | **Founder Distraction** | 6% | Founder public activity analysis: building vs. self-promotion ratio. Identifies founders more focused on personal brand than product development. |
| 12 | **Engagement Authenticity** | 10% | Ratio of substantive vs. mercenary/financial content in community interactions. Measures genuine community interest vs. profit-seekers. |

### Economic Fundamentals (7%)

| # | Metric | Weight | Description |
|---|--------|--------|-------------|
| 13 | **Tokenomics Red Flags** | 7% | Allocation fairness, vesting schedules, concentration risks, and dump potential. Identifies economic structures that enable insider enrichment. |

---

## Risk Scoring

### Composite Score Calculation

Each metric produces a risk signal (0-100), which is multiplied by its category weight to produce a weighted contribution. The sum of all weighted contributions yields the **Composite Risk Score**.

```
Composite Score = Σ (Metric Score × Metric Weight)
```

### Verdict Tiers

| Score Range | Risk Tier | Verdict | Recommendation |
|-------------|-----------|---------|----------------|
| 0-30 | Low Risk | **PROCEED** | Strong fundamentals, suitable for deep due diligence |
| 31-50 | Moderate Risk | **PROCEED** | Generally healthy, verify flagged metrics |
| 51-74 | Elevated Risk | **PROCEED** | Exercise caution, significant concerns present |
| 75-100 | High Risk | **REJECT** | Multiple red flags, not recommended for investment |

---

## Use Cases

### Venture Capital Firms

1. **Batch Screening**: Scan 100+ projects, instantly filter to top performers
2. **Survivor Ranking**: Sort passing projects by composite score for prioritization
3. **Team Delegation**:
   - Junior analysts: Review scores 70+
   - Senior analysts: Review scores 60-70
   - Partners: Immediate attention for 80+
4. **Investment Justification**: "Selected top 5 by SIFTER score—here's why Project C (81) is our strongest candidate"

### Research Analysts

- Deep-dive analysis with full metric breakdowns
- Historical tracking and trend analysis
- Data export for external reporting
- Comparative analysis across project cohorts

### Individual Investors

- Quick risk assessment before participation
- Watchlist monitoring with alert notifications
- Simplified pass/fail verdicts for non-technical users

---

## Technical Architecture

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **API Integration**: REST + WebSocket for real-time updates

### Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/        # Multi-stakeholder dashboards
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── page.tsx          # Landing page
├── components/
│   ├── SearchInput.tsx   # Project input field
│   ├── LoadingState.tsx  # Analysis progress UI
│   ├── VerdictCard.tsx   # Results display
│   ├── EABatchDashboard.tsx    # EA batch analysis
│   └── ResearcherDashboard.tsx # Researcher tools
├── data/
│   ├── scoring.ts        # Weighted scoring system
│   └── placeholders.ts   # Demo data
├── lib/
│   └── auth.ts           # Authentication utilities
└── types/
    └── index.ts          # TypeScript interfaces
```

---

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/sifter.git
cd sifter

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm prisma migrate dev

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Demo Mode

Click "View REJECT example" or "View PROCEED example" on the home page to see sample results without running a live analysis.

---

## API Reference

### Analyze Project

```
POST /api/analyze
```

**Request Body:**
```json
{
  "identifier": "@projecthandle",
  "type": "twitter"
}
```

**Response:**
```json
{
  "projectName": "Example Project",
  "compositeScore": 42,
  "verdict": "PROCEED",
  "metrics": [
    {
      "name": "Team Identity",
      "score": 35,
      "weight": 0.13,
      "category": "Team Legitimacy"
    }
  ]
}
```

---

## Roadmap

- [ ] Enhanced API integrations (on-chain data, DEX analytics)
- [ ] Machine learning model for pattern recognition
- [ ] Browser extension for inline project scoring
- [ ] Mobile application
- [ ] Historical score tracking and trend analysis
- [ ] Integration with portfolio management tools

---

## Contributing

We welcome contributions from the community. Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

- **Documentation**: [docs.sifter.io](https://docs.sifter.io)
- **Issues**: [GitHub Issues](https://github.com/your-org/sifter/issues)
- **Email**: support@sifter.io

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 SIFTER

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**SIFTER** — *Separating Signal from Noise in Web3*
