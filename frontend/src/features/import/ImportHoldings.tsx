import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import CloudUpload from '@mui/icons-material/CloudUpload';
import Download from '@mui/icons-material/Download';
import * as XLSX from 'xlsx';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentToken } from '@/features/auth/authSlice';
import { formatCurrency } from '@/utils/formatters';

type StockImport = {
  symbol: string;
  companyName: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averagePrice: number;
};

type MFImport = {
  schemeCode?: string;
  schemeName: string;
  amcName?: string;
  units: number;
  averageNav: number;
};

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/\s|_|-|\./g, '').trim();

const parseNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  return cleaned ? Number(cleaned) : NaN;
};

const inferExchange = (value?: string) => {
  if (!value) return 'NSE';
  const upper = value.toUpperCase();
  if (upper.includes('BSE') || upper.includes('.BO')) return 'BSE';
  return 'NSE';
};

const STOCK_TEMPLATE_HEADERS = [
  'Symbol',
  'Quantity',
  'AveragePrice',
];

const MF_TEMPLATE_HEADERS = [
  'SchemeName',
  'Units',
  'AverageNav',
];

const findHeaderRowIndex = (rows: Array<Array<unknown>>, required: string[]) => {
  const requiredNormalized = required.map(normalizeHeader);
  for (let i = 0; i < Math.min(rows.length, 10); i += 1) {
    const row = rows[i] as Array<unknown>;
    const normalized = row.map((cell) => normalizeHeader(String(cell || '')));
    if (requiredNormalized.every((key) => normalized.includes(key))) {
      return i;
    }
  }
  return -1;
};

const downloadTemplate = () => {
  const stockSheet = XLSX.utils.aoa_to_sheet([STOCK_TEMPLATE_HEADERS]);
  const mfSheet = XLSX.utils.aoa_to_sheet([MF_TEMPLATE_HEADERS]);
  const sampleSheet = XLSX.utils.aoa_to_sheet([
    ['Stocks (example)'],
    STOCK_TEMPLATE_HEADERS,
    ['RELIANCE.NS', 10, 2500],
    ['GOLDBEES.NS', 20, 55.2],
    [],
    ['MutualFunds (example)'],
    MF_TEMPLATE_HEADERS,
    ['HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth', 120.5, 32.8],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, stockSheet, 'Stocks');
  XLSX.utils.book_append_sheet(workbook, mfSheet, 'MutualFunds');
  XLSX.utils.book_append_sheet(workbook, sampleSheet, 'Sample');
  XLSX.writeFile(workbook, 'nidhione-holdings-template.xlsx');
};

export default function ImportHoldings() {
  const token = useAppSelector(selectCurrentToken);
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [stocks, setStocks] = useState<StockImport[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MFImport[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ stocks: number; mutualFunds: number } | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const headerMatchers: Record<string, string[]> = {
    symbol: ['symbol', 'ticker', 'scrip', 'security', 'instrument', 'stock'],
    companyName: ['company', 'name', 'companyname', 'securityname', 'stockname'],
    exchange: ['exchange', 'exch', 'market'],
    quantity: ['qty', 'quantity', 'shares', 'units'],
    units: ['units', 'qty', 'quantity'],
    averagePrice: ['avgprice', 'averageprice', 'avgcost', 'cost', 'purchaseprice', 'buyprice', 'rate', 'price'],
    schemeCode: ['schemecode', 'schemecode', 'amficode', 'code'],
    schemeName: ['schemename', 'schemename', 'scheme', 'fund', 'mutualfund', 'fundname'],
    amcName: ['amc', 'amcname', 'fundhouse'],
    averageNav: ['avgnav', 'averagenav', 'nav'],
  };

  const parseStockRows = (rows: Record<string, unknown>[], headers: string[], errors: string[]) => {
    const stockHeaderMap = new Map<string, string>();
    headers.forEach((header) => {
      const normalized = normalizeHeader(header);
      Object.entries(headerMatchers).forEach(([key, values]) => {
        if (values.includes(normalized) && !stockHeaderMap.has(key)) {
          stockHeaderMap.set(key, header);
        }
      });
    });

    const parsed: StockImport[] = [];
    rows.forEach((row, index) => {
      const symbol = stockHeaderMap.get('symbol') ? String(row[stockHeaderMap.get('symbol') as string]).trim() : '';
      const companyName = stockHeaderMap.get('companyName')
        ? String(row[stockHeaderMap.get('companyName') as string]).trim()
        : symbol;
      const exchangeRaw = stockHeaderMap.get('exchange')
        ? String(row[stockHeaderMap.get('exchange') as string])
        : symbol;
      const quantityKey = stockHeaderMap.get('quantity');
      const averagePriceKey = stockHeaderMap.get('averagePrice');
      const quantity = parseNumber(quantityKey ? row[quantityKey] : '');
      const averagePrice = parseNumber(averagePriceKey ? row[averagePriceKey] : '');

      if (!symbol && Number.isNaN(quantity) && Number.isNaN(averagePrice)) {
        return;
      }

      if (!symbol || Number.isNaN(quantity) || Number.isNaN(averagePrice)) {
        errors.push(`Stocks row ${index + 2}: Missing Symbol/Quantity/AveragePrice`);
        return;
      }

      parsed.push({
        symbol,
        companyName: companyName || symbol,
        exchange: inferExchange(exchangeRaw),
        quantity,
        averagePrice,
      });
    });

    return parsed;
  };

  const parseMFRows = (rows: Record<string, unknown>[], headers: string[], errors: string[]) => {
    const mfHeaderMap = new Map<string, string>();
    headers.forEach((header) => {
      const normalized = normalizeHeader(header);
      Object.entries(headerMatchers).forEach(([key, values]) => {
        if (values.includes(normalized) && !mfHeaderMap.has(key)) {
          mfHeaderMap.set(key, header);
        }
      });
    });

    const parsed: MFImport[] = [];
    rows.forEach((row, index) => {
      const schemeCode = mfHeaderMap.get('schemeCode') ? String(row[mfHeaderMap.get('schemeCode') as string]).trim() : '';
      const schemeName = mfHeaderMap.get('schemeName') ? String(row[mfHeaderMap.get('schemeName') as string]).trim() : '';
      const amcName = mfHeaderMap.get('amcName') ? String(row[mfHeaderMap.get('amcName') as string]).trim() : '';
      const unitsKey = mfHeaderMap.get('units');
      const units = parseNumber(unitsKey ? row[unitsKey] : '');
      const averageNav = parseNumber(
        mfHeaderMap.get('averageNav')
          ? row[mfHeaderMap.get('averageNav') as string]
          : ''
      );

      if (!schemeName && Number.isNaN(units) && Number.isNaN(averageNav)) {
        return;
      }

      if (!schemeName || Number.isNaN(units) || Number.isNaN(averageNav)) {
        errors.push(`MutualFunds row ${index + 2}: Missing SchemeName/Units/AverageNav`);
        return;
      }

      parsed.push({
        schemeCode: schemeCode || undefined,
        schemeName,
        amcName: amcName || undefined,
        units,
        averageNav,
      });
    });

    return parsed;
  };

  const handleFiles = async (files: FileList) => {
    setIsParsing(true);
    setFileName(Array.from(files).map((f) => f.name).join(', '));
    setParseErrors([]);
    setImportResult(null);
    setImportErrors([]);

    try {
      const errors: string[] = [];
      let parsedStocks: StockImport[] = [];
      let parsedMFs: MFImport[] = [];

      for (const file of Array.from(files)) {
        const lower = file.name.toLowerCase();

        if (lower.endsWith('.csv')) {
          const text = await file.text();
          const workbook = XLSX.read(text, { type: 'string' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const matrix = XLSX.utils.sheet_to_json<Array<unknown>>(sheet, { header: 1, defval: '' });
          const stockHeaderRowIndex = findHeaderRowIndex(matrix, STOCK_TEMPLATE_HEADERS);
          const mfHeaderRowIndex = findHeaderRowIndex(matrix, MF_TEMPLATE_HEADERS);

          if (stockHeaderRowIndex === -1 && mfHeaderRowIndex === -1) {
            errors.push(`"${file.name}" does not match Stocks or MutualFunds template headers.`);
            continue;
          }

          if (stockHeaderRowIndex !== -1) {
            const headers = (matrix[stockHeaderRowIndex] as string[]) || [];
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
              defval: '',
              range: stockHeaderRowIndex + 1,
            });
            parsedStocks = parsedStocks.concat(parseStockRows(rows, headers, errors));
          }

          if (mfHeaderRowIndex !== -1) {
            const headers = (matrix[mfHeaderRowIndex] as string[]) || [];
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
              defval: '',
              range: mfHeaderRowIndex + 1,
            });
            parsedMFs = parsedMFs.concat(parseMFRows(rows, headers, errors));
          }

          continue;
        }

        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const stockSheet = workbook.Sheets['Stocks'];
          const mfSheet = workbook.Sheets['MutualFunds'];

          if (!stockSheet || !mfSheet) {
            errors.push('Template must include two sheets named "Stocks" and "MutualFunds".');
            continue;
          }

          const stockMatrix = XLSX.utils.sheet_to_json<Array<unknown>>(stockSheet, { header: 1, defval: '' });
          const mfMatrix = XLSX.utils.sheet_to_json<Array<unknown>>(mfSheet, { header: 1, defval: '' });

          const stockHeaderRowIndex = findHeaderRowIndex(stockMatrix, STOCK_TEMPLATE_HEADERS);
          const mfHeaderRowIndex = findHeaderRowIndex(mfMatrix, MF_TEMPLATE_HEADERS);

          if (stockHeaderRowIndex === -1 || mfHeaderRowIndex === -1) {
            errors.push('Only the official template format is allowed. Please download the template and fill it.');
            continue;
          }

          const stockHeaders = (stockMatrix[stockHeaderRowIndex] as string[]) || [];
          const mfHeaders = (mfMatrix[mfHeaderRowIndex] as string[]) || [];

          const stockRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(stockSheet, {
            defval: '',
            range: stockHeaderRowIndex + 1,
          });
          const mfRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(mfSheet, {
            defval: '',
            range: mfHeaderRowIndex + 1,
          });

          parsedStocks = parsedStocks.concat(parseStockRows(stockRows, stockHeaders, errors));
          parsedMFs = parsedMFs.concat(parseMFRows(mfRows, mfHeaders, errors));
        } catch (error) {
          errors.push(`"${file.name}" could not be read. If it is a Numbers file, export to XLSX/CSV.`);
        }
      }

      if (!parsedStocks.length && !parsedMFs.length) {
        errors.push('No data rows found in Stocks or MutualFunds sheets.');
      }

      setStocks(parsedStocks);
      setMutualFunds(parsedMFs);
      setParseErrors(errors);
    } catch (error) {
      setParseErrors(['Failed to read file. Please check the format.']);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    if (!token) return;
    setImporting(true);
    setImportErrors([]);
    setImportResult(null);
    try {
      const response = await fetch(`${baseUrl}/import/holdings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stocks, mutualFunds }),
      });

      const data = await response.json();
      if (!response.ok) {
        setImportErrors([data?.error || 'Import failed']);
        return;
      }

      setImportResult({
        stocks: data?.created?.stocks || 0,
        mutualFunds: data?.created?.mutualFunds || 0,
      });

      if (Array.isArray(data?.errors) && data.errors.length) {
        setImportErrors(
          data.errors.map((err: any) => `${err.type} row ${err.index + 1}: ${err.message}`)
        );
      }
    } catch (error) {
      setImportErrors(['Import failed. Please try again.']);
    } finally {
      setImporting(false);
    }
  };

  const hasData = stocks.length + mutualFunds.length > 0;
  const stockPreview = useMemo(() => stocks.slice(0, 5), [stocks]);
  const mfPreview = useMemo(() => mutualFunds.slice(0, 5), [mutualFunds]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Import Holdings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload a single XLSX file to add stocks and mutual funds in one go.
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box
              sx={{
                border: '1px dashed #cbd5e1',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#ffffff',
              }}
            >
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadTemplate}
                >
                  Download Template
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                >
                  Upload XLSX/CSV/Numbers
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv, .numbers"
                    multiple
                    hidden
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length) {
                        handleFiles(files);
                        e.target.value = '';
                      }
                    }}
                  />
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {fileName
                  ? `Selected: ${fileName}`
                  : 'Use the official template with Stocks + MutualFunds sheets. XLSX, CSV, and Numbers are supported.'}
              </Typography>
            </Box>

            {isParsing && <LinearProgress />}

            {!!parseErrors.length && (
              <Alert severity="warning">
                {parseErrors.slice(0, 3).join(' • ')}
                {parseErrors.length > 3 ? ` (+${parseErrors.length - 3} more)` : ''}
              </Alert>
            )}

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip label={`Stocks: ${stocks.length}`} color="primary" variant="outlined" />
              <Chip label={`Mutual Funds: ${mutualFunds.length}`} color="secondary" variant="outlined" />
              <Chip label={`Errors: ${parseErrors.length}`} variant="outlined" />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {hasData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600">
              Preview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing the first 5 rows for each category.
            </Typography>

            {stockPreview.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Stocks
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Exchange</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Avg Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockPreview.map((row) => (
                      <TableRow key={`${row.symbol}-${row.companyName}`}>
                        <TableCell>{row.symbol}</TableCell>
                        <TableCell>{row.companyName}</TableCell>
                        <TableCell>{row.exchange}</TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(row.averagePrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            {mfPreview.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                  Mutual Funds
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Scheme</TableCell>
                      <TableCell>Scheme Code</TableCell>
                      <TableCell align="right">Units</TableCell>
                      <TableCell align="right">Avg NAV</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mfPreview.map((row) => (
                      <TableRow key={`${row.schemeCode || row.schemeName}-${row.units}`}>
                        <TableCell>{row.schemeName}</TableCell>
                        <TableCell>{row.schemeCode || '-'}</TableCell>
                        <TableCell align="right">{row.units}</TableCell>
                        <TableCell align="right">{formatCurrency(row.averageNav)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Button
              variant="contained"
              disabled={!hasData || importing || !token}
              onClick={handleImport}
            >
              {importing ? 'Importing...' : 'Import Holdings'}
            </Button>

            {importResult && (
              <Alert severity="success">
                Imported {importResult.stocks} stocks and {importResult.mutualFunds} mutual funds.
              </Alert>
            )}

            {!!importErrors.length && (
              <Alert severity="warning">
                {importErrors.slice(0, 3).join(' • ')}
                {importErrors.length > 3 ? ` (+${importErrors.length - 3} more)` : ''}
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
