import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Info, Mail, MapPin, MessageSquareText, Send } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useDocumentTitle } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { Option } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/ui/Reveal";

const SUPPORT_EMAIL = "hello@resourcebridge.local";
const SUBJECT_TOPICS: Option[] = [
  { value: "help", label: "Help using Resource Bridge" },
  { value: "donation", label: "Question about a donation" },
  { value: "ngo-verification", label: "NGO verification" },
  { value: "partnership", label: "Partnership or press" },
  { value: "feedback", label: "Feedback or a bug" },
  { value: "other", label: "Something else" },
];

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactPage() {
  useDocumentTitle("Contact us");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [mailtoHref, setMailtoHref] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Please tell us your name.";
    else if (name.trim().length < 2) next.name = "Name looks too short.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!subject) next.subject = "Please choose a topic.";
    if (!message.trim()) next.message = "Message is required.";
    else if (message.trim().length < 10) next.message = "Message should be at least 10 characters.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildMailto = (): string => {
    const lines = [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      "",
      message.trim(),
    ].join("\n");
    const params = new URLSearchParams({
      subject: `[${SUBJECT_TOPICS.find((t) => t.value === subject)?.label ?? "Contact"}] via Resource Bridge`,
      body: lines,
    });
    return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;
    const href = buildMailto();
    setMailtoHref(href);
    try {
      window.location.href = href;
      setSubmitted(true);
    } catch {
      setFormError("We couldn't open your email app. Use the button below instead.");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setFieldErrors({});
    setFormError(null);
    setSubmitted(false);
    setMailtoHref(null);
  };

  return (
    <div>
      <section className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-transparent">
        <Container className="py-16 text-center sm:py-20">
          <Reveal y={12}>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Contact & help</p>
            <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ink-900 text-balance sm:text-4xl">
              We'd love to hear from you
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-500">
              Questions about donating, an NGO application, or feedback on the platform — reach out
              and the team will get back to you.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <Reveal>
              <h2 className="text-xl font-bold tracking-tight text-ink-900">Support & contact</h2>
              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Mail className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Email</p>
                    <p className="mt-0.5 text-sm text-ink-500">{SUPPORT_EMAIL}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Clock className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Response time</p>
                    <p className="mt-0.5 text-sm text-ink-500">Within 1–2 business days.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">Location</p>
                    <p className="mt-0.5 text-sm text-ink-500">Mumbai, Maharashtra, India</p>
                  </div>
                </li>
              </ul>

              <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50/60 p-5">
                <p className="text-sm font-semibold text-ink-900">Before you write</p>
                <ul className="mt-3 space-y-2 text-sm text-ink-500">
                  <li>
                    <Link to={ROUTES.howItWorks} className="font-medium text-brand-700 underline-offset-4 hover:underline">
                      How it works
                    </Link>{" "}
                    — the full donation journey for donors and NGOs.
                  </li>
                  <li>
                    <Link to={ROUTES.categories} className="font-medium text-brand-700 underline-offset-4 hover:underline">
                      Donation categories
                    </Link>{" "}
                    — what you can give.
                  </li>
                  <li>
                    <Link to={ROUTES.ngos} className="font-medium text-brand-700 underline-offset-4 hover:underline">
                      Find an NGO
                    </Link>{" "}
                    — verified organisations on the bridge.
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120} className="min-w-0">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill in the form and your message opens in your email app, ready to send.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="space-y-5">
                    <div
                      role="status"
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800"
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        Your message is ready
                      </div>
                      <p className="mt-1.5 leading-relaxed">
                        Nothing has been sent to a server — Resource Bridge is in preview, so
                        contact messages are composed locally. Send the email from your mail app
                        to reach the team at <span className="font-medium">{SUPPORT_EMAIL}</span>.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <a href={mailtoHref ?? undefined}>
                        <Button leftIcon={<Mail className="h-4 w-4" />}>Open in my email app</Button>
                      </a>
                      <Button variant="outline" onClick={resetForm}>
                        Write another message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div
                      className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
                      role="note"
                    >
                      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <p>
                        Frontend-only build: messages aren't posted to a server. Submitting opens
                        your email app with the message prefilled.
                      </p>
                    </div>

                    {formError && (
                      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {formError}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Name"
                        autoComplete="name"
                        placeholder="Your full name"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        error={fieldErrors.name}
                        aria-invalid={Boolean(fieldErrors.name)}
                      />
                      <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        error={fieldErrors.email}
                        aria-invalid={Boolean(fieldErrors.email)}
                      />
                    </div>

                    <Select
                      label="Subject"
                      placeholder="Choose a topic…"
                      required
                      options={SUBJECT_TOPICS}
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      error={fieldErrors.subject}
                      aria-invalid={Boolean(fieldErrors.subject)}
                    />

                    <Textarea
                      label="Message"
                      placeholder="How can we help?"
                      required
                      rows={5}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      error={fieldErrors.message}
                      aria-invalid={Boolean(fieldErrors.message)}
                    />

                    <Button type="submit" fullWidth size="lg" leftIcon={<Send className="h-4 w-4" />}>
                      Prepare message
                    </Button>
                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
                      <MessageSquareText className="h-3.5 w-3.5" aria-hidden />
                      No account needed to contact us.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
            </Reveal>
          </div>
        </Container>
      </section>
    </div>
  );
}