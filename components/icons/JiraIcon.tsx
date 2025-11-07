
import React from 'react';

const JiraIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M22.518 9.584a2.388 2.388 0 00-1.42-2.173 2.38 2.38 0 00-2.433.51l-7.92 7.92-3.66-3.66a2.38 2.38 0 00-3.366 0 2.38 2.38 0 000 3.366l5.4 5.4a2.38 2.38 0 003.366 0l9.6-9.6a2.382 2.382 0 00.033-3.363z"></path>
    <path d="M12.148.914a2.38 2.38 0 00-1.683.698L.938 11.139a2.382 2.382 0 000 3.366 2.38 2.38 0 003.366 0l5.55-5.55 2.16-2.16-3.18-3.18 3.314-3.312z"></path>
  </svg>
);

export default JiraIcon;
