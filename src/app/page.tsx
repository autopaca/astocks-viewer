import Image from 'next/image'
import Link from 'next/link';
import { Button } from 'antd';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Link href={'stocks'}>
        <Button>
          Stocks
        </Button>
      </Link>
    </main>
  )
}
