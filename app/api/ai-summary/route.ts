import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { monthName, year, totalHabits, avgPct, topHabitTitle, streak, lang } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Clean fallback if API key is not configured in environment
      const isRu = lang === "ru";
      const fallbackText = isRu
        ? `📊 **AI-Анализ за ${monthName || "текущий месяц"} ${year || 2026}**\n\n` +
          `• **Общий прогресс:** ${avgPct || 0}% выполнения всех привычек.\n` +
          `• **Лидирующая привычка:** ${topHabitTitle || "Не определена"} — наивысшая регулярность.\n` +
          `• **Серия дней (Streak):** ${streak || 0} дней подряд.\n\n` +
          `💡 **Рекомендация:** Сохраняйте темп в первой половине дня и старайтесь выполнять сложнейшие задачи до 12:00!`
        : `📊 **AI Insights for ${monthName || "current month"} ${year || 2026}**\n\n` +
          `• **Overall Progress:** ${avgPct || 0}% completion rate.\n` +
          `• **Top Performer:** ${topHabitTitle || "N/A"} showed the highest consistency.\n` +
          `• **Active Streak:** ${streak || 0} consecutive days.\n\n` +
          `💡 **Recommendation:** Focus on completing your primary habit before noon to build momentum!`;

      return NextResponse.json({ summary: fallbackText });
    }

    const isRu = lang === "ru";
    const prompt = isRu
      ? `Проанализируй продуктивность за ${monthName} ${year}. Статистика: привычек: ${totalHabits}, средний процент выполнения: ${avgPct}%, лучшая привычка: "${topHabitTitle}", текущая серия (streak): ${streak} дней. Дай краткий (3-4 предложения), вдохновляющий и структурированный разбор с 1 конкретным советом на следующий месяц.`
      : `Analyze productivity stats for ${monthName} ${year}. Stats: total habits: ${totalHabits}, avg completion: ${avgPct}%, top habit: "${topHabitTitle}", streak: ${streak} days. Provide a concise, structured 3-4 sentence breakdown with 1 actionable productivity tip.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const data = await res.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Summary could not be generated.";

    return NextResponse.json({ summary: text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}
