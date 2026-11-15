interface GoogleCodeResponse {
  code?: string;
  error?: string;
  error_description?: string;
}

interface GoogleOAuth {
  initCodeClient: (options: {
    client_id: string;
    scope: string;
    ux_mode: "popup";
    select_account: boolean;
    callback: (response: GoogleCodeResponse) => void;
    error_callback: (error: { type: string }) => void;
  }) => { requestCode: () => void };
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth } };
  }
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
let sdkPromise: Promise<GoogleOAuth> | undefined;

export const loadGoogleAuth = (): Promise<GoogleOAuth> => {
  if (!clientId) {
    return Promise.reject(new Error("Google sign-in is currently unavailable. Please use email instead."));
  }

  const oauth = window.google?.accounts?.oauth2;
  if (oauth) return Promise.resolve(oauth);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<GoogleOAuth>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;

    const fail = () => {
      window.clearTimeout(timeout);
      script.remove();
      reject(new Error("Unable to load Google sign-in. Please check your connection and try again."));
    };
    const timeout = window.setTimeout(fail, 15000);

    script.onload = () => {
      const loadedOAuth = window.google?.accounts?.oauth2;
      if (!loadedOAuth) return fail();
      window.clearTimeout(timeout);
      resolve(loadedOAuth);
    };
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    sdkPromise = undefined;
    throw error;
  });

  return sdkPromise;
};

export const requestGoogleCode = async (): Promise<string> => {
  const oauth = await loadGoogleAuth();

  return new Promise((resolve, reject) => {
    const client = oauth.initCodeClient({
      client_id: clientId,
      scope: "openid email profile",
      ux_mode: "popup",
      select_account: true,
      callback: (response) => {
        if (response.error || !response.code) {
          reject(new Error("Google could not authorize sign-in. Please try again."));
          return;
        }
        resolve(response.code);
      },
      error_callback: (error) => {
        reject(new Error(
          error.type === "popup_closed"
            ? "Google sign-in was cancelled. Please try again when you're ready."
            : "Unable to open Google sign-in. Please allow pop-ups and try again."
        ));
      },
    });
    client.requestCode();
  });
};
