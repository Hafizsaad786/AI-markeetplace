import { createFileRoute } from "@tanstack/react-router";

// Accepts { imageDataUrl: string, language?: string, country?: string }
// Returns Marketplace-ready listing fields based on the uploaded image.
export const Route = createFileRoute("/api/analyze-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          imageDataUrl?: string;
          language?: string;
          country?: string;
        };
        if (!body.imageDataUrl) return new Response("Missing image", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const language = body.language || "English";
        const country = body.country || "";

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You analyze a product photo for a Facebook Marketplace listing. Output ONLY valid JSON: {\"title\":\"...\",\"description\":\"...\",\"category\":\"...\",\"estimated_size\":\"...\",\"condition\":\"...\",\"suggested_price\":\"...\",\"tags\":[\"...\"],\"questions_to_ask\":[\"...\"]}. Be honest, locally-believable, FB-safe, no spam caps.",
              },
              {
                role: "user",
                content: [
                  { type: "text", text: `Language: ${language}. Country: ${country}. Analyze this image and produce the listing JSON.` },
                  { type: "image_url", image_url: { url: body.imageDataUrl } },
                ],
              },
            ],
            temperature: 0.9,
          }),
        });

        if (!upstream.ok) {
          return new Response(await upstream.text(), { status: upstream.status });
        }
        const data = await upstream.json();
        const text: string = data?.choices?.[0]?.message?.content ?? "{}";
        // strip code fences if present
        const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        let parsed: unknown;
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = { error: "Could not parse model output", raw: text };
        }
        return Response.json(parsed);
      },
    },
  },
});
