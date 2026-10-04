// src/lib/school-rules.ts
// Localized content of the Vereinsschule "Schulordnung", shown in the
// education registration flow. Extracted from the form component so the
// wording lives next to the other static content (see statutes-data.ts).
import type { Locale } from "@/i18n/config";

export interface SchoolRulesSection {
  title: string;
  items: string[];
}

export interface SchoolRulesContent {
  title: string;
  intro: string;
  sections: SchoolRulesSection[];
}

export const SCHOOL_RULES: Record<Locale, SchoolRulesContent> = {
  de: {
    title: "Schulordnung der Al-Salam-Vereinsschule",
    intro:
      "Die Al-Salam-Vereinsschule legt großen Wert auf eine respektvolle, saubere und lernförderliche Umgebung. Alle Eltern und Schüler werden gebeten, folgende Regeln einzuhalten:",
    sections: [
      {
        title: "1. Verhalten und Respekt",
        items: [
          "Schüler verhalten sich höflich und respektvoll in Schule und Moschee.",
          "Sauberkeit ist verpflichtend: Müll ist in die vorgesehenen Behälter zu entsorgen.",
          "Angemessene Kleidung, die der Würde der Moschee entspricht, ist zu tragen.",
          "Beleidigungen, Streitigkeiten oder unangemessene Sprache sind untersagt.",
          "Handynutzung während des Unterrichts ist verboten.",
        ],
      },
      {
        title: "2. Anwesenheit und Pflichten",
        items: [
          "Unterrichtszeiten sind pünktlich einzuhalten.",
          "Eltern informieren die Schule umgehend über Abwesenheiten ihres Kindes.",
          "Versäumte Aufgaben und Hausaufgaben sind unverzüglich nachzuholen.",
          "Nach drei unentschuldigten Fehltagen oder drei nicht erledigten Hausaufgaben erfolgt schriftliche Benachrichtigung der Eltern.",
        ],
      },
      {
        title: "3. Unterricht und Pausen",
        items: [
          "Schüler führen alle benötigten Materialien regelmäßig mit sich.",
          "Pausen finden ausschließlich auf dem Schulgelände statt; das Verlassen des Geländes ist nicht gestattet.",
        ],
      },
      {
        title: "4. Bibliothek",
        items: [
          "Ausleihregeln sind strikt zu befolgen.",
          "Ausgeliehene Bücher werden innerhalb der vorgegebenen Frist zurückgegeben.",
          "Beschädigte oder verlorene Bücher müssen ersetzt werden.",
        ],
      },
      {
        title: "5. Zusammenarbeit mit Eltern",
        items: [
          "Kontakte zu Lehrerinnen erfolgen über die Mütter.",
          "Väter wenden sich bei Anliegen über die Schulleitung an das Lehrpersonal.",
          "Die Schule steht stets für Fragen und Vorschläge der Eltern offen.",
        ],
      },
      {
        title: "6. Sicherheit und Abholung",
        items: [
          "Parken erfolgt ausschließlich auf gekennzeichneten Flächen.",
          "Rettungswege und Zufahrten dürfen nicht blockiert werden.",
        ],
      },
    ],
  },
  fr: {
    title: "Règlement de l'école Al-Salam",
    intro:
      "L'école Al-Salam attache une grande importance à un environnement respectueux, propre et propice à l'apprentissage. Tous les parents et élèves sont priés de respecter les règles suivantes :",
    sections: [
      {
        title: "1. Comportement et respect",
        items: [
          "Les élèves se comportent poliment et respectueusement à l'école et à la mosquée.",
          "La propreté est obligatoire : les déchets doivent être jetés dans les conteneurs prévus.",
          "Des vêtements appropriés, respectant la dignité de la mosquée, doivent être portés.",
          "Les insultes, disputes ou langage inapproprié sont interdits.",
          "L'utilisation du téléphone pendant les cours est interdite.",
        ],
      },
      {
        title: "2. Présence et devoirs",
        items: [
          "Les horaires de cours doivent être respectés ponctuellement.",
          "Les parents informent immédiatement l'école des absences de leur enfant.",
          "Les tâches manquées et les devoirs doivent être rattrapés immédiatement.",
          "Après trois jours d'absence non justifiée ou trois devoirs non effectués, une notification écrite est envoyée aux parents.",
        ],
      },
      {
        title: "3. Cours et pauses",
        items: [
          "Les élèves apportent régulièrement tous les matériaux nécessaires.",
          "Les pauses ont lieu exclusivement sur le terrain de l'école ; quitter les lieux n'est pas autorisé.",
        ],
      },
      {
        title: "4. Bibliothèque",
        items: [
          "Les règles d'emprunt doivent être strictement respectées.",
          "Les livres empruntés sont retournés dans le délai prévu.",
          "Les livres endommagés ou perdus doivent être remplacés.",
        ],
      },
      {
        title: "5. Collaboration avec les parents",
        items: [
          "Les contacts avec les enseignantes se font via les mères.",
          "Les pères s'adressent au personnel enseignant via la direction de l'école pour leurs demandes.",
          "L'école est toujours ouverte aux questions et suggestions des parents.",
        ],
      },
      {
        title: "6. Sécurité et ramassage",
        items: [
          "Le stationnement se fait exclusivement sur les places signalées.",
          "Les voies de secours et d'accès ne doivent pas être bloquées.",
        ],
      },
    ],
  },
  ar: {
    title: "قواعد مدرسة السلام الجمعية",
    intro:
      "تولي مدرسة السلام الجمعية أهمية كبيرة لبيئة محترمة ونظيفة وتساعد على التعلم. يُطلب من جميع الآباء والطلاب الالتزام بالقواعد التالية:",
    sections: [
      {
        title: "1. السلوك والاحترام",
        items: [
          "يتصرف الطلاب بلباقة واحترام في المدرسة والمسجد.",
          "النظافة إلزامية: يجب التخلص من القمامة في الحاويات المخصصة.",
          "يجب ارتداء ملابس مناسبة تتناسب مع كرامة المسجد.",
          "الإهانات والخلافات أو اللغة غير المناسبة محظورة.",
          "استخدام الهاتف أثناء الدرس محظور.",
        ],
      },
      {
        title: "2. الحضور والواجبات",
        items: [
          "يجب الالتزام بمواعيد الدروس بدقة.",
          "يجب على الآباء إبلاغ المدرسة فوراً عن غياب أطفالهم.",
          "يجب تعويض المهام والواجبات المنزلية المفقودة فوراً.",
          "بعد ثلاثة أيام غياب غير مبرر أو ثلاث واجبات منزلية غير منجزة، يتم إخطار الآباء كتابياً.",
        ],
      },
      {
        title: "3. الدروس والاستراحات",
        items: [
          "يحمل الطلاب جميع المواد المطلوبة بانتظام معهم.",
          "تتم الاستراحات حصرياً داخل أرض المدرسة؛ مغادرة الأرض غير مسموح بها.",
        ],
      },
      {
        title: "4. المكتبة",
        items: [
          "يجب الالتزام الصارم بقواعد الاستعارة.",
          "يتم إرجاع الكتب المستعارة خلال المهلة المحددة.",
          "يجب استبدال الكتب التالفة أو المفقودة.",
        ],
      },
      {
        title: "5. التعاون مع الآباء",
        items: [
          "يتم التواصل مع المعلمات من خلال الأمهات.",
          "يتوجه الآباء في قضاياهم إلى هيئة التدريس من خلال إدارة المدرسة.",
          "المدرسة دائماً متاحة لأسئلة واقتراحات الآباء.",
        ],
      },
      {
        title: "6. السلامة والاستلام",
        items: [
          "يتم الركن حصرياً في الأماكن المحددة.",
          "يجب عدم عرقلة طرق الإنقاذ والوصول.",
        ],
      },
    ],
  },
};
