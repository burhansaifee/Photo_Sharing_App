// src/components/common/PasswordProtect.jsx
import { useState } from 'react';
import MessageBox from './MessageBox';

export default function PasswordProtect({ onPasswordSubmit }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    onPasswordSubmit(password);
  };

  return (
    <div className="password-prompt-container">
      <div className="password-prompt-box">
        <h3>Password Protected Album</h3>
        <p>Please enter the password to view this album.</p>
        {error && <MessageBox message={error} type="error" onClose={() => setError('')} />}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter password"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}