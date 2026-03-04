import LegalPage from '../components/ui/LegalPage'

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="How Hope Catalyst collects, uses, and protects your personal information."
      lastUpdated="March 2026"
      sections={[
        {
          heading: '1. Who We Are',
          body: 'Hope Catalyst is a scholarship assistance platform that facilitates direct school fee payments for Nigerian students. We are operated by Hope Catalyst and can be reached at support@hopecatalyst.org.',
        },
        {
          heading: '2. What Information We Collect',
          body: 'We collect information you provide directly when submitting a scholarship request, including:\n\n• Full name and email address\n• School name, program, and fee amount\n• Supporting documents (admission letters, fee invoices)\n• Academic results (if requested during review)\n\nWe also collect basic usage data (page visits, session data) through our hosting provider to maintain and improve the platform.',
        },
        {
          heading: '3. How We Use Your Information',
          body: 'We use your information solely to:\n\n• Review and process your scholarship request\n• Communicate with your institution to verify payment details\n• Send status updates about your application\n• Maintain records of processed payments\n\nWe do not sell, rent, or share your personal data with third parties for marketing purposes.',
        },
        {
          heading: '4. Data Storage',
          body: 'Your data is stored securely using Supabase, a hosted database provider with industry-standard encryption. Documents you upload are stored in secure cloud storage with restricted access.',
        },
        {
          heading: '5. Data Retention',
          body: 'We retain your application data for up to 3 years after your request is resolved, for record-keeping and audit purposes. You may request deletion of your data at any time by contacting us at support@hopecatalyst.org.',
        },
        {
          heading: '6. Your Rights',
          body: 'You have the right to:\n\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your data\n• Withdraw consent at any time\n\nTo exercise any of these rights, contact us at support@hopecatalyst.org.',
        },
        {
          heading: '7. Contact',
          body: 'For any privacy-related questions or concerns, please contact us at support@hopecatalyst.org.',
        },
      ]}
    />
  )
}