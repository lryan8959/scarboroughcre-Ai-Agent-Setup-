module.exports = [
"[project]/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseServerClient",
    ()=>getSupabaseServerClient,
    "getSupabaseServiceClient",
    ()=>getSupabaseServiceClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
;
async function getSupabaseServerClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://tiqcxwkuypxqwcdtfwml.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcWN4d2t1eXB4cXdjZHRmd21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDQ3MzUsImV4cCI6MjA3OTIyMDczNX0.76kB5KvqKJOGpy5AhODDkt7pq4T7Hq1Ta7hRfXycUtc"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // Server component, will be set by middleware
                }
            }
        }
    });
}
function getSupabaseServiceClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://tiqcxwkuypxqwcdtfwml.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
}),
"[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40631a7a2da5a6d0110c70aad333658761bf9170b9":"getListingById"},"",""] */ __turbopack_context__.s([
    "getListingById",
    ()=>getListingById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function getListingById(listingId) {
    try {
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
        const { data: listing, error } = await supabase.from("listings").select(`
        *,
        categories (name),
        users (full_name, email, role)
      `).eq("id", listingId).single();
        if (error) {
            console.error("[v0] Error fetching listing:", error);
            return {
                data: null,
                error: error.message
            };
        }
        // Fetch all files for this listing
        const { data: files, error: filesError } = await supabase.from("listing_files").select("*").eq("listing_id", listingId).order("folder_name");
        if (filesError) {
            console.error("[v0] Error fetching files:", filesError);
        }
        console.log(`[v0] Listing fetched successfully: ${listing.address}`);
        return {
            data: {
                ...listing,
                files: files || []
            },
            error: null
        };
    } catch (error) {
        console.error("[v0] Error in getListingById:", error);
        return {
            data: null,
            error: error.message
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getListingById
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getListingById, "40631a7a2da5a6d0110c70aad333658761bf9170b9", null);
}),
"[project]/app/actions/convert-image-to-base64.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"405b6a31845e9f37257cea00a2754667889d1baf1f":"convertImageToBase64Server"},"",""] */ __turbopack_context__.s([
    "convertImageToBase64Server",
    ()=>convertImageToBase64Server
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
async function convertImageToBase64Server(url) {
    try {
        console.log("[v0] Server: Converting image to base64:", url);
        let fetchUrl = url;
        if (url.startsWith("/")) {
            // For local files, construct full URL
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            fetchUrl = `${baseUrl}${url}`;
            console.log("[v0] Server: Converted local path to:", fetchUrl);
        }
        const response = await fetch(fetchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; NextJS/14.0)"
            }
        });
        if (!response.ok) {
            console.error(`[v0] Server: Failed to fetch image: ${response.statusText}`);
            return null;
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        // Determine mime type
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const dataUrl = `data:${contentType};base64,${base64}`;
        console.log("[v0] Server: Image converted successfully");
        return dataUrl;
    } catch (error) {
        console.error("[v0] Server: Error converting image:", error);
        return null;
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    convertImageToBase64Server
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(convertImageToBase64Server, "405b6a31845e9f37257cea00a2754667889d1baf1f", null);
}),
"[project]/.next-internal/server/app/dashboard/agent/listings/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/convert-image-to-base64.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$convert$2d$image$2d$to$2d$base64$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/convert-image-to-base64.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/.next-internal/server/app/dashboard/agent/listings/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/convert-image-to-base64.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "405b6a31845e9f37257cea00a2754667889d1baf1f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$convert$2d$image$2d$to$2d$base64$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["convertImageToBase64Server"],
    "40631a7a2da5a6d0110c70aad333658761bf9170b9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getListingById"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$agent$2f$listings$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$convert$2d$image$2d$to$2d$base64$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/agent/listings/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/actions/convert-image-to-base64.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$convert$2d$image$2d$to$2d$base64$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/convert-image-to-base64.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_1f81ffca._.js.map