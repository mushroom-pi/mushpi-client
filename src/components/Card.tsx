import React from "react";
import styles from "./Card.module.css";

export default function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.card}>
      {title && <div className={styles.head}>{title}</div>}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
