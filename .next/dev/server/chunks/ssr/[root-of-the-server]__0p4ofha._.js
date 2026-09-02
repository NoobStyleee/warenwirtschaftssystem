module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const { jsxDEV: _jsxDEV, Fragment: _Fragment } = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
// In app/page.tsx im return-Block:
{
    activeTab === 'inventory' ? /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: [
            /*#__PURE__*/ _jsxDEV(StatsCards, {
                items: items
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 4,
                columnNumber: 5
            }, /*TURBOPACK member replacement*/ __turbopack_context__.e),
            /*#__PURE__*/ _jsxDEV(InventoryTable, {
                items: items,
                onUpdateStock: handleUpdateStock,
                onDeleteItem: handleDeleteItem,
                onEditItem: (item)=>{
                    setSelectedItem(item);
                    setIsModalOpen(true);
                },
                onOpenAddModal: ()=>{
                    setSelectedItem(null);
                    setIsModalOpen(true);
                }
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 5,
                columnNumber: 5
            }, /*TURBOPACK member replacement*/ __turbopack_context__.e)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 3,
        columnNumber: 3
    }, /*TURBOPACK member replacement*/ __turbopack_context__.e) : /*#__PURE__*/ _jsxDEV(CategoryView, {
        items: items,
        onUpdateStock: handleUpdateStock,
        onDeleteItem: handleDeleteItem,
        onEditItem: (item)=>{
            setSelectedItem(item);
            setIsModalOpen(true);
        },
        onOpenAddModal: ()=>{
            setSelectedItem(null);
            setIsModalOpen(true);
        }
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 20,
        columnNumber: 3
    }, /*TURBOPACK member replacement*/ __turbopack_context__.e);
}}),
"[project]/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0p4ofha._.js.map