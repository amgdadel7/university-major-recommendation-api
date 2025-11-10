/**
 * Script to reset survey questions with a professional, AI-ready set
 * Run with: node scripts/seed-professional-questions.js
 *
 * This will:
 *  1. Ask for confirmation
 *  2. Truncate the Questions table
 *  3. Insert a curated list of interest & learning-style questions
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const readline = require('readline');
const pool = require('../src/config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (prompt) =>
  new Promise((resolve) => {
    rl.question(prompt, resolve);
  });

const interestQuestions = [
  {
    Text: 'أي العبارات التالية تعبر بشكل أدق عن المجال الذي يثير فضولك عند متابعة الأخبار أو قراءة المقالات المتخصصة؟',
    Category: 'الميول المهنية',
    Type: 'interests'
  },
  {
    Text: 'ما المادة أو المجال الدراسي الذي تشعر أنك تتفوق فيه ويتاح لك فيه التعمق دون صعوبة؟',
    Category: 'نقاط القوة الأكاديمية',
    Type: 'interests'
  },
  {
    Text: 'عندما تواجه تحديًا معقدًا، أي أسلوب تفكير تعتمد عليه غالبًا للوصول إلى حل؟',
    Category: 'حل المشكلات',
    Type: 'interests'
  },
  {
    Text: 'ما مدى استمتاعك بالأنشطة التي تتطلب ابتكار أفكار أو تصميم حلول جديدة من الصفر؟',
    Category: 'الإبداع والابتكار',
    Type: 'interests'
  },
  {
    Text: 'إلى أي مدى تشعر بالراحة عند تحليل الأرقام والبيانات لاكتشاف أنماط أو رؤى؟',
    Category: 'التحليل والبيانات',
    Type: 'interests'
  },
  {
    Text: 'أي دور تميل إلى تبنيه عندما تعمل ضمن فريق (منسق، محلل، مبتكر، منفذ)؟',
    Category: 'التواصل والقيادة',
    Type: 'interests'
  },
  {
    Text: 'ما مستوى اهتمامك بتجربة أدوات تقنية جديدة أو تعلم لغات البرمجة والأنظمة الذكية؟',
    Category: 'التقنية والتحول الرقمي',
    Type: 'interests'
  },
  {
    Text: 'ما مدى أهمية أن يسهم تخصصك في خدمة المجتمع أو معالجة قضايا إنسانية أو بيئية؟',
    Category: 'التأثير الاجتماعي',
    Type: 'interests'
  },
  {
    Text: 'هل ترى نفسك مهتمًا بإطلاق مشروع أو مبادرة ريادية خاصة في المستقبل القريب؟',
    Category: 'ريادة الأعمال',
    Type: 'interests'
  },
  {
    Text: 'ما المهارة الأساسية التي تسعى لتطويرها خلال السنوات الثلاث القادمة لتعزيز مسارك المهني؟',
    Category: 'التطوير الذاتي',
    Type: 'interests'
  },
  {
    Text: 'أي بيئة عمل تفضلها لمستقبلك المهني (مكاتب، مختبرات، ميدان، عمل عن بُعد، مزيج مرن)؟',
    Category: 'بيئة العمل المفضلة',
    Type: 'interests'
  },
  {
    Text: 'ما الهدف المهني الأكبر الذي تطمح لتحقيقه خلال السنوات الخمس القادمة؟',
    Category: 'رؤية المستقبل',
    Type: 'interests'
  }
];

const learningStyleQuestions = [
  {
    Text: 'أي بيئة تعلم تساعدك على التركيز واستيعاب المعلومات بسرعة أكبر؟',
    Category: 'بيئة التعلم',
    Type: 'learning_style'
  },
  {
    Text: 'ما الطريقة التي تُمكّنك أكثر من فهم مفهوم جديد (شروحات بصرية، مناقشات، تجارب عملية، قراءة تفصيلية)؟',
    Category: 'استقبال المعلومات',
    Type: 'learning_style'
  },
  {
    Text: 'كيف تفضل تلخيص المعلومات الجديدة بعد محاضرة أو محتوى تعلمي؟',
    Category: 'تثبيت المعرفة',
    Type: 'learning_style'
  },
  {
    Text: 'إلى أي مدى تحتاج إلى تطبيق عملي أو أمثلة واقعية لتثبيت المعلومة؟',
    Category: 'التطبيق العملي',
    Type: 'learning_style'
  },
  {
    Text: 'عند الاستعداد للاختبارات، أي استراتيجية تنظيم تعتمد عليها عادةً؟',
    Category: 'إدارة الوقت',
    Type: 'learning_style'
  },
  {
    Text: 'كيف يؤثر العمل الجماعي أو تبادل الأفكار مع الآخرين على جودة تعلمك؟',
    Category: 'التعلم التعاوني',
    Type: 'learning_style'
  }
];

const curatedQuestions = [...interestQuestions, ...learningStyleQuestions];

async function seedProfessionalQuestions() {
  const autoConfirm = (process.env.AUTO_CONFIRM || '').toLowerCase() === 'true';
  const totalNewQuestions = curatedQuestions.length;
  try {
    console.log('📚 إعادة تهيئة أسئلة الاستبيان - نسخة احترافية متوافقة مع توصيات الذكاء الاصطناعي\n');

    const [currentCountResult] = await pool.execute('SELECT COUNT(*) AS count FROM Questions');
    const currentCount = currentCountResult[0]?.count || 0;
    console.log(`📊 عدد الأسئلة الحالية في قاعدة البيانات: ${currentCount}`);
    console.log(`🆕 عدد الأسئلة الجديدة الجاهزة للإدخال: ${totalNewQuestions}\n`);

    if (currentCount > 0) {
      if (!autoConfirm) {
        const confirmDelete = await ask('⚠️ سيتم حذف جميع الأسئلة الحالية. هل تريد المتابعة؟ (yes/no): ');
        if (confirmDelete.trim().toLowerCase() !== 'yes') {
          console.log('\n❌ تم إلغاء العملية بناءً على طلبك.');
          return;
        }

        const confirmPhrase = await ask('اكتب "CONFIRM RESET" للتأكيد: ');
        if (confirmPhrase.trim() !== 'CONFIRM RESET') {
          console.log('\n❌ النص التأكيدي غير صحيح. تم إلغاء العملية.');
          return;
        }
      } else {
        console.log('⚠️ تم تفعيل AUTO_CONFIRM، سيتم حذف الأسئلة الحالية وإعادة التهيئة دون مطالبة إضافية.');
      }
    } else if (!autoConfirm) {
      const confirmInsert = await ask('لا توجد أسئلة حالياً. هل تريد إدخال المجموعة الجديدة الآن؟ (yes/no): ');
      if (confirmInsert.trim().toLowerCase() !== 'yes') {
        console.log('\n❌ تم إلغاء العملية بناءً على طلبك.');
        return;
      }
    } else {
      console.log('ℹ️ لا توجد أسئلة حالياً، وسيتم إدخال المجموعة الجديدة مباشرةً (AUTO_CONFIRM مفعّل).');
    }

    console.log('\n🔄 جاري إعادة تهيئة جدول الأسئلة...');
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE Questions');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('➕ جاري إدخال الأسئلة الاحترافية...');
    const insertSql = 'INSERT INTO Questions (Text, Category, Type) VALUES (?, ?, ?)';

    for (const question of curatedQuestions) {
      await pool.execute(insertSql, [question.Text, question.Category, question.Type]);
      console.log(`✅ تمت إضافة السؤال: [${question.Type}] ${question.Text.substring(0, 60)}...`);
    }

    const [verify] = await pool.execute('SELECT Type, COUNT(*) AS count FROM Questions GROUP BY Type');
    const totalInserted = verify.reduce((sum, item) => sum + item.count, 0);

    console.log('\n🎉 تم الانتهاء بنجاح!');
    console.log(`📈 إجمالي الأسئلة المضافة: ${totalInserted}`);
    verify.forEach((row) => {
      console.log(`   • ${row.Type}: ${row.count}`);
    });
    console.log('\n💡 ملاحظة: تم تصميم هذه الأسئلة لتغذية نموذج DeepSeek بتفضيلات واضحة مرتبطة بالتخصصات المتاحة.');
  } catch (error) {
    console.error('\n❌ حدث خطأ أثناء إعادة تهيئة الأسئلة:', error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await pool.end();
  }
}

seedProfessionalQuestions();


