import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

/** Pages-router entry: loads the shared stylesheet and typeface for routes under src/pages. */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
