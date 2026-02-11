"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  estimatedLevel: string;
}

interface EducationRegistrationFormProps {
  locale: Locale;
  dictionary: any;
}

export default function EducationRegistrationForm({
  locale,
  dictionary: _dictionary,
}: EducationRegistrationFormProps) {
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    // Requester data
    requesterFirstName: "",
    requesterLastName: "",
    requesterAddress: "",
    requesterEmail: "",
    requesterPhone: "",
    // Additional responsible person
    responsibleFirstName: "",
    responsibleLastName: "",
    responsibleAddress: "",
    responsibleEmail: "",
    responsiblePhone: "",
    // Consent form
    consentMediaOnline: false,
    consentMediaPrint: false,
    consentMediaPromotion: false,
    // School rules
    schoolRulesAccepted: false,
    // SEPA
    sepaAccountHolder: "",
    sepaIban: "",
    sepaBic: "",
    sepaBank: "",
    sepaMandate: false,
  });

  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSchoolRulesModal, setShowSchoolRulesModal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addChild = () => {
    const newChild: Child = {
      id: Date.now().toString(),
      firstName: "",
      lastName: formData.requesterLastName,
      birthDate: "",
      estimatedLevel: "preparatory",
    };
    setChildren([...children, newChild]);
  };

  const removeChild = (id: string) => {
    setChildren(children.filter((child) => child.id !== id));
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(
      children.map((child) =>
        child.id === id ? { ...child, [field]: value } : child,
      ),
    );
  };

  const calculatePrice = () => {
    return children.length * 20; // 20€ per child
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/education-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          children,
          totalAmount: calculatePrice(),
          lang: locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      setSuccess(true);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationClick = () => {
    setShowForm(true);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">
          {locale === "de"
            ? "Bildungsanmeldung erfolgreich!"
            : locale === "ar"
              ? "تم التسجيل في التعليم بنجاح!"
              : "Inscription éducation réussie!"}
        </h3>
        <p className="text-green-700">
          {locale === "de"
            ? "Ihre Anmeldung wurde erfolgreich übermittelt. Bitte überprüfen Sie Ihre E-Mail und klicken Sie auf den Bestätigungslink, um Ihre Registrierung abzuschließen."
            : locale === "ar"
              ? "تم إرسال طلب التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد لإكمال التسجيل."
              : "Votre inscription a été soumise avec succès. Veuillez vérifier votre e-mail et cliquer sur le lien de confirmation pour finaliser votre inscription."}
        </p>
      </div>
    );
  }

  return (
    <div id="registration-form" className="space-y-6">
      {/* Registration Button */}
      {!showForm && (
        <div className="bg-gradient-to-r from-primary-green to-primary-purple text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            {locale === "de"
              ? "Für die Bildung anmelden"
              : locale === "ar"
                ? "التسجيل في التعليم"
                : "S'inscrire à l'éducation"}
          </h2>

          <p className="text-lg opacity-90 mb-4">
            {locale === "de"
              ? "Bitte melden Sie sich an, falls Sie bereits Mitglied sind oder sich für den Bildungsdienst registriert haben."
              : locale === "ar"
                ? "يرجى تسجيل الدخول إذا كنت عضواً بالفعل أو مسجلاً في خدمة التعليم."
                : "Veuillez vous connecter si vous êtes déjà membre ou inscrit au service éducatif."}
          </p>

          {/* Membership Advantages */}
          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">
              {locale === "de"
                ? "Vorteile einer Mitgliedschaft:"
                : locale === "ar"
                  ? "مزايا العضوية:"
                  : "Avantages de l'adhésion:"}
            </h3>
            <ul className="text-sm space-y-1">
              <li>
                {locale === "de"
                  ? "• Erstes Kind kostenlos"
                  : locale === "ar"
                    ? "• الطفل الأول مجاناً"
                    : "• Premier enfant gratuit"}
              </li>
              <li>
                {locale === "de"
                  ? "• Jedes weitere Kind: 10€"
                  : locale === "ar"
                    ? "• كل طفل إضافي: 10 يورو"
                    : "• Chaque enfant supplémentaire: 10€"}
              </li>
              <li>
                {locale === "de"
                  ? "• Ohne Mitgliedschaft: 20€ pro Kind"
                  : locale === "ar"
                    ? "• بدون عضوية: 20 يورو لكل طفل"
                    : "• Sans adhésion: 20€ par enfant"}
              </li>
            </ul>
            <a
              href={`/${locale}/support`}
              className="inline-block mt-2 text-white underline hover:no-underline"
            >
              {locale === "de"
                ? "Zur Mitgliedschaftsanmeldung"
                : locale === "ar"
                  ? "للتسجيل في العضوية"
                  : "S'inscrire à l'adhésion"}
            </a>
          </div>

          <button
            onClick={handleRegistrationClick}
            className="inline-flex items-center px-6 py-3 bg-white text-primary-green font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            {locale === "de"
              ? "Jetzt anmelden"
              : locale === "ar"
                ? "سجل الآن"
                : "S'inscrire maintenant"}
          </button>
        </div>
      )}

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Education Requester Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-4">
                {locale === "de"
                  ? "Angaben zur anmeldenden Person"
                  : locale === "ar"
                    ? "بيانات مقدم الطلب"
                    : "Informations du demandeur"}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Vorname"
                      : locale === "ar"
                        ? "الاسم الأول"
                        : "Prénom"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="requesterFirstName"
                    value={formData.requesterFirstName}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Nachname"
                      : locale === "ar"
                        ? "الاسم الأخير"
                        : "Nom"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="requesterLastName"
                    value={formData.requesterLastName}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Adresse"
                      : locale === "ar"
                        ? "العنوان"
                        : "Adresse"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="requesterAddress"
                    value={formData.requesterAddress}
                    onChange={handleChange}
                    required
                    rows={3}
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "E-Mail"
                      : locale === "ar"
                        ? "البريد الإلكتروني"
                        : "E-mail"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="requesterEmail"
                    value={formData.requesterEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Telefon"
                      : locale === "ar"
                        ? "الهاتف"
                        : "Téléphone"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="requesterPhone"
                    value={formData.requesterPhone}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Responsible Person */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-4">
                {locale === "de"
                  ? "Zusätzliche verantwortliche Person (optional)"
                  : locale === "ar"
                    ? "شخص مسؤول إضافي (اختياري)"
                    : "Personne responsable supplémentaire (optionnel)"}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Vorname"
                      : locale === "ar"
                        ? "الاسم الأول"
                        : "Prénom"}
                  </label>
                  <input
                    type="text"
                    name="responsibleFirstName"
                    value={formData.responsibleFirstName}
                    onChange={handleChange}
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Nachname"
                      : locale === "ar"
                        ? "الاسم الأخير"
                        : "Nom"}
                  </label>
                  <input
                    type="text"
                    name="responsibleLastName"
                    value={formData.responsibleLastName}
                    onChange={handleChange}
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Adresse"
                      : locale === "ar"
                        ? "العنوان"
                        : "Adresse"}
                  </label>
                  <textarea
                    name="responsibleAddress"
                    value={formData.responsibleAddress}
                    onChange={handleChange}
                    rows={3}
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "E-Mail"
                      : locale === "ar"
                        ? "البريد الإلكتروني"
                        : "E-mail"}
                  </label>
                  <input
                    type="email"
                    name="responsibleEmail"
                    value={formData.responsibleEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Telefon"
                      : locale === "ar"
                        ? "الهاتف"
                        : "Téléphone"}
                  </label>
                  <input
                    type="tel"
                    name="responsiblePhone"
                    value={formData.responsiblePhone}
                    onChange={handleChange}
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Children Section */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-purple-800">
                  {locale === "de"
                    ? "Kinder"
                    : locale === "ar"
                      ? "الأطفال"
                      : "Enfants"}
                </h3>
                <button
                  type="button"
                  onClick={addChild}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {locale === "de"
                    ? "Kind hinzufügen"
                    : locale === "ar"
                      ? "إضافة طفل"
                      : "Ajouter un enfant"}
                </button>
              </div>

              {children.length === 0 && (
                <p className="text-gray-600 text-center py-4">
                  {locale === "de"
                    ? "Fügen Sie mindestens ein Kind hinzu"
                    : locale === "ar"
                      ? "أضف طفلاً واحداً على الأقل"
                      : "Ajoutez au moins un enfant"}
                </p>
              )}

              {children.map((child, index) => (
                <div
                  key={child.id}
                  className="bg-white p-4 rounded-lg mb-4 border"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">
                      {locale === "de"
                        ? `Kind ${index + 1}`
                        : locale === "ar"
                          ? `الطفل ${index + 1}`
                          : `Enfant ${index + 1}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeChild(child.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === "de"
                          ? "Vorname"
                          : locale === "ar"
                            ? "الاسم الأول"
                            : "Prénom"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={child.firstName}
                        onChange={(e) =>
                          updateChild(child.id, "firstName", e.target.value)
                        }
                        required
                        dir="ltr"
                        lang="de"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === "de"
                          ? "Nachname"
                          : locale === "ar"
                            ? "الاسم الأخير"
                            : "Nom"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={child.lastName}
                        onChange={(e) =>
                          updateChild(child.id, "lastName", e.target.value)
                        }
                        required
                        dir="ltr"
                        lang="de"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === "de"
                          ? "Geburtsdatum"
                          : locale === "ar"
                            ? "تاريخ الميلاد"
                            : "Date de naissance"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={child.birthDate}
                        onChange={(e) =>
                          updateChild(child.id, "birthDate", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === "de"
                          ? "Geschätztes Niveau"
                          : locale === "ar"
                            ? "المستوى المقدر"
                            : "Niveau estimé"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={child.estimatedLevel}
                        onChange={(e) =>
                          updateChild(
                            child.id,
                            "estimatedLevel",
                            e.target.value,
                          )
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="preparatory">
                          {locale === "de"
                            ? "Vorbereitungsstufe"
                            : locale === "ar"
                              ? "المستوى التحضيري"
                              : "Niveau préparatoire"}
                        </option>
                        <option value="level1">
                          {locale === "de"
                            ? "Stufe 1"
                            : locale === "ar"
                              ? "المستوى 1"
                              : "Niveau 1"}
                        </option>
                        <option value="level2">
                          {locale === "de"
                            ? "Stufe 2"
                            : locale === "ar"
                              ? "المستوى 2"
                              : "Niveau 2"}
                        </option>
                        <option value="level3">
                          {locale === "de"
                            ? "Stufe 3"
                            : locale === "ar"
                              ? "المستوى 3"
                              : "Niveau 3"}
                        </option>
                        <option value="level4">
                          {locale === "de"
                            ? "Stufe 4"
                            : locale === "ar"
                              ? "المستوى 4"
                              : "Niveau 4"}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Consent Form for Photographing and Videographing */}
            {children.length > 0 && (
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="font-semibold text-indigo-800 mb-4">
                  {locale === "de"
                    ? "Einverständniserklärung zur Foto- und Videoaufnahme von Kindern"
                    : locale === "ar"
                      ? "موافقة على التصوير والفيديو للأطفال"
                      : "Consentement pour la photographie et la vidéographie des enfants"}
                </h3>

                <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                  <p className="text-sm text-gray-700 mb-4">
                    {locale === "de"
                      ? "An die Eltern und Erziehungsberechtigten, hiermit autorisiere(n) ich/wir Al-Salam e.V., Fotos und Videos der Vereinsaktivitäten für folgende Zwecke zu erstellen und zeitlich unbegrenzt zu veröffentlichen:"
                      : locale === "ar"
                        ? "إلى الآباء وأولياء الأمور، بهذا أمنح/نمنح جمعية السلام إذناً بإنشاء صور وفيديوهات لأنشطة الجمعية للأغراض التالية ونشرها دون قيود زمنية:"
                        : "Aux parents et tuteurs, par la présente, je/nous autorise/ns Al-Salam e.V. à créer et publier sans limitation temporelle des photos et vidéos associatives pour ces raisons :"}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.consentMediaOnline || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            consentMediaOnline: e.target.checked,
                          }));
                        }}
                        className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 font-bold">
                        {locale === "de"
                          ? "Unsere Online-Kanäle (Website, Soziale Medien)"
                          : locale === "ar"
                            ? "قنواتنا عبر الإنترنت (الموقع الإلكتروني، وسائل التواصل الاجتماعي)"
                            : "Nos canaux en ligne (site web, réseaux sociaux)"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.consentMediaPrint || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            consentMediaPrint: e.target.checked,
                          }));
                        }}
                        className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 font-bold">
                        {locale === "de"
                          ? "Printmedien (Tageszeitungen, Broschüren)"
                          : locale === "ar"
                            ? "الوسائط المطبوعة (الصحف اليومية، الكتيبات)"
                            : "Médias imprimés (journaux quotidiens, brochures)"}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={formData.consentMediaPromotion || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            consentMediaPromotion: e.target.checked,
                          }));
                        }}
                        className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 font-bold">
                        {locale === "de"
                          ? "Mitgliederwerbung und Veranstaltungsankündigungen"
                          : locale === "ar"
                            ? "الترويج للأعضاء وإعلانات الفعاليات"
                            : "Promotion des membres et annonces d'événements"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">
                    {locale === "de"
                      ? "Diese Bilder können erkennbare Aufnahmen Ihrer Kinder im Rahmen der Vereinsaktivitäten enthalten."
                      : locale === "ar"
                        ? "قد تحتوي هذه الصور على صور معترف بها لأطفالكم في إطار أنشطة الجمعية."
                        : "Ces images reconnaissables de vos enfants peuvent être utilisées dans le cadre des activités du club."}
                  </p>

                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <p className="text-sm font-medium text-gray-800 mb-3">
                      {locale === "de"
                        ? "Wir bestätigen:"
                        : locale === "ar"
                          ? "نحن نؤكد:"
                          : "Nous confirmons :"}
                    </p>

                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        {locale === "de"
                          ? "Die Veröffentlichung wurde mit den Kindern besprochen."
                          : locale === "ar"
                            ? "تم مناقشة النشر مع الأطفال."
                            : "La publication a été discutée avec les enfants."}
                      </p>
                      <p>
                        {locale === "de"
                          ? "Die Kinder wurden über die Online-Veröffentlichung informiert."
                          : locale === "ar"
                            ? "تم إبلاغ الأطفال بالنشر عبر الإنترنت."
                            : "Les enfants ont été informés de la publication en ligne."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-sm text-gray-700">
                      {locale === "de"
                        ? "Ihre Rechte nach EU-DSGVO bleiben gewahrt (Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch, Beschwerde)"
                        : locale === "ar"
                          ? "حقوقكم بموجب اللائحة العامة لحماية البيانات في الاتحاد الأوروبي (الوصول، التصحيح، الحذف، تقييد المعالجة، الاعتراض، الشكوى) محفوظة"
                          : "Vos droits selon le RGPD de l'UE sont préservés (accès, rectification, effacement, limitation du traitement, opposition, réclamation)"}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    {locale === "de"
                      ? "Gültigkeit: Diese Einwilligung tritt mit der Einreichung dieses Formulars in Kraft."
                      : locale === "ar"
                        ? "الصلاحية: يسري هذا الموافقة عند تقديم هذا النموذج."
                        : "Validité : Ce consentement prend effet à la soumission de ce formulaire."}
                  </div>
                </div>
              </div>
            )}

            {/* School Rules Acceptance */}
            {children.length > 0 && (
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-4">
                  {locale === "de"
                    ? "Schulordnung"
                    : locale === "ar"
                      ? "قواعد المدرسة"
                      : "Règlement scolaire"}
                </h3>

                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="schoolRulesAccepted"
                      checked={formData.schoolRulesAccepted}
                      onChange={handleChange}
                      required
                      className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700">
                        {locale === "de"
                          ? "Ich akzeptiere die Schulordnung der Al-Salam-Vereinsschule und verpflichte mich, diese einzuhalten."
                          : locale === "ar"
                            ? "أقبل قواعد مدرسة السلام الجمعية وألتزم بالامتثال لها."
                            : "J'accepte le règlement de l'école Al-Salam et m'engage à le respecter."}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSchoolRulesModal(true)}
                        className="ml-2 text-orange-600 hover:text-orange-800 underline text-sm"
                      >
                        {locale === "de"
                          ? "Schulordnung lesen"
                          : locale === "ar"
                            ? "قراءة قواعد المدرسة"
                            : "Lire le règlement"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEPA Direct Debit */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-4">
                {locale === "de"
                  ? "SEPA-Lastschriftmandat"
                  : locale === "ar"
                    ? "تفويض الخصم المباشر SEPA"
                    : "Mandat de prélèvement SEPA"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Kontoinhaber"
                      : locale === "ar"
                        ? "صاحب الحساب"
                        : "Titulaire du compte"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sepaAccountHolder"
                    value={formData.sepaAccountHolder}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IBAN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sepaIban"
                      value={formData.sepaIban}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BIC
                    </label>
                    <input
                      type="text"
                      name="sepaBic"
                      value={formData.sepaBic}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {locale === "de"
                      ? "Bank"
                      : locale === "ar"
                        ? "البنك"
                        : "Banque"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sepaBank"
                    value={formData.sepaBank}
                    onChange={handleChange}
                    required
                    dir="ltr"
                    lang="de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-white p-4 rounded border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="sepaMandate"
                      checked={formData.sepaMandate}
                      onChange={handleChange}
                      required
                      className="mt-1 w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">
                      {locale === "de"
                        ? "Ich ermächtige AL-SALAM E.V., Zahlungen von meinem Konto mittels Lastschrift einzuziehen. Zugleich weise ich mein Kreditinstitut an, die von AL-SALAM E.V. auf mein Konto gezogenen Lastschriften einzulösen. Gläubiger-ID: DE05ZZZ00002617424. Die monatliche Gebühr beträgt 20 Euro pro Kind."
                        : locale === "ar"
                          ? "أنا أفوض جمعية السلام بسحب المدفوعات من حسابي عن طريق الخصم المباشر. وفي نفس الوقت، أوجه مؤسستي المصرفية بصرف الخصوم المباشرة التي تسحبها جمعية السلام من حسابي. معرف الدائن: DE05ZZZ00002617424. الرسوم الشهرية 20 يورو لكل طفل."
                          : "J'autorise AL-SALAM E.V. à prélever des paiements de mon compte par prélèvement automatique. En même temps, j'ordonne à mon établissement bancaire d'honorer les prélèvements tirés sur mon compte par AL-SALAM E.V. ID créancier: DE05ZZZ00002617424. Les frais mensuels sont de 20 euros par enfant."}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading || children.length === 0}
                className="inline-flex items-center justify-center gap-2 bg-primary-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-green/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {locale === "de"
                      ? "Wird gesendet..."
                      : locale === "ar"
                        ? "جارٍ الإرسال..."
                        : "Envoi en cours..."}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {locale === "de"
                      ? "Anmeldung absenden"
                      : locale === "ar"
                        ? "إرسال التسجيل"
                        : "Soumettre l'inscription"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* School Rules Modal */}
      {showSchoolRulesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {locale === "de"
                    ? "Schulordnung der Al-Salam-Vereinsschule"
                    : locale === "ar"
                      ? "قواعد مدرسة السلام الجمعية"
                      : "Règlement de l'école Al-Salam"}
                </h2>
                <button
                  onClick={() => setShowSchoolRulesModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div
                className={`prose max-w-none ${
                  locale === "ar" ? "text-right" : ""
                }`}
              >
                <p className="text-gray-700 mb-6">
                  {locale === "de"
                    ? "Die Al-Salam-Vereinsschule legt großen Wert auf eine respektvolle, saubere und lernförderliche Umgebung. Alle Eltern und Schüler werden gebeten, folgende Regeln einzuhalten:"
                    : locale === "ar"
                      ? "تولي مدرسة السلام الجمعية أهمية كبيرة لبيئة محترمة ونظيفة وتساعد على التعلم. يُطلب من جميع الآباء والطلاب الالتزام بالقواعد التالية:"
                      : "L'école Al-Salam attache une grande importance à un environnement respectueux, propre et propice à l'apprentissage. Tous les parents et élèves sont priés de respecter les règles suivantes :"}
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {locale === "de"
                    ? "1. Verhalten und Respekt"
                    : locale === "ar"
                      ? "1. السلوك والاحترام"
                      : "1. Comportement et respect"}
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    {locale === "de"
                      ? "Schüler verhalten sich höflich und respektvoll in Schule und Moschee."
                      : locale === "ar"
                        ? "يتصرف الطلاب بلباقة واحترام في المدرسة والمسجد."
                        : "Les élèves se comportent poliment et respectueusement à l'école et à la mosquée."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Sauberkeit ist verpflichtend: Müll ist in die vorgesehenen Behälter zu entsorgen."
                      : locale === "ar"
                        ? "النظافة إلزامية: يجب التخلص من القمامة في الحاويات المخصصة."
                        : "La propreté est obligatoire : les déchets doivent être jetés dans les conteneurs prévus."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Angemessene Kleidung, die der Würde der Moschee entspricht, ist zu tragen."
                      : locale === "ar"
                        ? "يجب ارتداء ملابس مناسبة تتناسب مع كرامة المسجد."
                        : "Des vêtements appropriés, respectant la dignité de la mosquée, doivent être portés."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Beleidigungen, Streitigkeiten oder unangemessene Sprache sind untersagt."
                      : locale === "ar"
                        ? "الإهانات والخلافات أو اللغة غير المناسبة محظورة."
                        : "Les insultes, disputes ou langage inapproprié sont interdits."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Handynutzung während des Unterrichts ist verboten."
                      : locale === "ar"
                        ? "استخدام الهاتف أثناء الدرس محظور."
                        : "L'utilisation du téléphone pendant les cours est interdite."}
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {locale === "de"
                    ? "2. Anwesenheit und Pflichten"
                    : locale === "ar"
                      ? "2. الحضور والواجبات"
                      : "2. Présence et devoirs"}
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    {locale === "de"
                      ? "Unterrichtszeiten sind pünktlich einzuhalten."
                      : locale === "ar"
                        ? "يجب الالتزام بمواعيد الدروس بدقة."
                        : "Les horaires de cours doivent être respectés ponctuellement."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Eltern informieren die Schule umgehend über Abwesenheiten ihres Kindes."
                      : locale === "ar"
                        ? "يجب على الآباء إبلاغ المدرسة فوراً عن غياب أطفالهم."
                        : "Les parents informent immédiatement l'école des absences de leur enfant."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Versäumte Aufgaben und Hausaufgaben sind unverzüglich nachzuholen."
                      : locale === "ar"
                        ? "يجب تعويض المهام والواجبات المنزلية المفقودة فوراً."
                        : "Les tâches manquées et les devoirs doivent être rattrapés immédiatement."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Nach drei unentschuldigten Fehltagen oder drei nicht erledigten Hausaufgaben erfolgt schriftliche Benachrichtigung der Eltern."
                      : locale === "ar"
                        ? "بعد ثلاثة أيام غياب غير مبرر أو ثلاث واجبات منزلية غير منجزة، يتم إخطار الآباء كتابياً."
                        : "Après trois jours d'absence non justifiée ou trois devoirs non effectués, une notification écrite est envoyée aux parents."}
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {locale === "de"
                    ? "3. Unterricht und Pausen"
                    : locale === "ar"
                      ? "3. الدروس والاستراحات"
                      : "3. Cours et pauses"}
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    {locale === "de"
                      ? "Schüler führen alle benötigten Materialien regelmäßig mit sich."
                      : locale === "ar"
                        ? "يحمل الطلاب جميع المواد المطلوبة بانتظام معهم."
                        : "Les élèves apportent régulièrement tous les matériaux nécessaires."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Pausen finden ausschließlich auf dem Schulgelände statt; das Verlassen des Geländes ist nicht gestattet."
                      : locale === "ar"
                        ? "تتم الاستراحات حصرياً داخل أرض المدرسة؛ مغادرة الأرض غير مسموح بها."
                        : "Les pauses ont lieu exclusivement sur le terrain de l'école ; quitter les lieux n'est pas autorisé."}
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {locale === "de"
                    ? "4. Bibliothek"
                    : locale === "ar"
                      ? "4. المكتبة"
                      : "4. Bibliothèque"}
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    {locale === "de"
                      ? "Ausleihregeln sind strikt zu befolgen."
                      : locale === "ar"
                        ? "يجب الالتزام الصارم بقواعد الاستعارة."
                        : "Les règles d'emprunt doivent être strictement respectées."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Ausgeliehene Bücher werden innerhalb der vorgegebenen Frist zurückgegeben."
                      : locale === "ar"
                        ? "يتم إرجاع الكتب المستعارة خلال المهلة المحددة."
                        : "Les livres empruntés sont retournés dans le délai prévu."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Beschädigte oder verlorene Bücher müssen ersetzt werden."
                      : locale === "ar"
                        ? "يجب استبدال الكتب التالفة أو المفقودة."
                        : "Les livres endommagés ou perdus doivent être remplacés."}
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {locale === "de"
                    ? "5. Zusammenarbeit mit Eltern"
                    : locale === "ar"
                      ? "5. التعاون مع الآباء"
                      : "5. Collaboration avec les parents"}
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    {locale === "de"
                      ? "Kontakte zu Lehrerinnen erfolgen über die Mütter."
                      : locale === "ar"
                        ? "يتم التواصل مع المعلمات من خلال الأمهات."
                        : "Les contacts avec les enseignantes se font via les mères."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Väter wenden sich bei Anliegen über die Schulleitung an das Lehrpersonal."
                      : locale === "ar"
                        ? "يتوجه الآباء في قضاياهم إلى هيئة التدريس من خلال إدارة المدرسة."
                        : "Les pères s'adressent au personnel enseignant via la direction de l'école pour leurs demandes."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Die Schule steht stets für Fragen und Vorschläge der Eltern offen."
                      : locale === "ar"
                        ? "المدرسة دائماً متاحة لأسئلة واقتراحات الآباء."
                        : "L'école est toujours ouverte aux questions et suggestions des parents."}
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {locale === "de"
                    ? "6. Sicherheit und Abholung"
                    : locale === "ar"
                      ? "6. السلامة والاستلام"
                      : "6. Sécurité et ramassage"}
                </h3>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                  <li>
                    {locale === "de"
                      ? "Parken erfolgt ausschließlich auf gekennzeichneten Flächen."
                      : locale === "ar"
                        ? "يتم الركن حصرياً في الأماكن المحددة."
                        : "Le stationnement se fait exclusivement sur les places signalées."}
                  </li>
                  <li>
                    {locale === "de"
                      ? "Rettungswege und Zufahrten dürfen nicht blockiert werden."
                      : locale === "ar"
                        ? "يجب عدم عرقلة طرق الإنقاذ والوصول."
                        : "Les voies de secours et d'accès ne doivent pas être bloquées."}
                  </li>
                </ul>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSchoolRulesModal(false)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {locale === "de"
                    ? "Schließen"
                    : locale === "ar"
                      ? "إغلاق"
                      : "Fermer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
