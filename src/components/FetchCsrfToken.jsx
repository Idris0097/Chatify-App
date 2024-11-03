import { useEffect, useRef } from 'react';

const FetchCsrfToken = ({ setCsrfToken }) => {
  const hasFetchedToken = useRef(false);

  useEffect(() => {
    if (!hasFetchedToken.current) {
      hasFetchedToken.current = true;

      fetch('https://chatify-api.up.railway.app/csrf', {
        method: 'PATCH',
      })
      .then(res => {
        if (!res.ok) throw new Error('Det gick inte att hämta CSRF-token');
        return res.json();
      })
      .then(data => {
        console.log('Det gick inte att hämta CSRF-token', data.csrfToken);
        setCsrfToken(data.csrfToken);
      })
      .catch(err => {
        console.error('Det gick inte att hämta CSRF-token', err);
        
      });
    }
  }, [setCsrfToken]);

  return null;
};

export default FetchCsrfToken;
