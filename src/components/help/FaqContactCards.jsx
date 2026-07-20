/**
 * FaqContactCards — FAQ and Contact as two half-width cards that stack on
 * mobile. FAQ gets a copper help-circle tile; Contact a purple mail tile.
 */

import { Link } from 'react-router-dom';
import { HelpCircle, Mail, ChevronRight } from 'lucide-react';
import { getArticle } from '../../content/help';
import { HELP_COPY } from '../../constants/helpCopy';

function MiniCard({ to, Icon, iconColor, tileClass, title, description }) {
  return (
    <Link to={to} className="card p-5 flex items-center gap-4">
      <span className={tileClass} style={{ width: 44, height: 44 }}>
        <Icon size={22} style={{ color: iconColor }} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="heading heading-sm block">{title}</span>
        <span className="text-small text-muted block truncate">{description}</span>
      </span>
      <ChevronRight size={18} style={{ color: 'var(--sage-500)', flexShrink: 0 }} />
    </Link>
  );
}

export default function FaqContactCards() {
  const faq = getArticle(null, HELP_COPY.faq.slug);
  const contact = getArticle(null, HELP_COPY.contact.slug);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {faq && (
        <MiniCard
          to={faq.to}
          Icon={HelpCircle}
          iconColor="var(--copper-500)"
          tileClass="icon-container-cream"
          title={HELP_COPY.faq.title}
          description={HELP_COPY.faq.description}
        />
      )}
      {contact && (
        <MiniCard
          to={contact.to}
          Icon={Mail}
          iconColor="var(--purple-500)"
          tileClass="help-tile help-tile-purple"
          title={HELP_COPY.contact.title}
          description={HELP_COPY.contact.description}
        />
      )}
    </div>
  );
}
