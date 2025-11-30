"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const params = useParams();
  const locale = params.lang as Locale;

  // Note: In client components, we can't directly call getDictionary
  // We'll use a simple approach with hardcoded keys or fetch from API
  const dictionary = {
    signIn: {
      title:
        locale === "de"
          ? "Anmelden"
          : locale === "ar"
          ? "تسجيل الدخول"
          : "Se connecter",
      subtitle:
        locale === "de"
          ? "Geben Sie Ihre E-Mail-Adresse ein, um einen Anmeldelink zu erhalten"
          : locale === "ar"
          ? "أدخل بريدك الإلكتروني لتلقي رابط تسجيل الدخول"
          : "Entrez votre adresse e-mail pour recevoir un lien de connexion",
      emailLabel:
        locale === "de"
          ? "E-Mail-Adresse"
          : locale === "ar"
          ? "البريد الإلكتروني"
          : "Adresse e-mail",
      emailPlaceholder:
        locale === "de"
          ? "Geben Sie Ihre E-Mail ein"
          : locale === "ar"
          ? "أدخل بريدك الإلكتروني"
          : "Entrez votre e-mail",
      sendLink:
        locale === "de"
          ? "Anmeldelink senden"
          : locale === "ar"
          ? "إرسال رابط تسجيل الدخول"
          : "Envoyer le lien de connexion",
      sending:
        locale === "de"
          ? "Wird gesendet..."
          : locale === "ar"
          ? "جارٍ الإرسال..."
          : "Envoi en cours...",
      successMessage:
        locale === "de"
          ? "Überprüfen Sie Ihre E-Mail auf den Anmeldelink. Falls Sie die E-Mail nicht finden, überprüfen Sie bitte Ihren Spam-Ordner."
          : locale === "ar"
          ? "تحقق من بريدك الإلكتروني لرابط تسجيل الدخول. إذا لم تجد الرسالة، يرجى التحقق من مجلد البريد المزعج."
          : "Vérifiez votre e-mail pour le lien de connexion. Si vous ne trouvez pas l'e-mail, vérifiez votre dossier spam.",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(dictionary.signIn.successMessage);
      } else {
        setMessage(data.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {dictionary.signIn?.title || "Sign In"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {dictionary.signIn?.subtitle ||
            "Enter your email to receive a login link"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {dictionary.signIn?.emailLabel || "Email address"}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm"
                  placeholder={
                    dictionary.signIn?.emailPlaceholder || "Enter your email"
                  }
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-primary-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? dictionary.signIn?.sending || "Sending..."
                  : dictionary.signIn?.sendLink || "Send Login Link"}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-6 text-center">
              <p
                className={`text-sm ${
                  message.includes("error") || message.includes("Error")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
