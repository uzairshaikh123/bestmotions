import React from "react";
import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <article className="site-legal">
      <section className="site-page-hero">
        <p className="site-kicker">Legal</p>
        <h1 className="site-heading-anim">
          <span className="site-heading-line">Privacy Policy</span>
        </h1>
        <p className="site-lead">Last updated {new Date().getFullYear()}</p>
      </section>

      <section className="site-prose site-legal-body">
        <h2>What we collect</h2>
        <p>
          When you use BestMotions, we may store template preferences in your
          browser (such as theme and saved assets). If you submit feedback or
          contact us, we store the name, email, and message you provide so we can
          respond and improve the product.
        </p>

        <h2>How we use information</h2>
        <p>
          Feedback and contact messages are used to support product decisions,
          fix issues, and reply when needed. We do not sell personal information.
        </p>

        <h2>Storage</h2>
        <p>
          Feedback submissions are stored on our application server. Browser-only
          preferences stay on your device unless you clear site data.
        </p>

        <h2>Third parties</h2>
        <p>
          Hosting and infrastructure providers may process technical logs
          (such as IP addresses and request metadata) as part of operating the
          service.
        </p>

        <h2>Analytics</h2>
        <p>
          If you accept analytics cookies, we use Google Analytics 4 to measure
          site traffic (for example, page views and approximate location derived
          by Google). We configure it with Consent Mode, IP anonymization, and
          advertising / remarketing signals turned off. If you reject analytics
          cookies, we do not send measurement events. You can change your choice
          anytime via the Cookies control on the site. Google&apos;s processing
          of this data is described in{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s Privacy Policy
          </a>
          .
        </p>

        <h2>Contact</h2>
        <p>
          Questions about privacy can be sent through our{" "}
          <Link to="/feedback">feedback form</Link>.
        </p>
      </section>
    </article>
  );
}

export function TermsPage() {
  return (
    <article className="site-legal">
      <section className="site-page-hero">
        <p className="site-kicker">Legal</p>
        <h1 className="site-heading-anim">
          <span className="site-heading-line">Terms of Use</span>
        </h1>
        <p className="site-lead">Last updated {new Date().getFullYear()}</p>
      </section>

      <section className="site-prose site-legal-body">
        <h2>Using BestMotions</h2>
        <p>
          BestMotions provides browser-based motion templates and related tools.
          You agree to use the service lawfully and not to abuse, disrupt, or
          attempt unauthorized access to the product or its systems.
        </p>

        <h2>Content you create</h2>
        <p>
          You are responsible for the text, images, and other assets you upload
          or export. Do not upload content you do not have rights to use.
        </p>

        <h2>Availability</h2>
        <p>
          Features may change, and some capabilities (such as Magic Board or AI)
          may be marked coming soon. We may update or discontinue parts of the
          service with reasonable notice when practical.
        </p>

        <h2>Disclaimer</h2>
        <p>
          The service is provided as available. To the fullest extent permitted
          by law, BestMotions disclaims warranties around uninterrupted access or
          fitness for a particular purpose.
        </p>

        <h2>Feedback</h2>
        <p>
          If you send ideas or feedback, you grant us permission to use them to
          improve the product without obligation to compensate you.
        </p>

        <h2>Questions</h2>
        <p>
          Reach us through the <Link to="/feedback">feedback form</Link>.
        </p>
      </section>
    </article>
  );
}
