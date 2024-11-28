import React from 'react';
import styles from './RecordModal.module.css';

const KeyValueListItem = ({ label, value }) => {
  return (
    <div className={styles['key-value-item']}>
      <div className={styles['key']}>{label}</div>
      <div className={styles['value']}>{value || 'N/A'}</div>
    </div>
  );
};

const RecordStudentViewModal = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className={styles['record-modal-overlay']}>
        <div className={styles['record-modal-content']}>
            <button onClick={onClose} className={styles['closeButton']}>✕</button>
            <h2 className={styles['modal-title']}>Complete Details of Record</h2>

            <div className={styles['key-value-list']}>
                {/* Short fields */}
                <KeyValueListItem label="Record Date" value={record.record_date} />
                <KeyValueListItem label="Monitored Record" value={record.monitored_record} />
                <KeyValueListItem label="Complainant" value={record.complainant} />
                <KeyValueListItem
                    label="Complete"
                    value={record.complete === 0 ? 'Incomplete' : record.complete === 1 ? 'Complete' : 'N/A'}
                />
                <KeyValueListItem
                    label="Encoder"
                    value={`${record.encoder.firstname} ${record.encoder.lastname}`}
                />

                {/* Long fields */}
                <KeyValueListItem label="Remarks" value={record.remarks} />
                <KeyValueListItem label="Sanction" value={record.sanction} />
                <KeyValueListItem label="Case Details" value={record.caseDetails} />
            </div>
        </div>
    </div>
  );
};

export default RecordStudentViewModal;
