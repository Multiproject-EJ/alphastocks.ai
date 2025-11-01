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
    }
  };
};
