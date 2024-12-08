import React from 'react';
import styles from './Loader.module.css'; // Import CSS module styles

const Loader = () => {
  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles.loaderContainer}>
        <div className={styles.hourglassBackground}>
          <div className={styles.hourglassContainer}>
            <div className={styles.hourglassCurves}></div>
            <div className={styles.hourglassCapTop}></div>
            <div className={styles.hourglassGlassTop}></div>
            <div className={styles.hourglassSand}></div>
            <div className={styles.hourglassSandStream}></div>
            <div className={styles.hourglassCapBottom}></div>
            <div className={styles.hourglassGlass}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
