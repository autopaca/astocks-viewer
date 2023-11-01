import Image from 'next/image'
import Link from 'next/link';
import { Button } from 'antd';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href={'stocks'}>
        <Button>
          股票
        </Button>
      </Link>
      <Link href={'bonds'}>
        <Button>
          可转债
        </Button>
      </Link>
    </main>
  )
}
