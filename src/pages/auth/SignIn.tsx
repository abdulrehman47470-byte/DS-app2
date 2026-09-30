import { Apple, Eye, EyeOff, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AgeNote, LogoMark } from '@/components/brand'
import { Button, Field, Input, TopBar } from '@/components/ui'
import { GoogleG, GoogleSignIn, type MockGoogleAccount } from '@/features/auth/GoogleSignIn'
import { useApp } from '@/lib/store'
import { keyboardProps } from '@/lib/forms'

export default function SignIn({ mode }: { mode: 'login' | 'signup' }) {
  const nav = useNavigate()
  const { state, set, toast } = useApp()
  const [google, setGoogle] = useState(false)
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const signup = mode === 'signup'

  const proceed = (account: NonNullable<typeof state.account>) => {
    set((s) => ({
      signedIn: true,
      account,
      // A new Google account fills in the name; members can edit it in the profile wizard.
      demographics: signup && account.provider !== 'email' ? { ...s.demographics, name: account.name } : s.demographics,
    }))
    nav(signup ? '/verify/age' : '/discover')
  }

  const suggested: MockGoogleAccount = {
    name: state.account?.name ?? state.demographics.name,
    email: state.account?.email ?? `${state.demographics.name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@gmail.com`,
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setError(undefined)
    proceed({ provider: 'email', email: email.trim(), name: state.demographics.name })
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
          <Button variant="secondary" size="lg" block onClick={() => setGoogle(true)}>
            <GoogleG /> Continue with Google
          </Button>
          <Button variant="secondary" size="lg" block onClick={() => proceed({ provider: 'apple', email: 'private@privaterelay.appleid.com', name: state.demographics.name })}>
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
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} {...keyboardProps('email')} />
          </Field>
          <Field label="Password" htmlFor="password" error={error}>
            <div className="relative">
              <Input
                id="password"
                {...keyboardProps('password', true)}
                enterKeyHint="go"
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
      <GoogleSignIn
        open={google}
        onClose={() => setGoogle(false)}
        suggested={suggested}
        onSignedIn={(a) => {
          setGoogle(false)
          toast(`Signed in as ${a.email}`)
          proceed({ provider: 'google', ...a })
        }}
      />
    </div>
  )
}
