// Types shared by newsletter/agentic email templates
export interface TemplateData {
  firstName?: string
  email?: string
  [key: string]: unknown
}

export interface RenderedTemplate {
  subject: string
  html: string
}
