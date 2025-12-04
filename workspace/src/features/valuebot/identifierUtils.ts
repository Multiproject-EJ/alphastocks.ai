export function resolveIdentifiers({ dataLoaderResult, rawConfig }: { dataLoaderResult?: any; rawConfig?: any }) {
  const snap =
    dataLoaderResult?.company_snapshot ||
    dataLoaderResult?.data?.company_snapshot ||
    dataLoaderResult?.result?.company_snapshot ||
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
