import { BondsTable } from '@/app/bonds/bonds-table';
import { getBonds } from '@/app/utils';

export const revalidate = 86400 // 60 * 60 * 24 -> 1 day
export default async function Bonds() {
  const start = new Date().valueOf();
  const bonds = await getBonds();
  const end = new Date().valueOf();
  console.log(bonds[0]);
  console.log(`get bonds used: ${(end-start)/1000} seconds`)
  return (
    <div>
      <BondsTable initBonds={bonds} />
    </div>
  );
}