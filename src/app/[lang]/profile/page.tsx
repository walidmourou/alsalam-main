"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Locale } from "@/i18n/config";

interface MembershipData {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  address: string;
  email: string;
  phone: string;
  marital_status: string;
  sepa_account_holder: string;
  sepa_iban: string;
  sepa_bic: string;
  sepa_bank: string;
  status: string;
}

interface EducationRequesterData {
  id: number;
  education_id: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  phone: string;
  responsible_first_name?: string;
  responsible_last_name?: string;
  responsible_address?: string;
  responsible_email?: string;
  responsible_phone?: string;
  consent_media_online: boolean;
  consent_media_print: boolean;
  consent_media_promotion: boolean;
  sepa_account_holder: string;
  sepa_iban: string;
  sepa_bic?: string;
  sepa_bank: string;
  status: string;
}

interface StudentData {
  id?: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  estimated_level: string;
}

export default function ProfilePage() {
  const params = useParams();
  const locale = params.lang as Locale;

  // Simplified dictionary for client component
  const dictionary = {
    profile: {
      title:
        locale === "de"
          ? "Profil"
          : locale === "ar"
          ? "الملف الشخصي"
          : "Profil",
      memberBadge:
        locale === "de"
          ? "Vereinsmitglied"
          : locale === "ar"
          ? "عضو الجمعية"
          : "Membre de l'association",
      educationBadge:
        locale === "de"
          ? "Bildungsantragsteller"
          : locale === "ar"
          ? "مقدم طلب التعليم"
          : "Demandeur d'éducation",
      edit:
        locale === "de" ? "Bearbeiten" : locale === "ar" ? "تعديل" : "Modifier",
      cancel:
        locale === "de" ? "Abbrechen" : locale === "ar" ? "إلغاء" : "Annuler",
      save:
        locale === "de"
          ? "Änderungen speichern"
          : locale === "ar"
          ? "حفظ التغييرات"
          : "Enregistrer les modifications",
      logout:
        locale === "de"
          ? "Abmelden"
          : locale === "ar"
          ? "تسجيل الخروج"
          : "Se déconnecter",
      updateSuccess:
        locale === "de"
          ? "Profil erfolgreich aktualisiert"
          : locale === "ar"
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profil mis à jour avec succès",
      registerChildren:
        locale === "de"
          ? "Kinder für Bildung anmelden"
          : locale === "ar"
          ? "تسجيل الأطفال في التعليم"
          : "Inscrire les enfants à l'éducation",
      accountSettings:
        locale === "de"
          ? "Kontoeinstellungen"
          : locale === "ar"
          ? "إعدادات الحساب"
          : "Paramètres du compte",
      cancelRequest:
        locale === "de"
          ? "Antrag stornieren"
          : locale === "ar"
          ? "إلغاء الطلب"
          : "Annuler la demande",
      cancelDescription:
        locale === "de"
          ? "Stornieren Sie Ihre Mitgliedschaft oder Bildungsanfrage. Diese Aktion kann nicht rückgängig gemacht werden."
          : locale === "ar"
          ? "قم بإلغاء عضويتك أو طلب التعليم. لا يمكن التراجع عن هذا الإجراء."
          : "Annulez votre adhésion ou demande d'éducation. Cette action ne peut pas être annulée.",
      cancelStudentEducation:
        locale === "de"
          ? "Bildungsanmeldung stornieren"
          : locale === "ar"
          ? "إلغاء التسجيل في التعليم"
          : "Annuler l'inscription éducative",
      cancelStudentConfirm:
        locale === "de"
          ? "Sind Sie sicher, dass Sie die Bildungsanmeldung für dieses Kind stornieren möchten? Diese Aktion kann nicht rückgängig gemacht werden."
          : locale === "ar"
          ? "هل أنت متأكد من أنك تريد إلغاء التسجيل في التعليم لهذا الطفل؟ لا يمكن التراجع عن هذا الإجراء."
          : "Êtes-vous sûr de vouloir annuler l'inscription éducative de cet enfant ? Cette action ne peut pas être annulée.",
      addNewChild:
        locale === "de"
          ? "Neues Kind hinzufügen"
          : locale === "ar"
          ? "إضافة طفل جديد"
          : "Ajouter un nouvel enfant",
      noChildrenRegistered:
        locale === "de"
          ? "Keine Kinder registriert. Fügen Sie ein neues Kind hinzu."
          : locale === "ar"
          ? "لا يوجد أطفال مسجلون. أضف طفلاً جديداً."
          : "Aucun enfant enregistré. Ajoutez un nouvel enfant.",
    },
    support: {
      firstName:
        locale === "de"
          ? "Vorname"
          : locale === "ar"
          ? "الاسم الأول"
          : "Prénom",
      lastName:
        locale === "de" ? "Nachname" : locale === "ar" ? "الاسم الأخير" : "Nom",
      birthDate:
        locale === "de"
          ? "Geburtsdatum"
          : locale === "ar"
          ? "تاريخ الميلاد"
          : "Date de naissance",
      gender:
        locale === "de" ? "Geschlecht" : locale === "ar" ? "الجنس" : "Genre",
      male: locale === "de" ? "Männlich" : locale === "ar" ? "ذكر" : "Masculin",
      female:
        locale === "de" ? "Weiblich" : locale === "ar" ? "أنثى" : "Féminin",
      email:
        locale === "de"
          ? "E-Mail"
          : locale === "ar"
          ? "البريد الإلكتروني"
          : "E-mail",
      phone:
        locale === "de"
          ? "Telefonnummer"
          : locale === "ar"
          ? "رقم الهاتف"
          : "Numéro de téléphone",
      maritalStatus:
        locale === "de"
          ? "Familienstand"
          : locale === "ar"
          ? "الحالة الاجتماعية"
          : "État civil",
      single:
        locale === "de" ? "Ledig" : locale === "ar" ? "أعزب" : "Célibataire",
      married:
        locale === "de"
          ? "Verheiratet"
          : locale === "ar"
          ? "متزوج"
          : "Marié(e)",
      divorced:
        locale === "de"
          ? "Geschieden"
          : locale === "ar"
          ? "مطلق"
          : "Divorcé(e)",
      widowed:
        locale === "de" ? "Verwitwet" : locale === "ar" ? "أرمل" : "Veuf/Veuve",
      address:
        locale === "de" ? "Adresse" : locale === "ar" ? "العنوان" : "Adresse",
      addressPlaceholder:
        locale === "de"
          ? "Straße, Hausnummer, PLZ, Stadt"
          : locale === "ar"
          ? "الشارع، رقم المنزل، الرمز البريدي، المدينة"
          : "Rue, numéro, code postal, ville",
      accountHolder:
        locale === "de"
          ? "Kontoinhaber"
          : locale === "ar"
          ? "صاحب الحساب"
          : "Titulaire du compte",
      iban:
        locale === "de"
          ? "IBAN"
          : locale === "ar"
          ? "رقم الحساب الدولي"
          : "IBAN",
      bic: locale === "de" ? "BIC" : locale === "ar" ? "رمز البنك" : "BIC",
      bank: locale === "de" ? "Bank" : locale === "ar" ? "البنك" : "Banque",
      submitting:
        locale === "de"
          ? "Wird gesendet..."
          : locale === "ar"
          ? "جارٍ الإرسال..."
          : "Envoi en cours...",
    },
    education: {
      requesterInfo:
        locale === "de"
          ? "Antragsteller Informationen"
          : locale === "ar"
          ? "معلومات مقدم الطلب"
          : "Informations du demandeur",
      responsiblePerson:
        locale === "de"
          ? "Verantwortliche Person"
          : locale === "ar"
          ? "الشخص المسؤول"
          : "Personne responsable",
      children:
        locale === "de" ? "Kinder" : locale === "ar" ? "الأطفال" : "Enfants",
      addChild:
        locale === "de"
          ? "Kind hinzufügen"
          : locale === "ar"
          ? "إضافة طفل"
          : "Ajouter un enfant",
      removeChild:
        locale === "de" ? "Entfernen" : locale === "ar" ? "إزالة" : "Supprimer",
      estimatedLevel:
        locale === "de"
          ? "Geschätztes Niveau"
          : locale === "ar"
          ? "المستوى المقدر"
          : "Niveau estimé",
      preparatory:
        locale === "de"
          ? "Vorbereitung"
          : locale === "ar"
          ? "تحضيري"
          : "Préparatoire",
      level1:
        locale === "de"
          ? "Niveau 1"
          : locale === "ar"
          ? "المستوى 1"
          : "Niveau 1",
      level2:
        locale === "de"
          ? "Niveau 2"
          : locale === "ar"
          ? "المستوى 2"
          : "Niveau 2",
      level3:
        locale === "de"
          ? "Niveau 3"
          : locale === "ar"
          ? "المستوى 3"
          : "Niveau 3",
      level4:
        locale === "de"
          ? "Niveau 4"
          : locale === "ar"
          ? "المستوى 4"
          : "Niveau 4",
      educationId:
        locale === "de"
          ? "Bildungs-ID"
          : locale === "ar"
          ? "معرف التعليم"
          : "ID Éducation",
      status:
        locale === "de" ? "Status" : locale === "ar" ? "الحالة" : "Statut",
      consentTitle:
        locale === "de"
          ? "Einverständniserklärung zur Foto- und Videoaufnahme von Kindern"
          : locale === "ar"
          ? "موافقة على التصوير والفيديو للأطفال"
          : "Consentement pour la photographie et la vidéographie des enfants",
      consentDescription:
        locale === "de"
          ? "An die Eltern und Erziehungsberechtigten, hiermit autorisiere(n) ich/wir Al-Salam e.V., Fotos und Videos der Vereinsaktivitäten für folgende Zwecke zu erstellen und zeitlich unbegrenzt zu veröffentlichen:"
          : locale === "ar"
          ? "إلى الآباء وأولياء الأمور، بهذا أمنح/نمنح جمعية السلام إذناً بإنشاء صور وفيديوهات لأنشطة الجمعية للأغراض التالية ونشرها دون قيود زمنية:"
          : "Aux parents et tuteurs, par la présente, je/nous autorise/ns Al-Salam e.V. à créer et publier sans limitation temporelle des photos et vidéos associatives pour ces raisons :",
      consentOnline:
        locale === "de"
          ? "Unsere Online-Kanäle (Website, Soziale Medien)"
          : locale === "ar"
          ? "قنواتنا عبر الإنترنت (الموقع الإلكتروني، وسائل التواصل الاجتماعي)"
          : "Nos canaux en ligne (site web, réseaux sociaux)",
      consentPrint:
        locale === "de"
          ? "Printmedien (Tageszeitungen, Broschüren)"
          : locale === "ar"
          ? "الوسائط المطبوعة (الصحف اليومية، الكتيبات)"
          : "Médias imprimés (journaux quotidiens, brochures)",
      consentPromotion:
        locale === "de"
          ? "Mitgliederwerbung und Veranstaltungsankündigungen"
          : locale === "ar"
          ? "الترويج للأعضاء وإعلانات الفعاليات"
          : "Promotion des membres et annonces d'événements",
      consentNote:
        locale === "de"
          ? "Diese Bilder können erkennbare Aufnahmen Ihrer Kinder im Rahmen der Vereinsaktivitäten enthalten."
          : locale === "ar"
          ? "قد تحتوي هذه الصور على صور معترف بها لأطفالكم في إطار أنشطة الجمعية."
          : "Ces images reconnaissables de vos enfants peuvent être utilisées dans le cadre des activités du club.",
      consentConfirm:
        locale === "de"
          ? "Wir bestätigen:"
          : locale === "ar"
          ? "نحن نؤكد:"
          : "Nous confirmons :",
      consentDiscussed:
        locale === "de"
          ? "Die Veröffentlichung wurde mit den Kindern besprochen."
          : locale === "ar"
          ? "تم مناقشة النشر مع الأطفال."
          : "La publication a été discutée avec les enfants.",
      consentInformed:
        locale === "de"
          ? "Die Kinder wurden über die Online-Veröffentlichung informiert."
          : locale === "ar"
          ? "تم إبلاغ الأطفال بالنشر عبر الإنترنت."
          : "Les enfants ont été informés de la publication en ligne.",
      consentRights:
        locale === "de"
          ? "Ihre Rechte nach EU-DSGVO bleiben gewahrt (Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch, Beschwerde)"
          : locale === "ar"
          ? "حقوقكم بموجب اللائحة العامة لحماية البيانات في الاتحاد الأوروبي (الوصول، التصحيح، الحذف، تقييد المعالجة، الاعتراض، الشكوى) محفوظة"
          : "Vos droits selon le RGPD de l'UE sont préservés (accès, rectification, effacement, limitation du traitement, opposition, réclamation)",
      consentValidity:
        locale === "de"
          ? "Gültigkeit: Diese Einwilligung tritt mit der Einreichung dieses Formulars in Kraft."
          : locale === "ar"
          ? "الصلاحية: يسري هذا الموافقة عند تقديم هذا النموذج."
          : "Validité : Ce consentement prend effet à la soumission de ce formulaire.",
    },
    cancelMembership: {
      title:
        locale === "de"
          ? "Mitgliedschaft kündigen"
          : locale === "ar"
          ? "إلغاء العضوية"
          : "Annuler l'adhésion",
      titleEducation:
        locale === "de"
          ? "Bildungsantrag stornieren"
          : locale === "ar"
          ? "إلغاء طلب التعليم"
          : "Annuler la demande d'éducation",
      sorry:
        locale === "de"
          ? "Es tut uns leid, dass Sie gehen möchten."
          : locale === "ar"
          ? "نأسف لأنك تريد المغادرة."
          : "Nous sommes désolés de vous voir partir.",
      review:
        locale === "de"
          ? "Bitte überprüfen Sie Ihre Entscheidung."
          : locale === "ar"
          ? "يرجى مراجعة قرارك."
          : "Veuillez examiner votre décision.",
      confirm:
        locale === "de"
          ? "Ich bestätige, dass ich meine Mitgliedschaft/Bildungsantrag stornieren möchte."
          : locale === "ar"
          ? "أؤكد أنني أريد إلغاء عضويتي/طلب التعليم."
          : "Je confirme que je souhaite annuler mon adhésion/demande d'éducation.",
      buttonConfirm:
        locale === "de"
          ? "Kündigung bestätigen"
          : locale === "ar"
          ? "تأكيد الإلغاء"
          : "Confirmer l'annulation",
    },
  };
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [educationRequester, setEducationRequester] =
    useState<EducationRequesterData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [userType, setUserType] = useState<"membership" | "education" | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChild, setNewChild] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    estimated_level: "preparatory",
  });
  const [cancelStudentId, setCancelStudentId] = useState<number | null>(null);
  const router = useRouter();

  // Calculate current monthly amount
  const calculateCurrentMonthlyAmount = () => {
    if (userType === "membership") {
      // Members: 30€ base + 10€ for each child from the second onwards
      const childCount = students.length;
      return 30 + Math.max(0, childCount - 1) * 10;
    } else if (userType === "education") {
      // Non-members: 20€ per child
      return students.length * 20;
    }
    return 0;
  };

  const currentMonthlyAmount = calculateCurrentMonthlyAmount();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      if (response.ok) {
        const data = await response.json();
        setUserType(data.type);
        if (data.type === "membership") {
          setMembership(data.membership);
          setEducationRequester(data.educationRequester);
          setStudents(data.students || []);
        } else if (data.type === "education") {
          setEducationRequester(data.educationRequester);
          setStudents(data.students || []);
          setMembership(null);
        }
      } else if (response.status === 401) {
        router.push(`/${locale}/signin`);
      } else {
        setMessage("Error loading profile data");
      }
    } catch (error) {
      setMessage("Error loading profile data");
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!userType) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const data =
        userType === "membership"
          ? { type: "membership", membership }
          : { type: "education", educationRequester, students };

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage(
          dictionary.profile?.updateSuccess || "Profile updated successfully"
        );
        setIsEditing(false);
        fetchProfileData(); // Refresh data
      } else {
        setMessage("Error updating profile");
      }
    } catch (error) {
      setMessage("Error updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${locale}`);
  };

  const handleCancel = async () => {
    if (!confirmCancel || !userType) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: userType }),
      });

      if (response.ok) {
        setMessage(
          locale === "de"
            ? "Kündigungsantrag eingereicht. Sie werden abgemeldet."
            : locale === "ar"
            ? "تم تقديم طلب الإلغاء. سيتم تسجيل خروجك."
            : "Cancellation request submitted. You will be logged out."
        );
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(error.error || "Error submitting cancellation request");
      }
    } catch (error) {
      setMessage("Error submitting cancellation request");
    } finally {
      setIsSubmitting(false);
      setShowCancelModal(false);
      setConfirmCancel(false);
    }
  };

  const addStudent = () => {
    setStudents([
      ...students,
      {
        first_name: "",
        last_name: "",
        birth_date: "",
        estimated_level: "preparatory",
      },
    ]);
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (
    index: number,
    field: keyof StudentData,
    value: string
  ) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setStudents(updatedStudents);
  };

  const handleRegisterChildren = async () => {
    if (!membership || students.length === 0) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const registrationData = {
        requesterFirstName: membership.first_name,
        requesterLastName: membership.last_name,
        requesterAddress: membership.address,
        requesterEmail: membership.email,
        requesterPhone: membership.phone,
        responsibleFirstName: membership.first_name,
        responsibleLastName: membership.last_name,
        responsibleAddress: membership.address,
        responsibleEmail: membership.email,
        responsiblePhone: membership.phone,
        children: students.map((student) => ({
          firstName: student.first_name,
          lastName: student.last_name,
          birthDate: student.birth_date,
          estimatedLevel: student.estimated_level,
        })),
        totalAmount: students.length * 50, // Assuming 50€ per child
        consentMediaOnline: true,
        consentMediaPrint: true,
        consentMediaPromotion: true,
        schoolRulesAccepted: true,
        sepaAccountHolder: membership.sepa_account_holder,
        sepaIban: membership.sepa_iban,
        sepaBic: membership.sepa_bic,
        sepaBank: membership.sepa_bank,
        sepaMandate: true,
        lang: locale,
      };

      const response = await fetch("/api/education-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        setMessage(
          "Children registered for education successfully. Please check your email for confirmation."
        );
        setStudents([]);
      } else {
        const error = await response.json();
        setMessage(error.error || "Error registering children");
      }
    } catch (error) {
      setMessage("Error registering children");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelStudentEducation = async (studentId: number) => {
    if (!studentId) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/education-registration/students?studentId=${studentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMessage(
          locale === "de"
            ? "Bildungsanmeldung für dieses Kind wurde erfolgreich storniert."
            : locale === "ar"
            ? "تم إلغاء التسجيل في التعليم لهذا الطفل بنجاح."
            : "L'inscription éducative de cet enfant a été annulée avec succès."
        );
        fetchProfileData(); // Refresh data
        setCancelStudentId(null);
      } else {
        const error = await response.json();
        setMessage(error.error || "Error cancelling student education");
      }
    } catch (error) {
      setMessage("Error cancelling student education");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewChild = async () => {
    if (
      !newChild.first_name ||
      !newChild.last_name ||
      !newChild.birth_date ||
      !newChild.estimated_level
    ) {
      setMessage(
        locale === "de"
          ? "Bitte füllen Sie alle Felder aus."
          : locale === "ar"
          ? "يرجى ملء جميع الحقول."
          : "Veuillez remplir tous les champs."
      );
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/education-registration/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChild),
      });

      if (response.ok) {
        setMessage(
          locale === "de"
            ? "Neues Kind erfolgreich hinzugefügt."
            : locale === "ar"
            ? "تم إضافة الطفل الجديد بنجاح."
            : "Nouvel enfant ajouté avec succès."
        );
        setNewChild({
          first_name: "",
          last_name: "",
          birth_date: "",
          estimated_level: "preparatory",
        });
        setShowAddChildForm(false);
        fetchProfileData(); // Refresh data
      } else {
        const error = await response.json();
        setMessage(error.error || "Error adding new child");
      }
    } catch (error) {
      setMessage("Error adding new child");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-green mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {dictionary.profile?.title || "Profile"}
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  userType === "membership"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {userType === "membership"
                  ? dictionary.profile?.memberBadge || "Association Member"
                  : dictionary.profile?.educationBadge || "Education Requester"}
              </span>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-green text-white rounded-md hover:bg-primary-green/90"
                >
                  {dictionary.profile?.edit || "Edit"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    {dictionary.profile?.cancel || "Cancel"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    {dictionary.profile?.logout || "Logout"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.includes("success")
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "personal"
                      ? "border-primary-green text-primary-green"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {locale === "de"
                    ? "Persönliche Informationen"
                    : locale === "ar"
                    ? "المعلومات الشخصية"
                    : "Personal Information"}
                </button>
                <button
                  onClick={() => setActiveTab("banking")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "banking"
                      ? "border-primary-green text-primary-green"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {locale === "de"
                    ? "Bankverbindung"
                    : locale === "ar"
                    ? "البيانات المصرفية"
                    : "Banking"}
                </button>
                <button
                  onClick={() => setActiveTab("children")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "children"
                      ? "border-primary-green text-primary-green"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {dictionary.education?.children || "Children"}
                </button>
                {userType === "education" && (
                  <button
                    onClick={() => setActiveTab("consent")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "consent"
                        ? "border-primary-green text-primary-green"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {locale === "de"
                      ? "Einverständnis"
                      : locale === "ar"
                      ? "الموافقة"
                      : "Consent"}
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "settings"
                      ? "border-primary-green text-primary-green"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {locale === "de"
                    ? "Einstellungen"
                    : locale === "ar"
                    ? "الإعدادات"
                    : "Settings"}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "personal" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {userType === "membership" && membership && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.firstName || "First Name"}
                      </label>
                      <input
                        type="text"
                        value={membership.first_name}
                        onChange={(e) =>
                          setMembership({
                            ...membership,
                            first_name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.lastName || "Last Name"}
                      </label>
                      <input
                        type="text"
                        value={membership.last_name}
                        onChange={(e) =>
                          setMembership({
                            ...membership,
                            last_name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.birthDate || "Birth Date"}
                      </label>
                      <input
                        type="date"
                        value={membership.birth_date.split("T")[0]}
                        onChange={(e) =>
                          setMembership({
                            ...membership,
                            birth_date: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.gender || "Gender"}
                      </label>
                      <select
                        value={membership.gender}
                        onChange={(e) =>
                          setMembership({
                            ...membership,
                            gender: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                      >
                        <option value="male">
                          {dictionary.support?.male || "Male"}
                        </option>
                        <option value="female">
                          {dictionary.support?.female || "Female"}
                        </option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.email || "Email"}
                      </label>
                      <input
                        type="email"
                        value={membership.email}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.phone || "Phone"}
                      </label>
                      <input
                        type="tel"
                        value={membership.phone}
                        onChange={(e) =>
                          setMembership({
                            ...membership,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.maritalStatus || "Marital Status"}
                      </label>
                      <select
                        value={membership.marital_status}
                        onChange={(e) =>
                          setMembership({
                            ...membership,
                            marital_status: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                      >
                        <option value="single">
                          {dictionary.support?.single || "Single"}
                        </option>
                        <option value="married">
                          {dictionary.support?.married || "Married"}
                        </option>
                        <option value="divorced">
                          {dictionary.support?.divorced || "Divorced"}
                        </option>
                        <option value="widowed">
                          {dictionary.support?.widowed || "Widowed"}
                        </option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {dictionary.support?.address || "Address"}
                      </label>
                      <textarea
                        value={membership.address}
                        onChange={(e) =>
                          setMembership({
                            ...membership,
                            address: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        placeholder={
                          dictionary.support?.addressPlaceholder ||
                          "Street, number, zip code, city"
                        }
                      />
                    </div>
                  </div>
                )}

                {userType === "education" && educationRequester && (
                  <>
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">
                            {dictionary.education?.educationId ||
                              "Education ID"}
                            : {educationRequester.education_id}
                          </h3>
                          <p className="text-sm text-blue-600">
                            {dictionary.education?.status || "Status"}:{" "}
                            {educationRequester.status}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {dictionary.education?.requesterInfo ||
                          "Requester Information"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {dictionary.support?.firstName || "First Name"}
                          </label>
                          <input
                            type="text"
                            value={educationRequester.first_name}
                            onChange={(e) =>
                              setEducationRequester({
                                ...educationRequester,
                                first_name: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {dictionary.support?.lastName || "Last Name"}
                          </label>
                          <input
                            type="text"
                            value={educationRequester.last_name}
                            onChange={(e) =>
                              setEducationRequester({
                                ...educationRequester,
                                last_name: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {dictionary.support?.email || "Email"}
                          </label>
                          <input
                            type="email"
                            value={educationRequester.email}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {dictionary.support?.phone || "Phone"}
                          </label>
                          <input
                            type="tel"
                            value={educationRequester.phone}
                            onChange={(e) =>
                              setEducationRequester({
                                ...educationRequester,
                                phone: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {dictionary.support?.address || "Address"}
                          </label>
                          <textarea
                            value={educationRequester.address}
                            onChange={(e) =>
                              setEducationRequester({
                                ...educationRequester,
                                address: e.target.value,
                              })
                            }
                            disabled={!isEditing}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            placeholder={
                              dictionary.support?.addressPlaceholder ||
                              "Street, number, zip code, city"
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {(educationRequester.responsible_first_name ||
                      isEditing) && (
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          {dictionary.education?.responsiblePerson ||
                            "Responsible Person"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.firstName || "First Name"}
                            </label>
                            <input
                              type="text"
                              value={
                                educationRequester.responsible_first_name || ""
                              }
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  responsible_first_name: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.lastName || "Last Name"}
                            </label>
                            <input
                              type="text"
                              value={
                                educationRequester.responsible_last_name || ""
                              }
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  responsible_last_name: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.email || "Email"}
                            </label>
                            <input
                              type="email"
                              value={educationRequester.responsible_email || ""}
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  responsible_email: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.phone || "Phone"}
                            </label>
                            <input
                              type="tel"
                              value={educationRequester.responsible_phone || ""}
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  responsible_phone: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.address || "Address"}
                            </label>
                            <textarea
                              value={
                                educationRequester.responsible_address || ""
                              }
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  responsible_address: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              rows={3}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                              placeholder={
                                dictionary.support?.addressPlaceholder ||
                                "Street, number, zip code, city"
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {(isEditing || userType === "education") && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-primary-green text-white rounded-md hover:bg-primary-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? dictionary.support?.submitting || "Saving..."
                        : dictionary.profile?.save || "Save Changes"}
                    </button>
                  </div>
                )}
              </form>
            )}

            {activeTab === "banking" && (
              <div className="space-y-6">
                {/* Current Monthly Payment Display */}
                <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">
                      {locale === "de"
                        ? "Ihre aktuelle monatliche Zahlung:"
                        : locale === "ar"
                        ? "دفعتك الشهرية الحالية:"
                        : "Votre paiement mensuel actuel:"}
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {currentMonthlyAmount}€
                    </span>
                  </div>
                  {students.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {locale === "de"
                        ? `${students.length} Kind${
                            students.length !== 1 ? "er" : ""
                          } angemeldet`
                        : locale === "ar"
                        ? `${students.length} طفل مسجل`
                        : `${students.length} enfant${
                            students.length > 1 ? "s" : ""
                          } inscrit${students.length > 1 ? "s" : ""}`}
                    </p>
                  )}
                  {students.length === 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {locale === "de"
                        ? "Keine Kinder angemeldet"
                        : locale === "ar"
                        ? "لا يوجد أطفال مسجلون"
                        : "Aucun enfant inscrit"}
                    </p>
                  )}
                </div>

                {userType === "membership" && membership && (
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {locale === "de"
                        ? "Bankverbindung"
                        : locale === "ar"
                        ? "البيانات المصرفية"
                        : "Informations bancaires"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.accountHolder ||
                            "Account Holder"}
                        </label>
                        <input
                          type="text"
                          value={membership.sepa_account_holder || ""}
                          onChange={(e) =>
                            setMembership({
                              ...membership,
                              sepa_account_holder: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.iban || "IBAN"}
                        </label>
                        <input
                          type="text"
                          value={membership.sepa_iban || ""}
                          onChange={(e) =>
                            setMembership({
                              ...membership,
                              sepa_iban: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.bic || "BIC"}
                        </label>
                        <input
                          type="text"
                          value={membership.sepa_bic || ""}
                          onChange={(e) =>
                            setMembership({
                              ...membership,
                              sepa_bic: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.bank || "Bank"}
                        </label>
                        <input
                          type="text"
                          value={membership.sepa_bank || ""}
                          onChange={(e) =>
                            setMembership({
                              ...membership,
                              sepa_bank: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {userType === "education" && educationRequester && (
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {locale === "de"
                        ? "Bankverbindung"
                        : locale === "ar"
                        ? "البيانات المصرفية"
                        : "Informations bancaires"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.accountHolder ||
                            "Account Holder"}
                        </label>
                        <input
                          type="text"
                          value={educationRequester.sepa_account_holder || ""}
                          onChange={(e) =>
                            setEducationRequester({
                              ...educationRequester,
                              sepa_account_holder: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.iban || "IBAN"}
                        </label>
                        <input
                          type="text"
                          value={educationRequester.sepa_iban || ""}
                          onChange={(e) =>
                            setEducationRequester({
                              ...educationRequester,
                              sepa_iban: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.bic || "BIC"}
                        </label>
                        <input
                          type="text"
                          value={educationRequester.sepa_bic || ""}
                          onChange={(e) =>
                            setEducationRequester({
                              ...educationRequester,
                              sepa_bic: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {dictionary.support?.bank || "Bank"}
                        </label>
                        <input
                          type="text"
                          value={educationRequester.sepa_bank || ""}
                          onChange={(e) =>
                            setEducationRequester({
                              ...educationRequester,
                              sepa_bank: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(isEditing || userType === "education") && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-primary-green text-white rounded-md hover:bg-primary-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? dictionary.support?.submitting || "Saving..."
                        : dictionary.profile?.save || "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "children" && userType === "membership" && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {dictionary.profile?.registerChildren ||
                      "Register Children for Education"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {locale === "de"
                      ? "Als Mitglied können Sie Ihre Kinder für das Bildungsprogramm anmelden."
                      : locale === "ar"
                      ? "كعضو، يمكنك تسجيل أطفالك في برنامج التعليم."
                      : "As a member, you can register your children for the education program."}
                  </p>
                  {students.length === 0 ? (
                    <button
                      type="button"
                      onClick={addStudent}
                      className="px-4 py-2 bg-primary-green text-white rounded-md hover:bg-primary-green/90"
                    >
                      {dictionary.education?.addChild || "Add Child"}
                    </button>
                  ) : (
                    <>
                      {students.map((student, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-md p-4 mb-4"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-md font-medium">
                              {locale === "de"
                                ? "Kind"
                                : locale === "ar"
                                ? "الطفل"
                                : "Child"}{" "}
                              {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeStudent(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              {dictionary.education?.removeChild || "Remove"}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                {dictionary.support?.firstName || "First Name"}
                              </label>
                              <input
                                type="text"
                                value={student.first_name}
                                onChange={(e) =>
                                  updateStudent(
                                    index,
                                    "first_name",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                {dictionary.support?.lastName || "Last Name"}
                              </label>
                              <input
                                type="text"
                                value={student.last_name}
                                onChange={(e) =>
                                  updateStudent(
                                    index,
                                    "last_name",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                {dictionary.support?.birthDate || "Birth Date"}
                              </label>
                              <input
                                type="date"
                                value={student.birth_date}
                                onChange={(e) =>
                                  updateStudent(
                                    index,
                                    "birth_date",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                {dictionary.education?.estimatedLevel ||
                                  "Estimated Level"}
                              </label>
                              <select
                                value={student.estimated_level}
                                onChange={(e) =>
                                  updateStudent(
                                    index,
                                    "estimated_level",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green"
                              >
                                <option value="preparatory">
                                  {dictionary.education?.preparatory ||
                                    "Preparatory"}
                                </option>
                                <option value="level1">
                                  {dictionary.education?.level1 || "Level 1"}
                                </option>
                                <option value="level2">
                                  {dictionary.education?.level2 || "Level 2"}
                                </option>
                                <option value="level3">
                                  {dictionary.education?.level3 || "Level 3"}
                                </option>
                                <option value="level4">
                                  {dictionary.education?.level4 || "Level 4"}
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={addStudent}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          {dictionary.education?.addChild || "Add Child"}
                        </button>
                        <button
                          type="button"
                          onClick={handleRegisterChildren}
                          disabled={isSubmitting}
                          className="px-4 py-2 bg-primary-green text-white rounded-md hover:bg-primary-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting
                            ? dictionary.support?.submitting || "Submitting..."
                            : dictionary.profile?.registerChildren ||
                              "Register Children"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "children" &&
              userType === "education" &&
              educationRequester && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {dictionary.education?.children || "Children"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddChildForm(!showAddChildForm)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        {showAddChildForm
                          ? locale === "de"
                            ? "Abbrechen"
                            : locale === "ar"
                            ? "إلغاء"
                            : "Annuler"
                          : dictionary.education?.addChild ||
                            "Ajouter un enfant"}
                      </button>
                    </div>

                    {/* Add New Child Form */}
                    {showAddChildForm && (
                      <div className="bg-green-50 p-4 rounded-lg mb-6 border">
                        <h4 className="text-md font-medium text-green-800 mb-4">
                          {dictionary.profile?.addNewChild}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.firstName || "Prénom"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newChild.first_name}
                              onChange={(e) =>
                                setNewChild({
                                  ...newChild,
                                  first_name: e.target.value,
                                })
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.lastName || "Nom"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newChild.last_name}
                              onChange={(e) =>
                                setNewChild({
                                  ...newChild,
                                  last_name: e.target.value,
                                })
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.birthDate ||
                                "Date de naissance"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              value={newChild.birth_date}
                              onChange={(e) =>
                                setNewChild({
                                  ...newChild,
                                  birth_date: e.target.value,
                                })
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.education?.estimatedLevel ||
                                "Niveau estimé"}{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={newChild.estimated_level}
                              onChange={(e) =>
                                setNewChild({
                                  ...newChild,
                                  estimated_level: e.target.value,
                                })
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            >
                              <option value="preparatory">
                                {dictionary.education?.preparatory ||
                                  "Préparatoire"}
                              </option>
                              <option value="level1">
                                {dictionary.education?.level1 || "Niveau 1"}
                              </option>
                              <option value="level2">
                                {dictionary.education?.level2 || "Niveau 2"}
                              </option>
                              <option value="level3">
                                {dictionary.education?.level3 || "Niveau 3"}
                              </option>
                              <option value="level4">
                                {dictionary.education?.level4 || "Niveau 4"}
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                          <button
                            type="button"
                            onClick={handleAddNewChild}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting
                              ? dictionary.support?.submitting ||
                                "Envoi en cours..."
                              : locale === "de"
                              ? "Hinzufügen"
                              : locale === "ar"
                              ? "إضافة"
                              : "Ajouter"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddChildForm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                          >
                            {dictionary.profile?.cancel || "Annuler"}
                          </button>
                        </div>
                      </div>
                    )}

                    {students.map((student, index) => (
                      <div
                        key={student.id || index}
                        className="border border-gray-200 rounded-md p-4 mb-4"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-medium">
                            {locale === "de"
                              ? "Kind"
                              : locale === "ar"
                              ? "الطفل"
                              : "Enfant"}{" "}
                            {index + 1}: {student.first_name}{" "}
                            {student.last_name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCancelStudentId(student.id!)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            {dictionary.profile?.cancelStudentEducation}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.firstName || "Prénom"}
                            </label>
                            <input
                              type="text"
                              value={student.first_name}
                              onChange={(e) =>
                                updateStudent(
                                  index,
                                  "first_name",
                                  e.target.value
                                )
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.lastName || "Nom"}
                            </label>
                            <input
                              type="text"
                              value={student.last_name}
                              onChange={(e) =>
                                updateStudent(
                                  index,
                                  "last_name",
                                  e.target.value
                                )
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.support?.birthDate ||
                                "Date de naissance"}
                            </label>
                            <input
                              type="date"
                              value={student.birth_date.split("T")[0]}
                              onChange={(e) =>
                                updateStudent(
                                  index,
                                  "birth_date",
                                  e.target.value
                                )
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {dictionary.education?.estimatedLevel ||
                                "Niveau estimé"}
                            </label>
                            <select
                              value={student.estimated_level}
                              onChange={(e) =>
                                updateStudent(
                                  index,
                                  "estimated_level",
                                  e.target.value
                                )
                              }
                              disabled={!isEditing}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-green focus:border-primary-green disabled:bg-gray-50"
                            >
                              <option value="preparatory">
                                {dictionary.education?.preparatory ||
                                  "Préparatoire"}
                              </option>
                              <option value="level1">
                                {dictionary.education?.level1 || "Niveau 1"}
                              </option>
                              <option value="level2">
                                {dictionary.education?.level2 || "Niveau 2"}
                              </option>
                              <option value="level3">
                                {dictionary.education?.level3 || "Niveau 3"}
                              </option>
                              <option value="level4">
                                {dictionary.education?.level4 || "Niveau 4"}
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    {students.length === 0 && !showAddChildForm && (
                      <p className="text-gray-600 text-center py-4">
                        {dictionary.profile?.noChildrenRegistered}
                      </p>
                    )}

                    {(isEditing || userType === "education") &&
                      students.length > 0 && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary-green text-white rounded-md hover:bg-primary-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting
                              ? dictionary.support?.submitting ||
                                "Enregistrement..."
                              : dictionary.profile?.save ||
                                "Enregistrer les modifications"}
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              )}

            {activeTab === "consent" &&
              userType === "education" &&
              educationRequester && (
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {dictionary.education?.consentTitle || "Media Consent"}
                    </h3>

                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <div className="bg-white p-4 rounded border border-gray-200 mb-4">
                        <p className="text-sm text-gray-700 mb-4">
                          {dictionary.education?.consentDescription}
                        </p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={
                                educationRequester.consent_media_online || false
                              }
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  consent_media_online: e.target.checked,
                                })
                              }
                              disabled={!isEditing}
                              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                            />
                            <span className="text-sm text-gray-700 font-bold">
                              {dictionary.education?.consentOnline}
                            </span>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={
                                educationRequester.consent_media_print || false
                              }
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  consent_media_print: e.target.checked,
                                })
                              }
                              disabled={!isEditing}
                              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                            />
                            <span className="text-sm text-gray-700 font-bold">
                              {dictionary.education?.consentPrint}
                            </span>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={
                                educationRequester.consent_media_promotion ||
                                false
                              }
                              onChange={(e) =>
                                setEducationRequester({
                                  ...educationRequester,
                                  consent_media_promotion: e.target.checked,
                                })
                              }
                              disabled={!isEditing}
                              className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                            />
                            <span className="text-sm text-gray-700 font-bold">
                              {dictionary.education?.consentPromotion}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-4">
                          {dictionary.education?.consentNote}
                        </p>

                        <div className="bg-gray-50 p-4 rounded mb-4">
                          <p className="text-sm font-medium text-gray-800 mb-3">
                            {dictionary.education?.consentConfirm}
                          </p>

                          <div className="space-y-2 text-sm text-gray-700">
                            <p>{dictionary.education?.consentDiscussed}</p>
                            <p>{dictionary.education?.consentInformed}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 mb-4">
                          <span className="text-sm text-gray-700">
                            {dictionary.education?.consentRights}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 mt-3">
                          {dictionary.education?.consentValidity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(isEditing || userType === "education") && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-primary-green text-white rounded-md hover:bg-primary-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting
                          ? dictionary.support?.submitting || "Saving..."
                          : dictionary.profile?.save || "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {dictionary.profile.accountSettings}
                  </h3>

                  <div className="space-y-4">
                    {(userType === "membership" ||
                      userType === "education") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {dictionary.profile.cancelRequest}
                        </label>
                        <p className="text-sm text-gray-600 mb-3">
                          {dictionary.profile.cancelDescription}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowCancelModal(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          {dictionary.profile.cancelRequest}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {userType === "membership"
                ? dictionary.cancelMembership?.title
                : dictionary.cancelMembership?.titleEducation}
            </h2>
            <p className="text-gray-700 mb-4">
              {dictionary.cancelMembership?.sorry}{" "}
              {dictionary.cancelMembership?.review}
            </p>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={confirmCancel}
                  onChange={(e) => setConfirmCancel(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  {dictionary.cancelMembership?.confirm}
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setConfirmCancel(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                {dictionary.profile?.cancel || "Cancel"}
              </button>
              <button
                onClick={handleCancel}
                disabled={!confirmCancel || isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? dictionary.support?.submitting || "Submitting..."
                  : dictionary.cancelMembership?.buttonConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelStudentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {dictionary.profile?.cancelStudentEducation}
            </h2>
            <p className="text-gray-700 mb-4">
              {dictionary.profile?.cancelStudentConfirm}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setCancelStudentId(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                {dictionary.profile?.cancel || "Annuler"}
              </button>
              <button
                onClick={() => handleCancelStudentEducation(cancelStudentId)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? dictionary.support?.submitting || "Envoi en cours..."
                  : locale === "de"
                  ? "Stornieren"
                  : locale === "ar"
                  ? "إلغاء"
                  : "Annuler"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
