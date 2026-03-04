import LegalPage from '../components/ui/LegalPage'

export default function DataProtection() {
  return (
    <LegalPage
      title="Data Protection"
      subtitle="Our commitment to GDPR compliance and the protection of your personal data."
      lastUpdated="March 2026"
      sections={[
        {
          heading: '1. Our Commitment',
          body: 'Hope Catalyst is committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR) and applicable data protection laws. This page outlines how we fulfil those obligations.',
        },
        {
          heading: '2. Legal Basis for Processing',
          body: 'We process your personal data on the following legal bases:\n\n• Contractual necessity — to process your scholarship request\n• Legitimate interests — to prevent fraud and maintain platform integrity\n• Consent — where you have explicitly agreed to specific processing activities\n\nYou may withdraw consent at any time without affecting the lawfulness of prior processing.',
        },
        {
          heading: '3. Data Controller',
          body: 'Hope Catalyst acts as the data controller for all personal information submitted through this platform. Contact: support@hopecatalyst.org',
        },
        {
          heading: '4. Data Transfers',
          body: 'Your data may be processed by our third-party service providers (including Supabase for database hosting) who are bound by data processing agreements and operate under appropriate safeguards. We do not transfer data to countries without adequate protection without appropriate contractual safeguards in place.',
        },
        {
          heading: '5. Security Measures',
          body: 'We implement appropriate technical and organisational measures to protect your data, including:\n\n• Encrypted data storage and transmission (TLS/SSL)\n• Role-based access controls — only authorised staff can access applications\n• Regular security reviews of our infrastructure',
        },
        {
          heading: '6. Your GDPR Rights',
          body: 'Under GDPR, you have the following rights:\n\n• Right of access — request a copy of your data\n• Right to rectification — correct inaccurate data\n• Right to erasure — request deletion ("right to be forgotten")\n• Right to restriction — limit how we process your data\n• Right to data portability — receive your data in a structured format\n• Right to object — object to processing based on legitimate interests\n\nTo exercise any right, contact us at support@hopecatalyst.org. We will respond within 30 days.',
        },
        {
          heading: '7. Complaints',
          body: 'If you believe your data protection rights have been violated, you have the right to lodge a complaint with your local supervisory authority. In Germany, this is the relevant state data protection authority (Landesbeauftragter für Datenschutz).',
        },
        {
          heading: '8. Contact',
          body: 'For all data protection enquiries: support@hopecatalyst.org',
        },
      ]}
    />
  )
}