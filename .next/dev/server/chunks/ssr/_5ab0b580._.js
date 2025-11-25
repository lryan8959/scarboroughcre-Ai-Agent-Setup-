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
"[project]/app/actions/create-listing.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4014ace930b2465e19519bd290a0e1987219ff4fac":"saveListingFiles","406bc2d7ee5a9fc1a520ddef02e22deae284847ce8":"createListing","40b2ca600f65bc04bc94bbb32019a45ce746214a05":"saveListingFile","607288c88d922ff51b1c8572bc3e125b216e789eef":"updateListingThumbnail","60ce1f9870de53b6919b5eb74400817a6d74ab5f10":"updateThumbnail"},"",""] */ __turbopack_context__.s([
    "createListing",
    ()=>createListing,
    "saveListingFile",
    ()=>saveListingFile,
    "saveListingFiles",
    ()=>saveListingFiles,
    "updateListingThumbnail",
    ()=>updateListingThumbnail,
    "updateThumbnail",
    ()=>updateThumbnail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function createListing(listingData) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
        // Insert listing with service role client (bypasses RLS)
        const { data: listing, error: listingError } = await supabase.from("listings").insert(listingData).select().single();
        if (listingError) {
            console.error("[v0] Listing creation error:", {
                message: listingError.message,
                details: listingError.details,
                hint: listingError.hint,
                code: listingError.code
            });
            return {
                error: listingError.message
            };
        }
        return {
            data: listing.id
        };
    } catch (error) {
        console.error("[v0] Server action error:", error);
        return {
            error: error.message || "Failed to create listing"
        };
    }
}
async function saveListingFile(fileData) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
        // Insert file metadata with service role client (bypasses RLS)
        const { error: fileError } = await supabase.from("listing_files").insert(fileData);
        if (fileError) {
            console.error("[v0] File save error:", fileError);
            return {
                error: fileError.message
            };
        }
        return {
            error: null
        };
    } catch (error) {
        console.error("[v0] Server action error:", error);
        return {
            error: error.message || "Failed to save file"
        };
    }
}
async function saveListingFiles(fileData) {
    return await saveListingFile(fileData);
}
async function updateListingThumbnail(listingId, thumbnailUrl) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getSupabaseServiceClient"])();
        const { error } = await supabase.from("listings").update({
            thumbnail_url: thumbnailUrl
        }).eq("id", listingId);
        if (error) {
            console.error("[v0] Thumbnail update error:", error);
            return {
                error: error.message
            };
        }
        return {
            success: true
        };
    } catch (error) {
        console.error("[v0] Server action error:", error);
        return {
            error: error.message || "Failed to update thumbnail"
        };
    }
}
async function updateThumbnail(listingId, thumbnailUrl) {
    return await updateListingThumbnail(listingId, thumbnailUrl);
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createListing,
    saveListingFile,
    saveListingFiles,
    updateListingThumbnail,
    updateThumbnail
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createListing, "406bc2d7ee5a9fc1a520ddef02e22deae284847ce8", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveListingFile, "40b2ca600f65bc04bc94bbb32019a45ce746214a05", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveListingFiles, "4014ace930b2465e19519bd290a0e1987219ff4fac", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateListingThumbnail, "607288c88d922ff51b1c8572bc3e125b216e789eef", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateThumbnail, "60ce1f9870de53b6919b5eb74400817a6d74ab5f10", null);
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
"[project]/.next-internal/server/app/dashboard/agent/create-listing/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/create-listing.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$create$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/create-listing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)");
;
;
;
;
}),
"[project]/.next-internal/server/app/dashboard/agent/create-listing/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions/create-listing.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40631a7a2da5a6d0110c70aad333658761bf9170b9",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getListingById"],
    "406bc2d7ee5a9fc1a520ddef02e22deae284847ce8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$create$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createListing"],
    "40b2ca600f65bc04bc94bbb32019a45ce746214a05",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$create$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveListingFile"],
    "60ce1f9870de53b6919b5eb74400817a6d74ab5f10",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$create$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateThumbnail"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$agent$2f$create$2d$listing$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$create$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/agent/create-listing/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions/create-listing.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$create$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/create-listing.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2f$get$2d$listing$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions/get-listing.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=_5ab0b580._.js.map