module.exports = function replaceLegacyLucideIcons({ types: t }) {
  return {
    name: "replace-legacy-lucide-icons",
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value !== "lucide-react") return;

        for (const specifier of path.node.specifiers) {
          if (
            t.isImportSpecifier(specifier) &&
            specifier.imported &&
            specifier.imported.name === "CalendarDays"
          ) {
            specifier.imported = t.identifier("Calendar");
          }
        }
      },
    },
  };
};
