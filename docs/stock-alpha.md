# Stock Alpha Workflow

The Stock Alpha pipeline converts raw screening outputs into research-ready entries in Supabase. Follow the checklist below to keep the flow consistent and reproducible.

## End-to-End Steps

1. **Run the base screen** – Export your entire equity universe along with the accompanying price-warning fields. Immediately load those results into the workspace so nothing is missed during subsequent filters.
2. **Execute the free screen** – Generate the lightweight “free” pass to collapse the universe into a working table that is easy to scan and annotate.
3. **Prioritize the table** – Sort the table by the highest composite score and then by highest CAGR so the most compelling ideas float to the top.
4. **Apply quality checks** – Start the deep-quality review on the highest-scoring cohort. After finishing that tranche, continue working down the list in order of descending CAGR to keep momentum.
5. **Persist the review** – For every name you touch, rewrite the Supabase record using the `add_stock` function (or direct SQL) and stamp the `research_status` field with `researched Lv.1`.

## Implementation Notes

- Treat step 1 as the data-ingestion catchall: dump the entire universe and all price-warning signals into the staging area before narrowing anything down.
- When persisting results, issue the Supabase request immediately so you do not lose context between the free screen and the quality review. That same call can capture ad-hoc notes or tags (e.g., strategy theme) if needed.
- Use filtering in the workspace UI (or Supabase SQL) to zero in on specific tickers after the quality review. When in doubt, re-run the free screen and filter by name to confirm nothing was skipped.
- If additional metadata is required, prompt the Supabase edge function (or your chosen integration) with the ticker to fetch supplementary details before finalizing the `researched Lv.1` stamp.
