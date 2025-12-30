/**
 * ActionButton - Quick action button
 */

import { Link } from 'react-router-dom';

export default function ActionButton({ icon: Icon, label, to, primary = false, onClick }) {
  const className = `btn ${primary ? 'btn-primary' : 'btn-secondary'} flex-1`;

  const content = (
    <>
      {Icon && <Icon size={20} />}
      {label}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {content}
    </button>
  );
}
