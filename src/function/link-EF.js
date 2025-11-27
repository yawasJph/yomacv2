import { serve } from "https://deno.land/std/http/server.ts";
import { DOMParser } from "https://esm.sh/linkedom";

serve(async (req) => {
  try {
    const { url } = await req.json();

    const html = await fetch(url).then((r) => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    const getMeta = (name) =>
      doc.querySelector(`meta[property="${name}"]`)?.content ||
      doc.querySelector(`meta[name="${name}"]`)?.content ||
      null;

    return new Response(
      JSON.stringify({
        title: getMeta("og:title"),
        description: getMeta("og:description"),
        image: getMeta("og:image"),
        site: getMeta("og:site_name"),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
