/**
 * Example Usage: Stock Analysis Report Component
 * 
 * This file demonstrates how to integrate the StockAnalysisReport component
 * into your application. You can use this as a reference for implementation.
 */

import { useState } from 'preact/hooks';
import StockAnalysisReport from './StockAnalysisReport.jsx';

/**
 * Example 1: Basic Usage with Demo Data
 */
export function BasicExample() {
  const [reportOpen, setReportOpen] = useState(false);
  
  const analysisData = {
    symbol: 'NVDA',
    label: 'Investable',
    summary: 'Remain overweight as demand visibility stays strong; trim only if supply normalises faster than expected.',
    valuation: {
      base: 980,
      bull: 1120,
      bear: 780
    },
    porter_forces: {
      supplier_power: 'Medium — key foundries concentrated but long-term agreements in place.',
      buyer_power: 'Low — hyperscalers scrambling for GPU capacity.',
      competitive_rivalry: 'Rising — AMD catching up but still lagging in software moat.',
      threat_new: 'Low — capex intensity and ecosystem lock-in deter entrants.',
      threat_substitutes: 'Medium — custom ASICs for specific workloads remain a watchpoint.'
    },
    stress_tests: [
      { scenario: 'Cloud capex pause', delta: -0.18 },
      { scenario: 'China export tightening', delta: -0.12 }
    ],
    analyzed_at: '2024-12-15T10:30:00Z'
  };

  return (
    <div>
      <button 
        className="btn-primary"
        onClick={() => setReportOpen(true)}
      >
        View NVDA Analysis
      </button>
      
      <StockAnalysisReport
        open={reportOpen}
        onOpenChange={setReportOpen}
        analysisData={analysisData}
      />
    </div>
  );
}

/**
 * Example 2: Usage with Data Service
 */
export function DataServiceExample() {
  const [reportOpen, setReportOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAnalysis = async (symbol) => {
    setLoading(true);
    setReportOpen(true);
    
    try {
      // Fetch from your data service
      const dataService = getDataService();
      const analyses = await dataService.list('stock_analyses');
      const analysis = analyses.find(a => a.symbol === symbol);
      
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Failed to load analysis:', error);
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        className="btn-primary"
        onClick={() => loadAnalysis('NVDA')}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Load NVDA Analysis'}
      </button>
      
      <StockAnalysisReport
        open={reportOpen}
        onOpenChange={setReportOpen}
        analysisData={loading ? null : analysisData}
      />
    </div>
  );
}

/**
 * Example 3: Usage in Universe Builder
 * Shows how to integrate with existing universe/watchlist
 */
export function UniverseIntegrationExample({ universeRows }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const handleViewAnalysis = async (symbol) => {
    // Fetch analysis data for the symbol
    const dataService = getDataService();
    const analyses = await dataService.list('stock_analyses');
    const analysis = analyses.find(a => a.symbol === symbol);
    
    setSelectedAnalysis(analysis);
    setReportOpen(true);
  };

  return (
    <div>
      <div className="universe-list">
        {universeRows.map(row => (
          <div key={row.id} className="universe-item">
            <div>
              <strong>{row.symbol}</strong>
              <span>{row.name}</span>
            </div>
            <button 
              className="btn-compact"
              onClick={() => handleViewAnalysis(row.symbol)}
            >
              View Analysis
            </button>
          </div>
        ))}
      </div>
      
      <StockAnalysisReport
        open={reportOpen}
        onOpenChange={setReportOpen}
        analysisData={selectedAnalysis}
      />
    </div>
  );
}

/**
 * Example 4: Multiple Investment Labels
 * Demonstrates different investment ratings
 */
export function MultipleLabelsExample() {
  const [reportOpen, setReportOpen] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);

  const stocks = [
    {
      symbol: 'NVDA',
      label: 'Investable',
      summary: 'Strong buy opportunity with excellent fundamentals.',
      valuation: { base: 980, bull: 1120, bear: 780 },
      porter_forces: {
        supplier_power: 'Medium — key foundries concentrated...',
        buyer_power: 'Low — hyperscalers scrambling...',
        competitive_rivalry: 'Rising — AMD catching up...',
        threat_new: 'Low — capex intensity...',
        threat_substitutes: 'Medium — custom ASICs...'
      },
      stress_tests: [
        { scenario: 'Cloud capex pause', delta: -0.18 }
      ]
    },
    {
      symbol: 'TSLA',
      label: 'Monitor',
      summary: 'Maintain tactical position; wait for margin stability.',
      valuation: { base: 255, bull: 320, bear: 170 },
      porter_forces: {
        supplier_power: 'Medium — battery raw materials...',
        buyer_power: 'Medium — EV incentives fading...',
        competitive_rivalry: 'High — legacy OEMs rolling out...',
        threat_new: 'Medium — new entrants in China...',
        threat_substitutes: 'Medium — ride sharing adoption...'
      },
      stress_tests: [
        { scenario: 'EV tax credit sunset', delta: -0.2 }
      ]
    },
    {
      symbol: 'GLD',
      label: 'Hedge',
      summary: 'Retain as macro hedge while inflation stays anchored.',
      valuation: { base: 198, bull: 210, bear: 170 },
      porter_forces: {
        supplier_power: 'Low — diversified global miners.',
        buyer_power: 'Low — ETF flows driven by macro.',
        competitive_rivalry: 'Low — limited alternatives.',
        threat_new: 'Low',
        threat_substitutes: 'Medium — digital assets remain competitor.'
      },
      stress_tests: [
        { scenario: 'Real yields +50bps', delta: -0.08 }
      ]
    }
  ];

  const handleViewStock = (stock) => {
    setCurrentStock(stock);
    setReportOpen(true);
  };

  return (
    <div>
      <div className="stock-buttons">
        {stocks.map(stock => (
          <button
            key={stock.symbol}
            className="btn-secondary"
            onClick={() => handleViewStock(stock)}
          >
            {stock.symbol} ({stock.label})
          </button>
        ))}
      </div>
      
      <StockAnalysisReport
        open={reportOpen}
        onOpenChange={setReportOpen}
        analysisData={currentStock}
      />
    </div>
  );
}
