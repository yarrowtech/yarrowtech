import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import "./CaptchaField.css";
import API from "../services/api";

/* Captcha for the public signup forms. The backend decides which kind is used:
     builtin    an image with letters the visitor types (works with no third-party account)
     turnstile  Cloudflare Turnstile (needs VITE_TURNSTILE_SITE_KEY at build time)
   `onToken` receives the string the backend's /captcha/verify expects, or "" when the
   visitor has not completed the check. */

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

let configPromise;
const loadConfig = () => {
  if (!configPromise) {
    configPromise = API.get("/efnbmms/captcha/config")
      .then((res) => ({
        enabled: Boolean(res.data?.enabled),
        provider: res.data?.provider || "off",
      }))
      .catch(() => {
        configPromise = undefined;
        return { enabled: false, provider: "off" };
      });
  }
  return configPromise;
};

export function useCaptchaConfig() {
  const [config, setConfig] = useState({ enabled: false, provider: "off", loading: true });
  useEffect(() => {
    let active = true;
    loadConfig().then((c) => active && setConfig({ ...c, loading: false }));
    return () => { active = false; };
  }, []);
  return config;
}

/* ───────── Cloudflare Turnstile ───────── */
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise;
const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = SCRIPT_SRC;
      el.async = true;
      el.onload = resolve;
      el.onerror = () => { scriptPromise = undefined; reject(new Error("load failed")); };
      document.head.appendChild(el);
    });
  }
  return scriptPromise;
};

function TurnstileBox({ onToken }) {
  const boxRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    let widget = null;
    loadTurnstile()
      .then(() => {
        if (cancelled || !boxRef.current || !window.turnstile) return;
        widget = window.turnstile.render(boxRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
      })
      .catch(() => onToken(""));
    return () => {
      cancelled = true;
      if (widget != null && window.turnstile) {
        try { window.turnstile.remove(widget); } catch { /* already removed */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={boxRef} style={{ minHeight: 65 }} />;
}

/* ───────── Built-in image captcha ───────── */
function ImageCaptcha({ onToken }) {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    setAnswer("");
    onToken("");
    try {
      const { data } = await API.get("/efnbmms/captcha/challenge", { params: { t: Date.now() } });
      setChallenge({ id: data.id, image: data.image });
    } catch {
      setChallenge(null);
      setError("Could not load the security code. Press New code to try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    setAnswer(value);
    onToken(challenge && value.length >= 4 ? JSON.stringify({ id: challenge.id, answer: value }) : "");
  };

  const ready = answer.length >= 4;

  return (
    <div className="cf-card">
      <div className="cf-head">
        <span className="cf-shield"><ShieldCheck size={18} /></span>
        <div>
          <p className="cf-title">Security check</p>
          <p className="cf-sub">Type the characters you see in the picture.</p>
        </div>
      </div>

      <div className="cf-row">
        <div className="cf-image" aria-live="polite">
          {challenge ? (
            <img src={challenge.image} alt="Security code" draggable={false} />
          ) : (
            <span className="cf-placeholder">{loading ? "Loading code…" : "Code unavailable"}</span>
          )}
        </div>
        <button
          type="button"
          className={`cf-refresh ${loading ? "cf-refresh--spin" : ""}`}
          onClick={refresh}
          disabled={loading}
          aria-label="Get a new code"
        >
          <RefreshCw size={18} />
          <span>New code</span>
        </button>
      </div>

      <input
        type="text"
        className={`cf-input ${ready ? "cf-input--ready" : ""}`}
        value={answer}
        onChange={handleChange}
        placeholder="Enter the code"
        aria-label="Security code"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={8}
      />

      <div className="cf-foot">
        {error ? (
          <span className="cf-error">{error}</span>
        ) : ready ? (
          <span className="cf-ready">✓ Code entered. You can continue.</span>
        ) : (
          <span className="cf-hint">Not case sensitive. Can't read it? Press New code.</span>
        )}
      </div>
    </div>
  );
}

export default function CaptchaField({ onToken }) {
  const config = useCaptchaConfig();
  if (config.loading || !config.enabled) return null;

  return (
    <div className="captcha-field" style={{ margin: "14px 0" }}>
      {config.provider === "turnstile" && TURNSTILE_SITE_KEY ? (
        <TurnstileBox onToken={onToken} />
      ) : (
        <ImageCaptcha onToken={onToken} />
      )}
    </div>
  );
}
