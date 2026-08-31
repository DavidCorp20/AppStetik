import React from "react";

// The main calculator lives in the centered mobile bottom navigation.
// The former floating calculator duplicated that action and overlapped
// Historial on small screens. Keep this component as a no-op so existing
// imports remain backwards compatible without rendering a second calculator.
export function FloatingCalculator() {
  return null;
}
