# Deployment Checklist

Use this checklist to ensure CortexAmp is production-ready before Monday.

## Pre-Deployment Checklist

### Database

- [ ] All migrations applied successfully
- [ ] Seed data loaded (tracks and challenges)
- [ ] RLS policies enabled and tested
- [ ] Auto-create profile trigger working
- [ ] At least 21 challenges published for the week

### Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-only)
- [ ] `OPENAI_API_KEY` set (server-only)
- [ ] `AI_ENABLED=true` set

### Authentication

- [ ] Email/password signup works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Middleware protecting /app/* routes
- [ ] Auto-redirect logged-in users from /login and /signup

### Core Flows

- [ ] User can sign up and create account
- [ ] Profile auto-created on signup
- [ ] Dashboard loads with correct data
- [ ] Today's challenge displays correctly
- [ ] User can submit challenge
- [ ] AI feedback generates successfully
- [ ] Feedback displays with score and details
- [ ] Progress updates after submission (completed count, streak, avg score)
- [ ] History page shows past submissions
- [ ] Challenge detail page works
- [ ] Profile settings can be updated

### UI/UX

- [ ] Landing page looks good on desktop
- [ ] Landing page looks good on mobile
- [ ] All app pages responsive
- [ ] Dark mode enabled and looks good
- [ ] No broken links
- [ ] All buttons and forms work
- [ ] Loading states show during async operations
- [ ] Error messages display clearly
- [ ] Empty states look good (no submissions, no challenges)

### Content

- [ ] Landing page copy is compelling
- [ ] Terms of Service complete
- [ ] Privacy Policy complete
- [ ] AI disclaimer visible on feedback
- [ ] FAQ section helpful
- [ ] Pricing page clear (even if Pro is "coming soon")

### SEO & Meta

- [ ] Page titles set for all routes
- [ ] Meta descriptions set
- [ ] OG image created (or placeholder)
- [ ] Twitter card meta tags added
- [ ] Favicon present

### Security

- [ ] No API keys in client-side code
- [ ] Service role key only used server-side
- [ ] RLS policies prevent unauthorized access
- [ ] Rate limiting on AI feedback (5/day)
- [ ] One submission per challenge enforced
- [ ] CORS configured correctly

### Performance

- [ ] Build completes without errors
- [ ] No console errors on any page
- [ ] Images optimized
- [ ] Lighthouse score acceptable (>80)

### Error Handling

- [ ] 404 page exists
- [ ] API errors handled gracefully
- [ ] Network errors show user-friendly messages
- [ ] Failed AI generation doesn't break app

## Deployment Steps

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial CortexAmp deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Import your GitHub repo
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   - Add all variables from `.env.local`
   - Mark `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` as secret

4. **Deploy**
   - Click "Deploy"
   - Wait for build (~2-3 minutes)
   - Test deployed site

5. **Custom Domain (Optional)**
   - Add domain in Vercel settings
   - Configure DNS records
   - Wait for SSL certificate

### Post-Deployment Testing

- [ ] Sign up with new account on production
- [ ] Complete a challenge end-to-end
- [ ] Check all pages load
- [ ] Test on mobile device
- [ ] Share with 2-3 beta users for feedback

## Launch Day Checklist

### Monday Morning

- [ ] Verify today's challenges are published
- [ ] Test signup flow one more time
- [ ] Check Supabase and OpenAI have sufficient credits
- [ ] Monitor error logs

### Monitoring

- [ ] Set up Vercel analytics
- [ ] Monitor Supabase dashboard
- [ ] Check OpenAI usage dashboard
- [ ] Watch for error spikes

### Support

- [ ] Have support email ready
- [ ] Monitor for user issues
- [ ] Be ready to fix critical bugs quickly

## Known Limitations (Document for Users)

- Free tier: 5 AI feedback submissions per day
- One submission per challenge (no retries yet)
- Challenges published daily, can't skip ahead
- Email/password auth only (no OAuth yet)

## Future Enhancements (Post-Launch)

- [ ] Add OAuth providers (Google, GitHub)
- [ ] Implement Stripe for Pro tier
- [ ] Add challenge retry feature
- [ ] Build admin dashboard for challenge management
- [ ] Add social features (sharing, leaderboards)
- [ ] Implement email notifications
- [ ] Add more AI providers (Anthropic, DeepSeek)
- [ ] Create mobile app

## Rollback Plan

If critical issues arise:

1. Revert to previous Vercel deployment
2. Check Supabase logs for errors
3. Verify environment variables
4. Test locally to reproduce issue
5. Fix and redeploy

## Success Metrics

Track these in first week:

- Signups
- Daily active users
- Challenges completed
- Average feedback score
- User retention (day 2, day 7)
- Error rate
- API costs (OpenAI)

---

**Ready to launch? Double-check everything above, then ship it! 🚀**
