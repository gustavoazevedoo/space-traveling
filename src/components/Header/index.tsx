import { ReactElement } from 'react';

import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={styles.headerContent}>
      <img src="/logo.svg" alt="logo" />
    </header>
  );
}
