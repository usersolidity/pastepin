import ProgressBar from '@badrap/bar-of-progress'
import type { AppProps } from 'next/app'
import Router from 'next/router'
import '../styles/globals.css'

const progress = new ProgressBar({
  size: 3,
  color: '#BFDBFE',
  className: 'bar-of-progress',
  delay: 100,
})

Router.events.on('routeChangeStart', progress.start)
Router.events.on('routeChangeComplete', progress.finish)
Router.events.on('routeChangeError', progress.finish)

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
