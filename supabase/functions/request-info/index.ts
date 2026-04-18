import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { requester_email, profile_id, profile_name, request_type } = await req.json();

  console.log(
    `INFO REQUEST: ${requester_email} requested ${request_type} for ${profile_name} (${profile_id})`
  );

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
