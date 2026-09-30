import { Route, Routes } from 'react-router-dom'
import { AppShell, AuthLayout, Column, Toasts } from '@/components/layout'
import Admin from '@/pages/admin/Admin'
import Chat from '@/pages/app/Chat'
import Discover from '@/pages/app/Discover'
import MemberProfile from '@/pages/app/MemberProfile'
import MyProfile from '@/pages/app/MyProfile'
import { Matches, Mentors, Messages } from '@/pages/app/Social'
import { Ethics, PhotoUpload, Subscribe } from '@/pages/auth/Gates'
import ProfileWizard from '@/pages/auth/ProfileWizard'
import SignIn from '@/pages/auth/SignIn'
import { AgeVerification, IdentityVerification, NotEligible } from '@/pages/auth/Verify'
import Welcome from '@/pages/auth/Welcome'
import Screens, { States } from '@/pages/Screens'
import { Blog, BlogPost, SessionDetail, Sessions } from '@/pages/settings/Content'
import Legal from '@/pages/settings/Legal'
import Settings, { DeleteAccount, Refer } from '@/pages/settings/Settings'
import StogieSearch from '@/pages/settings/StogieSearch'

// Phase 0: every screen is reachable. Route guards (auth, age, ethics, photo,
// subscription) are added in Phase 2 and enforced in the database, not only here.
export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<SignIn mode="login" />} />
          <Route path="/signup" element={<SignIn mode="signup" />} />
          <Route path="/verify/age" element={<AgeVerification />} />
          <Route path="/verify/not-eligible" element={<NotEligible />} />
          <Route path="/verify/identity" element={<IdentityVerification />} />
          <Route path="/ethics" element={<Ethics />} />
          <Route path="/photo" element={<PhotoUpload />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/onboarding/:step" element={<ProfileWizard />} />
          <Route path="/legal/:doc" element={<Legal />} />
          <Route path="/screens" element={<Screens />} />
          <Route path="/states" element={<States />} />
        </Route>
        <Route element={<AppShell />}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/member/:id" element={<MemberProfile />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Chat />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/profile/edit/:step" element={<ProfileWizard edit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/subscription" element={<Subscribe settings />} />
          <Route path="/settings/search" element={<StogieSearch />} />
          <Route path="/settings/sessions" element={<Sessions />} />
          <Route path="/settings/sessions/:id" element={<SessionDetail />} />
          <Route path="/settings/blog" element={<Blog />} />
          <Route path="/settings/blog/:slug" element={<BlogPost />} />
          <Route path="/settings/refer" element={<Refer />} />
          <Route path="/settings/delete" element={<DeleteAccount />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Column><Screens /></Column>} />
      </Routes>
      <Toasts />
    </>
  )
}
