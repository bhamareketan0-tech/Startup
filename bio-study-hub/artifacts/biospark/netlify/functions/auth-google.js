exports.handler = async (event, context) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = "https://earnest-squirrel-d0261e.netlify.app/.netlify/functions/auth-google-callback";
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
  
  return {
    statusCode: 302,
    headers: {
      Location: googleAuthUrl
    }
  };
};
