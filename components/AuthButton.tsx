'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useI18n } from '@/lib/i18n/useI18n';

const AuthButton = () => {
  const { data: session } = useSession();
  const t = useI18n();

  if (session) {
    return (
      <>
        {t.auth.signedInAs} {session.user?.email} <br />
        <button
          onClick={() => signOut()}
          aria-label={t.auth.signOut}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          {t.auth.signOut}
        </button>
      </>
    );
  }
  return (
    <>
      {t.auth.notSignedIn} <br />
      <button
        onClick={() => signIn('github')}
        aria-label={t.auth.signIn}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {t.auth.signIn}
      </button>
    </>
  );
};

export default AuthButton;
