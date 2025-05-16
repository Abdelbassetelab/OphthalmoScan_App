'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = {
  general: [
    {
      question: 'What is OphthalmoScan-AI?',
      answer: 'OphthalmoScan-AI is an advanced platform for ophthalmology diagnosis and patient management using AI technologies.'
    },
    {
      question: 'How accurate is the AI analysis?',
      answer: 'Our AI models are trained on extensive datasets and regularly validated by medical professionals.'
    }
  ],
  account: [
    {
      question: 'How do I create an account?',
      answer: 'You can register through our sign-up page. Different account types are available for doctors and patients.'
    },
    {
      question: 'How can I reset my password?',
      answer: 'Use the "Forgot Password" link on the login page to receive password reset instructions.'
    }
  ],
  application: [
    {
      question: 'How do I upload a scan?',
      answer: 'Navigate to the Scans section and use the Upload button. Supported formats include JPEG and DICOM.'
    },
    {
      question: 'How long does scan analysis take?',
      answer: 'Most scans are analyzed within 2-3 minutes, depending on complexity and system load.'
    }
  ],
  support: [
    {
      question: 'How can I get technical support?',
      answer: 'Contact our support team through the Contact Support page or email support@ophthalmoscan.ai'
    },
    {
      question: 'What are the support hours?',
      answer: 'Our technical support team is available Monday to Friday, 9 AM to 5 PM EST.'
    }
  ]
};

export default function FaqAccordion() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold mb-4">General Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqCategories.general.map((faq, index) => (
            <AccordionItem key={index} value={`general-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Account & Access</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqCategories.account.map((faq, index) => (
            <AccordionItem key={index} value={`account-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Using the Application</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqCategories.application.map((faq, index) => (
            <AccordionItem key={index} value={`application-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Technical Support</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqCategories.support.map((faq, index) => (
            <AccordionItem key={index} value={`support-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
