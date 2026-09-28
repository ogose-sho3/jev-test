import Link from 'next/link'
import { routes } from '@/models/routes'
import styles from './app-header.module.css'

/** ヘッダーで強調表示する画面 */
type HeaderSection = 'evaluate' | 'history'

const navItems: { section: HeaderSection; href: string; label: string }[] = [
  { section: 'evaluate', href: routes.home, label: '実行' },
  { section: 'history', href: routes.history, label: '実行履歴' },
]

export function AppHeader({ email, current }: { email: string; current: HeaderSection }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={routes.home} className={styles.brand}>
          jev Evaluator
        </Link>
        <nav className={styles.nav} aria-label="メインメニュー">
          {navItems.map((item) => (
            <Link
              key={item.section}
              href={item.href}
              className={item.section === current ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
              aria-current={item.section === current ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.account}>
          <span className={styles.email} title={email}>
            {email}
          </span>
          <form action={routes.auth.signOut} method="post">
            <button type="submit" className="button button-small">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
