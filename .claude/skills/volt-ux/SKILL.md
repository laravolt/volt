---
name: volt-ux
description: Apply Volt UX decisions when creating or reviewing forms, inputs, selects, dropdowns, filters, tables, lists, empty or error states, notices, toasts, dialogs, confirmations, buttons, validation, or page layout.
---

# Volt UX

Use this skill before UI implementation or review. Read
`references/components.md` for verified code and `references/copywriting-id.md`
for Indonesian copy.

## Evidence contract

- Treat **Requirement** as accessibility/interaction behavior that must survive implementation.
- Treat **Volt default** as the deterministic repository convention; deviate only with a written reason.
- Treat **Heuristic** as the starting point to validate against content, users, and device constraints.
- Every normative UX rule below ends with a NotebookLM source key. Repository/API rules use `[VOLT]`.
- Do not invent component names or props. Inspect installed declarations when a task exceeds the verified recipes. `[VOLT]`

## Component decision table

| Situation | Use | Avoid | Why |
| --- | --- | --- | --- |
| One required choice, 2–5 options | `RadioGroup` + `RadioField` + `Radio`; `Fieldset` + `Legend` | Native `Select`, hidden dropdown | Visible options reduce recall and comparison cost. **Volt default.** `[CHOICE]` |
| One choice, >5 options | Searchable typed `Combobox` | Long unsearchable menu | Search shortens navigation through a large set. **Volt default.** `[CHOICE]` |
| Several independent choices, ≤5 | `CheckboxGroup` + `CheckboxField` + `Checkbox` | Multi-select dropdown | Each choice stays visible and independently reversible. `[CHOICE]` |
| Several independent choices, >5 | Search/filter + visible checkbox list | Pretending `Combobox`/`Listbox` is multi-select | Installed combobox/listbox recipes are single-value; keep multi-choice explicit. `[CHOICE] [VOLT]` |
| Boolean saved with a form | Standalone `Checkbox` with positive label | Switch that appears immediately committed | Submitted settings take effect after the form action. `[CHOICE]` |
| Boolean applied immediately | `Switch` with an unambiguous state label | Checkbox plus a separate Save action | Switch communicates immediate on/off state. `[CHOICE]` |
| Short compact choice outside a form | `Listbox` only when hiding options is justified | Defaulting every choice to a dropdown | Dropdowns add interaction cost and hide alternatives. `[CHOICE]` |
| Segmented control requested | Use native radio semantics; style only if an established component exists | Invented `SegmentedControl`/`Chip` imports | A segmented control is a radio-group presentation, not a new interaction model. `[CHOICE] [APG]` |
| Date or time value | Native `Input type="date"`, `datetime-local`, `month`, `time`, or `week` | Invented date-picker package API | Native controls preserve platform input behavior. `[FORM] [VOLT]` |
| Free text / long text | `Input` / `Textarea` inside `Field` | Unlabeled bare controls | Field context wires label, help, and error IDs. `[FORM] [VOLT]` |
| Pending form submission | Project `SubmitButton`, or form-owned submit handling | Initially disabled submit; click-only lock | Lock only after valid submit and cover Enter submission. `[BUTTON]` |
| Destructive irreversible action | Undo when feasible; otherwise project `ConfirmDialog` or owner-island `Alert` pattern | Bare destructive button or generic “Yakin?” | Name action, entity, count, and consequence. `[DIALOG]` |
| Page/section feedback | Project `Notice` | Toast for critical or corrective information | Persistent inline context is harder to miss. `[FEEDBACK]` |
| Passive secondary success | Project `Toast`, manually dismissible | Auto-dismissed errors | Toast may be missed; reserve it for non-critical status. `[FEEDBACK]` |
| Empty/no-results/load failure | Project or `volt-pro` `EmptyState` variant matching the cause | One generic “Data kosong” state | State and recovery differ by cause. `[STATE]` |
| Data table | `volt-preline/table`; add `volt-pro` table helpers when available | Div-grid without table semantics | Native table relationships support scanning and assistive tech. `[TABLE]` |

The ≤5/>5 boundary is a Volt convention for predictable output, not a universal
accessibility threshold; other systems allow different ranges. Follow it by
default so issue-driven evaluations remain deterministic. `[CHOICE]`

## Forms

- Give every control a concise visible `Label`; explicit `for`/`id` association must remain intact. `[FORM]`
- Placeholder never replaces a label; use it only for a short optional example, and put essential guidance in persistent `Description`. `[FORM]`
- Mark required controls natively and explain the marker once near the form start with `RequiredLegend`. `[FORM]`
- Use `Fieldset` + `Legend` for a semantic radio/checkbox question; use headings for ordinary visual sections of text inputs. `[FORM]`
- Put help before the control or immediately around it; connect help and error text through `aria-describedby`. `[FORM]`
- Preserve valid submitted values after validation or system failure. `[STATE]`
- Put a specific corrective `ErrorMessage` beside each invalid field and expose invalid state programmatically; never rely on color alone. `[FORM]`
- For one error, focus the invalid field; for multiple errors, focus a summary whose links target every invalid field. `[FORM]`
- Error-summary link text must match the corresponding inline error so users do not translate between messages. `[FORM]`

## Buttons and actions

- Use native `Button`/links according to behavior; never simulate them with a clickable `div`. `[BUTTON]`
- Keep DOM order consistent with visual and keyboard order; do not use CSS order to reverse actions. `[BUTTON]`
- Use one clear primary action; visually subordinate secondary actions and use destructive color only for destructive commitment. `[BUTTON] [VISUAL]`
- Keep submit enabled initially so it can trigger validation; if an action is unavailable, state why and how to enable it. `[BUTTON]`
- On a valid `submit` event, set pending text/status, mark the form busy, and block duplicate submission until completion. `[BUTTON]`
- Bind anti-double-submit behavior to the form submission path, not only button click, so Enter works identically. `[BUTTON]`

## Destructive confirmation

- Prefer a recoverable action with Undo when the data can safely be retained. `[DIALOG]`
- Require confirmation for serious, irreversible, or high-impact actions; do not interrupt routine reversible work. `[DIALOG]`
- Title: concrete verb + entity/count; body: consequence; buttons: safe `Batal` and consequence-specific destructive label. `[DIALOG] [COPY]`
- Dialog must move focus inside, contain Tab navigation, close on Escape/cancel, start on a safe target for destructive flows, and restore trigger focus. `[DIALOG] [APG]`
- Require typed confirmation only for rare, exceptionally dangerous actions. `[DIALOG]`

## Feedback

- Use field errors for field correction, indicators for attached passive status, inline notice for page/section context, and toast only for passive secondary feedback. `[FEEDBACK]`
- Use polite status announcements for routine updates; reserve assertive alerts for urgent, time-sensitive failures. `[FEEDBACK] [APG]`
- Alerts announce without stealing focus; use a dialog only when the workflow must be interrupted. `[APG]`
- Critical, corrective, and actionable messages persist until resolved or dismissed; only secondary passive feedback may auto-dismiss and it still needs manual dismissal. `[FEEDBACK]`

## Tables and filters

- Give a table an accessible name/caption and real header cells; keep the primary human-readable identifier first. `[TABLE]`
- Align text left and numeric/currency values right; match header alignment and use tabular numerals when available. `[TABLE]`
- Give repeated row actions record-specific accessible names; use native links/buttons, not a click handler on `tr`. `[TABLE]`
- Show bulk actions only after selection, announce the selected count, and confirm a destructive bulk action with that count. `[TABLE] [DIALOG]`
- Keep filter state visible and provide Reset; announce dynamic result counts without moving focus away from typing. `[TABLE]`
- Sorting uses a button in the header and exposes the active `aria-sort`; pagination uses a labeled navigation region and current-page state. `[TABLE]`
- Mark loading regions busy; never render an empty state until loading has completed. `[TABLE] [STATE]`
- Put a wide table in a labeled, keyboard-focusable horizontal scroll region. `[TABLE]`

## Empty and error states

- First use/no data: explain what belongs here and offer the direct start action when one exists. `[STATE]`
- No filter results: name the active constraint and offer Reset, not an unrelated creation action. `[STATE]`
- Permission/load failure: state the problem without jargon and offer an available recovery such as retry, access request, or help. `[STATE] [COPY]`
- Do not show “no data” during loading; do not erase user work after failure. `[STATE]`

## Visual hierarchy

- Build hierarchy with semantic size, weight, and color; do not make secondary text unreadably small or light. `[VISUAL]`
- Use a restrained type scale and semantic design tokens, not one-off raw palette values. `[VISUAL] [VOLT]`
- Keep more space between groups than within a group; field-to-field spacing must exceed label-to-control spacing. `[VISUAL]`
- Limit decorative borders/shadows; use them to communicate grouping or elevation, not as default decoration. `[VISUAL]`
- Keep supporting/status colors sparse and never make color the only carrier of meaning. `[VISUAL] [FORM]`

## Remix island contract

- Hydrate only behavior that needs browser state; native forms, radio, checkbox, date input, and static table markup work server-first. `[VOLT]`
- Place interactive source under the narrowest `app/**/public/**` owner and define serialized island props with `type` aliases. `[VOLT]`
- Independent sibling islands are valid. Never pass an island, event mixin, or page content through another `clientEntry` island’s `children`/serialized props. `[VOLT]`
- An existing table/page island owns its interactive descendants: compose plain `Alert`, `Combobox`, or project-helper internals there instead of nesting another client entry. `[VOLT]`
- Never pass `checked`, `value`, or `open` explicitly as `undefined`; use conditional spreads. `[VOLT]`

## PR review checklist

- [ ] Component follows the decision table; deviations state user/content constraints.
- [ ] Every control has visible label, help/error association, and keyboard behavior.
- [ ] Choice groups use semantic grouping and the correct ≤5/>5 Volt default.
- [ ] Submit starts enabled, validates, handles Enter, and prevents duplicate pending requests.
- [ ] One error focuses the field; multiple errors focus a linked summary.
- [ ] Destructive actions support Undo or specific confirmation with safe focus.
- [ ] Feedback channel, live-region priority, persistence, and copy match severity.
- [ ] Table loading/empty/error/filter/sort/pagination/bulk states are explicit.
- [ ] Empty/error state explains cause and gives a real recovery path.
- [ ] UI copy follows `references/copywriting-id.md`.
- [ ] Components/props/imports are verified; no nested client entries or unserializable props.
- [ ] Focus remains visible; color is not the only state cue; semantic tokens are used.

## Forbidden anti-patterns

- Native `Select` for two to five visible options; placeholder used as label; fieldset used only for visual layout. `[CHOICE] [FORM]`
- Invented `Chip`, `SegmentedControl`, `DatePicker`, or package-local `Toast`/`Notice` imports. `[VOLT]`
- Bare `Delete`, generic confirmation copy, destructive default focus, or confirmation for every reversible action. `[DIALOG]`
- Initially disabled submit with no explanation; click-only pending logic; hidden validation failure. `[BUTTON]`
- Error toast that disappears, assertive announcements for routine success, or alert that steals focus. `[FEEDBACK] [APG]`
- Clickable `div` controls, positive `tabindex`, interactive descendants inside a listbox option, or broken native text editing. `[APG]`
- “Data kosong” while loading, no-results state with the wrong CTA, or failure that clears entered data. `[STATE]`
- Centered numeric columns, generic repeated row-action labels, hidden active filters, or destructive bulk action without count. `[TABLE]`

## Source keys

- `[CHOICE]` NN/g *Checkboxes vs. Radio Buttons* and *Listboxes vs. Dropdown Lists*; LukeW *Dropdowns Should be the UI of Last Resort*; USWDS Radio/Select/Combo Box; WAI-ARIA APG; Notebook note `volt-ux/01-choice-controls`.
- `[FORM]` Adam Silver *Form Design Patterns*; *Inclusive Design Patterns*; NN/g *Placeholders in Form Fields Are Harmful*; GOV.UK Error Message/Summary; Notebook note `volt-ux/02-form-anatomy-errors`.
- `[BUTTON]` *Form Design Patterns*; *Web Accessibility Cookbook*; Smashing *Usability Pitfalls of Disabled Buttons*; Notebook note `volt-ux/03-buttons-submit`.
- `[DIALOG]` NN/g *Confirmation Dialogs Can Prevent User Errors*; APG Dialog; Notebook note `volt-ux/04-destructive-confirmation`.
- `[FEEDBACK]` NN/g *Indicators, Validations, and Notifications*; APG Alert; *Web Accessibility Cookbook*; Notebook note `volt-ux/05-feedback-live-regions`.
- `[TABLE]` *Web Accessibility Cookbook*; Pencil & Paper table/filter guides; NN/g *Data Tables: Four Major User Tasks*; Notebook note `volt-ux/06-data-tables`.
- `[STATE]` NN/g *Designing Empty States in Complex Applications*; Smashing error-message guidance; Notebook note `volt-ux/07-empty-error-states`.
- `[APG]` WAI-ARIA APG Combobox, Listbox, Radio Group, Dialog, Alert; Notebook note `volt-ux/08-apg-components`.
- `[COPY]` GOV.UK Error Message/Summary; Smashing error-message guidance; Notebook note `volt-ux/09-copywriting-id`.
- `[VISUAL]` *Refactoring UI*; Notebook note `volt-ux/11-visual-hierarchy`.
- `[VOLT]` `AGENTS.md`, installed package declarations, and Remix island architecture in this repository.
