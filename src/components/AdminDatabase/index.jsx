import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminDatabase.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/database`;
const RESTORE_CONFIRMATION = 'RESTORE DATABASE';
const CLEAR_CONFIRMATION = 'CLEAR DATABASE';

const AdminDatabase = () => {
  const { token } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [backupFile, setBackupFile] = useState(null);
  const [confirmation, setConfirmation] = useState('');
  const [clearConfirmation, setClearConfirmation] = useState('');
  const [restoreSummary, setRestoreSummary] = useState(null);
  const [clearSummary, setClearSummary] = useState(null);

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await axios.get(`${API_URL}/backup`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `chapterone-database-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      toast.success('Database backup downloaded. Store it securely.');
    } catch (error) {
      toast.error('Could not create the database backup.');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setBackupFile(file);
    setRestoreSummary(null);
  };

  const handleRestore = async (event) => {
    event.preventDefault();
    if (!backupFile || confirmation !== RESTORE_CONFIRMATION) return;

    const formData = new FormData();
    formData.append('backup', backupFile);
    formData.append('confirmation', confirmation);
    setRestoreLoading(true);
    setRestoreSummary(null);

    try {
      const response = await axios.post(`${API_URL}/restore`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestoreSummary(response.data.data?.restored_rows || {});
      setBackupFile(null);
      setConfirmation('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success(response.data.message || 'Database data restored successfully.');
    } catch (error) {
      const responseData = error.response?.data;
      const firstError = responseData?.errors
        ? Object.values(responseData.errors).flat()[0]
        : null;
      toast.error(firstError || responseData?.message || 'Database restore failed.');
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleClear = async (event) => {
    event.preventDefault();
    if (clearConfirmation !== CLEAR_CONFIRMATION) return;

    setClearLoading(true);
    setClearSummary(null);
    try {
      const response = await axios.post(`${API_URL}/clear`, {
        confirmation: clearConfirmation,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClearSummary(response.data.data?.cleared_rows || {});
      setClearConfirmation('');
      toast.success(response.data.message || 'Database data cleared.');
    } catch (error) {
      const responseData = error.response?.data;
      const firstError = responseData?.errors
        ? Object.values(responseData.errors).flat()[0]
        : null;
      toast.error(firstError || responseData?.message || 'Could not clear database data.');
    } finally {
      setClearLoading(false);
    }
  };

  const totalRestoredRows = restoreSummary
    ? Object.values(restoreSummary).reduce((total, count) => total + Number(count || 0), 0)
    : null;
  const totalClearedRows = clearSummary
    ? Object.values(clearSummary).reduce((total, count) => total + Number(count || 0), 0)
    : null;

  return (
    <main className="database-page">
      <header className="database-header mt-5">
        <div>
          <p className="database-eyebrow">ADMINISTRATION</p>
          <h1>Database backup</h1>
          <p className="database-subtitle">Download a data snapshot or restore from a compatible Chapter One backup.</p>
        </div>
      </header>

      <p className="database-security-note">
        Backup files contain private store and account data. Keep downloaded files in a secure location.
        Backups include table data, not database schema or application files.
      </p>

      <section className="database-action" aria-labelledby="database-export-title">
        <div className="database-action-copy">
          <span className="database-action-mark" aria-hidden="true">↓</span>
          <div>
            <h2 id="database-export-title">Download backup</h2>
            <p>Export current application table data as a JSON file. The migration history is not included.</p>
          </div>
        </div>
        <button
          type="button"
          className="database-primary-button"
          onClick={handleDownloadBackup}
          disabled={backupLoading || !token}
        >
          {backupLoading ? 'Preparing backup…' : 'Download database backup'}
        </button>
      </section>

      <section className="database-restore" aria-labelledby="database-restore-title">
        <div className="database-action-copy">
          <span className="database-action-mark restore-mark" aria-hidden="true">↑</span>
          <div>
            <h2 id="database-restore-title">Restore backup</h2>
            <p>Restore replaces current application data with data from the selected backup.</p>
          </div>
        </div>

        <div className="database-danger-note" role="alert">
          This action affects all application records and cannot be undone. Download a fresh backup before restoring.
          The selected backup must match this application&apos;s current database schema.
        </div>

        <form className="database-restore-form" onSubmit={handleRestore}>
          <label className="database-field-label" htmlFor="database-backup-file">Backup file</label>
          <input
            ref={fileInputRef}
            id="database-backup-file"
            className="database-file-input"
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
          />
          <p className="database-field-hint">JSON backup file, up to 100 MB. Restore can take time for larger databases.</p>

          <label className="database-field-label" htmlFor="database-restore-confirmation">
            Type <strong>{RESTORE_CONFIRMATION}</strong> to confirm
          </label>
          <input
            id="database-restore-confirmation"
            className="database-text-input"
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="database-restore-button"
            disabled={restoreLoading || !backupFile || confirmation !== RESTORE_CONFIRMATION || !token}
          >
            {restoreLoading ? 'Restoring data…' : 'Restore database data'}
          </button>
        </form>

        {restoreSummary && (
          <p className="database-success-summary" role="status">
            Restore completed: {totalRestoredRows.toLocaleString()} rows across {Object.keys(restoreSummary).length} tables.
          </p>
        )}
      </section>

      <section className="database-clear" aria-labelledby="database-clear-title">
        <div className="database-action-copy">
          <span className="database-action-mark clear-mark" aria-hidden="true">×</span>
          <div>
            <h2 id="database-clear-title">Clear database data</h2>
            <p>Remove application records while keeping this admin account and store configuration.</p>
          </div>
        </div>

        <div className="database-danger-note" role="alert">
          This permanently removes products, orders, customers, inventory, and other application records.
          Your current admin account and all General Settings, including the logo and payment settings, will be kept.
          Download a backup first. Uploaded files are not deleted.
        </div>

        <form className="database-clear-form" onSubmit={handleClear}>
          <label className="database-field-label" htmlFor="database-clear-confirmation">
            Type <strong>{CLEAR_CONFIRMATION}</strong> to confirm
          </label>
          <input
            id="database-clear-confirmation"
            className="database-text-input"
            type="text"
            value={clearConfirmation}
            onChange={(event) => setClearConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="database-clear-button"
            disabled={clearLoading || clearConfirmation !== CLEAR_CONFIRMATION || !token}
          >
            {clearLoading ? 'Clearing data…' : 'Clear database data'}
          </button>
        </form>

        {clearSummary && (
          <p className="database-success-summary" role="status">
            Data cleared: {totalClearedRows.toLocaleString()} rows across {Object.keys(clearSummary).length} tables.
          </p>
        )}
      </section>
    </main>
  );
};

export default AdminDatabase;
