export function resolveIdentifiersFromModule0(module0Result, rawConfig) {
  const snap =
    module0Result?.company_snapshot ||
    module0Result?.data?.company_snapshot ||
    module0Result?.result?.company_snapshot ||
    {};

  const effectiveTicker =
    snap.ticker?.trim?.() ||
    rawConfig?.ticker?.trim?.() ||
    rawConfig?.company_name_ticker?.trim?.() ||
    rawConfig?.companyName?.trim?.() ||
    '';

  const effectiveCompanyName =
    snap.company_name?.trim?.() ||
    rawConfig?.companyName?.trim?.() ||
    rawConfig?.company_name?.trim?.() ||
    rawConfig?.ticker_label?.trim?.() ||
    '';

  return { effectiveTicker, effectiveCompanyName };
}
