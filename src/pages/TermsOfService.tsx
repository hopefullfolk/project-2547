import LegalPage from '../components/ui/LegalPage'

export default function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Please read these terms carefully before using the Hope Catalyst platform."
      lastUpdated="March 2026"
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: 'By submitting a request or creating an account on Hope Catalyst, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
        },
        {
          heading: '2. About the Service',
          body: 'Hope Catalyst is a scholarship assistance platform. We review applications from Nigerian students and, at our sole discretion, facilitate direct school fee payments to eligible institutions. We do not guarantee funding for any application.',
        },
        {
          heading: '3. Applicant Responsibilities',
          body: 'By submitting a request, you confirm that:\n\n• All information provided is accurate and truthful\n• Documents submitted are genuine and unaltered\n• You are the student named in the application\n• You will provide additional documentation if requested\n\nAny fraudulent or misleading submissions will result in permanent disqualification and may be reported to relevant authorities.',
        },
        {
          heading: '4. Our Discretion',
          body: 'Hope Catalyst reserves the right to approve, reject, or request additional information for any application without obligation to provide a reason. Approval in one period does not guarantee future assistance.',
        },
        {
          heading: '5. Payment Process',
          body: 'All approved payments are made directly to the educational institution. We do not make cash payments to students or third parties. Payment confirmation will be communicated via the platform.',
        },
        {
          heading: '6. Platform Availability',
          body: 'We aim to keep the platform available at all times but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the service at any time.',
        },
        {
          heading: '7. Limitation of Liability',
          body: 'Hope Catalyst is not liable for any indirect, incidental, or consequential damages arising from use of or inability to use the platform. Our total liability is limited to the amount directly involved in your application.',
        },
        {
          heading: '8. Changes to Terms',
          body: 'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised terms.',
        },
        {
          heading: '9. Contact',
          body: 'For questions about these terms, contact us at support@hopecatalyst.org.',
        },
      ]}
    />
  )
}