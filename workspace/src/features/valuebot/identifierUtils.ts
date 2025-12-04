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

export function resolveIdentifiersFromModule0AndConfig({
  rawConfig,
  module0Output,
  fallbackTicker,
  fallbackCompanyName
}: {
  rawConfig?: any;
  module0Output?: any;
  fallbackTicker?: string;
  fallbackCompanyName?: string;
}) {
  const resolvedFromModule0 = resolveIdentifiers({ dataLoaderResult: module0Output, rawConfig });

  const ticker =
    resolvedFromModule0.effectiveTicker?.trim?.() ||
    rawConfig?.ticker?.trim?.() ||
    rawConfig?.company_name_ticker?.trim?.() ||
    fallbackTicker?.trim?.() ||
    '';

  const companyName =
    resolvedFromModule0.effectiveCompanyName?.trim?.() ||
    rawConfig?.companyName?.trim?.() ||
    rawConfig?.company_name?.trim?.() ||
    fallbackCompanyName?.trim?.() ||
    '';

  return { ticker, companyName };
}
