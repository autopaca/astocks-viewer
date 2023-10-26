'use client'
import { Stock } from '@/app/stocks/interfaces';
import { getRevenueTables, getStocks, isNumeric, renderValue } from '@/app/stocks/utils';

import { ColumnsType } from 'antd/lib/table';
import { Button, Input, Select, Table } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { ReportModal } from '@/app/stocks/report-modal';
import { Pinyin } from '@/pinyin';
import _ from 'lodash';


type Exchanges = 'shanghai' | 'shenzhen'

export function StocksTable() {
  const [exchange, setExchange] = useState<Exchanges>('shanghai');
  const [stocksData, setStocksData] = useState<Stock[]>([]);
  const [filteredData, setFilteredData] = useState<Stock[]>();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();
  const [searchCode, setSearchCode] = useState('');
  const pinyinTester = new Pinyin();
  const closeModal = () => {
    setModalOpen(false);
  }
  const onStockClick = async (stock: Stock) => {
    setSelectedStock(stock);
    setModalOpen(true);
  }
  const search = useCallback(
    _.debounce((searchCode: string, stocksData: Stock[])  => {
      if (searchCode.length > 0) {
        if (isNumeric(searchCode)) {
          const d = stocksData.filter(s => s['代码'].startsWith(searchCode));
          setFilteredData(d);
        } else {
          const d = stocksData.filter(s => s['名称'].startsWith(searchCode));
          if (d.length > 0) {
            setFilteredData(d);
          } else {
            const d = stocksData.filter(s => pinyinTester.test(s['名称'], searchCode).length > 0);
            setFilteredData(d);
          }
        }
      } else {
        setFilteredData(stocksData);
      }
    }, 500),
    []
  );
  useEffect(() => {
    search(searchCode, stocksData);
  }, [searchCode, stocksData])
  const columns: ColumnsType<Stock> = [
    {
      title: '代码',
      dataIndex: '代码',
      key: 'code',
      render: (stockCode: string, stock: Stock) => {
        return (
          <Button onClick={() => onStockClick(stock)}>{stockCode}</Button>
        )
      }
    },
    {
      title: '名称',
      dataIndex: '名称',
      key: 'name',
    },
    {
      title: '总市值',
      dataIndex: '总市值',
      key: 'total-value',
      sorter: {
        multiple: 4,
        compare: (a: Stock, b: Stock) => a['总市值'] - b['总市值']
      },
      render: renderValue
    },
    {
      title: '流通市值',
      dataIndex: '流通市值',
      key: 'liquid-value',
      sorter: {
        multiple: 3,
        compare: (a: Stock, b: Stock) => a['流通市值'] - b['流通市值']
      },
      render: renderValue
    },
    {
      title: '动态市盈率',
      dataIndex: '市盈率-动态',
      key: 'dynamic-pe',
      sorter: {
        multiple: 2,
        compare: (a: Stock, b: Stock) => a['市盈率-动态'] - b['市盈率-动态']
      },
    },
    {
      title: '市净率',
      dataIndex: '市净率',
      key: 'pb',
      sorter: {
        multiple: 1,
        compare: (a: Stock, b: Stock) => a['市净率'] - b['市净率']
      },
    },
  ];

  const handleChange = (value: Exchanges) => {
    setExchange(value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const stocks = await getStocks(exchange);
      setStocksData(stocks);
      setFilteredData(stocks);
      setLoading(false);
    })();
  }, [exchange]);

  return (<div>
    <Select
      defaultValue='shanghai'
      style={{width: 120}}
      onChange={handleChange}
      options={[
        {value: 'shanghai', label: '上交所'},
        {value: 'shenzhen', label: '深交所'},
      ]}
    />
    <div>
      公司代码: <Input value={searchCode} onChange={e => setSearchCode(e.target.value)}/>
      {/*<Button onClick={searchByCode}>Search</Button>*/}
    </div>
    <ReportModal open={modalOpen} stock={selectedStock} onClose={closeModal}/>
    <Table<Stock> sortDirections={['ascend', 'descend']} rowKey={'代码'} dataSource={filteredData} columns={columns}
                  loading={loading}/>
  </div>);
}