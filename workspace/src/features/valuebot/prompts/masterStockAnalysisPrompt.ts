/**
 * MASTER Stock Analysis instructions for Module 6 — Final Verdict Synthesizer.
 *
 * This helper exports a single instructions string so the prompt can be tweaked
 * or reused without editing the module component. It defines the table layout,
 * narrative headings, and the standardized 1–10 scale semantics expected in the
 * output.
 */
export const MASTER_STOCK_ANALYSIS_INSTRUCTIONS = `
MASTER STOCK ANALYSIS — OUTPUT FORMAT (GitHub-Flavored Markdown)

You must produce valid markdown. Always begin with the four single-row tables (A–D), then follow with the narrative headings in order.

A) One-Liner Summary
| Ticker | Risk | Quality | Timing | Composite Score (/10) |
| --- | --- | --- | --- | --- |

B) Final Verdicts — One Line
| Risk | Quality | Timing |
| --- | --- | --- |

C) Standardized Scorecard — One Line
| Debt & Balance Sheet Risk (/10) | Cash Flow Strength (/10) | Margins & Profitability (/10) | Competition & Moat (/10) | Timing & Momentum (/10) | Composite (/10) |
| --- | --- | --- | --- | --- | --- |

D) Valuation Ranges — One Line (use XX–YY ranges in the configured currency)
| Bear | Base | Bull |
| --- | --- | --- |

Narrative sections that MUST follow after the tables:
0. Current Price & Big Picture
1. Downside & Risk Analysis
2. Business Model & Growth Opportunities
3. Scenario Analysis (5–15 Years)
   - Include an internal table: | Scenario | Revenue CAGR | Margin Outlook | Free Cash Flow | Key Risks | 5Y Valuation Range | 15Y Valuation Range |
4. Valuation Analysis
5. Timing & Market Momentum
6. Final Conclusions

Scoring scale (use both number and label):
- 10: World Class
- 9: Excellent
- 8: Very Strong
- 7: Strong
- 6: Good
- 5: Average
- 4: Weak
- 3: Poor
- 2: Very Poor
- 1: Horrific

Formatting rules:
- Tables first, then clearly labeled headings 0–6 with concise paragraphs.
- Keep synthesis crisp; do not paste large sections from the sources.
- If source material is missing, proceed but explicitly note the uncertainty.

After you have finished the full markdown report, output a final fenced code block labeled json that contains only this object and nothing else:

\`\`\`json
{
  "risk_label": "<Low | Medium | High>",
  "quality_label": "<World Class | Excellent | Very Strong | Strong | Good | Average | Weak | Poor | Very Poor | Horrific>",
  "timing_label": "<Buy | Hold | Wait | Avoid>",
  "composite_score": X.X
}
\`\`\`

Do not include any extra keys, comments, or prose in this JSON block. Place this JSON block at the very end of the response.
`;
