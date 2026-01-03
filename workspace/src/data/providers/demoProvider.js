const clone = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const normalizeDataset = (moduleValue) => {
  const payload = moduleValue?.default ?? moduleValue;

  if (!payload || typeof payload.table !== 'string') {
    return null;
  }

  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const metadata = typeof payload.metadata === 'object' && payload.metadata !== null ? payload.metadata : {};

  return {
    table: payload.table,
    rows,
    metadata
  };
};

const buildTableMap = () => {
  const modules = import.meta.glob('../demo/*.json', {
    eager: true
  });

  const tableMap = new Map();

  Object.values(modules).forEach((moduleValue) => {
    const dataset = normalizeDataset(moduleValue);

    if (dataset) {
      tableMap.set(dataset.table, dataset);
    }
  });

  return tableMap;
};

const applyMatch = (row, match) => {
  if (!match || typeof match !== 'object' || match === null) {
    return true;
  }

  return Object.entries(match).every(([key, value]) => {
    if (Array.isArray(value)) {
      return value.includes(row?.[key]);
    }

    return row?.[key] === value;
  });
};

const ensureDataset = (tables, name) => {
  if (!tables.has(name)) {
    const dataset = {
      table: name,
      rows: [],
      metadata: { count: 0 }
    };
    tables.set(name, dataset);
  }

  return tables.get(name);
};

export const createDemoProvider = () => {
  const tables = buildTableMap();

  return {
    mode: 'demo',
    listTables() {
      return Array.from(tables.keys());
    },
    async getTable(name) {
      if (!tables.has(name)) {
        throw new Error(`Demo dataset for table "${name}" is not defined.`);
      }

      const dataset = tables.get(name);

      return {
        table: dataset.table,
        rows: clone(dataset.rows),
        metadata: clone(dataset.metadata)
      };
    },
    async createRow(name, payload) {
      const dataset = ensureDataset(tables, name);
      const rows = clone(dataset.rows);
      const nextRow = {
        ...payload,
        id: payload.id ?? `${Date.now()}`,
        created_at: payload.created_at ?? new Date().toISOString()
      };

      rows.unshift(nextRow);
      tables.set(name, {
        ...dataset,
        rows,
        metadata: { ...dataset.metadata, count: rows.length }
      });

      return clone(nextRow);
    },
    async updateRows(name, match, updates) {
      const dataset = ensureDataset(tables, name);
      const rows = dataset.rows.map((row) => {
        if (!applyMatch(row, match)) {
          return row;
        }

        return { ...row, ...updates };
      });

      tables.set(name, {
        ...dataset,
        rows,
        metadata: { ...dataset.metadata, count: rows.length }
      });

      return clone(rows.filter((row) => applyMatch(row, match)));
    },
    async deleteRows(name, match) {
      const dataset = ensureDataset(tables, name);
      const remaining = dataset.rows.filter((row) => !applyMatch(row, match));
      const removed = dataset.rows.filter((row) => applyMatch(row, match));

      tables.set(name, {
        ...dataset,
        rows: remaining,
        metadata: { ...dataset.metadata, count: remaining.length }
      });

      return clone(removed);
    },
    /**
     * Fetch stock analysis from demo data
     * @param {string} symbol - Stock ticker symbol
     * @param {string} profileId - User profile ID (not used in demo mode)
     * @returns {Promise<{data: object|null, error: Error|null}>}
     */
    async fetchStockAnalysis(symbol, profileId) {
      try {
        // Lazy load demo data
        const demoModule = await import('../demo/demo.stock_analyses.json');
        const analyses = demoModule.default?.rows || demoModule.rows || [];
        
        const analysis = analyses.find(a => 
          a.symbol?.toUpperCase() === symbol.toUpperCase()
        );
        
        if (!analysis) {
          return { data: null, error: null };
        }
        
        return { data: analysis, error: null };
      } catch (err) {
        console.error('[DemoDataService] Failed to load demo stock analysis:', err);
        return { data: null, error: err };
      }
    }
  };
};
