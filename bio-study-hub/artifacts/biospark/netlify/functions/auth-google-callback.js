exports.handler = async (event, context) => {
  const code = event.queryStringParameters?.code;
  const error = event.queryStringParameters?.error;
  
  if (error) {
    return {
      statusCode: 302,
      headers: {
        Location: `/login?error=${error}`
      }
    };
  }
  
  if (!code) {
    return {
      statusCode: 302,
      headers: {
        Location: "/login?error=no_code"
      }
    };
  }

  // For now, just redirect to home with the code
  // In a real app, you'd exchange this code for a token
  return {
    statusCode: 302,
    headers: {
      Location: `/?code=${code}&authenticated=true`
    }
  };
};
