import axios from 'axios';

type CnInfoStockInfo = {
  code: string;
  orgId: string;
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')
  const res = await axios.post(`http://www.cninfo.com.cn/new/information/topSearch/query?keyWord=${code}&maxNum=10`).then(res => res.data);

  return Response.json({ ...res[0] })
}