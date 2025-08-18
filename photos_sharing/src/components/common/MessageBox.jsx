// src/components/common/MessageBox.jsx

export default function MessageBox({ message, type, onClose }) {
  // Determine the correct class and icon based on the 'type' prop
  const messageBoxClass = `message-box ${type}`;
  const icon = type === 'success' ? '✓' : '!';

  return (
    <div className={messageBoxClass}>
      <span className="message-box-icon">{icon}</span>
      <span className="message-box-text">{message}</span>
      <button onClick={onClose} className="message-box-close">&times;</button>
    </div>
  );
}