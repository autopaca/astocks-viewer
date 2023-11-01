import { Modal, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import {
  formatReportDate,
  getBalanceSheetReports,
  getCashFlowReports,
  getRevenueTables, parseQuarter, parseYear,
  quarterAdjust,
  renderPercent,
  renderValue, renderValueWithUnit, yoy
} from '@/app/utils';
import {
  BalanceSheet,
  CashFlowReport,
  CnInfoStockInfo,
  IncomeReport,
  ReportData,
  Stock
} from '@/app/stocks/interfaces';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import './table.css';
import axios from 'axios';

type FieldKey = {
  dataIndex: string;
  title: string;
  grey: boolean;
}
const fieldKeys: FieldKey[] = [
  {
    dataIndex: '营业收入',
    title: '营业收入',
    grey: true,
  },
  {
    title: '-yoy%',
    dataIndex: 'incomeYoy',
    grey: false,
  },
  {
    title: '毛利润',
    dataIndex: 'grossRevenue',
    grey: true,
  },
  {
    title: '-毛利率%',
    dataIndex: 'grossRevenuePercent',
    grey: false,
  },
  {
    title: '-yoy%',
    dataIndex: 'grossRevenueYoy',
    grey: false,
  },
  {
    title: '营业利润',
    dataIndex: 'opRevenue',
    grey: true,
  },
  {
    title: '-营业利润率%',
    dataIndex: 'opRevenuePercent',
    grey: false,
  },
  {
    title: '净利润',
    dataIndex: 'netRevenue',
    grey: true,
  },
  {
    title: '-净利润率%',
    dataIndex: 'netRevenuePercent',
    grey: false,
  },
  {
    title: '归母净利润',
    dataIndex: 'motherNetRev',
    grey: true,
  },
  // {
  //   title: '归母净利润',
  //   dataIndex: 'motherNetRev',
  //   key: 'motherNetRev',
  //   render: renderValue
  // },
  {
    title: '-yoy%',
    dataIndex: 'motherNetRevYoy',
    grey: false,
  },
  {
    title: '归母净利（LTM）',
    dataIndex: 'motherNetRevLTM',
    grey: true,
  },
  {
    title: '-yoy%',
    dataIndex: 'motherNetRevLTMYoy',
    grey: false,
  },
  {
    title: '经营活动净现金流',
    dataIndex: 'opCashFlow',
    grey: true,
  },
  {
    title: '投资活动净现金流',
    dataIndex: 'investCashFlow',
    grey: true,
  },
]

export function ReportModal(props: { open: boolean, onClose: () => void, stock?: Stock }) {
  const stockCode = props.stock?.代码;
  const stockName = props.stock?.名称;
  const [earning, setEarning] = useState(0);
  const [transformedData, setTransformedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [cnInfoLink, setCnInfoLink] = useState('');
  const [lastBalanceSheet, setLastBalanceSheet] = useState<BalanceSheet | undefined>(undefined);
  useEffect(() => {
    if (props.open && stockCode) {
      (async () => {
        const cnInfoData = await axios.get<CnInfoStockInfo>('stocks/api', {params: {code: stockCode}}).then(res => res.data) as CnInfoStockInfo;
        const link = `http://www.cninfo.com.cn/new/disclosure/stock?stockCode=${stockCode}&orgId=${cnInfoData.orgId}#latestAnnouncement`;
        setCnInfoLink(link);
        let reports = await getRevenueTables(stockCode);
        const cashFlowReports = await getCashFlowReports(stockCode);
        const balanceSheetReports = await getBalanceSheetReports(stockCode);
        console.log({cashFlowReports, balanceSheetReports, reports})
        setLastBalanceSheet(balanceSheetReports[0]);
        // console.log(reports);
        // reports = reports.sort((a, b) => Number(a['报告日']) - Number(b['报告日']));
        const adjustedReports: IncomeReport[] = quarterAdjust(reports);
        const adjustedCashFlowReports: CashFlowReport[] = quarterAdjust(cashFlowReports);
        let data = adjustedReports.map<ReportData>((r, i) => {
          const cashFlowReport = adjustedCashFlowReports[i];
          let income = r['营业收入'];
          let cost = r['营业成本'];
          const grossRevenue = income - cost;
          const grossRevenuePercent = grossRevenue / income;
          // 营业利润 = 毛利润 - 三费 - 研发费用 - 资产减值 + 投资收益
          // const opRevenue = grossRevenue - absOrZero(r['管理费用']) - absOrZero(r['财务费用']) - absOrZero(r['销售费用'])
          //   - absOrZero(r['研发费用']) - absOrZero(r['信用减值损失']) - absOrZero(r['资产减值损失']) - absOrZero(r['营业税金及附加']) 
          //   - absOrZero(r['所得税费用']) + orZero(r['投资收益'])
          const opRevenue = r['营业利润']
          const opRevenuePercent = opRevenue / income;
          return {
            '报告日': r['报告日'],
            '营业收入': income,
            grossRevenue,
            grossRevenuePercent,
            opRevenue,
            opRevenuePercent,
            netRevenue: r['净利润'],
            netRevenuePercent: r['净利润'] / income,
            motherNetRev: r['归属于母公司所有者的净利润'],
            motherNetRevPercent: r['归属于母公司所有者的净利润'] / income,
            opCashFlow: cashFlowReport && cashFlowReport['经营活动产生的现金流量净额'],
            investCashFlow: cashFlowReport && cashFlowReport['投资活动产生的现金流量净额']
          }
        }).reverse();
        for (let i = 0; i < data.length - 4; i++) {
          const motherNetRevLTM = [i, i + 1, i + 2, i + 3].map(j => data[j].motherNetRev).reduce((a, b) => a + b)
          if (i === 0) {
            setEarning(motherNetRevLTM);
          }
          data[i] = {...data[i], motherNetRevLTM}
        }
        for (let i = 0; i < data.length - 4; i++) {
          const d = data[i];
          const prev = data[i + 4];
          const incomeYoy = (d['营业收入'] - prev['营业收入']) / prev['营业收入'];
          const grossRevenueYoy = yoy(d.grossRevenue, prev.grossRevenue);
          const motherNetRevYoy = yoy(d.motherNetRev, prev.motherNetRev);
          const motherNetRevLTMYoy = yoy(d.motherNetRevLTM!, prev.motherNetRevLTM!);
          data[i] = {...d, incomeYoy, grossRevenueYoy, motherNetRevYoy, motherNetRevLTMYoy};
        }
        data = data.slice(0, 16);
        const dates = new Set(data.map(d => d['报告日']));
        const datesArray = Array.from(dates).sort((a, b) => Number(a) - Number(b));
        const transformedData = fieldKeys.map(k => {
          let res: any = {};
          for (const date of datesArray) {
            const d = data.find(da => da['报告日'] === date);
            if (k.dataIndex.endsWith('Percent') || k.dataIndex.endsWith('Yoy')) {
              // @ts-ignore
              res[date] = renderPercent(d[k.dataIndex]);
            } else {
              // @ts-ignore
              res[date] = renderValue(d[k.dataIndex]);
            }
          }
          // @ts-ignore
          // const c = columnTypes.find(c => c.dataIndex === k);
          res['field'] = k.title;
          return res;
        });
        const columnHelper = createColumnHelper();
        const firstColumn = columnHelper.accessor('field',
          {cell: info => info.getValue(), header: '(单位: 百万 RMB)'});
        const c = datesArray.map(d => {
          return columnHelper.accessor(d, {
            cell: info => info.getValue(),
            header: () => <div><p>{formatReportDate(d)}</p><p>{parseYear(d)}-Q{parseQuarter(d)}</p></div>
          })
        })
        setTransformedData(transformedData);
        setColumns([firstColumn, ...c]);
        // setColumns(c);
        setOpen(true);
      })();
    } else {
      setOpen(false);
    }
  }, [props.open, stockCode]);
  const closeModal = () => {
    props.onClose();
  }
  const table = useReactTable({
    data: transformedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const title = () => {
    if (!stockCode || !props.stock) {
      return ``;
    }
    const ex = stockCode.startsWith('6') ? 'SSE' : 'SZSE';
    const tvLink = `https://cn.tradingview.com/chart/5OHDBruq/?symbol=${ex}%3A${stockCode}`;
    const gstLink = `https://gushitong.baidu.com/stock/ab-${stockCode}`
    return (<div>{stockName}-{stockCode}-<a href={`${cnInfoLink}`} target={'_blank'}>巨潮公告页</a>-
      <a href={tvLink} target={'_blank'}>k线</a>
      -<a href={gstLink} target={'_blank'}>股市通</a>
      | <span>总市值 {renderValueWithUnit(props.stock['总市值'])}</span> | <span>PE-TTM {(props.stock['总市值'] / earning).toFixed(2)}</span>
    </div>);
  }
  return (<div>
    <Modal title={title()} open={open} onCancel={closeModal} onOk={closeModal}
           width={10000}>
      {
        lastBalanceSheet && <div>
        <p>流动资产合计：{lastBalanceSheet.流动资产合计} | 资产总计：{lastBalanceSheet.资产总计} | 流动性负债合计：{lastBalanceSheet.流动负债合计} | 负债合计：{lastBalanceSheet.负债合计}</p>
        </div>
      }
      {/*<Table<ReportData> rowKey={'报告日'} columns={columns} dataSource={data}/>*/}
      <table className={'stock'}>
        <thead className={'stock'}>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th className={'stock'} key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              </th>
            ))}
          </tr>
        ))}
        </thead>
        <tbody className={'stock'}>
        {table.getRowModel().rows.map(row => {
          // console.log(row.getVisibleCells()[0].getValue());
          return (
            <tr key={row.id}
              // @ts-ignore
                className={row.getVisibleCells()[0].getValue().startsWith('-') ? 'stock sub-row' : 'stock main-row'}>
              {/*<tr key={row.id} >*/}
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className={'stock'}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          )
        })}
        </tbody>
      </table>
    </Modal>

  </div>);
}