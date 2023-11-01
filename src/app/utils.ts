import axios from 'axios';
import { BalanceSheet, CashFlowReport, IncomeReport, Stock } from '@/app/stocks/interfaces';

const APIPrefix = 'https://api-dev.trlab.fun/aktools/api/public';
// axios.defaults.timeout =  600;
const akShareApi = (endpoint: string) => {
  return `${APIPrefix}/${endpoint}`;
}

// export async function getStockIndividualInfo(code: string): Promise<StockIndividual> {
//   const api = akShareApi('stock_individual_info_em');
//   return axios.get<StockIndividual>(api, {params: {symbol: code}}).then(res => res.data);
// }

export async function getStocks(filterEmpty: boolean = true): Promise<Stock[]> {
  // let api = akShareApi('stock_zh_a_spot_em');
  // if (exchange === 'shanghai') {
  //   api = akShareApi('stock_sh_a_spot_em');
  // } else if (exchange === 'shenzhen') {
  //   api = akShareApi('stock_sz_a_spot_em');
  // } else if (exchange === 'beijing') {
  //   api = akShareApi('stock_bj_a_spot_em');
  // }
  const shApi = akShareApi('stock_sh_a_spot_em');
  const szApi = akShareApi('stock_sz_a_spot_em');
  const shData: Stock[] = await fetch(shApi).then(res => res.json())
  const szData: Stock[] = await fetch(szApi).then(res => res.json())
  const data = shData.concat(szData);
  if (filterEmpty) {
    return data.filter(s => s['总市值'] !== null && s['流通市值'] !== null);
  }
  return data;
}

export async function getBonds(): Promise<any[]> {
  const api = akShareApi('bond_zh_cov_info_ths');
  return fetch(api).then(res => res.json());
}
export function getRevenueTables(stock: string): Promise<IncomeReport[]> {
  return axios.get(akShareApi('stock_financial_report_sina'), {params: {stock, symbol: '利润表'}}).then(res => res.data)
}
export function getCashFlowReports(stock: string): Promise<CashFlowReport[]> {
  return axios.get(akShareApi('stock_financial_report_sina'), {params: {stock, symbol: '现金流量表'}}).then(res => res.data)
}
export function getBalanceSheetReports(stock: string): Promise<BalanceSheet[]> {
  return axios.get(akShareApi('stock_financial_report_sina'), {params: {stock, symbol: '资产负债表'}}).then(res => res.data)
}

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export const renderValueWithUnit = (value: number) => {
  return `${numberWithCommas(Number((value / 100_000_000).toFixed(2)))}亿`;
}
export const renderValue = (value: number) => {
  return `${numberWithCommas(Number((value / 1_000_000).toFixed(0)))}`;
}
export const renderPercent = (percentValue?: number) => {
  return percentValue && `${(percentValue * 100).toFixed(1)}%`;
}

export const yoy = (cur: number, prev: number) => (cur - prev) / absOrZero(prev)
export const parseReportDate = (date: string) => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6);
  return [year, month, day];
}
export const formatReportDate = (date: string) => {
  const [year, month, day] = parseReportDate(date);
  return `${year}-${Number(month)}-${day}`;
}
export const parseYear = (date: string) => parseReportDate(date)[0];
export const parseQuarter = (date: string): 1 | 2 | 3 | 4 => {
  const [year, month, day] = parseReportDate(date);
  if (month === '06') {
    return 2;
  } else if (month === '03') {
    return 1;
  } else if (month === '09') {
    return 3;
  } else {
    return 4;
  }
}
export const quarterAdjust = (reports: any[]): any[] => {
  reports = reports.sort((a, b) => Number(a['报告日']) - Number(b['报告日']));
  const adjustedReports = [reports[0]];
  for (let i = 1; i < reports.length; i++) {
    const r = reports[i];
    const quarter = parseQuarter(r['报告日']);
    const newR: IncomeReport = {...r};
    if (quarter !== 1) {
      const prevR = reports[i - 1];
      const keys = Object.keys(r);
      for (const key of keys) {
        if (typeof r[key] === 'number') {
          // @ts-ignore
          newR[key] = orZero(r[key] as number) - orZero(prevR[key] as number);
        }
      }
    }
    adjustedReports.push(newR);
  } 
  return adjustedReports;
}
export const absOrZero = (num?: number) => Math.abs(orZero(num));
export const orZero = (num?: number) => num ?? 0;

export function isNumeric(str: string) {
  return !isNaN(Number(str)) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}