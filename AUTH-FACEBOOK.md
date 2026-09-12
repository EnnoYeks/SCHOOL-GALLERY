# Facebook sign-in for HSHS World

The login page already shows **Continue with Facebook**. The app code now opens Facebook in a popup and saves the student profile.

Facebook will not finish until these console steps are done. Google can work before Facebook because Google does not need a separate app secret in the same way.

## 1. Create a Facebook app

1. Open [Facebook Developers](https://developers.facebook.com/apps/).
2. Create an app (type: **Consumer** / authenticate users).
3. Add the **Facebook Login** product.
4. Under Facebook Login → Settings:
   - Client OAuth Login: **Yes**
   - Web OAuth Login: **Yes**
   - Valid OAuth Redirect URIs, add exactly:
     - `https://school-gallery-62032.firebaseapp.com/__/auth/handler`
5. Under Settings → Basic:
   - App Domains: `hshsgallery.vercel.app` and `school-gallery-62032.firebaseapp.com`
   - Add platform **Website** with site URL `https://hshsgallery.vercel.app/`
6. Copy the **App ID** and **App Secret**.

Ask Facebook for `email` and `public_profile` only.

## 2. Enable Facebook in Firebase

1. Open Firebase Console → project **school-gallery-62032**.
2. Authentication → Sign-in method → **Facebook** → Enable.
3. Paste the Facebook App ID and App Secret.
4. Save. Firebase shows the redirect URI above — it must match the Facebook app.

## 3. Allow the live website domain

Authentication → Settings → **Authorized domains**, add:

- `hshsgallery.vercel.app`
- `localhost` (for local tests)

If this is missing you get `auth/unauthorized-domain`.

If Facebook is not enabled you get `auth/operation-not-allowed`.

## 4. Test

1. Merge this branch / wait for Vercel.
2. Open https://hshsgallery.vercel.app/index/login.html
3. Click **Continue with Facebook**.
4. Allow the popup.
5. First-time Facebook users go to **Edit profile** to add Student ID and username.

## Notes

- Students must already have a Facebook account they are allowed to use.
- If the same email was used with Google first, Firebase will say the account exists with a different method. Sign in with Google, then we can link Facebook later if needed.
- Keep the Facebook app in **Live** mode (or add test users) or only the app admin can sign in.
