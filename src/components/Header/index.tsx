import styles from './header.module.scss';

export function Header() {
  return (
    <div className={styles.headerBox}>
        <a href="/">
          <img src="/logo.svg" alt="logo" />
        </a>
    </div>
  )
}
