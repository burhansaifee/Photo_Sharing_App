// src/components/common/MessageBox.jsx

export default function MessageBox({ message, type, onClose }) {
  // Determine the correct class based on the 'type' prop (e.g., 'success' or 'error')
  const messageBoxClass = `message-box ${type}`;

  return (
    <div className={messageBoxClass}>
      <span>{message}</span>
      <button onClick={onClose} className="message-box-close">&times;</button>
    </div>
  );
}