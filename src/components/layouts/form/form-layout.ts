import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { FormLayoutStageEventDetail } from './form-layout-types.ts'
import formLayoutStyles from './form-layout.css?inline'

/**
 * Configurable form shell with optional multi-step stages.
 *
 * Single-step usage:
 *   <app-form-layout title="Create account" description="Fill in the details below." columns="2">
 *     <app-input slot="fields" label="First name"></app-input>
 *     <app-input slot="fields" label="Last name"></app-input>
 *   </app-form-layout>
 *
 * Multi-step usage:
 *   <app-form-layout title="Onboarding" .stages=${['Personal', 'Address', 'Review']}>
 *     <div slot="stage-0">…step 1 fields…</div>
 *     <div slot="stage-1">…step 2 fields…</div>
 *     <div slot="stage-2">…step 3 fields…</div>
 *   </app-form-layout>
 *
 * @tag app-form-layout
 * @slot fields - Form fields for single-step mode.
 * @slot stage-{index} - Form fields for each stage in multi-step mode.
 * @fires form-layout-next - Fired when moving to the next stage. Detail: `{ stage }`.
 * @fires form-layout-back - Fired when moving to the previous stage. Detail: `{ stage }`.
 * @fires form-layout-submit - Fired when the submit button is clicked. Detail: `{ stage }`.
 */
@customElement('app-form-layout')
export class FormLayout extends LitElement {
  static override styles = [unsafeCSS(formLayoutStyles)]

  /** Form heading displayed at the top. */
  @property({ type: String })
  title = ''

  /** Subtitle text shown below the title. */
  @property({ type: String })
  description = ''

  /** Number of columns for the fields grid. */
  @property({ type: Number })
  columns: 1 | 2 | 3 = 1

  /**
   * Stage labels. When non-empty, the form renders a step indicator and
   * Back / Next / Submit navigation buttons. The slot for each stage is
   * `slot="stage-{index}"`.
   */
  @property({ type: Array })
  stages: string[] = []

  /**
   * Seamless mode — strips the outer card shell (border, background, border-radius).
   * Use when embedding inside another container such as app-modal with flush.
   */
  @property({ type: Boolean })
  seamless = false

  /** Active stage index (0-based). Controlled externally or managed internally. */
  @property({ type: Number, attribute: 'current-stage' })
  currentStage = 0

  @state()
  private _stage = 0

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('currentStage')) {
      this._stage = this.currentStage
    }
  }

  private get _isMultiStep() {
    return this.stages.length > 0
  }

  private get _isLastStage() {
    return this._stage === this.stages.length - 1
  }

  private _handleBack() {
    if (this._stage === 0) return
    this._stage--
    this.dispatchEvent(new CustomEvent<FormLayoutStageEventDetail>('form-layout-back', {
      detail: { stage: this._stage },
      bubbles: true,
      composed: true,
    }))
  }

  private _handleNext() {
    if (this._isLastStage) return
    this._stage++
    this.dispatchEvent(new CustomEvent<FormLayoutStageEventDetail>('form-layout-next', {
      detail: { stage: this._stage },
      bubbles: true,
      composed: true,
    }))
  }

  private _handleSubmit() {
    this.dispatchEvent(new CustomEvent<FormLayoutStageEventDetail>('form-layout-submit', {
      detail: { stage: this._stage },
      bubbles: true,
      composed: true,
    }))
  }

  private _renderStepIndicator() {
    return html`
      <nav class="steps" aria-label="Form progress">
        ${this.stages.map((label, i) => html`
          ${i > 0 ? html`<span class="step-connector" aria-hidden="true"></span>` : ''}
          <button
            type="button"
            class="step ${i === this._stage ? 'step--active' : ''} ${i < this._stage ? 'step--done' : ''}"
            aria-current=${i === this._stage ? 'step' : 'false'}
            @click=${() => { if (i < this._stage) { this._stage = i } }}
          >
            <span class="step-number" aria-hidden="true">${i < this._stage ? html`
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="14" height="14">
                <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>` : i + 1}
            </span>
            <span class="step-label">${label}</span>
          </button>
        `)}
      </nav>
    `
  }

  private _renderFields() {
    if (this._isMultiStep) {
      // Each stage gets its own grid container — shown/hidden via the `hidden` attribute.
      // `slot { display: contents }` in CSS makes slotted elements become direct grid children.
      return html`
        ${this.stages.map((label, i) => html`
          <div
            class="fields fields--cols-${this.columns}"
            role="group"
            aria-label=${label}
            ?hidden=${i !== this._stage}
          >
            <slot name="stage-${i}"></slot>
          </div>
        `)}
      `
    }
    return html`
      <div class="fields fields--cols-${this.columns}">
        <slot name="fields"></slot>
      </div>
    `
  }

  private _renderActions() {
    if (this._isMultiStep) {
      return html`
        <div class="actions">
          <button
            type="button"
            class="btn btn--ghost"
            ?disabled=${this._stage === 0}
            @click=${this._handleBack}
          >
            Back
          </button>
          ${this._isLastStage
            ? html`<button type="button" class="btn btn--primary" @click=${this._handleSubmit}>Submit</button>`
            : html`<button type="button" class="btn btn--primary" @click=${this._handleNext}>Next</button>`
          }
        </div>
      `
    }
    return html`
      <div class="actions">
        <button type="button" class="btn btn--primary" @click=${this._handleSubmit}>Submit</button>
      </div>
    `
  }

  override render() {
    return html`
      <div class="shell ${this.seamless ? 'shell--seamless' : ''}" role="region" aria-label=${this.title || 'Form'}>
        <header class="header">
          <h2 class="title">${this.title}</h2>
          ${this.description ? html`<p class="description">${this.description}</p>` : ''}
        </header>

        ${this._isMultiStep ? html`
          <div class="divider" aria-hidden="true"></div>
          ${this._renderStepIndicator()}
        ` : ''}

        <div class="divider" aria-hidden="true"></div>

        ${this._renderFields()}

        <div class="divider" aria-hidden="true"></div>

        ${this._renderActions()}
      </div>

      <span aria-live="polite" class="sr-only">
        ${this._isMultiStep ? `Step ${this._stage + 1} of ${this.stages.length}: ${this.stages[this._stage]}` : ''}
      </span>
    `
  }
}
