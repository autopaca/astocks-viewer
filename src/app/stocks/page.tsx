import { getStocks } from '@/app/utils';
import { StocksTable } from '@/app/stocks/stocks-table';

export const revalidate = 86400 // 60 * 60 * 24 -> 1 day
export default async function Stocks() {
  const start = new Date().valueOf();
  const stocks = await getStocks(true);
  const end = new Date().valueOf();
  console.log(`get stocks used: ${(end-start)/1000} seconds`)
  // console.log(stocks);
  return (
    <div>
      <StocksTable initStocks={stocks}/>
    </div>
  );
}