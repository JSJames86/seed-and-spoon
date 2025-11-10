/**
 * Translation dictionaries for English and Spanish
 *
 * Usage: translations[lang][key]
 */

export const translations = {
  en: {
    // Hero
    'hero.title': 'Get Help with Food',
    'hero.subtitle': 'Apply for assistance, refer a client, or find local pantries',
    'hero.btn.client': 'I need food assistance',
    'hero.btn.referral': "I'm referring someone",
    'hero.btn.provider': 'I provide food resources',
    'hero.link.browse': 'or browse food resources near you',

    // Client Form
    'client.title': 'Apply for Food Assistance',
    'client.subtitle': "Complete this form and we'll connect you with food resources that meet your needs. We'll contact you within 48 hours.",
    'client.success.title': 'Application Received!',
    'client.success.message': "Thank you! We've received your application and will contact you within 48 hours.",
    'client.success.next': "What's Next?",
    'client.success.find': 'Find Food Resources Near You',

    // Referral Form
    'referral.title': 'Refer a Client for Food Assistance',
    'referral.subtitle': 'Partner organizations can use this form to refer clients to our food assistance program.',
    'referral.success.title': 'Referral Received!',

    // Resource Map
    'resources.title': 'Find Food Resources Near You',
    'resources.subtitle': 'Search our directory of food pantries, meal sites, and community fridges across New Jersey.',

    // Provider CTA
    'provider.cta.title': 'Are You a Food Provider?',
    'provider.cta.subtitle': "If you provide food assistance and want to be listed in our directory, we'd love to hear from you.",
    'provider.cta.button': 'Request to Be Listed',

    // Privacy
    'privacy.title': 'Your Privacy Matters',
    'privacy.text': 'All information you provide is confidential and will only be used to connect you with food resources.',

    // Form Labels (Common)
    'form.name': 'Full Name',
    'form.phone': 'Phone Number',
    'form.email': 'Email',
    'form.zip': 'ZIP Code',
    'form.submit': 'Submit',
    'form.cancel': 'Cancel',
    'form.required': 'required',

    // Validation Messages
    'validation.required': 'This field is required',
    'validation.email': 'Invalid email address',
    'validation.phone': 'Invalid phone number',
    'validation.zip': 'ZIP code must be 5 digits',
  },

  es: {
    // Hero
    'hero.title': 'Obtenga Ayuda con Alimentos',
    'hero.subtitle': 'Solicite asistencia, refiera a un cliente o encuentre despensas locales',
    'hero.btn.client': 'Necesito asistencia alimentaria',
    'hero.btn.referral': 'Estoy refiriendo a alguien',
    'hero.btn.provider': 'Proporciono recursos alimentarios',
    'hero.link.browse': 'o explore recursos alimentarios cerca de usted',

    // Client Form
    'client.title': 'Solicitar Asistencia Alimentaria',
    'client.subtitle': 'Complete este formulario y lo conectaremos con recursos alimentarios que satisfagan sus necesidades. Nos comunicaremos con usted dentro de 48 horas.',
    'client.success.title': '¡Solicitud Recibida!',
    'client.success.message': '¡Gracias! Hemos recibido su solicitud y nos comunicaremos con usted dentro de 48 horas.',
    'client.success.next': '¿Qué Sigue?',
    'client.success.find': 'Encuentre Recursos Alimentarios Cerca de Usted',

    // Referral Form
    'referral.title': 'Referir un Cliente para Asistencia Alimentaria',
    'referral.subtitle': 'Las organizaciones asociadas pueden usar este formulario para referir clientes a nuestro programa de asistencia alimentaria.',
    'referral.success.title': '¡Referencia Recibida!',

    // Resource Map
    'resources.title': 'Encuentre Recursos Alimentarios Cerca de Usted',
    'resources.subtitle': 'Busque en nuestro directorio de despensas de alimentos, sitios de comidas y refrigeradores comunitarios en Nueva Jersey.',

    // Provider CTA
    'provider.cta.title': '¿Es Usted un Proveedor de Alimentos?',
    'provider.cta.subtitle': 'Si proporciona asistencia alimentaria y desea ser incluido en nuestro directorio, nos encantaría saber de usted.',
    'provider.cta.button': 'Solicitar Ser Incluido',

    // Privacy
    'privacy.title': 'Su Privacidad es Importante',
    'privacy.text': 'Toda la información que proporcione es confidencial y solo se utilizará para conectarlo con recursos alimentarios.',

    // Form Labels (Common)
    'form.name': 'Nombre Completo',
    'form.phone': 'Número de Teléfono',
    'form.email': 'Correo Electrónico',
    'form.zip': 'Código Postal',
    'form.submit': 'Enviar',
    'form.cancel': 'Cancelar',
    'form.required': 'requerido',

    // Validation Messages
    'validation.required': 'Este campo es obligatorio',
    'validation.email': 'Dirección de correo electrónico inválida',
    'validation.phone': 'Número de teléfono inválido',
    'validation.zip': 'El código postal debe tener 5 dígitos',
  },
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

export const DEFAULT_LANGUAGE = 'en';
