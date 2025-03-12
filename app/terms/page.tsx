import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-secondary/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-card">
          <CardHeader className="bg-gradient-to-r from-primary/90 to-pink-500/90 text-white">
            <CardTitle className="text-2xl font-bold">תנאי שימוש ומדיניות פרטיות</CardTitle>
            <CardDescription className="text-white/80">
              אנא קראו בעיון את תנאי השימוש ומדיניות הפרטיות של wedfull
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">תנאי שימוש</h2>
              <p>
                ברוכים הבאים ל-wedfull, פלטפורמה לתכנון חתונות. בשימוש באתר זה, אתם מסכימים לתנאי השימוש המפורטים להלן.
                אם אינכם מסכימים לתנאים אלה, אנא הימנעו משימוש באתר.
              </p>

              <h3 className="text-lg font-semibold">1. שימוש באתר</h3>
              <p>
                אתם מסכימים להשתמש באתר זה למטרות חוקיות בלבד ובאופן שאינו מפר את זכויותיהם של אחרים או מגביל או מונע את
                השימוש והנאה מאתר זה על ידי כל צד שלישי.
              </p>

              <h3 className="text-lg font-semibold">2. חשבון משתמש</h3>
              <p>
                כדי להשתמש בחלק מהתכונות של האתר, ייתכן שתצטרכו ליצור חשבון. אתם אחראים לשמירה על סודיות פרטי החשבון
                שלכם ולכל הפעילויות שמתרחשות תחת החשבון שלכם.
              </p>

              <h3 className="text-lg font-semibold">3. קניין רוחני</h3>
              <p>
                כל התוכן, כולל טקסט, גרפיקה, לוגואים, סמלים, תמונות ותוכנה, הוא רכושו של wedfull או של ספקי התוכן שלנו
                ומוגן על ידי חוקי זכויות יוצרים וסימני מסחר.
              </p>

              <h3 className="text-lg font-semibold">4. הגבלת אחריות</h3>
              <p>
                wedfull לא תהיה אחראית לכל נזק ישיר, עקיף, מקרי, מיוחד או תוצאתי הנובע מהשימוש או חוסר היכולת להשתמש
                באתר או בשירותים.
              </p>

              <h2 className="text-xl font-bold mt-8">מדיניות פרטיות</h2>
              <p>
                הפרטיות שלכם חשובה לנו. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלכם.
              </p>

              <h3 className="text-lg font-semibold">1. איסוף מידע</h3>
              <p>
                אנו אוספים מידע שאתם מספקים לנו ישירות, כגון שם, כתובת דוא"ל ופרטי חתונה. אנו גם אוספים מידע באופן
                אוטומטי על השימוש שלכם באתר.
              </p>

              <h3 className="text-lg font-semibold">2. שימוש במידע</h3>
              <p>
                אנו משתמשים במידע שאנו אוספים כדי לספק, לתחזק ולשפר את השירותים שלנו, לתקשר איתכם ולהגן על המשתמשים
                שלנו.
              </p>

              <h3 className="text-lg font-semibold">3. שיתוף מידע</h3>
              <p>
                אנו לא מוכרים או משכירים את המידע האישי שלכם לצדדים שלישיים. אנו עשויים לשתף מידע עם ספקי שירות צד שלישי
                שעוזרים לנו להפעיל את האתר ולספק את השירותים שלנו.
              </p>

              <h3 className="text-lg font-semibold">4. אבטחת מידע</h3>
              <p>
                אנו נוקטים באמצעים סבירים כדי להגן על המידע האישי שלכם מפני אובדן, גניבה, שימוש לרעה וגישה לא מורשית.
              </p>

              <h3 className="text-lg font-semibold">5. עוגיות</h3>
              <p>
                אנו משתמשים בעוגיות ובטכנולוגיות דומות כדי לשפר את החוויה שלכם, להבין כיצד המשתמשים משתמשים באתר שלנו
                ולהתאים אישית את התוכן והפרסומות.
              </p>

              <h3 className="text-lg font-semibold">6. שינויים במדיניות הפרטיות</h3>
              <p>
                אנו עשויים לעדכן את מדיניות הפרטיות שלנו מעת לעת. אנו נודיע לכם על שינויים משמעותיים באמצעות הודעה בולטת
                באתר שלנו.
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t p-6">
            <Link href="/login" passHref>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                חזרה לדף ההתחברות
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

