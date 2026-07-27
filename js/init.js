/* ==========================================================================
   CHIẾN BINH OS — Khởi tạo Supabase + kiểm tra session
   File này là ES Module, load sau tất cả các script thường.
   ========================================================================== */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL  = 'https://okjigwrueeqdikbxdsbc.supabase.co'
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ramlnd3J1ZWVxZGlrYnhkc2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMzQ1OTksImV4cCI6MjEwMDcxMDU5OX0.Ir-JzoF3jdOpEDj5759Hi4c6gs79L3uVrzr985GAnqg'

window._sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// Kiểm tra session cũ trong localStorage → tự động đăng nhập lại
const { data: { session } } = await window._sb.auth.getSession()

if (session) {
  const phone = session.user.email.replace('@chienbinh.local', '')
  const warrior = state.warriors.find(w => w.phone === phone)
  if (warrior && warrior.active !== false) {
    state.currentUserId = warrior.id
    state.tab = 'home'
    setupSeason()
    enterApp()
  } else {
    // Session hết hạn hoặc tài khoản bị ngưng
    await window._sb.auth.signOut()
    setupSeason()
    renderLogin()
  }
} else {
  setupSeason()
  renderLogin()
}
