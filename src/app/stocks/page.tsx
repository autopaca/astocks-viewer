import { getStocks } from '@/app/stocks/utils';
import { StocksTable } from '@/app/stocks/stocks-table';
import { Select } from 'antd';

export default async function Stocks() {
  // let 
  // const stocks = await getStocks('all');
  // console.log(stocks);
  return (
    <div>
      <StocksTable />
    </div>
  );
}