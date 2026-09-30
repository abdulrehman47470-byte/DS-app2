import { Apple, Eye, EyeOff, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AgeNote, LogoMark } from '@/components/brand'
import { Button, Field, Input, TopBar } from '@/components/ui'
import { useApp } from '@/lib/store'

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function SignIn({ mode }: { mode: 'login' | 'signup' }) {
  const nav = useNavigate()
  const { set } = useApp()
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const signup = mode === 'signup'

  const proceed = () => {
    set({ signedIn: true })
    nav(signup ? '/verify/age' : '/discover')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setError(undefined)
    proceed()
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar back="/" />
      <div className="flex flex-1 flex-col px-6 pb-8">
        <LogoMark size={40} />
        <h1 className="mt-4 font-serif text-[32px] leading-tight">{signup ? 'Create your account' : 'Welcome Back'}</h1>
        <p className="mt-1 text-[15px] text-ink-muted">
          {signup ? 'Join a private circle of cigar enthusiasts.' : 'Sign in to continue your journey.'}
        </p>

        <div className="mt-8 space-y-3">
          <Button variant="secondary" size="lg" block onClick={proceed}>
            <GoogleG /> Continue with Google
          </Button>
          <Button variant="secondary" size="lg" block onClick={proceed}>
            <Apple size={19} strokeWidth={1.75} aria-hidden /> Continue with Apple
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
          <span className="h-px flex-1 bg-line" /> OR <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Mail size={16} strokeWidth={1.6} className="text-gold-deep" /> {signup ? 'Sign up' : 'Sign in'} with email
          </p>
          <Field label="Email address" htmlFor="email">
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password" error={error}>
            <div className="relative">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete={signup ? 'new-password' : 'current-password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:text-ink"
              >
                {show ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
              </button>
            </div>
          </Field>
          <Button type="submit" size="lg" block>
            Continue
          </Button>
          {!signup && (
            <button type="button" className="mx-auto block min-h-11 text-sm font-medium text-gold-ink hover:underline">
              Forgot password?
            </button>
          )}
        </form>

        <div className="flex-1" />
        <p className="mt-8 text-center text-sm text-ink-muted">
          {signup ? 'Already a member? ' : 'New here? '}
          <Link to={signup ? '/login' : '/signup'} className="font-semibold text-gold-ink hover:underline">
            {signup ? 'Log in' : 'Create an account'}
          </Link>
        </p>
        <AgeNote className="mt-4" />
      </div>
    </div>
  )
}
