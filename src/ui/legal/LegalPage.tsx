/**
 * Privacy notice and terms. DRAFT wording written for the MVP — have it
 * reviewed by a Mauritian lawyer before launch, and confirm the contact
 * address. English only for now.
 */
import { Link } from 'react-router-dom';
import { useApplyTheme } from '@/lib/useTheme';

const CONTACT = 'privacy@heapspark.com'; // TODO: confirm the real privacy contact

function Privacy() {
  return (
    <>
      <h1>Privacy notice</h1>
      <p>
        Heapspark Life is run by Heapspark (“we”). We follow the Mauritius <strong>Data Protection Act 2017</strong>. This notice explains what we
        collect, why, and your rights.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Account:</strong> a display name and <em>one</em> contact — your email address <em>or</em> mobile number — used only to sign you in.</li>
        <li><strong>Codes:</strong> which promo codes you unlocked, when, and whether they were used.</li>
        <li><strong>Game progress:</strong> Spark Points, district stamps and badges.</li>
        <li><strong>Anonymous usage:</strong> counts of building views, card opens and call/WhatsApp/website taps per business. These are not linked to your account.</li>
        <li><strong>On your device:</strong> preferences (theme, language) and your sign-in session are stored in your browser.</li>
      </ul>
      <p>We do not collect your location, contacts, photos or payment details, and we don't sell personal data.</p>
      <h2>Why</h2>
      <ul>
        <li>To run your account and issue codes that only you can use (performance of our service).</li>
        <li>To prevent abuse, e.g. one code per person per promo (legitimate interest).</li>
        <li>To show businesses simple, anonymous statistics.</li>
      </ul>
      <h2>Who sees it</h2>
      <p>
        When you redeem a code, the business sees your display name and the code — nothing else. Our hosting and database providers process data on
        our behalf under contract.
      </p>
      <h2>How long we keep it</h2>
      <p>
        Until you delete your account. Sign-in codes expire after 10 minutes. When you delete your account we erase your name, contact and unused
        codes; used codes are kept without your identity so the business's statistics stay correct.
      </p>
      <h2>Your rights</h2>
      <p>
        You can access, correct or erase your data, and object to processing. Use <em>Settings → Delete my data</em> in the game, or email{' '}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. You can also complain to the Data Protection Office of Mauritius.
      </p>
      <h2>Children</h2>
      <p>If you are under 16, please ask a parent or guardian before creating an account.</p>
    </>
  );
}

function Terms() {
  return (
    <>
      <h1>Terms of play</h1>
      <h2>Spark Points are not money</h2>
      <p>
        <strong>Spark Points, stamps and badges are just for fun.</strong> They have no cash value, cannot be bought, sold, transferred or exchanged
        for money, and can be changed or reset.
      </p>
      <h2>Promo codes</h2>
      <ul>
        <li>Each code is personal and can be used <strong>once</strong>, at the business that issued it, before it expires.</li>
        <li>Offers are made by the businesses themselves, which set their own rules (e.g. first visit only, minimum spend).</li>
        <li>Codes have no cash value. Abuse (sharing, copying, multiple accounts) may lead to codes being cancelled.</li>
      </ul>
      <h2>Demo content</h2>
      <p>Businesses marked “Demo” are fictional examples and their offers can't be redeemed in real shops.</p>
      <h2>The map</h2>
      <p>The island is a stylised illustration, not an accurate map. Landmarks are generic and not endorsed by their owners.</p>
    </>
  );
}

export default function LegalPage({ doc }: { doc: 'privacy' | 'terms' }) {
  useApplyTheme();
  return (
    <main className="min-h-full bg-white px-5 py-6 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <article className="prose-legal mx-auto max-w-2xl space-y-3 leading-relaxed [&_a]:font-semibold [&_a]:text-spark-600 [&_a]:underline [&_h1]:text-3xl [&_h1]:font-extrabold [&_h2]:pt-3 [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <Link to="/" className="inline-block min-h-11 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold no-underline dark:bg-slate-800">
          ← Back to the island
        </Link>
        {doc === 'privacy' ? <Privacy /> : <Terms />}
        <p className="pt-4 text-xs text-slate-500">Draft — last updated October 2026.</p>
      </article>
    </main>
  );
}
