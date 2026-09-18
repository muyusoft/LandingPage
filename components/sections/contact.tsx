"use client";

import { ArrowIcon } from "@/components/ui/arrow-icon";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { selectService, useSelectedService, type ServiceKey } from "@/lib/service-selection";
import styles from "./start-contact.module.css";

const ENDPOINT = "https://api.web3forms.com/submit";
const SERVICES = ["prototype", "custom", "team", "unsure"] as const;
const BUDGETS = ["unsure", "under10k", "10to25k", "25to50k", "over50k"] as const;
const REQUIRED_FIELDS = ["message", "name", "email"] as const;
type FieldName = (typeof REQUIRED_FIELDS)[number];
type FieldErrors = Partial<Record<FieldName, string>>;
type FormStatus = "idle" | "submitting" | "success" | "error";
type Control = HTMLInputElement | HTMLTextAreaElement;

export function Contact() {
  const t = useTranslations("Contact");
  const service = useSelectedService();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [receipt, setReceipt] = useState<{ email: string; service: ServiceKey } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const requestErrorRef = useRef<HTMLParagraphElement>(null);
  const sending = useRef(false);

  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus({ preventScroll: true });
      successRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
    } else if (status === "error") {
      requestErrorRef.current?.focus();
    }
  }, [status]);

  function fieldError(field: Control, name: FieldName) {
    if (!field.value.trim()) return t(`validation.${name}`);
    if (name === "email" && field.validity.typeMismatch) return t("emailError");
    return undefined;
  }

  function validateField(field: Control, name: FieldName) {
    setErrors(current => ({ ...current, [name]: fieldError(field, name) }));
  }

  function fieldEvents(name: FieldName) {
    return {
      onBlur: (event: FormEvent<Control>) => validateField(event.currentTarget, name),
      onChange: (event: FormEvent<Control>) => {
        if (errors[name]) validateField(event.currentTarget, name);
      },
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const honeypot = form.elements.namedItem("company_website") as HTMLInputElement;
    if (honeypot.value) return;

    const nextErrors: FieldErrors = {};
    for (const name of REQUIRED_FIELDS) {
      const field = form.elements.namedItem(name) as Control;
      const error = fieldError(field, name);
      if (error) nextErrors[name] = error;
    }
    setErrors(nextErrors);
    setSubmitted(true);
    const invalid = REQUIRED_FIELDS.find(name => nextErrors[name]);
    if (invalid) {
      (form.elements.namedItem(invalid) as Control).focus();
      return;
    }

    // Capture enabled controls before the pending state disables the fields.
    const body = new FormData(form);
    for (const name of [...REQUIRED_FIELDS, "company"]) {
      body.set(name, String(body.get(name) ?? "").trim());
    }
    const submittedReceipt = { email: String(body.get("email")), service };
    sending.current = true;
    setStatus("submitting");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST", body, headers: { Accept: "application/json" }, signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error("Contact request failed");
      setReceipt(submittedReceipt);
      setStatus("success");
      trackEvent("contact_form_submit", { section: "contact", service });
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
      sending.current = false;
    }
  }

  function startAnotherMessage() {
    formRef.current?.reset();
    setErrors({});
    setSubmitted(false);
    setReceipt(null);
    setStatus("idle");
    requestAnimationFrame(() => (formRef.current?.elements.namedItem("message") as HTMLTextAreaElement)?.focus());
  }

  const hasErrors = REQUIRED_FIELDS.some(name => errors[name]);

  return (
    <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className={`${styles.section} ${styles.contactSection}`}>
      <div className={`${styles.wrap} ${styles.contactGrid}`}>
        <div data-section-enter="" className={styles.contactCopy}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id="contact-title">{t("title")}<br /><span>{t("titleAccent")}</span></h2>
          <p className={styles.contactLead}>{t("description")}</p>
          <div className={styles.promise}>
            <span className={styles.promiseIcon} aria-hidden="true"><ArrowIcon /></span>
            <div><strong>{t("contactInfo.responseTime")}</strong><small>{t("responseNote")}</small></div>
          </div>
          <ol className={styles.nextSteps}>
            {(["one", "two", "three"] as const).map((key, i) => <li key={key}><span aria-hidden="true">0{i + 1}</span>{t(`nextSteps.${key}`)}</li>)}
          </ol>
          <div className={styles.direct}>
            <p>{t("directPrompt")}</p>
            <a href={`mailto:${t("contactInfo.email")}`}>{t("contactInfo.email")} <span aria-hidden="true"><ArrowIcon /></span></a>
            <small>{t("contactInfo.location")}</small>
          </div>
        </div>
        <div data-section-enter="" className={styles.formCard}>
          <div className={styles.formHeader}><h3>{t("formTitle")}</h3><span>{t("formKicker")}</span></div>
          <form ref={formRef} className={styles.formBody} onSubmit={handleSubmit} noValidate hidden={status === "success"} aria-busy={status === "submitting"}>
            {submitted && hasErrors && <div className={styles.errorSummary} role="alert">{t("errorSummary")}</div>}
            <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? ""} />
            <input type="text" name="company_website" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <fieldset className={styles.formFields} disabled={status === "submitting"}>
              <legend className="sr-only">{t("formTitle")}</legend>
              <fieldset className={styles.fieldSet} aria-describedby="service-hint">
                <legend>{t("fields.projectType")}</legend>
                <div className={styles.choices}>
                  {SERVICES.map(key => <div className={styles.choice} key={key}>
                    <input type="radio" name="project_type" id={`service-${key}`} value={key} checked={service === key} onChange={() => selectService(key)} />
                    <label htmlFor={`service-${key}`}>{t(`serviceChoices.${key}`)}</label>
                  </div>)}
                </div>
                <p className={styles.contextHint} id="service-hint">{t(`serviceHints.${service}`)}</p>
              </fieldset>
              <div className={styles.field}>
                <label htmlFor="message">{t("fields.message")}</label>
                <textarea className={styles.control} id="message" name="message" rows={3} required placeholder={t("placeholders.message")} aria-describedby="message-hint message-error" aria-invalid={Boolean(errors.message)} {...fieldEvents("message")} />
                <p className={styles.fieldHint} id="message-hint">{t("messageHint")}</p>
                <p className={styles.error} id="message-error">{errors.message}</p>
              </div>
              <div className={styles.twoFields}>
                {(["name", "email"] as const).map(name => <div className={styles.field} key={name}>
                  <label htmlFor={name}>{t(`fields.${name}`)}</label>
                  <input className={styles.control} id={name} name={name} type={name === "email" ? "email" : "text"} autoComplete={name} inputMode={name === "email" ? "email" : undefined} required placeholder={t(`placeholders.${name}`)} aria-describedby={`${name}-error`} aria-invalid={Boolean(errors[name])} {...fieldEvents(name)} />
                  <p className={styles.error} id={`${name}-error`}>{errors[name]}</p>
                </div>)}
              </div>
              <details className={styles.extra}>
                <summary>{t("extraTitle")}<span>{t("optional")}</span></summary>
                <div className={styles.field}>
                  <label htmlFor="company">{t("fields.company")}<small>{t("optional")}</small></label>
                  <input className={styles.control} id="company" name="company" autoComplete="organization" placeholder={t("placeholders.company")} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="budget">{t("fields.budget")}<small>{t("optional")} · USD</small></label>
                  <select className={styles.control} id="budget" name="budget" defaultValue="unsure" aria-describedby="budget-hint">
                    {BUDGETS.map(key => <option key={key} value={key}>{t(`budgetOptions.${key}`)}</option>)}
                  </select>
                  <p className={styles.fieldHint} id="budget-hint">{t("budgetHint")}</p>
                </div>
              </details>
              <button className={styles.submit} type="submit" disabled={status === "submitting"}>
                <span>{status === "submitting" ? t("submitting") : t("submit")}</span><span aria-hidden="true"><ArrowIcon /></span>
              </button>
            </fieldset>
            <p className={styles.formEnd}>{t("dataNote")}</p>
            {status === "error" && <p ref={requestErrorRef} className={styles.error} tabIndex={-1} role="alert">
              {t("errorMessage")} <a className="underline" href={`mailto:${t("contactInfo.email")}`}>{t("contactInfo.email")}</a>
            </p>}
          </form>
          {status === "success" && receipt && <div ref={successRef} className={styles.success} tabIndex={-1} aria-labelledby="contact-success-title">
            <span className={styles.successIcon} aria-hidden="true">✓</span>
            <h3 id="contact-success-title">{t("successTitle")}</h3>
            <p>{t("successDescription")}</p>
            <div className={styles.receipt}>
              <p><span>{t("receipt.interest")}</span><strong>{t(`projectTypeOptions.${receipt.service}`)}</strong></p>
              <p><span>{t("receipt.email")}</span><strong>{receipt.email}</strong></p>
              <p><span>{t("receipt.next")}</span>{t("contactInfo.responseTime")}</p>
            </div>
            <button type="button" className={styles.secondary} onClick={startAnotherMessage}>{t("newMessage")}</button>
          </div>}
        </div>
      </div>
    </section>
  );
}
