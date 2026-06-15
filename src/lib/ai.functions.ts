import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gateway = createLovableAiGatewayProvider(key);
  return gateway("google/gemini-3-flash-preview");
}

async function requireApproved(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();
  if (error || !data) throw new Error("Profile not found");
  if (data.status !== "approved") throw new Error("Your account is not approved yet.");
}

const SAFETY_RULES = `
You write Facebook Marketplace content that looks 100% human-written by a local seller.
Rules:
- No spammy ALL CAPS. No emoji spam. No repeated phrases or templates.
- No suspicious words that trigger FB moderation (free money, guaranteed, miracle, etc).
- Locally believable for the chosen country/city. Use natural local phrasing.
- Honest, trust-building tone. Never deceptive.
- Vary structure between generations — never produce the same shape twice.
- Strictly Facebook Marketplace policy-safe and realistic.
- If the user only gives partial info or just a free-text describe, intelligently fill realistic plausible details.
- Output ONLY valid JSON matching the requested schema. No markdown fences, no commentary.
`;

const optStr = (max = 200) => z.string().max(max).optional().default("");

// LISTING GENERATOR
export const generateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      category: optStr(80),
      itemName: optStr(160),
      condition: optStr(40),
      country: optStr(60),
      city: optStr(80),
      language: z.string().max(40).default("English"),
      tone: optStr(40),
      delivery: optStr(60),
      audience: optStr(120),
      priceHint: optStr(40),
      notes: optStr(1500),
      describe: optStr(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireApproved(context.supabase, context.userId);
    const seed = Math.random().toString(36).slice(2, 10);
    const { output } = await generateText({
      model: getModel(),
      temperature: 1.1,
      system: SAFETY_RULES,
      prompt: `Create ONE Facebook Marketplace listing. Use whatever info is given; fill gaps with realistic plausible details.
Variation seed (do not mention): ${seed}-${context.userId.slice(0, 6)}.
Language: ${data.language}.
Free-text user request: ${data.describe || "(none — use structured fields)"}
Item: ${data.itemName || "(infer from describe)"} (category: ${data.category || "infer"}).
Condition: ${data.condition || "infer"}.
Location: ${data.city || ""}, ${data.country || ""}.
Tone: ${data.tone || "casual local seller"}. Audience: ${data.audience || "local buyers"}.
Delivery: ${data.delivery || "buyer preference"}.
Price hint: ${data.priceHint || "fair local market"}.
Seller notes: ${data.notes || "none"}.
Every field must be unique, natural, locally-believable, FB-policy-safe.`,
      output: Output.object({
        schema: z.object({
          title: z.string(),
          description: z.string(),
          suggested_price: z.string(),
          category: z.string(),
          tags: z.array(z.string()).min(5).max(12),
          cta: z.string(),
          condition: z.string(),
          delivery_options: z.string(),
          service_areas: z.string(),
        }),
      }),
    });
    return output;
  });

// FB POST
export const generateFbPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      topic: optStr(300),
      postType: optStr(60),
      tone: optStr(40),
      language: z.string().max(40).default("English"),
      country: optStr(60),
      notes: optStr(1500),
      describe: optStr(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireApproved(context.supabase, context.userId);
    const seed = Math.random().toString(36).slice(2, 10);
    const { output } = await generateText({
      model: getModel(),
      temperature: 1.1,
      system: SAFETY_RULES,
      prompt: `Write a Facebook post. Use any info given; intelligently fill gaps.
Type: ${data.postType || "group selling post"}. Tone: ${data.tone || "friendly"}. Language: ${data.language}. Country: ${data.country || "any"}.
Topic: ${data.topic || "(from describe)"}. Free-text user request: ${data.describe || "none"}. Notes: ${data.notes || "none"}. Seed ${seed}.`,
      output: Output.object({
        schema: z.object({
          post: z.string(),
          short_version: z.string(),
          hashtags: z.array(z.string()).min(3).max(10),
        }),
      }),
    });
    return output;
  });

// AD CREATIVE
export const generateAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      product: optStr(200),
      adType: optStr(60),
      offer: optStr(200),
      language: z.string().max(40).default("English"),
      country: optStr(60),
      audience: optStr(200),
      notes: optStr(1500),
      describe: optStr(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireApproved(context.supabase, context.userId);
    const seed = Math.random().toString(36).slice(2, 10);
    const { output } = await generateText({
      model: getModel(),
      temperature: 1.05,
      system: SAFETY_RULES,
      prompt: `Create a high-converting Facebook ad. Fill gaps intelligently.
Free-text user request: ${data.describe || "none"}.
Product: ${data.product || "(from describe)"}. Type: ${data.adType || "lead generation"}.
Offer: ${data.offer || "best local value"}. Audience: ${data.audience || "local buyers"}. Country: ${data.country || "any"}. Language: ${data.language}.
Notes: ${data.notes || "none"}. Seed ${seed}.`,
      output: Output.object({
        schema: z.object({
          headline: z.string(),
          primary_text: z.string(),
          description: z.string(),
          cta_button: z.string(),
          hook: z.string(),
          image_concept: z.string(),
          targeting_suggestion: z.string(),
        }),
      }),
    });
    return output;
  });

// TRANSLATOR
export const translateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      text: z.string().min(1).max(5000),
      targetLanguage: z.string().min(1).max(40),
      country: optStr(60),
      tone: optStr(40),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireApproved(context.supabase, context.userId);
    const { output } = await generateText({
      model: getModel(),
      temperature: 0.6,
      system: SAFETY_RULES,
      prompt: `Translate to ${data.targetLanguage} for ${data.country || "general"} audience in a ${data.tone || "natural local"} tone.
Use native slang and local marketplace phrasing.
Source: ${data.text}`,
      output: Output.object({
        schema: z.object({
          translated: z.string(),
          notes: z.string(),
        }),
      }),
    });
    return output;
  });

// BRANDING
export const generateBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      business: optStr(200),
      industry: optStr(80),
      country: optStr(60),
      vibe: optStr(80),
      notes: optStr(1500),
      describe: optStr(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireApproved(context.supabase, context.userId);
    const seed = Math.random().toString(36).slice(2, 10);
    const { output } = await generateText({
      model: getModel(),
      temperature: 1.1,
      system: SAFETY_RULES,
      prompt: `Branding kit. Free-text request: ${data.describe || "none"}. Business: ${data.business || "(from describe)"} (${data.industry || "any"}, ${data.country || "any"}, vibe: ${data.vibe || "trustworthy"}). Notes: ${data.notes || "none"}. Seed ${seed}.`,
      output: Output.object({
        schema: z.object({
          business_names: z.array(z.string()).min(5).max(8),
          slogans: z.array(z.string()).min(3).max(6),
          brand_colors: z.array(z.string()).min(3).max(5),
          logo_ideas: z.array(z.string()).min(3).max(5),
          whatsapp_bio: z.string(),
          instagram_bio: z.string(),
          cover_photo_concept: z.string(),
        }),
      }),
    });
    return output;
  });

// REPLY GENERATOR
export const generateReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      buyerMessage: optStr(2000),
      replyType: optStr(60),
      language: z.string().max(40).default("English"),
      notes: optStr(800),
      describe: optStr(2000),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireApproved(context.supabase, context.userId);
    const { output } = await generateText({
      model: getModel(),
      temperature: 0.9,
      system: SAFETY_RULES,
      prompt: `Reply to a marketplace buyer message. Language ${data.language}. Type: ${data.replyType || "polite"}.
Free-text user request: ${data.describe || "none"}.
Buyer said: """${data.buyerMessage || "(infer typical buyer inquiry from describe)"}"""
Seller context: ${data.notes || "none"}`,
      output: Output.object({
        schema: z.object({
          short_reply: z.string(),
          polite_reply: z.string(),
          firm_reply: z.string(),
          follow_up: z.string(),
        }),
      }),
    });
    return output;
  });

// NAME GENERATOR
export const generateNames = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      country: z.string().min(1).max(60),
      gender: z.enum(["male", "female", "mixed"]),
      count: z.number().int().min(1).max(50),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireApproved(context.supabase, context.userId);
    const seed = Math.random().toString(36).slice(2, 10) + "-" + context.userId.slice(0, 6);
    const { output } = await generateText({
      model: getModel(),
      temperature: 1.2,
      system: "You output ONLY authentic real-world full names typical of the given country and gender. No fantasy. No commentary. JSON only.",
      prompt: `Give me ${data.count} authentic ${data.gender} full names commonly used in ${data.country}. Vary first + last names. Make each unique. Seed ${seed}.`,
      output: Output.object({
        schema: z.object({
          names: z.array(z.string()),
        }),
      }),
    });
    return output;
  });
