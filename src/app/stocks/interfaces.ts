export type ReportData = {
  '报告日': string;
  '营业收入': number;
  'incomeYoy'?: number;
  'grossRevenue': number;
  'grossRevenuePercent': number;
  'grossRevenueYoy'?: number;
  'opRevenue': number;
  'opRevenuePercent': number;
  'netRevenue': number;
  'netRevenuePercent': number;
  'motherNetRev': number;
  'motherNetRevPercent': number;
  'motherNetRevYoy'?: number;
  'motherNetRevLTM'?: number;
  'motherNetRevLTMYoy'?: number;
  'opCashFlow': number;
  'investCashFlow': number;
}
export interface Stock {
  "序号":       number;
  "代码":       string;
  "名称":       string;
  "最新价":      number;
  "涨跌幅":      number;
  "涨跌额":      number;
  "成交量":      number;
  "成交额":      number;
  "振幅":       number;
  "最高":       number;
  "最低":       number;
  "今开":       number;
  "昨收":       number;
  "量比":       null;
  "换手率":      number;
  "市盈率-动态": number;
  "市净率":      number;
  "总市值":      number;
  "流通市值":     number;
  "涨速":       number;
  "5分钟涨跌":  number;
  "60日涨跌幅": number;
  "年初至今涨跌幅":  number;
}
export type Exchanges = 'all' | 'shanghai' | 'shenzhen' | 'beijing'

export type IncomeReport = {
  '报告日': string;
  '营业收入': number;
  '营业成本': number;
  // 三费
  '销售费用': number;
  '管理费用': number;
  '财务费用': number;
  // 研发费用独立
  '研发费用'?: number;
  '投资收益'?: number;
  '信用减值损失'?: number;
  '资产减值损失'?: number;
  '所得税费用'?: number;
  '营业税金及附加'?: number;
  // 营业利润 = 毛利润 - 三费 - 研发费用 - 资产减值 - 所得税费用 - 营业税金及附加 + 投资收益
  '营业利润': number;
  '净利润': number;
  '归属于母公司所有者的净利润': number;
}
export type CashFlowReport = {
  '投资活动产生的现金流量净额': number;
  '经营活动产生的现金流量净额': number;
}
export type CnInfoStockInfo = {
  code: string;
  orgId: string;
}
export type BalanceSheet = {
  '流动资产合计': number;
  '资产总计': number;
  '流动负债合计': number;
  '负债合计': number;
}
// export type StockIndividual = {
//   '行业': string;
//   '总股本': number;
//   '流通股本': number;
// }

