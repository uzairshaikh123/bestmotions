import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../../backend";
import { fetchWithTimeout } from "../../http";

type Props = {
  title?: string;
  kicker?: string;
  lead?: string;
};

export function FeedbackForm({
  title = "Share feedback",
  kicker = "Feedback",
  lead = "Ideas, bugs, template requests — tell us what would make BestMotions better.",
}: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    setStatus("sending");
    setError(null);
    try {
      const res = await fetchWithTimeout(
        apiUrl("/api/feedback"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        },
        20_000,
        "Feedback",
      );
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(payload.error || "Could not send feedback.");
      }
      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send feedback.");
    }
  }

  return (
    <>
      <section className="site-page-hero">
        <p className="site-kicker">{kicker}</p>
        <h1 className="site-heading-anim">
          <span className="site-heading-line">{title}</span>
        </h1>
        <p className="site-lead">{lead}</p>
      </section>

      <section className="site-section">
        <div className="site-contact-grid">
          <form className="site-contact-form" onSubmit={onSubmit}>
            <label>
              <span>Name</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              <span>Message</span>
              <textarea name="message" rows={6} required minLength={8} />
            </label>
            <button type="submit" className="site-cta" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send feedback"}
            </button>
            {status === "sent" ? (
              <p className="site-form-note site-form-ok">
                Thanks — your feedback was saved. We will review it soon.
              </p>
            ) : null}
            {status === "error" && error ? (
              <p className="site-form-note site-form-error">{error}</p>
            ) : null}
          </form>

          <aside className="site-contact-aside">
            <h2>Prefer to explore first?</h2>
            <p>Jump into the template studio — no account needed right now.</p>
            <Link to="/app" className="site-cta site-cta-ghost">
              Open Studio
            </Link>
            <h2>Legal</h2>
            <p>
              Read our <Link to="/privacy">Privacy</Link> and{" "}
              <Link to="/terms">Terms</Link>.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

export function FeedbackPage() {
  return <FeedbackForm />;
}

export function ContactPage() {
  return (
    <FeedbackForm
      kicker="Contact"
      title="Get in touch"
      lead="Partnerships, template requests, or product questions — send a note through the form and we will store it for review."
    />
  );
}
