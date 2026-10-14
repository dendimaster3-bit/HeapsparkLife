/**
 * Passwordless sign-in / sign-up with email or phone + one-time code.
 * Returning players only enter the code; new players also give a name and
 * accept the privacy notice (Mauritius Data Protection Act 2017).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api';
import { useT, type TranslationKey } from '@/i18n';
import { useSessionStore } from '@/store/useSessionStore';
import type { ContactKind } from '@/types/player';
import { Sheet, inputCls, primaryBtn } from '../common/Sheet';

export function AuthSheet() {
  const t = useT();
  const { authOpen, closeAuth, signedIn } = useSessionStore();
  const [kind, setKind] = useState<ContactKind>('email');
  const [contact, setContact] = useState('');
  const [step, setStep] = useState<'contact' | 'code'>('contact');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | undefined>();
  const [needsProfile, setNeedsProfile] = useState(false);
  const [name, setName] = useState('');
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!authOpen) return null;

  const fail = (e: unknown) => setError(t(`auth.err.${e instanceof Error ? e.message : 'invalid-code'}` as TranslationKey));

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await api.auth.requestCode(kind, contact);
      setDemoCode(r.demoCode);
      setStep('code');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await api.auth.verifyCode({ kind, contact, code, displayName: name, acceptPrivacy: accept });
      // Reset for next time.
      setStep('contact');
      setCode('');
      setNeedsProfile(false);
      signedIn(session);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'name-required' || msg === 'privacy-required') {
        if (needsProfile) fail(e);
        setNeedsProfile(true);
      } else fail(e);
    } finally {
      setBusy(false);
    }
  };

  const tab = (k: ContactKind) =>
    `min-h-11 flex-1 rounded-xl text-sm font-bold ${kind === k ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`;

  return (
    <Sheet title={t('auth.title')} onClose={closeAuth} z="z-[60]">
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t('auth.why')}</p>
      {step === 'contact' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="space-y-3"
        >
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
            <button type="button" role="tab" aria-selected={kind === 'email'} className={tab('email')} onClick={() => setKind('email')}>✉️ {t('auth.email')}</button>
            <button type="button" role="tab" aria-selected={kind === 'phone'} className={tab('phone')} onClick={() => setKind('phone')}>📱 {t('auth.phone')}</button>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">{kind === 'email' ? t('auth.emailLabel') : t('auth.phoneLabel')}</span>
            <input
              className={inputCls}
              type={kind === 'email' ? 'email' : 'tel'}
              inputMode={kind === 'email' ? 'email' : 'tel'}
              autoComplete={kind === 'email' ? 'email' : 'tel'}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={kind === 'email' ? 'you@example.com' : '5712 3456'}
              required
              autoFocus
            />
            {kind === 'phone' && <span className="mt-1 block text-xs text-slate-500">{t('auth.phoneHint')}</span>}
          </label>
          {error && <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
          <button className={primaryBtn} disabled={busy || !contact.trim()}>{t('auth.send')}</button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
          className="space-y-3"
        >
          <p className="text-sm">
            {t('auth.codeSent', { contact })}{' '}
            <button type="button" className="font-semibold text-spark-600 underline dark:text-spark-400" onClick={() => setStep('contact')}>{t('auth.back')}</button>
          </p>
          {demoCode && (
            <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">{t('auth.demoCode', { code: demoCode })}</p>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">{t('auth.codeLabel')}</span>
            <input
              className={`${inputCls} text-center font-mono text-2xl tracking-[0.4em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </label>
          {needsProfile && (
            <div className="space-y-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <p className="font-semibold">{t('auth.newPlayer')}</p>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">{t('auth.nameLabel')}</span>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="given-name" required />
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-spark-500" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
                <span>
                  {t('auth.privacy', { kind: (kind === 'email' ? t('auth.email') : t('auth.phone')).toLowerCase() })}{' '}
                  <Link to="/privacy" target="_blank" className="font-semibold text-spark-600 underline dark:text-spark-400">{t('auth.privacyLink')}</Link>
                </span>
              </label>
            </div>
          )}
          {error && <p role="alert" className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
          <button className={primaryBtn} disabled={busy || code.length !== 6}>{t('auth.verify')}</button>
        </form>
      )}
    </Sheet>
  );
}
