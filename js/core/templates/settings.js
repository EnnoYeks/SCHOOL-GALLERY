(function (g) {
  'use strict';
  g.HshsTemplates = g.HshsTemplates || {};
  g.HshsTemplates.settings =
'<main class="hshs-settings" id="hshsSettingsRoot">' +
'  <section class="hshs-set-hero">' +
'    <div class="hshs-set-photo">' +
'      <img id="setHeroPic" alt="">' +
'      <button type="button" id="setPhotoBtn" class="hshs-set-cam" aria-label="Change photo"><i class="fas fa-camera"></i></button>' +
'      <input id="setPhotoFile" type="file" accept="image/*" hidden>' +
'    </div>' +
'    <div class="hshs-set-who">' +
'      <strong id="setHeroName">Guest</strong>' +
'      <span id="setHeroUser">Sign in to save your campus profile</span>' +
'      <em id="setHeroMeta">HSHS World</em>' +
'    </div>' +
'  </section>' +
'  <div class="hshs-set-layout">' +
'    <nav class="hshs-set-tabs" aria-label="Settings sections">' +
'      <button type="button" class="hshs-set-tab on" data-set-tab="account"><i class="fas fa-user"></i> Account</button>' +
'      <button type="button" class="hshs-set-tab" data-set-tab="privacy"><i class="fas fa-lock"></i> Privacy</button>' +
'      <button type="button" class="hshs-set-tab" data-set-tab="notifications"><i class="fas fa-bell"></i> Alerts</button>' +
'      <button type="button" class="hshs-set-tab" data-set-tab="theme"><i class="fas fa-palette"></i> Look</button>' +
'    </nav>' +
'    <div class="hshs-set-body">' +
'      <section class="hshs-set-pane on tab-content active" id="accountTab">' +
'        <div id="setSignedState" hidden>' +
'          <h2>Your profile</h2>' +
'          <p class="hshs-set-note">Saved to your HSHS World account. Username is unique on campus.</p>' +
'          <label>Full name<input id="setFullName" type="text" autocomplete="name" placeholder="Your school name"></label>' +
'          <label>Username<span class="hshs-set-prefix">@</span><input id="setUsername" class="has-prefix" type="text" autocomplete="username" placeholder="yourname"></label>' +
'          <label>Email<input id="setEmail" type="email" autocomplete="email" placeholder="you@example.com" readonly></label>' +
'          <div class="hshs-set-two">' +
'            <label>Class<select id="setClass"><option>S1</option><option>S2</option><option>S3</option><option>S4</option><option>S5</option><option>S6</option><option>Staff</option><option>Campus</option></select></label>' +
'            <label>Role<select id="setRole"><option>Student</option><option>Prefect</option><option>Club</option><option>Staff</option></select></label>' +
'          </div>' +
'          <label>Bio<textarea id="setBio" rows="3" maxlength="160" placeholder="Sports, science club, house spirit."></textarea></label>' +
'          <p id="setAccountMsg" class="hshs-set-status" role="status"></p>' +
'          <button type="button" class="hshs-set-btn" id="setSaveAccount"><i class="fas fa-check"></i> Save profile</button>' +
'          <button type="button" class="hshs-set-btn ghost" id="setSendReset">Send password reset email</button>' +
'          <button type="button" class="hshs-set-btn ghost" id="setSignOut">Sign out</button>' +
'        </div>' +
'        <div id="setGuestState">' +
'          <h2>Sign in to HSHS World</h2>' +
'          <p class="hshs-set-note">Use the same email, username, or Google account as the login page. No PIN.</p>' +
'          <div class="hshs-set-auth-tabs">' +
'            <button type="button" class="hshs-set-auth-tab on" data-set-auth="login">Sign in</button>' +
'            <button type="button" class="hshs-set-auth-tab" data-set-auth="signup">Create account</button>' +
'          </div>' +
'          <button type="button" class="hshs-set-btn google" id="setGoogleBtn"><i class="fab fa-google"></i> Continue with Google</button>' +
'          <p class="hshs-set-or">or email and password</p>' +
'          <div id="setLoginBox">' +
'            <label>Email or username<input id="setLoginId" type="text" autocomplete="username" placeholder="name@email.com or username"></label>' +
'            <label>Password<input id="setLoginPassword" type="password" autocomplete="current-password" placeholder="Your password"></label>' +
'            <button type="button" class="hshs-set-btn" id="setLoginBtn">Sign in</button>' +
'            <button type="button" class="hshs-set-link" id="setOpenReset">Forgot password?</button>' +
'          </div>' +
'          <div id="setSignupBox" hidden>' +
'            <label>Full name<input id="setNewName" type="text" autocomplete="name" placeholder="Your school name"></label>' +
'            <label>Username<span class="hshs-set-prefix">@</span><input id="setNewUser" class="has-prefix" type="text" autocomplete="username" placeholder="campusname"></label>' +
'            <label>Email<input id="setNewEmail" type="email" autocomplete="email" placeholder="you@email.com"></label>' +
'            <label>Password<input id="setNewPass" type="password" autocomplete="new-password" placeholder="At least 6 characters"></label>' +
'            <label>Confirm password<input id="setNewPass2" type="password" autocomplete="new-password" placeholder="Repeat password"></label>' +
'            <button type="button" class="hshs-set-btn" id="setCreateAccount">Create account</button>' +
'          </div>' +
'          <div id="setResetBox" hidden>' +
'            <label>Email<input id="setResetEmail" type="email" autocomplete="email" placeholder="you@email.com"></label>' +
'            <button type="button" class="hshs-set-btn" id="setResetBtn">Send reset link</button>' +
'            <button type="button" class="hshs-set-link" id="setBackLogin">Back to sign in</button>' +
'          </div>' +
'          <p id="setGuestMsg" class="hshs-set-status" role="status"></p>' +
'        </div>' +
'      </section>' +
'      <section class="hshs-set-pane tab-content" id="privacyTab">' +
'        <h2>Privacy</h2>' +
'        <label class="hshs-set-switch"><span><b>Public profile</b><small>Students can find you by username</small></span><input type="checkbox" data-pref="publicProfile"></label>' +
'        <label class="hshs-set-switch"><span><b>Activity status</b><small>Show when you were last on HSHS World</small></span><input type="checkbox" data-pref="showActivity"></label>' +
'        <label class="hshs-set-switch"><span><b>Direct messages</b><small>Allow chats from other students</small></span><input type="checkbox" data-pref="allowMessages"></label>' +
'        <label class="hshs-set-switch"><span><b>Show class</b><small>Display S1–S6 on your profile</small></span><input type="checkbox" data-pref="showClass"></label>' +
'        <label class="hshs-set-switch"><span><b>Show likes</b><small>Let others see posts you liked</small></span><input type="checkbox" data-pref="showLikes"></label>' +
'      </section>' +
'      <section class="hshs-set-pane tab-content" id="notificationsTab">' +
'        <h2>Alerts</h2>' +
'        <label class="hshs-set-switch"><span><b>Likes</b><small>When someone likes your post</small></span><input type="checkbox" data-pref="notifyLikes"></label>' +
'        <label class="hshs-set-switch"><span><b>Comments</b><small>Replies on your photos and Buzz</small></span><input type="checkbox" data-pref="notifyComments"></label>' +
'        <label class="hshs-set-switch"><span><b>Mentions</b><small>When a student tags @you</small></span><input type="checkbox" data-pref="notifyMentions"></label>' +
'        <label class="hshs-set-switch"><span><b>Friend requests</b><small>New campus friend invites</small></span><input type="checkbox" data-pref="notifyFriends"></label>' +
'        <label class="hshs-set-switch"><span><b>School alerts</b><small>Assembly, sports day, house points</small></span><input type="checkbox" data-pref="notifySchool"></label>' +
'      </section>' +
'      <section class="hshs-set-pane tab-content" id="themeTab">' +
'        <h2>Look</h2>' +
'        <div class="hshs-set-card"><div><b>Theme</b><small>Changes the whole site immediately</small></div><div class="hshs-theme-picks"><button type="button" class="hshs-theme-pick" data-theme-pick="dark">Dark</button><button type="button" class="hshs-theme-pick" data-theme-pick="light">Light</button></div></div>' +
'        <p class="hshs-set-kicker">Accent</p>' +
'        <div class="hshs-accent-row">' +
'          <button type="button" class="hshs-accent" data-accent="navy"><i></i> Navy + gold</button>' +
'          <button type="button" class="hshs-accent" data-accent="ocean"><i></i> Ocean</button>' +
'          <button type="button" class="hshs-accent" data-accent="forest"><i></i> Forest</button>' +
'        </div>' +
'      </section>' +
'    </div>' +
'  </div>' +
'</main>';
})(typeof window !== 'undefined' ? window : this);
