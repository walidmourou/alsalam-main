import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const articles = [
  {
    title_de: "Das Freitagsgebet - Jumu'ah",
    title_fr: "La prière du vendredi - Jumu'ah",
    title_ar: "صلاة الجمعة",
    content_de: `Das Freitagsgebet, bekannt als Jumu'ah, ist eines der wichtigsten Gebete im Islam. Es wird freitags in der Moschee verrichtet und ersetzt das normale Mittagsgebet (Dhuhr).

Wichtige Aspekte des Freitagsgebets:
• Es wird in Gemeinschaft verrichtet
• Die Khutbah (Predigt) geht dem Gebet voraus
• Es ist Pflicht für Männer, empfohlen für Frauen
• Es findet zwischen Mittag und Nachmittag statt

Das Freitagsgebet stärkt die Gemeinschaft und erinnert die Muslime an ihre religiösen Pflichten. Es ist eine Zeit der spirituellen Erneuerung und des Lernens.`,
    content_fr: `La prière du vendredi, connue sous le nom de Jumu'ah, est l'une des prières les plus importantes de l'islam. Elle se déroule le vendredi à la mosquée et remplace la prière normale de midi (Dhuhr).

Aspects importants de la prière du vendredi :
• Elle se déroule en communauté
• Le Khutbah (sermon) précède la prière
• Elle est obligatoire pour les hommes, recommandée pour les femmes
• Elle a lieu entre midi et l'après-midi

La prière du vendredi renforce la communauté et rappelle aux musulmans leurs devoirs religieux. C'est un moment de renouvellement spirituel et d'apprentissage.`,
    content_ar: `صلاة الجمعة هي إحدى أهم الصلوات في الإسلام، وتُعرف باسم الجمعة. تُؤدى يوم الجمعة في المسجد وتحل محل صلاة الظهر العادية.

الجوانب المهمة لصلاة الجمعة:
• تُؤدى جماعة في المسجد
• يسبقها خطبة الجمعة
• واجبة على الرجال ومستحبة للنساء
• تُؤدى بين الظهر والعصر

تعزز صلاة الجمعة الروابط المجتمعية وتذكر المسلمين بواجباتهم الدينية. إنها وقت للتجديد الروحي والتعلم من القرآن والسنة.`,
    image_url: "/images/articles/jomoaa.png",
    status: 'published',
    author_id: 1,
    published_at: new Date('2025-01-15')
  },
  {
    title_de: "Der Ramadan - Der Monat des Fastens",
    title_fr: "Le Ramadan - Le mois du jeûne",
    title_ar: "رمضان",
    content_de: `Der Ramadan ist der neunte Monat des islamischen Kalenders und der heiligste Monat für Muslime. Während dieser Zeit fasten die Gläubigen von Sonnenaufgang bis Sonnenuntergang.

Wichtige Aspekte des Ramadan:
• Das Fasten (Sawm) ist eine der fünf Säulen des Islam
• Das Fastenbrechen (Iftar) erfolgt gemeinsam mit Familie und Freunden
• Die Nachtgebete (Tarawih) werden in der Moschee verrichtet
• Die letzte Nacht des Ramadan ist Laylat al-Qadr

Der Ramadan ist eine Zeit der spirituellen Reinigung, des Gebets und der Wohltätigkeit.`,
    content_fr: `Le Ramadan est le neuvième mois du calendrier islamique et le mois le plus sacré pour les musulmans. Pendant cette période, les croyants jeûnent du lever au coucher du soleil.

Aspects importants du Ramadan :
• Le jeûne (Sawm) est l'un des cinq piliers de l'islam
• La rupture du jeûne (Iftar) se fait en communauté avec la famille et les amis
• Les prières nocturnes (Tarawih) se déroulent à la mosquée
• La dernière nuit du Ramadan est Laylat al-Qadr

Le Ramadan est un temps de purification spirituelle, de prière et de charité.`,
    content_ar: `رمضان هو الشهر التاسع من التقويم الهجري وأقدس شهر لدى المسلمين. خلال هذه الفترة يصوم المؤمنون من الفجر حتى غروب الشمس.

الجوانب المهمة لرمضان:
• الصيام هو أحد أركان الإسلام الخمسة
• يتم إفطار الصيام مع العائلة والأصدقاء
• تُؤدى صلاة التراويح في المسجد
• ليلة القدر هي أفضل ليالي رمضان

رمضان وقت للتطهير الروحي والصلاة والصدقة والتقوى.`,
    image_url: "/images/articles/ramadan.png",
    status: 'published',
    author_id: 1,
    published_at: new Date('2025-01-20')
  },
  {
    title_de: "Die Pilgerfahrt - Hajj",
    title_fr: "Le pèlerinage - Hajj",
    title_ar: "الحج",
    content_de: `Die Pilgerfahrt nach Mekka, bekannt als Hajj, ist die fünfte Säule des Islam. Sie ist einmal im Leben Pflicht für jeden Muslim, der dazu in der Lage ist.

Die Riten des Hajj umfassen:
• Die Ihram-Kleidung tragen
• In Mina übernachten
• Auf dem Berg Arafat stehen
• Die symbolische Steinigung des Teufels
• Das Opferfest

Hajj symbolisiert die Einheit aller Muslime und ihre Unterwerfung unter Allah.`,
    content_fr: `Le pèlerinage à La Mecque, connu sous le nom de Hajj, est le cinquième pilier de l'islam. Il est obligatoire une fois dans la vie pour tout musulman qui en est capable.

Les rites du Hajj comprennent :
• Porter le vêtement d'Ihram
• Passer la nuit à Mina
• Se tenir sur le mont Arafat
• La lapidation symbolique du diable
• La fête du sacrifice

Le Hajj symbolise l'unité de tous les musulmans et leur soumission à Allah.`,
    content_ar: `الحج إلى مكة هو الركن الخامس من أركان الإسلام. هو فريضة على كل مسلم بالغ عاقل حر قادر على أدائها مرة واحدة في العمر.

شعائر الحج تشمل:
• لبس ملابس الإحرام
• المبيت في منى
• الوقوف بعرفة
• رمي الجمرات
• عيد الأضحى

يرمز الحج لوحدة المسلمين وتسليمهم لله تعالى.`,
    image_url: "/images/articles/hajj.jpg",
    status: 'published',
    author_id: 1,
    published_at: new Date('2025-01-25')
  },
  {
    title_de: "Eid al-Adha - Das Opferfest",
    title_fr: "Eid al-Adha - La fête du sacrifice",
    title_ar: "عيد الأضحى",
    content_de: `Eid al-Adha, auch bekannt als Opferfest, ist eines der beiden wichtigsten Feste im Islam. Es findet am 10. Dhu al-Hijjah statt und erinnert an die Opferbereitschaft von Prophet Ibrahim.

Traditionen von Eid al-Adha:
• Das Opfer eines Tieres (Udhiyah)
• Besuche bei Familie und Freunden
• Spezielle Gebete in der Moschee
• Austeilen von Fleisch an Bedürftige

Das Fest symbolisiert Großzügigkeit, Opferbereitschaft und Gemeinschaft.`,
    content_fr: `Eid al-Adha, également connu sous le nom de fête du sacrifice, est l'une des deux principales fêtes de l'islam. Elle a lieu le 10 Dhu al-Hijjah et commémore le sacrifice du prophète Ibrahim.

Traditions d'Eid al-Adha :
• Le sacrifice d'un animal (Udhiyah)
• Les visites familiales et amicales
• Les prières spéciales à la mosquée
• La distribution de viande aux nécessiteux

La fête symbolise la générosité, le sacrifice et la communauté.`,
    content_ar: `عيد الأضحى هو أحد أهم الأعياد في الإسلام، ويُعرف بعيد الأضحى. يأتي في اليوم العاشر من ذي الحجة ويذكر بتضحية النبي إبراهيم عليه السلام.

تقاليد عيد الأضحى:
• ذبح الأضحية
• زيارات الأهل والأصدقاء
• الصلاة في المسجد
• توزيع اللحم على المحتاجين

يرمز العيد للكرم والتضحية والألفة المجتمعية.`,
    image_url: "/images/articles/adha.png",
    status: 'published',
    author_id: 1,
    published_at: new Date('2025-02-01')
  },
  {
    title_de: "Eid al-Fitr - Das Zuckerfest",
    title_fr: "Eid al-Fitr - La fête de la rupture du jeûne",
    title_ar: "عيد الفطر",
    content_de: `Eid al-Fitr markiert das Ende des Ramadan und ist das Fest der Freude und Dankbarkeit. Es findet am 1. Shawwal statt.

Traditionen von Eid al-Fitr:
• Spezielle Morgengebete
• Zakat al-Fitr (Almosen)
• Besuche und Glückwünsche
• Süßigkeiten und Festessen

Das Fest feiert die Vollendung des Ramadanfastens und die spirituelle Reinigung.`,
    content_fr: `Eid al-Fitr marque la fin du Ramadan et est la fête de la joie et de la gratitude. Elle a lieu le 1er Chaoual.

Traditions d'Eid al-Fitr :
• Prières spéciales du matin
• Zakat al-Fitr (aumône)
• Visites et félicitations
• Bonbons et repas de fête

La fête célèbre l'accomplissement du jeûne du Ramadan et la purification spirituelle.`,
    content_ar: `عيد الفطر يمثل نهاية شهر رمضان وهو عيد الفرح والشكر. يأتي في أول يوم من شوال.

تقاليد عيد الفطر:
• صلاة العيد في الصباح
• زكاة الفطر
• الزيارات والتهاني
• الحلويات والأطعمة الاحتفالية

يحتفل العيد بإتمام صيام رمضان والتطهير الروحي.`,
    image_url: "/images/articles/fitr.png",
    status: 'published',
    author_id: 1,
    published_at: new Date('2025-02-05')
  },
  {
    title_de: "Zakat - Die Almosensteuer",
    title_fr: "Zakat - L'impôt légal",
    title_ar: "الزكاة",
    content_de: `Zakat ist die dritte Säule des Islam und eine Form der Pflichtabgabe. Sie reinigt das Vermögen und hilft den Bedürftigen.

Wichtige Aspekte der Zakat:
• 2,5% des Vermögens jährlich
• Wird an acht Kategorien von Empfängern gegeben
• Reinigt sowohl Vermögen als auch Seele
• Ist sowohl Pflicht als auch spirituelle Übung

Zakat fördert soziale Gerechtigkeit und Solidarität in der muslimischen Gemeinschaft.`,
    content_fr: `Zakat est le troisième pilier de l'islam et une forme de contribution obligatoire. Elle purifie la richesse et aide les nécessiteux.

Aspects importants de Zakat :
• 2,5% de la richesse annuellement
• Donné à huit catégories de bénéficiaires
• Purifie à la fois la richesse et l'âme
• Est à la fois obligation et exercice spirituel

Zakat promeut la justice sociale et la solidarité dans la communauté musulmane.`,
    content_ar: `الزكاة هي الركن الثالث من أركان الإسلام وهي شكل من أشكال الصدقة الواجبة. تنقي المال وتساعد المحتاجين.

الجوانب المهمة للزكاة:
• 2.5% من الثروة سنوياً
• تُعطى لثمانية أصناف من المستحقين
• تنقي المال والنفس معاً
• واجبة وتمرين روحي

تعزز الزكاة العدالة الاجتماعية والتضامن في المجتمع المسلم.`,
    image_url: "/images/articles/zakat.png",
    status: 'published',
    author_id: 1,
    published_at: new Date('2025-02-10')
  }
];

async function insertArticles() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to database successfully!');

    // Insert articles
    for (const article of articles) {
      const [result] = await connection.execute(
        `INSERT INTO articles (
          title_de, title_fr, title_ar,
          content_de, content_fr, content_ar,
          image_url, status, author_id, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article.title_de,
          article.title_fr,
          article.title_ar,
          article.content_de,
          article.content_fr,
          article.content_ar,
          article.image_url,
          article.status,
          article.author_id,
          article.published_at
        ]
      );

      console.log(`✓ Article "${article.title_ar}" inserted with ID: ${result.insertId}`);
    }

    console.log(`\n✅ Successfully inserted ${articles.length} articles into the database!`);

  } catch (error) {
    console.error('Error inserting articles:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

insertArticles();