const forgotPasswordHtmlTitle = 'Forgot Password Email Template';
const accountVerificationHtmlTitle = 'Account Verification Email Template';
const headerText = 'GETHUB';
const accountVerificationMessage = (token) => `<h3>Thank you for signing up to Gethub</h3>.

<p>In order to enjoy your favorites articles and also write blog posts, you need to verify your email by clicking on the following link/button:</p>

<p><a href='${process.env.CLIENT_URL}/verify-account/${token}'>Click here to confirm your email.</a></p>

<p>If you did not sign up, you can ignore this email or reply to us if you want us to block your address from further signup attempts.</p>

<h3>Cheers,</h3>
<span>— Marshall Akpan, editor at Gethub</span>`;

const forgotPasswordMessage = (
  token
) => `<p>You are receiving this email because you (or someone else) have requested the reset of a password. </p>
    <p>Please click on the following link, or paste this into your browser to complete the process within half an hour of receiving it: </p>
    <a href='${process.env.CLIENT_URL}/reset-password/${token}'>${process.env.CLIENT_URL}/reset-password/${token}</a>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

// `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${process.env.CLIENT_URL}/reset-password/${resetToken}`;

const EMAIL_HTML_TEMPLATE = (title, text, headerText) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          .container {
            width: 100%;
            height: 100%;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email {
            width: 80%;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
          }
          .email-header {
            background-color: #333;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
          .email-body {
            padding: 20px;
          }
          .email-footer {
            background-color: #333;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <main class="container">
          <section class="email">
            <header class="email-header">
              <h1>${headerText}</h1>
            </header>
            <section class="email-body">
              ${text} 
            </section>
            <hr/>
            <footer class="email-footer">
              <p>© Gethub Ltd, New England Road, Keighley, BD21 5DU, United Kingdom</p>
            </footer>
          </section>
        </main>
      </body>
    </html>
  `;

const ACCOUNT_VERIFICATION_EMAIL_HTML_TEMPLATE = (text) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Account Verification Email Template</title>
        <style>
          .container {
            width: 100%;
            height: 100%;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email {
            width: 80%;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
          }
          .email-header {
            background-color: #333;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
          .email-body {
            padding: 20px;
          }
          .email-footer {
            background-color: #333;
            color: #fff;
            padding: 20px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <main class="container">
          <section class="email">
            <header class="email-header">
              <h1>GETHUB</h1>
            </header>
            <section class="email-body">
              ${text}
            </section>
             <hr/>
            <footer class="email-footer">
              <p>© Gethub Ltd, New England Road, Keighley, BD21 5DU, United Kingdom</p>
            </footer>
          </section>
        </main>
      </body>
    </html>
  `;

export {
  EMAIL_HTML_TEMPLATE,
  ACCOUNT_VERIFICATION_EMAIL_HTML_TEMPLATE,
  forgotPasswordHtmlTitle,
  accountVerificationHtmlTitle,
  headerText,
  accountVerificationMessage,
  forgotPasswordMessage,
};
