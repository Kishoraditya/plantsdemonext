import Link from 'next/link'
import Requests from './requests'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/requests">Requests</Link>
          </li>
        </ul>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp