import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { event, user, timestamp, data } = await request.json();

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { ok: false, error: "SLACK_WEBHOOK_URL not configured" },
        { status: 500 }
      );
    }
    const timeString = new Date(timestamp || Date.now()).toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      hour12: true,
    });

    const titleMap: Record<string, string> = {
      "form.submitted": "📝 *Form Submitted*",
      "client.created": "🚨 *New Client Created*",
      "project.created": "📁 *New Project Created*",
      "content.created": "🧠 *New Content Created*",
    };

    const title = titleMap[event] || `🔔 *Event: ${event}*`;

    const details = Object.entries(data || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const payload = {
      text: `${title}\nUser: ${user || "Unknown"}\n${details}\nTime: ${timeString}`,
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Slack webhook error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
