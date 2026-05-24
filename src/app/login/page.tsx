import { redirect } from 'next/navigation';

/** Login page removed — send visitors to races */
export default function LoginRedirectPage() {
  redirect('/events#events-section');
}
