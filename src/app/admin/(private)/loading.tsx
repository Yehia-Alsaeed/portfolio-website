import styles from "@/features/admin/admin.module.css";

export default function AdminLoading() {
  return (
    <section aria-label="Loading admin dashboard" className={styles.dashboard}>
      <div className={styles.titleRow}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonLabel} />
      </div>
      <div className={styles.metrics}>
        {Array.from({ length: 4 }, (_, index) => (
          <div className={styles.metric} key={index}>
            <div className={styles.skeletonNumber} />
            <div className={styles.skeletonLabel} />
          </div>
        ))}
      </div>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <span>Visitors and views</span>
          <span>Loading</span>
        </div>
        <div className={styles.chartSkeleton} />
      </div>
    </section>
  );
}
